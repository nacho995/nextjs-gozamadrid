/**
 * API Estática de Blogs para evitar Fast Refresh
 * Devuelve datos de ejemplo sin hacer llamadas externas
 */

// Datos de ejemplo de blogs estáticos
const EXAMPLE_BLOGS = [
  {
    id: 'blog-estatico-1',
    title: { rendered: 'Guía del Mercado Inmobiliario Madrid 2024' },
    excerpt: { rendered: 'Todo lo que necesitas saber sobre el mercado inmobiliario en Madrid este año.' },
    content: { rendered: '<p>El mercado inmobiliario de Madrid sigue mostrando signos de fortaleza...</p>' },
    date: new Date().toISOString(),
    slug: 'guia-mercado-inmobiliario-madrid-2024',
    featured_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
    author_name: 'Equipo Goza Madrid',
    source: 'estatico',
    status: 'publish',
    author: 1,
    featured_media: 0,
    categories: [1],
    tags: [],
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80'
      }]
    }
  },
  {
    id: 'blog-estatico-2',
    title: { rendered: 'Mejores Barrios para Invertir en Madrid' },
    excerpt: { rendered: 'Análisis de los barrios con mayor potencial de inversión inmobiliaria.' },
    content: { rendered: '<p>En este análisis detallado exploramos los barrios de Madrid con mejor potencial...</p>' },
    date: new Date().toISOString(),
    slug: 'mejores-barrios-invertir-madrid',
    featured_image_url: 'https://images.unsplash.com/photo-1560449752-e1e73ac1e077?w=800&h=600&fit=crop&q=80',
    author_name: 'Equipo Goza Madrid',
    source: 'estatico',
    status: 'publish',
    author: 1,
    featured_media: 0,
    categories: [1],
    tags: [],
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.unsplash.com/photo-1560449752-e1e73ac1e077?w=800&h=600&fit=crop&q=80'
      }]
    }
  },
  {
    id: 'blog-estatico-3',
    title: { rendered: 'Consejos para Comprar tu Primera Vivienda' },
    excerpt: { rendered: 'Guía completa para primerizos en la compra de vivienda.' },
    content: { rendered: '<p>Comprar tu primera vivienda puede ser abrumador, pero con estos consejos...</p>' },
    date: new Date().toISOString(),
    slug: 'consejos-comprar-primera-vivienda',
    featured_image_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&q=80',
    author_name: 'Equipo Goza Madrid',
    source: 'estatico',
    status: 'publish',
    author: 1,
    featured_media: 0,
    categories: [1],
    tags: [],
    _embedded: {
      'wp:featuredmedia': [{
        source_url: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?w=800&h=600&fit=crop&q=80'
      }]
    }
  }
];

export default function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Accept');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('[API Blogs Estática] Devolviendo blogs de ejemplo');
    
    // Extraer parámetros de consulta
    const { limit, per_page } = req.query;
    const perPage = parseInt(limit || per_page || 10);
    
    // Limitar resultados
    const limitedBlogs = EXAMPLE_BLOGS.slice(0, perPage);
    
    // Configurar headers
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Source', 'static-data');
    res.setHeader('X-Blog-Count', limitedBlogs.length.toString());
    
    return res.status(200).json(limitedBlogs);
    
  } catch (error) {
    console.error('[API Blogs Estática] Error:', error);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
} 