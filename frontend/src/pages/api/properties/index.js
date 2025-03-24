import axios from 'axios';
import { NextResponse } from 'next/server';

// Constantes y configuración base
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com';
const MONGODB_URL = process.env.MONGODB_URL || '//api.realestategozamadrid.com';
const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com';
const CONSUMER_KEY = process.env.WC_CONSUMER_KEY || process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY;
const CONSUMER_SECRET = process.env.WC_CONSUMER_SECRET || process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;

// Configuración común para axios
const axiosConfig = {
  timeout: 30000,
  headers: {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
    'Origin': BASE_URL
  },
  validateStatus: function (status) {
    return status >= 200 && status < 500;
  }
};

// Función para transformar propiedades de WooCommerce
const transformWooCommerceProperty = (property) => {
  try {
    // Extraer metadatos
    const metadata = {};
    if (property.meta_data && Array.isArray(property.meta_data)) {
      property.meta_data.forEach(meta => {
        if (!meta.key.startsWith('_')) {
          metadata[meta.key] = meta.value;
        }
      });
    }

    // Procesar el precio
    let price = property.price;
    if (typeof price === 'string') {
      price = parseFloat(price.replace(/[^\d.-]/g, ''));
    }
    if (price < 10000) {
      price *= 1000; // Convertir precios en miles a su valor real
    }

    // Extraer nombre de calle
    let location = '';
    // Primero intentar obtener del nombre de la propiedad si parece una dirección
    if (property.name && (
        property.name.includes("Calle") || 
        property.name.includes("Avenida") || 
        property.name.includes("Plaza") || 
        /^(Calle|C\/|Avda\.|Av\.|Pza\.|Plaza)\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\d*/.test(property.name)
    )) {
      location = property.name;
    } 
    // Luego buscar en los metadatos
    else if (metadata.address) {
      if (typeof metadata.address === 'string') {
        location = metadata.address;
      } else if (typeof metadata.address === 'object') {
        location = metadata.address.address || metadata.address.name || '';
      }
    }

    // Extraer características principales
    const bedrooms = parseInt(metadata.bedrooms) || 0;
    const bathrooms = parseInt(metadata.baños) || parseInt(metadata.bathrooms) || parseInt(metadata.banos) || 0;
    const area = parseInt(metadata.living_area) || parseInt(metadata.area) || parseInt(metadata.m2) || 0;
    const floor = metadata.Planta || null;

    console.log(`[WooCommerce Transform] Propiedad ${property.id} - Habitaciones: ${bedrooms}, Baños: ${bathrooms}, Área: ${area}m², Ubicación: ${location}`);

    const transformed = {
      id: property.id.toString(),
      title: property.name || '',
      description: property.description || property.short_description || '',
      price,
      source: 'woocommerce',
      images: property.images?.map(img => ({
        url: img.src,
        alt: img.alt || property.name || 'Imagen de propiedad'
      })) || [],
      features: {
        bedrooms: bedrooms,
        bathrooms: bathrooms,
        area: area,
        floor: floor
      },
      location: location,
      metadata,
      createdAt: property.date_created || new Date().toISOString(),
      updatedAt: property.date_modified || new Date().toISOString()
    };

    return transformed;
  } catch (error) {
    console.error('Error transformando propiedad de WooCommerce:', error);
    return null;
  }
};

