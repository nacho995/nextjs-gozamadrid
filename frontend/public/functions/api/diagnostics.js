import { handleCors, applyCorsHeaders } from './cors-middleware';

export async function onRequest(context) {
  const { request } = context;
  
  // Manejo de CORS preflight
  const corsResult = handleCors(request);
  if (corsResult instanceof Response) {
    return corsResult;
  }
  
  // Parámetros de autenticación
  const consumer_key = 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
  const consumer_secret = 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
  
  // URLs a verificar
  const urlsToCheck = [
    {
      name: 'WordPress Posts',
      url: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2/posts',
      auth: false
    },
    {
      name: 'WooCommerce Products', 
      url: `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/products?consumer_key=${consumer_key}&consumer_secret=${consumer_secret}`,
      auth: true
    },
    {
      name: 'WordPress Site Info',
      url: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json',
      auth: false
    },
    {
      name: 'Backend API',
      url: 'https://realestatgozamadrid.com/api/properties',
      auth: false
    }
  ];
  
  const results = [];
  
  // Verificar cada URL
  for (const endpoint of urlsToCheck) {
    try {
      const response = await fetch(endpoint.url);
      const status = response.status;
      const contentType = response.headers.get('content-type');
      
      // Intentar obtener el cuerpo de la respuesta, primero como texto
      const responseText = await response.text();
      let responseBodyPreview = responseText.substring(0, 500) + (responseText.length > 500 ? '...' : '');
      
      // Intentar analizar como JSON si el tipo de contenido es JSON
      let isValidJson = false;
      let jsonData = null;
      if (contentType && contentType.includes('application/json')) {
        try {
          jsonData = JSON.parse(responseText);
          isValidJson = true;
        } catch (e) {
          // Si falla el análisis JSON, dejamos isValidJson como false
        }
      }
      
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        status,
        contentType,
        isValidJson,
        responseBodyPreview,
        authIncluded: endpoint.auth
      });
    } catch (error) {
      results.push({
        endpoint: endpoint.name,
        url: endpoint.url,
        error: error.message,
        authIncluded: endpoint.auth
      });
    }
  }
  
  const diagnosticsResponse = new Response(JSON.stringify({
    timestamp: new Date().toISOString(),
    results
  }, null, 2), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache'
    }
  });
  
  return applyCorsHeaders(diagnosticsResponse, request);
} 