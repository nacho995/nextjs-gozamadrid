// Proxy combinado para múltiples servicios externos
import { handleCors, applyCorsHeaders } from './cors-middleware';
import config from '../../config.js';

// Función para obtener la configuración del servicio
function getServiceConfig(serviceName, env) {
  // Configuraciones con prioridad para variables de entorno
  const serviceConfig = {
    wordpress: {
      baseUrl: env.WP_API_URL || config.WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2',
      defaultResource: 'posts',
      defaultPerPage: 10,
      requiresAuth: false
    },
    woocommerce: {
      baseUrl: env.WC_API_URL || config.WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3',
      defaultResource: 'products',
      defaultPerPage: 10,
      requiresAuth: true,
      auth: {
        consumer_key: env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY,
        consumer_secret: env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET
      }
    }
  };
  
  return serviceConfig[serviceName] || serviceConfig.wordpress;
}

export async function onRequest(context) {
  const { request, env } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Obtener parámetros de la solicitud
    const url = new URL(request.url);
    const searchParams = url.searchParams;
    
    // Determinar qué servicio se está solicitando
    const service = searchParams.get('service') || 'wordpress';
    const serviceConfig = getServiceConfig(service, env);
    
    // Verificar que tenemos las credenciales para WooCommerce si es necesario
    if (service === 'woocommerce' && (!serviceConfig.auth.consumer_key || !serviceConfig.auth.consumer_secret)) {
      return new Response(JSON.stringify({
        error: true,
        message: 'Faltan credenciales de WooCommerce',
        detail: 'Por favor, configure WOO_COMMERCE_KEY y WOO_COMMERCE_SECRET como variables de entorno'
      }), {
        status: 500,
        headers: applyCorsHeaders({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }, request)
      });
    }
    
    // Obtener el recurso
    const resource = searchParams.get('resource') || serviceConfig.defaultResource;
    
    // Construir parámetros de consulta
    const queryParams = new URLSearchParams();
    
    // Añadir autenticación si es necesario
    if (serviceConfig.requiresAuth && serviceConfig.auth) {
      for (const [key, value] of Object.entries(serviceConfig.auth)) {
        queryParams.append(key, value);
      }
    }
    
    // Añadir parámetros comunes
    if (searchParams.has('per_page')) {
      queryParams.append('per_page', searchParams.get('per_page'));
    } else {
      queryParams.append('per_page', serviceConfig.defaultPerPage.toString());
    }
    
    // Añadir el resto de parámetros
    for (const [key, value] of searchParams.entries()) {
      if (!['service', 'resource', 'per_page'].includes(key)) {
        queryParams.append(key, value);
      }
    }
    
    // Para WordPress específicamente, incluir _embed
    if (service === 'wordpress') {
      queryParams.append('_embed', 'true');
    }
    
    // Construir URL final
    const apiUrl = `${serviceConfig.baseUrl}/${resource}?${queryParams.toString()}`;
    console.log(`Proxy [${service}] - Solicitando: ${apiUrl}`);
    
    // Realizar la solicitud con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT || 30000);
    
    const response = await fetch(apiUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Cloudflare Worker - GozaMadrid',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Procesar respuesta
    if (!response.ok) {
      console.error(`Error en ${service}: ${response.status}`);
      const errorText = await response.text();
      
      return new Response(JSON.stringify({
        error: true,
        service,
        resource,
        message: `Error al obtener datos: ${response.status}`,
        url: apiUrl,
        details: errorText.substring(0, 200),
        data: []
      }), {
        status: response.status, // Devolver el código de error real
        headers: applyCorsHeaders({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }, request)
      });
    }
    
    // Éxito: procesar los datos
    const data = await response.json();
    
    // Extraer headers importantes
    const totalItems = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    // Construir headers para la respuesta
    const responseHeaders = applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${config.CACHE_MAX_AGE || 60}, stale-while-revalidate=${config.STALE_WHILE_REVALIDATE || 600}`
    }, request);
    
    // Añadir headers de paginación si existen
    if (totalItems) responseHeaders.set('X-WP-Total', totalItems);
    if (totalPages) responseHeaders.set('X-WP-TotalPages', totalPages);
    
    return new Response(JSON.stringify(data), {
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error en el proxy:', error);
    
    const isTimeout = error.name === 'AbortError';
    
    return new Response(JSON.stringify({
      error: true,
      message: `Error de servidor: ${error.message}`,
      data: []
    }), {
      status: isTimeout ? 504 : 500, // Timeout o Error interno
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }, request)
    });
  }
} 