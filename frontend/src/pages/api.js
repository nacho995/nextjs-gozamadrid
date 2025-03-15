// Exportar solo las funciones de utilidad sin crear una ruta API
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

// Definir las claves de API de WooCommerce
export const WC_CONSUMER_KEY = process.env.NEXT_PUBLIC_NEXT_PUBLIC_WOO_COMMERCE_KEY;
export const WC_CONSUMER_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET;

// Función auxiliar para manejar errores
export const handleApiError = (error, functionName) => {
  console.error(`Error en ${functionName}:`, error);
  if (error.response) {
    // El servidor respondió con un código de error
    throw new Error(`Error ${error.response.status}: ${error.response.statusText}`);
  } else if (error.request) {
    // La petición fue hecha pero no se recibió respuesta
    throw new Error('No se recibió respuesta del servidor');
  } else {
    // Error al configurar la petición
    throw new Error(error.message || 'Error desconocido');
  }
};

export async function getCountryPrefix() {
  try {
    // Usar AbortController para evitar bloqueos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos timeout
    
    const response = await fetch(`${API_URL}/prefix`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      signal: controller.signal
    });
    
    clearTimeout(timeoutId);

    // Si la respuesta fue exitosa y es JSON, devolver los datos
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        return await response.json();
      }
    }
    
    // Si algo falla, devolver prefijos por defecto
    return getDefaultCountryPrefixes();
    
  } catch (error) {
    console.error("Error al obtener prefijos de país:", error.message);
    // En caso de error, devolver prefijos por defecto
    return getDefaultCountryPrefixes();
  }
}

