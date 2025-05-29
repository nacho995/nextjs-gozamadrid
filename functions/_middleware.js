// Middleware global para todas las funciones
import { handleCors, applyCorsHeaders } from './api/cors-middleware';

export async function onRequest(context) {
  const { request, next } = context;
  
  // Para solicitudes OPTIONS (preflight CORS), usar el handler centralizado
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  try {
    // Continuar con la solicitud normal
    const response = await next();
    
    // Agregar encabezados CORS a todas las respuestas usando la función centralizada
    const newHeaders = applyCorsHeaders(response.headers, request);
    
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: newHeaders
    });
  } catch (error) {
    console.error('Error en la ejecución de la función:', error);
    
    // Devolver una respuesta de error amigable con headers CORS apropiados
    return new Response(JSON.stringify({
      error: true,
      message: 'Error en el servidor',
      details: error.message,
    }), {
      status: 500,
      headers: applyCorsHeaders({
        'Content-Type': 'application/json'
      }, request)
    });
  }
} 