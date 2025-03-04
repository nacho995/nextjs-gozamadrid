/**
 * API Proxy para WooCommerce
 */
export default async function handler(req, res) {
  try {
    // Obtener las claves de WooCommerce
    const NEXT_PUBLIC_WOO_COMMERCE_KEY = 'ck_3efe242c61866209c650716bed69999cbf00a09c';
    const WOO_COMMERCE_SECRET = 'cs_d9a74b0a40175d14515e4f7663c126b82b09aa2d';
    
    // Construir la URL de WooCommerce
    const wooCommerceUrl = `https://realestategozamadrid.com/wp-json/wc/v3/products?consumer_key=${NEXT_PUBLIC_WOO_COMMERCE_KEY}&consumer_secret=${WOO_COMMERCE_SECRET}&per_page=100`;
    
    // Realizar la solicitud desde el servidor
    const response = await fetch(wooCommerceUrl, {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache'
      },
      timeout: 10000 // 10 segundos de timeout
    });
    
    if (!response.ok) {
      throw new Error(`Error en la respuesta: ${response.status}`);
    }
    
    // Obtener los datos y devolverlos
    const data = await response.json();
    return res.status(200).json(data);
  } catch (error) {
    console.error('Error en el proxy de WooCommerce:', error);
    return res.status(500).json({ error: 'Error al obtener datos de WooCommerce' });
  }
} 