// Esta es la forma correcta, un junior podría hacerlo así:
export async function getBlogPosts() {
  // Array donde guardaremos todos los blogs
  const allBlogs = [];
  
  // 1. Intentar obtener blogs de WordPress
  try {
    // Usar nuestro proxy de Next.js
    const response = await fetch(`/api/wordpress-proxy?endpoint=wp&path=posts&per_page=10&_embed=true`);
    
    if (!response.ok) {
      console.error(`Error al obtener blogs de WordPress: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener blogs: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (Array.isArray(data) && data.length > 0) {
      // Procesar cada blog
      data.forEach(blog => {
        // Procesar la imagen destacada
        let featuredImage = null;
        
        // Intentar obtener la imagen destacada desde _embedded
        if (blog._embedded && blog._embedded['wp:featuredmedia'] && blog._embedded['wp:featuredmedia'][0]) {
          const media = blog._embedded['wp:featuredmedia'][0];
          
          if (media.media_details && media.media_details.sizes) {
            // Buscar la mejor imagen disponible
            const sizePriority = ['medium_large', 'medium', 'large', 'full'];
            
            for (const size of sizePriority) {
              if (media.media_details.sizes[size]) {
                featuredImage = media.media_details.sizes[size].source_url;
                break;
              }
            }
          }
          
          // Si no se encontró ninguna imagen en los tamaños, usar la URL de origen
          if (!featuredImage && media.source_url) {
            featuredImage = media.source_url;
          }
        }
        
        // Si no hay imagen destacada, intentar obtenerla de uagb_featured_image_src
        if (!featuredImage && blog.uagb_featured_image_src) {
          featuredImage = blog.uagb_featured_image_src.medium?.[0] || 
                          blog.uagb_featured_image_src.full?.[0];
        }
        
        // Si aún no hay imagen, usar una imagen por defecto
        if (!featuredImage) {
          featuredImage = '/img/default-blog-image.jpg';
        }
        
        // Crear el objeto de blog con la imagen procesada
        allBlogs.push({
          ...blog,
          image: {
            src: featuredImage,
            alt: blog.title?.rendered || blog.title || 'Imagen del blog'
          },
          title: blog.title?.rendered || blog.title || '',
          content: blog.content?.rendered || blog.content || '',
          excerpt: blog.excerpt?.rendered || blog.excerpt || '',
          source: 'wordpress'
        });
      });
    } else {
      const errorData = await response.json();
      console.error(`Error al obtener blogs de WordPress: ${response.status}`, errorData);
    }
  } catch (error) {
    console.error("Error con WordPress:", error.message);
  }
  
  // 2. Intentar obtener blogs de MongoDB usando la API directa
  try {
    // Usar la ruta correcta con API_URL
    const mongoResponse = await fetch(`${API_URL}/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (mongoResponse.ok) {
      const contentType = mongoResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const mongoBlogs = await mongoResponse.json();
        
        // Añadir los blogs de MongoDB al array, con la fuente marcada
        mongoBlogs.forEach(blog => {
          // Procesar las imágenes según el esquema
          let blogImages = [];
          
          // Verificar si el blog tiene imágenes
          if (blog.images && Array.isArray(blog.images) && blog.images.length > 0) {
            // Usar las imágenes del esquema
            blogImages = blog.images.map(img => {
              // Asegurarse de que la URL sea absoluta
              const src = typeof img === 'string' 
                ? img 
                : (img.src || '');
              
              const imgSrc = src.startsWith('http') 
                ? src 
                : `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
              
              return {
                src: imgSrc,
                alt: (typeof img === 'object' && img.alt) ? img.alt : (blog.title || 'Imagen del blog')
              };
            });
          } else if (blog.image) {
            // Compatibilidad con el formato anterior
            if (typeof blog.image === 'string') {
              // Si la imagen es una cadena, crear un objeto de imagen
              const baseUrl = API_URL;
              const imageSrc = blog.image.startsWith('http') 
                ? blog.image 
                : `${baseUrl}${blog.image.startsWith('/') ? '' : '/'}${blog.image}`;
              
              blogImages = [{ 
                src: imageSrc, 
                alt: blog.title || 'Imagen del blog' 
              }];
            } else {
              // Si ya es un objeto, asegurarse de que la URL sea absoluta
              const baseUrl = API_URL;
              const src = blog.image.src || blog.image.url || '';
              
              blogImages = [{
                ...blog.image,
                src: src.startsWith('http') 
                  ? src 
                  : `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`
              }];
            }
          } else {
            // Si no hay imágenes, usar una por defecto
            blogImages = [{ 
              src: '/img/default-blog-image.jpg', 
              alt: blog.title || 'Imagen del blog' 
            }];
          }
          
          // Asegurarse de que el blog tenga todos los campos necesarios
          allBlogs.push({
            ...blog,
            _id: blog._id || `mongo-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
            title: blog.title || 'Sin título',
            content: blog.content || blog.description || '',
            description: blog.description || blog.excerpt || '',
            date: blog.createdAt || blog.date || new Date().toISOString(),
            dateFormatted: blog.dateFormatted || (blog.createdAt ? new Date(blog.createdAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')),
            images: blogImages, // Guardar el array completo de imágenes
            image: blogImages[0] || { src: '/img/default-blog-image.jpg', alt: 'Imagen del blog' }, // Compatibilidad con el formato anterior
            source: 'mongodb'
          });
        });
      } else {
        console.error("La respuesta no es JSON válido:", await mongoResponse.text());
      }
    } else {
      try {
        const errorText = await mongoResponse.text();
        console.error(`Error al obtener blogs de MongoDB: ${mongoResponse.status}`, errorText);
      } catch (e) {
        console.error(`Error al obtener blogs de MongoDB: ${mongoResponse.status}`, mongoResponse.statusText);
      }
    }
  } catch (error) {
    console.error("Error con MongoDB:", error.message);
  }
  
  return allBlogs;
}

export async function deleteBlogPost(id) {
  const response = await fetch(`${API_URL}/blog/${id}`, {
    method: 'DELETE',
  });

  return response.json();
}

// Función de utilidad para reintentos con backoff exponencial
async function fetchConReintentos(fetchFn, options = {}) {
  const {
    maxRetries = 5,
    initialTimeout = 2000,
    maxTimeout = 30000,
    factor = 2,
    isProduction = process.env.NODE_ENV === 'production'
  } = options;

  let intento = 1;
  let timeout = initialTimeout;
  let lastError = null;

  while (intento <= (isProduction ? maxRetries : 2)) {
    try {
      console.log(`[DEBUG] Intento ${intento} de ${isProduction ? maxRetries : 2}`);
      
      // Añadir jitter aleatorio para evitar thundering herd
      const jitter = Math.random() * 1000;
      const timeoutWithJitter = Math.min(timeout + jitter, maxTimeout);
      
      if (intento > 1) {
        console.log(`[DEBUG] Esperando ${Math.round(timeoutWithJitter)}ms antes del siguiente intento`);
        await new Promise(resolve => setTimeout(resolve, timeoutWithJitter));
      }
      
      const result = await fetchFn();
      return result;
      
    } catch (error) {
      console.error(`[DEBUG] Error en intento ${intento}:`, error);
      lastError = error;
      
      // Incrementar el timeout de forma exponencial
      timeout = Math.min(timeout * factor, maxTimeout);
      intento++;
      
      // Si es el último intento, lanzar el error
      if (intento > (isProduction ? maxRetries : 2)) {
        throw lastError;
      }
    }
  }
  
  throw lastError || new Error('Error después de múltiples intentos');
}

export async function getBlogById(id) {
  try {
    console.log(`[DEBUG] Iniciando getBlogById para ID: ${id}`);
    
    const isProduction = process.env.NODE_ENV === 'production';
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        console.log('[DEBUG] Timeout alcanzado, abortando petición');
        controller.abort();
      }, isProduction ? 30000 : 10000);
      
      try {
        let response;
        
        if (isMongoId) {
          const baseUrl = typeof window === 'undefined' ? API_URL : '';
          const url = `${baseUrl}/blog/${id}`;
          
          response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        } else {
          const url = `/api/wordpress-proxy?endpoint=wp&path=posts/${id}&_embed=true`;
          
          response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return isMongoId ? procesarBlogMongoDB(data) : procesarBlogWordPress(data);
        
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    return await fetchConReintentos(fetchData, {
      maxRetries: 7,
      initialTimeout: 2000,
      maxTimeout: 30000,
      factor: 1.5,
      isProduction
    });
    
  } catch (error) {
    console.error("[DEBUG] Error final en getBlogById:", error);
    throw error;
  }
}

// Función auxiliar para procesar blogs de MongoDB
function procesarBlogMongoDB(data) {
  let blogImages = [];
  
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    blogImages = data.images.map(img => {
      const src = typeof img === 'string' ? img : (img.src || '');
      const imgSrc = src.startsWith('http') ? src : `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
      return {
        src: imgSrc,
        alt: (typeof img === 'object' && img.alt) ? img.alt : (data.title || 'Imagen del blog')
      };
    });
  } else if (data.image) {
    if (typeof data.image === 'string') {
      const imageSrc = data.image.startsWith('http') ? data.image : `${API_URL}${data.image.startsWith('/') ? '' : '/'}${data.image}`;
      blogImages = [{ src: imageSrc, alt: data.title || 'Imagen del blog' }];
    } else {
      const src = data.image.src || data.image.url || '';
      blogImages = [{
        ...data.image,
        src: src.startsWith('http') ? src : `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`
      }];
    }
  }
  
  if (blogImages.length === 0) {
    blogImages = [{ src: '/img/default-blog-image.jpg', alt: data.title || 'Imagen del blog' }];
  }
  
  return {
    ...data,
    _id: data._id,
    title: data.title || 'Sin título',
    content: data.content || data.description || '',
    description: data.description || data.excerpt || '',
    date: data.createdAt || data.date || new Date().toISOString(),
    dateFormatted: data.dateFormatted || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')),
    images: blogImages,
    image: blogImages[0],
    imageUrl: blogImages[0]?.src || '/img/default-blog-image.jpg',
    source: 'mongodb'
  };
}

// Función auxiliar para procesar blogs de WordPress
function procesarBlogWordPress(data) {
  let featuredImage = null;
  
  if (data._embedded && data._embedded['wp:featuredmedia'] && data._embedded['wp:featuredmedia'][0]) {
    const media = data._embedded['wp:featuredmedia'][0];
    
    if (media.media_details && media.media_details.sizes) {
      const sizePriority = ['medium_large', 'medium', 'large', 'full'];
      
      for (const size of sizePriority) {
        if (media.media_details.sizes[size]) {
          featuredImage = media.media_details.sizes[size].source_url;
          break;
        }
      }
    }
    
    if (!featuredImage && media.source_url) {
      featuredImage = media.source_url;
    }
  }
  
  if (!featuredImage && data.uagb_featured_image_src) {
    featuredImage = data.uagb_featured_image_src.medium?.[0] || data.uagb_featured_image_src.full?.[0];
  }
  
  if (!featuredImage) {
    featuredImage = '/img/default-blog-image.jpg';
  }
  
  return {
    ...data,
    _id: `wp-${data.id}`,
    id: data.id,
    title: data.title?.rendered || data.title || '',
    content: data.content?.rendered || data.content || '',
    excerpt: data.excerpt?.rendered || data.excerpt || '',
    date: data.date,
    dateFormatted: new Date(data.date).toLocaleDateString('es-ES'),
    images: [{ src: featuredImage, alt: data.title?.rendered || data.title || 'Imagen del blog' }],
    image: { src: featuredImage, alt: data.title?.rendered || data.title || 'Imagen del blog' },
    imageUrl: featuredImage,
    slug: data.slug,
    source: 'wordpress'
  };
}

export async function getPropertyPosts() {
  let wpData = [];
  let mongoData = [];
  
  // 1. Intentar obtener propiedades de WooCommerce a través del proxy
  try {
    // Usar nuestro proxy de Next.js con el parámetro endpoint correcto
    const firstPageResponse = await fetch(`/api/wordpress-proxy?path=products&per_page=100`);
    
    if (!firstPageResponse.ok) {
      console.error(`Error al obtener propiedades de WooCommerce: ${firstPageResponse.status} ${firstPageResponse.statusText}`);
      throw new Error(`Error al obtener propiedades: ${firstPageResponse.status}`);
    }
    
    // Obtener el número total de páginas
    const totalPages = parseInt(firstPageResponse.headers.get('X-WP-TotalPages') || '1');
    
    // Obtener los datos de la primera página
    const firstPageData = await firstPageResponse.json();
    
    // Marcar las propiedades como provenientes de WooCommerce
    const wpPropertiesWithSource = firstPageData.map(property => ({
      ...property,
      source: 'woocommerce'
    }));
    
    wpData = [...wpPropertiesWithSource];
    
    // Si hay más páginas, obtenerlas en paralelo
    if (totalPages > 1) {
      const pagePromises = [];
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          fetch(`/api/wordpress-proxy?path=products&page=${page}&per_page=100`)
            .then(res => {
              if (!res.ok) throw new Error(`Error en página ${page}: ${res.status}`);
              return res.json();
            })
            .then(pageData => {
              // Marcar las propiedades como provenientes de WooCommerce
              return pageData.map(property => ({
                ...property,
                source: 'woocommerce'
              }));
            })
        );
      }
      
      // Esperar a que todas las promesas adicionales se resuelvan
      const additionalPagesData = await Promise.all(pagePromises);
      
      // Añadir los datos adicionales a wpData
      additionalPagesData.forEach(pageData => {
        wpData = [...wpData, ...pageData];
      });
    }
  } catch (wpError) {
    console.error("Error al obtener propiedades de WooCommerce:", wpError);
  }
  
  // 2. Intentar obtener propiedades de MongoDB
  try {
    // Usar la ruta correcta con API_URL
    const mongoResponse = await fetch(`${API_URL}/property`);
    
    if (mongoResponse.ok) {
      const contentType = mongoResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const properties = await mongoResponse.json();
        
        // Procesar las propiedades para asegurar que tengan el formato correcto
        mongoData = properties.map(property => {
          // Procesar las imágenes para asegurar URLs absolutas
          let images = [];
          if (property.images) {
            if (Array.isArray(property.images)) {
              images = property.images.map(img => {
                if (typeof img === 'string') {
                  // Si la imagen es una cadena, verificar si es una URL absoluta
                  return img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
                } else if (typeof img === 'object' && img.url) {
                  // Si es un objeto con URL
                  return img.url.startsWith('http') ? img.url : `${API_URL}${img.url.startsWith('/') ? '' : '/'}${img.url}`;
                }
                return img;
              });
            } else if (typeof property.images === 'string') {
              // Si images es una cadena
              const img = property.images;
              images = [img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`];
            }
          }
          
          // Si no hay imágenes, usar una imagen por defecto
          if (images.length === 0) {
            images = ['/img/default-property-image.jpg'];
          }
          
          return {
            ...property,
            _id: property._id,
            title: property.title || property.name || 'Propiedad sin título',
            description: property.description || '',
            price: property.price || '0', // Mantener como string
            location: property.location || 'Madrid',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            size: property.m2 || property.area || property.size || 0,
            livingArea: property.m2 || property.area || property.size || 0,
            images: images,
            source: 'mongodb'
          };
        });
      } else {
        console.error("La respuesta no es JSON válido:", await mongoResponse.text());
      }
    } else {
      try {
        const errorText = await mongoResponse.text();
        console.error(`Error al obtener propiedades de MongoDB: ${mongoResponse.status}`, errorText);
      } catch (e) {
        console.error(`Error al obtener propiedades de MongoDB: ${mongoResponse.status}`, mongoResponse.statusText);
      }
    }
  } catch (mongoError) {
    console.error("Error al obtener propiedades de MongoDB:", mongoError);
  }
  
  // Combinar los resultados de ambas fuentes
  const combinedData = [...mongoData, ...wpData];
  
  return combinedData;
}

