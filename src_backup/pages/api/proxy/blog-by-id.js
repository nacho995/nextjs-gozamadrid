import axios from 'axios';

/**
 * Proxy para obtener un blog específico por ID desde MongoDB o WordPress
 * Este endpoint conecta a la API correspondiente y obtiene un blog específico
 */
export default async function handler(req, res) {
  // Permitir solicitudes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Cache-Control, Pragma');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Obtener el ID del blog de los parámetros de consulta
  const { id, source } = req.query;
  
  if (!id) {
    return res.status(400).json({ error: 'Se requiere un ID o slug de blog' });
  }

  // Mejorar la detección de tipo de ID
  const isMongoId = id && /^[0-9a-fA-F]{24}$/.test(id);
  // Si source está definido, usar esa fuente, sino determinar automáticamente basado en el formato del ID
  const useMongoDb = source === 'mongodb' || (!source && isMongoId);
  
  // URL base para MongoDB - eliminar barra final si existe
  let mongoUrl = process.env.NEXT_PUBLIC_API_MONGODB_URL || 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
  if (mongoUrl.endsWith('/')) {
    mongoUrl = mongoUrl.slice(0, -1);
  }
  
  // URL base para WordPress
  const wpUrl = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';

  console.log(`[proxy/blog-by-id] Procesando solicitud para ID: ${id}, Fuente: ${source || 'auto'}, Usando MongoDB: ${useMongoDb}`);
  console.log(`[proxy/blog-by-id] URLs configuradas: MongoDB=${mongoUrl}, WordPress=${wpUrl}`);

  // Blog de muestra como respaldo en caso de error
  const sampleBlog = {
    _id: id,
    id: id,
    title: 'Blog no disponible temporalmente',
    content: '<p>Lo sentimos, este blog no está disponible en este momento. Por favor, inténtelo de nuevo más tarde.</p>',
    description: 'Este blog no está disponible temporalmente',
    slug: `blog-${id}`,
    date: new Date().toISOString(),
    dateFormatted: new Date().toLocaleDateString('es-ES'),
    image: {
      src: '/img/default-blog-image.jpg',
      alt: 'Blog no disponible'
    },
    source: useMongoDb ? 'mongodb-fallback' : 'wordpress-fallback',
    author: 'Sistema Goza Madrid'
  };

  try {
    // PASO 1: Intentar con la fuente principal (MongoDB o WordPress)
    if (useMongoDb) {
      // Intentar obtener blog de MongoDB
      try {
        // Ajustar la ruta de la API - Asegurarse de que apunta correctamente a /api/blogs/[id]
        // Verificar que la URL base no tiene una barra final para evitar dobles barras
        const cleanMongoUrl = mongoUrl.endsWith('/') ? mongoUrl.slice(0, -1) : mongoUrl;
        const blogUrl = `${cleanMongoUrl}/api/blogs/${id}`;
        
        console.log(`[proxy/blog-by-id] Intentando obtener blog de MongoDB: ${blogUrl}`);
        
        // Registrar configuración
        console.log(`[proxy/blog-by-id] Configuración: URL Base MongoDB=${mongoUrl}, ID=${id}, isMongoId=${isMongoId}`);
        
        // Usar solicitud directa en lugar de proxy para diagnóstico
        try {
          // Primero intentar con acceso directo para diagnóstico
          console.log(`[proxy/blog-by-id] Intentando acceso directo a: ${blogUrl}`);
          const directResponse = await axios({
            method: 'GET',
            url: blogUrl,
            timeout: 15000, // Aumentar timeout para redes lentas
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store',
              'Pragma': 'no-cache',
              'User-Agent': 'GozaMadrid-Frontend/1.0',
              'Origin': 'https://www.realestategozamadrid.com'
            }
          }).catch(err => {
            console.log(`[proxy/blog-by-id] Error en acceso directo: ${err.message}`);
            return null;
          });
          
          if (directResponse && directResponse.data && (directResponse.data._id || directResponse.data.id)) {
            console.log(`[proxy/blog-by-id] Blog encontrado con acceso directo: ${directResponse.data.title || 'Sin título'}`);
            const processedBlog = processBlog(directResponse.data, id, 'mongodb-direct');
            return res.status(200).json(processedBlog);
          }
        } catch (directErr) {
          console.log(`[proxy/blog-by-id] Error en acceso directo: ${directErr.message}`);
        }
        
        // Si el acceso directo falló, intentar con el proxy como respaldo
        // Usar nuestro propio proxy para evitar problemas de contenido mixto
        const apiProxyUrl = '/api/proxy-raw';
        const response = await axios({
          method: 'POST',
          url: apiProxyUrl,
          timeout: 10000, // 10 segundos de timeout
          data: {
            url: blogUrl,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache, no-store',
              'Pragma': 'no-cache',
              'User-Agent': 'GozaMadrid-Frontend/1.0',
              'Origin': 'https://www.realestategozamadrid.com'
            }
          },
          validateStatus: function (status) {
            return status < 500; // Aceptar cualquier respuesta que no sea un 5xx
          }
        }).catch(err => {
          console.error(`[proxy/blog-by-id] Error en solicitud proxy a MongoDB: ${err.message}`);
          return { status: 0, data: null };
        });

        // Verificar si la respuesta de MongoDB contiene datos
        if (response.status >= 200 && response.status < 300 && response.data) {
          const blog = response.data;
          if (blog._id || blog.id) {
            console.log(`[proxy/blog-by-id] Blog encontrado en MongoDB: ${blog.title || 'Sin título'}`);
            
            // Procesar el blog y devolverlo
            const processedBlog = processBlog(blog, id, 'mongodb');
            return res.status(200).json(processedBlog);
          }
          
          // Si obtenemos una respuesta pero sin datos válidos, registrar info adicional
          console.log(`[proxy/blog-by-id] Respuesta recibida pero sin blog válido: ${JSON.stringify(response.data).substring(0, 200)}`);
        }
        
        console.log(`[proxy/blog-by-id] Blog no encontrado en MongoDB o respuesta inválida: ${response.status}`);
      } catch (mongoError) {
        console.error(`[proxy/blog-by-id] Error al conectar con MongoDB: ${mongoError.message}`);
      }
    } else {
      // Intentar obtener post de WordPress
      try {
        // Construir URL para búsqueda por slug en WordPress
        const wpQueryUrl = `${wpUrl}/posts?slug=${encodeURIComponent(id)}&_embed=true`;
        console.log(`[proxy/blog-by-id] Intentando obtener post de WordPress: ${wpQueryUrl}`);
        
        // Usar nuestro propio proxy para evitar problemas de contenido mixto
        const apiProxyUrl = '/api/proxy-raw';
        const response = await axios({
          method: 'POST',
          url: apiProxyUrl,
          timeout: 10000, // 10 segundos de timeout
          data: {
            url: wpQueryUrl,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'GozaMadrid-Frontend/1.0',
              'Origin': 'https://www.realestategozamadrid.com'
            }
          },
          validateStatus: function (status) {
            return status < 500; // Aceptar cualquier respuesta que no sea un 5xx
          }
        }).catch(err => {
          console.error(`[proxy/blog-by-id] Error en solicitud proxy a WordPress: ${err.message}`);
          return { status: 0, data: null };
        });

        // Verificar si la respuesta de WordPress contiene datos
        if (response.status >= 200 && response.status < 300 && response.data) {
          const wpPosts = response.data;
          if (Array.isArray(wpPosts) && wpPosts.length > 0) {
            const wpPost = wpPosts[0];
            console.log(`[proxy/blog-by-id] Post encontrado en WordPress: ${wpPost.id}`);
            
            // Transformar el post de WordPress al formato esperado
            const transformedPost = {
              _id: `wp-${wpPost.id}`,
              id: wpPost.id,
              title: wpPost.title?.rendered || 'Sin título',
              content: wpPost.content?.rendered || '<p>Sin contenido</p>',
              date: wpPost.date || new Date().toISOString(),
              dateFormatted: new Date(wpPost.date || new Date()).toLocaleDateString('es-ES'),
              author: wpPost._embedded?.author?.[0]?.name || 'Equipo Goza Madrid',
              excerpt: wpPost.excerpt?.rendered || '',
              source: 'wordpress',
              slug: wpPost.slug
            };
            
            // Extraer imagen destacada si existe
            if (wpPost._embedded && wpPost._embedded['wp:featuredmedia'] && wpPost._embedded['wp:featuredmedia'][0]) {
              const media = wpPost._embedded['wp:featuredmedia'][0];
              transformedPost.image = {
                src: media.source_url || '',
                alt: wpPost.title?.rendered || 'Imagen del blog'
              };
            } else {
              transformedPost.image = {
                src: '/img/default-blog-image.jpg',
                alt: transformedPost.title
              };
            }
            
            return res.status(200).json(transformedPost);
          }
        }
        
        console.log(`[proxy/blog-by-id] Post no encontrado en WordPress o respuesta inválida: ${response.status}`);
      } catch (wpError) {
        console.error(`[proxy/blog-by-id] Error al conectar con WordPress: ${wpError.message}`);
      }
    }
    
    // PASO 2: Si no se encuentra en la fuente primaria, intentar con la alternativa
    if (useMongoDb) {
      // Si falló MongoDB, intentar con WordPress (por si es un slug)
      try {
        const wpQueryUrl = `${wpUrl}/posts?slug=${encodeURIComponent(id)}&_embed=true`;
        console.log(`[proxy/blog-by-id] Intentando obtener post de WordPress (alternativa): ${wpQueryUrl}`);
        
        const apiProxyUrl = '/api/proxy-raw';
        const response = await axios({
          method: 'POST',
          url: apiProxyUrl,
          timeout: 10000,
          data: {
            url: wpQueryUrl,
            method: 'GET',
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'GozaMadrid-Frontend/1.0',
              'Origin': 'https://www.realestategozamadrid.com'
            }
          }
        }).catch(err => {
          console.error(`[proxy/blog-by-id] Error en solicitud proxy alternativa a WordPress: ${err.message}`);
          return { status: 0, data: null };
        });

        if (response.status >= 200 && response.status < 300 && response.data) {
          const wpPosts = response.data;
          if (Array.isArray(wpPosts) && wpPosts.length > 0) {
            const wpPost = wpPosts[0];
            console.log(`[proxy/blog-by-id] Post encontrado en WordPress (alternativa): ${wpPost.id}`);
            
            // Transformar el post de WordPress al formato esperado
            const transformedPost = {
              _id: `wp-${wpPost.id}`,
              id: wpPost.id,
              title: wpPost.title?.rendered || 'Sin título',
              content: wpPost.content?.rendered || '<p>Sin contenido</p>',
              date: wpPost.date || new Date().toISOString(),
              dateFormatted: new Date(wpPost.date || new Date()).toLocaleDateString('es-ES'),
              author: wpPost._embedded?.author?.[0]?.name || 'Equipo Goza Madrid',
              excerpt: wpPost.excerpt?.rendered || '',
              source: 'wordpress',
              slug: wpPost.slug
            };
            
            // Extraer imagen destacada si existe
            if (wpPost._embedded && wpPost._embedded['wp:featuredmedia'] && wpPost._embedded['wp:featuredmedia'][0]) {
              const media = wpPost._embedded['wp:featuredmedia'][0];
              transformedPost.image = {
                src: media.source_url || '',
                alt: wpPost.title?.rendered || 'Imagen del blog'
              };
            } else {
              transformedPost.image = {
                src: '/img/default-blog-image.jpg',
                alt: transformedPost.title
              };
            }
            
            return res.status(200).json(transformedPost);
          }
        }
      } catch (altWpError) {
        console.error(`[proxy/blog-by-id] Error en búsqueda alternativa en WordPress: ${altWpError.message}`);
      }
    } else {
      // Si falló WordPress, intentar con MongoDB (por si es un ID)
      try {
        // Esta parte solo se ejecuta si el ID podría ser un ID de MongoDB válido
        if (id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id)) {
          const blogUrl = `${mongoUrl}/api/blogs/${id}`;
          console.log(`[proxy/blog-by-id] Intentando obtener blog de MongoDB (alternativa): ${blogUrl}`);
          
          const apiProxyUrl = '/api/proxy-raw';
          const response = await axios({
            method: 'POST',
            url: apiProxyUrl,
            timeout: 10000,
            data: {
              url: blogUrl,
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Cache-Control': 'no-cache, no-store',
                'Pragma': 'no-cache',
                'User-Agent': 'GozaMadrid-Frontend/1.0',
                'Origin': 'https://www.realestategozamadrid.com'
              }
            }
          }).catch(err => {
            console.error(`[proxy/blog-by-id] Error en solicitud proxy alternativa a MongoDB: ${err.message}`);
            return { status: 0, data: null };
          });

          if (response.status >= 200 && response.status < 300 && response.data) {
            const blog = response.data;
            if (blog._id || blog.id) {
              console.log(`[proxy/blog-by-id] Blog encontrado en MongoDB (alternativa): ${blog.title || 'Sin título'}`);
              
              // Procesar el blog y devolverlo
              const processedBlog = processBlog(blog, id, 'mongodb');
              return res.status(200).json(processedBlog);
            }
          }
        }
      } catch (altMongoError) {
        console.error(`[proxy/blog-by-id] Error en búsqueda alternativa en MongoDB: ${altMongoError.message}`);
      }
    }
    
    // Si llegamos aquí, no se encontró el blog en ninguna fuente
    console.log(`[proxy/blog-by-id] Blog no encontrado en ninguna fuente, devolviendo datos de respaldo`);
    
    // Personalizar el mensaje según el error encontrado
    const customSampleBlog = {
      _id: id,
      id: id,
      title: 'Blog no disponible temporalmente',
      content: `<p>Lo sentimos, este blog no está disponible en este momento. Por favor, inténtelo de nuevo más tarde.</p>
                <p>Información técnica: El ID ${id} no fue encontrado en la base de datos. Esto puede deberse a que el blog 
                ha sido eliminado o movido a otra ubicación.</p>
                <p>Puede regresar a la lista de blogs para ver el contenido disponible.</p>`,
      description: 'Este blog no está disponible temporalmente',
      slug: `blog-${id}`,
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('es-ES'),
      image: {
        src: '/img/default-blog-image.jpg',
        alt: 'Blog no disponible'
      },
      source: useMongoDb ? 'mongodb-fallback' : 'wordpress-fallback',
      author: 'Sistema Goza Madrid'
    };
    
    return res.status(207).json(customSampleBlog); // Código 207 indica datos de fallback
  } catch (generalError) {
    console.error(`[proxy/blog-by-id] Error general: ${generalError.message}`);
    
    if (generalError.response) {
      console.error(`[proxy/blog-by-id] Status: ${generalError.response.status}, Datos:`, 
        typeof generalError.response.data === 'object' ? JSON.stringify(generalError.response.data).substring(0, 200) : generalError.response.data);
    }
    
    // Mejorar mensaje de error para proporcionar más contexto
    const errorBlog = {
      _id: id,
      id: id,
      title: 'Error al cargar el blog',
      content: `<p>Lo sentimos, ha ocurrido un error al intentar cargar este blog.</p>
                <p>Error: ${generalError.message || 'Error de conexión al servidor'}</p>
                <p>Por favor, intente nuevamente más tarde o contacte al administrador del sitio si el problema persiste.</p>`,
      description: 'Error al cargar el blog',
      slug: `blog-${id}`,
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('es-ES'),
      image: {
        src: '/img/default-blog-image.jpg',
        alt: 'Error al cargar blog'
      },
      source: 'error',
      author: 'Sistema Goza Madrid'
    };
    
    return res.status(207).json(errorBlog);
  }
}

