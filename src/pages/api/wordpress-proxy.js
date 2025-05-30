// Endpoint simple para WordPress posts
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('[WordPress Simple] Iniciando solicitud...');
    
    // Usar el endpoint /api/blogs que ya funciona
    const blogsResponse = await fetch(`${req.headers.origin || 'https://www.realestategozamadrid.com'}/api/blogs?limit=100`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-API/1.0'
      }
    });
    
    if (!blogsResponse.ok) {
      throw new Error(`Error ${blogsResponse.status}: ${blogsResponse.statusText}`);
    }
    
    const blogs = await blogsResponse.json();
    
    // Transformar al formato esperado por WordPress
    const transformedBlogs = blogs.map(blog => ({
      id: blog.id || Math.random().toString(36).substr(2, 9),
      title: { rendered: blog.title || 'Sin título' },
      excerpt: { rendered: blog.description || '' },
      content: { rendered: blog.content || '' },
      date: blog.date || new Date().toISOString(),
      slug: blog.slug || 'blog-post',
      featured_media: 0,
      featured_image_url: blog.image?.src || null,
      author_name: blog.author || 'Equipo Goza Madrid',
      _embedded: blog._embedded || {}
    }));
    
    res.setHeader('Cache-Control', 'public, s-maxage=300, stale-while-revalidate=600');
    res.status(200).json(transformedBlogs);
    
  } catch (error) {
    console.error('[WordPress Simple] Error:', error.message);
    res.status(500).json({ 
      error: 'Error obteniendo posts de WordPress',
      details: error.message 
    });
  }
} 