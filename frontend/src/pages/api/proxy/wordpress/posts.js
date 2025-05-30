/**
 * Proxy para obtener posts de WordPress
 * Este endpoint se conecta directamente a la API de WordPress con múltiples fallbacks
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

  // Parámetros de consulta
  const { per_page = 10, page = 1, _embed = 'true' } = req.query;

  // URLs de WordPress a probar (en orden de prioridad)
  const WORDPRESS_URLS = [
    process.env.NEXT_PUBLIC_WP_API_URL || 'https://www.realestategozamadrid.com/wp-json/wp/v2',
    'https://www.realestategozamadrid.com/wp-json/wp/v2',
    'https://realestategozamadrid.com/wp-json/wp/v2'
  ];

  // Función para intentar conexión con una URL
  const tryWordPressAPI = async (baseUrl) => {
    const url = new URL(`${baseUrl}/posts`);
    url.searchParams.set('per_page', per_page);
    url.searchParams.set('page', page);
    url.searchParams.set('_embed', _embed);
    url.searchParams.set('status', 'publish');

    console.log(`[WordPress Proxy] Intentando: ${url.toString()}`);

    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Proxy/1.0',
        'Cache-Control': 'no-cache',
        // Agregar headers adicionales para evitar bloqueos
        'Referer': 'https://www.realestategozamadrid.com',
        'Origin': 'https://www.realestategozamadrid.com'
      },
      // Timeout de 8 segundos por intento
      signal: AbortSignal.timeout(8000)
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    console.log(`[WordPress Proxy] Éxito con ${baseUrl}: ${Array.isArray(data) ? data.length : 0} posts`);
    
    return data;
  };

  // Intentar con cada URL hasta que una funcione
  let lastError = null;
  for (const wpUrl of WORDPRESS_URLS) {
    try {
      console.log(`[WordPress Proxy] Probando WordPress en: ${wpUrl}`);
      
      const data = await tryWordPressAPI(wpUrl);
      
      // Procesar los posts para asegurar formato consistente
      const processedPosts = Array.isArray(data) ? data.map(post => {
        // Función para procesar URLs de imágenes featured media
        const processFeaturedMedia = (embedded) => {
          if (!embedded || !embedded['wp:featuredmedia'] || !embedded['wp:featuredmedia'][0]) {
            return null;
          }

          const media = embedded['wp:featuredmedia'][0];
          let sourceUrl = media.source_url;

          // Corregir URLs problemáticas
          if (sourceUrl) {
            // Corregir subdomain incorrecto
            if (sourceUrl.includes('wordpress.realestategozamadrid.com')) {
              sourceUrl = sourceUrl.replace('wordpress.realestategozamadrid.com', 'www.realestategozamadrid.com');
            }
            
            // Asegurar HTTPS
            if (sourceUrl.startsWith('http:')) {
              sourceUrl = sourceUrl.replace('http:', 'https:');
            }

            // Actualizar el objeto media
            media.source_url = sourceUrl;
          }

          return media;
        };

        // Procesar embedded media
        const processedEmbedded = post._embedded ? {
          ...post._embedded,
          'wp:featuredmedia': post._embedded['wp:featuredmedia'] ? 
            [processFeaturedMedia(post._embedded)] : []
        } : {};

        return {
          id: post.id,
          title: post.title,
          content: post.content,
          excerpt: post.excerpt,
          date: post.date,
          slug: post.slug,
          status: post.status,
          author: post.author,
          featured_media: post.featured_media,
          categories: post.categories || [],
          tags: post.tags || [],
          _embedded: processedEmbedded,
          _links: post._links || {}
        };
      }) : [];

      // Establecer headers de caché
      res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos de caché
      
      return res.status(200).json(processedPosts);

    } catch (error) {
      console.error(`[WordPress Proxy] Error con ${wpUrl}: ${error.message}`);
      lastError = error;
      // Continuar con la siguiente URL
      continue;
    }
  }

  // Si todas las URLs fallaron, devolver datos de ejemplo para desarrollo
  console.log('[WordPress Proxy] Todas las URLs fallaron, devolviendo datos de ejemplo');
  
  const samplePosts = [
    {
      id: 'sample-1',
      title: { rendered: 'Guía de inversión inmobiliaria en Madrid 2024' },
      content: { rendered: '<p>Descubre las mejores oportunidades de inversión en el mercado inmobiliario madrileño.</p>' },
      excerpt: { rendered: 'Las claves para invertir con éxito en propiedades en Madrid.' },
      date: new Date().toISOString(),
      slug: 'guia-inversion-inmobiliaria-madrid-2024',
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
      _links: {}
    },
    {
      id: 'sample-2',
      title: { rendered: 'Los barrios más rentables para alquilar en Madrid' },
      content: { rendered: '<p>Análisis de los barrios con mayor demanda de alquiler y mejor rentabilidad.</p>' },
      excerpt: { rendered: 'Descubre dónde invertir para obtener los mejores rendimientos por alquiler.' },
      date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
      slug: 'barrios-rentables-alquiler-madrid',
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
      _links: {}
    }
  ];

  // Sin caché para datos de ejemplo
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('X-Fallback', 'sample-data');
  
  return res.status(200).json(samplePosts);
} 