export async function getPropertyById(id) {
  try {
    const isProduction = process.env.NODE_ENV === 'production';
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    const fetchData = async () => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => {
        controller.abort();
      }, isProduction ? 15000 : 8000);
      
      try {
        let response;
        
        if (isMongoId) {
          const baseUrl = typeof window === 'undefined' ? API_URL : '';
          const url = `${baseUrl}/property/${id}`;
          
          response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        } else {
          // Para propiedades de WooCommerce
          const url = `/api/wordpress-proxy?path=products/${id}`;
          
          response = await fetch(url, {
            signal: controller.signal,
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          });
        }
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error HTTP: ${response.status}`);
        }
        
        const data = await response.json();
        return isMongoId ? procesarDatosMongoDB(data) : procesarDatosWooCommerce(data);
        
      } catch (error) {
        clearTimeout(timeoutId);
        throw error;
      }
    };
    
    return await fetchConReintentos(fetchData, {
      maxRetries: 3,
      initialTimeout: 1000,
      maxTimeout: 10000,
      factor: 1.5,
      isProduction
    });
    
  } catch (error) {
    console.error("Error final en getPropertyById:", error);
    throw error;
  }
}

// Función auxiliar para procesar datos de MongoDB
function procesarDatosMongoDB(data) {
  let images = [];
  
  if (data.images) {
    if (Array.isArray(data.images)) {
      images = data.images.map(img => {
        if (typeof img === 'string') {
          return img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
        } else if (typeof img === 'object' && img.src) {
          const src = img.src.startsWith('http') ? img.src : `${API_URL}${img.src.startsWith('/') ? '' : '/'}${img.src}`;
          return { ...img, src };
        }
        return img;
      }).filter(img => img);
    } else if (typeof data.images === 'string') {
      const img = data.images;
      images = [img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`];
    }
  }
  
  if (images.length === 0) {
    images = ['/img/default-property-image.jpg'];
  }
  
  return {
    ...data,
    _id: data._id,
    title: data.title || data.name || 'Propiedad sin título',
    description: data.description || '',
    price: data.price || '0',
    location: data.location || 'Madrid',
    bedrooms: data.bedrooms || data.rooms || 0,
    bathrooms: data.bathrooms || data.wc || 0,
    size: data.area || data.m2 || 0,
    images: images,
    source: 'mongodb'
  };
}

