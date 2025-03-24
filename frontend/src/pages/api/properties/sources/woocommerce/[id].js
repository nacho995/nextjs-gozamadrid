// Este endpoint sirve como proxy para obtener una propiedad específica de WooCommerce
export default async function handler(req, res) {
  const { id } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID de propiedad' });
  }
  
  try {
    // Obtener las claves de WooCommerce
    const wcKey = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
    const wcSecret = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
    
    // Construir la URL para obtener la propiedad de WooCommerce
    const wcUrl = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
    const url = `${wcUrl}/products/${id}?consumer_key=${wcKey}&consumer_secret=${wcSecret}`;
    
    console.log(`[API] Solicitando propiedad WooCommerce con ID ${id} desde ${wcUrl}`);
    
    // Configurar la solicitud con un timeout adecuado
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
    
    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      // Si la solicitud no es exitosa, intentar con el proxy alternativo
      if (!response.ok) {
        console.log(`[API] Error en la primera solicitud WooCommerce (${response.status}), intentando proxy alternativo...`);
        return await tryAlternativeProxy(id, res);
      }
      
      // Obtener los datos de la propiedad
      const property = await response.json();
      
      // Si no hay propiedad o está vacía
      if (!property) {
        return res.status(404).json({ 
          error: 'Propiedad no encontrada',
          id,
          source: 'woocommerce'
        });
      }
      
      // Si todo es correcto, devolver la propiedad
      return res.status(200).json({
        ...property,
        source: 'woocommerce' // Asegurarse de que tenga la fuente correcta
      });
    } catch (fetchError) {
      console.error(`[API] Error de fetch al obtener propiedad WooCommerce ${id}:`, fetchError);
      
      // Intentar con el proxy alternativo
      console.log('[API] Intentando obtener datos mediante proxy alternativo...');
      return await tryAlternativeProxy(id, res);
    }
    
  } catch (error) {
    console.error(`[API] Error general al obtener propiedad WooCommerce ${id}:`, error);
    
    // Si ya intentamos con el proxy alternativo o si el error es crítico, devolver fallback
    if (error.message && error.message.includes('after proxy attempt')) {
      // Proporcionar una propiedad de fallback
      const errorFallbackProperty = createFallbackProperty(id, error.message);
      return res.status(207).json(errorFallbackProperty);
    }
    
    // Intentar con el proxy alternativo
    try {
      return await tryAlternativeProxy(id, res);
    } catch (proxyError) {
      const errorFallbackProperty = createFallbackProperty(id, `${error.message}, Proxy error: ${proxyError.message}`);
      return res.status(207).json(errorFallbackProperty);
    }
  }
}

// Función para intentar obtener la propiedad mediante un proxy alternativo
async function tryAlternativeProxy(id, res) {
  try {
    // Construir la URL para el proxy alternativo
    const proxyUrl = `/api/proxy/woocommerce-product?id=${id}`;
    
    console.log(`[API] Solicitando proxy alternativo: ${proxyUrl}`);
    
    // Usar un timeout más largo para el proxy alternativo
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 segundos
    
    const proxyResponse = await fetch(proxyUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);
    
    if (!proxyResponse.ok) {
      // Si el proxy también falla, lanzar error
      throw new Error(`Proxy alternativo falló con estado: ${proxyResponse.status}`);
    }
    
    const property = await proxyResponse.json();
    
    // Si el proxy devuelve correctamente los datos
    return res.status(200).json({
      ...property,
      source: 'woocommerce'
    });
  } catch (proxyError) {
    console.error(`[API] Error en proxy alternativo:`, proxyError);
    
    // Si el proxy falla, crear propiedad fallback
    const fallbackProperty = createFallbackProperty(id, `Error después de intento de proxy: ${proxyError.message}`);
    return res.status(207).json(fallbackProperty);
  }
}

// Función para crear una propiedad fallback
function createFallbackProperty(id, errorMessage) {
  return {
    id: id,
    name: `Propiedad ${id}`,
    description: "Información temporal. Estamos experimentando problemas al conectar con la base de datos. Por favor, inténtelo de nuevo más tarde.",
    source: 'woocommerce',
    price: "Consultar",
    images: [
      {
        src: '/img/default-property-image.jpg',
        alt: 'Imagen por defecto'
      }
    ],
    _fallback: true,
    meta_data: [
      { key: 'bedrooms', value: '0' },
      { key: 'bathrooms', value: '0' },
      { key: 'living_area', value: '0' },
      { key: 'location', value: 'Madrid' }
    ],
    location: 'Madrid',
    type: 'Propiedad',
    error: errorMessage || 'Error al obtener datos'
  };
} 