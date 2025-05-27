import axios from 'axios';

// Cache en memoria para optimizar rendimiento
const cache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos

// Configuración optimizada para carga masiva
const CONFIG = {
  woocommerce: {
    batchSize: 20,
    timeout: 8000,
    maxRetries: 2
  },
  mongodb: {
    batchSize: 30,
    timeout: 5000,
    maxRetries: 2
  },
  cache: {
    ttl: CACHE_TTL,
    maxSize: 1000
  }
};

// Función de cache inteligente
const getCacheKey = (source, page, limit) => `${source}_${page}_${limit}`;

const getFromCache = (key) => {
  const cached = cache.get(key);
  if (cached && Date.now() - cached.timestamp < CONFIG.cache.ttl) {
    return cached.data;
  }
  cache.delete(key);
  return null;
};

const setCache = (key, data) => {
  // Limpiar cache si está lleno
  if (cache.size >= CONFIG.cache.maxSize) {
    const oldestKey = cache.keys().next().value;
    cache.delete(oldestKey);
  }
  cache.set(key, { data, timestamp: Date.now() });
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

// Cargador optimizado de WooCommerce
const loadWooCommerceProperties = async (page = 1, limit = 20) => {
  const cacheKey = getCacheKey('woocommerce', page, limit);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`🚀 WooCommerce cache hit: ${cached.length} propiedades`);
    return cached;
  }

  return withRetry(async () => {
    const WC_API_URL = process.env.WC_API_URL || process.env.NEXT_PUBLIC_WC_API_URL;
    const WC_KEY = process.env.WC_CONSUMER_KEY;
    const WC_SECRET = process.env.WC_CONSUMER_SECRET;

    if (!WC_API_URL || !WC_KEY || !WC_SECRET) {
      console.log('⚠️ WooCommerce: Credenciales no disponibles');
      return [];
    }

    console.log(`🔄 WooCommerce: Cargando página ${page}, límite ${limit}`);
    
    const response = await axios.get(`${WC_API_URL}/products`, {
      params: {
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
        per_page: Math.min(limit, CONFIG.woocommerce.batchSize),
        page
      },
      timeout: CONFIG.woocommerce.timeout,
      headers: {
        'User-Agent': 'Goza Madrid Real Estate/2.0',
        'Accept': 'application/json'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Respuesta inválida de WooCommerce');
    }

    const transformed = response.data
      .map(transformWooCommerceProperty)
      .filter(Boolean);

    setCache(cacheKey, transformed);
    console.log(`✅ WooCommerce: ${transformed.length} propiedades cargadas`);
    return transformed;
  }, CONFIG.woocommerce.maxRetries);
};

// Cargador optimizado de MongoDB
const loadMongoDBProperties = async (page = 1, limit = 30) => {
  const cacheKey = getCacheKey('mongodb', page, limit);
  const cached = getFromCache(cacheKey);
  if (cached) {
    console.log(`🚀 MongoDB cache hit: ${cached.length} propiedades`);
    return cached;
  }

  return withRetry(async () => {
    const MONGODB_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 
                            process.env.NEXT_PUBLIC_BACKEND_URL || 
                            'http://api.realestategozamadrid.com';

    console.log(`🔄 MongoDB: Cargando página ${page}, límite ${limit}`);

    const response = await axios.get(`${MONGODB_BASE_URL}/api/properties`, {
      params: {
        limit: Math.min(limit, CONFIG.mongodb.batchSize),
        page
      },
      timeout: CONFIG.mongodb.timeout,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    if (!response.data || !Array.isArray(response.data)) {
      throw new Error('Respuesta inválida de MongoDB');
    }

    const transformed = response.data
      .map(transformMongoDBProperty)
      .filter(Boolean);

    setCache(cacheKey, transformed);
    console.log(`✅ MongoDB: ${transformed.length} propiedades cargadas`);
    return transformed;
  }, CONFIG.mongodb.maxRetries);
};

// Cargador paralelo con circuit breaker
const loadPropertiesParallel = async (page = 1, limit = 12) => {
  const startTime = Date.now();
  console.log(`🚀 Iniciando carga paralela - Página: ${page}, Límite: ${limit}`);

  // Calcular límites por fuente para optimizar
  const wooLimit = Math.ceil(limit * 0.6); // 60% WooCommerce
  const mongoLimit = Math.ceil(limit * 0.4); // 40% MongoDB

  const promises = [
    loadWooCommerceProperties(page, wooLimit).catch(error => {
      console.error('❌ WooCommerce falló:', error.message);
      return [];
    }),
    loadMongoDBProperties(page, mongoLimit).catch(error => {
      console.error('❌ MongoDB falló:', error.message);
      return [];
    })
  ];

  // Timeout de seguridad para toda la operación
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Timeout general')), 20000)
  );

  try {
    const results = await Promise.race([
      Promise.allSettled(promises),
      timeoutPromise
    ]);

    const allProperties = [];
    results.forEach((result, index) => {
      const source = index === 0 ? 'WooCommerce' : 'MongoDB';
      if (result.status === 'fulfilled' && Array.isArray(result.value)) {
        allProperties.push(...result.value);
        console.log(`✅ ${source}: ${result.value.length} propiedades`);
      } else {
        console.log(`⚠️ ${source}: ${result.reason?.message || 'Error'}`);
      }
    });

    // Ordenar por fecha de creación (más recientes primero)
    allProperties.sort((a, b) => {
      const dateA = new Date(a.createdAt || a.date_created || 0);
      const dateB = new Date(b.createdAt || b.date_created || 0);
      return dateB - dateA;
    });

    const duration = Date.now() - startTime;
    console.log(`🎯 Carga completada: ${allProperties.length} propiedades en ${duration}ms`);

    return allProperties;
  } catch (error) {
    console.error('💥 Error en carga paralela:', error.message);
    return [];
  }
};

export default async function handler(req, res) {
  const startTime = Date.now();
  
  // Headers de optimización
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
  res.setHeader('Content-Type', 'application/json');

  // Manejar preflight
  if (req.method === 'OPTIONS' || req.method === 'HEAD') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Parsear parámetros con valores por defecto optimizados
  const { 
    page = 1, 
    limit = 50, // Aumentado para mejor UX
    source = 'all',
    cache: useCache = 'true'
  } = req.query;

  const pageNumber = Math.max(1, parseInt(page));
  const limitNumber = Math.min(100, Math.max(1, parseInt(limit))); // Máximo 100
  const shouldUseCache = useCache !== 'false';

  console.log(`📊 API Request: página=${pageNumber}, límite=${limitNumber}, fuente=${source}, cache=${shouldUseCache}`);

  try {
    let properties = [];

    if (source === 'woocommerce') {
      properties = await loadWooCommerceProperties(pageNumber, limitNumber);
    } else if (source === 'mongodb') {
      properties = await loadMongoDBProperties(pageNumber, limitNumber);
    } else {
      // Carga paralela optimizada (por defecto)
      properties = await loadPropertiesParallel(pageNumber, limitNumber);
    }

    // Aplicar paginación final si es necesario
    const startIndex = (pageNumber - 1) * limitNumber;
    const paginatedProperties = properties.slice(startIndex, startIndex + limitNumber);

    const duration = Date.now() - startTime;
    const response = {
      data: paginatedProperties,
      meta: {
        page: pageNumber,
        limit: limitNumber,
        total: paginatedProperties.length,
        sources: {
          woocommerce: paginatedProperties.filter(p => p.source === 'woocommerce').length,
          mongodb: paginatedProperties.filter(p => p.source === 'mongodb').length
        },
        performance: {
          duration: `${duration}ms`,
          cached: shouldUseCache,
          timestamp: new Date().toISOString()
        }
      }
    };

    console.log(`🎉 Respuesta enviada: ${paginatedProperties.length} propiedades en ${duration}ms`);
    
    // Para compatibilidad con el frontend existente, devolver solo el array
    return res.status(200).json(paginatedProperties);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 Error general (${duration}ms):`, error.message);
    
    // Devolver array vacío para mantener compatibilidad
    return res.status(200).json([]);
  }
} 