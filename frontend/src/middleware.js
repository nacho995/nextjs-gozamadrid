import { NextResponse } from 'next/server';

// Middleware muy básico que solo realiza una acción mínima
export function middleware(request) {
  // Simplemente continuamos con la solicitud normal
  return NextResponse.next();
}

// Configuración para ejecutar el middleware solo en rutas específicas
export const config = {
  matcher: [
    // Excluimos casi todo para minimizar la interferencia
    '/(api|property)/:path*',
  ],
}; 