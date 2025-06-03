import axios from 'axios';

/**
 * Proxy para obtener blogs del backend en AWS Elastic Beanstalk
 * Este endpoint se conecta a la API de blogs de Elastic Beanstalk
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

  // URL base de la API en AWS Elastic Beanstalk
  const baseUrl = process.env.NEXT_PUBLIC_API_MONGODB_URL || 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
  const limit = req.query.limit || 100;

  console.log(`[proxy/backend/blogs] Intentando conectar a: ${baseUrl}/api/blogs`);

  // Blogs de muestra como respaldo
  const sampleBlogs = [
    {
      _id: 'sample-aws-1',
      title: 'Mercado inmobiliario en Madrid 2023',
      description: 'Análisis del mercado inmobiliario en Madrid durante el 2023, tendencias y perspectivas',
      slug: 'mercado-inmobiliario-madrid-2023',
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('es-ES'),
      image: {
        src: '/img/default-blog-image.jpg',
        alt: 'Mercado inmobiliario en Madrid'
      },
      source: 'aws-beanstalk-sample',
      author: 'Analista Goza Madrid'
    },
    {
      _id: 'sample-aws-2',
      title: 'Cómo elegir el mejor barrio para invertir',
      description: 'Guía para seleccionar los mejores barrios de Madrid donde realizar una inversión inmobiliaria rentable',
      slug: 'elegir-mejor-barrio-inversion',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      image: {
        src: '/img/default-blog-image.jpg',
        alt: 'Barrios para invertir en Madrid'
      },
      source: 'aws-beanstalk-sample',
      author: 'Asesor Inmobiliario'
    },
    {
      _id: 'sample-aws-3',
      title: 'Tendencias en decoración para 2023',
      description: 'Las últimas tendencias en decoración de interiores para pisos y apartamentos en Madrid',
      slug: 'tendencias-decoracion-2023',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      image: {
        src: '/img/default-blog-image.jpg',
        alt: 'Decoración de interiores'
      },
      source: 'aws-beanstalk-sample',
      author: 'Diseñador de Interiores'
    }
  ];

  try {
    // Comprobar si el servicio está disponible (ping rápido)
    let serverAvailable = false;
    try {
      console.log(`[proxy/backend/blogs] Comprobando disponibilidad de ${baseUrl}`);
      
      // En lugar de hacer un ping directamente, que puede fallar por contenido mixto,
      // intentaremos usar nuestro propio proxy para verificar el estado
      const proxyPingUrl = '/api/proxy-raw';
      const pingResponse = await axios({
        method: 'POST',
        url: proxyPingUrl,
        timeout: 5000,
        data: {
          url: `${baseUrl}`,
          method: 'HEAD',
          headers: {
            'User-Agent': 'GozaMadrid-Frontend/1.0',
            'Accept': 'application/json'
          }
        }
      }).catch(err => {
        console.error(`[proxy/backend/blogs] Error en ping proxy: ${err.message}`);
        return { status: 0 };
      });
      
      if (pingResponse.status >= 200 && pingResponse.status < 300) {
        console.log(`[proxy/backend/blogs] Servidor disponible a través de proxy (status: ${pingResponse.status})`);
        serverAvailable = true;
      } else {
        console.log(`[proxy/backend/blogs] Servidor respondió con estado no óptimo a través de proxy: ${pingResponse.status}`);
      }
    } catch (pingError) {
      console.error(`[proxy/backend/blogs] Error de conexión en el ping: ${pingError.message}`);
      // No interrumpimos, intentaremos de todas formas la solicitud principal
    }
    
    // Si el servidor no está disponible según el ping, retornamos inmediatamente los datos de muestra
    if (!serverAvailable) {
      console.log('[proxy/backend/blogs] Servidor no disponible, devolviendo datos de muestra');
      return res.status(200).json(sampleBlogs);
    }
    
    // Intentar obtener los blogs del backend real
    try {
      console.log(`[proxy/backend/blogs] Obteniendo blogs desde ${baseUrl}/api/blogs`);
      
      // Usar nuestro propio proxy para evitar problemas de contenido mixto
      const apiProxyUrl = '/api/proxy-raw';
      const response = await axios({
        method: 'POST',
        url: apiProxyUrl,
        timeout: 10000, // 10 segundos de timeout
        data: {
          url: `${baseUrl}/api/blogs`,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'User-Agent': 'GozaMadrid-Frontend/1.0',
            'Origin': 'https://www.realestategozamadrid.com'
          }
        },
        validateStatus: function (status) {
          return status < 500; // Aceptar cualquier respuesta que no sea un 5xx
        }
      }).catch(err => {
        console.error(`[proxy/backend/blogs] Error en solicitud proxy: ${err.message}`);
        return { status: 0, data: null };
      });

      // Verificar si la respuesta contiene datos
      if (response.status >= 200 && response.status < 300 && response.data && Array.isArray(response.data)) {
        console.log(`[proxy/backend/blogs] Blogs obtenidos: ${response.data.length}`);
        
        // Procesar cada blog
        const blogs = response.data.map(blog => {
          // Asegurar valores mínimos para todas las propiedades
          const processedBlog = {
            _id: blog._id || blog.id || `aws-${Math.random().toString(36).substring(2, 11)}`,
            id: blog.id || blog._id || `id-${Math.random().toString(36).substring(2, 9)}`,
            title: blog.title || 'Sin título',
            content: blog.content || blog.description || '',
            description: blog.description || blog.excerpt || '',
            slug: blog.slug || `blog-${Math.random().toString(36).substring(2, 7)}`,
            date: blog.date || blog.createdAt || new Date().toISOString(),
            dateFormatted: new Date(blog.date || blog.createdAt || new Date()).toLocaleDateString('es-ES'),
            source: 'aws-beanstalk',
            ...blog
          };
          
          // Procesar la imagen
          if (!processedBlog.image && processedBlog.images && processedBlog.images.length > 0) {
            const firstImage = processedBlog.images[0];
            processedBlog.image = {
              src: typeof firstImage === 'string' 
                ? `/api/proxy-image?url=${encodeURIComponent(firstImage)}`
                : `/api/proxy-image?url=${encodeURIComponent(firstImage.src || firstImage.url || '')}`,
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (!processedBlog.image) {
            processedBlog.image = {
              src: '/img/default-blog-image.jpg',
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (typeof processedBlog.image === 'string') {
            processedBlog.image = {
              src: `/api/proxy-image?url=${encodeURIComponent(processedBlog.image)}`,
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (processedBlog.image.src) {
            if (!processedBlog.image.src.startsWith('/api/proxy-image')) {
              processedBlog.image.src = `/api/proxy-image?url=${encodeURIComponent(processedBlog.image.src)}`;
            }
          }
          
          return processedBlog;
        });
        
        return res.status(200).json(blogs);
      } else {
        console.log(`[proxy/backend/blogs] Respuesta no válida: Status ${response.status}`);
        
        if (response.data && typeof response.data === 'object') {
          console.log('[proxy/backend/blogs] Datos de respuesta:', JSON.stringify(response.data).substring(0, 200) + '...');
        }
        
        // Devolver datos de muestra si no hay respuesta válida
        return res.status(200).json(sampleBlogs);
      }
    } catch (apiError) {
      console.error(`[proxy/backend/blogs] Error en la solicitud a la API: ${apiError.message}`);
      
      if (apiError.response) {
        console.error(`[proxy/backend/blogs] Status: ${apiError.response.status}, Datos:`, 
          typeof apiError.response.data === 'object' ? JSON.stringify(apiError.response.data).substring(0, 200) : apiError.response.data);
      }
      
      // Enviar datos de muestra en caso de error
      return res.status(200).json(sampleBlogs);
    }
  } catch (generalError) {
    console.error(`[proxy/backend/blogs] Error general: ${generalError.message}`);
    
    // Siempre devolver una respuesta válida
    return res.status(200).json(sampleBlogs);
  }
} 