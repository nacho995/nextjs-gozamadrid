/**
 * Endpoint de compatibilidad para /api/blogs
 * Redirige las llamadas al proxy de WordPress
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
    
    // Construir URL para el proxy de WordPress
    const proxyUrl = new URL('/api/proxy/wordpress/posts', `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`);
    proxyUrl.searchParams.set('per_page', perPage);
    proxyUrl.searchParams.set('page', page);
    proxyUrl.searchParams.set('_embed', _embed);
    
    console.log(`[/api/blogs] Redirigiendo a: ${proxyUrl.toString()}`);
    
    // Hacer la llamada al proxy de WordPress
    const response = await fetch(proxyUrl.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-BlogsProxy/1.0'
      }
    });
    
    if (!response.ok) {
      throw new Error(`Proxy WordPress falló: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    
    // Configurar headers de caché
    res.setHeader('Cache-Control', 'public, max-age=300'); // 5 minutos de caché
    res.setHeader('X-Redirected-From', 'blogs');
    res.setHeader('X-Redirected-To', 'proxy/wordpress/posts');
    
    return res.status(200).json(data);
    
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
        }
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
        }
      }
    ];
    
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('X-Fallback', 'sample-data');
    
    return res.status(200).json(sampleBlogs);
  }
} 