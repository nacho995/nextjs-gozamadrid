import axios from 'axios';

const WC_API_URL = 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
const WC_KEY = 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
const WC_SECRET = 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';

// Sistema de caché simple en memoria
const CACHE_TTL = 5 * 60 * 1000; // 5 minutos en milisegundos
const cache = {
  allProperties: {
    data: null,
    timestamp: 0
  },
  singleProperties: new Map() // Para cachear propiedades individuales
};

// Función para comprobar si un dato en caché es válido
const isCacheValid = (cacheEntry) => {
  return cacheEntry && 
         cacheEntry.data && 
         (Date.now() - cacheEntry.timestamp) < CACHE_TTL;
};

// Función para transformar datos de propiedades de WooCommerce
const transformProperty = (data) => {
  // Extraer metadatos
  const metadata = {};
  
  // Mensaje de log para diagnosticar metadatos disponibles
  console.log('[WooCommerce Processor] Meta_data para propiedad ID:', data.id);
  
  if (data.meta_data && Array.isArray(data.meta_data)) {
    // Registrar todos los metadatos disponibles para diagnóstico
    console.log('[WooCommerce Processor] Metadatos disponibles:', 
      data.meta_data.map(meta => `${meta.key}: ${typeof meta.value === 'object' ? JSON.stringify(meta.value) : meta.value}`).join(', ')
    );
    
    data.meta_data.forEach(meta => {
      if (!meta.key.startsWith('_')) {
        metadata[meta.key] = meta.value;
      }
    });
  }
  
  // Extraer información de la dirección/ubicación
  let location = data.name || "";
  
  // Procesar precio
  let price = parseFloat(data.price || "0");
  console.log(`[WooCommerce Processor] Precio original: ${data.price}, convertido: ${price}`);
  
  // Si el precio parece ser un precio reducido (menos de 10000), multiplicarlo por 1000
  if (price > 0 && price < 10000) {
    price = price * 1000;
    console.log(`[WooCommerce Processor] Precio ajustado: ${price}`);
  }
  
  // Procesar imágenes
  let images = [];
  if (data.images && Array.isArray(data.images)) {
    console.log(`[WooCommerce Processor] Procesando ${data.images.length} imágenes`);
    images = data.images.map(img => ({
      src: img.src || "", 
      alt: img.alt || data.name || "Imagen de propiedad"
    }));
  }
  
  // Extraer características importantes con mejor manejo de datos
  // Buscar bedrooms en múltiples posibles campos de metadatos
  let bedrooms = 0;
  if (metadata.bedrooms !== undefined) {
    bedrooms = parseInt(metadata.bedrooms || 0);
  } else if (metadata.dormitorios !== undefined) {
    bedrooms = parseInt(metadata.dormitorios || 0);
  } else if (metadata.habitaciones !== undefined) {
    bedrooms = parseInt(metadata.habitaciones || 0);
  }
  
  // Buscar baños en múltiples posibles campos
  let bathrooms = 0;
  if (metadata.baños !== undefined) {
    bathrooms = parseInt(metadata.baños || 0);
  } else if (metadata.bathrooms !== undefined) {
    bathrooms = parseInt(metadata.bathrooms || 0);
  } else if (metadata.banos !== undefined) {
    bathrooms = parseInt(metadata.banos || 0);
  }
  
  // Extraer área/superficie
  let area = 0;
  if (metadata.living_area !== undefined) {
    area = parseInt(metadata.living_area || 0);
  } else if (metadata.superficie !== undefined) {
    area = parseInt(metadata.superficie || 0);
  } else if (metadata.area !== undefined) {
    area = parseInt(metadata.area || 0);
  } else if (metadata.metros !== undefined) {
    area = parseInt(metadata.metros || 0);
  } else if (metadata.m2 !== undefined) {
    area = parseInt(metadata.m2 || 0);
  }
  
  // Extraer planta
  const floor = metadata.Planta || metadata.planta || metadata.floor || null;
  let floorNum = null;
  if (floor !== null) {
    // Intentamos convertir a número si es posible
    const parsed = parseInt(floor);
    floorNum = !isNaN(parsed) ? parsed : floor;
  }
  
  console.log(`[WooCommerce Processor] Características extraídas: Hab=${bedrooms}, Baños=${bathrooms}, Área=${area}, Planta=${floorNum}`);
  
  // Crear array de características para retrocompatibilidad
  const features = [];
  if (bedrooms > 0) features.push(`${bedrooms} habitaciones`);
  if (bathrooms > 0) features.push(`${bathrooms} baños`);
  if (area > 0) features.push(`${area}m²`);
  if (floorNum !== null) features.push(`Planta ${floorNum}`);
  
  // Adicionar otras características relevantes desde metadatos
  for (const [key, value] of Object.entries(metadata)) {
    // Ignorar las que ya incluimos y claves de sistema
    const ignoredKeys = ['bedrooms', 'dormitorios', 'habitaciones', 'baños', 'bathrooms', 'banos', 
                         'living_area', 'superficie', 'area', 'metros', 'm2', 'Planta', 'planta', 'floor'];
    
    if (!ignoredKeys.includes(key) && value && !key.startsWith('_')) {
      features.push(`${key}: ${value}`);
    }
  }
  
  // Construir objeto estructurado
  const property = {
    _id: data.id.toString(),
    title: data.name || "Sin título",
    description: data.description || data.short_description || "",
    price: price,
    images: images,
    features: features,
    bedrooms: bedrooms,
    bathrooms: bathrooms,
    area: area,
    floor: floorNum,
    location: location,
    propertyType: data.categories && data.categories.length > 0 ? data.categories[0].name : "Propiedad",
    status: data.status || "publish",
    source: "woocommerce",
    createdAt: data.date_created || new Date().toISOString(),
    updatedAt: data.date_modified || new Date().toISOString(),
    meta_data: metadata
  };
  
  console.log(`[WooCommerce Processor] Propiedad procesada: ID=${property._id}, Título=${property.title}, Precio=${property.price}`);
  
  return property;
};

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { id } = req.query;

    // Si es una petición de propiedad individual
    if (id) {
      return await handleSinglePropertyRequest(id, res);
    } else {
      return await handleMultiplePropertiesRequest(res);
    }

  } catch (error) {
    console.error('[WooCommerce API] Error:', error.message);
    console.error('[WooCommerce API] Stack:', error.stack);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // Error con respuesta del servidor
      const status = error.response.status;
      const message = error.response.data?.error || error.message;
      
      if (status === 404) {
        return res.status(404).json({
          error: 'Propiedad no encontrada',
          details: message
        });
      }
      
      return res.status(status).json({
        error: 'Error en la petición a WooCommerce',
        details: message
      });
    }
    
    if (error.code === 'ECONNABORTED') {
      return res.status(504).json({
        error: 'Tiempo de espera agotado',
        details: 'La petición tardó demasiado en responder'
      });
    }

    // Error general
    return res.status(500).json({ 
      error: 'Error al obtener datos de WooCommerce',
      details: error.message 
    });
  }
}