// Función para procesar y normalizar blogs de MongoDB
function processBlog(blog, id, source) {
  // Crear una copia para no modificar el original
  const blogData = { ...blog };
  
  // Procesar el blog para garantizar valores mínimos
  const processedBlog = {
    _id: blogData._id || blogData.id || id,
    id: blogData.id || blogData._id || id,
    title: blogData.title || 'Sin título',
    content: blogData.content || blogData.description || '',
    description: blogData.description || blogData.excerpt || '',
    slug: blogData.slug || `blog-${id}`,
    date: blogData.date || blogData.createdAt || new Date().toISOString(),
    dateFormatted: new Date(blogData.date || blogData.createdAt || new Date()).toLocaleDateString('es-ES'),
    source: source || 'api',
    author: blogData.author || 'Goza Madrid',
    category: blogData.category || 'Blog',
  };
  
  // Asegurarse de pasar otros campos importantes
  if (blogData.readTime) processedBlog.readTime = blogData.readTime;
  if (blogData.button) processedBlog.button = blogData.button;
  if (blogData.tags) processedBlog.tags = blogData.tags;
  
  // Procesar las imágenes - manejo mejorado
  if (blogData.images && blogData.images.length > 0) {
    // Mantener el array original de imágenes
    processedBlog.images = blogData.images;
    
    // Además, crear una imagen principal para compatibilidad
    const firstImage = blogData.images[0];
    if (firstImage) {
      const imageSrc = typeof firstImage === 'string' 
        ? firstImage 
        : (firstImage.src || firstImage.url || '');
        
      processedBlog.image = {
        src: imageSrc.startsWith('http') 
          ? `/api/proxy-image?url=${encodeURIComponent(imageSrc)}`
          : imageSrc,
        alt: processedBlog.title || 'Imagen del blog'
      };
    }
  } else if (!processedBlog.image) {
    // Si no hay imágenes, usar imagen predeterminada
    processedBlog.image = {
      src: '/img/default-blog-image.jpg',
      alt: processedBlog.title || 'Imagen del blog'
    };
  } else if (typeof processedBlog.image === 'string') {
    // Si la imagen es una cadena, convertirla a objeto
    processedBlog.image = {
      src: processedBlog.image.startsWith('http')
        ? `/api/proxy-image?url=${encodeURIComponent(processedBlog.image)}`
        : processedBlog.image,
      alt: processedBlog.title || 'Imagen del blog'
    };
  } else if (processedBlog.image && processedBlog.image.src) {
    // Si la imagen ya es un objeto con src, asegurarse de que use proxy si es necesario
    if (processedBlog.image.src.startsWith('http') && !processedBlog.image.src.startsWith('/api/proxy-image')) {
      processedBlog.image.src = `/api/proxy-image?url=${encodeURIComponent(processedBlog.image.src)}`;
    }
  }
  
  // Registrar el resultado para diagnóstico
  console.log(`[processBlog] Procesando blog ${processedBlog._id}: Título=${processedBlog.title}, Imágenes=${processedBlog.images?.length || 0}`);
  
  return processedBlog;
} 