import config from '@/config/config';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { slug = [] } = req.query;
  const service = slug[0]; // wordpress o woocommerce
  const endpoint = slug.slice(1).join('/') || '';

  if (!service) {
    return res.status(400).json({ error: 'Se requiere especificar el servicio en la URL' });
  }

  try {
    let targetUrl;
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'GozaMadrid/1.0'
    };

    // Obtener credenciales de WooCommerce
    const WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || process.env.WOO_COMMERCE_KEY || config.WOO_COMMERCE_KEY;
    const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || process.env.WOO_COMMERCE_SECRET || config.WOO_COMMERCE_SECRET;

    // Log de estado de credenciales
    console.log('[Proxy] Estado de credenciales:', {
      service,
      hasWooCommerceKey: !!WOO_COMMERCE_KEY,
      hasWooCommerceSecret: !!WOO_COMMERCE_SECRET,
      keyLength: WOO_COMMERCE_KEY?.length,
      secretLength: WOO_COMMERCE_SECRET?.length,
      fromEnv: !!(process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || process.env.WOO_COMMERCE_KEY),
      fromConfig: !!config.WOO_COMMERCE_KEY
    });

    // Verificar credenciales si es necesario
    if (service === 'woocommerce') {
      if (!WOO_COMMERCE_KEY || !WOO_COMMERCE_SECRET) {
        console.error('[Proxy] Error: Faltan credenciales de WooCommerce');
        return res.status(500).json({ 
          error: 'Error de configuración del servidor',
          details: 'Faltan credenciales de WooCommerce',
          service: 'woocommerce'
        });
      }
    }

    switch (service) {
      case 'wordpress':
        targetUrl = `${config.WP_API_URL}${endpoint ? `/${endpoint}` : ''}`;
        break;

      case 'woocommerce':
        targetUrl = `${config.WC_API_URL}${endpoint ? `/${endpoint}` : ''}`;
        
        // Añadir credenciales de WooCommerce
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl += `${separator}consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
        break;

      case 'backend':
        targetUrl = `${config.BACKEND_API_URL}${endpoint ? `/${endpoint}` : ''}`;
        break;

      default:
        return res.status(400).json({ 
          error: 'Servicio no válido',
          message: 'Los servicios válidos son: wordpress, woocommerce, backend'
        });
    }

    // Agregar parámetros de consulta adicionales
    const queryParams = new URLSearchParams(req.query);
    queryParams.delete('slug'); // Eliminar el parámetro slug que usa Next.js

    // Agregar los parámetros a la URL
    if (queryParams.toString()) {
      targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryParams.toString();
    }

    // Log de la petición (ocultando credenciales)
    const safeUrl = targetUrl.replace(/consumer_key=([^&]+)/, 'consumer_key=HIDDEN')
                           .replace(/consumer_secret=([^&]+)/, 'consumer_secret=HIDDEN');
    console.log('[Proxy] Request:', {
      service,
      endpoint,
      targetUrl: safeUrl,
      method: req.method,
      headers: Object.keys(headers)
    });

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    });

    // Log detallado de la respuesta
    console.log('[Proxy] Response:', {
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
      url: safeUrl
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Proxy] Error response:', {
        status: response.status,
        statusText: response.statusText,
        service,
        endpoint,
        body: errorText.substring(0, 200)
      });
      return res.status(response.status).json({ 
        error: 'Error en la respuesta del servidor',
        status: response.status,
        message: errorText,
        service
      });
    }

    const data = await response.json();
    
    // Log del resultado
    console.log('[Proxy] Success:', {
      service,
      endpoint,
      dataType: typeof data,
      isArray: Array.isArray(data),
      length: Array.isArray(data) ? data.length : null,
      sample: Array.isArray(data) && data.length > 0 ? {
        id: data[0].id,
        type: data[0].type
      } : null
    });

    return res.status(response.status).json(data);

  } catch (error) {
    console.error('[Proxy] Error:', {
      service,
      endpoint,
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: process.env.NODE_ENV === 'development' ? error.message : 'Error al procesar la solicitud',
      service
    });
  }
} 