// Función simple de diagnóstico para Cloudflare Pages
export async function onRequest(context) {
  const { request } = context;
  
  // Crear una respuesta simple
  return new Response(JSON.stringify({
    message: "Test funcionando correctamente",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    headers: Object.fromEntries([...request.headers]),
    env: typeof context.env === 'object' ? "Variables de entorno disponibles" : "Variables de entorno no disponibles"
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  });
} 