// Función para transformar propiedades de MongoDB
const transformMongoDBProperty = (property) => {
  try {
    return {
      id: property._id,
      title: property.title || '',
      description: property.description || '',
      price: typeof property.price === 'string' ? parseFloat(property.price.replace(/[^\d.-]/g, '')) : property.price,
      source: 'mongodb',
      images: Array.isArray(property.images) ? property.images.map(img => ({
        url: img,
        alt: property.title || 'Imagen de propiedad'
      })) : [],
      features: {
        bedrooms: parseInt(property.bedrooms) || 0,
        bathrooms: parseInt(property.bathrooms) || 0,
        area: parseInt(property.area) || 0,
        floor: property.floor || null
      },
      location: property.location || property.address || '',
      metadata: property.metadata || {},
      createdAt: property.createdAt || new Date().toISOString(),
      updatedAt: property.updatedAt || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error transformando propiedad de MongoDB:', error);
    return null;
  }
};

export default async function handler(req, res) {
  console.log('API Handler iniciado:', {
    method: req.method,
    url: req.url,
    query: req.query,
    headers: req.headers
  });

  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Manejar peticiones OPTIONS y HEAD
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    console.log('Respondiendo a petición OPTIONS/HEAD');
    res.setHeader('Content-Length', '0');
    res.status(200).end();
    return;
  }

  if (req.method !== 'GET') {
    console.log('Método no permitido:', req.method);
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar si es una petición de verificación
  const isVerificationRequest = req.url.includes('/sources/');
  if (isVerificationRequest) {
    console.log('Respondiendo a petición de verificación');
    return res.status(200).json({ status: 'available' });
  }

  const { page = 1, limit = 12 } = req.query;
  const pageNumber = parseInt(page);
  const limitNumber = parseInt(limit);
  
  console.log('Iniciando obtención de propiedades:', { page: pageNumber, limit: limitNumber });
  
  let allProperties = [];
  let errors = [];

  try {
    // Obtener propiedades de WooCommerce directamente
    console.log('Intentando obtener propiedades de WooCommerce...', {
      url: WOOCOMMERCE_URL,
      hasKey: !!CONSUMER_KEY,
      hasSecret: !!CONSUMER_SECRET
    });
    
    const woocommerceUrl = `${WOOCOMMERCE_URL}/wp-json/wc/v3/products`;
    const woocommerceResponse = await axios.get(woocommerceUrl, {
      ...axiosConfig,
      params: {
        consumer_key: CONSUMER_KEY,
        consumer_secret: CONSUMER_SECRET,
        per_page: 100,
        status: 'publish'
      }
    });

    if (woocommerceResponse.data) {
      const transformedWooCommerceProperties = woocommerceResponse.data
        .map(transformWooCommerceProperty)
        .filter(Boolean);
      console.log(`Obtenidas ${transformedWooCommerceProperties.length} propiedades de WooCommerce`);
      allProperties = [...allProperties, ...transformedWooCommerceProperties];
    }
  } catch (error) {
    console.error('Error obteniendo propiedades de WooCommerce:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });
    errors.push({
      source: 'woocommerce',
      message: error.message,
      details: error.response?.data || null
    });
  }

  try {
    // Obtener propiedades de MongoDB
    console.log('Intentando obtener propiedades de MongoDB...', { url: MONGODB_URL });
    const mongodbUrl = `${MONGODB_URL}/api/properties`;
    const mongodbResponse = await axios.get(mongodbUrl, {
      ...axiosConfig,
      headers: {
        ...axiosConfig.headers,
        'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com'
      }
    });

    if (mongodbResponse.data) {
      const transformedMongoDBProperties = mongodbResponse.data
        .map(transformMongoDBProperty)
        .filter(Boolean);
      console.log(`Obtenidas ${transformedMongoDBProperties.length} propiedades de MongoDB`);
      allProperties = [...allProperties, ...transformedMongoDBProperties];
    }
  } catch (error) {
    console.error('Error obteniendo propiedades de MongoDB:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        method: error.config?.method,
        timeout: error.config?.timeout
      }
    });
    errors.push({
      source: 'mongodb',
      message: error.message,
      details: error.response?.data || null
    });
  }

  // Si no hay propiedades y hay errores, devolver error
  if (allProperties.length === 0 && errors.length > 0) {
    return res.status(503).json({
      error: 'No se pudieron obtener propiedades',
      details: 'Error al obtener propiedades de todas las fuentes',
      sources_checked: ['woocommerce', 'mongodb'],
      errors
    });
  }

  // Si no hay propiedades pero tampoco hay errores, devolver array vacío
  if (allProperties.length === 0) {
    return res.status(200).json([]);
  }

  // Ordenar propiedades por fecha de creación
  allProperties.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  // Calcular paginación
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;
  const paginatedProperties = allProperties.slice(startIndex, endIndex);

  // Devolver respuesta completa
  return res.status(200).json({
    properties: paginatedProperties,
    total: allProperties.length,
    page: pageNumber,
    limit: limitNumber,
    totalPages: Math.ceil(allProperties.length / limitNumber),
    errors: errors.length > 0 ? errors : undefined
  });
} 