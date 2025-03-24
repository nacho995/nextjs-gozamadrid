/**
 * API de diagnóstico rápido del backend
 * 
 * Este endpoint verifica el estado de todas las conexiones del backend
 * y devuelve un resumen del estado.
 */

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET');
  
  // URLs a verificar
  const endpoints = [
    {
      name: 'API HTTP',
      url: 'http://api.realestategozamadrid.com/',
      expected: [200, 301, 302]
    },
    {
      name: 'API HTTPS',
      url: 'https://api.realestategozamadrid.com/',
      expected: 200
    },
    {
      name: 'API Propiedades',
      url: 'http://api.realestategozamadrid.com/api/properties',
      expected: 200
    },
    {
      name: 'API WooCommerce',
      url: 'http://api.realestategozamadrid.com/api/properties/sources/woocommerce',
      expected: 200
    },
  ];
  
  // Resultados
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    status: 'checking',
    endpoints: []
  };
  
  try {
    // Comprobar cada endpoint
    for (const endpoint of endpoints) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000);
        
        const start = Date.now();
        const response = await fetch(endpoint.url, {
          signal: controller.signal,
          redirect: 'follow',
          headers: {
            'Cache-Control': 'no-cache',
            'User-Agent': 'GozaMadrid-DiagnosticTool/1.0'
          }
        });
        
        clearTimeout(timeoutId);
        const time = Date.now() - start;
        
        // Verificar si el status está en los status esperados
        const isExpectedStatus = Array.isArray(endpoint.expected) 
          ? endpoint.expected.includes(response.status)
          : response.status === endpoint.expected;
        
        results.endpoints.push({
          name: endpoint.name,
          url: endpoint.url,
          status: response.status,
          time: time,
          redirected: response.redirected,
          redirectUrl: response.redirected ? response.url : null,
          success: isExpectedStatus
        });
      } catch (error) {
        results.endpoints.push({
          name: endpoint.name,
          url: endpoint.url,
          error: error.name === 'AbortError' ? 'timeout' : error.message,
          success: false
        });
      }
    }
    
    // Calcular estado general
    const allSuccess = results.endpoints.every(endpoint => endpoint.success);
    const anySuccess = results.endpoints.some(endpoint => endpoint.success);
    
    results.status = allSuccess ? 'healthy' : anySuccess ? 'degraded' : 'unavailable';
    
    // Simplificar resultados para visualización
    results.summary = {
      total: results.endpoints.length,
      successful: results.endpoints.filter(e => e.success).length,
      failed: results.endpoints.filter(e => !e.success).length,
      redirected: results.endpoints.filter(e => e.redirected).length,
      httpStatus: results.endpoints.find(e => e.name === 'API HTTP')?.success ?? false,
      httpsStatus: results.endpoints.find(e => e.name === 'API HTTPS')?.success ?? false
    };
    
    // Recomendaciones
    if (results.summary.httpStatus && !results.summary.httpsStatus) {
      results.recommendation = "Usar protocolo HTTP para todas las conexiones al backend";
    } else if (!results.summary.httpStatus && !results.summary.httpsStatus) {
      results.recommendation = "El backend parece estar caído o inaccesible";
    }
    
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      status: 'error'
    });
  }
} 