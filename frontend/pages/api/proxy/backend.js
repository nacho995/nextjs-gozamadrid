import config from '@/config/config';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept, X-Requested-With, Origin, X-Api-Key');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Obtener la ruta relativa (todo lo que viene después de /api/proxy/backend)
  const path = req.url.replace(/^\/api\/proxy\/backend\/?/, '');
  // Usar HTTP que será redirigido a HTTPS por el backend
  const targetUrl = `${config.BACKEND_API_URL || 'http://api.realestategozamadrid.com/api'}/${path}`;
  
  console.log(`[Proxy Backend] Redirigiendo a: ${targetUrl}`);
  
  try {
    // Preparar headers para reenvío
    const headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'GozaMadrid/1.0',
      'Origin': req.headers.origin || 'https://www.realestategozamadrid.com'
    };
    
    // Transferir headers de autorización si existen
    if (req.headers.authorization) {
      headers.Authorization = req.headers.authorization;
    }
    
    // Transferir la cookie si existe
    if (req.headers.cookie) {
      headers.Cookie = req.headers.cookie;
    }
    
    const fetchOptions = {
      method: req.method,
      headers: headers,
      redirect: 'follow' // Permite seguir redirecciones como la de HTTP a HTTPS
    };
    
    // Añadir cuerpo de la solicitud si es necesario
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    console.log(`[Proxy Backend] Enviando solicitud a ${targetUrl} con método ${req.method}`);
    const response = await fetch(targetUrl, fetchOptions);
    console.log(`[Proxy Backend] Respuesta recibida: ${response.status} ${response.statusText}`);
    
    if (response.redirected) {
      console.log(`[Proxy Backend] Redirección detectada a: ${response.url}`);
    }
    
    // Si la respuesta no es OK, maneja el error
    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Proxy Backend] Error (${response.status}): ${errorText.substring(0, 200)}`);
      return res.status(response.status).json({
        error: `Error del backend: ${response.status} ${response.statusText}`,
        details: errorText
      });
    }
    
    // Intenta parsear como JSON primero
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }
    
    // Transfiere los encabezados de respuesta relevantes
    const allowedHeaders = [
      'content-type',
      'cache-control',
      'content-disposition'
    ];
    
    allowedHeaders.forEach(header => {
      const value = response.headers.get(header);
      if (value) {
        res.setHeader(header, value);
      }
    });
    
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('[Proxy Backend] Error de conexión:', error);
    return res.status(500).json({
      error: 'Error de conexión con el servidor backend',
      message: error.message
    });
  }
} 