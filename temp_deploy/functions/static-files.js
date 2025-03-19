/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Manejador de archivos estáticos para Cloudflare Pages
 * Asegura que los archivos JavaScript y CSS se sirven con el tipo MIME correcto
 */

// Mapeo de extensiones de archivo a tipos MIME
const MIME_TYPES = {
  '.js': 'application/javascript',
  '.mjs': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.otf': 'font/otf',
  '.eot': 'application/vnd.ms-fontobject',
  '.map': 'application/json',
  '.txt': 'text/plain',
  '.xml': 'application/xml',
  '.pdf': 'application/pdf',
  '.zip': 'application/zip',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav'
};

/**
 * Detecta el tipo MIME basado en la extensión del archivo de la URL
 * @param {string} url - URL del archivo
 * @return {string} Tipo MIME correspondiente o undefined si no se encuentra
 */
function detectMimeType(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Obtener la extensión del archivo
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex === -1) return undefined;
    
    const extension = pathname.slice(lastDotIndex);
    return MIME_TYPES[extension.toLowerCase()];
  } catch (error) {
    console.error('Error detectando tipo MIME:', error);
    return undefined;
  }
}

/**
 * Aplica los encabezados CORS a una respuesta
 * @param {Headers} headers - Encabezados existentes
 * @param {Request} request - Solicitud original
 * @return {Headers} Nuevos encabezados con CORS aplicado
 */
function applyCorsHeaders(headers, request) {
  const origin = request.headers.get('Origin') || '*';
  
  // Lista de dominios permitidos
  const allowedOrigins = [
    'https://main.gozamadrid-frontend-new.pages.dev',
    'https://gozamadrid-frontend-new.pages.dev',
    'https://main.gozamadrid-frontend.pages.dev',
    'https://gozamadrid-frontend.pages.dev',
    'https://realestategozamadrid.com',
    'https://www.realestategozamadrid.com',
    'https://gozamadrid.es',
    'https://www.gozamadrid.es',
    'http://localhost:3000',
    'http://localhost:8788'
  ];
  
  // Comprobar si el origen está permitido o permitir todos en desarrollo
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // Si es un objeto Headers o un objeto normal
  let newHeaders = headers instanceof Headers ? new Headers(headers) : new Headers(headers || {});
  
  // Añadir encabezados CORS
  newHeaders.set('Access-Control-Allow-Origin', allowOrigin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  newHeaders.set('Access-Control-Max-Age', '86400');
  newHeaders.set('Vary', 'Origin');
  
  return newHeaders;
}

/**
 * Función principal para manejar solicitudes
 */
export async function onRequest(context) {
  const { request } = context;
  
  // Si es una solicitud OPTIONS, manejar preflight CORS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: applyCorsHeaders({}, request)
    });
  }
  
  // Permitir que la solicitud original continúe
  // La plataforma de Cloudflare Pages manejará la entrega del archivo
  const response = await context.next();
  
  // Detectar el tipo MIME basado en la URL
  const mimeType = detectMimeType(request.url);
  
  // Si se detectó un tipo MIME, modificar la respuesta para incluirlo
  if (mimeType) {
    const responseHeaders = new Headers(response.headers);
    responseHeaders.set('Content-Type', mimeType);
    
    // Establecer encabezados de caché para archivos estáticos
    if (request.url.includes('/_next/static/')) {
      responseHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
    }
    
    // Aplicar encabezados CORS
    const corsHeaders = applyCorsHeaders(responseHeaders, request);
    
    // Crear una nueva respuesta con los encabezados actualizados
    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: corsHeaders
    });
  }
  
  // Si no se detectó un tipo MIME, aplicar CORS a la respuesta original
  const corsHeaders = applyCorsHeaders(response.headers, request);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: corsHeaders
  });
} 