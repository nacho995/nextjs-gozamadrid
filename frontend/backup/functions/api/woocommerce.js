// Proxy mejorado para WooCommerce API
import { handleCors, applyCorsHeaders } from './cors-middleware';
import config from '../../config.js';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  // Obtener los parámetros de la solicitud
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Usar configuración centralizada o valores de env
  const wcBase = env.WC_API_URL || config.WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
  const wcKey = env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
  const wcSecret = env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
  
  // Determinar el recurso solicitado (products, orders, etc.)
  const resource = searchParams.get('resource') || 'products';
  
  // Construir parámetros de consulta
  const queryParams = new URLSearchParams();
  
  // Añadir credenciales OAuth
  queryParams.append('consumer_key', wcKey);
  queryParams.append('consumer_secret', wcSecret);
  
  // Parámetros comunes para la mayoría de solicitudes
  if (searchParams.has('per_page')) {
    queryParams.append('per_page', searchParams.get('per_page'));
  } else {
    queryParams.append('per_page', '10'); // valor predeterminado
  }
  
  if (searchParams.has('page')) {
    queryParams.append('page', searchParams.get('page'));
  }
  
  if (searchParams.has('id')) {
    queryParams.append('id', searchParams.get('id'));
  }
  
  // Añadir filtros específicos para productos inmobiliarios
  for (const param of ['status', 'featured', 'category', 'tag', 'on_sale', 'min_price', 'max_price', 'order', 'orderby']) {
    if (searchParams.has(param)) {
      queryParams.append(param, searchParams.get(param));
    }
  }
  
  // Copiar otros parámetros que podrían ser útiles
  for (const [key, value] of searchParams.entries()) {
    if (!['resource', 'per_page', 'page', 'id', 'status', 'featured', 'category', 'tag', 'on_sale', 'min_price', 'max_price', 'order', 'orderby'].includes(key)) {
      queryParams.append(key, value);
    }
  }
  
  // Construir la URL final
  const wcUrl = `${wcBase}/${resource}?${queryParams.toString()}`;
  console.log(`Proxy WooCommerce - Solicitando: ${wcUrl}`);
  
  try {
    // Realizar la solicitud a WooCommerce con un timeout razonable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
    
    const response = await fetch(wcUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare Worker - GozaMadrid',
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Verificar la respuesta
    if (!response.ok) {
      console.error(`Error en WooCommerce: ${response.status}`);
      const errorText = await response.text();
      
      return new Response(JSON.stringify({
        error: true,
        message: `Error al obtener datos de WooCommerce: ${response.status}`,
        url: wcUrl,
        details: errorText.substring(0, 200),
        data: []
      }), {
        status: 200, // Devolver 200 para no interrumpir la navegación
        headers: applyCorsHeaders({
          'Content-Type': 'application/json'
        }, request)
      });
    }
    
    // Obtener los datos
    const data = await response.json();
    
    // Obtener headers importantes para paginación
    const totalItems = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    // Crear headers para la respuesta
    const responseHeaders = applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60'
    }, request);
    
    // Añadir headers de paginación si existen
    if (totalItems) responseHeaders.set('X-WP-Total', totalItems);
    if (totalPages) responseHeaders.set('X-WP-TotalPages', totalPages);
    
    return new Response(JSON.stringify(data), {
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    
    return new Response(JSON.stringify({
      error: true,
      message: `Error de servidor: ${error.message}`,
      url: wcUrl,
      data: []
    }), {
      status: 200, // Devolver 200 para no interrumpir la navegación
      headers: applyCorsHeaders({
        'Content-Type': 'application/json'
      }, request)
    });
  }
} 