// Función auxiliar para procesar datos de WooCommerce
function procesarDatosWooCommerce(data) {
  let images = [];
  
  if (data.images && Array.isArray(data.images) && data.images.length > 0) {
    images = data.images.map(img => img.src || img).filter(img => img);
  } else if (data.image && data.image.src) {
    images = [data.image.src];
  }
  
  if (images.length === 0) {
    images = ['/img/default-property-image.jpg'];
  }
  
  return {
    ...data,
    id: data.id,
    title: data.name || 'Propiedad sin título',
    description: data.description || '',
    price: data.price || '0',
    location: data.address || 'Madrid',
    bedrooms: data.meta_data?.find(m => m.key === 'bedrooms')?.value || 0,
    bathrooms: data.meta_data?.find(m => m.key === 'bathrooms')?.value || 0,
    size: data.meta_data?.find(m => m.key === 'area')?.value || 0,
    images: images,
    source: 'woocommerce'
  };
}

// Función para enviar el formulario de contacto
export const sendEmail = async (data) => {
  try {
   
    
    // Reformatear los datos para adaptarse al formato esperado por la API
    const formattedData = {
      nombre: data.name,
      email: data.email,
      prefix: data.prefix || '+34',
      telefono: data.phone || '',
      asunto: data.message // El mensaje lo enviamos como asunto que es lo que espera el backend
    };
    
    // Validación local actualizada para campos
    if (!formattedData.nombre || !formattedData.email) {
      console.error("Faltan datos obligatorios:", formattedData);
      return {
        success: false,
        message: 'Faltan datos requeridos: nombre y email son obligatorios',
        error: 'Validación local',
        ok: false
      };
    }
    
    // Definir el endpoint para el contacto
    const endpoint = `${API_URL}/api/contact`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(formattedData),
    });
    
    // Capturar la respuesta como texto para debugging
    const responseText = await response.text();
    
    // Intentar parsear la respuesta como JSON
    let responseData;
    try {
      responseData = JSON.parse(responseText);
    } catch (e) {
      console.error("Respuesta no es JSON válido");
      return {
        success: false,
        message: 'Formato de respuesta inválido',
        error: 'El servidor no respondió con un formato válido',
        ok: false
      };
    }
    
    // Agregar la propiedad ok para compatibilidad con el código existente
    responseData.ok = response.ok;
    
    return responseData;
  } catch (error) {
    console.error("Error al enviar formulario:", error);
    // Devolver un objeto con formato similar al de respuesta exitosa
    return {
      success: false,
      message: 'Error de conexión',
      error: error.message,
      ok: false
    };
  }
};

