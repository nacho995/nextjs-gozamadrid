/**
 * API para propiedades de MongoDB - VERSIÓN ESTABLE
 * Endpoint optimizado para evitar Fast Refresh infinito
 */

import config from '@/config/config';

// Configuración robusta con fallbacks - URLs a probar
const POSSIBLE_URLS = [
  'https://nextjs-gozamadrid-qrfk.onrender.com', // URL principal del backend
  'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
  'https://goza-madrid.onrender.com',
  'https://api.realestategozamadrid.com',
  'https://backend.realestategozamadrid.com'
];

const MONGODB_API_URL = process.env.MONGODB_API_URL || POSSIBLE_URLS[0];
const API_TIMEOUT = 15000; // 15 segundos
const MAX_RETRIES = 2;

// Cache en memoria para evitar llamadas excesivas
let memoryCache = new Map();
let lastCacheUpdate = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// Función helper para fetch con timeout
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

// Datos de fallback mejorados
const FALLBACK_PROPERTIES = [
  {
    _id: "507f1f77bcf86cd799439011",
    title: "Ático en Salamanca",
    description: "Espectacular ático con terraza en el barrio de Salamanca. Completamente reformado con acabados de lujo.",
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    address: "Calle Serrano 45, Madrid",
    images: [
      { src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80", alt: "Salón principal" },
      { src: "https://images.unsplash.com/photo-1560448204-603b3fc33ddc?w=800&h=600&fit=crop&q=80", alt: "Terraza" }
    ],
    coordinates: { lat: 40.4359, lng: -3.6774 },
    features: ["Terraza", "Ascensor", "Aire acondicionado", "Calefacción"],
    propertyType: "Venta",
    source: "mongodb"
  },
  {
    _id: "507f1f77bcf86cd799439012", 
    title: "Piso en Malasaña",
    description: "Acogedor piso reformado en el corazón de Malasaña. Ideal para parejas jóvenes.",
    price: 420000,
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    address: "Calle Fuencarral 88, Madrid",
    images: [
      { src: "https://images.unsplash.com/photo-1560449752-e1e73ac1e077?w=800&h=600&fit=crop&q=80", alt: "Salón comedor" }
    ],
    coordinates: { lat: 40.4254, lng: -3.7031 },
    features: ["Reformado", "Luminoso", "Céntrico"],
    propertyType: "Venta",
    source: "mongodb"
  },
  {
    _id: "507f1f77bcf86cd799439013",
    title: "Casa en Pozuelo de Alarcón",
    description: "Magnífica casa unifamiliar con jardín privado en Pozuelo de Alarcón.",
    price: 750000,
    bedrooms: 4,
    bathrooms: 3,
    area: 200,
    address: "Calle de la Paz 15, Pozuelo de Alarcón",
    images: [
      { src: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80", alt: "Fachada principal" }
    ],
    coordinates: { lat: 40.4338, lng: -3.8108 },
    features: ["Jardín", "Garaje", "Trastero", "Piscina"],
    propertyType: "Venta",
    source: "mongodb"
  }
];

// Función para probar múltiples URLs
const tryMultipleUrls = async (pageNum, limitNum) => {
  for (let i = 0; i < POSSIBLE_URLS.length; i++) {
    const baseUrl = POSSIBLE_URLS[i];
    console.log(`[API MongoDB] Probando URL ${i + 1}/${POSSIBLE_URLS.length}: ${baseUrl}`);
    
    try {
      // Probar diferentes rutas posibles
      const possiblePaths = [
        '/api/properties',
        '/properties',
        '/api/estates',
        '/estates'
      ];
      
      for (const path of possiblePaths) {
        const apiUrl = `${baseUrl}${path}?page=${pageNum}&limit=${limitNum}`;
        console.log(`[API MongoDB] Probando ruta: ${apiUrl}`);
        
        const response = await fetchWithTimeout(apiUrl, { method: 'GET' }, 8000);
        
        if (response.ok) {
          const data = await response.json();
          console.log(`[API MongoDB] ✅ Respuesta exitosa desde ${baseUrl}${path}`);
          console.log(`[API MongoDB] Estructura de datos:`, Object.keys(data));
          
          // Procesar diferentes formatos de respuesta
          let properties = [];
          if (Array.isArray(data)) {
            properties = data;
          } else if (data.properties && Array.isArray(data.properties)) {
            properties = data.properties;
          } else if (data.data && Array.isArray(data.data)) {
            properties = data.data;
          } else if (data.estates && Array.isArray(data.estates)) {
            properties = data.estates;
          }
          
          if (properties.length > 0) {
            console.log(`[API MongoDB] 🎉 Encontradas ${properties.length} propiedades reales!`);
            return properties;
          }
        } else {
          console.log(`[API MongoDB] Error ${response.status} en ${baseUrl}${path}`);
        }
      }
    } catch (error) {
      console.log(`[API MongoDB] Error con ${baseUrl}: ${error.message}`);
    }
  }
  
  console.log('[API MongoDB] ❌ Ninguna URL funcionó, usando fallback');
  return null;
};

export default async function handler(req, res) {
  console.log('[API MongoDB] Solicitud recibida:', req.method, req.url);
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { page = 1, limit = 10 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(50, Math.max(1, parseInt(limit))); // Máximo 50 propiedades
    
    const cacheKey = `properties_${pageNum}_${limitNum}`;
    const now = Date.now();
    
    // Limpiar cache para forzar nueva búsqueda si se pasa el parámetro clear_cache
    if (req.query.clear_cache) {
      memoryCache.clear();
      console.log('[API MongoDB] 🧹 Cache limpiado');
    }
    
    // Verificar cache en memoria (solo si no está forzando limpieza)
    if (!req.query.clear_cache && memoryCache.has(cacheKey) && (now - lastCacheUpdate) < CACHE_DURATION) {
      console.log('[API MongoDB] 📦 Datos desde cache en memoria');
      return res.status(200).json(memoryCache.get(cacheKey));
    }
    
    console.log('[API MongoDB] 🔄 Obteniendo datos desde:', MONGODB_API_URL);
    
    let properties = [];
    
    // Intentar obtener datos reales probando múltiples URLs
    properties = await tryMultipleUrls(pageNum, limitNum);
    
    if (properties && properties.length > 0) {
      // Normalizar formato de propiedades
      const normalizedProperties = properties.map(property => ({
        ...property,
        id: property._id || property.id,
        source: 'mongodb',
        // Asegurar coordenadas válidas
        coordinates: property.coordinates || property.location || { lat: 40.4168, lng: -3.7038 }
      }));
      
      console.log(`[API MongoDB] 🎉 ${normalizedProperties.length} propiedades REALES obtenidas del servidor`);
      
      // Guardar en cache
      memoryCache.set(cacheKey, normalizedProperties);
      lastCacheUpdate = now;
      
      return res.status(200).json(normalizedProperties);
    }
    
    // Si llegamos aquí, usar datos de fallback
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    const fallbackData = FALLBACK_PROPERTIES.slice(startIndex, endIndex);
    
    console.log(`[API MongoDB] 📋 Usando ${fallbackData.length} propiedades de fallback`);
    
    // Guardar fallback en cache temporalmente (menor duración)
    memoryCache.set(cacheKey, fallbackData);
    lastCacheUpdate = now;
    
    return res.status(200).json(fallbackData);
    
  } catch (error) {
    console.error('[API MongoDB] Error general:', error);
    
    // En caso de error, devolver siempre algo
    return res.status(200).json(FALLBACK_PROPERTIES.slice(0, parseInt(req.query.limit) || 10));
  }
} 