/**
 * Endpoint de compatibilidad para /api/blogs
 * Obtiene blogs combinando múltiples fuentes
 */
export default async function handler(req, res) {
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
    // Extraer parámetros de consulta
    const { limit, per_page } = req.query;
    const perPage = limit || per_page || 10;
    
    console.log(`[/api/blogs] Obteniendo ${perPage} blogs desde múltiples fuentes`);
    
    const combinedBlogs = [];
    let hasAnyBlogs = false;
    
    // PASO 1: Intentar obtener blogs de WordPress primero usando nuestro endpoint
    try {
      console.log(`[/api/blogs] Intentando obtener blogs desde WordPress...`);
      
      const wpResponse = await fetch(`${req.headers.origin || 'https://www.realestategozamadrid.com'}/api/wordpress-proxy`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GozaMadrid-API/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });
      
      if (wpResponse.ok) {
        const wpData = await wpResponse.json();
        if (Array.isArray(wpData) && wpData.length > 0) {
          console.log(`[/api/blogs] Obtenidos ${wpData.length} blogs de WordPress`);
          
          // Los datos ya vienen en formato WordPress del proxy
          combinedBlogs.push(...wpData);
          hasAnyBlogs = true;
        }
      }
    } catch (wpError) {
      console.error(`[/api/blogs] Error obteniendo blogs de WordPress: ${wpError.message}`);
    }
    
    // PASO 2: Si no tenemos suficientes blogs, intentar del backend AWS
    if (combinedBlogs.length < 3) {
      try {
        console.log(`[/api/blogs] Intentando obtener blogs adicionales desde backend AWS...`);
        
        const backendUrl = 'https://nextjs-gozamadrid-qrfk.onrender.com/api/blogs';
        
        const backendResponse = await fetch('/api/proxy-raw', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            url: backendUrl,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'GozaMadrid-Frontend/1.0',
              'Cache-Control': 'no-cache'
            },
            timeout: 10000
          }),
          signal: AbortSignal.timeout(12000)
        });
        
        if (backendResponse.ok) {
          const backendData = await backendResponse.json();
          if (Array.isArray(backendData) && backendData.length > 0) {
            console.log(`[/api/blogs] Obtenidos ${backendData.length} blogs del backend AWS`);
            
            // Procesar blogs del backend para formato WordPress
            const processedBackendBlogs = backendData.map(blog => {
              let blogImage = blog.image;
              
              // Procesar imagen para HTTPS y proxy
              if (typeof blogImage === 'string') {
                if (blogImage.startsWith('http:')) {
                  blogImage = blogImage.replace('http:', 'https:');
                }
                if (!blogImage.includes('images.unsplash.com') && !blogImage.includes('images.weserv.nl')) {
                  blogImage = `https://images.weserv.nl/?url=${encodeURIComponent(blogImage)}&w=800&h=600&fit=cover`;
                }
                blogImage = { src: blogImage, alt: blog.title || 'Imagen del blog' };
              } else if (blogImage && typeof blogImage === 'object' && blogImage.src) {
                if (blogImage.src.startsWith('http:')) {
                  blogImage.src = blogImage.src.replace('http:', 'https:');
                }
                if (!blogImage.src.includes('images.unsplash.com') && !blogImage.src.includes('images.weserv.nl')) {
                  blogImage.src = `https://images.weserv.nl/?url=${encodeURIComponent(blogImage.src)}&w=800&h=600&fit=cover`;
                }
              } else {
                blogImage = {
                  src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
                  alt: blog.title || 'Imagen del blog'
                };
              }
              
              return {
                id: blog._id || blog.id || `aws-${Math.random().toString(36).substring(2)}`,
                title: { rendered: blog.title || 'Sin título' },
                content: { rendered: blog.content || blog.description || '' },
                excerpt: { rendered: blog.description || blog.excerpt || '' },
                date: blog.date || blog.createdAt || new Date().toISOString(),
                slug: blog.slug || `blog-${blog._id || blog.id || Math.random().toString(36).substring(2, 7)}`,
                status: 'publish',
                author: 1,
                featured_media: 0,
                categories: [1],
                tags: [],
                _embedded: {
                  'wp:featuredmedia': [{
                    source_url: blogImage.src
                  }]
                },
                featured_image_url: blogImage.src,
                source: 'backend'
              };
            });
            
            combinedBlogs.push(...processedBackendBlogs);
            hasAnyBlogs = true;
          }
        }
      } catch (backendError) {
        console.error(`[/api/blogs] Error obteniendo blogs del backend: ${backendError.message}`);
      }
    }
    
    // Limitar resultados según el parámetro solicitado
    const limitedBlogs = combinedBlogs.slice(0, parseInt(perPage));
    
    // Configurar headers
    res.setHeader('Cache-Control', 'public, max-age=300');
    res.setHeader('X-Source', hasAnyBlogs ? 'real-sources' : 'no-data');
    res.setHeader('X-Blog-Count', limitedBlogs.length.toString());
    
    console.log(`[/api/blogs] Devolviendo ${limitedBlogs.length} blogs reales`);
    return res.status(200).json(limitedBlogs);
    
  } catch (error) {
    console.error('[/api/blogs] Error general:', error.message);
    return res.status(500).json({ 
      error: 'Error obteniendo blogs',
      details: error.message 
    });
  }
} 