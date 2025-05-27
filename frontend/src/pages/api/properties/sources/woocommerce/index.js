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
  
  // DIAGNÓSTICO DETALLADO DE VARIABLES DE ENTORNO
  console.log('[API WooCommerce] DIAGNÓSTICO DE VARIABLES DE ENTORNO:');
  console.log(`[API WooCommerce] NODE_ENV: ${process.env.NODE_ENV}`);
  console.log(`[API WooCommerce] WC_API_URL: ${WC_API_URL ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);
  console.log(`[API WooCommerce] WC_CONSUMER_KEY: ${WC_KEY ? 'CONFIGURADA (longitud: ' + WC_KEY.length + ')' : 'NO CONFIGURADA'}`);
  console.log(`[API WooCommerce] WC_CONSUMER_SECRET: ${WC_SECRET ? 'CONFIGURADA (longitud: ' + WC_SECRET.length + ')' : 'NO CONFIGURADA'}`);
  console.log(`[API WooCommerce] NEXT_PUBLIC_WC_API_URL: ${process.env.NEXT_PUBLIC_WC_API_URL ? 'CONFIGURADA' : 'NO CONFIGURADA'}`);
  console.log(`[API WooCommerce] Todas las variables de entorno disponibles:`, Object.keys(process.env).filter(key => key.includes('WC') || key.includes('CONSUMER')));

  // Validar que las claves API están presentes
  if (!WC_KEY || !WC_SECRET) {
    console.error('[API WooCommerce] Error: Las variables de entorno WC_CONSUMER_KEY y/o WC_CONSUMER_SECRET no están configuradas en el servidor.');
    console.error('[API WooCommerce] Esto puede indicar un problema con la configuración de Vercel.');
    return res.status(200).json([]); // Devolver array vacío en lugar de error
  }
  if (!WC_API_URL) {
      console.error('[API WooCommerce] Error: La variable de entorno WC_API_URL no está configurada.');
      return res.status(200).json([]); // Devolver array vacío en lugar de error
  }

  try {
    // Construir la URL completa para diagnóstico
    const fullUrl = `${WC_API_URL}/products`;
    console.log(`[API WooCommerce] URL completa: ${fullUrl}`);
    console.log(`[API WooCommerce] Parámetros de autenticación: consumer_key=${WC_KEY?.substring(0, 10)}..., consumer_secret=${WC_SECRET?.substring(0, 10)}...`);
    
    // Intentar obtener propiedades de WooCommerce
    const response = await axios.get(
      fullUrl,
      {
        params: {
          consumer_key: WC_KEY,
          consumer_secret: WC_SECRET,
          per_page: limit,
          page: page
        },
        timeout: TIMEOUT,
        headers: {
          'User-Agent': 'Goza Madrid Real Estate/1.0',
          'Accept': 'application/json'
        }
      }
    );

    console.log(`[API WooCommerce] Respuesta exitosa: status ${response.status}`);
    console.log(`[API WooCommerce] Headers de respuesta:`, response.headers);
    console.log(`[API WooCommerce] Tipo de datos recibidos:`, typeof response.data);
    console.log(`[API WooCommerce] Es array:`, Array.isArray(response.data));
    console.log(`[API WooCommerce] Cantidad de elementos:`, response.data?.length || 'N/A');

    // Verificar si la respuesta es válida
    if (!response.data) {
      console.log('[API WooCommerce] No se recibieron datos de la API');
      return res.status(200).json([]);
    }

    // Verificar si es un array
    if (!Array.isArray(response.data)) {
      console.error('[API WooCommerce] Los datos recibidos no son un array:', response.data);
      return res.status(200).json([]);
    }

    // Formatear las propiedades para uso en la aplicación
    const formattedProperties = formatWooCommerceProperties(response.data);
    
    console.log(`[API WooCommerce] ${formattedProperties.length} propiedades encontradas y formateadas`);
    
    // Establecer cabeceras de caché para mejorar el rendimiento
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    
    return res.status(200).json(formattedProperties);
  } catch (error) {
    console.error('[API WooCommerce] Error al obtener propiedades:', error.message);
    console.error('[API WooCommerce] Stack trace:', error.stack);
    
    if (error.response) {
      console.error(`[API WooCommerce] Status de error: ${error.response.status}`);
      console.error(`[API WooCommerce] Headers de error:`, error.response.headers);
      console.error(`[API WooCommerce] Datos de error:`, error.response.data);
      
      // Si es un error de autenticación, dar más detalles
      if (error.response.status === 401) {
        console.error('[API WooCommerce] ERROR DE AUTENTICACIÓN: Las credenciales pueden ser incorrectas');
        console.error('[API WooCommerce] Verificar que las credenciales en Vercel sean correctas');
      }
      
      // Devolver array vacío en lugar de error
      return res.status(200).json([]);
    }
    
    if (error.code) {
      console.error(`[API WooCommerce] Código de error: ${error.code}`);
    }
    
    // Devolver array vacío en lugar de error
    return res.status(200).json([]);
  }
} 