import config from '@/config/config';

const ENDPOINTS = {
  WORDPRESS: {
    PROXY: {
      BASE: '/api/wordpress',
      POSTS: '/api/wordpress?resource=posts',
      INFO: '/api/wordpress?resource=info'
    },
    CONFIG: {
      BASE_URL: config.WP_API_URL,
      API_VERSION: 'wp/v2',
      EXPECTED_ENDPOINTS: ['posts', 'pages', 'categories']
    }
  },
  WOOCOMMERCE: {
    PROXY: {
      BASE: '/api/wordpress',
      PRODUCTS: '/api/wordpress?resource=products',
      INFO: '/api/wordpress?resource=system_status'
    },
    CONFIG: {
      BASE_URL: config.WC_API_URL,
      API_VERSION: 'wc/v3',
      HAS_CREDENTIALS: !!(config.WOO_COMMERCE_KEY && config.WOO_COMMERCE_SECRET),
      CONSUMER_KEY: config.WOO_COMMERCE_KEY ? '✓' : '✗',
      CONSUMER_SECRET: config.WOO_COMMERCE_SECRET ? '✓' : '✗'
    }
  },
  BACKEND: {
    BASE: config.API_ROUTES?.BEANSTALK || 'https://nextjs-gozamadrid-qrfk.onrender.com',
    HEALTH: `${config.API_ROUTES?.BEANSTALK || 'https://nextjs-gozamadrid-qrfk.onrender.com'}/health`,
    ROOT: (config.API_ROUTES?.BEANSTALK || 'https://nextjs-gozamadrid-qrfk.onrender.com').replace('/api', ''),
    ALTERNATE: {
      BASE: 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api',
      HEALTH: 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/health',
      ROOT: 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com'
    },
    CONFIG: {
      REGION: 'eu-west-3',
      ENVIRONMENT: 'prod',
      EXPECTED_ENDPOINTS: ['health', 'properties', 'search']
    }
  }
};

async function testConnection(url, options = {}) {
  const result = {
    success: false,
    latency: 0,
    error: null,
    details: {
      request: {
        url,
        method: options.method || 'GET',
        headers: options.headers || {},
        mode: options.mode || 'cors'
      },
      response: {},
      timing: {
        start: Date.now(),
        end: null,
        total: null
      },
      connection: {
        description: null,
        causes: [],
        type: null
      }
    }
  };

  try {
    // Usamos un timeout más largo para entornos de producción
    const timeout = options.timeout || (process.env.NODE_ENV === 'production' ? 30000 : 5000);
    console.log(`Probando conexión a ${url} con timeout de ${timeout}ms`);
    
    // Crear un AbortController con timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      console.log(`Conexión abortada por timeout después de ${timeout}ms: ${url}`);
    }, timeout);
    
    const start = performance.now();
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache, no-store',
        'Pragma': 'no-cache',
        ...options.headers
      },
      mode: options.mode || 'cors',
      keepalive: true
    });
    
    // Limpiar el timeout ya que la petición completó a tiempo
    clearTimeout(timeoutId);
    
    const end = performance.now();
    
    result.latency = Math.round(end - start);
    result.success = response.ok;
    result.status = response.status;
    result.statusText = response.statusText;
    
    result.details.timing = {
      start: new Date(Date.now() - result.latency).toISOString(),
      end: new Date().toISOString(),
      total: `${result.latency}ms`
    };

    result.details.response = {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers),
      type: response.type,
      redirected: response.redirected,
      url: response.url
    };

    if (response.headers) {
      result.headers = Object.fromEntries(response.headers);
    }

    if (response.ok) {
      try {
        result.data = await response.json();
        result.details.response.contentType = 'application/json';
        result.details.response.bodySize = JSON.stringify(result.data).length;
        result.details.connection = {
          description: 'Conexión exitosa',
          causes: [],
          type: 'success'
        };
      } catch (e) {
        const text = await response.text();
        result.data = text;
        result.details.response.contentType = 'text/plain';
        result.details.response.bodySize = text.length;
        result.details.connection = {
          description: 'Respuesta recibida pero no es JSON válido',
          causes: ['El servidor respondió con un formato no esperado'],
          type: 'warning'
        };
      }
    } else {
      result.details.connection = {
        description: `Error HTTP ${response.status}`,
        causes: [response.statusText],
        type: 'error'
      };
    }
  } catch (error) {
    result.error = {
      name: error.name,
      message: error.message,
      cause: error.cause?.message
    };
    
    result.details.error = {
      type: error.name,
      message: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      cause: error.cause?.message
    };

    result.details.connection = {
      description: 'Error de conexión',
      causes: [error.message],
      type: 'error'
    };

    if (error.name === 'AbortError') {
      result.details.connection.description = 'Tiempo de espera agotado';
      result.details.connection.causes = ['La solicitud tardó demasiado en completarse'];
      
      // Si hay una URL alternativa, intentamos con ella
      if (options.fallbackUrl) {
        console.log(`Intentando URL alternativa después de timeout: ${options.fallbackUrl}`);
        try {
          const fallbackResult = await testConnection(options.fallbackUrl, {
            ...options,
            fallbackUrl: null // Evitar bucles infinitos
          });
          
          if (fallbackResult.success) {
            console.log(`Conexión exitosa a URL alternativa: ${options.fallbackUrl}`);
            return {
              ...fallbackResult,
              details: {
                ...fallbackResult.details,
                originalUrl: url,
                fallback: true
              }
            };
          }
        } catch (fallbackError) {
          console.error(`Error al intentar URL alternativa:`, fallbackError);
        }
      }
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      result.details.connection.description = 'No se pudo establecer la conexión';
      result.details.connection.causes = ['El servidor no está accesible o no responde'];
    }
  }

  return result;
}

