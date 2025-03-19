// Endpoint de health check para la API
import { handleCors, applyCorsHeaders } from './cors-middleware';

export async function onRequest(context) {
  const { request } = context;
  
  // Manejo de CORS preflight
  const corsResult = handleCors(request);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  
  // Respuesta principal
  const response = new Response(JSON.stringify({
    status: 'ok',
    timestamp: new Date().toISOString(),
    environment: 'cloudflare-pages',
    service: 'gozamadrid-frontend',
    message: 'API is healthy and running on Cloudflare Pages',
    version: '1.0.0'
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
  
  return applyCorsHeaders(response, request);
} 