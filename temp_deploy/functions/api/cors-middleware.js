/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
// Middleware para manejar CORS en las funciones de API

/**
 * Maneja la solicitud OPTIONS para CORS preflight
 */
export function handleCors(request) {
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
        "Access-Control-Max-Age": "86400"
      }
    });
  }
  return null;
}

/**
 * Aplica cabeceras CORS a un objeto de cabeceras existente
 */
export function applyCorsHeaders(headers = {}, request) {
  // Crear un nuevo objeto de cabeceras
  const corsHeaders = new Headers(headers);
  
  // Aplicar cabeceras CORS
  corsHeaders.set("Access-Control-Allow-Origin", "*");
  
  // Si es una solicitud con credentials, usar el origen específico
  const origin = request?.headers?.get("Origin");
  if (request && origin) {
    corsHeaders.set("Access-Control-Allow-Origin", origin);
    corsHeaders.set("Access-Control-Allow-Credentials", "true");
  }
  
  // Devolver el objeto de cabeceras modificado
  return corsHeaders;
}
