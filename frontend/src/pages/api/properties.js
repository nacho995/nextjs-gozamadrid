/**
 * API unificada para obtener propiedades de todas las fuentes
 * @param {import('next').NextApiRequest} req
 * @param {import('next').NextApiResponse} res
 */
export default async function handler(req, res) {
  // Log para verificar que la petición llega correctamente
  console.log(`[properties] API de propiedades unificada - Método: ${req.method}`);
  
  try {
    // Configurar headers para evitar caché
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    
    // 1. Obtener propiedades desde MongoDB (API de AWS Elastic Beanstalk)
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    
    console.log(`[properties] Solicitando propiedades de MongoDB desde: ${API_URL}/property`);
    
    const mongoResponse = await fetch(`${API_URL}/property`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      },
      timeout: 30000 // 30 segundos de timeout
    }).catch(error => {
      console.error('[properties] Error al obtener propiedades de MongoDB:', error.message);
      return null;
    });
    
    // Procesar propiedades de MongoDB
    let mongoProperties = [];
    if (mongoResponse && mongoResponse.ok) {
      try {
        const data = await mongoResponse.json();
        if (Array.isArray(data)) {
          console.log(`[properties] Recuperadas ${data.length} propiedades de MongoDB`);
          mongoProperties = data.map(property => ({
            ...property,
            source: 'mongodb',
            type: 'mongodb',
            // Asegurarnos de que tiene id y _id para compatibilidad
            id: property._id || property.id,
            _id: property._id || property.id
          }));
        } else {
          console.error('[properties] La respuesta de MongoDB no es un array:', data);
        }
      } catch (error) {
        console.error('[properties] Error al procesar propiedades de MongoDB:', error);
      }
    } else if (mongoResponse) {
      console.error(`[properties] Error en respuesta de MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}`);
      try {
        const errorText = await mongoResponse.text();
        console.error('[properties] Detalle del error de MongoDB:', errorText.substring(0, 200));
      } catch (e) {
        console.error('[properties] No se pudo leer el detalle del error de MongoDB');
      }
    }
    
    // 2. Obtener propiedades desde WooCommerce
    console.log('[properties] Solicitando propiedades de WooCommerce');
    
    const wcResponse = await fetch(`${req.headers.host}/api/woocommerce-proxy?path=products&per_page=100`, {
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      },
      timeout: 30000 // 30 segundos de timeout
    }).catch(error => {
      console.error('[properties] Error al obtener propiedades de WooCommerce:', error.message);
      return null;
    });
    
    // Procesar propiedades de WooCommerce
    let wcProperties = [];
    if (wcResponse && wcResponse.ok) {
      try {
        const data = await wcResponse.json();
        if (Array.isArray(data)) {
          console.log(`[properties] Recuperadas ${data.length} propiedades de WooCommerce`);
          wcProperties = data.map(property => ({
            ...property,
            source: 'woocommerce',
            type: 'woocommerce'
          }));
        } else {
          console.error('[properties] La respuesta de WooCommerce no es un array:', data);
        }
      } catch (error) {
        console.error('[properties] Error al procesar propiedades de WooCommerce:', error);
      }
    } else if (wcResponse) {
      console.error(`[properties] Error en respuesta de WooCommerce: ${wcResponse.status} ${wcResponse.statusText}`);
    }
    
    // 3. Combinar todas las propiedades
    const allProperties = [...mongoProperties, ...wcProperties];
    
    console.log(`[properties] Total propiedades combinadas: ${allProperties.length} (MongoDB: ${mongoProperties.length}, WooCommerce: ${wcProperties.length})`);
    
    // 4. Devolver la respuesta
    return res.status(200).json({
      success: true,
      properties: allProperties,
      count: allProperties.length,
      sources: {
        mongodb: mongoProperties.length,
        woocommerce: wcProperties.length
      }
    });
    
  } catch (error) {
    console.error('[properties] Error general en API de propiedades:', error);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      properties: []
    });
  }
} 