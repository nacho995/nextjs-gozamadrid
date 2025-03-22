import { NextResponse } from 'next/server';
import config from '@/config/config';

// Este archivo debe existir pero no necesita hacer nada por ahora
export async function middleware(request) {
  const { pathname } = request.nextUrl;
  
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
      const targetUrl = new URL('https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3' + pathname.replace('/api/proxy/woocommerce', ''));
      
      // Añadir las credenciales de WooCommerce
      targetUrl.searchParams.append('consumer_key', config.WOO_COMMERCE_KEY);
      targetUrl.searchParams.append('consumer_secret', config.WOO_COMMERCE_SECRET);
      
      // Copiar los query params existentes
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        if (key !== 'consumer_key' && key !== 'consumer_secret') {
          targetUrl.searchParams.append(key, value);
        }
      });
      
      return NextResponse.rewrite(targetUrl);
    }
    
    // Para WordPress
    if (pathname.startsWith('/api/proxy/wordpress')) {
      const targetUrl = new URL('https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2' + pathname.replace('/api/proxy/wordpress', ''));
      
      // Copiar los query params existentes
      const url = new URL(request.url);
      url.searchParams.forEach((value, key) => {
        targetUrl.searchParams.append(key, value);
      });
      
      return NextResponse.rewrite(targetUrl);
    }

    // Para el Backend
    if (pathname.startsWith('/api/proxy/backend')) {
      const targetUrl = new URL(config.API_ROUTES.BEANSTALK + pathname.replace('/api/proxy/backend', ''));
      
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

  // Obtener la URL de origen de la solicitud
  const origin = request.headers.get('origin') || '*';
  
  // Verificar si es una solicitud OPTIONS (preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET,OPTIONS,PATCH,DELETE,POST,PUT',
        'Access-Control-Allow-Headers': 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization',
        'Access-Control-Max-Age': '86400',
      },
    });
  }

  // Para todas las demás solicitudes
  const response = NextResponse.next();

  // Agregar headers CORS
  response.headers.set('Access-Control-Allow-Origin', origin);
  response.headers.set('Access-Control-Allow-Credentials', 'true');
  response.headers.set('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  response.headers.set('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  return response;
}

// No se ejecutará en ninguna ruta
export const middlewareConfig = {
  matcher: [
    '/proxy/:path*',
    '/api/proxy/:path*',
    '/api/properties/:path*',
    '/woocommerce-proxy',
    '/wordpress-proxy',
    '/diagnostics',
    '/api/:path*'
  ],
}; 