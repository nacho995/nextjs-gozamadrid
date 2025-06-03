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
    console.log('[Blogs API] Iniciando obtención de blogs...');

    // PASO 1: Intentar WordPress vía nuestro proxy
    try {
      console.log('[Blogs API] Intentando WordPress via proxy...');
      const wpResponse = await fetch(`${req.headers.origin || 'https://www.realestategozamadrid.com'}/api/wordpress-proxy`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GozaMadrid-BlogAPI/1.0'
        },
        signal: AbortSignal.timeout(10000)
      });

      if (wpResponse.ok) {
        const wpBlogs = await wpResponse.json();
        if (Array.isArray(wpBlogs) && wpBlogs.length > 0) {
          console.log(`[Blogs API] ✅ WordPress exitoso: ${wpBlogs.length} blogs`);
          
          // Headers de respuesta
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
          res.setHeader('X-Source', 'wordpress-proxy');
          res.setHeader('X-Posts-Count', wpBlogs.length.toString());
          
          return res.status(200).json(wpBlogs);
        }
      }
      console.log('[Blogs API] WordPress proxy falló o sin datos');
    } catch (wpError) {
      console.log('[Blogs API] Error WordPress proxy:', wpError.message);
    }

    // PASO 2: Intentar backend AWS si WordPress falla
    try {
      console.log('[Blogs API] Intentando backend AWS...');
      const awsResponse = await fetch('https://gw.estateinsight.zone/api/estates/blogs?limit=100', {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GozaMadrid-API/1.0',
          'X-API-Key': process.env.AWS_API_KEY || ''
        },
        signal: AbortSignal.timeout(8000)
      });

      if (awsResponse.ok) {
        const awsData = await awsResponse.json();
        if (awsData.success && Array.isArray(awsData.data) && awsData.data.length > 0) {
          console.log(`[Blogs API] ✅ AWS exitoso: ${awsData.data.length} blogs`);
          
          // Transformar formato AWS a WordPress
          const transformedBlogs = awsData.data.map(blog => ({
            id: blog.id || Math.random().toString(36).substr(2, 9),
            title: { rendered: blog.title || 'Sin título' },
            excerpt: { rendered: blog.description || '' },
            content: { rendered: blog.content || '' },
            date: blog.date || new Date().toISOString(),
            slug: blog.slug || 'blog-post',
            featured_media: 0,
            featured_image_url: blog.image?.src || null,
            author_name: blog.author || 'Equipo Goza Madrid',
            source: 'aws',
            _embedded: blog._embedded || {}
          }));

          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
          res.setHeader('X-Source', 'aws-backend');
          res.setHeader('X-Posts-Count', transformedBlogs.length.toString());
          
          return res.status(200).json(transformedBlogs);
        }
      }
      console.log('[Blogs API] Backend AWS falló o sin datos');
    } catch (awsError) {
      console.log('[Blogs API] Error backend AWS:', awsError.message);
    }

    // PASO 3: Usar endpoint de respaldo si fallan las fuentes principales
    try {
      console.log('[Blogs API] Usando endpoint de respaldo...');
      const backupResponse = await fetch(`${req.headers.origin || 'https://www.realestategozamadrid.com'}/api/blogs-backup`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'GozaMadrid-BlogAPI/1.0'
        }
      });

      if (backupResponse.ok) {
        const backupBlogs = await backupResponse.json();
        if (Array.isArray(backupBlogs) && backupBlogs.length > 0) {
          console.log(`[Blogs API] ✅ Respaldo exitoso: ${backupBlogs.length} blogs`);
          
          res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
          res.setHeader('X-Source', 'backup-endpoint');
          res.setHeader('X-Posts-Count', backupBlogs.length.toString());
          
          return res.status(200).json(backupBlogs);
        }
      }
      console.log('[Blogs API] Endpoint de respaldo falló');
    } catch (backupError) {
      console.log('[Blogs API] Error endpoint respaldo:', backupError.message);
    }

    // Si todo falla, devolver error
    console.error('[Blogs API] ❌ Todas las fuentes fallaron');
    return res.status(500).json({ 
      error: 'No se obtuvieron blogs de ninguna fuente',
      details: 'WordPress, AWS y endpoint de respaldo no disponibles',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('[Blogs API] Error general:', error.message);
    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
} 