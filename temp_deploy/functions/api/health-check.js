/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Endpoint sencillo para verificar el estado del servidor
 * Devuelve un 200 OK con información básica del estado
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Cabeceras CORS para permitir acceso desde cualquier origen
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate'
  });
  
  // Manejar preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers });
  }
  
  // Crear respuesta con información básica
  const response = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    region: env.CLOUDFLARE_REGION || 'unknown',
    message: 'El servidor está funcionando correctamente'
  };
  
  return new Response(JSON.stringify(response), {
    status: 200,
    headers
  });
} 