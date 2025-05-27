import axios from 'axios';
import { kv } from '@vercel/kv'; // Importar Vercel KV

// 🏠 CONFIGURACIÓN SOLO PARA PROPIEDADES REALES - SIN FALLBACKS
const REAL_ESTATE_CONFIG = {
  // Usar la URL de la variable de entorno
  endpoints: [
    process.env.WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3'
  ],
  
  // Credenciales reales - Usar las variables de entorno correctas
  credentials: {
    key: process.env.WC_CONSUMER_KEY,
    secret: process.env.WC_CONSUMER_SECRET
  },
  
  // Configuración agresiva para superar bloqueos
  connection: {
    timeout: 8000, // 8 segundos 
    maxRetries: 3, // Mantener 3 reintentos para el único endpoint/estrategia
    retryDelay: 1500 
  }
};

// 🔄 Configuración del Caché de Vercel KV
const KV_CACHE_TTL_SECONDS = 1800; // 30 minutos

// Nueva función para obtener datos del caché de Vercel KV
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

// Nueva función para guardar datos en el caché de Vercel KV
async function savePropertiesToKVCache(key, data) {
  try {
    await kv.set(key, data, { ex: KV_CACHE_TTL_SECONDS });
    console.log(`✅ Datos cacheados en Vercel KV para la clave: ${key} con TTL: ${KV_CACHE_TTL_SECONDS}s`);
  } catch (error) {
    console.error(`❌ Error escribiendo en Vercel KV para ${key}:`, error.message);
  }
}

