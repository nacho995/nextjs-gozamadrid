// Función simple de proxy para pruebas
export async function onRequest(context) {
  const { request } = context;
  
  // Obtener la URL y el path
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams;
  
  console.log(`Proxy - Recibida solicitud para: ${path}`);
  
  // Determinar el tipo de proxy según los parámetros
  const service = searchParams.get('service') || 'test';
  
  // Para pruebas simplemente devolver los parámetros
  return new Response(JSON.stringify({
    message: "Proxy funcionando correctamente",
    timestamp: new Date().toISOString(),
    url: request.url,
    method: request.method,
    path: path,
    service: service,
    params: Object.fromEntries([...searchParams.entries()]),
    headers: Object.fromEntries([...request.headers])
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Cache-Control': 'no-cache'
    }
  });
} 