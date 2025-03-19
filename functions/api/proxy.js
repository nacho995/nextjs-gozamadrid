/**
 * Proxy genérico para servicios externos
 * 
 * Esta función maneja solicitudes proxy para diferentes servicios como
 * WooCommerce, WordPress, y MongoDB, añadiendo las credenciales necesarias
 * y evitando problemas de CORS.
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
  
  // Obtener el servicio a proxear
  const service = params.get('service');
  const resource = params.get('resource');
  
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
  
  // Variables para la solicitud
  let baseUrl = '';
  let authHeaders = {};
  
  // Configurar solicitud según el servicio
  if (service === 'woocommerce') {
    const WC_API_URL = env.WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
    const WC_KEY = env.WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
    const WC_SECRET = env.WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
    
    // Construir URL para WooCommerce
    baseUrl = `${WC_API_URL}/${resource || 'products'}`;
    
    // Construir los parámetros de autenticación
    const wooParams = new URLSearchParams();
    wooParams.append('consumer_key', WC_KEY);
    wooParams.append('consumer_secret', WC_SECRET);
    
    // Añadir parámetros de paginación por defecto si no están presentes
    if (!params.has('page')) {
      wooParams.append('page', '1');
    }
    
    if (!params.has('per_page')) {
      wooParams.append('per_page', '100');
    }
    
    // Copiar todos los otros parámetros excepto 'service' y 'resource'
    for (const [key, value] of params.entries()) {
      if (key !== 'service' && key !== 'resource') {
        wooParams.append(key, value);
      }
    }
    
    // Construir URL final con parámetros
    baseUrl = `${baseUrl}?${wooParams.toString()}`;
    console.log(`[PROXY] URL de WooCommerce: ${baseUrl}`);
  }
  else if (service === 'wordpress' || service === 'wp') {
    const WP_API_URL = env.WP_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2';
    
    // Construir URL para WordPress
    baseUrl = `${WP_API_URL}/${resource || 'posts'}`;
    
    // Construir los parámetros
    const wpParams = new URLSearchParams();
    
    // Copiar todos los otros parámetros excepto 'service' y 'resource'
    for (const [key, value] of params.entries()) {
      if (key !== 'service' && key !== 'resource') {
        wpParams.append(key, value);
      }
    }
    
    // Construir URL final con parámetros
    if (wpParams.toString()) {
      baseUrl = `${baseUrl}?${wpParams.toString()}`;
    }
    
    console.log(`[PROXY] URL de WordPress: ${baseUrl}`);
  }
  else if (service === 'mongodb') {
    const MONGODB_API_URL = env.MONGODB_API_URL || 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    
    // Construir URL para MongoDB
    baseUrl = `${MONGODB_API_URL}/${resource || ''}`;
    
    // Construir los parámetros
    const mongoParams = new URLSearchParams();
    
    // Copiar todos los otros parámetros excepto 'service' y 'resource'
    for (const [key, value] of params.entries()) {
      if (key !== 'service' && key !== 'resource') {
        mongoParams.append(key, value);
      }
    }
    
    // Construir URL final con parámetros
    if (mongoParams.toString()) {
      baseUrl = `${baseUrl}?${mongoParams.toString()}`;
    }
    
    console.log(`[PROXY] URL de MongoDB: ${baseUrl}`);
  }
  else {
    return new Response(JSON.stringify({ error: `Servicio "${service}" no soportado` }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
  
  try {
    // Realizar la solicitud al servicio externo con un timeout razonable
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
    
    const response = await fetch(baseUrl, {
      method: request.method,
      headers: {
        'User-Agent': 'Cloudflare-Workers',
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...authHeaders
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    // Verificar si la respuesta es correcta
    if (!response.ok) {
      console.error(`[PROXY] Error: ${response.status} ${response.statusText}`);
      
      // Intentar leer el cuerpo del error para diagnóstico
      const errorBody = await response.text();
      console.error(`[PROXY] Detalle del error: ${errorBody}`);
      
      return new Response(JSON.stringify({
        error: `Error en la API: ${response.status}`,
        message: response.statusText,
        service: service
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
    
    // Si es el servicio de MongoDB, añadir mínimamente el tipo a la respuesta
    if (service === 'mongodb') {
      if (Array.isArray(data)) {
        // Procesar mínimamente el array para añadir tipo
        const processedData = data.map(item => ({
          ...item,
          type: 'mongodb',
          source: 'mongodb'
        }));
        
        console.log(`[PROXY] Procesando ${processedData.length} propiedades de MongoDB`);
        
        return new Response(JSON.stringify(processedData), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
          }
        });
      }
      
      // Para objetos individuales
      if (data && typeof data === 'object') {
        const processedItem = {
          ...data,
          type: 'mongodb',
          source: 'mongodb'
        };
        
        console.log(`[PROXY] Procesando propiedad individual de MongoDB: ${processedItem._id || processedItem.id}`);
        
        return new Response(JSON.stringify(processedItem), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
          }
        });
      }
    }
    
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
    console.error(`[PROXY] Error en la solicitud a ${service}:`, error);
    
    return new Response(JSON.stringify({
      error: `Error al procesar la solicitud a ${service}`,
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