// Función para servir la página principal desde Next.js
export async function onRequest(context) {
  const { request, next } = context;
  
  // Obtener la URL de la solicitud
  const url = new URL(request.url);
  
  // Si es la raíz, continuar con el flujo normal para servir el index.html de Next.js
  // que debería estar en la raíz del directorio de cloudflare-deploy
  if (url.pathname === '/' || url.pathname === '/index.html') {
    return next();
  }
  
  // Si no es la raíz, continuar con el manejo normal de la solicitud
  return next();
} 