// Función para manejar peticiones de propiedades individuales
async function handleSinglePropertyRequest(id, res) {
  // Comprobar si tenemos la propiedad en caché
  const cachedProperty = cache.singleProperties.get(id);
  if (isCacheValid(cachedProperty)) {
    console.log(`[WooCommerce API] Usando propiedad ${id} desde caché`);
    return res.status(200).json(cachedProperty.data);
  }
  
  const params = new URLSearchParams({
    consumer_key: WC_KEY,
    consumer_secret: WC_SECRET
  });

  const url = `${WC_API_URL}/products/${id}?${params}`;
  
  console.log('[WooCommerce API] Iniciando petición para propiedad individual:', 
    url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')
       .replace(/consumer_secret=.*?(&|$)/, 'consumer_secret=HIDDEN$1')
  );

  const response = await axios.get(url, {
    timeout: 15000,
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': 'https://www.realestategozamadrid.com'
    }
  });

  // Verificar si tenemos datos
  if (!response.data) {
    console.error('[WooCommerce API] No se recibieron datos para la propiedad:', id);
    return res.status(404).json({ 
      error: 'Propiedad no encontrada',
      details: 'La respuesta está vacía'
    });
  }

  // Procesar la propiedad
  const property = transformProperty(response.data);
  
  console.log('[WooCommerce API] Propiedad encontrada:', {
    id: property._id,
    title: property.title
  });
  
  // Guardar en caché
  cache.singleProperties.set(id, {
    data: property,
    timestamp: Date.now()
  });
  
  return res.status(200).json(property);
}

