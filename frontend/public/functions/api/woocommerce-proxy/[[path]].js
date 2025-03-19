// Proxy para WooCommerce API
import { handleCors, applyCorsHeaders } from '../cors-middleware';
import config from '../../../config.js';

export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Obtener la ruta de la URL
    const url = new URL(request.url);
    const path = params.path ? params.path.join('/') : '';
    const searchParams = url.searchParams;
    
    // Construir la URL de WooCommerce
    const perPage = searchParams.get('per_page') || '10';
    const page = searchParams.get('page') || '1';
    
    // Usar valores de configuración centralizada o variables de entorno
    const wcApiUrl = env.WC_API_URL || config.WC_API_URL;
    const wooCommerceKey = env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY;
    const wooCommerceSecret = env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET;
    
    let wcUrl = `${wcApiUrl}/${path}?consumer_key=${wooCommerceKey}&consumer_secret=${wooCommerceSecret}&per_page=${perPage}&page=${page}`;
    
    // Agregar parámetros adicionales si hay
    for (const [key, value] of searchParams.entries()) {
      if (!['path', 'per_page', 'page'].includes(key)) {
        wcUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    }
    
    console.log(`Proxy WooCommerce - Solicitando: ${wcUrl}`);
    
    // Realizar la solicitud a WooCommerce con un tiempo de espera razonable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), config.API_TIMEOUT || 60000); // 60 segundos por defecto
    
    const response = await fetch(wcUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Cloudflare Workers',
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    }).finally(() => {
      clearTimeout(timeoutId);
    });
    
    // Verificar si la respuesta es correcta
    if (!response.ok) {
      console.error(`Error en la respuesta de WooCommerce: ${response.status} ${response.statusText}`);
      
      // Intentar leer la respuesta como texto para diagnóstico
      const responseText = await response.text();
      console.error(`Contenido de la respuesta: ${responseText.substring(0, 200)}...`);
      
      // Si WooCommerce devuelve un error 404, devolver una respuesta con datos vacíos
      if (response.status === 404) {
        return new Response(JSON.stringify({ 
          error: 'Not found',
          message: 'No se encontraron resultados',
          status: 404,
          data: []
        }), {
          status: 404, // Devolver código 404 real
          headers: applyCorsHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }, request)
        });
      }
      
      // Si es otro tipo de error, devolver la respuesta de error
      return new Response(JSON.stringify({ 
        error: 'WooCommerce API error',
        message: `Error al consultar WooCommerce: ${response.status} ${response.statusText}`,
        originalResponse: responseText.substring(0, 500),
        status: response.status
      }), {
        status: response.status, // Devolver el código de estado real
        headers: applyCorsHeaders({
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }, request)
      });
    }
    
    // Obtener los datos de la respuesta
    let responseData;
    
    // Verificar si es una respuesta JSON válida
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      try {
        responseData = await response.json();
      } catch (error) {
        console.error('Error al parsear la respuesta JSON de WooCommerce:', error);
        
        // Si la respuesta no es JSON válido, obtener el texto
        const text = await response.text();
        
        // Si es HTML, probablemente es un error
        if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
          return new Response(JSON.stringify({ 
            error: 'Invalid JSON response',
            message: 'WooCommerce devolvió una respuesta HTML en lugar de JSON',
            status: 500,
            data: []
          }), {
            status: 200, // Devolvemos 200 para no interrumpir la navegación del cliente
            headers: applyCorsHeaders({
              'Content-Type': 'application/json',
              'Cache-Control': 'no-cache, no-store, must-revalidate'
            }, request)
          });
        }
        
        // Si no es HTML, devolver como texto
        return new Response(JSON.stringify({ 
          error: 'Invalid JSON response',
          message: 'La respuesta de WooCommerce no es un JSON válido',
          text: text.substring(0, 200) + '...',
          status: 500,
          data: []
        }), {
          status: 200, // Devolvemos 200 para no interrumpir la navegación del cliente
          headers: applyCorsHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }, request)
        });
      }
    } else {
      // Si no es JSON, obtener como texto
      const text = await response.text();
      
      // Si es HTML, probablemente es un error
      if (text.includes('<!DOCTYPE html>') || text.includes('<html>')) {
        return new Response(JSON.stringify({ 
          error: 'Invalid response type',
          message: 'WooCommerce devolvió una respuesta HTML en lugar de JSON',
          status: 500,
          data: []
        }), {
          status: 200, // Devolvemos 200 para no interrumpir la navegación del cliente
          headers: applyCorsHeaders({
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache, no-store, must-revalidate'
          }, request)
        });
      }
      
      // Si no es HTML, devolver como texto
      responseData = text;
    }
    
    // Crear la respuesta con los datos
    return new Response(JSON.stringify(responseData), {
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': `public, max-age=${config.CACHE_MAX_AGE || 60}, stale-while-revalidate=${config.STALE_WHILE_REVALIDATE || 600}`
      }, request)
    });
    
  } catch (error) {
    console.error('Error en el proxy de WooCommerce:', error);
    
    // Detectar si es un error de timeout
    const isTimeout = error.name === 'AbortError';
    const errorMessage = isTimeout ? 
      'La solicitud a WooCommerce excedió el tiempo de espera' : 
      `Error en el proxy: ${error.message}`;
    
    // Devolver una respuesta de error
    return new Response(JSON.stringify({ 
      error: isTimeout ? 'Timeout error' : 'WooCommerce proxy error',
      message: errorMessage,
      data: []
    }), {
      status: isTimeout ? 504 : 500, // Gateway Timeout o Internal Server Error
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate'
      }, request)
    });
  }
} 