export const sendPropertyEmail = async (data) => {
  try {
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://goza-madrid.onrender.com';
    
    if (data.type === 'offer') {
      const endpoint = `${API_URL}/api/property-offer/create`;
      
      // Validar datos requeridos para la oferta
      if (!data.offerAmount || !data.email || !data.name || !data.phone || !data.propertyId || !data.propertyTitle) {
        throw new Error('Faltan datos de la oferta');
      }
      
      // Mapear los campos según PropertyOfferSchema
      const offerData = {
        property: data.propertyId,
        propertyAddress: data.propertyTitle,
        offerPrice: parseFloat(data.offerAmount),
        offerPercentage: data.offerLabel || 'Personalizada',
        email: data.email,
        name: data.name,
        phone: data.phone
      };
    
      console.log('Enviando datos de oferta:', offerData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(offerData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }
      
      return await response.json();
      
    } else if (data.type === 'visit') {
      const endpoint = `${API_URL}/api/property-visit/create`;
      
      // Validar que las fechas sean objetos Date válidos
      if (!(data.visitDate instanceof Date) || !(data.visitTime instanceof Date)) {
        throw new Error('Las fechas proporcionadas no son válidas');
      }
      
      // Validar datos requeridos para la visita
      if (!data.email || !data.name || !data.phone || !data.propertyId || !data.propertyTitle) {
        throw new Error('Faltan datos de la visita');
      }
      
      // Crear objetos Date para fecha y hora
      const visitDate = new Date(data.visitDate);
      const visitTime = new Date(data.visitTime);
      
      // Combinar fecha y hora en un solo objeto Date
      const combinedDateTime = new Date(
        visitDate.getFullYear(),
        visitDate.getMonth(),
        visitDate.getDate(),
        visitTime.getHours(),
        visitTime.getMinutes()
      );
      
      // Mapear los campos según PropertyVisitSchema
      const visitData = {
        property: data.propertyId,
        propertyAddress: data.propertyTitle,
        date: combinedDateTime,
        time: combinedDateTime,
        email: data.email,
        name: data.name,
        phone: data.phone,
        message: data.message || ''
      };

      console.log('Enviando datos de visita:', visitData);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(visitData)
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error en la respuesta del servidor');
      }
      
      return await response.json();
    }
    
    throw new Error('Tipo de solicitud no válido');
  } catch (error) {
    console.error('Error al enviar email:', error);
    return {
      success: false,
      message: error.message
    };
  }
};


export default async function handler(req, res) {
  const { url } = req.query;
  
  if (!url) {
    return res.status(400).json({ error: 'URL no proporcionada' });
  }
  
  try {
    const imageResponse = await fetch(url);
    const imageBuffer = await imageResponse.arrayBuffer();
    
    // Obtener el tipo de contenido
    const contentType = imageResponse.headers.get('content-type');
    
    // Configurar cabeceras de respuesta
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // Cachear por 24 horas
    
    // Enviar la imagen
    res.status(200).send(Buffer.from(imageBuffer));
  } catch (error) {
    console.error('Error al obtener imagen:', error);
    res.status(500).json({ error: 'Error al obtener la imagen' });
  }
} 