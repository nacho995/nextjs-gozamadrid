/**
 * Proxy para servicios externos
 * 
 * Esta función maneja solicitudes proxy para servicios externos como WooCommerce,
 * WordPress REST API y MongoDB, añadiendo las credenciales necesarias y
 * evitando problemas de CORS.
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  const params = url.searchParams;
  
  // Obtener el servicio a proxear
  const service = params.get('service');
  const resource = params.get('resource');
  
  // Log para depuración
  console.log(`[PROXY] Solicitud recibida para servicio: ${service}, recurso: ${resource}`);
  
  // Validar parámetros requeridos
  if (!service) {
    return new Response(JSON.stringify({ error: 'Parámetro service requerido' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  // Determinar la URL base según el servicio
  let baseUrl = '';
  const headers = new Headers();
  
  if (service === 'woocommerce') {
    const WC_API_URL = env.WC_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';
    const WC_KEY = env.WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
    const WC_SECRET = env.WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
    
    // Construir URL de WooCommerce
    baseUrl = WC_API_URL;
    
    // Si resource no tiene el prefijo, añadirlo
    let resourcePath = resource || '';
    
    // Añadir parámetros de autenticación
    const authParams = new URLSearchParams({
      consumer_key: WC_KEY,
      consumer_secret: WC_SECRET
    });
    
    // Copiar todos los otros parámetros excepto 'service' y 'resource'
    for (const [key, value] of params.entries()) {
      if (key !== 'service' && key !== 'resource') {
        authParams.append(key, value);
      }
    }
    
    // Construir URL final
    const finalUrl = `${baseUrl}/${resourcePath}?${authParams.toString()}`;
    console.log(`[PROXY] URL de WooCommerce: ${finalUrl}`);
    
    try {
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Workers',
          'Accept': 'application/json'
        }
      });
      
      // Verificar respuesta antes de devolverla
      if (!response.ok) {
        console.error(`[PROXY] Error de WooCommerce: ${response.status} - ${response.statusText}`);
        const errorText = await response.text();
        console.error(`[PROXY] Cuerpo del error: ${errorText}`);
        
        return new Response(JSON.stringify({ 
          error: `Error del servidor WooCommerce: ${response.status}`,
          details: errorText
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
      
      // Devolver la respuesta con cabeceras CORS
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
        }
      });
      
    } catch (error) {
      console.error(`[PROXY] Error al procesar solicitud a WooCommerce:`, error);
      
      return new Response(JSON.stringify({ 
        error: 'Error de conexión con WooCommerce',
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
  else if (service === 'wordpress') {
    // Implementación para WordPress REST API
    const WP_API_URL = env.WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';
    
    // Construir URL de WordPress
    baseUrl = WP_API_URL;
    
    // Si resource no tiene el prefijo, añadirlo
    let resourcePath = resource || '';
    
    // Crear parámetros para WordPress
    const wpParams = new URLSearchParams();
    
    // Copiar todos los otros parámetros excepto 'service' y 'resource'
    for (const [key, value] of params.entries()) {
      if (key !== 'service' && key !== 'resource') {
        wpParams.append(key, value);
      }
    }
    
    // Construir URL final
    const finalUrl = `${baseUrl}/${resourcePath}?${wpParams.toString()}`;
    console.log(`[PROXY] URL de WordPress: ${finalUrl}`);
    
    try {
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Workers',
          'Accept': 'application/json'
        }
      });
      
      // Verificar respuesta
      if (!response.ok) {
        console.error(`[PROXY] Error de WordPress: ${response.status} - ${response.statusText}`);
        return new Response(JSON.stringify({ 
          error: `Error del servidor WordPress: ${response.status}`
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
      
      // Devolver la respuesta con cabeceras CORS
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=300, stale-while-revalidate=600'
        }
      });
      
    } catch (error) {
      console.error(`[PROXY] Error al procesar solicitud a WordPress:`, error);
      
      return new Response(JSON.stringify({ 
        error: 'Error de conexión con WordPress',
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
  else if (service === 'mongodb') {
    // Implementación para MongoDB API
    const MONGODB_API_URL = env.MONGODB_API_URL || 'https://goza-madrid.onrender.com';
    
    // Construir URL de MongoDB
    baseUrl = MONGODB_API_URL;
    
    // Si resource no tiene el prefijo, añadirlo
    let resourcePath = resource || '';
    
    // Crear parámetros para MongoDB
    const mongoParams = new URLSearchParams();
    
    // Copiar todos los otros parámetros excepto 'service' y 'resource'
    for (const [key, value] of params.entries()) {
      if (key !== 'service' && key !== 'resource') {
        mongoParams.append(key, value);
      }
    }
    
    // Construir URL final
    const queryString = mongoParams.toString();
    const finalUrl = `${baseUrl}/${resourcePath}${queryString ? '?' + queryString : ''}`;
    console.log(`[PROXY] URL de MongoDB: ${finalUrl}`);
    
    try {
      const response = await fetch(finalUrl, {
        headers: {
          'User-Agent': 'Cloudflare-Workers',
          'Accept': 'application/json'
        }
      });
      
      // Verificar respuesta
      if (!response.ok) {
        console.error(`[PROXY] Error de MongoDB: ${response.status} - ${response.statusText}`);
        return new Response(JSON.stringify({ 
          error: `Error del servidor MongoDB: ${response.status}`
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
      
      // Devolver la respuesta con cabeceras CORS
      return new Response(JSON.stringify(data), {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'public, max-age=60, stale-while-revalidate=300'
        }
      });
      
    } catch (error) {
      console.error(`[PROXY] Error al procesar solicitud a MongoDB:`, error);
      
      return new Response(JSON.stringify({ 
        error: 'Error de conexión con MongoDB',
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
  else {
    // Servicio no soportado
    return new Response(JSON.stringify({ 
      error: `Servicio '${service}' no soportado` 
    }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 