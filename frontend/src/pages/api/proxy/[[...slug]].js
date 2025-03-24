import config from '@/config/config';
import wooConfig from '@/config/woocommerce';

export default async function handler(req, res) {
  // Configurar CORS - Añadir todos los encabezados necesarios
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept, X-Requested-With, Origin, X-Api-Key');
  res.setHeader('Access-Control-Max-Age', '86400'); // 24 horas, para reducir preflight

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { slug = [], source } = req.query;
    
    // Compatibilidad con el antiguo formato: /api/proxy?source=xxx&path=yyy
    if (source) {
      // Compatibilidad con api/proxy.js
      const { path } = req.query;
      let targetUrl = '';
      let headers = {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid/1.0'
      };

      // Construir URL de destino según la fuente
      switch (source.toLowerCase()) {
        case 'mongodb':
          targetUrl = `http://api.realestategozamadrid.com/api${path ? `/${path.replace(/^\//, '')}` : ''}`;
          break;

        case 'woocommerce':
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
        if (key !== 'source' && key !== 'path' && key !== 'slug') {
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
    }

    // Si llegamos aquí, procesar con el formato de ruta: /api/proxy/[service]/[endpoint]
    const service = slug[0]; // wordpress o woocommerce o woocommerce-product
    const endpoint = slug.slice(1).join('/') || '';

    if (!service) {
      return res.status(400).json({ error: 'Se requiere especificar el servicio en la URL' });
    }

    let targetUrl;
    let headers = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'User-Agent': 'GozaMadrid/1.0'
    };

    // Obtener credenciales de WooCommerce
    const WOO_COMMERCE_KEY = wooConfig.WOO_COMMERCE_KEY;
    const WOO_COMMERCE_SECRET = wooConfig.WOO_COMMERCE_SECRET;
    const WC_API_URL = wooConfig.WC_API_URL;

    // Log de estado de credenciales
    console.log('[Proxy] Estado de credenciales:', {
      service,
      hasWooCommerceKey: !!WOO_COMMERCE_KEY,
      hasWooCommerceSecret: !!WOO_COMMERCE_SECRET,
      keyLength: WOO_COMMERCE_KEY?.length,
      secretLength: WOO_COMMERCE_SECRET?.length,
      wcApiUrl: WC_API_URL,
      wpApiUrl: config.WP_API_URL
    });

    // Verificar credenciales si es necesario
    if ((service === 'woocommerce' || service === 'woocommerce-product') && !wooConfig.hasCredentials()) {
      console.error('[Proxy] Error: Faltan credenciales de WooCommerce');
      return res.status(500).json({ 
        error: 'Error de configuración del servidor',
        details: 'Faltan credenciales de WooCommerce',
        service: 'woocommerce'
      });
    }

    switch (service) {
      case 'wordpress':
        targetUrl = `${config.WP_API_URL}${endpoint ? `/${endpoint}` : ''}`;
        break;

      case 'woocommerce':
        targetUrl = `${WC_API_URL}${endpoint ? `/${endpoint}` : ''}`;
        
        // Añadir credenciales de WooCommerce
        const separator = targetUrl.includes('?') ? '&' : '?';
        targetUrl += `${separator}consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
        break;
        
      case 'woocommerce-product':
        // Manejar solicitud de producto específico
        const productId = slug[1] || req.query.id;
        if (!productId) {
          return res.status(400).json({
            error: 'Falta el ID del producto',
            message: 'Se requiere el ID del producto en la URL o como parámetro id'
          });
        }
        
        console.log(`[Proxy] Solicitando producto WooCommerce con ID: ${productId}`);
        
        // Utilizar la función getProductUrl de la configuración
        targetUrl = wooConfig.getProductUrl(productId);
        
        // Log adicional para depuración
        console.log(`[Proxy] URL generada para producto: ${targetUrl.replace(/consumer_key=([^&]+)/, 'consumer_key=HIDDEN')
                                 .replace(/consumer_secret=([^&]+)/, 'consumer_secret=HIDDEN')}`);
        break;

      case 'backend':
        targetUrl = `${config.BACKEND_API_URL}${endpoint ? `/${endpoint}` : ''}`;
        break;

      default:
        return res.status(400).json({ 
          error: 'Servicio no válido',
          message: 'Los servicios válidos son: wordpress, woocommerce, woocommerce-product, backend'
        });
    }

    // Verificar si la URL de destino es válida
    if (!targetUrl || !targetUrl.startsWith('http')) {
      console.error('[Proxy] URL de destino inválida:', {
        service,
        endpoint,
        targetUrl: targetUrl || 'undefined',
        config: {
          WP_API_URL: config.WP_API_URL || 'no definido',
          WC_API_URL: config.WC_API_URL || 'no definido',
          BACKEND_API_URL: config.BACKEND_API_URL || 'no definido'
        }
      });
      
      return res.status(500).json({
        error: 'URL de destino inválida',
        message: 'La configuración del servidor no tiene una URL válida para este servicio',
        service
      });
    }

    // Agregar parámetros de consulta adicionales
    const queryParams = new URLSearchParams();
    
    // Copiar todos los parámetros excepto los que ya procesamos
    Object.keys(req.query).forEach(key => {
      if (key !== 'slug' && key !== 'id' && !(service === 'woocommerce-product' && key === 'id')) {
        queryParams.append(key, req.query[key]);
      }
    });

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
      headers: Object.keys(headers),
      query: req.query,
      slug: slug
    });

    // Realizar la petición al endpoint destino
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

    // Manejo especial para errores 404 en woocommerce-product
    if (!response.ok) {
      const errorText = await response.text();
      console.error('[Proxy] Error response:', {
        status: response.status,
        statusText: response.statusText,
        service,
        endpoint,
        url: safeUrl,
        body: errorText.substring(0, 500)
      });
      
      // Manejo específico para errores 404 en productos WooCommerce
      if (service === 'woocommerce-product' && response.status === 404) {
        console.log(`[Proxy] Error 404 para producto ID ${slug[1] || req.query.id} en WooCommerce`);
        
        // Intentar obtener una lista de productos disponibles para sugerir alternativas
        try {
          const productsUrl = `${WC_API_URL}/products?consumer_key=${WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}&per_page=5`;
          console.log('[Proxy] Obteniendo productos alternativos');
          
          const alternativesResponse = await fetch(productsUrl, {
            headers,
            method: 'GET'
          });
          
          if (alternativesResponse.ok) {
            const alternatives = await alternativesResponse.json();
            console.log(`[Proxy] Se encontraron ${alternatives.length} productos alternativos`);
            
            return res.status(404).json({
              error: 'Producto no encontrado',
              message: `La propiedad con ID ${slug[1] || req.query.id} no existe o ya no está disponible.`,
              suggestions: alternatives.slice(0, 5).map(p => ({
                id: p.id,
                name: p.name,
                price: p.price,
                images: p.images && p.images.length > 0 ? [p.images[0].src] : []
              })),
              source: 'woocommerce',
              // Información detallada para depuración
              debug: {
                requestedId: slug[1] || req.query.id,
                requestUrl: safeUrl.split('?')[0],
                service,
                status: response.status
              }
            });
          }
        } catch (altError) {
          console.error('[Proxy] Error al obtener alternativas:', altError.message);
        }
      }
      
      return res.status(response.status).json({ 
        error: 'Error en la respuesta del servidor',
        status: response.status,
        message: errorText,
        service,
        endpoint,
        url: safeUrl.split('?')[0]  // URL sin parámetros para debugging
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
    console.error('[Proxy] Error:', error);
    
    return res.status(500).json({
      error: 'Error interno del servidor',
      message: error.message || 'Se produjo un error al procesar la solicitud',
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
} 