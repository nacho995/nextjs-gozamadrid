/**
 * Proxy para obtener blogs del backend en Render
 * Este endpoint se conecta a la API de blogs de Render
 */
export default async function handler(req, res) {
  // Permitir solicitudes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Construir URL para obtener blogs
  const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'https://nextjs-gozamadrid-qrfk.onrender.com';
  const endpoint = `${baseUrl}/api/blogs`;
  const limit = req.query.limit || 100;

  console.log(`[proxy/backend/blogs] Intentando conectar a: ${endpoint}`);

  // Blogs de muestra como respaldo
  const sampleBlogs = [
    {
      _id: 'sample-render-1',
      title: 'Mercado inmobiliario en Madrid 2024',
      description: 'Análisis del mercado inmobiliario en Madrid durante el 2024, tendencias y perspectivas para el próximo año',
      slug: 'mercado-inmobiliario-madrid-2024',
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('es-ES'),
      image: {
        src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        alt: 'Mercado inmobiliario en Madrid'
      },
      source: 'render-sample',
      author: 'Analista Goza Madrid',
      content: 'Análisis detallado del mercado inmobiliario...',
      excerpt: 'Las tendencias del mercado inmobiliario en Madrid muestran...'
    },
    {
      _id: 'sample-render-2',
      title: 'Cómo elegir el mejor barrio para invertir en Madrid',
      description: 'Guía completa para seleccionar los mejores barrios de Madrid donde realizar una inversión inmobiliaria rentable y segura',
      slug: 'elegir-mejor-barrio-inversion-madrid',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      image: {
        src: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
        alt: 'Barrios para invertir en Madrid'
      },
      source: 'render-sample',
      author: 'Asesor Inmobiliario',
      content: 'Guía para inversores sobre los mejores barrios...',
      excerpt: 'La elección del barrio correcto es fundamental...'
    },
    {
      _id: 'sample-render-3',
      title: 'Tendencias en decoración de interiores 2024',
      description: 'Las últimas tendencias en decoración de interiores para pisos y apartamentos en Madrid, estilos y colores de moda',
      slug: 'tendencias-decoracion-interiores-2024',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      image: {
        src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
        alt: 'Decoración de interiores'
      },
      source: 'render-sample',
      author: 'Diseñador de Interiores',
      content: 'Las tendencias de decoración para este año...',
      excerpt: 'La decoración de interiores evoluciona constantemente...'
    }
  ];

  try {
    console.log(`[proxy/backend/blogs] Obteniendo blogs desde ${endpoint}`);
    
    // Realizar solicitud directa sin axios
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'User-Agent': 'GozaMadrid-Frontend/1.0',
      },
      signal: AbortSignal.timeout(8000) // 8 segundos de timeout
    });

    // Verificar si la respuesta es exitosa
    if (response.ok) {
      const data = await response.json();
      
      if (data && Array.isArray(data) && data.length > 0) {
        console.log(`[proxy/backend/blogs] Blogs obtenidos: ${data.length}`);
        
        // Procesar cada blog
        const blogs = data.map(blog => {
          // Asegurar valores mínimos para todas las propiedades
          const processedBlog = {
            _id: blog._id || blog.id || `render-${Math.random().toString(36).substring(2, 11)}`,
            id: blog.id || blog._id || `id-${Math.random().toString(36).substring(2, 9)}`,
            title: blog.title || 'Sin título',
            content: blog.content || blog.description || '',
            description: blog.description || blog.excerpt || '',
            slug: blog.slug || `blog-${Math.random().toString(36).substring(2, 7)}`,
            date: blog.date || blog.createdAt || new Date().toISOString(),
            dateFormatted: new Date(blog.date || blog.createdAt || new Date()).toLocaleDateString('es-ES'),
            source: 'render',
            author: blog.author || 'Equipo Goza Madrid',
            ...blog
          };
          
          // Procesar la imagen
          if (!processedBlog.image && processedBlog.images && processedBlog.images.length > 0) {
            const firstImage = processedBlog.images[0];
            processedBlog.image = {
              src: typeof firstImage === 'string' 
                ? firstImage.startsWith('http') ? firstImage : `https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80`
                : firstImage.src || firstImage.url || 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (!processedBlog.image) {
            processedBlog.image = {
              src: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (typeof processedBlog.image === 'string') {
            processedBlog.image = {
              src: processedBlog.image.startsWith('http') ? processedBlog.image : 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
              alt: processedBlog.title || 'Imagen del blog'
            };
          }
          
          return processedBlog;
        });
        
        // Cachear respuesta exitosa
        res.setHeader('Cache-Control', 'public, max-age=300');
        return res.status(200).json(blogs);
      }
    }
    
    // Si llegamos aquí, no hay datos válidos del servidor
    console.log('[proxy/backend/blogs] No hay datos válidos del servidor, usando datos de muestra');
    res.setHeader('Cache-Control', 'public, max-age=60'); // Cache más corto para muestra
    return res.status(200).json(sampleBlogs);
    
  } catch (error) {
    console.error(`[proxy/backend/blogs] Error: ${error.message}`);
    
    // Siempre devolver una respuesta válida con datos de muestra
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.status(200).json(sampleBlogs);
  }
} 