/**
 * API para obtener todos los IDs de propiedades para el sitemap
 * 
 * Esta API recopila IDs de varias fuentes y los devuelve como un array
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Inicializar array de IDs
    let propertyIds = [];
    
    // Función para obtener IDs de WooCommerce
    async function getWooCommerceIds() {
      try {
        const apiUrl = process.env.WOOCOMMERCE_API_URL || '/api/proxy/woocommerce/products';
        
        const response = await fetch(`${apiUrl}?per_page=100&fields=id`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000
        });
        
        if (!response.ok) return [];
        
        const products = await response.json();
        
        // Extraer solo los IDs y convertirlos a string
        return Array.isArray(products) 
          ? products.map(product => String(product.id)) 
          : [];
      } catch (error) {
        console.error('Error obteniendo IDs de WooCommerce:', error);
        return [];
      }
    }
    
    // Función para obtener IDs de MongoDB
    async function getMongoDBIds() {
      try {
        const apiUrl = process.env.MONGODB_API_URL || '/api/proxy/mongodb/properties';
        
        const response = await fetch(`${apiUrl}/ids`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000
        });
        
        if (!response.ok) return [];
        
        const data = await response.json();
        
        // Extraer IDs
        return Array.isArray(data.ids) ? data.ids : [];
      } catch (error) {
        console.error('Error obteniendo IDs de MongoDB:', error);
        return [];
      }
    }
    
    // Obtener IDs de todas las fuentes en paralelo
    const [woocommerceIds, mongodbIds] = await Promise.all([
      getWooCommerceIds(),
      getMongoDBIds()
    ]);
    
    // Combinar todos los IDs y eliminar duplicados
    propertyIds = [...new Set([...woocommerceIds, ...mongodbIds])];
    
    console.log(`[API] Obtenidos ${propertyIds.length} IDs de propiedades para el sitemap`);
    
    // Devolver los IDs
    return res.status(200).json({
      success: true,
      ids: propertyIds
    });
  } catch (error) {
    console.error('Error obteniendo IDs de propiedades:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener IDs de propiedades',
      error: error.message
    });
  }
} 