// 🔧 Transformador para propiedades reales
const transformRealProperty = (property) => {
  try {
    // Extraer metadatos de meta_data si existen
    const metadata = {};
    if (property.meta_data?.length) {
      property.meta_data.forEach(meta => {
        if (!meta.key.startsWith('_')) {
          metadata[meta.key] = meta.value;
        }
      });
    }

    // Extraer información de la descripción HTML
    const description = property.description || '';
    let bedrooms = 0;
    let bathrooms = 0;
    let area = 0;
    let floor = null;

    // Buscar habitaciones en la descripción
    const bedroomMatch = description.match(/(\d+)\s*(?:habitacion|dormitorio|bedroom)/i);
    if (bedroomMatch) bedrooms = parseInt(bedroomMatch[1]);

    // Buscar baños en la descripción
    const bathroomMatch = description.match(/(\d+)\s*(?:baño|bath|aseo)/i);
    if (bathroomMatch) bathrooms = parseInt(bathroomMatch[1]);

    // Buscar superficie/área en la descripción
    const areaMatch = description.match(/(\d+)\s*m[²2]?/i);
    if (areaMatch) area = parseInt(areaMatch[1]);

    // Buscar planta en la descripción
    const floorMatch = description.match(/(\d+)[ªº]?\s*(?:planta|piso)/i);
    if (floorMatch) floor = floorMatch[1];

    // Usar metadatos como fallback
    bedrooms = bedrooms || parseInt(metadata.bedrooms || metadata.habitaciones) || 0;
    bathrooms = bathrooms || parseInt(metadata.baños || metadata.bathrooms || metadata.banos) || 0;
    area = area || parseInt(metadata.living_area || metadata.area || metadata.m2 || metadata.superficie) || 0;
    floor = floor || metadata.Planta || metadata.planta || null;

    // Si no encontramos datos, usar valores por defecto razonables
    if (bedrooms === 0) bedrooms = 2; // Valor por defecto
    if (bathrooms === 0) bathrooms = 1; // Valor por defecto
    if (area === 0) area = 80; // Valor por defecto en m²

    let price = parseFloat(String(property.price).replace(/[^\d.-]/g, '')) || 0;

    return {
      id: String(property.id),
      title: property.title || property.name || `Propiedad ${property.id}`,
      description: property.description || property.short_description || '',
      price,
      source: 'woocommerce_real_kv', // Indicar que viene de KV o fue cacheado por KV
      images: property.images?.map(img => ({
        url: img.url || img.src,
        alt: img.alt || property.title || property.name || 'Imagen de propiedad'
      })) || [],
      features: { 
        bedrooms,
        bathrooms,
        area,
        floor 
      },
      location: property.title || property.name || metadata.address || metadata.direccion || 'Madrid',
      metadata,
      createdAt: property.date_created || new Date().toISOString(),
      updatedAt: property.date_modified || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error transformando propiedad real:', error.message);
    return null;
  }
};

// 🚀 Función para cargar SOLO propiedades reales, ahora con Vercel KV
export const loadRealProperties = async (page = 1, limit = 50) => {
  const cacheKey = `woo_props_page_${page}_limit_${limit}`;
  
  // 1. Verificar Vercel KV Cache
  const cachedProperties = await getPropertiesFromKVCache(cacheKey);
  if (cachedProperties) {
    return cachedProperties;
  }

  console.log(`🏠 Vercel KV MISS. Cargando propiedades REALES desde API externa - Página: ${page}, Límite: ${limit}`);
  
  const endpointToTry = REAL_ESTATE_CONFIG.endpoints[0];
  const strategyToUse = {
    name: 'standard',
    headers: {
      'User-Agent': 'Goza Madrid Real Estate/1.0',
      'Accept': 'application/json'
    }
  };

  for (let retry = 0; retry < REAL_ESTATE_CONFIG.connection.maxRetries; retry++) {
    try {
      console.log(`🔄 Intento API Externa ${retry + 1}/${REAL_ESTATE_CONFIG.connection.maxRetries}: ${endpointToTry}`);
      console.log(`🔑 Usando credenciales: Key=${REAL_ESTATE_CONFIG.credentials.key?.substring(0, 8)}..., Secret=${REAL_ESTATE_CONFIG.credentials.secret?.substring(0, 8)}...`);
      
      const requestUrl = `${endpointToTry}/products`;
      console.log(`📡 URL completa: ${requestUrl}`);
      
      const response = await axios.get(requestUrl, {
        params: {
          consumer_key: REAL_ESTATE_CONFIG.credentials.key,
          consumer_secret: REAL_ESTATE_CONFIG.credentials.secret,
          per_page: Math.min(limit, 100),
          page,
          status: 'publish',
          orderby: 'date',
          order: 'desc'
        },
        timeout: REAL_ESTATE_CONFIG.connection.timeout,
        headers: strategyToUse.headers
      });

      if (response.status === 200 && Array.isArray(response.data)) {
        const realProperties = response.data
          .map(transformRealProperty)
          .filter(Boolean);
        
        console.log(`✅ API Externa ÉXITO: ${realProperties.length} propiedades reales cargadas de ${response.data.length} productos totales`);
        
        // Guardar en Vercel KV Cache (no bloqueante)
        savePropertiesToKVCache(cacheKey, realProperties).catch(err => 
          console.error('⚠️ Error guardando en KV cache:', err.message)
        );
        
        return realProperties;
      } else {
        console.error(`❌ Respuesta inválida: Status ${response.status}`);
      }
    } catch (error) {
      const isLastRetry = retry === REAL_ESTATE_CONFIG.connection.maxRetries - 1;
      
      // Log detallado del error
      if (error.response) {
        console.error(`❌ Error HTTP ${error.response.status}: ${error.response.statusText}`);
        console.error(`📄 Response data:`, JSON.stringify(error.response.data, null, 2));
        console.error(`📋 Headers:`, error.response.headers);
        
        // Si es 401, probablemente las credenciales son incorrectas
        if (error.response.status === 401) {
          throw new Error(`Autenticación fallida: Verificar credenciales WC_CONSUMER_KEY y WC_CONSUMER_SECRET`);
        }
        
        // Si es 503, el servicio no está disponible
        if (error.response.status === 503) {
          throw new Error(`Servicio WooCommerce no disponible (503). El servidor puede estar sobrecargado o en mantenimiento.`);
        }
      } else if (error.request) {
        console.error(`❌ Sin respuesta del servidor:`, error.message);
        console.error(`🔗 URL solicitada:`, error.config?.url);
      } else {
        console.error(`❌ Error de configuración:`, error.message);
      }
      
      if (isLastRetry) {
        console.error(`💥 Todos los intentos fallaron para ${endpointToTry}`);
        throw error;
      }
      
      console.log(`⏳ Esperando ${REAL_ESTATE_CONFIG.connection.retryDelay}ms antes del siguiente intento...`);
      await new Promise(resolve => setTimeout(resolve, REAL_ESTATE_CONFIG.connection.retryDelay));
    }
  }

  throw new Error('No se pudieron cargar las propiedades después de todos los intentos');
};

// 🎯 HANDLER PRINCIPAL - SOLO PROPIEDADES REALES
export default async function handler(req, res) {
  const startTime = Date.now();
  const { limit = 50, page = 1 } = req.query;

  console.log(`🏠 API Handler (WooCommerce con Vercel KV) iniciada - Página: ${page}, Límite: ${limit}`);
  
  // Verificar credenciales con más detalle
  const hasKey = !!REAL_ESTATE_CONFIG.credentials.key;
  const hasSecret = !!REAL_ESTATE_CONFIG.credentials.secret;
  const hasApiUrl = !!process.env.WC_API_URL;
  
  console.log(`🔑 Estado de credenciales: Key=${hasKey}, Secret=${hasSecret}, API_URL=${hasApiUrl}`);
  console.log(`🔑 Key length: ${REAL_ESTATE_CONFIG.credentials.key?.length || 0}, Secret length: ${REAL_ESTATE_CONFIG.credentials.secret?.length || 0}`);
  console.log(`📡 API URL: ${REAL_ESTATE_CONFIG.endpoints[0]}`);
  
  // Si no hay credenciales, devolver array vacío en lugar de error 500
  if (!REAL_ESTATE_CONFIG.credentials.key || !REAL_ESTATE_CONFIG.credentials.secret) {
    console.warn('⚠️ Credenciales de WooCommerce no configuradas. Devolviendo array vacío.');
    console.warn('⚠️ Variables necesarias: WC_CONSUMER_KEY, WC_CONSUMER_SECRET');
    
    // Devolver array vacío con headers de cache corto
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('X-WooCommerce-Status', 'no-credentials');
    
    return res.status(200).json([]);
  }
  
  console.log(`🔑 Credenciales de WooCommerce: CONFIGURADAS`);

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache de CDN más corto (1 min), stale 5 min
  res.setHeader('Content-Type', 'application/json');

  try {
    const realProperties = await loadRealProperties(parseInt(page), parseInt(limit));
    const duration = Date.now() - startTime;
    console.log(`🎉 ÉXITO API Handler: ${realProperties.length} propiedades REALES servidas en ${duration}ms (desde KV o API externa)`);
    res.setHeader('X-WooCommerce-Status', 'success');
    res.setHeader('X-Response-Time', `${duration}ms`);
    return res.status(200).json(realProperties);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 ERROR API Handler: No se pudieron cargar propiedades después de ${duration}ms:`, error.message);
    
    // Si es un error 503 o timeout, devolver array vacío en lugar de propagar el error
    if (error.response?.status === 503 || error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.warn('⚠️ WooCommerce temporalmente no disponible. Devolviendo array vacío.');
      res.setHeader('X-WooCommerce-Status', 'unavailable');
      res.setHeader('X-Response-Time', `${duration}ms`);
      res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60'); // Cache más corto para reintentar pronto
      return res.status(200).json([]);
    }
    
    // Para otros errores, devolver información más detallada pero con status 200
    console.error(`💥 Stack trace:`, error.stack);
    
    const errorInfo = {
      properties: [], // Array vacío de propiedades
      status: 'error',
      message: 'WooCommerce temporalmente no disponible',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    };
    
    res.setHeader('X-WooCommerce-Status', 'error');
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    
    // Devolver 200 con array vacío para evitar errores en el frontend
    return res.status(200).json([]);
  }
}