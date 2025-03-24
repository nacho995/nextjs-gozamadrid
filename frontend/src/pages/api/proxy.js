import config from '@/config/config';
import wooConfig from '@/config/woocommerce';

/**
 * Proxy genérico para múltiples servicios
 * 
 * Este endpoint permite hacer solicitudes proxy a diferentes servicios (mongodb, woocommerce, wordpress)
 * agregando las credenciales necesarias y evitando problemas de CORS.
 * 
 * Parámetros de consulta:
 * - source: Fuente de datos (mongodb, woocommerce, wordpress)
 * - path: Ruta de la API a la que se quiere acceder
 * - Otros parámetros se pasan directamente al endpoint destino
 */
export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept, X-Requested-With, Origin, X-Api-Key');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Obtener parámetros
    const { source, path } = req.query;
    
    if (!source) {
      return res.status(400).json({
        error: 'Parámetro requerido faltante',
        message: 'El parámetro "source" es obligatorio',
        example: '/api/proxy?source=mongodb&path=/properties'
      });
    }

    let targetUrl = '';
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'GozaMadrid/1.0'
    };

    // Construir URL de destino según la fuente
    switch (source.toLowerCase()) {
      case 'mongodb':
        // Construir URL para MongoDB
        targetUrl = `http://api.realestategozamadrid.com/api${path ? `/${path.replace(/^\//, '')}` : ''}`;
        break;

      case 'woocommerce':
        // Construir URL para WooCommerce con verificación de wooConfig
        if (!wooConfig || !wooConfig.WC_API_URL) {
          console.error('[Proxy] Error: Configuración de WooCommerce no disponible');
          return res.status(500).json({
            error: 'Error de configuración',
            message: 'Configuración de WooCommerce no disponible'
          });
        }

        targetUrl = `${wooConfig.WC_API_URL}${path ? `/${path.replace(/^\//, '')}` : ''}`;
        
        // Añadir parámetros de autenticación si están disponibles
        if (wooConfig.WOO_COMMERCE_KEY && wooConfig.WOO_COMMERCE_SECRET) {
          const separator = targetUrl.includes('?') ? '&' : '?';
          targetUrl += `${separator}consumer_key=${wooConfig.WOO_COMMERCE_KEY}&consumer_secret=${wooConfig.WOO_COMMERCE_SECRET}`;
        } else {
          console.warn('[Proxy] Advertencia: Credenciales de WooCommerce no disponibles');
        }
        break;

      case 'wordpress':
        // Construir URL para WordPress con verificación de config
        if (!config || !config.WP_API_URL) {
          console.error('[Proxy] Error: Configuración de WordPress no disponible');
          return res.status(500).json({
            error: 'Error de configuración',
            message: 'Configuración de WordPress no disponible'
          });
        }

        targetUrl = `${config.WP_API_URL}${path ? `/${path.replace(/^\//, '')}` : ''}`;
        break;

      default:
        return res.status(400).json({
          error: 'Fuente no válida',
          message: 'La fuente debe ser: mongodb, woocommerce o wordpress',
          validSources: ['mongodb', 'woocommerce', 'wordpress']
        });
    }
    
    // Verificar que la URL se haya construido correctamente
    if (!targetUrl) {
      return res.status(500).json({
        error: 'Error de configuración',
        message: 'No se pudo construir la URL de destino'
      });
    }
    
    // Agregar parámetros de consulta adicionales
    const queryParams = new URLSearchParams();
    
    // Copiar todos los parámetros excepto source y path
    Object.keys(req.query).forEach(key => {
      if (key !== 'source' && key !== 'path') {
        queryParams.append(key, req.query[key]);
      }
    });

    // Agregar parámetros a la URL
    if (queryParams.toString()) {
      targetUrl += (targetUrl.includes('?') ? '&' : '?') + queryParams.toString();
    }

    console.log(`[Proxy] Redirigiendo a: ${targetUrl}`);
    
    // Realizar la petición
    const fetchOptions = {
      method: req.method,
      headers,
      body: req.method !== 'GET' && req.method !== 'HEAD' ? JSON.stringify(req.body) : undefined
    };
    
    // Añadir timeout para no bloquear demasiado tiempo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
    fetchOptions.signal = controller.signal;
    
    try {
      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      // Verificar si la respuesta es válida
      if (!response.ok) {
        console.error(`[Proxy] Error en la respuesta: ${response.status} ${response.statusText}`);
      }
      
      // Intentar leer la respuesta como JSON
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        try {
          data = await response.json();
        } catch (e) {
          console.error('[Proxy] Error al parsear JSON:', e);
          return res.status(response.status).send('Error al procesar la respuesta como JSON');
        }
      } else {
        // Si no es JSON, enviar el texto
        try {
          const text = await response.text();
          return res.status(response.status).send(text);
        } catch (e) {
          console.error('[Proxy] Error al obtener texto de respuesta:', e);
          return res.status(response.status).send('Error al procesar la respuesta como texto');
        }
      }
      
      // Devolver la respuesta con el mismo status
      return res.status(response.status).json(data);
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError.name === 'AbortError') {
        return res.status(504).json({
          error: 'Timeout',
          message: 'La solicitud no pudo completarse en el tiempo establecido',
          source
        });
      }
      
      console.error('[Proxy] Error en fetch:', fetchError);
      return res.status(500).json({
        error: 'Error al realizar la solicitud',
        message: fetchError.message
      });
    }
  } catch (error) {
    console.error('[Proxy] Error general:', error);
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message
    });
  }
} 