/**
 * Manejador para solicitudes a archivos JSON de Next.js
 * 
 * Este archivo se encarga de manejar las solicitudes a archivos JSON de datos generados por Next.js,
 * como los que se utilizan para la navegación por el lado del cliente.
 */

export async function onRequest(context) {
  const { request } = context;
  
  // Obtener la URL original
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log(`[json-data] Solicitud recibida para: ${path}`);
  
  try {
    // Implementar las diferentes "rutas virtuales" que tenemos en nuestro _routes.json
    // Responder con un JSON vacío o con estructura básica según la ruta
    let responseData = {
      pageProps: {},
      __N_SSG: true
    };
    
    // Añadir datos específicos según la ruta
    if (path.includes('/blog')) {
      responseData.pageProps = {
        blogs: []
      };
    } 
    else if (path.includes('/comprar') || path.includes('/vender')) {
      responseData.pageProps = {
        properties: []
      };
    }
    else if (path.includes('/servicios')) {
      responseData.pageProps = {
        services: []
      };
    }
    
    // Devolver respuesta exitosa
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
      }
    });
  } 
  catch (error) {
    console.error(`[json-data] Error al procesar solicitud: ${error.message}`);
    
    // Devolver respuesta de error
    return new Response(JSON.stringify({
      error: `Error al procesar solicitud: ${error.message}`
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
} 