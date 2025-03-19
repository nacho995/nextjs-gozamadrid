/**
 * API para manejar propiedades individuales y redirigirlas correctamente
 */
export async function onRequest({ request, env, params }) {
  // Configuración de CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept',
    'Content-Type': 'application/json'
  };

  // Para solicitudes OPTIONS
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers
    });
  }

  try {
    // Extraer el ID y source de la URL
    const url = new URL(request.url);
    const pathParts = url.pathname.split('/');
    
    // Intentar obtener el ID de los parámetros de consulta primero (para casos de redirección)
    let propertyId = url.searchParams.get('id');
    
    // Si no está en los parámetros, intentar extraerlo de la ruta
    if (!propertyId) {
      // Extraer el ID de la ruta
      const path = url.pathname;
      if (path.startsWith('/property/')) {
        const cleanPath = path.replace(/^\/property\//, '').replace(/\/$/, '');
        if (cleanPath) {
          const routeParts = cleanPath.split('/');
          propertyId = routeParts[0];
        }
      } else if (path.startsWith('/api/property-fallback')) {
        // Si nos llaman directamente como API, extraer el ID de los parámetros restantes
        propertyId = pathParts[pathParts.length - 1] || null;
      }
    }
    
    // Obtener la fuente (MongoDB o WooCommerce)
    const source = url.searchParams.get('source') || 'woocommerce';

    // Registrar la solicitud recibida
    console.log(`Solicitud recibida para property ID: ${propertyId}, source: ${source}`);

    // Si es una solicitud sin ID válido, redireccionar a la página principal
    if (!propertyId) {
      return Response.redirect(url.origin, 302);
    }

    // Para propiedades de MongoDB, usar el hash de estado para Next.js
    if (source === 'mongodb' || (propertyId && propertyId.length === 24 && /^[0-9a-f]{24}$/.test(propertyId))) {
      // Construir una URL con estado específico para MongoDB
      const mongoUrl = `${url.origin}/?_source=mongodb&_id=${propertyId}#property`;
      console.log(`Redirigiendo a URL especial para MongoDB: ${mongoUrl}`);
      return Response.redirect(mongoUrl, 302);
    }

    // Para propiedades normales (WooCommerce), redireccionar a la ruta normal
    const standardUrl = `${url.origin}/property/${propertyId}`;
    console.log(`Redirigiendo a URL estándar: ${standardUrl}`);
    return Response.redirect(standardUrl, 302);
  } catch (error) {
    console.error("Error en property-fallback:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Error al procesar la solicitud",
      stack: error.stack
    }), {
      status: 500,
      headers
    });
  }
} 