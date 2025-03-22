export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID de propiedad' });
  }

  const logs = [];
  const addLog = (message, type = 'info') => {
    logs.push({ 
      time: new Date().toISOString(), 
      message,
      type 
    });
  };

  // Función para verificar DNS
  const checkDNS = async (hostname) => {
    try {
      const dnsStartTime = performance.now();
      const response = await fetch(`https://${hostname}`);
      const dnsEndTime = performance.now();
      addLog(`DNS resolución exitosa para ${hostname} (${Math.round(dnsEndTime - dnsStartTime)}ms)`);
      return true;
    } catch (error) {
      addLog(`Error DNS para ${hostname}: ${error.message}`, 'error');
      return false;
    }
  };

  // Función para medir tiempo de respuesta
  const measureResponseTime = async (url) => {
    const startTime = performance.now();
    try {
      const response = await fetch(url, { method: 'HEAD' });
      const endTime = performance.now();
      return Math.round(endTime - startTime);
    } catch (error) {
      return -1;
    }
  };

  try {
    // Verificar variables de entorno
    addLog('Verificando variables de entorno...');
    const envVars = {
      NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
      NODE_ENV: process.env.NODE_ENV,
      VERCEL_ENV: process.env.VERCEL_ENV,
      VERCEL_URL: process.env.VERCEL_URL
    };
    addLog(`Variables de entorno: ${JSON.stringify(envVars)}`);

    // Verificar DNS de los servicios
    addLog('Iniciando verificación de DNS...');
    await checkDNS('realestategozamadrid.com');
    await checkDNS('api.realestategozamadrid.com');
    
    addLog(`Iniciando diagnóstico para ID: ${id}`);

    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    addLog(`¿Es ID de MongoDB? ${isMongoId}`);

    const MONGODB_API_URL = 'https://api.realestategozamadrid.com';
    addLog(`API URL configurada: ${MONGODB_API_URL}`);

    // Medir latencia
    const apiLatency = await measureResponseTime(MONGODB_API_URL);
    addLog(`Latencia al API: ${apiLatency}ms`);
    
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      addLog(`TIMEOUT alcanzado para la propiedad con ID: ${id}`, 'error');
      controller.abort();
    }, 15000);

    let response;
    const requestStartTime = performance.now();

    if (isMongoId) {
      addLog(`Obteniendo propiedad de MongoDB con ID ${id}`);
      try {
        const url = `${MONGODB_API_URL}/api/properties/${id}`;
        addLog(`URL de petición MongoDB: ${url}`);

        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Origin': process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com'
          }
        });

        const requestEndTime = performance.now();
        addLog(`Tiempo total de respuesta MongoDB: ${Math.round(requestEndTime - requestStartTime)}ms`);
        
        // Analizar headers de respuesta
        const headers = {};
        for (const [key, value] of response.headers.entries()) {
          headers[key] = value;
        }
        addLog(`Headers de respuesta MongoDB: ${JSON.stringify(headers)}`);
        
        if (!response.ok) {
          addLog(`Error en respuesta MongoDB: ${response.status} ${response.statusText}`, 'error');
          const errorBody = await response.text();
          addLog(`Cuerpo del error MongoDB: ${errorBody}`, 'error');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        addLog(`Error en fetch MongoDB: ${fetchError.message}`, 'error');
        addLog(`Stack trace: ${fetchError.stack}`, 'error');

        if (fetchError.name === 'AbortError') {
          return res.status(504).json({
            error: "Tiempo de espera agotado al obtener la propiedad",
            logs
          });
        }
        throw fetchError;
      }
    } else {
      addLog(`Obteniendo propiedad de WooCommerce con ID ${id}`);
      try {
        const url = `${MONGODB_API_URL}/api/proxy?service=wordpress&endpoint=products/${id}`;
        addLog(`URL de petición WooCommerce: ${url}`);

        // Verificar CORS
        addLog('Verificando configuración CORS...');
        const corsCheck = await fetch(url, { method: 'OPTIONS' });
        const corsHeaders = {};
        for (const [key, value] of corsCheck.headers.entries()) {
          if (key.toLowerCase().includes('cors') || key.toLowerCase().includes('access-control')) {
            corsHeaders[key] = value;
          }
        }
        addLog(`Headers CORS: ${JSON.stringify(corsHeaders)}`);

        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });

        const requestEndTime = performance.now();
        addLog(`Tiempo total de respuesta WooCommerce: ${Math.round(requestEndTime - requestStartTime)}ms`);

        // Analizar headers de respuesta
        const headers = {};
        for (const [key, value] of response.headers.entries()) {
          headers[key] = value;
        }
        addLog(`Headers de respuesta WooCommerce: ${JSON.stringify(headers)}`);

        // Verificar certificado SSL
        const sslInfo = response.headers.get('ssl-info');
        addLog(`Información SSL: ${sslInfo || 'No disponible'}`);

        if (!response.ok) {
          addLog(`Error en respuesta WooCommerce: ${response.status} ${response.statusText}`, 'error');
          const errorBody = await response.text();
          addLog(`Cuerpo del error WooCommerce: ${errorBody}`, 'error');
        }
      } catch (fetchError) {
        clearTimeout(timeoutId);
        addLog(`Error en fetch WooCommerce: ${fetchError.message}`, 'error');
        addLog(`Stack trace: ${fetchError.stack}`, 'error');

        if (fetchError.name === 'AbortError') {
          return res.status(504).json({
            error: "Tiempo de espera agotado al obtener la propiedad",
            logs,
            timestamp: new Date().toISOString()
          });
        }
        throw fetchError;
      }
    }

    clearTimeout(timeoutId);

    if (!response.ok) {
      return res.status(response.status).json({
        error: `Error al obtener la propiedad: ${response.statusText}`,
        status: response.status,
        logs,
        timestamp: new Date().toISOString()
      });
    }

    const data = await response.json();
    
    return res.status(200).json({
      success: true,
      data,
      logs,
      timestamp: new Date().toISOString(),
      diagnosticInfo: {
        apiUrl: MONGODB_API_URL,
        environment: process.env.NODE_ENV,
        vercelEnv: process.env.VERCEL_ENV,
        requestDuration: Math.round(performance.now() - requestStartTime)
      }
    });

  } catch (error) {
    addLog(`Error general: ${error.message}`, 'error');
    addLog(`Stack trace: ${error.stack}`, 'error');
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message,
      logs,
      timestamp: new Date().toISOString()
    });
  }
}