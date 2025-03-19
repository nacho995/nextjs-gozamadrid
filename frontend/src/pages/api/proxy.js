/**
 * Proxy API general para redirigir peticiones a diferentes servicios
 * Soporta MongoDB y WooCommerce
 * 
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  const { service, resource, id } = req.query;
  
  console.log(`[proxy] Recibida petición para servicio: ${service}, recurso: ${resource}, id: ${id || 'no especificado'}`);
  
  if (!service) {
    return res.status(400).json({
      error: 'Parámetro service no especificado',
      message: 'Debe especificar el servicio (mongodb o woocommerce)'
    });
  }
  
  try {
    // Configurar headers para evitar caché
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // Redirigir según el servicio solicitado
    switch (service.toLowerCase()) {
      case 'mongodb':
        await handleMongoDBRequest(req, res, resource, id);
        break;
        
      case 'woocommerce':
        await handleWooCommerceRequest(req, res, resource, id);
        break;
        
      default:
        return res.status(400).json({
          error: 'Servicio no soportado',
          message: `El servicio '${service}' no está soportado. Use 'mongodb' o 'woocommerce'.`
        });
    }
  } catch (error) {
    console.error(`[proxy] Error general en proxy:`, error);
    
    return res.status(500).json({
      error: 'Error interno',
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
}

/**
 * Maneja solicitudes para el servicio MongoDB
 */
async function handleMongoDBRequest(req, res, resource, id) {
  // La URL base del API de MongoDB en AWS Elastic Beanstalk
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
  
  // Construir la URL de destino
  let targetUrl;
  if (id) {
    targetUrl = `${API_URL}/${resource}/${id}`;
  } else {
    targetUrl = `${API_URL}/${resource}`;
  }
  
  console.log(`[proxy:mongodb] Redirigiendo petición a: ${targetUrl}`);
  
  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      }
    };
    
    // Incluir el cuerpo para métodos que lo requieren
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }
    
    // Timeout para evitar que la petición se quede colgada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    options.signal = controller.signal;
    
    const response = await fetch(targetUrl, options).finally(() => clearTimeout(timeoutId));
    
    // Obtener tipo de contenido para determinar cómo procesar la respuesta
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[proxy:mongodb] Timeout alcanzado en la petición a: ${targetUrl}`);
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'La solicitud tardó demasiado tiempo en responder'
      });
    }
    
    console.error(`[proxy:mongodb] Error al realizar petición:`, error);
    return res.status(502).json({
      error: 'Bad Gateway',
      message: error.message
    });
  }
}

/**
 * Maneja solicitudes para el servicio WooCommerce
 */
async function handleWooCommerceRequest(req, res, resource, id) {
  // La URL base del API de WooCommerce
  const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
  const WC_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
  const WC_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
  
  // Construir la URL de destino con autenticación
  let targetUrl;
  if (id) {
    targetUrl = `${WC_API_URL}/${resource}/${id}?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
  } else {
    targetUrl = `${WC_API_URL}/${resource}?consumer_key=${WC_KEY}&consumer_secret=${WC_SECRET}`;
  }
  
  // Añadir parámetros adicionales si existen en la consulta original
  const queryParams = new URLSearchParams(req.url.split('?')[1] || '');
  for (const [key, value] of queryParams.entries()) {
    if (!['service', 'resource', 'id'].includes(key)) {
      targetUrl += `&${key}=${value}`;
    }
  }
  
  console.log(`[proxy:woocommerce] Redirigiendo petición a: ${targetUrl.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')}`);
  
  try {
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      }
    };
    
    // Incluir el cuerpo para métodos que lo requieren
    if (['POST', 'PUT', 'PATCH'].includes(req.method) && req.body) {
      options.body = JSON.stringify(req.body);
    }
    
    // Timeout para evitar que la petición se quede colgada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);
    options.signal = controller.signal;
    
    const response = await fetch(targetUrl, options).finally(() => clearTimeout(timeoutId));
    
    // Obtener tipo de contenido para determinar cómo procesar la respuesta
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      return res.status(response.status).json(data);
    } else {
      const text = await response.text();
      return res.status(response.status).send(text);
    }
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error(`[proxy:woocommerce] Timeout alcanzado en la petición a WooCommerce`);
      return res.status(504).json({
        error: 'Gateway Timeout',
        message: 'La solicitud a WooCommerce tardó demasiado tiempo en responder'
      });
    }
    
    console.error(`[proxy:woocommerce] Error al realizar petición:`, error);
    return res.status(502).json({
      error: 'Bad Gateway',
      message: error.message
    });
  }
} 