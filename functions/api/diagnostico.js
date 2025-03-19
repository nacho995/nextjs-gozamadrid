/**
 * API de diagnóstico para verificar la configuración y conectividad
 */
export async function onRequest(context) {
  // Headers CORS para permitir el acceso desde cualquier origen
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Accept, User-Agent, Cache-Control, Pragma',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-store, no-cache, must-revalidate',
  };

  // Para solicitudes OPTIONS (preflight requests)
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // Recopilar información de diagnóstico
  const diagnosticInfo = {
    timestamp: new Date().toISOString(),
    environment: context.env.ENVIRONMENT || 'production',
    request: {
      url: context.request.url,
      method: context.request.method,
      headers: Object.fromEntries([...context.request.headers.entries()]),
    },
    cloudflare: {
      colo: context.request.cf?.colo || 'N/A',
      country: context.request.cf?.country || 'N/A',
      timezone: context.request.cf?.timezone || 'N/A',
    },
    endpoints: {},
    variables: {
      MONGODB_API_URL: context.env.MONGODB_API_URL ? 'Configurado' : 'No configurado',
      OTHER_VARS: Object.keys(context.env).filter(key => !key.startsWith('__')).join(', ')
    }
  };

  // Comprobar estado de endpoints críticos
  try {
    // 1. Verificar el endpoint /api/properties
    const propertiesUrl = new URL('/api/properties', context.request.url).toString();
    diagnosticInfo.endpoints.properties = { url: propertiesUrl };
    
    try {
      const propertiesResponse = await fetch(propertiesUrl, {
        headers: { 'Accept': 'application/json' },
        cf: { cacheTtl: 0 }
      });
      
      diagnosticInfo.endpoints.properties.status = propertiesResponse.status;
      diagnosticInfo.endpoints.properties.ok = propertiesResponse.ok;
      
      if (propertiesResponse.ok) {
        const data = await propertiesResponse.json();
        diagnosticInfo.endpoints.properties.dataCount = data.properties?.length || 0;
        diagnosticInfo.endpoints.properties.totalCount = data.total || 0;
      } else {
        diagnosticInfo.endpoints.properties.error = await propertiesResponse.text();
      }
    } catch (err) {
      diagnosticInfo.endpoints.properties.error = err.message;
    }
    
    // 2. Verificar el endpoint /api/proxy para MongoDB
    const proxyMongoUrl = new URL('/api/proxy?service=mongodb&resource=property', context.request.url).toString();
    diagnosticInfo.endpoints.mongoProxy = { url: proxyMongoUrl };
    
    try {
      const mongoProxyResponse = await fetch(proxyMongoUrl, {
        headers: { 'Accept': 'application/json' },
        cf: { cacheTtl: 0 }
      });
      
      diagnosticInfo.endpoints.mongoProxy.status = mongoProxyResponse.status;
      diagnosticInfo.endpoints.mongoProxy.ok = mongoProxyResponse.ok;
      
      if (mongoProxyResponse.ok) {
        const text = await mongoProxyResponse.text();
        try {
          const data = JSON.parse(text);
          diagnosticInfo.endpoints.mongoProxy.isArray = Array.isArray(data);
          diagnosticInfo.endpoints.mongoProxy.length = Array.isArray(data) ? data.length : 'N/A';
        } catch (jsonError) {
          diagnosticInfo.endpoints.mongoProxy.parseError = jsonError.message;
          diagnosticInfo.endpoints.mongoProxy.rawResponse = text.substring(0, 200) + '...';
        }
      } else {
        diagnosticInfo.endpoints.mongoProxy.error = await mongoProxyResponse.text();
      }
    } catch (err) {
      diagnosticInfo.endpoints.mongoProxy.error = err.message;
    }
    
    // 3. Verificar el endpoint /api/woocommerce-proxy
    const wooCommerceUrl = new URL('/api/woocommerce-proxy?endpoint=products', context.request.url).toString();
    diagnosticInfo.endpoints.wooCommerceProxy = { url: wooCommerceUrl };
    
    try {
      const wooCommerceResponse = await fetch(wooCommerceUrl, {
        headers: { 'Accept': 'application/json' },
        cf: { cacheTtl: 0 }
      });
      
      diagnosticInfo.endpoints.wooCommerceProxy.status = wooCommerceResponse.status;
      diagnosticInfo.endpoints.wooCommerceProxy.ok = wooCommerceResponse.ok;
      
      if (wooCommerceResponse.ok) {
        const text = await wooCommerceResponse.text();
        try {
          const data = JSON.parse(text);
          diagnosticInfo.endpoints.wooCommerceProxy.isArray = Array.isArray(data);
          diagnosticInfo.endpoints.wooCommerceProxy.length = Array.isArray(data) ? data.length : 'N/A';
        } catch (jsonError) {
          diagnosticInfo.endpoints.wooCommerceProxy.parseError = jsonError.message;
          diagnosticInfo.endpoints.wooCommerceProxy.rawResponse = text.substring(0, 200) + '...';
        }
      } else {
        diagnosticInfo.endpoints.wooCommerceProxy.error = await wooCommerceResponse.text();
      }
    } catch (err) {
      diagnosticInfo.endpoints.wooCommerceProxy.error = err.message;
    }
    
  } catch (error) {
    diagnosticInfo.error = error.message;
  }
  
  // Agregar recomendaciones basadas en los resultados
  diagnosticInfo.recommendations = [];
  
  if (!diagnosticInfo.endpoints.properties?.ok) {
    diagnosticInfo.recommendations.push("El endpoint /api/properties no está respondiendo correctamente. Verifica los logs de Cloudflare Workers.");
  }
  
  if (!diagnosticInfo.endpoints.mongoProxy?.ok) {
    diagnosticInfo.recommendations.push("El proxy de MongoDB no está funcionando. Verifica la configuración de MONGODB_API_URL en Cloudflare Workers.");
  }
  
  if (!diagnosticInfo.endpoints.wooCommerceProxy?.ok) {
    diagnosticInfo.recommendations.push("El proxy de WooCommerce no está funcionando. Verifica las claves de WooCommerce en Cloudflare Workers.");
  }
  
  if (diagnosticInfo.endpoints.properties?.ok && diagnosticInfo.endpoints.properties?.dataCount === 0) {
    diagnosticInfo.recommendations.push("El endpoint de propiedades está devolviendo 0 propiedades. Esto puede indicar un problema con las fuentes de datos.");
  }
  
  // Determinar el estado general
  diagnosticInfo.status = diagnosticInfo.recommendations.length === 0 ? "OK" : "ERROR";

  // Devolver los resultados
  return new Response(JSON.stringify(diagnosticInfo, null, 2), {
    status: 200,
    headers: corsHeaders
  });
} 