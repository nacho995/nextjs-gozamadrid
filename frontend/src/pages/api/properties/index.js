import axios from 'axios';
import { NextResponse } from 'next/server';

// Constantes y configuración base
const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com';
const MONGODB_URL = process.env.MONGODB_URL || '//api.realestategozamadrid.com';
const WOOCOMMERCE_URL = process.env.NEXT_PUBLIC_WORDPRESS_URL || 'https://wordpress.realestategozamadrid.com';
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
    // Obtener propiedades de WooCommerce usando la API interna
    console.log('Intentando obtener propiedades de WooCommerce vía API interna...');
    
    const woocommerceResponse = await axios.get('/api/properties/sources/woocommerce', {
      ...axiosConfig,
      baseURL: req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000'
    });

    if (woocommerceResponse.data && Array.isArray(woocommerceResponse.data)) {
      console.log(`Obtenidas ${woocommerceResponse.data.length} propiedades de WooCommerce vía API interna`);
      allProperties = [...allProperties, ...woocommerceResponse.data];
    }
  } catch (error) {
    console.error('Error obteniendo propiedades de WooCommerce vía API interna:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    errors.push({
      source: 'woocommerce',
      message: error.message,
      details: error.response?.data || null
    });
  }

  try {
    // Obtener propiedades de MongoDB usando la API interna
    console.log('Intentando obtener propiedades de MongoDB vía API interna...');
    
    const mongodbResponse = await axios.get('/api/properties/sources/mongodb', {
      ...axiosConfig,
      baseURL: req.headers.host ? `http://${req.headers.host}` : 'http://localhost:3000'
    });

    if (mongodbResponse.data && Array.isArray(mongodbResponse.data)) {
      console.log(`Obtenidas ${mongodbResponse.data.length} propiedades de MongoDB vía API interna`);
      allProperties = [...allProperties, ...mongodbResponse.data];
    }
  } catch (error) {
    console.error('Error obteniendo propiedades de MongoDB vía API interna:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data
    });
    errors.push({
      source: 'mongodb',
      message: error.message,
      details: error.response?.data || null
    });
  }

  // Si no hay propiedades y hay errores, devolver array vacío (para compatibilidad)
  if (allProperties.length === 0 && errors.length > 0) {
    console.warn('No se pudieron obtener propiedades de ninguna fuente:', errors);
    return res.status(200).json([]);
  }

  // Si no hay propiedades pero tampoco hay errores, devolver array vacío
  if (allProperties.length === 0) {
    return res.status(200).json([]);
  }

  // Ordenar propiedades por fecha de creación si tienen esa información
  allProperties.sort((a, b) => {
    const dateA = new Date(a.createdAt || a.date_created || 0);
    const dateB = new Date(b.createdAt || b.date_created || 0);
    return dateB - dateA;
  });

  // Calcular paginación
  const startIndex = (pageNumber - 1) * limitNumber;
  const endIndex = startIndex + limitNumber;
  const paginatedProperties = allProperties.slice(startIndex, endIndex);

  // Devolver directamente el array de propiedades (como antes)
  console.log(`Devolviendo ${paginatedProperties.length} propiedades de un total de ${allProperties.length}`);
  return res.status(200).json(paginatedProperties);
} 