async function testEndpointGroup(name, endpoints, options = {}) {
  const results = {
    name,
    proxy: {},
    direct: {},
    errors: [],
    config: endpoints.CONFIG || {},
    summary: {
      total: 0,
      success: 0,
      failed: 0,
      avgLatency: 0
    }
  };

  // Probar conexión vía proxy
  if (endpoints.PROXY) {
    for (const [key, url] of Object.entries(endpoints.PROXY)) {
      results.proxy[key] = await testConnection(url, options);
      results.summary.total++;
      
      if (results.proxy[key].success) {
        results.summary.success++;
        results.summary.avgLatency += results.proxy[key].latency;
      } else {
        results.summary.failed++;
        results.errors.push({
          type: 'proxy',
          endpoint: key,
          url,
          error: results.proxy[key].error || {
            status: results.proxy[key].status,
            statusText: results.proxy[key].statusText
          }
        });
      }
    }
  }

  // Para el backend, probamos también conexión directa
  if (name === 'Backend') {
    for (const [key, url] of Object.entries(endpoints)) {
      if (typeof url === 'string' && key !== 'CONFIG') {
        // Obtener URL alternativa si existe
        let fallbackUrl = null;
        if (endpoints.ALTERNATE && endpoints.ALTERNATE[key]) {
          fallbackUrl = endpoints.ALTERNATE[key];
        }
        
        // Intentar con primera URL
        results.direct[key] = await testConnection(url, {
          ...options,
          mode: 'cors',
          credentials: 'omit',
          fallbackUrl,  // Pasar URL alternativa
          timeout: 30000 // Aumentar timeout para el backend
        });
        
        results.summary.total++;
        
        if (results.direct[key].success) {
          results.summary.success++;
          results.summary.avgLatency += results.direct[key].latency;
        } else {
          // Si falló y tenemos URL alternativa pero no se intentó, intentar manualmente
          if (fallbackUrl && !results.direct[key].details.fallback) {
            console.log(`Conexión a ${url} falló, intentando manualmente con alternativa: ${fallbackUrl}`);
            
            const fallbackResult = await testConnection(fallbackUrl, {
              ...options,
              mode: 'cors',
              credentials: 'omit',
              timeout: 30000
            });
            
            if (fallbackResult.success) {
              // Registrar éxito con URL alternativa
              results.direct[key] = {
                ...fallbackResult,
                originalUrl: url,
                fallbackUrl: fallbackUrl,
                usedFallback: true
              };
              results.summary.success++;
              results.summary.failed--; // Restar el fallo previo
              results.summary.avgLatency += fallbackResult.latency;
            } else {
              results.summary.failed++;
            }
          } else {
            results.summary.failed++;
          }
        }
      }
    }
  }

  if (results.summary.success > 0) {
    results.summary.avgLatency = Math.round(results.summary.avgLatency / results.summary.success);
  }

  return results;
}

