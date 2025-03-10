/**
 * API Proxy para WordPress con reintentos
 */

const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 segundo entre reintentos

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES) => {
  try {
    const response = await fetch(url, options);
    
    // Si es un error 503, intentar de nuevo
    if (response.status === 503 && retries > 0) {
      console.log(`Reintentando petición (${retries} intentos restantes)...`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      console.log(`Error en la petición, reintentando (${retries} intentos restantes)...`);
      await sleep(RETRY_DELAY);
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
};

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
    
    // En producción, obtener todos los posts
    if (process.env.NODE_ENV === 'production' && !queryParams.per_page) {
      queryParams.per_page = 100; // Máximo número de posts por página
    }
    
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
    
    // En producción, obtener todos los productos
    if (process.env.NODE_ENV === 'production' && !queryParams.per_page) {
      queryParams.per_page = 100; // Máximo número de productos por página
    }
    
    // Añadir las claves de API
    url += `?consumer_key=${WC_CONSUMER_KEY}&consumer_secret=${WC_CONSUMER_SECRET}`;
    
    // Añadir otros parámetros de consulta
    Object.entries(queryParams).forEach(([key, value]) => {
      url += `&${key}=${encodeURIComponent(value)}`;
    });
  }
  
  console.log('WordPress Proxy - URL construida:', url);
  
  try {
    // Hacer la solicitud a la API de WordPress con reintentos
    const response = await fetchWithRetry(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });
    
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
    
    // Si después de los reintentos aún tenemos un error
    if (!response.ok) {
      console.error(`WordPress Proxy - Error en la respuesta: ${response.status} ${response.statusText}`);
      
      // Si es un error 503, devolver una respuesta vacía en lugar de un error
      if (response.status === 503) {
        console.log('WordPress Proxy - Servicio no disponible, devolviendo array vacío');
        return res.status(200).json([]);
      }
      
      // Para otros errores, intentar leer el cuerpo del error
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
    
    // En producción, si hay más páginas, obtenerlas todas
    if (process.env.NODE_ENV === 'production' && totalPages > 1) {
      const allData = [...(Array.isArray(data) ? data : [data])];
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      
      // Obtener todas las páginas restantes en paralelo
      const promises = remainingPages.map(page => {
        const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}`;
        return fetchWithRetry(pageUrl, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        }).then(r => r.json());
      });
      
      const results = await Promise.all(promises);
      results.forEach(pageData => {
        if (Array.isArray(pageData)) {
          allData.push(...pageData);
        }
      });
      
      console.log('WordPress Proxy - Datos totales recibidos:', 
        Array.isArray(allData) ? `Array con ${allData.length} elementos` : 'Objeto singular');
      
      return res.status(200).json(allData);
    }
    
    console.log('WordPress Proxy - Datos recibidos:', 
      Array.isArray(data) ? `Array con ${data.length} elementos` : 'Objeto singular');
    
    // Devolver los datos
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WordPress:', error);
    
    // En caso de error irrecuperable, devolver un array vacío
    console.log('WordPress Proxy - Error irrecuperable, devolviendo array vacío');
    return res.status(200).json([]);
  }
} 