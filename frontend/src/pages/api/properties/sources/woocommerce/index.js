import axios from 'axios';

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
    timeout: 8000, // 8 segundos - reducido para evitar timeouts de Vercel
    maxRetries: 2, // Reducir reintentos para ser más rápido
    retryDelay: 1000 // Reducir delay entre reintentos
  }
};

// 🔄 Caché en memoria simple (temporal hasta configurar Vercel KV)
const memoryCache = new Map();
const CACHE_TTL_MS = 30 * 60 * 1000; // 30 minutos

// Función para obtener datos del caché en memoria
function getFromMemoryCache(key) {
  const cached = memoryCache.get(key);
  if (cached && Date.now() - cached.timestamp < CACHE_TTL_MS) {
    console.log(`🚀 Memory Cache HIT para la clave: ${key}`);
    return cached.data;
  }
  console.log(`💨 Memory Cache MISS para la clave: ${key}`);
  return null;
}

// Función para guardar datos en el caché en memoria
function saveToMemoryCache(key, data) {
  memoryCache.set(key, {
    data,
    timestamp: Date.now()
  });
  console.log(`✅ Datos cacheados en memoria para la clave: ${key}`);
}

// 🔧 Transformador simplificado para propiedades reales (optimizado para velocidad)
const transformRealProperty = (property) => {
  try {
    // Extraer datos básicos rápidamente
    let bedrooms = 2; // Valor por defecto
    let bathrooms = 1; // Valor por defecto
    let area = 80; // Valor por defecto
    let address = property.name || property.title || '';
    
    // Extraer metadatos solo si existen (optimizado)
    if (property.meta_data?.length) {
      for (const meta of property.meta_data) {
        if (meta.key === 'bedrooms') bedrooms = parseInt(meta.value) || bedrooms;
        else if (meta.key === 'baños' || meta.key === 'bathrooms') {
          const val = parseInt(meta.value);
          if (val > 0) bathrooms = val; // Solo si es positivo
        }
        else if (meta.key === 'living_area' || meta.key === 'area') {
          const val = parseInt(meta.value);
          if (val > 0) area = val; // Solo si es positivo
        }
        else if (meta.key === 'address' || meta.key === 'direccion') {
          if (meta.value) address = meta.value;
        }
      }
    }

    const price = parseFloat(String(property.price).replace(/[^\d.-]/g, '')) || 0;

    return {
      id: String(property.id),
      title: property.name || property.title || `Propiedad ${property.id}`,
      description: property.short_description || property.description || '',
      price,
      source: 'woocommerce_real',
      images: property.images?.slice(0, 3).map(img => ({
        url: img.url || img.src,
        alt: img.alt || property.name || 'Imagen de propiedad'
      })) || [],
      features: { bedrooms, bathrooms, area },
      location: address || 'Madrid',
      address: address,
      createdAt: property.date_created || new Date().toISOString(),
      updatedAt: property.date_modified || new Date().toISOString()
    };
  } catch (error) {
    console.error('❌ Error transformando propiedad:', error.message);
    return null;
  }
};

// 🚀 Función para cargar SOLO propiedades reales, ahora con caché en memoria
export const loadRealProperties = async (page = 1, limit = 50) => {
  const cacheKey = `woo_props_page_${page}_limit_${limit}`;
  
  // 1. Verificar caché en memoria
  const cachedProperties = getFromMemoryCache(cacheKey);
  if (cachedProperties) {
    return cachedProperties;
  }

  console.log(`🏠 Memory Cache MISS. Cargando propiedades REALES desde API externa - Página: ${page}, Límite: ${limit}`);
  
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
        
        // Guardar en caché en memoria
        saveToMemoryCache(cacheKey, realProperties);
        
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

  console.log(`🏠 API Handler (WooCommerce con Memory Cache) iniciada - Página: ${page}, Límite: ${limit}`);
  
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
    console.log(`🎉 ÉXITO API Handler: ${realProperties.length} propiedades REALES servidas en ${duration}ms (desde Memory Cache o API externa)`);
    res.setHeader('X-WooCommerce-Status', 'success');
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('X-Cache-Type', 'memory');
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
    
    res.setHeader('X-WooCommerce-Status', 'error');
    res.setHeader('X-Response-Time', `${duration}ms`);
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=60');
    
    // Devolver 200 con array vacío para evitar errores en el frontend
    return res.status(200).json([]);
  }
}