/**
 * redirect-mongodb.js
 * Este endpoint maneja las redirecciones de propiedades MongoDB
 * redireccionando a la página principal con el ID como parámetro.
 */

// Importar middleware CORS si es necesario
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, HEAD, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function onRequest(context) {
  const { request } = context;
  
  // Manejar solicitudes OPTIONS para CORS
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders,
    });
  }
  
  // Obtener la URL y extraer el ID de la propiedad
  const url = new URL(request.url);
  const path = url.pathname;
  
  console.log("[redirect-mongodb] Procesando ruta:", path);
  
  // Verificar si la ruta es para una propiedad
  if (path.startsWith('/property/')) {
    // Extraer el ID de la URL
    const id = path.replace(/^\/property\//, '').replace(/\/+$/, '');
    
    // Verificar si parece un ID de MongoDB (24 caracteres hexadecimales)
    if (id && /^[0-9a-f]{24}$/i.test(id)) {
      console.log(`[redirect-mongodb] Detectado ID de MongoDB: ${id}`);
      
      // Crear URL de redirección a la página principal con el ID como parámetro
      const redirectUrl = `/?property_id=${id}`;
      
      // Devolver respuesta con redirección 302 (temporal)
      return new Response(null, {
        status: 302,
        headers: {
          ...corsHeaders,
          "Location": redirectUrl,
          "Cache-Control": "no-cache, no-store, must-revalidate"
        }
      });
    }
  }
  
  // Si no se pudo procesar la redirección, devolver un error 404
  return new Response("Property not found", {
    status: 404,
    headers: {
      ...corsHeaders,
      "Content-Type": "text/plain"
    }
  });
} 