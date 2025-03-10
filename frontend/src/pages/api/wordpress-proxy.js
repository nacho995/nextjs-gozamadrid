/**
 * API Proxy para WordPress con reintentos y obtención de todos los elementos en producción
 */

const MAX_RETRIES = 5;
const RETRY_DELAY = 2000; // 2 segundos entre reintentos
const EXPONENTIAL_BACKOFF = true; // Nueva constante para backoff exponencial
const MAX_PER_PAGE = 100; // Máximo permitido por WordPress

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES, attempt = 1) => {
  try {
    const response = await fetch(url, options);
    
    // Si es un error 503, intentar de nuevo con backoff exponencial
    if (response.status === 503 && retries > 0) {
      const delay = EXPONENTIAL_BACKOFF ? RETRY_DELAY * Math.pow(2, attempt - 1) : RETRY_DELAY;
      console.log(`Reintentando petición (${retries} intentos restantes) después de ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    
    return response;
  } catch (error) {
    if (retries > 0) {
      const delay = EXPONENTIAL_BACKOFF ? RETRY_DELAY * Math.pow(2, attempt - 1) : RETRY_DELAY;
      console.log(`Error en la petición, reintentando (${retries} intentos restantes) después de ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
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
  
  // En producción, siempre intentamos obtener el máximo de elementos por página
  if (process.env.NODE_ENV === 'production') {
    queryParams.per_page = MAX_PER_PAGE;
  }
  
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
    // Hacer la solicitud a la API de WordPress con reintentos
    const response = await fetchWithRetry(url, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
        'Accept': 'application/json'
      },
      timeout: 30000 // 30 segundos de timeout
    });
    
    console.log('WordPress Proxy - Respuesta recibida:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries([...response.headers.entries()])
    });
    
    // Obtener los headers para el total de páginas
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
    
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
    let data = await response.json();
    data = Array.isArray(data) ? data : [data];
    
    // En producción, obtener todas las páginas si hay más de una
    if (process.env.NODE_ENV === 'production' && totalPages > 1) {
      console.log(`WordPress Proxy - Obteniendo todas las páginas (${totalPages} páginas en total)`);
      
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const pagePromises = remainingPages.map(async (page) => {
        const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}`;
        const pageResponse = await fetchWithRetry(pageUrl, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        if (!pageResponse.ok) {
          console.error(`Error al obtener página ${page}: ${pageResponse.status}`);
          return [];
        }
        
        const pageData = await pageResponse.json();
        return Array.isArray(pageData) ? pageData : [pageData];
      });
      
      const additionalData = await Promise.all(pagePromises);
      additionalData.forEach(pageData => {
        data.push(...pageData);
      });
    }
    
    console.log(`WordPress Proxy - Total de elementos obtenidos: ${data.length}`);
    
    if (totalItems) {
      res.setHeader('X-WP-Total', totalItems);
    }
    if (totalPages) {
      res.setHeader('X-WP-TotalPages', totalPages);
    }
    
    // Devolver los datos
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WordPress:', error);
    
    // En caso de error irrecuperable, devolver un array vacío
    console.log('WordPress Proxy - Error irrecuperable, devolviendo array vacío');
    return res.status(200).json([]);
  }
} 