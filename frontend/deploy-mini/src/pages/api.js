// Exportar solo las funciones de utilidad sin crear una ruta API
export const API_URL = typeof window !== 'undefined' && window.appConfig 
  ? (window.appConfig.apiUrl === '/api/properties' 
    ? '/api/proxy?service=mongodb&resource=property'
    : window.appConfig.apiUrl)
  : (process.env.NEXT_PUBLIC_API_URL || '/api/proxy?service=mongodb&resource=property');

// Registrar la API_URL para depuración
if (typeof window !== 'undefined') {
  console.log('[API.js] API_URL configurada:', API_URL);
  console.log('[API.js] appConfig disponible:', window.appConfig || 'No disponible');
}

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
    console.log('[DEBUG getBlogPosts] Iniciando solicitud a WordPress');
    // Usar nuestra nueva API de proxy
    const response = await fetch(`/api/proxy?service=wordpress&resource=posts&per_page=10`);
    
    if (!response.ok) {
      console.error(`Error al obtener blogs de WordPress: ${response.status} ${response.statusText}`);
      // Intentar leer el error
      try {
        const errorText = await response.text();
        console.error(`Detalle del error: ${errorText.substring(0, 200)}`);
      } catch (e) {
        console.error('No se pudo leer el error:', e);
      }
      throw new Error(`Error al obtener blogs: ${response.status}`);
    }
    
    // Verificar el tipo de contenido
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`WordPress devolvió un tipo de contenido no JSON: ${contentType}`);
      const text = await response.text();
      console.error(`Primeros 200 caracteres: ${text.substring(0, 200)}`);
      throw new Error('Respuesta no es JSON');
    }
    
    const data = await response.json();
    console.log(`[DEBUG getBlogPosts] Blogs obtenidos: ${Array.isArray(data) ? data.length : 'No es un array'}`);
    
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

// Función auxiliar para determinar la ruta del proxy correcta
let proxyRouteChecked = false;
let useWooCommerceProxyRoute = false;

