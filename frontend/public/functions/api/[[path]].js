// Manejador dinámico FALLBACK para rutas de API que NO están gestionadas por archivos específicos
// Este manejador se ejecuta solo cuando no coincide con una ruta específica en _routes.json
import config from '../../config.js';
import { handleCors, applyCorsHeaders } from './cors-middleware';

export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Obtener la ruta específica
  const path = params.path || [];
  const pathString = Array.isArray(path) ? path.join('/') : path;
  
  // Manejar CORS para todas las peticiones
  const corsResult = handleCors(request);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  
  // Obtener parámetros de la solicitud
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  console.log(`API Fallback (last resort): /${pathString} - Method: ${request.method}`);
  
  // Función para probar que todo funciona
  if (pathString === 'test') {
    return new Response(JSON.stringify({
      message: "API de prueba funcionando correctamente",
      timestamp: new Date().toISOString(),
      path: pathString,
      params: Object.fromEntries([...searchParams.entries()]),
      env: {
        hasWpApiUrl: !!env.WP_API_URL || !!config.WP_API_URL,
        hasWcApiUrl: !!env.WC_API_URL || !!config.WC_API_URL,
        hasWooCommerceKey: !!env.WOO_COMMERCE_KEY || !!config.WOO_COMMERCE_KEY,
        hasWooCommerceSecret: !!env.WOO_COMMERCE_SECRET || !!config.WOO_COMMERCE_SECRET,
        hasMongoDB: !!env.MONGODB_API_URL || !!config.MONGODB_API_URL
      }
    }), {
      headers: applyCorsHeaders({
        'Content-Type': 'application/json'
      }, request)
    });
  }
  
  // WordPress API - rutas alternativas
  if (pathString === 'wordpress' || pathString === 'wp' || pathString.startsWith('wordpress/') || pathString.startsWith('wp/')) {
    console.log('Redirigiendo a manejador de WordPress');
    return handleWordPress(request, env, pathString.replace(/^(wordpress|wp)\//, ''), searchParams);
  }
  
  // WooCommerce API - rutas alternativas
  if (pathString === 'woocommerce' || pathString === 'wc' || pathString.startsWith('woocommerce/') || pathString.startsWith('wc/')) {
    console.log('Redirigiendo a manejador de WooCommerce');
    return handleWooCommerce(request, env, pathString.replace(/^(woocommerce|wc)\//, ''), searchParams);
  }
  
  // Proxy genérico
  if (pathString === 'proxy') {
    const service = searchParams.get('service');
    if (service === 'wordpress' || service === 'wp') {
      return handleWordPress(request, env, searchParams.get('resource') || '', searchParams);
    } else if (service === 'woocommerce' || service === 'wc') {
      return handleWooCommerce(request, env, searchParams.get('resource') || '', searchParams);
    }
    
    // Si no es un servicio reconocido
    return new Response(JSON.stringify({
      message: "Proxy genérico",
      timestamp: new Date().toISOString(),
      service: service || "undefined",
      params: Object.fromEntries([...searchParams.entries()])
    }), {
      headers: applyCorsHeaders({
        'Content-Type': 'application/json'
      }, request)
    });
  }
  
  // Si no coincide con ninguna ruta conocida
  return new Response(JSON.stringify({
    error: true,
    message: `Ruta de API no encontrada: ${pathString}`,
    availableRoutes: [
      '/api/blog - Para obtener blogs',
      '/api/properties - Para obtener propiedades inmobiliarias',
      '/api/wordpress-proxy/posts - Acceso directo a WordPress API',
      '/api/woocommerce-proxy/products - Acceso directo a WooCommerce API',
      '/api/test - Prueba de funcionamiento'
    ],
    documentation: 'https://github.com/username/nextjs-gozamadrid/wiki/API',
    configStatus: {
      hasWordPress: !!env.WP_API_URL || !!config.WP_API_URL,
      hasWooCommerce: !!env.WC_API_URL || !!config.WC_API_URL,
      hasMongoDB: !!env.MONGODB_API_URL || !!config.MONGODB_API_URL
    },
    timestamp: new Date().toISOString()
  }), {
    status: 404,
    headers: applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }, request)
  });
}

// Manejador para WordPress
async function handleWordPress(request, env, resource = '', searchParams) {
  try {
    // Usar configuración del entorno o del archivo centralizado
    const wpApiUrl = env.WP_API_URL || config.WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2';
    
    // Determinar el recurso específico (posts, pages, etc.)
    const resourcePath = resource || searchParams.get('resource') || 'posts';
    
    // Construir parámetros de consulta para WordPress
    const queryParams = new URLSearchParams();
    
    // Agregar parámetros comunes
    if (searchParams.has('per_page')) {
      queryParams.append('per_page', searchParams.get('per_page'));
    } else {
      queryParams.append('per_page', '10');
    }
    
    if (searchParams.has('page')) {
      queryParams.append('page', searchParams.get('page'));
    }
    
    if (searchParams.has('slug')) {
      queryParams.append('slug', searchParams.get('slug'));
    }
    
    if (searchParams.has('id')) {
      queryParams.append('id', searchParams.get('id'));
    }
    
    // Incluir _embed para obtener imágenes y metadatos
    queryParams.append('_embed', 'true');
    
    // Copiar otros parámetros útiles
    for (const [key, value] of searchParams.entries()) {
      if (!['resource', 'service', 'per_page', 'page', 'slug', 'id'].includes(key)) {
        queryParams.append(key, value);
      }
    }
    
    // Construir la URL final
    const finalUrl = `${wpApiUrl}/${resourcePath}?${queryParams.toString()}`;
    console.log(`WordPress API Request: ${finalUrl}`);
    
    // Realizar la solicitud con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare Worker - GozaMadrid',
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Manejar errores de WordPress
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: true,
        message: `Error de WordPress: ${response.status}`,
        details: errorText.substring(0, 200),
        url: finalUrl
      }), {
        status: response.status, // Devolver el código de estado real del error
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }
      });
    }
    
    // Procesamiento exitoso
    const data = await response.json();
    
    // Obtener headers importantes
    const totalItems = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    // Crear respuesta con headers necesarios
    const responseHeaders = applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${config.CACHE_MAX_AGE || 60}, stale-while-revalidate=${config.STALE_WHILE_REVALIDATE || 600}`
    }, request);
    
    if (totalItems) responseHeaders['X-WP-Total'] = totalItems;
    if (totalPages) responseHeaders['X-WP-TotalPages'] = totalPages;
    
    return new Response(JSON.stringify(data), {
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error en WordPress API:', error);
    
    return new Response(JSON.stringify({
      error: true,
      message: `Error al procesar la solicitud: ${error.message}`,
      service: 'wordpress'
    }), {
      status: error.name === 'AbortError' ? 504 : 500, // Timeout o Error interno
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }, request)
    });
  }
}

// Manejador para WooCommerce
async function handleWooCommerce(request, env, resource = '', searchParams) {
  try {
    // Usar configuración del entorno o del archivo centralizado
    const wcApiUrl = env.WC_API_URL || config.WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
    const wooCommerceKey = env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
    const wooCommerceSecret = env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
    
    // Determinar el recurso específico (productos, etc.)
    const resourcePath = resource || searchParams.get('resource') || 'products';
    
    // Construir parámetros de consulta para WooCommerce
    const queryParams = new URLSearchParams();
    
    // Agregar credenciales siempre
    queryParams.append('consumer_key', wooCommerceKey);
    queryParams.append('consumer_secret', wooCommerceSecret);
    
    // Agregar parámetros comunes
    if (searchParams.has('per_page')) {
      queryParams.append('per_page', searchParams.get('per_page'));
    } else {
      queryParams.append('per_page', '10');
    }
    
    if (searchParams.has('page')) {
      queryParams.append('page', searchParams.get('page'));
    }
    
    if (searchParams.has('slug')) {
      queryParams.append('slug', searchParams.get('slug'));
    }
    
    if (searchParams.has('id')) {
      queryParams.append('id', searchParams.get('id'));
    }
    
    // Incluir _embed si está disponible en WooCommerce
    if (searchParams.has('_embed')) {
      queryParams.append('_embed', 'true');
    }
    
    // Copiar otros parámetros útiles
    for (const [key, value] of searchParams.entries()) {
      if (!['resource', 'service', 'per_page', 'page', 'slug', 'id', '_embed'].includes(key)) {
        queryParams.append(key, value);
      }
    }
    
    // Construir la URL final
    const finalUrl = `${wcApiUrl}/${resourcePath}?${queryParams.toString()}`;
    console.log(`WooCommerce API Request: ${finalUrl}`);
    
    // Realizar la solicitud con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);
    
    const response = await fetch(finalUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare Worker - GozaMadrid',
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Manejar errores de WooCommerce
    if (!response.ok) {
      const errorText = await response.text();
      return new Response(JSON.stringify({
        error: true,
        message: `Error de WooCommerce: ${response.status}`,
        details: errorText.substring(0, 200),
        url: finalUrl
      }), {
        status: response.status, // Usar código de error real
        headers: applyCorsHeaders({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-store'
        }, request)
      });
    }
    
    // Procesamiento exitoso
    const data = await response.json();
    
    // Obtener headers importantes
    const totalItems = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
    // Crear respuesta con headers necesarios
    const responseHeaders = applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': `public, max-age=${config.CACHE_MAX_AGE || 60}, stale-while-revalidate=${config.STALE_WHILE_REVALIDATE || 600}`
    }, request);
    
    if (totalItems) responseHeaders['X-WP-Total'] = totalItems;
    if (totalPages) responseHeaders['X-WP-TotalPages'] = totalPages;
    
    return new Response(JSON.stringify(data), {
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('Error en WooCommerce API:', error);
    
    return new Response(JSON.stringify({
      error: true,
      message: `Error al procesar la solicitud: ${error.message}`,
      service: 'woocommerce'
    }), {
      status: error.name === 'AbortError' ? 504 : 500, // Timeout o Error interno
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }, request)
    });
  }
} 