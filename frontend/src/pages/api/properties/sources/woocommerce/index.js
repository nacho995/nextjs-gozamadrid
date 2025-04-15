import axios from 'axios';

// Configuración de WooCommerce - USAR VARIABLES DE SERVIDOR Y SIN DEFAULTS INSEGUROS
const WC_API_URL = process.env.WC_API_URL || process.env.NEXT_PUBLIC_WC_API_URL; // Permitir fallback temporal si NEXT_PUBLIC_WC_API_URL está definida
const WC_KEY = process.env.WC_CONSUMER_KEY;
const WC_SECRET = process.env.WC_CONSUMER_SECRET;
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '15000');

// Funciones auxiliares
const formatWooCommerceProperties = (properties) => {
  if (!Array.isArray(properties)) {
    console.log('[API WooCommerce] No se recibió un array de propiedades');
    return [];
  }
  
  return properties.map(property => {
    // Extraer metadatos para cada propiedad
    const extractMetadata = () => {
      if (!property.meta_data || !Array.isArray(property.meta_data)) return {};
      
      const metadata = {};
      property.meta_data.forEach(meta => {
        if (!meta.key.startsWith('_')) {
          metadata[meta.key] = meta.value;
        }
      });
      return metadata;
    };
    
    const metadata = extractMetadata();
    
    // Extraer características importantes
    const bedrooms = parseInt(metadata.bedrooms) || 0;
    const bathrooms = parseInt(metadata.baños) || parseInt(metadata.bathrooms) || parseInt(metadata.banos) || 0;
    const area = parseInt(metadata.living_area) || parseInt(metadata.area) || parseInt(metadata.m2) || 0;
    
    // Extraer dirección/ubicación
    let location = '';
    if (property.name && (
        property.name.includes("Calle") || 
        property.name.includes("Avenida") || 
        property.name.includes("Plaza") || 
        /^(Calle|C\/|Avda\.|Av\.|Pza\.|Plaza)\s+[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+\d*/.test(property.name)
    )) {
      location = property.name;
    } else if (metadata.address) {
      if (typeof metadata.address === 'string') {
        location = metadata.address;
      } else if (typeof metadata.address === 'object') {
        location = metadata.address.address || metadata.address.name || '';
      }
    }
    
    // Añadir campos de características a la propiedad
    property.source = 'woocommerce';
    property.features = {
      bedrooms,
      bathrooms,
      area,
      floor: metadata.Planta || null
    };
    property.location = location;
    property.metadata = metadata;
    
    // Log para depuración
    console.log(`[WooCommerce] ID: ${property.id}, Título: ${property.name}, Habitaciones: ${bedrooms}, Baños: ${bathrooms}, Área: ${area}m²`);
    
    return property;
  });
};

export default async function handler(req, res) {
  const { limit = 100, page = 1 } = req.query;

  console.log(`[API WooCommerce] Solicitando lista de propiedades. Página: ${page}, Límite: ${limit}`);
  console.log(`[API WooCommerce] URL base: ${WC_API_URL}`);

  // Validar que las claves API están presentes
  if (!WC_KEY || !WC_SECRET) {
    console.error('[API WooCommerce] Error: Las variables de entorno WC_CONSUMER_KEY y/o WC_CONSUMER_SECRET no están configuradas en el servidor.');
    return res.status(500).json({ error: 'Error de configuración interna del servidor.' });
  }
  if (!WC_API_URL) {
      console.error('[API WooCommerce] Error: La variable de entorno WC_API_URL no está configurada.');
      return res.status(500).json({ error: 'Error de configuración interna del servidor (URL API).' });
  }

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
    
    // Establecer cabeceras de caché para mejorar el rendimiento
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    
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