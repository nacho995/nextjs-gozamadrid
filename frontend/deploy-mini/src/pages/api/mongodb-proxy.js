/**
 * Proxy específico para la API de MongoDB en AWS Elastic Beanstalk
 * Este archivo maneja todas las peticiones al backend de MongoDB
 */

export default async function handler(req, res) {
  // Extraer el recurso y los parámetros de la consulta
  const { resource = '', id = '' } = req.query;
  
  // La URL base de la API de MongoDB (AWS Elastic Beanstalk)
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
  
  // Construir la URL completa
  let targetUrl;
  
  if (id) {
    // Si tenemos un ID específico
    targetUrl = `${API_URL}/${resource}/${id}`;
  } else {
    // Si es una consulta general
    targetUrl = `${API_URL}/${resource}`;
  }
  
  console.log(`[mongodb-proxy] Redirigiendo petición a: ${targetUrl}`);
  
  try {
    // Configurar opciones para la petición
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        // Agregar User-Agent personalizado para identificar las solicitudes
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      },
    };
    
    // Incluir el cuerpo para peticiones POST, PUT, PATCH
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }
    
    // Realizar la petición al backend
    const timeoutId = setTimeout(() => {
      console.error(`[mongodb-proxy] Timeout alcanzado después de 30 segundos: ${targetUrl}`);
      res.status(504).json({ error: 'Gateway Timeout', message: 'La solicitud a MongoDB tardó demasiado tiempo' });
    }, 30000);
    
    const response = await fetch(targetUrl, options);
    clearTimeout(timeoutId);
    
    // Obtener los headers y el status
    const contentType = response.headers.get('content-type');
    
    // Si es JSON, devolver JSON
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Registrar datos básicos para depuración
      if (Array.isArray(data)) {
        console.log(`[mongodb-proxy] Respuesta recibida: array con ${data.length} elementos`);
      } else if (typeof data === 'object') {
        console.log(`[mongodb-proxy] Respuesta recibida: objeto con propiedades [${Object.keys(data).join(', ')}]`);
      }
      
      return res.status(response.status).json(data);
    } 
    
    // Si no es JSON, devolver el texto plano
    const text = await response.text();
    return res.status(response.status).send(text);
    
  } catch (error) {
    console.error('[mongodb-proxy] Error al realizar la petición:', error);
    
    // Devolver un mensaje de error detallado
    return res.status(500).json({
      error: 'Error de conexión',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 