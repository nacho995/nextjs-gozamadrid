import axios from 'axios';

// Configuración de WooCommerce
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
const WC_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
const WC_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');

// Funciones auxiliares
const formatWooCommerceProperties = (properties) => {
  if (!Array.isArray(properties)) {
    console.log('[API WooCommerce] No se recibió un array de propiedades');
    return [];
  }
  
  return properties.map(property => {
    // Agregar un identificador explícito para la fuente
    property.source = 'woocommerce';
    return property;
  });
};

export default async function handler(req, res) {
  const { limit = 100, page = 1 } = req.query;

  console.log(`[API WooCommerce] Solicitando lista de propiedades. Página: ${page}, Límite: ${limit}`);
  console.log(`[API WooCommerce] URL base: ${WC_API_URL}`);

  try {
    // Intentar obtener propiedades de WooCommerce
    const response = await axios.get(
      `${WC_API_URL}/products`,
      {
        params: {
          consumer_key: WC_KEY,
          consumer_secret: WC_SECRET,
          per_page: limit,
          page: page
        },
        timeout: TIMEOUT
      }
    );

    // Verificar si la respuesta es válida
    if (!response.data) {
      console.log('[API WooCommerce] No se recibieron datos de la API');
      return res.status(200).json([]);
    }

    // Formatear las propiedades para uso en la aplicación
    const formattedProperties = formatWooCommerceProperties(response.data);
    
    console.log(`[API WooCommerce] ${formattedProperties.length} propiedades encontradas`);
    
    return res.status(200).json(formattedProperties);
  } catch (error) {
    console.error('[API WooCommerce] Error al obtener propiedades:', error.message);
    
    if (error.response) {
      console.error(`[API WooCommerce] Respuesta de error: ${error.response.status}`, error.response.data);
      return res.status(error.response.status).json({
        error: `Error de WooCommerce: ${error.response.data?.message || 'Error desconocido'}`,
        status: error.response.status
      });
    }
    
    return res.status(500).json({ error: `Error al obtener propiedades: ${error.message}` });
  }
} 