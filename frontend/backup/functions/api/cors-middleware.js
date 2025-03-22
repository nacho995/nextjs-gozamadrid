// Middleware para configurar CORS correctamente
export function handleCors(request) {
  // Obtener el origen de la solicitud
  const origin = request.headers.get('Origin') || '*';
  
  // Lista de dominios permitidos
  const allowedOrigins = [
    'https://main.gozamadrid-frontend.pages.dev',
    'https://gozamadrid-frontend.pages.dev',
    'https://realestategozamadrid.com',
    'https://www.realestategozamadrid.com',
    'https://gozamadrid.es',
    'https://www.gozamadrid.es',
    'http://localhost:3000',
    'http://localhost:8788'
  ];
  
  // Comprobar si el origen está permitido o permitir todos en desarrollo
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // Si es una solicitud OPTIONS (preflight), responder adecuadamente
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': allowOrigin,
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, Accept, X-Requested-With',
        'Access-Control-Max-Age': '86400',
        'Access-Control-Allow-Credentials': 'true',
        'Vary': 'Origin'
      }
    });
  }
  
  // Para otras solicitudes, devolver null para indicar que no es una solicitud preflight
  return null;
}

// Aplicar CORS a una respuesta existente
export function applyCorsHeaders(headers, request) {
  const origin = request.headers.get('Origin') || '*';
  
  // Lista de dominios permitidos
  const allowedOrigins = [
    'https://main.gozamadrid-frontend.pages.dev',
    'https://gozamadrid-frontend.pages.dev',
    'https://realestategozamadrid.com',
    'https://www.realestategozamadrid.com',
    'https://gozamadrid.es',
    'https://www.gozamadrid.es',
    'http://localhost:3000',
    'http://localhost:8788'
  ];
  
  // Comprobar si el origen está permitido o permitir todos en desarrollo
  const allowOrigin = allowedOrigins.includes(origin) ? origin : '*';
  
  // Si es un objeto Headers o un objeto normal
  let newHeaders = headers instanceof Headers ? new Headers(headers) : new Headers(headers || {});
  
  // Añadir encabezados CORS
  newHeaders.set('Access-Control-Allow-Origin', allowOrigin);
  newHeaders.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  newHeaders.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept, X-Requested-With');
  newHeaders.set('Access-Control-Allow-Credentials', 'true');
  newHeaders.set('Vary', 'Origin');
  
  return newHeaders;
}