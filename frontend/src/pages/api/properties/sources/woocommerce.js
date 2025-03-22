import axios from 'axios';

const WC_API_URL = 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
const WC_KEY = 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
const WC_SECRET = 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';

// Función para transformar una propiedad de WooCommerce
const transformProperty = (wcProperty) => {
  // Extraer metadatos
  const getMetaValue = (key) => {
    const meta = wcProperty.meta_data?.find(m => m.key === key);
    return meta?.value || null;
  };

  // Procesar el precio
  let price = wcProperty.price;
  if (typeof price === 'string') {
    price = parseFloat(price.replace(/[^\d.-]/g, ''));
  }
  if (price < 10000) {
    price *= 1000; // Convertir precios en miles a su valor real
  }

  // Procesar imágenes
  const images = wcProperty.images?.map(img => ({
    src: img.src,
    alt: img.alt || wcProperty.name || 'Imagen de propiedad'
  })) || [];

  // Extraer características
  const features = [];
  if (getMetaValue('bedrooms')) features.push(`${getMetaValue('bedrooms')} habitaciones`);
  if (getMetaValue('baños')) features.push(`${getMetaValue('baños')} baños`);
  if (getMetaValue('living_area')) features.push(`${getMetaValue('living_area')}m²`);
  if (getMetaValue('Planta')) features.push(`Planta ${getMetaValue('Planta')}`);

  return {
    _id: wcProperty.id.toString(),
    title: wcProperty.name,
    description: wcProperty.description || wcProperty.short_description || '',
    price,
    images,
    features,
    bedrooms: parseInt(getMetaValue('bedrooms')) || 0,
    bathrooms: parseInt(getMetaValue('baños')) || 0,
    area: parseInt(getMetaValue('living_area')) || 0,
    floor: getMetaValue('Planta'),
    location: getMetaValue('address')?.address || getMetaValue('address') || '',
    propertyType: wcProperty.categories?.[0]?.name || 'Venta',
    status: wcProperty.status === 'publish' ? 'Disponible' : 'No disponible',
    source: 'woocommerce',
    createdAt: wcProperty.date_created,
    updatedAt: wcProperty.date_modified,
    meta_data: wcProperty.meta_data?.reduce((acc, meta) => {
      if (!meta.key.startsWith('_')) {
        acc[meta.key] = meta.value;
      }
      return acc;
    }, {})
  };
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

    // Construir URL y parámetros según el tipo de petición
    const params = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET,
      ...(id ? {} : { 
        per_page: 50, 
        status: 'publish', 
        orderby: 'date', 
        order: 'desc'
      })
    });

    const url = id 
      ? `${WC_API_URL}/products/${id}?${params}`
      : `${WC_API_URL}/products?${params}`;
    
    console.log('[WooCommerce API] Iniciando petición a:', 
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
      console.error('[WooCommerce API] No se recibieron datos');
      return res.status(404).json({ 
        error: id ? 'Propiedad no encontrada' : 'No se encontraron propiedades',
        details: 'La respuesta está vacía'
      });
    }

    // Procesar la respuesta según el tipo de petición
    if (id) {
      // Para petición individual
      const property = transformProperty(response.data);
      
      console.log('[WooCommerce API] Propiedad encontrada:', {
        id: property._id,
        title: property.title
      });
      
      return res.status(200).json(property);
    } else {
      // Para lista de propiedades
      const properties = Array.isArray(response.data) 
        ? response.data.map(transformProperty)
        : [transformProperty(response.data)];

      console.log(`[WooCommerce API] Se encontraron ${properties.length} propiedades`);
      
      // Cachear la respuesta de lista por 5 minutos
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
      return res.status(200).json(properties);
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