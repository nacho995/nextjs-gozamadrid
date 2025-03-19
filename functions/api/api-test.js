/**
 * Archivo de prueba para verificar que las funciones de API están funcionando correctamente
 * Este endpoint responderá con información básica sobre la solicitud recibida
 */

export async function onRequest(context) {
  const { request, env, params } = context;
  
  // Cabeceras CORS para permitir acceso desde cualquier origen
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent',
    'Cache-Control': 'no-store',
    'Pragma': 'no-cache',
    'Content-Type': 'application/json'
  });
  
  // Manejar preflight OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, { headers, status: 200 });
  }
  
  // Extraer información de la solicitud
  const url = new URL(request.url);
  const path = url.pathname;
  const queryParams = {};
  
  // Convertir los parámetros de consulta a un objeto
  for (const [key, value] of url.searchParams.entries()) {
    queryParams[key] = value;
  }
  
  // Extraer los headers de la solicitud
  const requestHeaders = {};
  for (const [key, value] of request.headers.entries()) {
    requestHeaders[key] = value;
  }
  
  // Crear objeto de respuesta con información de diagnóstico
  const responseData = {
    message: "API de prueba funcionando correctamente",
    endpoint: path,
    timestamp: new Date().toISOString(),
    request: {
      method: request.method,
      url: request.url,
      path: path,
      queryParams: queryParams,
      headers: requestHeaders
    },
    context: {
      params: params || {},
      envVars: Object.keys(env || {})
    },
    cloudflare: {
      worker: "api-test.js",
      region: request.cf?.colo || "Unknown",
      country: request.cf?.country || "Unknown"
    }
  };
  
  // Retornar la respuesta JSON
  return new Response(JSON.stringify(responseData, null, 2), {
    status: 200,
    headers
  });
} 