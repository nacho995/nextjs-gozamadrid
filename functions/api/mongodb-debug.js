/**
 * Endpoint de diagnóstico para MongoDB
 * Este archivo realiza pruebas de conexión a MongoDB y devuelve información
 * detallada sobre el éxito o los problemas encontrados.
 */

export async function onRequest(context) {
  const { request, env } = context;
  
  // Headers CORS para permitir el acceso desde cualquier origen
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Content-Type': 'application/json'
  };

  // Para solicitudes OPTIONS (preflight requests)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Resultados del diagnóstico
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    tests: [],
    success: false,
    mongodbApiUrl: env.MONGODB_API_URL || 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com'
  };

  // Prueba 1: Verificar valor de la variable de entorno
  diagnosticResults.tests.push({
    name: 'MONGODB_API_URL variable',
    success: !!env.MONGODB_API_URL,
    value: env.MONGODB_API_URL || '(no configurado)',
    description: 'Verifica si la variable de entorno MONGODB_API_URL está configurada'
  });

  // Prueba 2: Intentar conectar directamente a MongoDB con HTTP
  try {
    const directUrl = `${diagnosticResults.mongodbApiUrl}/property`;
    console.log(`[MONGODB-DEBUG] Intentando conexión directa a: ${directUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
    
    const directResponse = await fetch(directUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Diagnostic'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    if (directResponse.ok) {
      const directData = await directResponse.json();
      const isArray = Array.isArray(directData);
      const length = isArray ? directData.length : 'N/A';
      
      diagnosticResults.tests.push({
        name: 'Conexión directa HTTP',
        success: true,
        status: directResponse.status,
        responseType: isArray ? 'array' : typeof directData,
        itemCount: length,
        sample: isArray && directData.length > 0 ? JSON.stringify(directData[0]).substring(0, 200) + '...' : 'Sin datos',
        description: 'Verifica si se puede conectar directamente a MongoDB API con HTTP'
      });
    } else {
      const errorText = await directResponse.text();
      diagnosticResults.tests.push({
        name: 'Conexión directa HTTP',
        success: false,
        status: directResponse.status,
        error: directResponse.statusText,
        details: errorText.substring(0, 200),
        description: 'Verifica si se puede conectar directamente a MongoDB API con HTTP'
      });
    }
  } catch (directError) {
    diagnosticResults.tests.push({
      name: 'Conexión directa HTTP',
      success: false,
      error: directError.name,
      message: directError.message,
      description: 'Verifica si se puede conectar directamente a MongoDB API con HTTP'
    });
  }

  // Prueba 3: Intentar usar el proxy interno
  try {
    const proxyUrl = `https://main.gozamadrid-frontend-new.pages.dev/api/proxy?service=mongodb&resource=property`;
    console.log(`[MONGODB-DEBUG] Intentando conexión vía proxy a: ${proxyUrl}`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos de timeout
    
    const proxyResponse = await fetch(proxyUrl, {
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Cloudflare-Worker-Diagnostic'
      },
      signal: controller.signal
    }).finally(() => clearTimeout(timeoutId));
    
    if (proxyResponse.ok) {
      const proxyData = await proxyResponse.json();
      const isArray = Array.isArray(proxyData);
      const length = isArray ? proxyData.length : 'N/A';
      
      diagnosticResults.tests.push({
        name: 'Conexión vía proxy',
        success: true,
        status: proxyResponse.status,
        responseType: isArray ? 'array' : typeof proxyData,
        itemCount: length,
        sample: isArray && proxyData.length > 0 ? JSON.stringify(proxyData[0]).substring(0, 200) + '...' : 'Sin datos',
        description: 'Verifica si se puede conectar a MongoDB API a través del proxy'
      });
    } else {
      const errorText = await proxyResponse.text();
      diagnosticResults.tests.push({
        name: 'Conexión vía proxy',
        success: false,
        status: proxyResponse.status,
        error: proxyResponse.statusText,
        details: errorText.substring(0, 200),
        description: 'Verifica si se puede conectar a MongoDB API a través del proxy'
      });
    }
  } catch (proxyError) {
    diagnosticResults.tests.push({
      name: 'Conexión vía proxy',
      success: false,
      error: proxyError.name,
      message: proxyError.message,
      description: 'Verifica si se puede conectar a MongoDB API a través del proxy'
    });
  }

  // Actualizar el estado general de éxito
  diagnosticResults.success = diagnosticResults.tests.some(test => test.success);

  // Generar recomendaciones basadas en los resultados
  let recommendations = [];
  
  if (!diagnosticResults.tests[0].success) {
    recommendations.push("Configura la variable de entorno MONGODB_API_URL en wrangler.toml");
  }
  
  const directTest = diagnosticResults.tests.find(t => t.name === 'Conexión directa HTTP');
  const proxyTest = diagnosticResults.tests.find(t => t.name === 'Conexión vía proxy');
  
  if (directTest && directTest.success) {
    recommendations.push("La conexión directa a MongoDB funciona correctamente con HTTP");
    
    if (proxyTest && !proxyTest.success) {
      recommendations.push("El proxy está fallando pero la conexión directa funciona. Revisa la configuración del proxy.");
    }
  } else {
    recommendations.push("La conexión directa a MongoDB está fallando. Verifica que el servidor de MongoDB esté operativo.");
    
    if (proxyTest && proxyTest.success) {
      recommendations.push("El proxy está funcionando, pero la conexión directa no. Usa el proxy para todas las conexiones.");
    } else {
      recommendations.push("Tanto la conexión directa como el proxy están fallando. Verifica la disponibilidad del servidor de MongoDB.");
    }
  }
  
  diagnosticResults.recommendations = recommendations;

  // Devolver respuesta con los headers CORS
  return new Response(JSON.stringify(diagnosticResults, null, 2), {
    status: 200,
    headers: corsHeaders
  });
} 