async function checkProxyRouteAvailability() {
  if (proxyRouteChecked) return useWooCommerceProxyRoute;
  
  if (typeof window !== 'undefined') {
    try {
      // Intenta la ruta de proxy genérico primero
      const genericProxyResponse = await fetch('/api/proxy?service=woocommerce&resource=products&page=1&per_page=1', {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (genericProxyResponse.ok) {
        console.log('[CONFIG] La ruta /api/proxy está disponible');
        useWooCommerceProxyRoute = false;
        proxyRouteChecked = true;
        window.__USE_WOOCOMMERCE_PROXY_ROUTE = false;
        return false;
      }
    } catch (error) {
      console.log('[CONFIG] Error al verificar la ruta /api/proxy:', error.message);
    }
    
    try {
      // Intenta la ruta de woocommerce-proxy
      const dedicatedProxyResponse = await fetch('/api/woocommerce-proxy?endpoint=products&page=1&per_page=1', {
        method: 'HEAD',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (dedicatedProxyResponse.ok) {
        console.log('[CONFIG] La ruta /api/woocommerce-proxy está disponible');
        useWooCommerceProxyRoute = true;
        proxyRouteChecked = true;
        window.__USE_WOOCOMMERCE_PROXY_ROUTE = true;
        return true;
      }
    } catch (error) {
      console.log('[CONFIG] Error al verificar la ruta /api/woocommerce-proxy:', error.message);
    }
    
    // Si ninguna funciona, prefiere la ruta de proxy genérico por defecto
    console.log('[CONFIG] Ninguna ruta de proxy respondió correctamente, usando /api/proxy por defecto');
    useWooCommerceProxyRoute = false;
    proxyRouteChecked = true;
    window.__USE_WOOCOMMERCE_PROXY_ROUTE = false;
    return false;
  }
  
  // En el servidor, usa la ruta de proxy genérico por defecto
  return false;
}

function getWooCommerceProxyUrl(page = 1, perPage = 100) {
  // Si ya hemos verificado la ruta o estamos en el servidor
  if (proxyRouteChecked || typeof window === 'undefined') {
    if (useWooCommerceProxyRoute) {
      return `/api/woocommerce-proxy?endpoint=products&page=${page}&per_page=${perPage}`;
    } else {
      return `/api/proxy?service=woocommerce&resource=products&page=${page}&per_page=${perPage}`;
    }
  }
  
  // Si window.__USE_WOOCOMMERCE_PROXY_ROUTE ya está definido, úsalo
  if (typeof window !== 'undefined' && window.__USE_WOOCOMMERCE_PROXY_ROUTE !== undefined) {
    useWooCommerceProxyRoute = window.__USE_WOOCOMMERCE_PROXY_ROUTE;
    proxyRouteChecked = true;
    
    if (useWooCommerceProxyRoute) {
      return `/api/woocommerce-proxy?endpoint=products&page=${page}&per_page=${perPage}`;
    } else {
      return `/api/proxy?service=woocommerce&resource=products&page=${page}&per_page=${perPage}`;
    }
  }
  
  // Si llegamos aquí, usamos la ruta genérica por defecto mientras se verifica
  // La verificación se hará cuando se use getPropertyPosts
  return `/api/proxy?service=woocommerce&resource=products&page=${page}&per_page=${perPage}`;
}

export async function getPropertyPosts() {
  let wpData = [];
  let mongoData = [];
  
  console.log('Iniciando getPropertyPosts - Recuperando propiedades de WooCommerce y MongoDB');
  
  // Verificar qué ruta de proxy está disponible (si aún no se ha verificado)
  if (!proxyRouteChecked && typeof window !== 'undefined') {
    try {
      await checkProxyRouteAvailability();
    } catch (error) {
      console.error('[CONFIG] Error al verificar las rutas de proxy disponibles:', error);
    }
  }
  
  // 1. Obtener propiedades a través de nuestro proxy de WooCommerce para evitar problemas de CORS
  try {
    console.log('[DEBUG getPropertyPosts] Iniciando solicitud a WooCommerce');
    console.log('Config WC_API_URL:', typeof window !== 'undefined' && window.CONFIG ? window.CONFIG.WC_API_URL : 'No disponible');
    console.log('Config WOO_COMMERCE_KEY:', typeof window !== 'undefined' && window.CONFIG ? (window.CONFIG.WOO_COMMERCE_KEY ? 'Configurado' : 'No configurado') : 'No disponible');
    console.log('Ruta de proxy seleccionada:', useWooCommerceProxyRoute ? 'woocommerce-proxy' : 'proxy genérico');
    
    // Usar nuestro propio proxy para evitar problemas de CORS
    const allWooCommerceProducts = [];
    
    for (let page = 1; page <= 3; page++) {
      try {
        console.log(`[DEBUG getPropertyPosts] Solicitando página ${page} de WooCommerce...`);
        // Obtenemos la URL correcta del proxy usando nuestra función auxiliar
        const proxyUrl = getWooCommerceProxyUrl(page, 100);
        
        console.log('[DEBUG getPropertyPosts] URL del proxy:', proxyUrl);
        
        // Agregar un timeout más largo
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
        
        const response = await fetch(proxyUrl, {
          signal: controller.signal,
          headers: {
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            'Accept': 'application/json',
            'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
          }
        }).finally(() => clearTimeout(timeoutId));
        
        if (!response.ok) {
          console.error(`Error al obtener página ${page} de WooCommerce: ${response.status} ${response.statusText}`);
          // Intentar leer el cuerpo del error
          try {
            const errorBody = await response.text();
            console.error('Cuerpo de error:', errorBody);
          } catch (e) {
            console.error('No se pudo leer el cuerpo del error:', e);
          }
          break;
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          console.error(`Respuesta no es JSON. Content-Type: ${contentType}`);
          try {
            const text = await response.text();
            console.error('Contenido de la respuesta (primeros 500 caracteres):', text.substring(0, 500));
          } catch (e) {
            console.error('No se pudo leer la respuesta:', e);
          }
          break;
        }
        
        const data = await response.json();
        console.log(`[DEBUG getPropertyPosts] Recibidos ${Array.isArray(data) ? data.length : 'no es un array'} productos de WooCommerce en página ${page}`);
        
        if (!data) {
          console.error('La respuesta es undefined');
          break;
        }
        
        if (!Array.isArray(data)) {
          console.error('La respuesta no es un array:', data);
          break;
        }
        
        if (data.length === 0) {
          console.log(`No hay más productos en la página ${page}`);
          break;
        }
        
        allWooCommerceProducts.push(...data);
        
        // Si recibimos menos de 100 productos, significa que es la última página
        if (data.length < 100) {
          break;
        }
      } catch (pageError) {
        console.error(`Error al obtener página ${page}:`, pageError);
        break;
      }
    }
    
    console.log(`Total de productos recuperados de WooCommerce: ${allWooCommerceProducts.length}`);
    
    // Procesar los productos recibidos
    wpData = allWooCommerceProducts.map(product => {
      console.log(`[DEBUG] Procesando producto de WooCommerce ID: ${product.id}, Nombre: ${product.name}`);
      
      // Extraer dirección de los metadatos
      const metadataAddress = product.meta_data?.find(meta => meta.key === 'address')?.value;
      let addressValue = '';
      
      // Determinar correctamente el valor de la dirección
      if (metadataAddress) {
        if (typeof metadataAddress === 'object' && metadataAddress.address) {
          // Verificar si es una dirección real (evitar datos falsos de Australia)
          const addressStr = metadataAddress.address.toString();
          if (!addressStr.includes('Australia') && !addressStr.includes('WA,')) {
            addressValue = addressStr;
          }
        } else if (typeof metadataAddress === 'string') {
          addressValue = metadataAddress;
        }
      }
      
      // Obtener valores de camas, baños y área
      let bedroomsValue = product.meta_data?.find(meta => meta.key === 'bedrooms')?.value || '0';
      let bathroomsValue = product.meta_data?.find(meta => meta.key === 'baños')?.value || '0';
      let areaValue = product.meta_data?.find(meta => meta.key === 'living_area')?.value || '0';
      
      console.log(`[DEBUG] Metadatos extraídos para ID ${product.id}: bedrooms=${bedroomsValue}, bathrooms=${bathroomsValue}, area=${areaValue}`);
      
      // Extraer datos del nombre y descripción
      const description = product.short_description || product.description || '';
      const fullProductName = product.name || '';
      
      // Determinar el nombre de la calle
      const streetName = fullProductName.split(',')[0].trim();
      
      // Valores por defecto para propiedades específicas
      const propertyDefaults = {
        // ID: [título, dirección, habitaciones, baños, área]
        "3945": ["Calle Colegiata", "Calle Colegiata, Madrid", 4, 2, 167],
        "3895": ["Calle Mejico", "Calle Mejico, Madrid", 2, 1, 66],
        "3772": ["Hermosilla", "Calle Hermosilla, Madrid", 3, 2, 137],
        "3313": ["Lope De Rueda 29", "Lope De Rueda 29, 4ºCentro-Derecha, Madrid", 2, 2, 133],
        "3291": ["Jorge Juan 98", "Calle Jorge Juan 98, Madrid", 2, 2, 144],
        "3268": ["Castelló 120", "Calle Castelló 120, Madrid", 2, 2, 114],
        "3157": ["Alcalde Sainz De Baranda", "Calle Alcalde Sainz De Baranda, Madrid", 2, 2, 111],
        "2844": ["Goya 19", "Calle Goya 19, Madrid", 2, 2, 115],
        "2829": ["Príncipe De Vergara 71", "Calle Príncipe De Vergara 71, Madrid", 4, 4, 223],
        "2763": ["Castelló 109", "Calle Castelló 109, Madrid", 3, 2, 125]
      };
      
      // Obtener ID del producto como string
      const productId = product.id.toString();
      
      // Buscar valores predeterminados para esta propiedad
      const defaultValues = propertyDefaults[productId] || null;
      
      // Convertir valores y manejar valores negativos o inválidos
      let finalBedrooms = parseInt(bedroomsValue) || 0;
      let finalBathrooms = parseInt(bathroomsValue) || 0;
      let finalArea = parseInt(areaValue) || 0;
      
      // Verificar valores negativos y reemplazarlos
      if (finalBedrooms <= 0) {
        finalBedrooms = defaultValues ? defaultValues[2] : 2;
      }
      
      if (finalBathrooms <= 0) {
        finalBathrooms = defaultValues ? defaultValues[3] : 1;
      }
      
      if (finalArea <= 0) {
        finalArea = defaultValues ? defaultValues[4] : 100;
      }
      
      // Construir dirección
      let finalAddress = '';
      if (addressValue && addressValue.length > 5) {
        finalAddress = addressValue;
      } else if (defaultValues) {
        finalAddress = defaultValues[1];
      } else {
        finalAddress = fullProductName;
        if (!finalAddress.toLowerCase().includes('madrid')) {
          finalAddress += ', Madrid';
        }
      }
      
      // Determinar título final
      const finalTitle = streetName || (defaultValues ? defaultValues[0] : "Propiedad en Madrid");
      
      console.log(`[DEBUG] Valores finales para ID ${product.id}: bedrooms=${finalBedrooms}, bathrooms=${finalBathrooms}, area=${finalArea}`);
      
      // Procesar imágenes: asegurarse de que cada imagen tenga src y alt
      const processedImages = product.images 
        ? product.images.map(img => {
            const imgSrc = img.src || (typeof img === 'string' ? img : '');
            return {
              src: imgSrc,
              alt: img.alt || img.name || product.name || 'Imagen de propiedad'
            };
          }).filter(img => img.src) // Filtrar imágenes sin src
        : [];
      
      console.log(`[DEBUG] Procesadas ${processedImages.length} imágenes para ID ${product.id}`);
      
      return {
        id: productId,
        title: finalTitle,
        name: fullProductName,
        description: description,
        price: parseFloat(product.price),
        currency: '€',
        address: finalAddress,
        bedrooms: finalBedrooms,
        bathrooms: finalBathrooms,
        area: finalArea,
        size: finalArea,
        images: processedImages,
        features: [],
        categories: product.categories ? product.categories.map(cat => cat.name) : [],
        source: 'woocommerce',
        createdAt: product.date_created,
        updatedAt: product.date_modified
      };
    });
    
    console.log(`Procesadas ${wpData.length} propiedades de WooCommerce`);
  } catch (wpError) {
    console.error("Error al obtener propiedades de WooCommerce:", wpError);
  }
  
  // 2. También intentamos obtener propiedades desde la API combinada (/api/properties)
  try {
    console.log('[DEBUG getPropertyPosts] Iniciando solicitud a la API de propiedades combinada');
    
    // Intentar usar el nuevo endpoint /api/properties que combina MongoDB y WooCommerce
    let apiUrl = '';
    
    // Determinar la URL base correcta según el entorno
    if (typeof window !== 'undefined') {
      // En el navegador, usar la URL base desde la configuración
      apiUrl = window.location.origin + '/api/properties';
      console.log('[DEBUG getPropertyPosts] Usando URL del navegador:', apiUrl);
    } else {
      // En el servidor, usar la URL relativa
      apiUrl = '/api/properties';
      console.log('[DEBUG getPropertyPosts] Usando URL relativa en el servidor:', apiUrl);
    }
    
    console.log('[DEBUG getPropertyPosts] URL final para API combinada:', apiUrl);
    
    // Realizar la petición a la API combinada
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 segundos
    
    const response = await fetch(apiUrl, {
      signal: controller.signal,
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
      }
    }).finally(() => clearTimeout(timeoutId));
    
    if (!response.ok) {
      console.error(`Error al obtener propiedades de la API combinada: ${response.status} ${response.statusText}`);
      throw new Error(`Error de API: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('[DEBUG getPropertyPosts] Respuesta de API combinada:', result);
    
    if (result.success && result.properties) {
      // Extraer las propiedades de MongoDB
      const apiMongoDBProperties = result.properties.filter(p => p.type === 'mongodb');
      console.log(`[DEBUG getPropertyPosts] Propiedades MongoDB desde API combinada: ${apiMongoDBProperties.length}`);
      
      if (apiMongoDBProperties.length > 0) {
        mongoData = apiMongoDBProperties.map(p => ({
          ...p,
          id: p.id,
          source: 'mongodb'
        }));
      }
    } else {
      console.error('[DEBUG getPropertyPosts] La API combinada no devolvió datos válidos');
    }
  } catch (apiError) {
    console.error('[DEBUG getPropertyPosts] Error al obtener datos de la API combinada:', apiError);
    
    // 3. Si falla la API combinada, intentar obtener datos directamente de MongoDB
    try {
      console.log('[DEBUG getPropertyPosts] Intentando obtener propiedades directamente desde MongoDB');
      
      let mongoUrl = '';
      if (typeof window !== 'undefined') {
        // En el navegador
        mongoUrl = window.location.origin + '/api/proxy?service=mongodb&resource=property';
      } else {
        // En el servidor
        mongoUrl = '/api/proxy?service=mongodb&resource=property';
      }
      
      console.log('[DEBUG getPropertyPosts] URL para MongoDB:', mongoUrl);
      
      const mongoResponse = await fetch(mongoUrl, {
        headers: {
          'Cache-Control': 'no-cache',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (compatible; GozaMadridBot/1.0)'
        }
      });
      
      if (!mongoResponse.ok) {
        console.error(`Error al obtener propiedades de MongoDB: ${mongoResponse.status} ${mongoResponse.statusText}`);
        throw new Error(`Error de MongoDB: ${mongoResponse.status}`);
      }
      
      const mongoResult = await mongoResponse.json();
      console.log('[DEBUG getPropertyPosts] Datos de MongoDB recibidos:', 
                 Array.isArray(mongoResult) ? `${mongoResult.length} propiedades` : 'Respuesta no es un array');
      
      if (Array.isArray(mongoResult) && mongoResult.length > 0) {
        mongoData = mongoResult.map(property => ({
          id: property._id,
          title: property.title || "Propiedad sin título",
          name: property.title || "Propiedad sin título",
          description: property.description || "",
          price: parseFloat(property.price) || 0,
          currency: '€',
          address: property.location || "Madrid",
          bedrooms: parseInt(property.bedrooms) || 0,
          bathrooms: parseInt(property.bathrooms) || 0,
          area: parseInt(property.area || property.m2 || property.size) || 0,
          size: parseInt(property.area || property.m2 || property.size) || 0,
          images: Array.isArray(property.images) 
            ? property.images.map(img => {
                if (typeof img === 'string') {
                  return { src: img, alt: 'Imagen de propiedad' };
                } else if (img && img.src) {
                  return { src: img.src, alt: img.alt || 'Imagen de propiedad' };
                }
                return null;
              }).filter(Boolean)
            : [],
          features: property.features || [],
          categories: Array.isArray(property.tags) ? property.tags : [property.propertyType || "Venta"],
          source: 'mongodb',
          createdAt: property.createdAt || new Date().toISOString(),
          updatedAt: property.updatedAt || new Date().toISOString()
        }));
      }
      
      console.log(`[DEBUG getPropertyPosts] Procesadas ${mongoData.length} propiedades de MongoDB`);
    } catch (mongoError) {
      console.error('[DEBUG getPropertyPosts] Error al obtener directamente desde MongoDB:', mongoError);
    }
  }
  
  // Mostrar información sobre los resultados obtenidos
  console.log(`Obtenidas ${mongoData.length} propiedades de MongoDB desde API combinada`);
  console.log(`Total de propiedades combinadas: ${wpData.length + mongoData.length}`);
  console.log(`Propiedades de WooCommerce: ${wpData.length}`);
  console.log(`Propiedades de MongoDB: ${mongoData.length}`);
  
  // Devolver todas las propiedades combinadas (MongoDB primero para mejor visibilidad)
  const combinedData = [...mongoData, ...wpData];
  
  return Array.isArray(combinedData) ? combinedData : (
    console.error("getPropertyPosts: combinedData no es un array", combinedData),
    []
  );
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
    // Usar la configuración global de la aplicación si estamos en el navegador
    const API_URL = typeof window !== 'undefined' && window.appConfig 
      ? window.appConfig.apiUrl 
      : (process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-env.eba-dwhnvgbt.eu-west-3.elasticbeanstalk.com');
    
    console.log('[DEBUG] Enviando formulario de contacto a:', `${API_URL}/api/contact`);
    
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
    
    // Definir el endpoint para el contacto - usar nuestro propio backend
    const endpoint = `${API_URL}/api/contact`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://realestategozamadrid.com'
      },
      body: JSON.stringify(formattedData),
    });
    
    // Verificar el tipo de contenido antes de intentar analizar como JSON
    const contentType = response.headers.get('content-type');
    console.log('[DEBUG] Respuesta recibida:', response.status, contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      // Agregar la propiedad ok para compatibilidad con el código existente
      responseData.ok = response.ok;
      return responseData;
    } else {
      // Si no es JSON, manejar como texto
      const text = await response.text();
      console.error('Respuesta no JSON:', text);
      return {
        success: false,
        message: 'El servidor no respondió con un formato JSON válido',
        error: text,
        ok: false
      };
    }
  } catch (error) {
    console.error("Error al enviar formulario:", error);
    // Devolver un objeto con formato similar al de respuesta exitosa
    return {
      success: false,
      message: 'Error de conexión: ' + error.message,
      error: error.message,
      ok: false
    };
  }
};

export const sendPropertyEmail = async (data) => {
  try {
    // Usar la configuración global de la aplicación si estamos en el navegador
    const API_URL = typeof window !== 'undefined' && window.appConfig 
      ? window.appConfig.apiUrl 
      : (process.env.NEXT_PUBLIC_API_URL || 'https://gozamadrid-env.eba-dwhnvgbt.eu-west-3.elasticbeanstalk.com');
    
    console.log('[DEBUG] Enviando solicitud de visita a propiedad a:', `${API_URL}/api/property-visit/create/`);
    
    // Validación local actualizada para campos
    if (!data.name || !data.email || !data.phone) {
      console.error("Faltan datos obligatorios para visita de propiedad:", data);
      return {
        success: false,
        message: 'Faltan datos requeridos: nombre, email y teléfono son obligatorios',
        error: 'Validación local',
        ok: false
      };
    }
    
    // Definir el endpoint para la visita de propiedad
    const endpoint = `${API_URL}/api/property-visit/create/`;
    
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': typeof window !== 'undefined' ? window.location.origin : 'https://realestategozamadrid.com'
      },
      body: JSON.stringify(data),
    });
    
    // Verificar el tipo de contenido antes de intentar analizar como JSON
    const contentType = response.headers.get('content-type');
    console.log('[DEBUG] Respuesta recibida:', response.status, contentType);
    
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
      // Agregar la propiedad ok para compatibilidad con el código existente
      responseData.ok = response.ok;
      return responseData;
    } else {
      // Si no es JSON, manejar como texto
      const text = await response.text();
      console.error('Respuesta no JSON:', text);
      return {
        success: false,
        message: 'El servidor no respondió con un formato JSON válido',
        error: text,
        ok: false
      };
    }
  } catch (error) {
    console.error("Error al enviar solicitud de visita:", error);
    // Devolver un objeto con formato similar al de respuesta exitosa
    return {
      success: false,
      message: 'Error de conexión: ' + error.message,
      error: error.message,
      ok: false
    };
  }
};

import axios from 'axios';

// Obtener URL base desde la configuración del cliente
const getBaseUrl = () => 
  typeof window !== 'undefined' && window.appConfig && window.appConfig.apiUrl
    ? window.appConfig.apiUrl
    : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

// Configurar axios con opciones globales
const api = axios.create({
  timeout: 30000, // 30 segundos
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
});

// Función para obtener todas las propiedades
// Esta función combina propiedades de WooCommerce y MongoDB
export const getProperties = async (page = 1, limit = 12, filters = {}) => {
  try {
    console.log("getProperties: Solicitando propiedades a", getBaseUrl());
    
    // Construir parámetros de consulta
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    // Realizar la solicitud al endpoint de propiedades
    const response = await api.get(`${getBaseUrl()}?${params.toString()}`);
    
    console.log(`getProperties: Recibidas ${response.data.properties?.length || 0} propiedades`);
    console.log('getProperties: Desglose por tipo:', {
      woocommerce: response.data.properties?.filter(p => p.type === 'woocommerce').length || 0,
      mongodb: response.data.properties?.filter(p => p.type === 'mongodb').length || 0
    });
    
    return {
      properties: response.data.properties || [],
      total: response.data.total || 0,
      totalPages: response.data.totalPages || 0,
      page: response.data.page || 1
    };
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    return {
      properties: [],
      total: 0,
      totalPages: 0,
      page: 1
    };
  }
};

// Función para buscar propiedades por término
export const searchProperties = async (term, page = 1, limit = 12) => {
  try {
    if (!term) {
      return getProperties(page, limit);
    }
    
    console.log(`searchProperties: Buscando "${term}"`);
    
    const params = new URLSearchParams({
      search: term,
      page,
      limit
    });
    
    const response = await api.get(`${getBaseUrl()}/search?${params.toString()}`);
    
    console.log(`searchProperties: Encontradas ${response.data.properties?.length || 0} propiedades`);
    
    return {
      properties: response.data.properties || [],
      total: response.data.total || 0,
      totalPages: response.data.totalPages || 0,
      page: response.data.page || 1
    };
  } catch (error) {
    console.error('Error al buscar propiedades:', error);
    return {
      properties: [],
      total: 0,
      totalPages: 0,
      page: 1
    };
  }
};

// Función para filtrar propiedades
export const filterProperties = async (filters = {}, page = 1, limit = 12) => {
  try {
    console.log('filterProperties: Aplicando filtros', filters);
    
    // Construir parámetros de consulta con los filtros
    const params = new URLSearchParams({
      page,
      limit,
      ...filters
    });
    
    const response = await api.get(`${getBaseUrl()}/filter?${params.toString()}`);
    
    console.log(`filterProperties: Encontradas ${response.data.properties?.length || 0} propiedades`);
    
    return {
      properties: response.data.properties || [],
      total: response.data.total || 0,
      totalPages: response.data.totalPages || 0,
      page: response.data.page || 1
    };
  } catch (error) {
    console.error('Error al filtrar propiedades:', error);
    return {
      properties: [],
      total: 0,
      totalPages: 0,
      page: 1
    };
  }
};

// Función para enviar contacto
export const sendContact = async (contactData) => {
  try {
    console.log('sendContact: Enviando datos de contacto');
    
    // Usar URL base diferente para el contacto si está configurada
    const baseUrl = 
      typeof window !== 'undefined' && window.appConfig && window.appConfig.apiUrl
        ? window.appConfig.apiUrl
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    const response = await api.post(`${baseUrl}/contact`, contactData);
    
    console.log('sendContact: Respuesta recibida', response.data);
    
    return {
      success: true,
      message: response.data.message || 'Contacto enviado correctamente'
    };
  } catch (error) {
    console.error('Error al enviar contacto:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al enviar el contacto'
    };
  }
};

// Función para enviar solicitud de visita
export const sendVisitRequest = async (visitData) => {
  try {
    console.log('sendVisitRequest: Enviando solicitud de visita');
    
    // Usar URL base diferente para la solicitud de visita si está configurada
    const baseUrl = 
      typeof window !== 'undefined' && window.appConfig && window.appConfig.apiUrl
        ? window.appConfig.apiUrl
        : process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';
    
    const response = await api.post(`${baseUrl}/property-visit/create`, visitData);
    
    console.log('sendVisitRequest: Respuesta recibida', response.data);
    
    return {
      success: true,
      message: response.data.message || 'Solicitud de visita enviada correctamente'
    };
  } catch (error) {
    console.error('Error al enviar solicitud de visita:', error);
    return {
      success: false,
      message: error.response?.data?.message || 'Error al enviar la solicitud de visita'
    };
  }
};

export default {
  getProperties,
  getPropertyById,
  searchProperties,
  filterProperties,
  sendContact,
  sendVisitRequest
}; 