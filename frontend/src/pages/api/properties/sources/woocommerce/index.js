import axios from 'axios';
import { kv } from '@vercel/kv'; // Importar Vercel KV

// 🏠 CONFIGURACIÓN SOLO PARA PROPIEDADES REALES - SIN FALLBACKS
const REAL_ESTATE_CONFIG = {
  // Múltiples endpoints para evitar bloqueos
  endpoints: [
    'https://wordpress.realestategozamadrid.com/wp-json/wc/v3' // Usar solo el principal
  ],
  
  // Credenciales reales
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
async function setPropertiesInKVCache(key, data) {
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
      
      const response = await axios.get(`${endpointToTry}/products`, {
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

        if (realProperties.length > 0) {
          console.log(`✅ ¡ÉXITO API Externa! ${realProperties.length} propiedades REALES desde ${endpointToTry}. Cacheando en Vercel KV...`);
          await setPropertiesInKVCache(cacheKey, realProperties); // Cachear en Vercel KV
          return realProperties;
        }
        // Si la respuesta es un array vacío, o no hay propiedades válidas después de transformar
        console.log(`⚠️ ${endpointToTry} (intento ${retry + 1}): No se encontraron propiedades válidas en la respuesta.`);
        if (retry >= REAL_ESTATE_CONFIG.connection.maxRetries - 1) {
            throw new Error('No se encontraron propiedades válidas después de todos los intentos a la API externa.');
        }
      } else {
        // La respuesta no fue 200 o no es un array
        console.log(`⚠️ ${endpointToTry} (intento ${retry + 1}): Respuesta inesperada - Status ${response.status}`);
        if (retry >= REAL_ESTATE_CONFIG.connection.maxRetries - 1) {
            throw new Error(`Respuesta inesperada de la API externa después de todos los intentos. Status: ${response.status}`);
        }
      }
    } catch (error) {
      console.log(`❌ Error API Externa ${endpointToTry} (intento ${retry + 1}): ${error.message}`);
      if (retry >= REAL_ESTATE_CONFIG.connection.maxRetries - 1) {
        throw error; // Re-lanzar el error del último intento para ser manejado por el handler
      }
      await new Promise(resolve => setTimeout(resolve, REAL_ESTATE_CONFIG.connection.retryDelay));
    }
  }
  
  // Si el bucle termina (todos los reintentos fallaron)
  throw new Error('No se pudieron cargar propiedades reales del inventario (API externa) después de todos los reintentos.');
};

// 🎯 HANDLER PRINCIPAL - SOLO PROPIEDADES REALES
export default async function handler(req, res) {
  const startTime = Date.now();
  const { limit = 50, page = 1 } = req.query;

  console.log(`🏠 API Handler (WooCommerce con Vercel KV) iniciada - Página: ${page}, Límite: ${limit}`);
  if (!REAL_ESTATE_CONFIG.credentials.key || !REAL_ESTATE_CONFIG.credentials.secret) {
    console.error('❌ Credenciales de WooCommerce no configuradas en variables de entorno.');
    return res.status(500).json({ error: 'Configuración de servidor incorrecta.'});
  }
  console.log(`🔑 Credenciales de WooCommerce: CONFIGURADAS`);

  res.setHeader('Cache-Control', 's-maxage=60, stale-while-revalidate=300'); // Cache de CDN más corto (1 min), stale 5 min
  res.setHeader('Content-Type', 'application/json');

  try {
    const realProperties = await loadRealProperties(parseInt(page), parseInt(limit));
    const duration = Date.now() - startTime;
    console.log(`🎉 ÉXITO API Handler: ${realProperties.length} propiedades REALES servidas en ${duration}ms (desde KV o API externa)`);
    return res.status(200).json(realProperties);
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 ERROR API Handler: No se pudieron cargar propiedades después de ${duration}ms:`, error.message);
    return res.status(503).json({
      error: 'Propiedades de WooCommerce no disponibles temporalmente',
      message: error.message || 'El servicio externo no pudo ser contactado después de múltiples intentos.',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    });
  }
} 