async function checkConfiguration() {
  return {
    environment: process.env.NODE_ENV,
    baseUrl: config.API_URL,
    wordpress: {
      proxyUrl: config.WORDPRESS_PROXY_URL,
      baseUrl: config.WP_API_URL,
      apiVersion: 'wp/v2'
    },
    woocommerce: {
      proxyUrl: config.WOOCOMMERCE_PROXY_URL,
      baseUrl: config.WC_API_URL,
      apiVersion: 'wc/v3',
      hasCredentials: !!(config.WOO_COMMERCE_KEY && config.WOO_COMMERCE_SECRET)
    },
    backend: {
      baseUrl: config.API_ROUTES.BEANSTALK,
      region: 'eu-west-3',
      environment: 'prod'
    },
    security: {
      cors: {
        enabled: true,
        allowedOrigins: ['*'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
      },
      ssl: {
        enabled: true,
        provider: 'Vercel'
      }
    }
  };
}

async function checkConnectivity() {
  const results = {
    proxy: {},
    backend: {},
    summary: {
      startTime: new Date().toISOString(),
      endTime: null,
      totalDuration: null,
      totalRequests: 0,
      successfulRequests: 0,
      failedRequests: 0
    }
  };

  const startTime = Date.now();

  // Verificar proxy
  try {
    results.summary.totalRequests++;
    const response = await fetch('/api/wordpress', { 
      method: 'OPTIONS',
      signal: AbortSignal.timeout(5000)
    });
    results.proxy.status = {
      success: true,
      headers: {
        'access-control-allow-origin': response.headers.get('access-control-allow-origin'),
        'access-control-allow-methods': response.headers.get('access-control-allow-methods')
      }
    };
    results.summary.successfulRequests++;
  } catch (error) {
    results.proxy.status = {
      success: false,
      error: {
        name: error.name,
        message: error.message
      }
    };
    results.summary.failedRequests++;
  }

  // Verificar backend
  try {
    results.summary.totalRequests++;
    const response = await fetch(ENDPOINTS.BACKEND.ROOT, { 
      method: 'GET',
      mode: 'cors',
      credentials: 'omit',
      signal: AbortSignal.timeout(5000)
    });
    
    results.backend.status = {
      success: response.ok,
      status: response.status,
      statusText: response.statusText
    };

    if (response.ok) {
      try {
        results.backend.data = await response.json();
        results.summary.successfulRequests++;
      } catch (e) {
        results.backend.data = await response.text();
        results.summary.failedRequests++;
      }
    } else {
      results.summary.failedRequests++;
    }
  } catch (error) {
    results.backend.status = {
      success: false,
      error: {
        name: error.name,
        message: error.message
      }
    };
    results.summary.failedRequests++;
  }

  results.summary.endTime = new Date().toISOString();
  results.summary.totalDuration = Date.now() - startTime;

  return results;
}

export async function runDetailedDiagnostics() {
  console.log('[DIAGNOSTICS] Iniciando diagnóstico detallado...');
  
  const startTime = Date.now();
  const results = {
    timestamp: new Date().toISOString(),
    config: await checkConfiguration(),
    connectivity: await checkConnectivity(),
    endpoints: {
      wordpress: await testEndpointGroup('WordPress', ENDPOINTS.WORDPRESS),
      woocommerce: await testEndpointGroup('WooCommerce', ENDPOINTS.WOOCOMMERCE),
      backend: await testEndpointGroup('Backend', ENDPOINTS.BACKEND)
    },
    summary: {
      startTime: new Date(startTime).toISOString(),
      endTime: null,
      totalDuration: null,
      totalEndpoints: 0,
      successfulEndpoints: 0,
      failedEndpoints: 0,
      averageLatency: 0
    }
  };

  // Calcular estadísticas globales
  let totalLatency = 0;
  let successfulRequests = 0;

  for (const service of Object.values(results.endpoints)) {
    results.summary.totalEndpoints += service.summary.total;
    results.summary.successfulEndpoints += service.summary.success;
    results.summary.failedEndpoints += service.summary.failed;
    
    if (service.summary.success > 0) {
      totalLatency += service.summary.avgLatency * service.summary.success;
      successfulRequests += service.summary.success;
    }
  }

  if (successfulRequests > 0) {
    results.summary.averageLatency = Math.round(totalLatency / successfulRequests);
  }

  results.summary.endTime = new Date().toISOString();
  results.summary.totalDuration = Date.now() - startTime;

  // Analizar resultados y generar recomendaciones
  results.recommendations = [];

  // Verificar problemas de configuración
  if (!results.config.woocommerce.hasCredentials) {
    results.recommendations.push({
      type: 'config',
      severity: 'high',
      message: 'Faltan credenciales de WooCommerce',
      details: 'Las credenciales son necesarias para acceder a la API de WooCommerce'
    });
  }

  // Verificar problemas de conectividad
  if (!results.connectivity.proxy.status.success) {
    results.recommendations.push({
      type: 'proxy',
      severity: 'high',
      message: `Error en el proxy: ${results.connectivity.proxy.status.error?.message || 'No responde'}`,
      details: 'El proxy es necesario para la comunicación con WordPress y WooCommerce'
    });
  }

  if (!results.connectivity.backend.status.success) {
    results.recommendations.push({
      type: 'backend',
      severity: 'high',
      message: `Error en el backend: ${results.connectivity.backend.status.error?.message || 'No responde'}`,
      details: 'El backend es esencial para el funcionamiento de la aplicación'
    });
  } else if (results.connectivity.backend.data?.message === 'Servidor funcionando correctamente') {
    console.log('[DIAGNOSTICS] Backend respondiendo correctamente');
  }

  // Verificar problemas de endpoints
  for (const [service, result] of Object.entries(results.endpoints)) {
    for (const error of result.errors) {
      results.recommendations.push({
        type: 'endpoint',
        severity: 'high',
        message: `Error en ${service} (${error.type}): ${error.endpoint} - ${error.error?.message || `HTTP ${error.error?.status}`}`,
        details: `Endpoint: ${error.url}\nTipo de Error: ${error.error?.name || 'HTTP Error'}\nMensaje: ${error.error?.message || error.error?.statusText || 'No hay detalles adicionales'}`
      });
    }
  }

  return results;
}

export async function formatDetailedResults(results) {
  let output = '=== DIAGNÓSTICO DETALLADO ===\n';
  output += `Timestamp: ${results.timestamp}\n\n`;

  // Resumen General
  output += '=== RESUMEN GENERAL ===\n';
  output += `Duración Total: ${results.summary.totalDuration}ms\n`;
  output += `Endpoints Totales: ${results.summary.totalEndpoints}\n`;
  output += `Exitosos: ${results.summary.successfulEndpoints}\n`;
  output += `Fallidos: ${results.summary.failedEndpoints}\n`;
  output += `Latencia Promedio: ${results.summary.averageLatency}ms\n\n`;

  // Configuración
  output += '=== CONFIGURACIÓN ===\n';
  output += `Entorno: ${results.config.environment}\n`;
  output += `URL Base: ${results.config.baseUrl}\n`;
  output += '-- WordPress --\n';
  output += `  Base URL: ${results.config.wordpress.baseUrl}\n`;
  output += `  Proxy URL: ${results.config.wordpress.proxyUrl}\n`;
  output += `  API Version: ${results.config.wordpress.apiVersion}\n`;
  output += '-- WooCommerce --\n';
  output += `  Base URL: ${results.config.woocommerce.baseUrl}\n`;
  output += `  Proxy URL: ${results.config.woocommerce.proxyUrl}\n`;
  output += `  API Version: ${results.config.woocommerce.apiVersion}\n`;
  output += `  Credenciales: ${results.config.woocommerce.hasCredentials ? '✓' : '✗'}\n`;
  output += '-- Backend --\n';
  output += `  Base URL: ${results.config.backend.baseUrl}\n`;
  output += `  Región: ${results.config.backend.region}\n`;
  output += `  Ambiente: ${results.config.backend.environment}\n`;
  output += '-- Seguridad --\n';
  output += `  CORS: ${results.config.security.cors.enabled ? '✓' : '✗'}\n`;
  output += `  SSL: ${results.config.security.ssl.enabled ? '✓' : '✗'} (${results.config.security.ssl.provider})\n\n`;

  // Conectividad
  output += '=== CONECTIVIDAD ===\n';
  output += `Inicio: ${results.connectivity.summary.startTime}\n`;
  output += `Fin: ${results.connectivity.summary.endTime}\n`;
  output += `Duración: ${results.connectivity.summary.totalDuration}ms\n`;
  output += `Peticiones Totales: ${results.connectivity.summary.totalRequests}\n`;
  output += `Exitosas: ${results.connectivity.summary.successfulRequests}\n`;
  output += `Fallidas: ${results.connectivity.summary.failedRequests}\n\n`;
  
  output += '-- Proxy --\n';
  output += `Estado: ${results.connectivity.proxy.status.success ? '✓' : '✗'}\n`;
  if (results.connectivity.proxy.status.success) {
    output += `CORS: ${results.connectivity.proxy.status.headers['access-control-allow-origin'] ? '✓' : '✗'}\n`;
    output += `Métodos: ${results.connectivity.proxy.status.headers['access-control-allow-methods']}\n`;
  } else {
    output += `Error: ${results.connectivity.proxy.status.error?.message || 'No responde'}\n`;
  }

  output += '\n-- Backend --\n';
  output += `Estado: ${results.connectivity.backend.status.success ? '✓' : '✗'}\n`;
  if (results.connectivity.backend.status.success) {
    output += `Respuesta: ${results.connectivity.backend.data?.message || 'OK'}\n`;
  } else {
    output += `Error: ${results.connectivity.backend.status.error?.message || 'No responde'}\n`;
  }

  // Endpoints
  output += '\n=== ENDPOINTS ===\n';
  for (const [service, result] of Object.entries(results.endpoints)) {
    output += `-- ${service} --\n`;
    output += `  Configuración:\n`;
    for (const [key, value] of Object.entries(result.config)) {
      output += `    ${key}: ${typeof value === 'object' ? JSON.stringify(value) : value}\n`;
    }
    output += `  Resumen:\n`;
    output += `    Total: ${result.summary.total}\n`;
    output += `    Exitosos: ${result.summary.success}\n`;
    output += `    Fallidos: ${result.summary.failed}\n`;
    output += `    Latencia Promedio: ${result.summary.avgLatency}ms\n`;
    
    if (result.direct && Object.keys(result.direct).length > 0) {
      output += '  Conexión Directa:\n';
      for (const [endpoint, test] of Object.entries(result.direct)) {
        output += `    ${endpoint}: ${test.success ? '✓' : '✗'} ${test.success ? `(${test.latency}ms)` : `(${test.error?.message || `HTTP ${test.status}`})`}\n`;
        if (test.success && test.data) {
          output += `      Respuesta: ${JSON.stringify(test.data)}\n`;
        }
        if (test.details?.response?.headers) {
          output += `      Headers: ${JSON.stringify(test.details.response.headers)}\n`;
        }
      }
    }
    
    if (result.proxy && Object.keys(result.proxy).length > 0) {
      output += '  Vía Proxy:\n';
      for (const [endpoint, test] of Object.entries(result.proxy)) {
        output += `    ${endpoint}: ${test.success ? '✓' : '✗'} ${test.success ? `(${test.latency}ms)` : `(${test.error?.message || `HTTP ${test.status}`})`}\n`;
        if (test.details?.response?.headers) {
          output += `      Headers: ${JSON.stringify(test.details.response.headers)}\n`;
        }
      }
    }
    output += '\n';
  }

  // Recomendaciones
  if (results.recommendations.length > 0) {
    output += '=== RECOMENDACIONES ===\n';
    for (const rec of results.recommendations) {
      output += `[${rec.severity.toUpperCase()}] ${rec.type}: ${rec.message}\n`;
      if (rec.details) {
        output += `  Detalles: ${rec.details}\n`;
      }
    }
  }

  return output;
}

export default {
  runDetailedDiagnostics,
  formatDetailedResults
}; 