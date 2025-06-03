/**
 * API para obtener todos los slugs de blogs para el sitemap
 * 
 * Esta API recopila slugs de blogs de WordPress y los devuelve como un array
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ success: false, message: 'Método no permitido' });
  }

  try {
    // Inicializar array de slugs
    let blogSlugs = [];
    
    // Función para obtener slugs de WordPress
    async function getWordPressSlugs() {
      try {
        // URL de la API de WordPress
        const apiUrl = process.env.WORDPRESS_API_URL || '/api/proxy/wordpress/posts';
        
        // Obtener hasta 100 posts (máximo permitido por WordPress REST API)
        const response = await fetch(`${apiUrl}?per_page=100&_fields=slug`, {
          headers: {
            'Content-Type': 'application/json',
            'Cache-Control': 'no-cache'
          },
          timeout: 10000
        });
        
        if (!response.ok) return [];
        
        const posts = await response.json();
        
        // Extraer solo los slugs
        return Array.isArray(posts) 
          ? posts.map(post => post.slug).filter(slug => slug) 
          : [];
      } catch (error) {
        console.error('Error obteniendo slugs de WordPress:', error);
        return [];
      }
    }
    
    // Obtener slugs de WordPress
    blogSlugs = await getWordPressSlugs();
    
    console.log(`[API] Obtenidos ${blogSlugs.length} slugs de blogs para el sitemap`);
    
    // Devolver los slugs
    return res.status(200).json({
      success: true,
      slugs: blogSlugs
    });
  } catch (error) {
    console.error('Error obteniendo slugs de blogs:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor al obtener slugs de blogs',
      error: error.message
    });
  }
} 