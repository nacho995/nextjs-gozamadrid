/**
 * Proxy específico para WooCommerce
 * 
 * Este archivo maneja las solicitudes a WooCommerce API, añadiendo
 * las credenciales necesarias y evitando problemas CORS
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;
  
  // Manejar CORS para solicitudes preflight
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400",
      }
    });
  }
  
  console.log(`[WOOCOMMERCE-PROXY] Solicitud recibida: ${url.pathname}${url.search}`);
  
  // Obtener el endpoint solicitado (products, orders, etc.)
  const endpoint = params.get('endpoint') || 'products';
  const page = params.get('page') || '1';
  const perPage = params.get('per_page') || '100';
  
  // Configuración para WooCommerce
  const WC_API_URL = env.WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
  const WC_KEY = env.WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
  const WC_SECRET = env.WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
  
  // Construir la URL para la solicitud a WooCommerce
  const woocommerceUrl = new URL(`${WC_API_URL}/${endpoint}`);
  
  // Añadir las credenciales
  woocommerceUrl.searchParams.append('consumer_key', WC_KEY);
  woocommerceUrl.searchParams.append('consumer_secret', WC_SECRET);
  
  // Añadir los parámetros de paginación
  woocommerceUrl.searchParams.append('page', page);
  woocommerceUrl.searchParams.append('per_page', perPage);
  
  // Copiar todos los otros parámetros excepto 'endpoint', 'page', 'per_page'
  for (const [key, value] of params.entries()) {
    if (!['endpoint', 'page', 'per_page'].includes(key)) {
      woocommerceUrl.searchParams.append(key, value);
    }
  }
  
  console.log(`[WOOCOMMERCE-PROXY] Solicitando a WooCommerce: ${woocommerceUrl.toString()}`);
  
  try {
    // Realizar la solicitud a la API de WooCommerce con un timeout razonable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
    
    const response = await fetch(woocommerceUrl.toString(), {
      method: request.method,
      headers: {
        'User-Agent': 'Cloudflare-Workers',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Verificar si la respuesta es correcta
    if (!response.ok) {
      console.error(`[WOOCOMMERCE-PROXY] Error: ${response.status} ${response.statusText}`);
      
      // Intentar leer el cuerpo del error para diagnóstico
      const errorBody = await response.text();
      console.error(`[WOOCOMMERCE-PROXY] Detalle del error: ${errorBody}`);
      
      return new Response(JSON.stringify({
        error: `Error en la API de WooCommerce: ${response.status}`,
        message: response.statusText
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        }
      });
    }
    
    // Leer la respuesta como JSON
    const data = await response.json();
    
    // Devolver la respuesta con cabeceras CORS adecuadas
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error(`[WOOCOMMERCE-PROXY] Error en la solicitud:`, error);
    
    return new Response(JSON.stringify({
      error: 'Error al procesar la solicitud a WooCommerce',
      message: error.message
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 