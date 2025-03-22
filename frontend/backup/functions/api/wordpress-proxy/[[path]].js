// Proxy para WordPress API
import { handleCors, applyCorsHeaders } from '../cors-middleware';
import config from '../../../config.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Para solicitudes OPTIONS (preflight CORS)
  if (request.method === 'OPTIONS') {
    return handleCors(request);
  }
  
  // Obtener ruta de la solicitud
  const path = params.path || [];
  const resourcePath = Array.isArray(path) ? path.join('/') : path;
  
  // Obtener parámetros de búsqueda
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  console.log(`WordPress Proxy: /${resourcePath} - Method: ${request.method}`);
  
  try {
    // Usar configuración de entorno o valores centralizados
    const wpApiUrl = env.WP_API_URL || config.WP_API_URL;
    
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
    
    if (searchParams.has('_embed')) {
      queryParams.append('_embed', searchParams.get('_embed'));
    } else {
      // Incluir _embed por defecto para obtener imágenes y metadatos
      queryParams.append('_embed', 'true');
    }
    
    // Determinar el endpoint (wp por defecto)
    const endpoint = searchParams.get('endpoint') || 'wp';
    const baseEndpointUrl = endpoint === 'wp' 
      ? wpApiUrl 
      : `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/${endpoint}/v2`;
    
    // Copiar otros parámetros útiles
    for (const [key, value] of searchParams.entries()) {
      if (!['endpoint', 'resource', 'per_page', 'page', 'slug', 'id', '_embed'].includes(key)) {
        queryParams.append(key, value);
      }
    }
    
    // Construir la URL final
    const finalUrl = `${baseEndpointUrl}/${resourcePath}?${queryParams.toString()}`;
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
        status: 200, // Devolver 200 para aplicación cliente
        headers: applyCorsHeaders({
          'Content-Type': 'application/json'
        }, request)
      });
    }
    
    // Obtener los datos y las cabeceras importantes
    const data = await response.json();
    
    // Extraer cabeceras de paginación
    const responseHeaders = applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': `max-age=${config.CACHE_MAX_AGE}, stale-while-revalidate=${config.STALE_WHILE_REVALIDATE}`
    }, request);
    
    // Agregar las cabeceras de paginación si existen
    const totalItems = response.headers.get('X-WP-Total');
    const totalPages = response.headers.get('X-WP-TotalPages');
    
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
      status: 200, // Devolver 200 para aplicación cliente
      headers: applyCorsHeaders({
        'Content-Type': 'application/json'
      }, request)
    });
  }
} 