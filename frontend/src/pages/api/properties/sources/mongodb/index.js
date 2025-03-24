import axios from 'axios';

// URL base de la API de MongoDB
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

  console.log(`[API MongoDB] Solicitando lista de propiedades. Página: ${page}, Límite: ${limit}`);
  console.log(`[API MongoDB] URL base: ${BASE_URL}`);

  try {
    // Intentar obtener propiedades de MongoDB
    const response = await axios.get(
      `${BASE_URL}/api/properties`,
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
      console.log('[API MongoDB] Estructura de respuesta no reconocida:', JSON.stringify(response.data).substring(0, 200) + '...');
      // Intentar extraer propiedades si la respuesta es un objeto
      if (typeof response.data === 'object') {
        for (const key in response.data) {
          if (Array.isArray(response.data[key])) {
            properties = response.data[key];
            console.log(`[API MongoDB] Encontradas propiedades en clave '${key}'`);
            break;
          }
        }
      }
    }
    
    // Formatear las propiedades para uso en la aplicación
    const formattedProperties = formatMongoDBProperties(properties);
    
    console.log(`[API MongoDB] ${formattedProperties.length} propiedades encontradas`);
    
    return res.status(200).json(formattedProperties);
  } catch (error) {
    console.error('[API MongoDB] Error al obtener propiedades:', error.message);
    
    if (error.response) {
      console.error(`[API MongoDB] Respuesta de error: ${error.response.status}`, error.response.data);
      return res.status(error.response.status).json({
        error: `Error de MongoDB: ${error.response.data?.message || 'Error desconocido'}`,
        status: error.response.status
      });
    }
    
    return res.status(500).json({ error: `Error al obtener propiedades: ${error.message}` });
  }
} 