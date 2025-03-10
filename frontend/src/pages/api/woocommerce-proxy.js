/**
 * API Proxy para WooCommerce con reintentos
 */

const MAX_RETRIES = 8;
const INITIAL_RETRY_DELAY = 1000;
const MAX_RETRY_DELAY = 32000;
const EXPONENTIAL_BACKOFF = true;

const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fetchWithRetry = async (url, options, retries = MAX_RETRIES, attempt = 1) => {
  try {
    const response = await fetch(url, {
      ...options,
      timeout: 60000 // 60 segundos
    });
    
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
    const NEXT_PUBLIC_WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_NEXT_PUBLIC_WOO_COMMERCE_KEY;
    const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;
    
    // Construir la URL base de WooCommerce
    let wooCommerceUrl = `https://realestategozamadrid.com/wp-json/wc/v3/${path}?consumer_key=${NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
    
    // En producción, siempre intentamos obtener el máximo de elementos por página
    if (process.env.NODE_ENV === 'production' && !queryParams.per_page) {
      queryParams.per_page = 100; // Máximo permitido por WooCommerce
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
    
    if (!response.ok) {
      console.error(`[WooCommerce Proxy] Error en la respuesta después de ${MAX_RETRIES} intentos: ${response.status} ${response.statusText}`);
      console.error('[WooCommerce Proxy] URL que falló:', wooCommerceUrl.replace(/consumer_secret=([^&]*)/, 'consumer_secret=XXXXX'));
      
      // Si es un error 503 o 502, devolver un array vacío
      if (response.status === 503 || response.status === 502) {
        console.log('[WooCommerce Proxy] Servicio no disponible después de todos los reintentos, devolviendo array vacío');
        return res.status(200).json([]);
      }
      
      // Intentar leer el cuerpo del error
      try {
        const errorBody = await response.text();
        console.error('[WooCommerce Proxy] Cuerpo del error:', errorBody);
      } catch (e) {
        console.error('[WooCommerce Proxy] No se pudo leer el cuerpo del error');
      }
      
      throw new Error(`Error ${response.status} al conectar con WooCommerce`);
    }
    
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('[WooCommerce Proxy] Error:', error);
    // En caso de error irrecuperable, devolver un array vacío
    return res.status(200).json([]);
  }
} 