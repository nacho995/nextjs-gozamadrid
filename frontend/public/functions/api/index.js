// API central para la ruta principal /api
import { handleCors, applyCorsHeaders } from './cors-middleware';
import config from '../../config.js';

export async function onRequest(context) {
  const { request, env } = context;
  
  // Manejar preflight CORS
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  // Obtener la URL y el path
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams;
  
  console.log(`API Central - Recibida solicitud para: ${path}`);
  
  // Si es la ruta /api exacta, mostrar documentación o estado
  if (path === '/api') {
    return new Response(JSON.stringify({
      status: 'online',
      message: 'API de GozaMadrid activa',
      timestamp: new Date().toISOString(),
      endpoints: {
        '/api/wordpress-proxy': 'Proxy para WordPress API',
        '/api/woocommerce-proxy': 'Proxy para WooCommerce API',
        '/api/blog': 'API para blogs',
        '/api/properties': 'API para propiedades inmobiliarias',
        '/api/test': 'Endpoint de prueba',
        '/api/proxy': 'Proxy genérico configurable'
      },
      config: {
        hasWordPress: !!env.WP_API_URL || !!config.WP_API_URL,
        hasWooCommerce: !!env.WC_API_URL || !!config.WC_API_URL,
        hasMongoDB: !!env.MONGODB_API_URL || !!config.MONGODB_API_URL,
        cacheMaxAge: config.CACHE_MAX_AGE || 3600,
        staleWhileRevalidate: config.STALE_WHILE_REVALIDATE || 60
      },
      servicios: {
        wordpress: {
          url: '/api/wordpress-proxy/posts?per_page=10',
          ejemplo: '/api/wordpress-proxy/posts?slug=mi-post'
        },
        woocommerce: {
          url: '/api/woocommerce-proxy/products?per_page=10',
          ejemplo: '/api/woocommerce-proxy/products?featured=true'
        }
      }
    }), {
      headers: applyCorsHeaders({
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store'
      }, request)
    });
  }
  
  // Para cualquier otra ruta, devolver un error 404 indicando que debe usar los endpoints específicos
  return new Response(JSON.stringify({
    error: true,
    message: `Ruta API no encontrada: ${path}`,
    suggestion: 'Usa uno de los endpoints específicos como /api/blog, /api/properties, /api/wordpress-proxy o /api/woocommerce-proxy'
  }), {
    status: 404,
    headers: applyCorsHeaders({
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    }, request)
  });
} 