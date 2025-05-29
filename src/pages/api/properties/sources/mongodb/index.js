import axios from 'axios';

// Determinar la URL base de la API según el entorno - usar la URL que funciona
const BASE_URL = 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
const TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '30000');

// Funciones auxiliares
const formatMongoDBProperties = (properties) => {
  if (!Array.isArray(properties)) return [];
  
  return properties.map(property => {
    // Agregar un identificador explícito para la fuente
    property.source = 'mongodb';
    return property;
  });
};

export default async function handler(req, res) {
  const { limit = 100, page = 1 } = req.query;

  console.log(`[API Route MongoDB] Solicitando lista de propiedades. Página: ${page}, Límite: ${limit}`);
  console.log(`[API Route MongoDB] Conectando a backend en: ${BASE_URL}`); // Log para verificar URL

  try {
    // Intentar obtener propiedades de MongoDB desde el backend correcto
    const response = await axios.get(
      `${BASE_URL}/api/properties`, // Usar la variable BASE_URL correcta
      {
        params: {
          limit,
          page
        },
        timeout: TIMEOUT
      }
    );

    // Extraer las propiedades del objeto de respuesta
    let properties = [];
    if (response.data && Array.isArray(response.data)) {
      properties = response.data;
    } else if (response.data && response.data.properties && Array.isArray(response.data.properties)) {
      properties = response.data.properties;
    } else if (response.data) {
      console.log('[API Route MongoDB] Estructura de respuesta no reconocida:', JSON.stringify(response.data).substring(0, 200) + '...');
      // Intentar extraer propiedades si la respuesta es un objeto
      if (typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            properties = response.data[key];
            console.log(`[API Route MongoDB] Encontradas propiedades en clave '${key}'`);
            break;
          }
        }
      }
    }
    
    // Formatear las propiedades para uso en la aplicación
    const formattedProperties = formatMongoDBProperties(properties);
    
    console.log(`[API Route MongoDB] ${formattedProperties.length} propiedades encontradas desde ${BASE_URL}`);
    
    return res.status(200).json(formattedProperties);
  } catch (error) {
    // Log más detallado del error
    console.error(`[API Route MongoDB] Error al obtener propiedades desde ${BASE_URL}:`, error.message);
    
    if (error.response) {
      // Si el error viene del backend (8081 o producción)
      console.error(`[API Route MongoDB] Respuesta de error del backend (${BASE_URL}): ${error.response.status}`, error.response.data);
      // Devolver array vacío en lugar de error para evitar mostrar datos de ejemplo
      return res.status(200).json([]);
    } else if (error.request) {
      // Si la petición se hizo pero no se recibió respuesta (ej. backend no disponible)
      console.error(`[API Route MongoDB] No se recibió respuesta del backend (${BASE_URL}). ¿Está corriendo?`);
      // Devolver array vacío en lugar de error 503
      return res.status(200).json([]);
    } else {
      // Otro tipo de error (ej. configuración de axios)
      console.error('[API Route MongoDB] Error al configurar la petición:', error.message);
      // Devolver array vacío en lugar de error 500
      return res.status(200).json([]);
    }
  }
} 