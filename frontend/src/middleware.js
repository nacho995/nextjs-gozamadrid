import { NextResponse } from 'next/server';
import { getServerCookies, COOKIE_KEYS } from '@/utils/serverCookies';

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const cookies = getServerCookies(request);
  
  // Clonar la respuesta para poder modificarla
  const response = NextResponse.next();

  // Obtener preferencias de cookies
  const theme = cookies.get(COOKIE_KEYS.THEME);
  const language = cookies.get(COOKIE_KEYS.LANGUAGE);
  const viewMode = cookies.get(COOKIE_KEYS.VIEW_MODE);

  // Agregar headers con las preferencias si existen
  if (theme) response.headers.set('X-Theme', theme);
  if (language) response.headers.set('X-Language', language);
  if (viewMode) response.headers.set('X-View-Mode', viewMode);

  return response;
}

// Configurar en qué rutas se ejecutará el middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}; 