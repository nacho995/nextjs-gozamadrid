import { NextResponse } from 'next/server';
import appConfig from '@/config/config';
import wooConfig from '@/config/woocommerce';

/**
 * Middleware para Next.js
 * Maneja todas las solicitudes antes de que lleguen a las rutas
 */
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
  // Log para depuración en producción
  if (process.env.NODE_ENV === 'production' && pathname.startsWith('/api/proxy/')) {
    console.log(`[Middleware] Procesando solicitud a: ${pathname}`);
  }
  
  // Lista de rutas públicas que no requieren autenticación
  const publicRoutes = [
    '/diagnostics',
    '/api/proxy/wordpress',
    '/api/proxy/woocommerce',
    '/api/proxy/backend',
    '/api/properties'
  ];
  
  // Verificar si es una ruta pública
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route));
  if (isPublicRoute) {
    // Si es una ruta de propiedades, permitir el acceso directo
    if (pathname.startsWith('/api/properties')) {
      return NextResponse.next();
    }
    
    // Si es una ruta de WooCommerce
    if (pathname.startsWith('/api/proxy/woocommerce')) {
      try {
        // Usar las credenciales de la nueva configuración
        const targetUrl = new URL('https://wordpress.realestategozamadrid.com/wp-json/wc/v3' + pathname.replace('/api/proxy/woocommerce', ''));
        
        // Añadir las credenciales de WooCommerce
        targetUrl.searchParams.append('consumer_key', wooConfig.WOO_COMMERCE_KEY);
        targetUrl.searchParams.append('consumer_secret', wooConfig.WOO_COMMERCE_SECRET);
        
        // Copiar los query params existentes
        const url = new URL(request.url);
        url.searchParams.forEach((value, key) => {
          if (key !== 'consumer_key' && key !== 'consumer_secret') {
            targetUrl.searchParams.append(key, value);
          }
        });
        
        return NextResponse.rewrite(targetUrl);
      } catch (error) {
        console.error('[Middleware] Error redirigiendo WooCommerce:', error);
        return NextResponse.next();
      }
    }
    
    // Para WordPress
    if (pathname.startsWith('/api/proxy/wordpress')) {
      const targetUrl = new URL('https://wordpress.realestategozamadrid.com/wp-json/wp/v2' + pathname.replace('/api/proxy/wordpress', ''));
      
      // Copiar los query params existentes
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });
      
      return NextResponse.rewrite(targetUrl);
    }

    // Para el Backend
    if (pathname.startsWith('/api/proxy/backend')) {
      const targetUrl = new URL(appConfig.BACKEND_API_URL + pathname.replace('/api/proxy/backend', ''));
      
      // Copiar los query params existentes
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });
      
      return NextResponse.rewrite(targetUrl);
    }

    return NextResponse.next();
  }

  // Manejar redirecciones de proxy antiguos
  if (pathname === '/woocommerce-proxy') {
    const endpoint = request.nextUrl.searchParams.get('endpoint') || '';
    const url = request.nextUrl.clone();
    url.pathname = `/api/proxy/woocommerce/${endpoint}`;
    url.searchParams.delete('endpoint');
    return NextResponse.redirect(url);
  }

  if (pathname === '/wordpress-proxy') {
    const endpoint = request.nextUrl.searchParams.get('endpoint') || '';
    const url = request.nextUrl.clone();
    url.pathname = `/api/proxy/wordpress/${endpoint}`;
    url.searchParams.delete('endpoint');
    return NextResponse.redirect(url);
  }

  // Manejar redirecciones del proxy general
  if (pathname === '/proxy' || pathname === '/api/proxy') {
    const service = request.nextUrl.searchParams.get('service');
    const resource = request.nextUrl.searchParams.get('resource') || '';
    
    if (!service) {
      return NextResponse.json({ error: 'Se requiere el parámetro service' }, { status: 400 });
    }

    const url = request.nextUrl.clone();
    url.pathname = `/api/proxy/${service}/${resource}`;
    url.searchParams.delete('service');
    url.searchParams.delete('resource');
    return NextResponse.redirect(url);
  }

  // Si es una solicitud a la página de detalles de propiedad
  if (pathname.startsWith('/property/')) {
    // Obtener el ID de la propiedad de forma segura
    const pathParts = typeof pathname === 'string' ? pathname.split('/') : [];
    const id = pathParts.length > 0 ? pathParts.pop() : '';
    
    // Modificar la solicitud para incluir información de autenticación
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-property-auth', 'true');
    requestHeaders.set('x-requested-property', id);
    
    // Permitir la solicitud con los headers modificados
    return NextResponse.next({
      request: {
        headers: requestHeaders,
      },
    });
  }

  // Configurar CORS para todos los endpoints de API
  if (pathname.startsWith('/api/')) {
    const response = NextResponse.next();
    
    // Agregar encabezados CORS
    const origin = request.headers.get('origin') || '*';
    response.headers.set('Access-Control-Allow-Origin', origin);
    response.headers.set('Access-Control-Allow-Credentials', 'true');
    response.headers.set('Access-Control-Allow-Methods', 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS');
    response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');
    
    // Si es solicitud OPTIONS, devolver 200 OK
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { 
        status: 200,
        headers: response.headers
      });
    }
    
    return response;
  }
  
  return NextResponse.next();
}

// Configurar para que se ejecute en estas rutas
export const config = {
  matcher: [
    '/proxy/:path*',
    '/api/proxy/:path*',
    '/api/properties/:path*',
    '/woocommerce-proxy',
    '/wordpress-proxy',
    '/diagnostics',
    '/api/:path*',
    '/property/:path*'
  ],
}; 