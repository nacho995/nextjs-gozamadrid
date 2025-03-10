/**
 * API Proxy para WooCommerce
 */
export default async function handler(req, res) {
  try {
    // Obtener parámetros de la consulta
    const { path = 'products', ...queryParams } = req.query;
    
    // Obtener las claves de WooCommerce
    const NEXT_PUBLIC_WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_NEXT_PUBLIC_WOO_COMMERCE_KEY;
    const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;
    
    // Construir la URL base de WooCommerce
    let wooCommerceUrl = `https://realestategozamadrid.com/wp-json/wc/v3/${path}?consumer_key=${NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
    
    // En producción, siempre intentamos obtener el máximo de elementos por página
    if (process.env.NODE_ENV === 'production' && !queryParams.per_page) {
      queryParams.per_page = 100; // Máximo permitido por WooCommerce
    }
    
    // Añadir parámetros adicionales a la URL
    Object.entries(queryParams).forEach(([key, value]) => {
      if (key !== 'path') {
        wooCommerceUrl += `&${key}=${encodeURIComponent(value)}`;
      }
    });
    
    console.log('Conectando a WooCommerce:', wooCommerceUrl.replace(/consumer_secret=([^&]*)/, 'consumer_secret=XXXXX')); // Log seguro ocultando secreto
    
    // Realizar la solicitud desde el servidor
    const response = await fetch(wooCommerceUrl, {
      method: 'GET',
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Node.js API Proxy)'
      },
      timeout: 30000
    });
    
    if (!response.ok) {
      console.error(`Error en la respuesta de WooCommerce: ${response.status} ${response.statusText}`);
      console.error('URL que falló:', wooCommerceUrl.replace(/consumer_secret=([^&]*)/, 'consumer_secret=XXXXX')); // Log seguro
      
      // Si es un error 503, devolver un array vacío
      if (response.status === 503) {
        console.log('WooCommerce - Servicio no disponible, devolviendo array vacío');
        return res.status(200).json([]);
      }
      
      // Intentar leer el cuerpo del error
      try {
        const errorBody = await response.text();
        console.error('Cuerpo del error:', errorBody);
      } catch (e) {
        console.error('No se pudo leer el cuerpo del error');
      }
      
      throw new Error(`Error ${response.status} al conectar con WooCommerce`);
    }
    
    // Obtener los datos y registrar información
    let data = await response.json();
    data = Array.isArray(data) ? data : [data];
    
    // Obtener el total de páginas y elementos
    const totalPages = parseInt(response.headers.get('X-WP-TotalPages') || '1');
    const totalItems = parseInt(response.headers.get('X-WP-Total') || '0');
    
    // En producción, obtener todas las páginas si hay más de una y no se especificó una página específica
    if (process.env.NODE_ENV === 'production' && totalPages > 1 && !queryParams.page) {
      console.log(`WooCommerce - Obteniendo todas las páginas (${totalPages} páginas en total)`);
      
      const remainingPages = Array.from({ length: totalPages - 1 }, (_, i) => i + 2);
      const pagePromises = remainingPages.map(async (page) => {
        const pageUrl = `${wooCommerceUrl}&page=${page}`;
        const pageResponse = await fetch(pageUrl, {
          method: 'GET',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (Node.js API Proxy)'
          },
          timeout: 30000
        });
        
        if (!pageResponse.ok) {
          console.error(`Error al obtener página ${page}: ${pageResponse.status}`);
          return [];
        }
        
        const pageData = await pageResponse.json();
        return Array.isArray(pageData) ? pageData : [pageData];
      });
      
      const additionalData = await Promise.all(pagePromises);
      additionalData.forEach(pageData => {
        data.push(...pageData);
      });
    }
    
    console.log(`Recibidos ${data.length} elementos de WooCommerce`);
    
    // Si hay headers de paginación, incluirlos en la respuesta
    if (totalItems) {
      res.setHeader('X-WP-Total', totalItems);
    }
    if (totalPages) {
      res.setHeader('X-WP-TotalPages', totalPages);
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WooCommerce:', error);
    // En caso de error irrecuperable, devolver un array vacío
    return res.status(200).json([]);
  }
} 