/**
 * Endpoint de compatibilidad para /api/blogs
 * Llama directamente a WordPress y devuelve blogs procesados
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
    const { limit, per_page, page = 1, _embed = 'true' } = req.query;
    
    // Convertir limit a per_page si está presente
    const perPage = limit || per_page || 10;
    
    console.log(`[/api/blogs] Obteniendo ${perPage} blogs desde WordPress`);
    
    // URLs de WordPress a probar (en orden de prioridad)
    const WORDPRESS_URLS = [
      'https://www.realestategozamadrid.com/wp-json/wp/v2',
      'https://realestategozamadrid.com/wp-json/wp/v2'
    ];

    let lastError = null;
    
    for (const wpUrl of WORDPRESS_URLS) {
      try {
        const url = new URL(`${wpUrl}/posts`);
        url.searchParams.set('per_page', perPage);
        url.searchParams.set('page', page);
        url.searchParams.set('_embed', _embed);
        url.searchParams.set('status', 'publish');

        console.log(`[/api/blogs] Intentando: ${url.toString()}`);

        const response = await fetch(url.toString(), {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'User-Agent': 'GozaMadrid-BlogsProxy/1.0',
            'Cache-Control': 'no-cache'
          },
          signal: AbortSignal.timeout(8000)
        });

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(`[/api/blogs] Éxito con ${wpUrl}: ${Array.isArray(data) ? data.length : 0} posts`);
        
        // Procesar los posts para formato consistente
        const processedPosts = Array.isArray(data) ? data.map(post => {
          let featuredImageUrl = null;
          
          // Intentar extraer imagen featured
          if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
            const media = post._embedded['wp:featuredmedia'][0];
            featuredImageUrl = media.source_url;
            
            // Corregir URLs problemáticas
            if (featuredImageUrl) {
              if (featuredImageUrl.includes('wordpress.realestategozamadrid.com')) {
                featuredImageUrl = featuredImageUrl.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
              }
              if (featuredImageUrl.startsWith('http:')) {
                featuredImageUrl = featuredImageUrl.replace('http:', 'https:');
              }
            }
          }
          
          return {
            ...post,
            featured_image_url: featuredImageUrl
          };
        }) : [];

        // Configurar headers de caché
        res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos de caché
        res.setHeader('X-Source', 'wordpress-direct');
        
        return res.status(200).json(processedPosts);
        
      } catch (error) {
        console.error(`[/api/blogs] Error con ${wpUrl}: ${error.message}`);
        lastError = error;
        continue;
      }
    }
    
    // Si todas las URLs fallaron, devolver datos de ejemplo
    throw lastError || new Error('Todas las URLs de WordPress fallaron');
    
  } catch (error) {
    console.error('[/api/blogs] Error:', error.message);
    
    // En caso de error, devolver datos de ejemplo
    const sampleBlogs = [
      {
        id: 'sample-1',
        title: { rendered: 'Inversión inmobiliaria en Madrid: Guía 2024' },
        content: { rendered: '<p>Descubre las mejores oportunidades de inversión en el mercado inmobiliario madrileño este año.</p>' },
        excerpt: { rendered: 'Las claves para invertir con éxito en propiedades en Madrid durante 2024.' },
        date: new Date().toISOString(),
        slug: 'inversion-inmobiliaria-madrid-2024',
        status: 'publish',
        author: 1,
        featured_media: 0,
        categories: [1],
        tags: [],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80'
      },
      {
        id: 'sample-2',
        title: { rendered: 'Los mejores barrios para alquilar en Madrid' },
        content: { rendered: '<p>Análisis de los barrios con mayor demanda de alquiler y mejor rentabilidad en la capital.</p>' },
        excerpt: { rendered: 'Descubre dónde invertir para obtener los mejores rendimientos por alquiler en Madrid.' },
        date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
        slug: 'mejores-barrios-alquiler-madrid',
        status: 'publish',
        author: 1,
        featured_media: 0,
        categories: [1],
        tags: [],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80'
      }
    ];
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Fallback', 'sample-data');
    
    return res.status(200).json(sampleBlogs);
  }
} 