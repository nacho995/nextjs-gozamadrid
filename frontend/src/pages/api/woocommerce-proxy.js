/**
 * API Proxy para WooCommerce
 */
export default async function handler(req, res) {
  try {
    // Obtener parámetros de la consulta
    const { path = 'products', ...queryParams } = req.query;
    
    // Obtener las claves de WooCommerce
    const NEXT_PUBLIC_WOO_COMMERCE_KEY = 'ck_75c5940bfae6a9dd63f1489da71e43b576999633';
    const WOO_COMMERCE_SECRET = 'cs_f194d11b41ca92cdd356145705fede711cd233e5';
    
    // Construir la URL base de WooCommerce
    let wooCommerceUrl = `https://realestategozamadrid.com/wp-json/wc/v3/${path}?consumer_key=${NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}`;
    
    // Añadir parámetros adicionales a la URL
    Object.entries(queryParams).forEach(([key, value]) => {
      if (key !== 'path') {
        wooCommerceUrl += `&${key}=${value}`;
      }
    });
    
    // Si no se especifican más parámetros, añadir per_page=50 por defecto
    if (!queryParams.per_page) {
      wooCommerceUrl += '&per_page=50';
    }
    
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
    const data = await response.json();
    console.log(`Recibidos ${Array.isArray(data) ? data.length + ' productos' : 'objeto singular'} de WooCommerce`);
    
    // Si hay headers de paginación, incluirlos en la respuesta
    if (response.headers.get('X-WP-Total')) {
      res.setHeader('X-WP-Total', response.headers.get('X-WP-Total'));
    }
    if (response.headers.get('X-WP-TotalPages')) {
      res.setHeader('X-WP-TotalPages', response.headers.get('X-WP-TotalPages'));
    }
    
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WooCommerce:', error);
    return res.status(500).json({ error: 'Error al obtener datos de WooCommerce: ' + error.message });
  }
} 