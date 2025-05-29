// Endpoint para verificar el estado del sistema
import { handleCors, applyCorsHeaders } from './api/cors-middleware';
import config from '../config.js';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  // Información sobre el estado del sistema
  const healthData = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: {
      hasWordPressConfig: !!env.WP_API_URL || !!config.WP_API_URL,
      hasWooCommerceConfig: !!env.WC_API_URL || !!config.WC_API_URL,
      hasMongoDB: !!env.MONGODB_API_URL || !!config.MONGODB_API_URL
    },
    version: '1.0.0'
  };
  
  return new Response(JSON.stringify(healthData), {
    status: 200,
    headers: applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }, request)
  });
} 