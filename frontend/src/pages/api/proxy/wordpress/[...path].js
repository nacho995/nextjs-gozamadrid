export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    return res.status(200).end();
  }

  const { path } = req.query;
  const endpoint = Array.isArray(path) ? path.join('/') : path;
  
  const targetUrl = new URL(`https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2/${endpoint}`);
  
  // Copiar los query params de la solicitud original
  Object.entries(req.query).forEach(([key, value]) => {
    if (key !== 'path') {
      targetUrl.searchParams.append(key, value);
    }
  });

  try {
    const response = await fetch(targetUrl.toString(), {
      method: req.method,
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

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

    return res.status(200).json(data);
  } catch (error) {
    console.error('Error al hacer proxy a WordPress:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 