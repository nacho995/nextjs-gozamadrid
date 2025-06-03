export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization, cache-control');
    return res.status(200).end();
  }

  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path;
  
  const wpApiBaseUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';
  const targetUrl = new URL(`${wpApiBaseUrl}/${endpoint}`);
  
  // Copiar los query params de la solicitud original
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      targetUrl.searchParams.append(key, value);
    }
  });

  try {
    // Configurar las opciones de fetch según el método de la solicitud
    const fetchOptions = {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GozaMadrid-Frontend/1.0',
      },
    };
    
    // Si la solicitud es POST, PUT o PATCH, incluir el cuerpo
    if (['POST', 'PUT', 'PATCH'].includes(req.method)) {
      fetchOptions.body = JSON.stringify(req.body);
    }
    
    // Realizar la solicitud
    const response = await fetch(targetUrl.toString(), fetchOptions);
    
    // Intentar obtener los datos como JSON (podría fallar si no es JSON)
    let data;
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    // Manejar errores
    if (!response.ok) {
      console.error('Error en WordPress API:', {
        status: response.status,
        statusText: response.statusText,
        url: targetUrl.toString()
      });
      
      return res.status(response.status).json({
        error: `Error en WordPress API: ${response.status} ${response.statusText}`,
        details: data
      });
    }

    // Devolver los datos con el mismo código de estado
    return res.status(response.status).json(data);
    
  } catch (error) {
    console.error('Error al hacer proxy a WordPress:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor', 
      message: error.message,
      url: targetUrl.toString()
    });
  }
} 