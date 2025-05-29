import config from '@/config/config';
import wooConfig from '@/config/woocommerce';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Obtener credenciales de WooCommerce
    const WOO_COMMERCE_KEY = wooConfig.WOO_COMMERCE_KEY;
    const WOO_COMMERCE_SECRET = wooConfig.WOO_COMMERCE_SECRET;
    
    if (!WOO_COMMERCE_KEY || !WOO_COMMERCE_SECRET) {
      console.error('[Diagnóstico WooCommerce] Faltan credenciales');
      return res.status(500).json({ 
        error: 'Faltan credenciales de WooCommerce',
        details: 'No se han configurado las credenciales necesarias para acceder a la API de WooCommerce'
      });
    }
    
    // Construir URL con credenciales
    const targetUrl = `${wooConfig.WC_API_URL}/products?consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
    
    console.log(`[Diagnóstico WooCommerce] Conectando a: ${targetUrl.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&').replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1')}`);
    
    // Verificar que la URL sea HTTPS si estamos en producción
    if (process.env.NODE_ENV === 'production' && !targetUrl.startsWith('https')) {
      console.error(`[Diagnóstico WooCommerce] Error: URL insegura (${targetUrl.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&').replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1')}) en producción`);
      return res.status(400).json({
        error: 'URL insegura en producción',
        message: 'Las solicitudes en producción deben usar HTTPS',
        url: targetUrl.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&').replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1')
      });
    }
    
    // Intentar con una versión HTTP para probar si eso funciona
    let response;
    try {
      // Primer intento con la URL original (que debería ser HTTPS)
      response = await fetch(targetUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'GozaMadrid/1.0'
        }
      });
    } catch (fetchError) {
      // Si falla HTTPS, intenta con HTTP solo en modo desarrollo o prueba
      if (process.env.NODE_ENV !== 'production' && targetUrl.startsWith('https')) {
        const httpUrl = targetUrl.replace('https://', 'http://');
        console.log(`[Diagnóstico WooCommerce] Error con HTTPS, intentando con HTTP: ${httpUrl.replace(/consumer_key=.*?&/, 'consumer_key=HIDDEN&').replace(/consumer_secret=.*?($|&)/, 'consumer_secret=HIDDEN$1')}`);
        
        response = await fetch(httpUrl, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'GozaMadrid/1.0'
          }
        });
      } else {
        throw fetchError;
      }
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[Diagnóstico WooCommerce] Error de respuesta (${response.status}): ${errorText.substring(0, 500)}`);
      return res.status(response.status).json({ 
        error: `Error en la API de WooCommerce: ${response.status} ${response.statusText}`, 
        details: errorText
      });
    }

    const data = await response.json();
    console.log(`[Diagnóstico WooCommerce] Éxito: ${data.length} productos recuperados`);
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('[Diagnóstico WooCommerce] Error:', error);
    
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
      error: 'Error al conectar con la API de WooCommerce', 
      message: errorMessage,
      type: errorType,
      details: error.stack
    });
  }
} 