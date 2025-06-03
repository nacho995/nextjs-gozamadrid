import config from '@/config/config';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const targetUrl = `${config.WP_API_URL}/posts`;
    
    console.log(`[Diagnóstico WordPress] Conectando a: ${targetUrl}`);
    
    // Verificar que la URL sea HTTPS si estamos en producción
    if (process.env.NODE_ENV === 'production' && !targetUrl.startsWith('https')) {
      console.error(`[Diagnóstico WordPress] Error: URL insegura (${targetUrl}) en producción`);
      return res.status(400).json({
        error: 'URL insegura en producción',
        message: 'Las solicitudes en producción deben usar HTTPS',
        url: targetUrl
      });
    }
    
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid/1.0'
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Diagnóstico WordPress] Error de respuesta (${response.status}): ${errorText.substring(0, 500)}`);
      return res.status(response.status).json({ 
        error: `Error en la API de WordPress: ${response.status} ${response.statusText}`, 
        details: errorText
      });
    }

    const data = await response.json();
    console.log(`[Diagnóstico WordPress] Éxito: ${data.length} posts recuperados`);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Diagnóstico WordPress] Error:', error);
    
    // Agregar información más específica sobre el error
    let errorMessage = error.message;
    let errorType = 'error_general';
    
    if (error.message.includes('CORS')) {
      errorType = 'error_cors';
      errorMessage = 'Error de CORS: El servidor remoto no permite peticiones desde este origen';
    } else if (error.message.includes('certificate')) {
      errorType = 'error_ssl';
      errorMessage = 'Error de SSL: Certificado inválido o problema de seguridad';
    } else if (error.message.includes('fetch')) {
      errorType = 'error_fetch';
      errorMessage = 'Error en la petición: No se pudo realizar la conexión';
    } else if (error.message.includes('Mixed Content')) {
      errorType = 'error_mixed_content';
      errorMessage = 'Error de contenido mixto: Intentando cargar contenido HTTP desde una página HTTPS';
    }
    
    return res.status(500).json({ 
      error: 'Error al conectar con la API de WordPress', 
      message: errorMessage,
      type: errorType,
      details: error.stack
    });
  }
} 