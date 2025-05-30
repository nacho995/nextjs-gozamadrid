import axios from 'axios';

const WP_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';

/**
 * Proxy para obtener posts de WordPress
 * Este endpoint se conecta directamente a la API de WordPress
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

  // URL base de WordPress
  const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';
  
  try {
    console.log(`[WordPress Proxy] Obteniendo posts desde ${WORDPRESS_API_URL}/posts`);
    
    // Construir URL con parámetros
    const url = new URL(`${WORDPRESS_API_URL}/posts`);
    url.searchParams.append('per_page', per_page);
    url.searchParams.append('page', page);
    url.searchParams.append('_embed', _embed);
    
    // Realizar la solicitud a WordPress
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GozaMadrid-Frontend/1.0',
      },
      // Timeout de 10 segundos
      signal: AbortSignal.timeout(10000)
    });

    if (!response.ok) {
      console.error(`[WordPress Proxy] Error ${response.status}: ${response.statusText}`);
      
      // Si WordPress no está disponible, devolver datos de ejemplo
      const samplePosts = [
        {
          id: 1,
          title: { rendered: 'Tendencias del mercado inmobiliario en Madrid 2024' },
          excerpt: { rendered: 'Análisis completo de las tendencias más importantes del mercado inmobiliario madrileño para este año.' },
          content: { rendered: '<p>Contenido completo del artículo sobre tendencias inmobiliarias...</p>' },
          date: new Date().toISOString(),
          slug: 'tendencias-mercado-inmobiliario-madrid-2024',
          featured_media: 0,
          author: 1,
          categories: [1],
          tags: [],
          _embedded: {
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop'
            }]
          }
        },
        {
          id: 2,
          title: { rendered: 'Guía para inversores: Los mejores barrios de Madrid' },
          excerpt: { rendered: 'Descubre cuáles son los barrios con mayor potencial de revalorización y rentabilidad de alquiler.' },
          content: { rendered: '<p>Guía completa para inversores inmobiliarios en Madrid...</p>' },
          date: new Date(Date.now() - 7*24*60*60*1000).toISOString(),
          slug: 'guia-inversores-mejores-barrios-madrid',
          featured_media: 0,
          author: 1,
          categories: [1],
          tags: [],
          _embedded: {
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop'
            }]
          }
        },
        {
          id: 3,
          title: { rendered: 'Decoración de interiores: Tendencias 2024' },
          excerpt: { rendered: 'Las últimas tendencias en decoración que están marcando el estilo de los hogares madrileños.' },
          content: { rendered: '<p>Artículo sobre las tendencias de decoración más actuales...</p>' },
          date: new Date(Date.now() - 14*24*60*60*1000).toISOString(),
          slug: 'decoracion-interiores-tendencias-2024',
          featured_media: 0,
          author: 1,
          categories: [2],
          tags: [],
          _embedded: {
            'wp:featuredmedia': [{
              source_url: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop'
            }]
          }
        }
      ];

      console.log(`[WordPress Proxy] Devolviendo ${samplePosts.length} posts de ejemplo`);
      
      // Agregar headers de cache
      res.setHeader('Cache-Control', 'public, max-age=300');
      return res.status(200).json(samplePosts);
    }

    // Procesar la respuesta exitosa
    const posts = await response.json();
    
    if (!Array.isArray(posts)) {
      console.error('[WordPress Proxy] La respuesta no es un array:', typeof posts);
      return res.status(500).json({ error: 'Formato de respuesta inválido' });
    }

    console.log(`[WordPress Proxy] ${posts.length} posts obtenidos exitosamente`);
    
    // Procesar cada post para asegurar formato consistente
    const processedPosts = posts.map(post => {
      // Asegurar que tiene imagen destacada
      let featuredImageUrl = null;
      
      if (post._embedded && post._embedded['wp:featuredmedia'] && post._embedded['wp:featuredmedia'][0]) {
        featuredImageUrl = post._embedded['wp:featuredmedia'][0].source_url;
      }
      
      // Si no tiene imagen, usar una por defecto
      if (!featuredImageUrl) {
        featuredImageUrl = `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80`;
      }
      
      // Asegurar que la imagen sea HTTPS
      if (featuredImageUrl && featuredImageUrl.startsWith('http:')) {
        featuredImageUrl = featuredImageUrl.replace('http:', 'https:');
      }
      
      return {
        ...post,
        _embedded: {
          ...post._embedded,
          'wp:featuredmedia': [{
            source_url: featuredImageUrl
          }]
        }
      };
    });

    // Cachear la respuesta por 5 minutos
    res.setHeader('Cache-Control', 'public, max-age=300, stale-while-revalidate=600');
    
    return res.status(200).json(processedPosts);
    
  } catch (error) {
    console.error('[WordPress Proxy] Error:', error.message);
    
    // En caso de error, devolver posts de ejemplo
    const fallbackPosts = [
      {
        id: 'fallback-1',
        title: { rendered: 'Artículo de ejemplo - Mercado inmobiliario' },
        excerpt: { rendered: 'Este es un artículo de ejemplo mientras solucionamos la conexión con WordPress.' },
        content: { rendered: '<p>Contenido de ejemplo...</p>' },
        date: new Date().toISOString(),
        slug: 'articulo-ejemplo-mercado-inmobiliario',
        featured_media: 0,
        author: 1,
        categories: [1],
        tags: [],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80'
          }]
        }
      }
    ];

    console.log('[WordPress Proxy] Devolviendo posts de fallback debido a error');
    
    // Sin cache en caso de error
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json(fallbackPosts);
  }
} 