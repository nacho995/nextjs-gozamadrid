/**
 * API Estática de WooCommerce - SIN LLAMADAS EXTERNAS
 * Devuelve datos de ejemplo para evitar Fast Refresh
 */

const EXAMPLE_WOOCOMMERCE_PROPERTIES = [
  {
    id: 'woo-001',
    title: 'Piso en Salamanca Premium',
    description: 'Exclusivo piso en el barrio de Salamanca con todas las comodidades',
    price: 890000,
    source: 'woocommerce',
    images: [
      { src: '/img/woo-property1.jpg', alt: 'Piso Salamanca' }
    ],
    bedrooms: 3,
    bathrooms: 2,
    area: 125,
    address: 'Calle Velázquez, Madrid',
    location: 'Salamanca, Madrid',
    coordinates: { lat: 40.4359, lng: -3.6774 },
    status: 'available'
  },
  {
    id: 'woo-002',
    title: 'Duplex en Chamberí',
    description: 'Moderno duplex con terraza en zona tranquila',
    price: 620000,
    source: 'woocommerce',
    images: [
      { src: '/img/woo-property2.jpg', alt: 'Duplex Chamberí' }
    ],
    bedrooms: 2,
    bathrooms: 2,
    area: 90,
    address: 'Calle Sagasta, Madrid',
    location: 'Chamberí, Madrid',
    coordinates: { lat: 40.4378, lng: -3.6950 },
    status: 'available'
  }
];

export default function handler(req, res) {
  console.log('[API WooCommerce Estática] Devolviendo datos de ejemplo');
  
  try {
    const { page = 1, limit = 10, consumer_key, consumer_secret } = req.query;
    
    // Simular paginación
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    const paginatedProperties = EXAMPLE_WOOCOMMERCE_PROPERTIES.slice(startIndex, endIndex);
    
    return res.status(200).json(paginatedProperties);
    
  } catch (error) {
    console.error('[API WooCommerce Estática] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
} 