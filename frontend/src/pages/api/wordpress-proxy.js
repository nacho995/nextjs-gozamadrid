/**
 * API Proxy para WordPress con reintentos y obtención de todos los elementos en producción
 */

const MAX_RETRIES = 10;
const INITIAL_RETRY_DELAY = 2000;
const MAX_RETRY_DELAY = 60000;
const EXPONENTIAL_BACKOFF = true;
const MAX_PER_PAGE = 100;
const TIMEOUT = process.env.NODE_ENV === 'production' ? 180000 : 120000; // 3 minutos en producción, 2 minutos en desarrollo

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES, attempt = 1) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
        'Accept': 'application/json',
        'Cache-Control': process.env.NODE_ENV === 'production' 
          ? 'public, max-age=60, stale-while-revalidate=600'
          : 'no-cache, no-store, must-revalidate',
        'Pragma': process.env.NODE_ENV === 'production' ? undefined : 'no-cache',
        'Expires': process.env.NODE_ENV === 'production' ? undefined : '0'
      }
    });

    clearTimeout(timeoutId);
    
    // Si es un error 503, 502, 504 o 404, intentar de nuevo con backoff exponencial
    if ((response.status === 503 || response.status === 502 || response.status === 504 || response.status === 404) && retries > 0) {
      const delay = EXPONENTIAL_BACKOFF 
        ? Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY)
        : INITIAL_RETRY_DELAY;
      
      console.log(`[WordPress Proxy] Error ${response.status} - Reintentando (${retries} intentos restantes) después de ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[WordPress Proxy] Timeout - La solicitud tardó demasiado');
      if (retries > 0) {
        console.log(`[WordPress Proxy] Reintentando después del timeout...`);
        return fetchWithRetry(url, options, retries - 1, attempt + 1);
      }
      throw new Error('Timeout - La solicitud tardó demasiado');
    }

    if (retries > 0) {
      const delay = EXPONENTIAL_BACKOFF 
        ? Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY)
        : INITIAL_RETRY_DELAY;
      
      console.log(`[WordPress Proxy] Error en la petición: ${error.message} - Reintentando (${retries} intentos restantes) después de ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    throw error;
  }
};

export default async function handler(req, res) {
  // Configurar headers CORS y caché para producción
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (process.env.NODE_ENV === 'production') {
    res.setHeader('Cache-Control', 'public, max-age=60, stale-while-revalidate=600');
  } else {
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  }

  const { path, endpoint, ...queryParams } = req.query;
  
  console.log('WordPress Proxy - Parámetros recibidos:', { path, endpoint, queryParams });
  
  // Claves de API de WooCommerce
  const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_75c5940bfae6a9dd63f1489da71e43b576999633';
  const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_f194d11b41ca92cdd356145705fede711cd233e5';
  
  // Determinar qué API usar (WooCommerce o WordPress)
  let baseUrl = '';
  let url = '';
  
  // En producción, siempre intentamos obtener el máximo de elementos por página
  if (process.env.NODE_ENV === 'production' && !queryParams.per_page) {
    queryParams.per_page = MAX_PER_PAGE;
  }
  
  if (endpoint === 'wp') {
    // API de WordPress (posts, etc.)
    baseUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2';
    url = `${baseUrl}/${path || 'posts'}`;
    
    // Añadir parámetros de consulta
    const queryString = Object.entries(queryParams)
      .map(([key, value]) => `${key}=${encodeURIComponent(value)}`)
      .join('&');
    
    if (queryString) {
      url += `?${queryString}`;
    }
  } else {
    // API de WooCommerce (productos)
    baseUrl = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
    url = `${baseUrl}/${path || 'products'}`;
    
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
        'Cache-Control': process.env.NODE_ENV === 'production' 
          ? 'public, max-age=60, stale-while-revalidate=600'
          : 'no-cache, no-store, must-revalidate',
        'Pragma': process.env.NODE_ENV === 'production' ? undefined : 'no-cache',
        'Expires': process.env.NODE_ENV === 'production' ? undefined : '0',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
        'Accept': 'application/json'
      }
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
      console.error(`[WordPress Proxy] Error en la respuesta después de ${MAX_RETRIES} intentos: ${response.status} ${response.statusText}`);
      
      // Si es un error 503, 502 o 404, devolver una respuesta vacía
      if (response.status === 503 || response.status === 502 || response.status === 404) {
        console.log('[WordPress Proxy] Servicio no disponible después de todos los reintentos, devolviendo array vacío');
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
    
    // En producción, obtener todas las páginas si hay más de una y no se especificó una página específica
    if (process.env.NODE_ENV === 'production' && totalPages > 1 && !queryParams.page) {
      console.log(`WordPress Proxy - Obteniendo todas las páginas (${totalPages} páginas en total)`);
      
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const pagePromises = remainingPages.map(async (page) => {
        const pageUrl = `${url}${url.includes('?') ? '&' : '?'}page=${page}`;
        const pageResponse = await fetchWithRetry(pageUrl, {
          headers: {
            'Cache-Control': process.env.NODE_ENV === 'production' 
              ? 'public, max-age=60, stale-while-revalidate=600'
              : 'no-cache, no-store, must-revalidate',
            'Pragma': process.env.NODE_ENV === 'production' ? undefined : 'no-cache',
            'Expires': process.env.NODE_ENV === 'production' ? undefined : '0',
            'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
            'Accept': 'application/json'
          }
        });
        
        if (!pageResponse.ok) {
          console.error(`Error al obtener página ${page}: ${pageResponse.status}`);
          return [];
        }
        
        const pageData = await pageResponse.json();
        return Array.isArray(pageData) ? pageData : [pageData];
      });
      
      const additionalData = await Promise.allSettled(pagePromises);
      additionalData.forEach(result => {
        if (result.status === 'fulfilled') {
          data.push(...result.value);
        } else {
          console.error('Error al obtener página adicional:', result.reason);
        }
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