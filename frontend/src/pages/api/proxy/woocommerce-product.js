// Endpoint para obtener productos de WooCommerce de manera directa
export default async function handler(req, res) {
  // Añadir cabeceras CORS para permitir cualquier origen
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, Accept');

  // Solo permitir solicitudes GET y OPTIONS
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Credenciales hardcodeadas (usar las correctas)
    const wcKey = 'ck_d69e61427264a7beea70ca9ee543b45dd00cae85';
    const wcSecret = 'cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e';
    const wcBaseUrl = 'https://wordpress.realestategozamadrid.com/wp-json/wc/v3';
    
    // Obtener el ID del producto desde los parámetros
    const { id } = req.query;
    let productId = id;
    
    // Si la URL tiene formato /producto/[id], extraer el ID
    if (typeof req.url === 'string' && req.url.includes('/woocommerce-product/')) {
      const match = req.url.match(/\/woocommerce-product\/([^\/\?]+)/);
      if (match && match[1]) {
        productId = match[1];
      }
    }
    
    console.log(`[WooCommerce Product] ID procesado: ${productId}`);
    
    // Si no hay ID, devolvemos lista de productos
    if (!productId) {
      // Obtener lista de productos
      const productsUrl = `${wcBaseUrl}/products?consumer_key=${wcKey}&consumer_secret=${wcSecret}&per_page=20`;
      console.log('[WooCommerce Product] Obteniendo lista de productos');
      
      const listResponse = await fetch(productsUrl, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'User-Agent': 'GozaMadrid/1.0'
        },
        timeout: 20000
      });
      
      if (!listResponse.ok) {
        throw new Error(`Error al obtener lista de productos: ${listResponse.status}`);
      }
      
      const products = await listResponse.json();
      console.log(`[WooCommerce Product] Se encontraron ${products.length} productos`);
      
      return res.status(200).json({
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          price: p.price,
          images: p.images && p.images.length > 0 ? [p.images[0].src] : []
        })),
        count: products.length
      });
    }
    
    // URL directa para obtener el producto
    const productUrl = `${wcBaseUrl}/products/${productId}?consumer_key=${wcKey}&consumer_secret=${wcSecret}`;
    
    console.log(`[WooCommerce Product] Solicitando producto con ID: ${productId}`);
    console.log(`[WooCommerce Product] URL: ${productUrl.replace(/consumer_key=([^&]+)/, 'consumer_key=HIDDEN')
                                           .replace(/consumer_secret=([^&]+)/, 'consumer_secret=HIDDEN')}`);
    
    // MEJORA: Verificar si el producto existe antes de intentar obtenerlo directamente
    const checkProductUrl = `${wcBaseUrl}/products?include=${productId}&consumer_key=${wcKey}&consumer_secret=${wcSecret}`;
    console.log(`[WooCommerce Product] Verificando existencia del producto con ID: ${productId}`);
    
    const checkResponse = await fetch(checkProductUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GozaMadrid/1.0'
      },
      timeout: 20000
    });
    
    if (checkResponse.ok) {
      const checkResult = await checkResponse.json();
      console.log(`[WooCommerce Product] Resultado de verificación: ${JSON.stringify({
        responseOk: checkResponse.ok,
        status: checkResponse.status,
        resultLength: checkResult.length,
        hasProduct: checkResult.length > 0
      })}`);
      
      // Si el producto no existe en la verificación
      if (!checkResult || checkResult.length === 0) {
        console.log(`[WooCommerce Product] Producto ${productId} no encontrado en la verificación`);
        
        // Buscar productos disponibles como alternativa
        const alternativeUrl = `${wcBaseUrl}/products?consumer_key=${wcKey}&consumer_secret=${wcSecret}&per_page=5&status=publish`;
        const alternativeResponse = await fetch(alternativeUrl, {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'User-Agent': 'GozaMadrid/1.0'
          },
          timeout: 15000
        });
        
        if (alternativeResponse.ok) {
          const alternatives = await alternativeResponse.json();
          console.log(`[WooCommerce Product] Encontradas ${alternatives.length} alternativas`);
          
          return res.status(404).json({
            error: `Producto con ID ${productId} no encontrado`,
            message: `La propiedad con ID ${productId} no existe o ya no está disponible.`,
            productId,
            productIdRequested: productId,
            suggestions: alternatives.map(p => ({
              id: p.id,
              name: p.name,
              price: p.price,
              images: p.images && p.images.length > 0 ? [p.images[0].src] : []
            })),
            source: 'woocommerce'
          });
        }
        
        // Si no pudimos obtener alternativas, devolver error simple
        return res.status(404).json({
          error: `Producto con ID ${productId} no encontrado`,
          message: `La propiedad con ID ${productId} no existe o ya no está disponible.`,
          productId,
          source: 'woocommerce'
        });
      }
      
      // Si existe el producto en la verificación, directamente devolverlo
      if (checkResult.length > 0) {
        const product = checkResult[0];
        console.log(`[WooCommerce Product] Producto encontrado en verificación: ${product.name}`);
        
        // Marcar como proveniente de WooCommerce
        product.source = 'woocommerce';
        return res.status(200).json(product);
      }
    }
    
    // Si la verificación no funcionó correctamente, intentar el método tradicional
    console.log(`[WooCommerce Product] Buscando en lista completa`);
    const listUrl = `${wcBaseUrl}/products?consumer_key=${wcKey}&consumer_secret=${wcSecret}&per_page=100`;
    
    const listAllResponse = await fetch(listUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GozaMadrid/1.0'
      },
      timeout: 20000
    });
    
    if (listAllResponse.ok) {
      const allProducts = await listAllResponse.json();
      console.log(`[WooCommerce Product] Lista completa: ${allProducts.length} productos`);
      
      // Buscar producto por ID
      const foundProduct = allProducts.find(p => p.id.toString() === productId.toString());
      
      if (foundProduct) {
        console.log(`[WooCommerce Product] Producto encontrado en listado: ${foundProduct.name}`);
        // Marcar como proveniente de WooCommerce
        foundProduct.source = 'woocommerce';
        return res.status(200).json(foundProduct);
      }
      
      console.log(`[WooCommerce Product] Producto no encontrado en listado, intentando obtener directamente`);
    }
    
    // Intentar obtener producto directamente si no lo encontramos en los métodos anteriores
    const response = await fetch(productUrl, {
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GozaMadrid/1.0'
      },
      timeout: 20000
    });
    
    // Verificamos respuesta
    if (!response.ok) {
      console.error(`[WooCommerce Product] Error ${response.status}: Producto no encontrado`);
      
      // Obtener el texto del error para diagnóstico
      let errorText = '';
      try {
        errorText = await response.text();
        console.log(`[WooCommerce Product] Respuesta de error: ${errorText.substring(0, 200)}`);
      } catch (textError) {
        console.error(`[WooCommerce Product] No se pudo leer el texto de error: ${textError.message}`);
      }
      
      // Si no encontramos el producto, devolvemos alternativas
      const alternativeUrl = `${wcBaseUrl}/products?consumer_key=${wcKey}&consumer_secret=${wcSecret}&per_page=5`;
      const alternativeResponse = await fetch(alternativeUrl);
      
      if (alternativeResponse.ok) {
        const alternatives = await alternativeResponse.json();
        
        return res.status(404).json({
          error: `Producto con ID ${productId} no encontrado`,
          message: `La propiedad con ID ${productId} no existe o ya no está disponible.`,
          errorDetails: errorText ? errorText.substring(0, 200) : undefined,
          suggestions: alternatives.map(p => ({
            id: p.id,
            name: p.name,
            price: p.price,
            images: p.images && p.images.length > 0 ? [p.images[0].src] : []
          })),
          source: 'woocommerce'
        });
      }
      
      return res.status(404).json({
        error: `Producto con ID ${productId} no encontrado`,
        message: `La propiedad con ID ${productId} no existe o ya no está disponible.`,
        errorDetails: errorText ? errorText.substring(0, 200) : undefined,
        source: 'woocommerce'
      });
    }
    
    // Producto encontrado
    const product = await response.json();
    console.log(`[WooCommerce Product] Producto obtenido: ${product.name}`);
    
    // Marcar como proveniente de WooCommerce
    product.source = 'woocommerce';
    
    return res.status(200).json(product);
  } catch (error) {
    console.error('[WooCommerce Product] Error:', error.message);
    console.error('[WooCommerce Product] Stack:', error.stack);
    
    return res.status(500).json({
      error: `Error al obtener datos de WooCommerce: ${error.message}`,
      fallbackMode: true,
      source: 'woocommerce',
      debug: process.env.NODE_ENV === 'development' ? {
        stack: error.stack,
        name: error.name,
        timestamp: new Date().toISOString()
      } : undefined
    });
  }
} 