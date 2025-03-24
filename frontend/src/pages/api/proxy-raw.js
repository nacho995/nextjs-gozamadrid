import axios from 'axios';

/**
 * Proxy Raw - Proxy genérico para cualquier solicitud HTTP
 * Soluciona problemas de contenido mixto (HTTPS → HTTP) y CORS
 * Se puede usar para cualquier tipo de solicitud HTTP
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Validar que la solicitud sea POST (contiene la configuración de la solicitud a proxear)
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      message: 'Este endpoint solo acepta solicitudes POST'
    });
  }
  
  try {
    const { 
      url, 
      method = 'GET', 
      headers = {}, 
      data = null,
      timeout = 15000,
      responseType = 'json'
    } = req.body;
    
    // Validar que se proporcionó una URL
    if (!url) {
      return res.status(400).json({
        error: 'Parámetros insuficientes',
        message: 'Debe proporcionar una URL en el cuerpo de la solicitud'
      });
    }
    
    console.log(`[proxy-raw] Proxeando solicitud ${method} a: ${url}`);
    
    // Configuración por defecto para cabeceras
    const defaultHeaders = {
      'User-Agent': 'GozaMadrid-Frontend/1.0',
      'Accept': 'application/json',
      ...headers
    };
    
    // Realizar la solicitud a través de axios
    const response = await axios({
      method,
      url,
      headers: defaultHeaders,
      data: method !== 'GET' && method !== 'HEAD' ? data : undefined,
      timeout,
      responseType,
      validateStatus: function (status) {
        return status < 500; // Aceptar cualquier respuesta que no sea un 5xx
      }
    });
    
    // Si el tipo de respuesta solicitado no es json, devolver los datos como binario
    if (responseType !== 'json') {
      // Configurar cabeceras de respuesta basadas en las recibidas
      if (response.headers['content-type']) {
        res.setHeader('Content-Type', response.headers['content-type']);
      }
      
      if (response.headers['content-length']) {
        res.setHeader('Content-Length', response.headers['content-length']);
      }
      
      // Devolver los datos en bruto
      return res.status(response.status).send(response.data);
    }
    
    // Para respuestas JSON, devolver con el mismo código de estado
    return res.status(response.status).json(response.data);
    
  } catch (error) {
    console.error(`[proxy-raw] Error: ${error.message}`);
    
    // Manejar diferentes tipos de errores
    if (error.response) {
      // La solicitud se realizó y el servidor respondió con un código de estado
      const status = error.response.status || 500;
      return res.status(status).json({
        error: 'Error en la API externa',
        status,
        message: error.message,
        data: error.response.data || null
      });
    } else if (error.request) {
      // La solicitud se hizo pero no se recibió respuesta
      return res.status(504).json({
        error: 'Sin respuesta de la API externa',
        message: 'La API externa no respondió a tiempo o la conexión falló',
        details: error.message
      });
    } else {
      // Error al configurar la solicitud
      return res.status(500).json({
        error: 'Error interno del proxy',
        message: error.message
      });
    }
  }
} 