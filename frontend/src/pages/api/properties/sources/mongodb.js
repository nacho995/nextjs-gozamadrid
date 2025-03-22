import axios from 'axios';

const EXTERNAL_API_URL = 'https://api.realestategozamadrid.com';

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
    
    // Construir la URL según si es una petición individual o de lista
    let url;
    if (id) {
      url = `${EXTERNAL_API_URL}/api/properties/sources/mongodb/${id}`;
      console.log(`[MongoDB API] Solicitando propiedad individual: ${url}`);
    } else {
      url = `${EXTERNAL_API_URL}/api/properties/sources/mongodb`;
      console.log(`[MongoDB API] Solicitando lista de propiedades: ${url}`);
    }

    const response = await axios.get(url, {
      timeout: 15000,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });

    // Verificar si tenemos datos
    if (!response.data) {
      console.error('[MongoDB API] No se recibieron datos');
      return res.status(404).json({ 
        error: id ? 'Propiedad no encontrada' : 'No se encontraron propiedades',
        details: 'La respuesta está vacía'
      });
    }

    // Procesar la respuesta según el tipo de petición
    if (id) {
      // Para petición individual
      const property = {
        ...response.data,
        source: 'mongodb'
      };
      
      console.log('[MongoDB API] Propiedad encontrada:', {
        id: property._id,
        title: property.title || property.name
      });
      
      return res.status(200).json(property);
    } else {
      // Para lista de propiedades
      const properties = Array.isArray(response.data) 
        ? response.data 
        : response.data.properties || [];

      const processedProperties = properties.map(prop => ({
        ...prop,
        source: 'mongodb'
      }));

      console.log(`[MongoDB API] Se encontraron ${processedProperties.length} propiedades`);
      
      // Cachear la respuesta de lista por 5 minutos
      res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
      return res.status(200).json(processedProperties);
    }

  } catch (error) {
    console.error('[MongoDB API] Error:', error.message);
    console.error('[MongoDB API] Stack:', error.stack);
    
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
        error: 'Error en la petición a MongoDB',
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
      error: 'Error al obtener datos de MongoDB',
      details: error.message 
    });
  }
} 