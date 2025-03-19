/**
 * Manejador para rutas de datos JSON generadas por Next.js
 * 
 * Este archivo maneja las solicitudes a rutas /_next/data/[buildId]/[ruta].json
 * que Next.js solicita para la navegación del lado del cliente.
 */

export async function onRequest(context) {
  const { request, env } = context;
  const url = new URL(request.url);
  
  console.log(`[JSON-DATA] Solicitud recibida para: ${url.pathname}`);
  
  // La ruta solicitada será algo como: /_next/data/[buildId]/[ruta].json
  // Extraemos la ruta real sin el buildId
  const match = url.pathname.match(/\/_next\/data\/[^\/]+\/(.+)\.json$/);
  
  if (!match) {
    return new Response(JSON.stringify({ error: 'Formato de ruta inválido' }), {
      status: 400,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
  
  // La ruta real solicitada
  const path = match[1];
  console.log(`[JSON-DATA] Ruta extraída: ${path}`);
  
  // Para aplicaciones exportadas estáticamente, podríamos 
  // intentar servir un archivo JSON estático correspondiente
  try {
    // Construir una respuesta JSON básica para evitar errores
    // Esto es una solución temporal hasta que se implementen correctamente 
    // todas las rutas de datos
    
    const response = {
      pageProps: {
        __N_SSG: true,
        statusCode: 200
      },
      __N_SSG: true
    };
    
    return new Response(JSON.stringify(response), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
      }
    });
    
  } catch (error) {
    console.error(`[JSON-DATA] Error al procesar la solicitud:`, error);
    
    return new Response(JSON.stringify({
      pageProps: { 
        statusCode: 404,
        notFound: true
      },
      __N_SSG: true
    }), {
      status: 200, // Devolvemos 200 pero con flag notFound
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }
} 