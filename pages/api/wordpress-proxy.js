/**
 * API Estática de WordPress - SIN LLAMADAS EXTERNAS
 * Devuelve blogs de ejemplo para evitar Fast Refresh
 */

const EXAMPLE_BLOGS = [
  {
    id: 1,
    title: { rendered: "Guía completa para comprar tu primera vivienda en Madrid" },
    excerpt: { rendered: "Todo lo que necesitas saber antes de dar el paso..." },
    content: { rendered: "Contenido del blog sobre compra de vivienda..." },
    date: "2024-01-15T10:00:00",
    slug: "guia-comprar-vivienda-madrid",
    featured_media: 123,
    _embedded: {
      "wp:featuredmedia": [{
        source_url: "/img/blog1.jpg",
        alt_text: "Vivienda en Madrid"
      }]
    }
  },
  {
    id: 2,
    title: { rendered: "Las mejores zonas para vivir en Madrid en 2024" },
    excerpt: { rendered: "Descubre los barrios más populares y emergentes..." },
    content: { rendered: "Análisis completo de los barrios de Madrid..." },
    date: "2024-01-10T15:30:00",
    slug: "mejores-zonas-madrid-2024",
    featured_media: 124,
    _embedded: {
      "wp:featuredmedia": [{
        source_url: "/img/blog2.jpg",
        alt_text: "Barrios de Madrid"
      }]
    }
  }
];

export default function handler(req, res) {
  console.log('[API WordPress Estática] Devolviendo blogs de ejemplo');
  
  try {
    const { per_page = 10, page = 1 } = req.query;
    const startIndex = (parseInt(page) - 1) * parseInt(per_page);
    const endIndex = startIndex + parseInt(per_page);
    
    const paginatedBlogs = EXAMPLE_BLOGS.slice(startIndex, endIndex);
    
    return res.status(200).json(paginatedBlogs);
    
  } catch (error) {
    console.error('[API WordPress Estática] Error:', error);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      message: error.message 
    });
  }
} 