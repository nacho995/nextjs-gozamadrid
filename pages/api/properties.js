/**
 * API Principal de Propiedades - Goza Madrid
 * Combina datos de MongoDB y WooCommerce
 */

const BACKEND_URL = 'https://nextjs-gozamadrid-qrfk.onrender.com';
const API_TIMEOUT = 15000;

// Cache en memoria
let memoryCache = new Map();
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función para fetch con timeout
const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'NextJS-GozaMadrid/1.0',
        ...(options.headers || {})
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

// Datos de fallback
const FALLBACK_PROPERTIES = [
  {
    id: "fallback_1",
    title: "Ático Premium en Salamanca",
    description: "Espectacular ático de lujo con terraza panorámica en el exclusivo barrio de Salamanca.",
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    address: "Calle Serrano, Madrid",
    images: [
      { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80", alt: "Salón principal" },
      { src: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&q=80", alt: "Terraza" }
    ],
    coordinates: { lat: 40.4359, lng: -3.6774 },
    features: ["Terraza panorámica", "Ascensor", "Aire acondicionado", "Parking"],
    propertyType: "Venta",
    source: "fallback"
  },
  {
    id: "fallback_2",
    title: "Piso Reformado en Malasaña",
    description: "Encantador piso completamente reformado en el vibrante barrio de Malasaña.",
    price: 420000,
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    address: "Calle Fuencarral, Madrid",
    images: [
      { src: "https://images.unsplash.com/photo-1560449752-e1e73ac1e077?w=800&h=600&fit=crop&q=80", alt: "Salón comedor" }
    ],
    coordinates: { lat: 40.4254, lng: -3.7031 },
    features: ["Reformado", "Luminoso", "Céntrico", "Metro cerca"],
    propertyType: "Venta",
    source: "fallback"
  },
  {
    id: "fallback_3",
    title: "Chalet en Pozuelo de Alarcón",
    description: "Magnífica casa unifamiliar con jardín privado y piscina en zona residencial.",
    price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    address: "Pozuelo de Alarcón, Madrid",
    images: [
      { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80", alt: "Fachada principal" }
    ],
    coordinates: { lat: 40.4338, lng: -3.8108 },
    features: ["Jardín privado", "Piscina", "Garaje", "Trastero"],
    propertyType: "Venta",
    source: "fallback"
  }
];

// Función para obtener propiedades de MongoDB
const getMongoProperties = async (page, limit) => {
  const possibleEndpoints = [
    `${BACKEND_URL}/api/properties`,
    `${BACKEND_URL}/properties`,
    `${BACKEND_URL}/api/estates`,
    `${BACKEND_URL}/estates`
  ];
  
  for (const endpoint of possibleEndpoints) {
    try {
      console.log(`[MongoDB API] Probando: ${endpoint}`);
      const response = await fetchWithTimeout(`${endpoint}?page=${page}&limit=${limit}`);
      
      if (response.ok) {
        const data = await response.json();
        
        // Procesar diferentes formatos de respuesta
        let properties = [];
        if (Array.isArray(data)) {
          properties = data;
        } else if (data.properties) {
          properties = data.properties;
        } else if (data.data) {
          properties = data.data;
        }
        
        if (properties.length > 0) {
          console.log(`[MongoDB API] ✅ ${properties.length} propiedades desde ${endpoint}`);
          return properties.map(prop => ({
            ...prop,
            source: 'mongodb',
            id: prop._id || prop.id
          }));
        }
      }
    } catch (error) {
      console.log(`[MongoDB API] Error en ${endpoint}:`, error.message);
    }
  }
  
  return [];
};

// Función para obtener propiedades de WooCommerce
const getWooCommerceProperties = async (page, limit) => {
  try {
    const response = await fetch(`/api/properties/sources/woocommerce?page=${page}&limit=${limit}`);
    if (response.ok) {
      const data = await response.json();
      return Array.isArray(data) ? data : [];
    }
  } catch (error) {
    console.log('[WooCommerce API] Error:', error.message);
  }
  return [];
};

export default async function handler(req, res) {
  console.log('[Properties API] Solicitud:', req.method, req.url);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { page = 1, limit = 10, source = 'all', clear_cache } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit)));
    
    const cacheKey = `properties_${source}_${pageNum}_${limitNum}`;
    const now = Date.now();
    
    // Limpiar cache si se solicita
    if (clear_cache) {
      memoryCache.clear();
      console.log('[Properties API] 🧹 Cache limpiado');
    }
    
    // Verificar cache
    if (!clear_cache && memoryCache.has(cacheKey) && (now - lastCacheUpdate) < CACHE_DURATION) {
      console.log('[Properties API] 📦 Desde cache');
      return res.status(200).json(memoryCache.get(cacheKey));
    }
    
    let allProperties = [];
    let sourcesMeta = { mongodb: 0, woocommerce: 0, fallback: 0 };
    
    // Obtener propiedades según la fuente solicitada
    if (source === 'all' || source === 'mongodb') {
      console.log('[Properties API] 🔄 Obteniendo MongoDB...');
      const mongoProps = await getMongoProperties(pageNum, limitNum);
      allProperties = allProperties.concat(mongoProps);
      sourcesMeta.mongodb = mongoProps.length;
    }
    
    if (source === 'all' || source === 'woocommerce') {
      console.log('[Properties API] 🔄 Obteniendo WooCommerce...');
      const wooProps = await getWooCommerceProperties(pageNum, limitNum);
      allProperties = allProperties.concat(wooProps);
      sourcesMeta.woocommerce = wooProps.length;
    }
    
    // Si no hay propiedades reales, usar fallback
    if (allProperties.length === 0) {
      allProperties = FALLBACK_PROPERTIES;
      sourcesMeta.fallback = FALLBACK_PROPERTIES.length;
      console.log('[Properties API] 🔄 Usando datos de fallback');
    }
    
    const result = {
      properties: allProperties,
      meta: {
        total: allProperties.length,
        page: pageNum,
        limit: limitNum,
        hasMore: allProperties.length === limitNum,
        sources: sourcesMeta
      }
    };
    
    // Guardar en cache
    memoryCache.set(cacheKey, result);
    lastCacheUpdate = now;
    
    console.log(`[Properties API] ✅ Retornando ${allProperties.length} propiedades`);
    console.log(`[Properties API] Fuentes: MongoDB(${sourcesMeta.mongodb}), WooCommerce(${sourcesMeta.woocommerce}), Fallback(${sourcesMeta.fallback})`);
    
    res.status(200).json(result);
    
  } catch (error) {
    console.error('[Properties API] Error:', error);
    
    // En caso de error, devolver fallback
    res.status(200).json({
      properties: FALLBACK_PROPERTIES,
      meta: {
        total: FALLBACK_PROPERTIES.length,
        page: 1,
        limit: 10,
        hasMore: false,
        sources: { fallback: FALLBACK_PROPERTIES.length },
        error: error.message
      }
    });
  }
} 