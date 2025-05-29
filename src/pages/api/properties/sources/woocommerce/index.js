import axios from 'axios';
import { kv } from '@vercel/kv';

// 🏠 CONFIGURACIÓN SIMPLIFICADA PARA EVITAR TIMEOUTS
const REAL_ESTATE_CONFIG = {
  endpoints: [
    process.env.WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3'
  ],
  credentials: {
    key: process.env.WC_CONSUMER_KEY,
    secret: process.env.WC_CONSUMER_SECRET
  },
  connection: {
    timeout: 8000, // 8 segundos - aumentado para WooCommerce
    maxRetries: 1, // Solo 1 intento
    retryDelay: 500 // Delay mínimo
  }
};

// 🔄 Configuración del Caché de Vercel KV
const KV_CACHE_TTL_SECONDS = 1800; // 30 minutos

// Función para obtener datos del caché de Vercel KV
async function getPropertiesFromKVCache(key) {
  try {
    const cachedData = await kv.get(key);
    if (cachedData) {
      console.log(`🚀 Vercel KV Cache HIT para la clave: ${key}`);
      return cachedData;
    }
  } catch (error) {
    console.error(`❌ Error leyendo de Vercel KV para ${key}:`, error.message);
  }
  console.log(`💨 Vercel KV Cache MISS para la clave: ${key}`);
  return null;
}

// Función para guardar datos en el caché de Vercel KV
async function savePropertiesToKVCache(key, data) {
  try {
    await kv.set(key, data, { ex: KV_CACHE_TTL_SECONDS });
    console.log(`✅ Datos cacheados en Vercel KV para la clave: ${key} con TTL: ${KV_CACHE_TTL_SECONDS}s`);
  } catch (error) {
    console.error(`❌ Error escribiendo en Vercel KV para ${key}:`, error.message);
  }
}

// 🔧 Transformador ultra-simplificado
const transformRealProperty = (property) => {
  try {
    console.log(`🔧 Transformando propiedad ID: ${property.id}, Name: ${property.name}`);
    
    const transformed = {
      id: String(property.id),
      title: property.name || `Propiedad ${property.id}`,
      description: property.short_description || '',
      price: parseFloat(String(property.price).replace(/[^\d.-]/g, '')) || 0,
      source: 'woocommerce',
      images: property.images?.slice(0, 1).map(img => ({
        url: img.url || img.src,
        alt: property.name || 'Imagen'
      })) || [],
      features: { 
        bedrooms: 2, 
        bathrooms: 1, 
        area: 80 
      },
      location: property.name || 'Madrid',
      address: property.name || '',
      createdAt: property.date_created || new Date().toISOString()
    };
    
    console.log(`✅ Propiedad transformada: ${transformed.title}`);
    return transformed;
  } catch (error) {
    console.error('❌ Error transformando:', error.message);
    return null;
  }
};

// 🚀 Función que SOLO usa caché (no llama a WooCommerce directamente)
export const loadRealProperties = async (page = 1, limit = 5) => {
  const cacheKey = `woo_props_page_${page}_limit_${limit}`;
  
  console.log(`🏠 Cargando propiedades SOLO desde caché - Página: ${page}, Límite: ${limit}`);
  
  // 1. Intentar caché específico
  let cachedProperties = await getPropertiesFromKVCache(cacheKey);
  if (cachedProperties) {
    console.log(`✅ Cache HIT específico: ${cachedProperties.length} propiedades`);
    return cachedProperties;
  }

  // 2. Intentar caché general y filtrar
  const allProperties = await getPropertiesFromKVCache('woo_props_all');
  if (allProperties && Array.isArray(allProperties)) {
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const filteredProperties = allProperties.slice(startIndex, endIndex);
    
    console.log(`✅ Cache HIT general: ${filteredProperties.length} propiedades (de ${allProperties.length} totales)`);
    
    // Guardar en caché específico para próximas veces
    if (filteredProperties.length > 0) {
      savePropertiesToKVCache(cacheKey, filteredProperties).catch(err => 
        console.error('⚠️ Error guardando caché específico:', err.message)
      );
    }
    
    return filteredProperties;
  }

  // 3. Si no hay caché, devolver array vacío (el cron job llenará el caché)
  console.log(`💨 Sin datos en caché. El cron job precargará los datos pronto.`);
  return [];
};

// 🎯 HANDLER CON VERCEL KV
export default async function handler(req, res) {
  const startTime = Date.now();
  const { limit = 5, page = 1 } = req.query;

  console.log(`🏠 API Handler con Vercel KV iniciada - Página: ${page}, Límite: ${limit}`);
  
  // Verificar credenciales
  if (!REAL_ESTATE_CONFIG.credentials.key || !REAL_ESTATE_CONFIG.credentials.secret) {
    console.warn('⚠️ Sin credenciales WooCommerce');
    res.setHeader('X-WooCommerce-Status', 'no-credentials');
    return res.status(200).json([]);
  }
  
  // Verificar KV
  const hasKV = !!(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
  console.log(`🔑 Vercel KV disponible: ${hasKV}`);
  
  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300');
  res.setHeader('Content-Type', 'application/json');

  try {
    const realProperties = await loadRealProperties(parseInt(page), parseInt(limit));
    const duration = Date.now() - startTime;
    
    console.log(`🎉 ÉXITO: ${realProperties.length} propiedades en ${duration}ms`);
    res.setHeader('X-WooCommerce-Status', 'success');
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Cache-Type', 'vercel-kv');
    return res.status(200).json(realProperties);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 ERROR: ${error.message} en ${duration}ms`);
    
    res.setHeader('X-WooCommerce-Status', 'error');
    res.setHeader('X-Response-Time', `${duration}ms`);
    return res.status(200).json([]);
  }
}