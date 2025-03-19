// Proxy mejorado para WordPress API
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
  
  // Construir la URL para WordPress - usar configuración centralizada
  const wpBase = env.WP_API_URL || config.WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2';
  
  // Determinar el recurso solicitado (posts, pages, media, etc.)
  const resource = searchParams.get('resource') || 'posts';
  
  // Construir parámetros de consulta
  const queryParams = new URLSearchParams();
  
  // Parámetros comunes para la mayoría de solicitudes
  if (searchParams.has('per_page')) {
    queryParams.append('per_page', searchParams.get('per_page'));
  } else {
    queryParams.append('per_page', '10'); // valor predeterminado
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
  
  // Añadir _embed para obtener imágenes y metadatos
  queryParams.append('_embed', 'true');
  
  // Copiar otros parámetros que podrían ser útiles
  for (const [key, value] of searchParams.entries()) {
    if (!['resource', 'per_page', 'page', 'slug', 'id'].includes(key)) {
      queryParams.append(key, value);
    }
  }
  
  // Construir la URL final
  const wpUrl = `${wpBase}/${resource}?${queryParams.toString()}`;
  console.log(`Proxy WordPress - Solicitando: ${wpUrl}`);
  
  try {
    // Realizar la solicitud a WordPress con un timeout razonable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
    
    const response = await fetch(wpUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'Cloudflare Worker - GozaMadrid',
        'Accept': 'application/json'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Verificar la respuesta
    if (!response.ok) {
      console.error(`Error en WordPress: ${response.status}`);
      const errorText = await response.text();
      
      return new Response(JSON.stringify({
        error: true,
        message: `Error al obtener datos de WordPress: ${response.status}`,
        url: wpUrl,
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
    
    // Obtener headers importantes de WordPress para paginación
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
      url: wpUrl,
      data: []
    }), {
      status: 200, // Devolver 200 para no interrumpir la navegación
      headers: applyCorsHeaders({
        'Content-Type': 'application/json'
      }, request)
    });
  }
} 