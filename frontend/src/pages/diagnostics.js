import { useState, useEffect } from 'react';
import config from '@/config/config';
import Head from 'next/head';

export default function DiagnosticsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    const startTime = Date.now();

    try {
      const endpoints = [
        {
          name: 'WordPress API (Directo)',
          url: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2/posts',
          type: 'wordpress',
          expectedStatus: 200,
          timeout: 30000
        },
        {
          name: 'WordPress API (Proxy)',
          url: `${window.location.origin}/api/proxy/wordpress/posts`,
          type: 'wordpress-proxy',
          expectedStatus: 200,
          timeout: 30000,
          headers: {
            'Accept': 'application/json'
          }
        },
        {
          name: 'WooCommerce API (Directo)',
          url: `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/products?consumer_key=${config.WOO_COMMERCE_KEY}&consumer_secret=${config.WOO_COMMERCE_SECRET}`,
          type: 'woocommerce',
          expectedStatus: 200,
          timeout: 30000
        },
        {
          name: 'WooCommerce API (Proxy)',
          url: `${window.location.origin}/api/proxy/woocommerce/products`,
          type: 'woocommerce-proxy',
          expectedStatus: 200,
          timeout: 30000,
          headers: {
            'Accept': 'application/json'
          }
        },
        {
          name: 'Backend API (MongoDB)',
          url: `${window.location.origin}/api/properties`,
          type: 'mongodb',
          expectedStatus: 200,
          timeout: 60000,
          mode: 'cors',
          credentials: 'same-origin',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        },
        {
          name: 'Backend API (MongoDB Directo)',
          url: `https://api.realestategozamadrid/api/properties`,
          type: 'mongodb',
          expectedStatus: 200,
          timeout: 60000,
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'Origin': window.location.origin,
            'Access-Control-Request-Method': 'GET'
          }
        }
      ];

      const diagnosticResults = {
        timestamp: new Date().toISOString(),
        duration: 0,
        totalEndpoints: endpoints.length,
        successfulEndpoints: 0,
        failedEndpoints: 0,
        averageLatency: 0,
        configuration: {
          environment: process.env.NODE_ENV,
          baseUrls: {
            wordpressDirect: config.WP_API_URL,
            wordpressProxy: `${window.location.origin}/api/proxy/wordpress`,
            woocommerceDirect: config.WC_API_URL,
            woocommerceProxy: `${window.location.origin}/api/proxy/woocommerce`,
            backend: config.API_BASE_URL,
            backendProxy: `${window.location.origin}/api/properties`
          },
          woocommerce: {
            hasKey: !!config.WOO_COMMERCE_KEY,
            hasSecret: !!config.WOO_COMMERCE_SECRET
          },
          cors: {
            origin: window.location.origin,
            mode: 'cors'
          }
        },
        connectivity: {
          startTime: new Date().toISOString(),
          endTime: null,
          totalRequests: endpoints.length,
          successfulRequests: 0,
          failedRequests: 0,
          errors: []
        },
        endpoints: []
      };

      const results = await Promise.allSettled(
        endpoints.map(async (endpoint) => {
          const requestStart = Date.now();
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => {
              controller.abort();
              console.log(`Timeout alcanzado para ${endpoint.name} después de ${endpoint.timeout}ms`);
            }, endpoint.timeout);

            let url = endpoint.url;
            
            const headers = {
              'User-Agent': 'GozaMadrid/1.0',
              'Accept': 'application/json',
              'Origin': window.location.origin,
              ...(endpoint.headers || {})
            };

            console.log(`Intentando conectar a: ${url} con headers:`, headers);
            
            const response = await fetch(url, { 
              headers,
              mode: endpoint.mode || 'cors',
              signal: controller.signal,
              credentials: endpoint.credentials || 'same-origin',
              keepalive: endpoint.keepalive || false
            });

            clearTimeout(timeoutId);
            
            const responseData = await response.text();
            let parsedData = null;

            try {
              parsedData = JSON.parse(responseData);
            } catch (e) {
              console.warn('Respuesta no es JSON válido:', e);
            }

            const endpointResult = {
              name: endpoint.name,
              url: url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')
                     .replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1'),
              status: response.status,
              statusText: response.statusText,
              latency: Date.now() - requestStart,
              headers: Object.fromEntries(response.headers),
              success: response.ok,
              expectedStatus: endpoint.expectedStatus,
              responseSize: responseData.length,
              isJsonValid: !!parsedData,
              responsePreview: responseData.substring(0, 200) + '...',
              dnsResolved: true,
              sslValid: url.startsWith('https'),
              corsEnabled: response.headers.get('access-control-allow-origin') !== null
            };

            if (response.ok) {
              diagnosticResults.successfulEndpoints++;
              diagnosticResults.connectivity.successfulRequests++;
            } else {
              throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return endpointResult;
          } catch (error) {
            console.error(`Error con endpoint ${endpoint.name}:`, error);
            
            diagnosticResults.failedEndpoints++;
            diagnosticResults.connectivity.failedRequests++;
            
            const errorDetails = {
              endpoint: endpoint.name,
              error: error.name === 'AbortError' ? 'Timeout después de ' + (endpoint.timeout / 1000) + ' segundos' : error.message,
              type: error.name,
              isDNSError: error.message.includes('getaddrinfo'),
              isSSLError: error.message.includes('SSL') || error.message.includes('CERT'),
              isCORSError: error.message.includes('CORS'),
              isTimeout: error.name === 'AbortError',
              stack: error.stack
            };

            diagnosticResults.connectivity.errors.push(errorDetails);

            return {
              name: endpoint.name,
              url: endpoint.url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')
                             .replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1'),
              error: errorDetails.error,
              errorType: error.name,
              latency: Date.now() - requestStart,
              success: false,
              dnsResolved: !errorDetails.isDNSError,
              sslValid: !errorDetails.isSSLError,
              corsEnabled: !errorDetails.isCORSError,
              timeout: errorDetails.isTimeout
            };
          }
        })
      );

      diagnosticResults.endpoints = results.map(result => 
        result.status === 'fulfilled' ? result.value : {
          name: 'Unknown',
          error: result.reason?.message || 'Error desconocido',
          success: false
        }
      );

      diagnosticResults.duration = Date.now() - startTime;
      diagnosticResults.connectivity.endTime = new Date().toISOString();
      diagnosticResults.averageLatency = diagnosticResults.endpoints.reduce(
        (acc, curr) => acc + (curr.latency || 0), 0
      ) / diagnosticResults.endpoints.length;

      setResults(diagnosticResults);
    } catch (error) {
      setError(error.message);
      console.error('Error ejecutando diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Diagnóstico del Sistema - GozaMadrid</title>
        <meta name="robots" content="noindex,nofollow" />
      </Head>
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-3xl font-bold mb-6">Diagnóstico del Sistema</h1>
          
          <button
            onClick={runDiagnostics}
            disabled={loading}
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-6"
          >
            {loading ? 'Ejecutando diagnóstico...' : 'Ejecutar Diagnóstico'}
          </button>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              Error: {error}
            </div>
          )}

          {results && (
            <div className="space-y-6">
              {/* Resumen General */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resumen General</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Timestamp</p>
                    <p>{new Date(results.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Duración Total</p>
                    <p>{results.duration}ms</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Latencia Promedio</p>
                    <p>{Math.round(results.averageLatency)}ms</p>
                  </div>
                </div>
              </div>

              {/* Configuración */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Configuración</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">URLs Base</h3>
                    <pre className="bg-gray-50 p-4 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(results.configuration.baseUrls, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-medium">DNS</h3>
                    <pre className="bg-gray-50 p-4 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(results.configuration.dns, null, 2)}
                    </pre>
                  </div>
                  <div>
                    <h3 className="font-medium">WooCommerce</h3>
                    <pre className="bg-gray-50 p-4 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(results.configuration.woocommerce, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>

              {/* Resultados por Endpoint */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resultados por Endpoint</h2>
                <div className="space-y-4">
                  {results.endpoints.map((endpoint, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded ${
                        endpoint.success ? 'bg-green-50' : 'bg-red-50'
                      }`}
                    >
                      <h3 className="font-medium text-lg">{endpoint.name}</h3>
                      <div className="mt-2 space-y-2">
                        <p><span className="font-medium">URL:</span> {endpoint.url}</p>
                        <p><span className="font-medium">Estado:</span> {endpoint.status || 'N/A'} ({endpoint.statusText || 'N/A'})</p>
                        <p><span className="font-medium">Latencia:</span> {endpoint.latency}ms</p>
                        <p><span className="font-medium">DNS Resuelto:</span> {endpoint.dnsResolved ? 'Sí' : 'No'}</p>
                        <p><span className="font-medium">SSL Válido:</span> {endpoint.sslValid ? 'Sí' : 'No'}</p>
                        <p><span className="font-medium">CORS Habilitado:</span> {endpoint.corsEnabled ? 'Sí' : 'No'}</p>
                        
                        {endpoint.error && (
                          <div className="mt-2">
                            <p className="font-medium text-red-600">Error:</p>
                            <pre className="bg-red-100 p-2 rounded mt-1 overflow-x-auto">
                              {endpoint.error}
                            </pre>
                          </div>
                        )}

                        {endpoint.responsePreview && (
                          <div className="mt-2">
                            <p className="font-medium">Vista previa de respuesta:</p>
                            <pre className="bg-gray-100 p-2 rounded mt-1 overflow-x-auto">
                              {endpoint.responsePreview}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Errores de Conectividad */}
              {results.connectivity.errors.length > 0 && (
                <div className="bg-white shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Errores de Conectividad</h2>
                  <div className="space-y-4">
                    {results.connectivity.errors.map((error, index) => (
                      <div key={index} className="bg-red-50 p-4 rounded">
                        <p><span className="font-medium">Endpoint:</span> {error.endpoint}</p>
                        <p><span className="font-medium">Error:</span> {error.error}</p>
                        {error.details && (
                          <pre className="bg-red-100 p-2 rounded mt-2 overflow-x-auto">
                            {error.details}
                          </pre>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
} 