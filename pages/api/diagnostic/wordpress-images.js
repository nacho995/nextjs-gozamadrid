/**
 * Endpoint de diagnóstico para analizar las imágenes de WordPress
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
    console.log('[WordPress Images Diagnostic] Iniciando diagnóstico...');
    
    // Hacer una llamada directa a WordPress para obtener posts
    const wpUrl = 'https://www.realestategozamadrid.com/wp-json/wp/v2/posts?per_page=5&_embed=true';
    
    const response = await fetch(wpUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Diagnostic/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      throw new Error(`WordPress API falló: ${response.status} ${response.statusText}`);
    }

    const posts = await response.json();
    console.log(`[WordPress Images Diagnostic] Obtenidos ${posts.length} posts`);

    // Analizar cada post para ver qué datos de imagen tiene
    const imageAnalysis = posts.map(post => {
      const analysis = {
        id: post.id,
        title: post.title?.rendered || 'Sin título',
        featured_media: post.featured_media,
        has_embedded: !!post._embedded,
        embedded_keys: post._embedded ? Object.keys(post._embedded) : [],
        featured_media_data: null,
        featured_media_url: post.featured_media_url || null,
        uagb_featured_image_src: post.uagb_featured_image_src || null,
        image_sources_found: []
      };

      // Verificar _embedded featured media
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        const media = post._embedded['wp:featuredmedia'][0];
        analysis.featured_media_data = {
          id: media.id,
          source_url: media.source_url,
          alt_text: media.alt_text,
          media_type: media.media_type,
          sizes: media.media_details?.sizes ? Object.keys(media.media_details.sizes) : []
        };
        
        if (media.source_url) {
          analysis.image_sources_found.push({
            source: '_embedded.wp:featuredmedia',
            url: media.source_url
          });
        }
      }

      // Verificar featured_media_url
      if (post.featured_media_url) {
        analysis.image_sources_found.push({
          source: 'featured_media_url',
          url: post.featured_media_url
        });
      }

      // Verificar uagb_featured_image_src
      if (post.uagb_featured_image_src) {
        const uagb = post.uagb_featured_image_src;
        Object.keys(uagb).forEach(size => {
          if (uagb[size] && uagb[size][0]) {
            analysis.image_sources_found.push({
              source: `uagb_featured_image_src.${size}`,
              url: uagb[size][0]
            });
          }
        });
      }

      return analysis;
    });

    // Crear resumen
    const summary = {
      total_posts: posts.length,
      posts_with_embedded: imageAnalysis.filter(p => p.has_embedded).length,
      posts_with_featured_media: imageAnalysis.filter(p => p.featured_media_data).length,
      posts_with_featured_media_url: imageAnalysis.filter(p => p.featured_media_url).length,
      posts_with_uagb: imageAnalysis.filter(p => p.uagb_featured_image_src).length,
      posts_with_any_image: imageAnalysis.filter(p => p.image_sources_found.length > 0).length
    };

    return res.status(200).json({
      success: true,
      summary,
      posts: imageAnalysis,
      raw_sample: posts[0] // Incluir el primer post completo para inspección
    });

  } catch (error) {
    console.error('[WordPress Images Diagnostic] Error:', error.message);
    
    return res.status(500).json({
      success: false,
      error: error.message,
      details: 'Error al diagnosticar imágenes de WordPress'
    });
  }
} 