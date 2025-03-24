import { useState, useEffect } from 'react';
import config from '@/config/config';
import Head from 'next/head';

export default function DiagnosticsPage() {
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [protocolTestDomain, setProtocolTestDomain] = useState('');
  const [protocolResults, setProtocolResults] = useState(null);
  const [protocolTesting, setProtocolTesting] = useState(false);

  const runDiagnostics = async () => {
    setLoading(true);
    setError(null);
    setProgress(0);
    const startTime = Date.now();

    try {
      const endpoints = [
        {
          name: 'WordPress API (Directo - Via Proxy)',
          url: `/api/proxy/diagnostic/wordpress`,
          type: 'wordpress',
          expectedStatus: 200,
          timeout: 30000,
          originalUrl: 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wp/v2/posts'
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
          name: 'WooCommerce API (Directo - Via Proxy)',
          url: `/api/proxy/diagnostic/woocommerce`,
          type: 'woocommerce',
          expectedStatus: 200,
          timeout: 30000,
          originalUrl: `https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3/products?consumer_key=${config.WOO_COMMERCE_KEY}&consumer_secret=${config.WOO_COMMERCE_SECRET}`
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
          name: 'Backend API (MongoDB Directo - Via Proxy)',
          url: `${window.location.origin}/api/proxy/backend/properties`,
          type: 'mongodb-proxy',
          expectedStatus: 200,
          timeout: 60000,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          originalUrl: 'https://api.realestategozamadrid.com/api/properties'
        },
        {
          name: 'Backend API (MongoDB Sources - Via Proxy)',
          url: `${window.location.origin}/api/proxy/backend/properties/sources/mongodb`,
          type: 'mongodb-proxy-sources',
          expectedStatus: 200,
          timeout: 60000,
          mode: 'cors',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          },
          originalUrl: 'https://api.realestategozamadrid.com/api/properties/sources/mongodb'
        },
        {
          name: 'Backend API (Raíz HTTP)',
          url: `https://api.realestategozamadrid.com/`,
          type: 'root',
          expectedStatus: [200, 301, 302, 307, 308],
          timeout: 30000,
          mode: 'cors',
          credentials: 'omit',
          redirect: 'follow',
          headers: {
            'Accept': 'text/html',
            'Origin': window.location.origin
          }
        },
        {
          name: 'Backend API (Raíz HTTPS)',
          url: `https://api.realestategozamadrid.com/`,
          type: 'root',
          expectedStatus: 200,
          timeout: 30000,
          mode: 'cors',
          credentials: 'omit',
          headers: {
            'Accept': 'text/html',
            'Origin': window.location.origin
          },
          fallbackUrl: `https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/`,
          retry: true
        },
        {
          name: 'API Alternativa (HTTPS)',
          url: `https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/`,
          type: 'aws',
          expectedStatus: [200, 301, 302, 307, 308],
          timeout: 30000,
          mode: 'cors',
          credentials: 'omit',
          redirect: 'follow',
          headers: {
            'Accept': 'text/html',
            'Origin': window.location.origin
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
          vercel: process.env.VERCEL === '1',
          useHttpForApi: process.env.NEXT_PUBLIC_USE_HTTP_FOR_API === 'true',
          baseUrls: {
            wordpressDirect: config.WP_API_URL,
            wordpressProxy: `${window.location.origin}/api/proxy/wordpress`,
            woocommerceDirect: config.WC_API_URL,
            woocommerceProxy: `${window.location.origin}/api/proxy/woocommerce`,
            backend: config.API_URL || 'No configurado',
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
        endpoints: [],
        recommendations: []
      };

      // Procesamos los endpoints uno por uno para mostrar el progreso
      const results = [];
      for (let i = 0; i < endpoints.length; i++) {
        const endpoint = endpoints[i];
        setProgress(Math.floor((i / endpoints.length) * 100));
        
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
            'Cache-Control': 'no-cache',
            ...(endpoint.headers || {})
          };

          console.log(`Intentando conectar a: ${url} con headers:`, headers);
          
          let response;
          try {
            response = await fetch(url, { 
              headers,
              mode: endpoint.mode || 'cors',
              signal: controller.signal,
              credentials: endpoint.credentials || 'same-origin',
              keepalive: endpoint.keepalive || false,
              redirect: endpoint.redirect || 'manual'
            });
          } catch (fetchError) {
            if (endpoint.fallbackUrl && endpoint.retry) {
              console.log(`Error conectando a ${url}, intentando con URL alternativa: ${endpoint.fallbackUrl}`);
              url = endpoint.fallbackUrl;
              
              const newController = new AbortController();
              const newTimeoutId = setTimeout(() => {
                newController.abort();
              }, endpoint.timeout);
              
              response = await fetch(url, {
                headers,
                mode: endpoint.mode || 'cors',
                signal: newController.signal,
                credentials: endpoint.credentials || 'same-origin',
                keepalive: endpoint.keepalive || false,
                redirect: endpoint.redirect || 'manual'
              });
              
              clearTimeout(newTimeoutId);
            } else {
              throw fetchError;
            }
          }

          clearTimeout(timeoutId);
          
          const responseData = await response.text();
          let parsedData = null;

          try {
            parsedData = JSON.parse(responseData);
          } catch (e) {
            console.warn('Respuesta no es JSON válido:', e);
          }

          const isExpectedStatus = Array.isArray(endpoint.expectedStatus)
            ? endpoint.expectedStatus.includes(response.status)
            : response.status === endpoint.expectedStatus;

          const finalUrl = response.url || url;
          const redirected = finalUrl !== url;

          const endpointResult = {
            name: endpoint.name,
            url: url.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&')
                   .replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1'),
            finalUrl: redirected ? finalUrl : undefined,
            status: response.status,
            statusText: response.statusText,
            latency: Date.now() - requestStart,
            headers: Object.fromEntries(response.headers),
            success: isExpectedStatus,
            expectedStatus: endpoint.expectedStatus,
            redirected: redirected,
            responseSize: responseData.length,
            isJsonValid: !!parsedData,
            responsePreview: responseData.substring(0, 200) + '...',
            dnsResolved: true,
            sslValid: url.startsWith('https'),
            corsEnabled: response.headers.get('access-control-allow-origin') !== null
          };

          if (isExpectedStatus) {
            diagnosticResults.successfulEndpoints++;
            diagnosticResults.connectivity.successfulRequests++;
            results.push(endpointResult);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
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

          results.push({
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
          });
        }
      }

      diagnosticResults.endpoints = results;
      diagnosticResults.duration = Date.now() - startTime;
      diagnosticResults.connectivity.endTime = new Date().toISOString();
      diagnosticResults.averageLatency = diagnosticResults.endpoints.reduce(
        (acc, curr) => acc + (curr.latency || 0), 0
      ) / diagnosticResults.endpoints.length;

      // Añadir recomendaciones basadas en los resultados
      const httpEndpoints = diagnosticResults.endpoints.filter(e => e.url.startsWith('http:'));
      const httpsEndpoints = diagnosticResults.endpoints.filter(e => e.url.startsWith('https:'));
      
      const httpSuccess = httpEndpoints.filter(e => e.success).length;
      const httpsSuccess = httpsEndpoints.filter(e => e.success).length;
      
      // Verificar problemas específicos
      const timeoutIssues = diagnosticResults.endpoints.filter(e => e.timeout);
      const corsIssues = diagnosticResults.endpoints.filter(e => !e.corsEnabled && e.error?.includes('CORS'));
      const sslIssues = diagnosticResults.endpoints.filter(e => !e.sslValid);
      const dnsIssues = diagnosticResults.endpoints.filter(e => !e.dnsResolved);
      
      // Generar recomendaciones
      if (timeoutIssues.length > 0) {
        diagnosticResults.recommendations.push({
          issue: 'Timeouts',
          description: 'Algunos endpoints están tardando demasiado en responder',
          affectedEndpoints: timeoutIssues.map(e => e.name),
          solution: 'Considera aumentar el timeout o verificar la disponibilidad de los servidores'
        });
      }
      
      if (httpSuccess > 0 && httpsSuccess === 0) {
        diagnosticResults.recommendations.push({
          issue: 'HTTPS no disponible',
          description: 'Las conexiones HTTP funcionan pero HTTPS no responde',
          affectedEndpoints: httpsEndpoints.filter(e => !e.success).map(e => e.name),
          solution: 'Utiliza conexiones HTTP o configura correctamente SSL en el servidor'
        });
      }
      
      if (corsIssues.length > 0) {
        diagnosticResults.recommendations.push({
          issue: 'Problemas CORS',
          description: 'Hay problemas de CORS con algunos endpoints',
          affectedEndpoints: corsIssues.map(e => e.name),
          solution: 'Configura correctamente los headers CORS en el servidor o usa el proxy API'
        });
      }
      
      if (dnsIssues.length > 0) {
        diagnosticResults.recommendations.push({
          issue: 'Problemas DNS',
          description: 'No se pueden resolver algunos dominios',
          affectedEndpoints: dnsIssues.map(e => e.name),
          solution: 'Verifica la configuración DNS o los nombres de dominio'
        });
      }

      setProgress(100);
      setResults(diagnosticResults);
    } catch (error) {
      setError(error.message);
      console.error('Error ejecutando diagnósticos:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportResults = () => {
    if (!results) return;
    
    const dataStr = JSON.stringify(results, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = `diagnostico-gozamadrid-${new Date().toISOString().slice(0,19).replace(/:/g,'-')}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  const runProtocolTest = async () => {
    if (!protocolTestDomain) {
      alert('Por favor ingresa un dominio para probar');
      return;
    }
    
    setProtocolTesting(true);
    setProtocolResults(null);
    
    try {
      const response = await fetch(`/api/proxy/diagnostic/protocol-test?domain=${encodeURIComponent(protocolTestDomain)}`);
      
      if (!response.ok) {
        throw new Error(`Error en la prueba: ${response.status} ${response.statusText}`);
      }
      
      const data = await response.json();
      setProtocolResults(data);
    } catch (error) {
      console.error('Error en prueba de protocolo:', error);
      setError(`Error en prueba de protocolo: ${error.message}`);
    } finally {
      setProtocolTesting(false);
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
          
          <div className="bg-white shadow rounded-lg p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Prueba de Protocolo HTTP vs HTTPS</h2>
            <p className="mb-4">Comprueba si un dominio responde correctamente tanto a HTTP como a HTTPS:</p>
            
            <div className="flex flex-col sm:flex-row gap-4 mb-4">
              <input
                type="text"
                value={protocolTestDomain}
                onChange={(e) => setProtocolTestDomain(e.target.value)}
                placeholder="Dominio (ej: api.realestategozamadrid.com)"
                className="flex-grow p-2 border rounded"
              />
              <button
                onClick={runProtocolTest}
                disabled={protocolTesting || !protocolTestDomain}
                className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded"
              >
                {protocolTesting ? 'Probando...' : 'Probar Protocolo'}
              </button>
            </div>
            
            {protocolResults && (
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-lg mb-2">Resultados para {protocolResults.domain}</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className={`p-4 rounded ${protocolResults.http.works ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h4 className="font-medium">HTTP</h4>
                    <p><span className="font-medium">Estado:</span> {protocolResults.http.works ? '✓ Funciona' : '✗ No funciona'}</p>
                    {protocolResults.http.statusCode && (
                      <p><span className="font-medium">Código:</span> {protocolResults.http.statusCode}</p>
                    )}
                    {protocolResults.http.responseTime && (
                      <p><span className="font-medium">Tiempo:</span> {protocolResults.http.responseTime}ms</p>
                    )}
                    {protocolResults.http.redirectedTo && (
                      <p><span className="font-medium">Redirigido a:</span> {protocolResults.http.redirectedTo}</p>
                    )}
                    {protocolResults.http.error && (
                      <p><span className="font-medium text-red-700">Error:</span> {protocolResults.http.error}</p>
                    )}
                  </div>
                  
                  <div className={`p-4 rounded ${protocolResults.https.works ? 'bg-green-50' : 'bg-red-50'}`}>
                    <h4 className="font-medium">HTTPS</h4>
                    <p><span className="font-medium">Estado:</span> {protocolResults.https.works ? '✓ Funciona' : '✗ No funciona'}</p>
                    {protocolResults.https.statusCode && (
                      <p><span className="font-medium">Código:</span> {protocolResults.https.statusCode}</p>
                    )}
                    {protocolResults.https.responseTime && (
                      <p><span className="font-medium">Tiempo:</span> {protocolResults.https.responseTime}ms</p>
                    )}
                    {protocolResults.https.redirectedTo && (
                      <p><span className="font-medium">Redirigido a:</span> {protocolResults.https.redirectedTo}</p>
                    )}
                    {protocolResults.https.error && (
                      <p><span className="font-medium text-red-700">Error:</span> {protocolResults.https.error}</p>
                    )}
                  </div>
                </div>
                
                {protocolResults.recommendation && (
                  <div className="p-4 bg-blue-50 rounded border-l-4 border-blue-500">
                    <p className="font-medium">Recomendación:</p>
                    <p>{protocolResults.recommendation}</p>
                    
                    {protocolResults.https.error && protocolResults.https.error.includes('certificate') && (
                      <div className="mt-2">
                        <p className="font-medium text-red-700">Problema de Certificado SSL detectado</p>
                        <p>El certificado SSL para este dominio parece no ser válido o está mal configurado.</p>
                      </div>
                    )}
                    
                    {protocolResults.https.error && protocolResults.https.error.includes('Mixed Content') && (
                      <div className="mt-2">
                        <p className="font-medium text-yellow-700">Problema de Contenido Mixto detectado</p>
                        <p>Este sitio está intentando cargar recursos HTTP desde una página HTTPS, lo que puede causar bloqueos.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div className="flex gap-4 mb-6">
            <button
              onClick={runDiagnostics}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
            >
              {loading ? 'Ejecutando diagnóstico...' : 'Ejecutar Diagnóstico Completo'}
            </button>
            
            {results && (
              <button
                onClick={exportResults}
                className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded"
              >
                Exportar resultados (JSON)
              </button>
            )}
          </div>

          {loading && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
                <div className="bg-blue-600 h-4 rounded-full" style={{ width: `${progress}%` }}></div>
              </div>
              <p className="text-center">{progress}% completado</p>
            </div>
          )}

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
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Timestamp</p>
                    <p>{new Date(results.timestamp).toLocaleString()}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Duración Total</p>
                    <p>{results.duration}ms</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Endpoints OK / Total</p>
                    <p>{results.successfulEndpoints} / {results.totalEndpoints}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded">
                    <p className="font-medium">Latencia Promedio</p>
                    <p>{Math.round(results.averageLatency)}ms</p>
                  </div>
                </div>
              </div>
              
              {/* Recomendaciones */}
              {results.recommendations && results.recommendations.length > 0 && (
                <div className="bg-yellow-50 shadow rounded-lg p-6">
                  <h2 className="text-xl font-semibold mb-4">Recomendaciones</h2>
                  <div className="space-y-4">
                    {results.recommendations.map((rec, index) => (
                      <div key={index} className="p-4 bg-white rounded border-l-4 border-yellow-500">
                        <p className="font-bold text-lg">{rec.issue}</p>
                        <p className="mt-1">{rec.description}</p>
                        <p className="mt-2 font-medium">Afecta a:</p>
                        <ul className="list-disc ml-5">
                          {rec.affectedEndpoints.map((endpoint, i) => (
                            <li key={i}>{endpoint}</li>
                          ))}
                        </ul>
                        <p className="mt-2 font-medium">Solución recomendada:</p>
                        <p className="bg-yellow-100 p-2 rounded mt-1">{rec.solution}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Configuración */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Configuración</h2>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium">Entorno</h3>
                    <div className="bg-gray-50 p-4 rounded mt-2 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <p className="font-medium">NODE_ENV:</p>
                        <p>{results.configuration.environment || 'No definido'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Vercel:</p>
                        <p>{results.configuration.vercel ? 'Sí' : 'No'}</p>
                      </div>
                      <div>
                        <p className="font-medium">Usar HTTP para API:</p>
                        <p>{results.configuration.useHttpForApi ? 'Sí' : 'No'}</p>
                      </div>
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium">URLs Base</h3>
                    <pre className="bg-gray-50 p-4 rounded mt-2 overflow-x-auto">
                      {JSON.stringify(results.configuration.baseUrls, null, 2)}
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

              {/* Resultados por tipo de conexión */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resultados por tipo de conexión</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-lg mb-2">Conexiones HTTP</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      {results.endpoints.filter(e => e.url?.startsWith('http:')).length > 0 ? (
                        <div>
                          <p>
                            <span className="font-medium">Éxito:</span> 
                            {results.endpoints.filter(e => e.url?.startsWith('http:') && e.success).length} / 
                            {results.endpoints.filter(e => e.url?.startsWith('http:')).length}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {results.endpoints
                              .filter(e => e.url?.startsWith('http:'))
                              .map((e, i) => (
                                <li key={i} className={`${e.success ? 'text-green-600' : 'text-red-600'}`}>
                                  {e.name}: {e.success ? '✓' : '✗'} 
                                  {e.error ? ` (${e.error})` : ''}
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      ) : (
                        <p>No hay conexiones HTTP configuradas</p>
                      )}
                    </div>
                  </div>
                  <div>
                    <h3 className="font-medium text-lg mb-2">Conexiones HTTPS</h3>
                    <div className="bg-gray-50 p-4 rounded">
                      {results.endpoints.filter(e => e.url?.startsWith('https:')).length > 0 ? (
                        <div>
                          <p>
                            <span className="font-medium">Éxito:</span> 
                            {results.endpoints.filter(e => e.url?.startsWith('https:') && e.success).length} / 
                            {results.endpoints.filter(e => e.url?.startsWith('https:')).length}
                          </p>
                          <ul className="mt-2 space-y-1">
                            {results.endpoints
                              .filter(e => e.url?.startsWith('https:'))
                              .map((e, i) => (
                                <li key={i} className={`${e.success ? 'text-green-600' : 'text-red-600'}`}>
                                  {e.name}: {e.success ? '✓' : '✗'} 
                                  {e.error ? ` (${e.error})` : ''}
                                </li>
                              ))
                            }
                          </ul>
                        </div>
                      ) : (
                        <p>No hay conexiones HTTPS configuradas</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Resultados por Endpoint */}
              <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4">Resultados detallados por Endpoint</h2>
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
                        {endpoint.redirected && (
                          <p><span className="font-medium">Redirigido a:</span> {endpoint.finalUrl}</p>
                        )}
                        <p><span className="font-medium">Estado:</span> {endpoint.status || 'N/A'} ({endpoint.statusText || 'N/A'})</p>
                        <p><span className="font-medium">Latencia:</span> {endpoint.latency}ms</p>
                        <p><span className="font-medium">DNS Resuelto:</span> {endpoint.dnsResolved ? 'Sí' : 'No'}</p>
                        <p><span className="font-medium">SSL Válido:</span> {endpoint.sslValid ? 'Sí' : 'No'}</p>
                        <p><span className="font-medium">CORS Habilitado:</span> {endpoint.corsEnabled ? 'Sí' : 'No'}</p>
                        {endpoint.redirected && (
                          <p><span className="font-medium">Redirección:</span> Sí</p>
                        )}
                        
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