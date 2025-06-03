/**
 * API Estática de MongoDB - SIN LLAMADAS EXTERNAS
 * Devuelve datos de propiedades de ejemplo para evitar Fast Refresh
 */

const EXAMPLE_PROPERTIES = [
  {
    _id: "507f1f77bcf86cd799439011",
    title: "Ático en Salamanca",
    description: "Espectacular ático con terraza en el barrio de Salamanca",
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    address: "Calle Serrano 45",
    images: [
      { src: "/img/property1.jpg", alt: "Salón principal" },
      { src: "/img/property1-2.jpg", alt: "Terraza" }
    ],
    coordinates: { lat: 40.4359, lng: -3.6774 }
  },
  {
    _id: "507f1f77bcf86cd799439012", 
    title: "Piso en Malasaña",
    description: "Acogedor piso reformado en Malasaña",
    price: 420000,
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    address: "Calle Fuencarral 88",
    images: [
      { src: "/img/property2.jpg", alt: "Salón comedor" }
    ],
    coordinates: { lat: 40.4254, lng: -3.7031 }
  }
];

export default function handler(req, res) {
  console.log('[API MongoDB Estática] Solicitud recibida');
  
  try {
    // Simular datos según parámetros
    const { page = 1, limit = 10 } = req.query;
    const startIndex = (parseInt(page) - 1) * parseInt(limit);
    const endIndex = startIndex + parseInt(limit);
    
    const paginatedProperties = EXAMPLE_PROPERTIES.slice(startIndex, endIndex);
    
    console.log('[API MongoDB Estática] Devolviendo datos de ejemplo');
    
    return res.status(200).json(paginatedProperties);
    
  } catch (error) {
    console.error('[API MongoDB Estática] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
} 