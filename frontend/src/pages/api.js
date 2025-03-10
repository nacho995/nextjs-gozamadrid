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
    console.log("Intentando obtener prefijos de país desde la API local");
    
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
    console.log("Usando prefijos de país por defecto");
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
  let allBlogs = [];
  
  // 1. Intentar obtener blogs de WordPress usando nuestro proxy
  try {
    console.log("Obteniendo blogs de WordPress...");
    
    // Usar el proxy con el parámetro endpoint=wp para indicar que queremos la API de WordPress
    const wpResponse = await fetch(
      "/api/wordpress-proxy?endpoint=wp&path=posts&_embed=true"
    );
    
    console.log("Respuesta de WordPress:", {
      status: wpResponse.status,
      statusText: wpResponse.statusText
    });
    
    if (wpResponse.ok) {
      const wpBlogs = await wpResponse.json();
      
      console.log(`Obtenidos ${wpBlogs.length} blogs de WordPress`);
      
      // Añadir los blogs de WordPress al array, con la fuente marcada
      wpBlogs.forEach(blog => {
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
      const errorData = await wpResponse.json();
      console.error(`Error al obtener blogs de WordPress: ${wpResponse.status}`, errorData);
    }
  } catch (error) {
    console.error("Error con WordPress:", error.message);
  }
  
  // 2. Intentar obtener blogs de MongoDB usando la API directa
  try {
    console.log("Obteniendo blogs de MongoDB...");
    
    // Usar la ruta correcta con API_URL
    const mongoResponse = await fetch(`${API_URL}/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log("Respuesta de MongoDB:", {
      status: mongoResponse.status,
      statusText: mongoResponse.statusText
    });
    
    if (mongoResponse.ok) {
      const contentType = mongoResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const mongoBlogs = await mongoResponse.json();
        
        console.log(`Obtenidos ${mongoBlogs.length} blogs de MongoDB`);
        
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
  
  console.log(`Total de blogs obtenidos: ${allBlogs.length}`);
  return allBlogs;
}

export async function deleteBlogPost(id) {
  const response = await fetch(`${API_URL}/blog/${id}`, {
    method: 'DELETE',
  });

  return response.json();
}

export async function getBlogById(id) {
  try {
    // Verificar si es un ID de MongoDB (formato ObjectId)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isMongoId) {
      // Es un ID de MongoDB, obtener de nuestra API
      console.log(`Obteniendo blog de MongoDB con ID ${id}`);
      // Usar la ruta con API_URL
      const response = await fetch(`${API_URL}/blog/${id}`);
      
      console.log("Respuesta de MongoDB:", {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        console.error(`Error al obtener blog de MongoDB: ${response.status}`);
        throw new Error(`Error al obtener blog: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Datos del blog de MongoDB:", data);
      
      // Procesar las imágenes según el esquema
      let blogImages = [];
      
      // Verificar si el blog tiene imágenes
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        // Usar las imágenes del esquema
        blogImages = data.images.map(img => {
          // Asegurarse de que la URL sea absoluta
          const src = typeof img === 'string' 
            ? img 
            : (img.src || '');
          
          const imgSrc = src.startsWith('http') 
            ? src 
            : `${API_URL}${src.startsWith('/') ? '' : '/'}${src}`;
          
          return {
            src: imgSrc,
            alt: (typeof img === 'object' && img.alt) ? img.alt : (data.title || 'Imagen del blog')
          };
        });
      } else if (data.image) {
        // Compatibilidad con el formato anterior
        if (typeof data.image === 'string') {
          // Si la imagen es una cadena, crear un objeto de imagen
          const baseUrl = API_URL;
          const imageSrc = data.image.startsWith('http') 
            ? data.image 
            : `${baseUrl}${data.image.startsWith('/') ? '' : '/'}${data.image}`;
          
          blogImages = [{ 
            src: imageSrc, 
            alt: data.title || 'Imagen del blog' 
          }];
        } else {
          // Si ya es un objeto, asegurarse de que la URL sea absoluta
          const baseUrl = API_URL;
          const src = data.image.src || data.image.url || '';
          
          blogImages = [{
            ...data.image,
            src: src.startsWith('http') 
              ? src 
              : `${baseUrl}${src.startsWith('/') ? '' : '/'}${src}`
          }];
        }
      } else {
        // Si no hay imágenes, usar una por defecto
        blogImages = [{ 
          src: '/img/default-blog-image.jpg', 
          alt: data.title || 'Imagen del blog' 
        }];
      }
      
      // Asegurarse de que el blog tenga todos los campos necesarios
      return {
        ...data,
        _id: data._id,
        title: data.title || 'Sin título',
        content: data.content || data.description || '',
        description: data.description || data.excerpt || '',
        date: data.createdAt || data.date || new Date().toISOString(),
        dateFormatted: data.dateFormatted || (data.createdAt ? new Date(data.createdAt).toLocaleDateString('es-ES') : new Date().toLocaleDateString('es-ES')),
        images: blogImages, // Guardar el array completo de imágenes
        image: blogImages[0] || { src: '/img/default-blog-image.jpg', alt: 'Imagen del blog' }, // Compatibilidad con el formato anterior
        imageUrl: blogImages[0]?.src || '/img/default-blog-image.jpg',
        source: 'mongodb'
      };
    } else {
      // Es un ID de WordPress, usar nuestro proxy
      console.log(`Obteniendo blog de WordPress con ID ${id}`);
      const response = await fetch(`/api/wordpress-proxy?endpoint=wp&path=posts/${id}&_embed=true`);
      
      console.log("Respuesta de WordPress:", {
        status: response.status,
        statusText: response.statusText
      });
      
      if (!response.ok) {
        console.error(`Error al obtener blog de WordPress: ${response.status}`);
        throw new Error(`Error al obtener blog de WordPress: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Datos del blog de WordPress:", data);
      
      // Procesar la imagen destacada
      let featuredImage = null;
      
      // Intentar obtener la imagen destacada desde _embedded
      if (data._embedded && data._embedded['wp:featuredmedia'] && data._embedded['wp:featuredmedia'][0]) {
        const media = data._embedded['wp:featuredmedia'][0];
        
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
      if (!featuredImage && data.uagb_featured_image_src) {
        featuredImage = data.uagb_featured_image_src.medium?.[0] || 
                        data.uagb_featured_image_src.full?.[0];
      }
      
      // Si aún no hay imagen, usar una imagen por defecto
      if (!featuredImage) {
        featuredImage = '/img/default-blog-image.jpg';
      }
      
      // Crear el objeto de blog con la imagen procesada
      return {
        ...data,
        _id: `wp-${data.id}`,
        id: data.id,
        title: data.title?.rendered || data.title || '',
        content: data.content?.rendered || data.content || '',
        excerpt: data.excerpt?.rendered || data.excerpt || '',
        date: data.date,
        dateFormatted: new Date(data.date).toLocaleDateString('es-ES'),
        images: [{ 
          src: featuredImage, 
          alt: data.title?.rendered || data.title || 'Imagen del blog' 
        }],
        image: {
          src: featuredImage,
          alt: data.title?.rendered || data.title || 'Imagen del blog'
        },
        imageUrl: featuredImage,
        slug: data.slug,
        source: 'wordpress'
      };
    }
  } catch (error) {
    console.error("Error en getBlogById:", error);
    throw error;
  }
}

export async function getPropertyPosts() {
  let wpData = [];
  let mongoData = [];
  
  // 1. Intentar obtener propiedades de WooCommerce a través del proxy
  try {
    console.log("Obteniendo propiedades de WooCommerce...");
    
    // Usar nuestro proxy de Next.js
    const firstPageResponse = await fetch(`/api/wordpress-proxy?per_page=100`);
    
    console.log("Respuesta de WooCommerce:", {
      status: firstPageResponse.status,
      statusText: firstPageResponse.statusText
    });
    
    if (!firstPageResponse.ok) {
      console.error(`Error al obtener propiedades de WooCommerce: ${firstPageResponse.status} ${firstPageResponse.statusText}`);
      throw new Error(`Error al obtener propiedades: ${firstPageResponse.status}`);
    }
    
    // Obtener el número total de páginas
    const totalPages = parseInt(firstPageResponse.headers.get('X-WP-TotalPages') || '1');
    console.log(`Total de páginas de propiedades: ${totalPages}`);
    
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
          fetch(`/api/wordpress-proxy?page=${page}&per_page=100`)
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
    
    console.log(`Total de propiedades de WooCommerce obtenidas: ${wpData.length}`);
  } catch (wpError) {
    console.error("Error al obtener propiedades de WooCommerce:", wpError);
  }
  
  // 2. Intentar obtener propiedades de MongoDB
  try {
    console.log("Obteniendo propiedades de MongoDB...");
    
    // Usar la ruta correcta con API_URL
    const mongoResponse = await fetch(`${API_URL}/property`);
    
    console.log("Respuesta de MongoDB:", {
      status: mongoResponse.status,
      statusText: mongoResponse.statusText
    });
    
    if (mongoResponse.ok) {
      const contentType = mongoResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const properties = await mongoResponse.json();
        console.log("Propiedades de MongoDB obtenidas:", properties);
        
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
            price: property.price || 0,
            location: property.location || 'Madrid',
            bedrooms: property.bedrooms || 0,
            bathrooms: property.bathrooms || 0,
            size: property.size || 0,
            images: images,
            source: 'mongodb'
          };
        });
        
        console.log(`Total de propiedades de MongoDB obtenidas: ${mongoData.length}`);
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
  
  console.log(`Total de propiedades combinadas: ${combinedData.length}`);
  return combinedData;
}

export async function getPropertyById(id) {
  try {
    console.log(`[DEBUG] Iniciando getPropertyById para ID: ${id}`);
    
    // Verificar si es un ID de MongoDB (formato ObjectId)
    const isMongoId = /^[0-9a-fA-F]{24}$/.test(id);
    console.log(`[DEBUG] ¿Es ID de MongoDB? ${isMongoId}`);
    
    // Crear un controlador de aborto para establecer un timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      console.log(`[DEBUG] TIMEOUT alcanzado para la propiedad con ID: ${id}`);
      controller.abort();
    }, 10000); // 10 segundos timeout
    
    let response;
    
    if (isMongoId) {
      // Es un ID de MongoDB, obtener de nuestra API
      console.log(`[DEBUG] Obteniendo propiedad de MongoDB con ID ${id}`);
      
      try {
        // Usar la URL base según el entorno
        const baseUrl = typeof window === 'undefined' 
          ? API_URL // En el servidor
          : ''; // En el cliente (URL relativa)
        
        const url = `${baseUrl}/property/${id}`;
        console.log(`[DEBUG] URL de petición MongoDB: ${url}`);
        
        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log(`[DEBUG] Respuesta MongoDB recibida: ${response.status} ${response.statusText}`);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`[DEBUG] Error en fetch MongoDB:`, error);
        
        if (error.name === 'AbortError') {
          console.error("[DEBUG] La solicitud a MongoDB se canceló por timeout");
          throw new Error("Tiempo de espera agotado al obtener la propiedad. Por favor, inténtalo de nuevo.");
        }
        
        throw error;
      }
    } else {
      // Es un ID de WooCommerce, usar nuestro proxy
      console.log(`[DEBUG] Obteniendo propiedad de WooCommerce con ID ${id}`);
      
      try {
        // Usar la URL base según el entorno
        const baseUrl = typeof window === 'undefined' 
          ? `${API_URL}/api/wordpress-proxy` // En el servidor
          : '/api/wordpress-proxy'; // En el cliente
        
        const url = `${baseUrl}?path=products/${id}`;
        console.log(`[DEBUG] URL de petición WooCommerce: ${url}`);
        
        response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Expires': '0'
          }
        });
        
        console.log(`[DEBUG] Respuesta WooCommerce recibida: ${response.status} ${response.statusText}`);
      } catch (error) {
        clearTimeout(timeoutId);
        console.error(`[DEBUG] Error en fetch WooCommerce:`, error);
        
        if (error.name === 'AbortError') {
          console.error("[DEBUG] La solicitud a WooCommerce se canceló por timeout");
          throw new Error("Tiempo de espera agotado al obtener la propiedad. Por favor, inténtalo de nuevo.");
        }
        
        throw error;
      }
    }
    
    // Limpiar el timeout
    clearTimeout(timeoutId);
    
    // Verificar si la respuesta es exitosa
    if (!response.ok) {
      console.error(`[DEBUG] Error en respuesta: ${response.status} ${response.statusText}`);
      throw new Error(`Error al obtener propiedad: ${response.status} ${response.statusText}`);
    }
    
    // Obtener los datos de la respuesta
    console.log(`[DEBUG] Intentando obtener JSON de la respuesta`);
    const data = await response.json();
    console.log(`[DEBUG] JSON obtenido correctamente para ID ${id}`);
    
    // Procesar los datos según el tipo de propiedad
    if (isMongoId) {
      console.log(`[DEBUG] Procesando datos de MongoDB`);
      // Procesar las imágenes para asegurar URLs absolutas
      let images = [];
      if (data.images) {
        if (Array.isArray(data.images)) {
          console.log(`[DEBUG] Procesando array de imágenes: ${data.images.length} imágenes`);
          images = data.images.map(img => {
            if (typeof img === 'string') {
              // Si la imagen es una cadena, verificar si es una URL absoluta
              return img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`;
            } else if (typeof img === 'object' && img.src) {
              // Si es un objeto con src, asegurar que sea una URL absoluta
              const src = img.src.startsWith('http') ? img.src : `${API_URL}${img.src.startsWith('/') ? '' : '/'}${img.src}`;
              return {
                ...img,
                src
              };
            }
            return img;
          }).filter(img => img); // Filtrar valores nulos o indefinidos
        } else if (typeof data.images === 'string') {
          // Si images es una cadena
          console.log(`[DEBUG] Procesando imagen única (string)`);
          const img = data.images;
          images = [img.startsWith('http') ? img : `${API_URL}${img.startsWith('/') ? '' : '/'}${img}`];
        }
      }
      
      // Si no hay imágenes, usar una imagen por defecto
      if (images.length === 0) {
        console.log(`[DEBUG] No se encontraron imágenes, usando imagen por defecto`);
        images = ['/img/default-property-image.jpg'];
      }
      
      // Asegurarse de que todos los campos críticos estén definidos
      const result = { 
        ...data, 
        _id: data._id,
        title: data.title || data.name || 'Propiedad sin título',
        description: data.description || '',
        price: data.price || 0,
        location: data.location || 'Madrid',
        bedrooms: data.bedrooms || data.rooms || 0,
        bathrooms: data.bathrooms || data.wc || 0,
        size: data.area || data.m2 || 0,
        images: images,
        source: 'mongodb' 
      };
      
      console.log(`[DEBUG] Datos de MongoDB procesados correctamente`);
      return result;
    } else {
      console.log(`[DEBUG] Procesando datos de WooCommerce`);
      // Procesar las imágenes para asegurar que tenemos URLs válidas
      let images = [];
      
      // Intentar obtener imágenes de diferentes fuentes en WooCommerce
      if (data.images && Array.isArray(data.images) && data.images.length > 0) {
        console.log(`[DEBUG] Procesando array de imágenes WooCommerce: ${data.images.length} imágenes`);
        images = data.images.map(img => img.src || img).filter(img => img);
      } else if (data.image && data.image.src) {
        console.log(`[DEBUG] Procesando imagen única WooCommerce`);
        images = [data.image.src];
      }
      
      // Si no hay imágenes, usar una imagen por defecto
      if (images.length === 0) {
        console.log(`[DEBUG] No se encontraron imágenes WooCommerce, usando imagen por defecto`);
        images = ['/img/default-property-image.jpg'];
      }
      
      // Asegurarse de que todos los campos críticos estén definidos
      const result = { 
        ...data, 
        id: data.id,
        title: data.name || 'Propiedad sin título',
        description: data.description || '',
        price: data.price || 0,
        location: data.address || 'Madrid',
        bedrooms: data.meta_data?.find(m => m.key === 'bedrooms')?.value || 0,
        bathrooms: data.meta_data?.find(m => m.key === 'bathrooms')?.value || 0,
        size: data.meta_data?.find(m => m.key === 'area')?.value || 0,
        images: images,
        source: 'woocommerce' 
      };
      
      console.log(`[DEBUG] Datos de WooCommerce procesados correctamente`);
      return result;
    }
  } catch (error) {
    console.error("[DEBUG] Error en getPropertyById:", error);
    console.error("[DEBUG] Stack trace:", error.stack);
    throw error;
  }
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
    // Usamos la constante API_URL que ya está definida en el archivo
    let endpoint = `${API_URL}/api/property-notification`;
    
    // Si es una oferta, usar la nueva ruta

    
    if (data.type === 'offer') {
      endpoint = `${API_URL}/api/property-offer/create`;
      
      // Renombrar campos si es necesario para mantener compatibilidad
      const { type, ...offerData } = data;
    
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(offerData),
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error en respuesta:', errorText);
        throw new Error('Error en la respuesta del servidor');
      }
      
      return await response.json();
    }
    
    // Para otros tipos (visitas), usar la ruta original
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(data),
    });
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error en respuesta:', errorText);
      throw new Error('Error en la respuesta del servidor');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error al enviar email:', error);
    return {
      success: false,
      message: error.message || 'Error al procesar la solicitud',
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