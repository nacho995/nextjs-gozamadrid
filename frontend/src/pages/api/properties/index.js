import axios from 'axios';

// Importar la función bulletproof de WooCommerce directamente
import { loadFromWooCommerce as loadWooCommerceBulletproof } from './sources/woocommerce/index.js';
import { loadRealProperties } from './sources/woocommerce/index.js';

// 🏠 CONFIGURACIÓN SOLO PARA PROPIEDADES REALES
const REAL_ESTATE_CONFIG = {
  mongodb: {
    timeout: 8000,
    maxRetries: 3
  },
  woocommerce: {
    timeout: 30000,
    maxRetries: 5
  }
};

// 🔄 Cache solo para datos reales
const realEstateCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

const getCachedData = (key) => {
  const cached = realEstateCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data;
  }
  realEstateCache.delete(key);
  return null;
};

const setCachedData = (key, data) => {
  realEstateCache.set(key, { data, timestamp: Date.now() });
};

// Transformadores optimizados
const transformWooCommerceProperty = (property) => {
  try {
    const metadata = {};
    if (property.meta_data?.length) {
      property.meta_data.forEach(meta => {
        if (!meta.key.startsWith('_')) {
          metadata[meta.key] = meta.value;
        }
      });
    }

    let price = parseFloat(String(property.price).replace(/[^\d.-]/g, '')) || 0;
    if (price < 10000 && price > 0) price *= 1000;

    const bedrooms = parseInt(metadata.bedrooms) || 0;
    const bathrooms = parseInt(metadata.baños || metadata.bathrooms || metadata.banos) || 0;
    const area = parseInt(metadata.living_area || metadata.area || metadata.m2) || 0;

    return {
      id: String(property.id),
      title: property.name || '',
      description: property.description || property.short_description || '',
      price,
      source: 'woocommerce',
      images: property.images?.map(img => ({
        url: img.src,
        alt: img.alt || property.name || 'Imagen de propiedad'
      })) || [],
      features: { bedrooms, bathrooms, area, floor: metadata.Planta || null },
      location: property.name || metadata.address || '',
      metadata,
      createdAt: property.date_created || new Date().toISOString(),
      updatedAt: property.date_modified || new Date().toISOString()
    };
  } catch (error) {
    console.error('Error transformando WooCommerce:', error.message);
    return null;
  }
};

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
    console.error('Error transformando MongoDB:', error.message);
    return null;
  }
};

// Función de retry con backoff exponencial
const withRetry = async (fn, maxRetries = 2, baseDelay = 1000) => {
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxRetries) throw error;
      const delay = baseDelay * Math.pow(2, attempt);
      await new Promise(resolve => setTimeout(resolve, delay));
      console.log(`Reintentando... Intento ${attempt + 2}/${maxRetries + 1}`);
    }
  }
};

// 🚀 Cargar propiedades reales de MongoDB
const loadMongoDBProperties = async (limit = 20) => {
  console.log(`🍃 Cargando propiedades REALES de MongoDB (límite: ${limit})`);
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'}/api/properties/sources/mongodb`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      timeout: REAL_ESTATE_CONFIG.mongodb.timeout
    });

    if (!response.ok) {
      throw new Error(`MongoDB API error: ${response.status}`);
    }

    const data = await response.json();
    const properties = Array.isArray(data) ? data : [];
    
    console.log(`✅ MongoDB: ${properties.length} propiedades reales cargadas`);
    return properties.slice(0, limit);
    
  } catch (error) {
    console.error(`❌ Error cargando MongoDB:`, error.message);
    return []; // Devolver array vacío, NO fallbacks
  }
};

// 🛒 Cargar propiedades reales de WooCommerce
const loadWooCommerceProperties = async (limit = 20) => {
  console.log(`🛒 Cargando propiedades REALES de WooCommerce (límite: ${limit})`);
  
  try {
    const properties = await loadRealProperties(1, limit);
    console.log(`✅ WooCommerce: ${properties.length} propiedades reales cargadas`);
    return properties;
    
  } catch (error) {
    console.error(`❌ Error cargando WooCommerce:`, error.message);
    return []; // Devolver array vacío, NO fallbacks
  }
};

// 🔧 Eliminar duplicados por ID
const removeDuplicates = (properties) => {
  const seen = new Set();
  return properties.filter(property => {
    if (seen.has(property.id)) {
      return false;
    }
    seen.add(property.id);
    return true;
  });
};

// 🎯 HANDLER PRINCIPAL - SOLO PROPIEDADES REALES
export default async function handler(req, res) {
  const startTime = Date.now();
  const { limit = 40 } = req.query;
  const requestedLimit = parseInt(limit);

  console.log(`🏠 API COMBINADA PROPIEDADES REALES iniciada (límite: ${requestedLimit})`);

  // Headers optimizados
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60'); // 5min cache
  res.setHeader('Content-Type', 'application/json');

  // Verificar cache
  const cacheKey = `combined_real_${requestedLimit}`;
  const cached = getCachedData(cacheKey);
  if (cached) {
    const duration = Date.now() - startTime;
    console.log(`🚀 Cache hit: ${cached.length} propiedades reales en ${duration}ms`);
    return res.status(200).json(cached);
  }

  try {
    // Cargar en paralelo SOLO propiedades reales
    const [mongoProperties, wooProperties] = await Promise.allSettled([
      loadMongoDBProperties(Math.ceil(requestedLimit / 2)),
      loadWooCommerceProperties(Math.ceil(requestedLimit / 2))
    ]);

    // Procesar resultados
    const mongoData = mongoProperties.status === 'fulfilled' ? mongoProperties.value : [];
    const wooData = wooProperties.status === 'fulfilled' ? wooProperties.value : [];

    // Combinar y eliminar duplicados
    const allProperties = [...mongoData, ...wooData];
    const uniqueProperties = removeDuplicates(allProperties);
    
    // Limitar al número solicitado
    const finalProperties = uniqueProperties.slice(0, requestedLimit);

    const duration = Date.now() - startTime;
    
    // Solo devolver si tenemos propiedades reales
    if (finalProperties.length > 0) {
      setCachedData(cacheKey, finalProperties);
      
      console.log(`🎉 ÉXITO: ${finalProperties.length} propiedades REALES combinadas en ${duration}ms`);
      console.log(`📊 Distribución: MongoDB=${mongoData.length}, WooCommerce=${wooData.length}`);
      
      return res.status(200).json(finalProperties);
    } else {
      // NO hay propiedades reales disponibles
      console.error(`💥 ERROR: No hay propiedades reales disponibles después de ${duration}ms`);
      
      return res.status(503).json({
        error: 'Propiedades no disponibles',
        message: 'No hay propiedades reales disponibles en este momento. Inténtelo de nuevo en unos minutos.',
        sources: {
          mongodb: mongoProperties.status === 'fulfilled' ? 'OK' : 'ERROR',
          woocommerce: wooProperties.status === 'fulfilled' ? 'OK' : 'ERROR'
        },
        timestamp: new Date().toISOString(),
        duration: `${duration}ms`
      });
    }
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 ERROR CRÍTICO después de ${duration}ms:`, error.message);
    
    return res.status(500).json({
      error: 'Error del servidor',
      message: 'Error interno al cargar propiedades reales.',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    });
  }
} 