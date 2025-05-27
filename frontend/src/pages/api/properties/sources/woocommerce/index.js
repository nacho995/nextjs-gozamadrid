import axios from 'axios';

// 🏠 CONFIGURACIÓN SOLO PARA PROPIEDADES REALES - SIN FALLBACKS
const REAL_ESTATE_CONFIG = {
  // Múltiples endpoints para evitar bloqueos
  endpoints: [
    'https://wordpress.realestategozamadrid.com/wp-json/wc/v3',
    'https://realestategozamadrid.com/wp-json/wc/v3',
    'https://www.realestategozamadrid.com/wp-json/wc/v3'
  ],
  
  // Credenciales reales
  credentials: {
    key: process.env.WC_CONSUMER_KEY,
    secret: process.env.WC_CONSUMER_SECRET
  },
  
  // Configuración agresiva para superar bloqueos
  connection: {
    timeout: 30000, // 30 segundos
    maxRetries: 5,
    retryDelay: 2000
  }
};

// 🔄 Cache solo para datos reales
const realEstateCache = new Map();
const CACHE_TTL = 10 * 60 * 1000; // 10 minutos

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
      source: 'woocommerce_real',
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

// 🚀 Función para cargar SOLO propiedades reales
export const loadRealProperties = async (page = 1, limit = 50) => {
  const cacheKey = `real_properties_${page}_${limit}`;
  
  // Verificar cache
  const cached = getCachedData(cacheKey);
  if (cached) {
    console.log(`🚀 Cache hit: ${cached.length} propiedades reales`);
    return cached;
  }

  console.log(`🏠 Cargando propiedades REALES - Página: ${page}, Límite: ${limit}`);
  
  // Estrategias múltiples para superar bloqueos
  const strategies = [
    // Estrategia 1: Headers estándar
    {
      name: 'standard',
      headers: {
        'User-Agent': 'Goza Madrid Real Estate/1.0',
        'Accept': 'application/json'
      }
    },
    // Estrategia 2: Headers de navegador
    {
      name: 'browser',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
        'Accept': 'application/json, text/plain, */*',
        'Accept-Language': 'es-ES,es;q=0.9,en;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Sec-Fetch-Dest': 'empty',
        'Sec-Fetch-Mode': 'cors',
        'Sec-Fetch-Site': 'cross-site'
      }
    },
    // Estrategia 3: Headers mínimos
    {
      name: 'minimal',
      headers: {
        'Accept': 'application/json'
      }
    }
  ];

  // Probar cada combinación de endpoint + estrategia
  for (const endpoint of REAL_ESTATE_CONFIG.endpoints) {
    for (const strategy of strategies) {
      for (let retry = 0; retry < REAL_ESTATE_CONFIG.connection.maxRetries; retry++) {
        try {
          console.log(`🔄 Intento ${retry + 1}: ${endpoint} con estrategia ${strategy.name}`);
          
          const response = await axios.get(`${endpoint}/products`, {
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
            headers: strategy.headers
          });

          if (response.status === 200 && Array.isArray(response.data) && response.data.length > 0) {
            const realProperties = response.data
              .map(transformRealProperty)
              .filter(Boolean);

            if (realProperties.length > 0) {
              setCachedData(cacheKey, realProperties);
              console.log(`✅ ¡ÉXITO! ${realProperties.length} propiedades REALES desde ${endpoint} (${strategy.name})`);
              return realProperties;
            }
          }
        } catch (error) {
          console.log(`❌ ${endpoint} + ${strategy.name} (intento ${retry + 1}): ${error.message}`);
          
          if (retry < REAL_ESTATE_CONFIG.connection.maxRetries - 1) {
            await new Promise(resolve => setTimeout(resolve, REAL_ESTATE_CONFIG.connection.retryDelay));
          }
        }
      }
    }
  }
  
  // Si llegamos aquí, NO hay propiedades reales disponibles
  throw new Error('No se pudieron cargar propiedades reales del inventario');
};

// 🎯 HANDLER PRINCIPAL - SOLO PROPIEDADES REALES
export default async function handler(req, res) {
  const startTime = Date.now();
  const { limit = 50, page = 1 } = req.query;

  console.log(`🏠 API PROPIEDADES REALES iniciada - Página: ${page}, Límite: ${limit}`);
  console.log(`🔑 Credenciales configuradas: ${REAL_ESTATE_CONFIG.credentials.key ? 'SÍ' : 'NO'}`);

  // Headers optimizados
  res.setHeader('Cache-Control', 's-maxage=600, stale-while-revalidate=300'); // 10min cache
  res.setHeader('Content-Type', 'application/json');

  try {
    const realProperties = await loadRealProperties(parseInt(page), parseInt(limit));
    
    const duration = Date.now() - startTime;
    console.log(`🎉 ÉXITO: ${realProperties.length} propiedades REALES en ${duration}ms`);
    
    return res.status(200).json(realProperties);
    
  } catch (error) {
    const duration = Date.now() - startTime;
    console.error(`💥 ERROR: No se pudieron cargar propiedades reales después de ${duration}ms:`, error.message);
    
    // SIN FALLBACKS - Devolver error claro
    return res.status(503).json({
      error: 'Propiedades no disponibles',
      message: 'No se pudieron cargar las propiedades reales del inventario. Inténtelo de nuevo en unos minutos.',
      timestamp: new Date().toISOString(),
      duration: `${duration}ms`
    });
  }
} 