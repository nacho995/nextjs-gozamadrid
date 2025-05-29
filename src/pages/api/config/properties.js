/**
 * API de Configuración (Backend)
 * Este endpoint proporciona configuración dinámica para el frontend, incluyendo:
 * - Disponibilidad de endpoints
 * - Configuración de timeouts y reintentos
 * - Credenciales y parámetros necesarios
 * 
 * Este endpoint es llamado por el frontend durante la inicialización en _app.js
 */

// Ya no necesitamos importar node-fetch, usamos el fetch nativo de Node.js 18+
// import fetch from 'node-fetch';

// Función para verificar la disponibilidad de un endpoint
async function checkEndpointAvailability(url, params = {}, timeout = 2000) {
  try {
    console.log(`[API Config] Verificando disponibilidad de: ${url}`);
    
    // Construir URL con parámetros si existen
    const targetUrl = params && Object.keys(params).length > 0
      ? `${url}?${new URLSearchParams(params).toString()}`
      : url;
    
    const response = await fetch(targetUrl + '?limit=1', {
      method: 'GET',
      signal: AbortSignal.timeout(timeout),
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });

    console.log(`[API Config] Respuesta de ${url}: ${response.status}`);
    return response.ok;
  } catch (error) {
    console.warn(`[API Config] Error verificando ${url}:`, error.message);
    return true; // Asumimos disponible en caso de error para intentar la petición real
  }
}

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,HEAD');
  res.setHeader('Access-Control-Allow-Headers', 'Accept, Content-Type, Authorization');
  res.setHeader('Access-Control-Max-Age', '86400');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Configuración por defecto
    const config = {
      timeout: 15000,
      retries: 3,
      backoff: true,
      endpoints: {
        woocommerce: {
          url: '/api/properties/sources/woocommerce',
          available: true,
          params: {}
        },
        mongodb: {
          url: '/api/properties/sources/mongodb', // Usar endpoint directo para MongoDB
          available: true,
          params: {}
        }
      },
      // Usar endpoints directos para ambos
      useProxyForMongoDB: false
    };

    // Obtener credenciales de WooCommerce PRIMERO
    const WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || process.env.WOO_COMMERCE_KEY;
    const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || process.env.WOO_COMMERCE_SECRET;

    if (WOO_COMMERCE_KEY && WOO_COMMERCE_SECRET) {
      config.endpoints.woocommerce.params = {
        consumer_key: WOO_COMMERCE_KEY,
        consumer_secret: WOO_COMMERCE_SECRET
      };
    } else {
      console.warn('[API Config] Faltan credenciales de WooCommerce');
      config.endpoints.woocommerce.available = false;
    }

    // Verificar disponibilidad de endpoints
    const protocol = req.headers['x-forwarded-proto'] || (req.connection.encrypted ? 'https' : 'http');
    const baseUrl = `${protocol}://${req.headers.host}`;

    try {
      // Para WooCommerce, necesitamos pasar las credenciales en la verificación
      const wooUrl = `${baseUrl}${config.endpoints.woocommerce.url}`;
      const wooAvailable = await checkEndpointAvailability(wooUrl, config.endpoints.woocommerce.params);
      config.endpoints.woocommerce.available = wooAvailable;
    } catch (error) {
      console.warn('[API Config] Error verificando WooCommerce:', error);
    }

    try {
      const mongoAvailable = await checkEndpointAvailability(`${baseUrl}${config.endpoints.mongodb.url}`);
      config.endpoints.mongodb.available = mongoAvailable;
    } catch (error) {
      console.warn('[API Config] Error verificando MongoDB:', error);
    }

    // Cachear la respuesta por 5 minutos
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate');
    
    return res.status(200).json({
      success: true,
      config,
      message: 'Configuración cargada correctamente'
    });

  } catch (error) {
    console.error('[API Config] Error general:', error);
    return res.status(500).json({
      success: false,
      error: 'Error al obtener la configuración',
      details: error.message
    });
  }
} 