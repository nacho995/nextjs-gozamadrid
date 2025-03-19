/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Middleware global para Cloudflare Pages
 * Asegura un manejo consistente de encabezados y tipos MIME
 */

/**
 * Función para detectar el tipo MIME basado en la URL
 */
function detectMimeType(url) {
  try {
    const urlObj = new URL(url);
    const pathname = urlObj.pathname;
    
    // Mapeo de extensiones a tipos MIME
    const mimeTypes = {
      '.js': 'application/javascript',
      '.mjs': 'application/javascript',
      '.css': 'text/css',
      '.json': 'application/json',
      // Otros tipos MIME pueden añadirse según sea necesario
    };
    
    // Buscar la extensión en la URL
    const lastDotIndex = pathname.lastIndexOf('.');
    if (lastDotIndex === -1) return null;
    
    const extension = pathname.slice(lastDotIndex);
    return mimeTypes[extension.toLowerCase()];
  } catch (error) {
    console.error('Error detectando tipo MIME:', error);
    return null;
  }
}

/**
 * Manejador de middleware global
 */
export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  
  // Verificar si la ruta es para un archivo estático de Next.js
  if (url.pathname.startsWith('/_next/static/') && 
      (url.pathname.endsWith('.js') || url.pathname.endsWith('.css'))) {
    
    const response = await context.next();
    
    // Detectar el tipo MIME correcto
    const mimeType = detectMimeType(url.toString());
    
    if (mimeType) {
      // Crear nuevos encabezados con el tipo MIME correcto
      const newHeaders = new Headers(response.headers);
      newHeaders.set('Content-Type', mimeType);
      
      // Para archivos estáticos de Next.js, establecer caché larga
      newHeaders.set('Cache-Control', 'public, max-age=31536000, immutable');
      
      // Devolver una nueva respuesta con los encabezados actualizados
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
  }
  
  // Para otras rutas, continuar normalmente
  return context.next();
} 