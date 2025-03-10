/**
 * API Proxy para WooCommerce con reintentos y obtención de todos los elementos en producción
 */

const MAX_RETRIES = 8; // Aumentado de 5 a 8 reintentos
const INITIAL_RETRY_DELAY = 1000; // 1 segundo inicial
const MAX_RETRY_DELAY = 32000; // Máximo 32 segundos entre reintentos
const EXPONENTIAL_BACKOFF = true;
const MAX_PER_PAGE = 100; // Máximo permitido por WooCommerce

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES, attempt = 1) => {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos timeout

    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        ...options.headers,
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)',
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    });

    clearTimeout(timeoutId);
    
    // Si es un error 503 o 502, intentar de nuevo con backoff exponencial
    if ((response.status === 503 || response.status === 502) && retries > 0) {
      const delay = EXPONENTIAL_BACKOFF 
        ? Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY)
        : INITIAL_RETRY_DELAY;
      
      console.log(`[WooCommerce Proxy] Error ${response.status} - Reintentando (${retries} intentos restantes) después de ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    
    return response;
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('[WooCommerce Proxy] Timeout - La solicitud tardó demasiado');
      throw new Error('Timeout - La solicitud tardó demasiado');
    }

    if (retries > 0) {
      const delay = EXPONENTIAL_BACKOFF 
        ? Math.min(INITIAL_RETRY_DELAY * Math.pow(2, attempt - 1), MAX_RETRY_DELAY)
        : INITIAL_RETRY_DELAY;
      
      console.log(`[WooCommerce Proxy] Error en la petición: ${error.message} - Reintentando (${retries} intentos restantes) después de ${delay}ms...`);
      await sleep(delay);
      return fetchWithRetry(url, options, retries - 1, attempt + 1);
    }
    throw error;
  }
};

export default async function handler(req, res) {
  try {
    // Obtener parámetros de la consulta
    const { path = 'products', ...queryParams } = req.query;
    
    // Obtener las claves de WooCommerce
    const WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_75c5940bfae6a9dd63f1489da71e43b576999633';
    const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_f194d11b41ca92cdd356145705fede711cd233e5';
    
    // Construir la URL base de WooCommerce
    let wooCommerceUrl = `https://realestategozamadrid.com/wp-json/wc/v3/${path}?consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
    
    // En producción, siempre intentamos obtener el máximo de elementos por página
    if (process.env.NODE_ENV === 'production' && !queryParams.per_page) {
      queryParams.per_page = MAX_PER_PAGE; // Máximo permitido por WooCommerce
    }
    
    // Añadir parámetros adicionales a la URL
    Object.entries(queryParams).forEach(([key, value]) => {
      if (key !== 'path') {
        wooCommerceUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    console.log('[WooCommerce Proxy] Conectando a WooCommerce:', wooCommerceUrl.replace(/consumer_secret=([^&]*)/, 'consumer_secret=XXXXX'));
    
    // Realizar la solicitud con reintentos
    const response = await fetchWithRetry(wooCommerceUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Node.js API Proxy)'
      }
    });

    // Obtener los headers para el total de páginas
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
    
    // Si después de los reintentos aún tenemos un error
    if (!response.ok) {
      console.error(`[WooCommerce Proxy] Error en la respuesta después de ${MAX_RETRIES} intentos: ${response.status} ${response.statusText}`);
      
      // Si es un error 503 o 502, devolver una respuesta vacía
      if (response.status === 503 || response.status === 502) {
        console.log('[WooCommerce Proxy] Servicio no disponible después de todos los reintentos, devolviendo array vacío');
        return res.status(200).json([]);
      }
      
      // Para otros errores, intentar leer el cuerpo del error
      try {
        const errorText = await response.text();
        console.error('WooCommerce Proxy - Cuerpo del error:', errorText);
      } catch (e) {
        console.error('WooCommerce Proxy - No se pudo leer el cuerpo del error');
      }
      
      return res.status(response.status).json({ 
        error: `Error al obtener datos de WooCommerce: ${response.status}`,
        message: response.statusText
      });
    }
    
    // Obtener los datos de la respuesta
    let data = await response.json();
    data = Array.isArray(data) ? data : [data];
    
    // En producción, obtener todas las páginas si hay más de una y no se especificó una página específica
    if (process.env.NODE_ENV === 'production' && totalPages > 1 && !queryParams.page) {
      console.log(`WooCommerce Proxy - Obteniendo todas las páginas (${totalPages} páginas en total)`);
      
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const pagePromises = remainingPages.map(async (page) => {
        const pageUrl = `${wooCommerceUrl}&page=${page}`;
        const pageResponse = await fetchWithRetry(pageUrl, {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
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
    
    console.log(`WooCommerce Proxy - Total de elementos obtenidos: ${data.length}`);
    
    if (totalItems) {
      res.setHeader('X-WP-Total', totalItems);
    }
    if (totalPages) {
      res.setHeader('X-WP-TotalPages', totalPages);
    }
    
    // Devolver los datos
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WooCommerce:', error);
    
    // En caso de error irrecuperable, devolver un array vacío
    console.log('WooCommerce Proxy - Error irrecuperable, devolviendo array vacío');
    return res.status(200).json([]);
  }
} 