import axios from 'axios';

/**
 * API Proxy para evitar problemas de CORS y Mixed Content
 * 
 * Este endpoint sirve como proxy para cualquier API externa, permitiendo:
 * 1. Pasar una URL completa con el parámetro 'url'
 * 2. O pasar source y path para usar las fuentes predefinidas
 *
 * @param {object} req - Objeto de solicitud Next.js
 * @param {object} res - Objeto de respuesta Next.js
 */
export default async function handler(req, res) {
  // Establecer CORS para permitir solicitudes desde cualquier origen en desarrollo
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Responder a las solicitudes OPTIONS para los preflight CORS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir GET y POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido',
      message: 'Solo se permiten solicitudes GET y POST'
    });
  }

  try {
    // Extraer los parámetros de la consulta
    const { url, source, path, limit = 100 } = req.query;
    
    // Definir URLs base para las diferentes fuentes
    const baseUrls = {
      mongodb: process.env.NEXT_PUBLIC_API_MONGODB_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
      woocommerce: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3',
      wordpress: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2'
    };
    
    let targetUrl;
    let headers = {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    };
    
    // Si se proporciona una URL completa, usarla directamente
    if (url) {
      targetUrl = url;
    } 
    // Si se proporcionan source y path, construir la URL
    else if (source && path) {
      const baseUrl = baseUrls[source.toLowerCase()];
      
      if (!baseUrl) {
        return res.status(400).json({ 
          error: 'Fuente inválida',
          message: `La fuente "${source}" no está soportada. Use una de: ${Object.keys(baseUrls).join(', ')}`
        });
      }
      
      // Asegurarse de que el path comience con /
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      targetUrl = `${baseUrl}${cleanPath}`;
      
      // Añadir credenciales específicas para WooCommerce
      if (source.toLowerCase() === 'woocommerce') {
        targetUrl += targetUrl.includes('?') ? '&' : '?';
        targetUrl += `consumer_key=${process.env.WC_CONSUMER_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85'}&consumer_secret=${process.env.WC_CONSUMER_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e'}`;
      }
    } else {
      return res.status(400).json({ 
        error: 'Parámetros insuficientes',
        message: 'Debe proporcionar una URL completa con el parámetro "url", o un "source" y un "path"'
      });
    }
    
    // Añadir parámetros de límite para paginación si corresponde
    if (limit && !targetUrl.includes('limit=') && !targetUrl.includes('per_page=')) {
      targetUrl += targetUrl.includes('?') ? '&' : '?';
      
      // Diferentes APIs usan diferentes parámetros para límites
      if (targetUrl.includes('woocommerce') || targetUrl.includes('wp/v2')) {
        targetUrl += `per_page=${limit}`;
      } else {
        targetUrl += `limit=${limit}`;
      }
    }
    
    console.log(`[API Proxy] Redirigiendo solicitud a: ${targetUrl}`);
    
    // Realizar la solicitud a la API externa
    const apiRes = await axios({
      method: req.method,
      url: targetUrl,
      headers,
      data: req.method === 'POST' ? req.body : undefined,
      timeout: 10000
    });
    
    // Devolver la respuesta de la API externa
    return res.status(apiRes.status).json(apiRes.data);
    
  } catch (error) {
    console.error('[API Proxy] Error:', error.message);
    
    // Manejar errores específicos
    if (error.response) {
      // La solicitud se realizó y el servidor respondió con un código de estado no 2xx
      return res.status(error.response.status).json({
        error: 'Error en la API externa',
        status: error.response.status,
        message: error.message,
        data: error.response.data
      });
    } else if (error.request) {
      // La solicitud se realizó pero no se recibió respuesta
      return res.status(504).json({
        error: 'Sin respuesta de la API externa',
        message: 'La API externa no respondió a tiempo',
        details: error.message
      });
    } else {
      // Algo ocurrió al configurar la solicitud que desencadenó un error
      return res.status(500).json({
        error: 'Error interno del proxy',
        message: error.message
      });
    }
  }
} 