/**
 * Prueba si un dominio responde a HTTP, HTTPS o ambos
 * Útil para diagnosticar problemas de SSL, mixed content, o configuración de servidor
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Obtener el dominio a probar
  const { domain } = req.query;

  if (!domain) {
    return res.status(400).json({
      error: 'Se requiere un dominio para la prueba',
      message: 'Debe proporcionar un parámetro "domain" en la consulta'
    });
  }

  // Eliminar cualquier protocolo existente para estar seguros
  const cleanDomain = domain.replace(/^https?:\/\//, '');
  const httpUrl = `http://${cleanDomain}`;
  const httpsUrl = `https://${cleanDomain}`;

  const results = {
    domain: cleanDomain,
    timestamp: new Date().toISOString(),
    http: {
      works: false,
      statusCode: null,
      responseTime: null,
      error: null
    },
    https: {
      works: false,
      statusCode: null,
      responseTime: null,
      error: null
    },
    recommendation: null
  };

  // Probar HTTP
  try {
    console.log(`[Protocol Test] Probando HTTP para: ${httpUrl}`);
    const httpStart = Date.now();
    const httpResponse = await fetch(httpUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GozaMadrid/1.0',
        'Accept': 'text/html, application/json'
      },
      redirect: 'follow'
    });

    results.http.statusCode = httpResponse.status;
    results.http.responseTime = Date.now() - httpStart;
    results.http.works = httpResponse.status >= 200 && httpResponse.status < 500;
    
    if (httpResponse.redirected) {
      results.http.redirectedTo = httpResponse.url;
      results.http.redirectedToHttps = httpResponse.url.startsWith('https://');
    }
  } catch (error) {
    results.http.error = error.message;
    console.error(`[Protocol Test] Error HTTP: ${error.message}`);
  }

  // Probar HTTPS
  try {
    console.log(`[Protocol Test] Probando HTTPS para: ${httpsUrl}`);
    const httpsStart = Date.now();
    const httpsResponse = await fetch(httpsUrl, {
      method: 'GET',
      headers: {
        'User-Agent': 'GozaMadrid/1.0',
        'Accept': 'text/html, application/json'
      },
      redirect: 'follow'
    });

    results.https.statusCode = httpsResponse.status;
    results.https.responseTime = Date.now() - httpsStart;
    results.https.works = httpsResponse.status >= 200 && httpsResponse.status < 500;
    
    if (httpsResponse.redirected) {
      results.https.redirectedTo = httpsResponse.url;
      results.https.redirectedToHttp = httpsResponse.url.startsWith('http://') && !httpsResponse.url.startsWith('https://');
    }
  } catch (error) {
    results.https.error = error.message;
    console.error(`[Protocol Test] Error HTTPS: ${error.message}`);
  }

  // Determinar la recomendación
  if (results.https.works && results.http.works) {
    results.recommendation = 'Ambos protocolos funcionan. Se recomienda HTTPS por seguridad.';
  } else if (results.https.works) {
    results.recommendation = 'Solo HTTPS funciona. Esta es la configuración ideal.';
  } else if (results.http.works) {
    results.recommendation = 'Solo HTTP funciona. Considere configurar HTTPS para mayor seguridad.';
    
    if (results.https.error && results.https.error.includes('certificate')) {
      results.recommendation += ' Hay un problema con el certificado SSL.';
    }
  } else {
    results.recommendation = 'Ningún protocolo funciona. Verifique la disponibilidad del servidor.';
  }

  // Devolver resultados
  return res.status(200).json(results);
} 