// Función para manejar peticiones de múltiples propiedades
async function handleMultiplePropertiesRequest(res) {
  // Comprobar si tenemos las propiedades en caché
  if (isCacheValid(cache.allProperties)) {
    console.log(`[WooCommerce API] Usando lista de propiedades desde caché (${cache.allProperties.data.length} propiedades)`);
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    return res.status(200).json(cache.allProperties.data);
  }
  
  // Vamos a pedir el máximo de propiedades por página
  const perPage = 100; // Máximo permitido por la API de WooCommerce
  let page = 1;
  let allProperties = [];
  let morePages = true;
  
  console.log('[WooCommerce API] Iniciando recolección de propiedades (caché no válida)');
  
  // Bucle para obtener todas las páginas disponibles
  while (morePages && page <= 3) { // Limitamos a 3 páginas como máximo (300 propiedades)
    try {
      const params = new URLSearchParams({
        consumer_key: WC_KEY,
        consumer_secret: WC_SECRET,
        per_page: perPage,
        page: page,
        status: 'publish',
        orderby: 'date',
        order: 'desc'
      });
      
      const url = `${WC_API_URL}/products?${params}`;
      
      console.log(`[WooCommerce API] Obteniendo página ${page} de propiedades:`, 
        url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')
           .replace(/consumer_secret=.*?(&|$)/, 'consumer_secret=HIDDEN$1')
      );
      
      const response = await axios.get(url, {
        timeout: 30000, // Aumentamos el timeout para páginas grandes
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Origin': 'https://www.realestategozamadrid.com'
        }
      });
      
      // Verificar respuesta
      if (!response.data || !Array.isArray(response.data) || response.data.length === 0) {
        if (page === 1) {
          console.error('[WooCommerce API] No se encontraron propiedades en la primera página');
          return res.status(404).json({
            error: 'No se encontraron propiedades',
            details: 'No hay propiedades disponibles en WooCommerce'
          });
        }
        
        // Si ya obtuvimos algunas propiedades, terminamos el bucle
        morePages = false;
        break;
      }
      
      const pageProperties = response.data.map(transformProperty);
      allProperties = [...allProperties, ...pageProperties];
      
      console.log(`[WooCommerce API] Página ${page}: se encontraron ${pageProperties.length} propiedades`);
      
      // Verificar si hay más páginas disponibles
      // La API de WooCommerce incluye cabeceras con la información de paginación
      const totalPages = response.headers['x-wp-totalpages'] 
        ? parseInt(response.headers['x-wp-totalpages']) 
        : 1;
      
      if (page >= totalPages) {
        morePages = false;
      } else {
        page++;
      }
      
    } catch (error) {
      console.error(`[WooCommerce API] Error obteniendo página ${page}:`, error.message);
      
      // Si ya obtuvimos algunas propiedades, continuamos con lo que tenemos
      if (allProperties.length > 0) {
        morePages = false;
        break;
      }
      
      // Si no tenemos propiedades, lanzamos el error para manejarlo en el catch principal
      throw error;
    }
  }
  
  console.log(`[WooCommerce API] Total: Se encontraron ${allProperties.length} propiedades en ${page} página(s)`);
  
  // Guardar en caché
  cache.allProperties = {
    data: allProperties,
    timestamp: Date.now()
  };
  
  // Cachear la respuesta de lista por 5 minutos
  res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
  return res.status(200).json(allProperties);
} 