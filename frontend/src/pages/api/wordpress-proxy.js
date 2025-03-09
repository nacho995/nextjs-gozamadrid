/**
 * API Proxy para WordPress simplificado
 */
export default async function handler(req, res) {
  const { path, endpoint, ...queryParams } = req.query;
  
  console.log('WordPress Proxy - Parámetros recibidos:', { path, endpoint, queryParams });
  
  // Claves de API de WooCommerce
  const WC_CONSUMER_KEY = 'ck_75c5940bfae6a9dd63f1489da71e43b576999633';
  const WC_CONSUMER_SECRET = 'cs_f194d11b41ca92cdd356145705fede711cd233e5';
  
  // Determinar qué API usar (WooCommerce o WordPress)
  let baseUrl = 'https://realestategozamadrid.com/wp-json/';
  let url = '';
  
  if (endpoint === 'wp') {
    // API de WordPress (posts, etc.)
    baseUrl += 'wp/v2/';
    url = `${baseUrl}${path || 'posts'}`;
    
    // Añadir parámetros de consulta
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
  } else {
    // API de WooCommerce (productos)
    baseUrl += 'wc/v3/';
    url = `${baseUrl}${path || 'products'}`;
    
    // Añadir las claves de API
    url += `?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`;
    
    // Añadir otros parámetros de consulta
    Object.entries(queryParams).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });
  }
  
  console.log('WordPress Proxy - URL construida:', url);
  
  try {
    // Hacer la solicitud a la API de WordPress
    const response = await fetch(url);
    
    console.log('WordPress Proxy - Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    // Obtener los headers para el total de páginas
    const totalPages = response.headers.get('X-WP-TotalPages');
    if (totalPages) {
      res.setHeader('X-WP-TotalPages', totalPages);
    }
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`WordPress Proxy - Error en la respuesta: ${response.status} ${response.statusText}`);
      
      // Intentar leer el cuerpo del error
      try {
        const errorText = await response.text();
        console.error('WordPress Proxy - Cuerpo del error:', errorText);
      } catch (e) {
        console.error('WordPress Proxy - No se pudo leer el cuerpo del error');
      }
      
      return res.status(response.status).json({ 
        error: `Error al obtener datos de WordPress: ${response.status}`,
        message: response.statusText
      });
    }
    
    // Obtener los datos de la respuesta
    const data = await response.json();
    
    console.log('WordPress Proxy - Datos recibidos:', 
      Array.isArray(data) ? `Array con ${data.length} elementos` : 'Objeto singular');
    
    // Devolver los datos
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WordPress:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message
    });
  }
} 