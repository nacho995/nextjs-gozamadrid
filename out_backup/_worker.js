/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Cloudflare Worker para Goza Madrid
 * Personaliza el comportamiento de la distribución estática
 */

// Configuración
const config = {
  defaultDocument: 'index.html',
  notFoundPage: '404.html',
  contentTypes: {
    'js': 'application/javascript',
    'css': 'text/css',
    'json': 'application/json',
    'html': 'text/html; charset=utf-8',
    'svg': 'image/svg+xml',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'gif': 'image/gif',
    'webp': 'image/webp',
    'ico': 'image/x-icon',
    'txt': 'text/plain',
    'xml': 'text/xml',
    'pdf': 'application/pdf'
  },
  apiPaths: [
    '/api/properties',
    '/api/proxy',
    '/api/blog',
    '/api/woocommerce-proxy',
    '/api/wordpress-proxy'
  ],
  // Redirect de rutas antiguas o mal formadas
  redirects: {
    '/properties': '/#properties',
    '/blogs': '/blog'
  }
};

/**
 * Función principal del worker
 */
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const { pathname } = url;
    
    // Comprobar redirecciones
    if (pathname in config.redirects) {
      return Response.redirect(`${url.origin}${config.redirects[pathname]}`, 301);
    }
    
    // Manejar rutas de API simuladas en el entorno estático
    if (config.apiPaths.some(path => pathname.startsWith(path))) {
      return handleAPIRequest(request, url);
    }
    
    // Para solicitudes a archivos JavaScript específicos con hashes
    const jsHashPattern = /\/[a-zA-Z0-9]+-[a-zA-Z0-9]+\.js$/;
    if (jsHashPattern.test(pathname)) {
      // Intenta obtener el archivo normalmente primero
      try {
        let response = await env.ASSETS.fetch(request);
        
        // Si el archivo existe pero tiene el tipo MIME incorrecto, corregirlo
        if (response.ok) {
          const headers = new Headers(response.headers);
          headers.set('Content-Type', 'application/javascript');
          return new Response(response.body, {
            status: response.status,
            headers
          });
        }
        
        // Si obtenemos un 404, intentamos buscar en otra ubicación
        return new Response('console.log("Archivo JS no encontrado");', {
          headers: { 'Content-Type': 'application/javascript' }
        });
      } catch (error) {
        return new Response(`console.error("Error cargando script: ${pathname}");`, {
          headers: { 'Content-Type': 'application/javascript' }
        });
      }
    }
    
    // Para todas las demás solicitudes
    try {
      // Normalizar la ruta si es necesario
      let assetPath = pathname;
      
      // Si es una solicitud a un directorio (termina en /), servir el documento por defecto
      if (pathname.endsWith('/')) {
        assetPath = pathname + config.defaultDocument;
      }
      
      // Intentar obtener el recurso solicitado
      let response = await env.ASSETS.fetch(request);
      
      // Si la solicitud es exitosa, asegurar que el tipo de contenido es correcto
      if (response.ok) {
        const extension = assetPath.split('.').pop().toLowerCase();
        if (extension && config.contentTypes[extension]) {
          const headers = new Headers(response.headers);
          headers.set('Content-Type', config.contentTypes[extension]);
          
          // Agregar cabeceras de caché según el tipo de archivo
          if (['js', 'css', 'jpg', 'png', 'svg', 'webp', 'gif'].includes(extension)) {
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');
          } else if (extension === 'html') {
            headers.set('Cache-Control', 'no-cache, must-revalidate');
          }
          
          return new Response(response.body, {
            status: response.status,
            headers
          });
        }
        return response;
      }
      
      // Servir la página 404 en caso de error
      return env.ASSETS.fetch(`${url.origin}/${config.notFoundPage}`);
    } catch (error) {
      // Error inesperado
      return new Response(`Error: ${error.message}`, {
        status: 500,
        headers: { 'Content-Type': 'text/plain' }
      });
    }
  }
};

/**
 * Manejar solicitudes a APIs
 */
async function handleAPIRequest(request, url) {
  const { pathname, searchParams } = url;
  
  // Mock de datos para propiedades
  if (pathname === '/api/properties') {
    const properties = [
      {
        _id: 'mock-property-1',
        title: 'Apartamento de Lujo en Salamanca',
        location: 'Barrio de Salamanca, Madrid',
        price: 750000,
        bedrooms: 3,
        bathrooms: 2,
        area: 120,
        images: ['/img/default-property-image.jpg']
      },
      {
        _id: 'mock-property-2',
        title: 'Ático con Terraza en Chamberí',
        location: 'Chamberí, Madrid',
        price: 850000,
        bedrooms: 2,
        bathrooms: 2,
        area: 95,
        images: ['/img/default-property-image.jpg']
      },
      {
        _id: 'mock-property-3',
        title: 'Chalet Exclusivo en La Moraleja',
        location: 'La Moraleja, Madrid',
        price: 1950000,
        bedrooms: 5,
        bathrooms: 4,
        area: 350,
        images: ['/img/default-property-image.jpg']
      }
    ];
    
    return new Response(JSON.stringify({ properties }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'private, max-age=60'
      }
    });
  }
  
  // Mock para proxy de WooCommerce
  if (pathname.includes('/api/woocommerce-proxy') || pathname.includes('/api/wordpress-proxy')) {
    return new Response(JSON.stringify({
      success: false,
      message: 'API no disponible en modo estático. Por favor, use la versión dinámica de la aplicación.'
    }), {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }
    });
  }
  
  // Respuesta genérica para otras APIs
  return new Response(JSON.stringify({
    error: 'API no disponible',
    path: pathname
  }), {
    status: 404,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }
  });
} 