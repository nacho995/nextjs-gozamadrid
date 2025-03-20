import { NextResponse } from 'next/server';

// Middleware para interceptar todas las solicitudes antes de que se procesen
export function middleware(request) {
  const url = request.nextUrl.clone();
  const { pathname } = url;

  // Importante: no procesar más si estamos en la raíz para evitar bucles
  if (pathname === '/') {
    return NextResponse.next();
  }

  console.log('Middleware interceptando ruta:', pathname);

  // Lista de rutas válidas conocidas
  const validRoutes = [
    '/',
    '/api',
    '/_next',
    '/static',
    '/css',
    '/img',
    '/favicon.ico',
    '/public',
    '/property'
  ];

  // Verificar si la ruta es válida o debería redirigirse
  const shouldRedirect = !validRoutes.some(route => 
    pathname === route || pathname.startsWith(`${route}/`)
  );

  // Redireccionar a la página principal si la ruta no es válida
  if (shouldRedirect) {
    console.log('Redirigiendo ruta no válida:', pathname);
    
    // Redirección a la página principal
    url.pathname = '/';
    return NextResponse.redirect(url);
  }

  // Continuar con la solicitud normal para rutas válidas
  return NextResponse.next();
}

// Configurar en qué rutas debe ejecutarse el middleware - excluir explícitamente la raíz
export const config = {
  matcher: [
    // Excluir la ruta raíz y rutas estáticas conocidas
    '/((?!$|_next/static|_next/image|favicon.ico|robots.txt).*)',
  ],
}; 