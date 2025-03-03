const API_URL = process.env.NEXT_LOCAL_API_URL || 'http://localhost:4000';

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

// Función auxiliar para proporcionar prefijos de país por defecto
function getDefaultCountryPrefixes() {
  return [
    { code: "ES", name: "España", prefix: "+34" },
    { code: "US", name: "Estados Unidos", prefix: "+1" },
    { code: "UK", name: "Reino Unido", prefix: "+44" },
    { code: "MX", name: "México", prefix: "+52" },
    { code: "AR", name: "Argentina", prefix: "+54" },
    { code: "CO", name: "Colombia", prefix: "+57" },
    { code: "PE", name: "Perú", prefix: "+51" },
    { code: "CL", name: "Chile", prefix: "+56" },
    { code: "FR", name: "Francia", prefix: "+33" },
    { code: "DE", name: "Alemania", prefix: "+49" },
    { code: "IT", name: "Italia", prefix: "+39" },
    { code: "PT", name: "Portugal", prefix: "+351" },
    { code: "BR", name: "Brasil", prefix: "+55" }
  ];
}

// src/pages/api/index.js
export async function getBlogPosts() {
  try {
    // Primero intentar con WordPress
    console.log("Intentando obtener blogs desde WordPress...");
    const wpResponse = await fetch(
      "https://realestategozamadrid.com/wp-json/wp/v2/posts?_embed"
    );
    
    if (wpResponse.ok) {
      const contentType = wpResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const blogData = await wpResponse.json();
        console.log("Blogs obtenidos de WordPress:", blogData.length);
        return blogData;
      }
    }
    
    // Si WordPress falla, intentar con la API local
    console.log("WordPress falló o sin datos, intentando con API local...");
    const response = await fetch(`${API_URL}/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (response.ok) {
      const localBlogData = await response.json();
      console.log("Blogs obtenidos de API local:", localBlogData.length);
      return localBlogData;
    }
    
    // Si ambas fallan, devolver array vacío
    return [];
    
  } catch (error) {
    console.error("Error al obtener blogs:", error.message);
    return [];
  }
}



export async function deleteBlogPost(id) {
  const response = await fetch(`${API_URL}/blog/${id}`, {
    method: 'DELETE',
  });

  return response.json();
}

export const getBlogById = async (id) => {
  console.log("Llamando a getBlogById con ID:", id);
  
  try {
    // Verificar que el ID sea válido
    if (!id) {
      console.error("ID de blog no proporcionado");
      return null;
    }
    
    // Convertir a string si es necesario
    const blogId = String(id);
    
    // Obtener todos los blogs primero
    const allBlogs = await getBlogPosts();
    
    if (!Array.isArray(allBlogs)) {
      console.error("No se pudieron obtener los blogs");
      return null;
    }
    
    // Buscar el blog por ID o _id (podría ser cualquiera de los dos)
    const foundBlog = allBlogs.find(blog => 
      (blog.id && blog.id.toString() === blogId) || 
      (blog._id && blog._id.toString() === blogId)
    );
    
    if (!foundBlog) {
      console.log(`No se encontró ningún blog con ID: ${id}`);
      return null;
    }
    
    console.log(`Blog encontrado con ID ${id}:`, foundBlog.title);
    return foundBlog;
  } catch (error) {
    console.error("Error en getBlogById:", error);
    return null;
  }
};

export async function getPropertyPosts() {
  const response = await fetch(`${API_URL}/property`);

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(errorData.message || 'Error al obtener los property posts')
  }

  return response.json()
}
export async function getPropertyById(id) {
  try {
    console.log(`Intentando obtener la propiedad #${id}`);
    
    // Evitar solicitudes duplicadas con una bandera
    let isFetching = false;
    
    // Intentar obtener de WooCommerce si es un ID numérico
    const isWooCommerceId = !isNaN(parseInt(id)) && String(parseInt(id)) === id;
    
    if (isWooCommerceId && !isFetching) {
      try {
        isFetching = true; // Evita múltiples solicitudes
        
        // Agregar timeout para evitar bloqueos
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos
        
        const response = await fetch(
          `https://realestategozamadrid.com/wp-json/wc/v3/products/${id}?consumer_key=ck_3efe242c61866209c650716bed69999cbf00a09c&consumer_secret=cs_d9a74b0a40175d14515e4f7663c126b82b09aa2d`,
          { signal: controller.signal }
        );
        
        clearTimeout(timeoutId);
        isFetching = false;
        
        if (!response.ok) {
          throw new Error(`Error al obtener propiedad: ${response.status}`);
        }
        
        const wcData = await response.json();
        console.log("--- DATOS DE WOOCOMMERCE ---");
        console.log("Images en respuesta original:", wcData.images);
        if (wcData.images && wcData.images.length > 0) {
          console.log("Primera imagen estructura:", wcData.images[0]);
          console.log("URL de primera imagen:", wcData.images[0].src);
        }
        
        // Limpiar la descripción de elementos no deseados
        let cleanDescription = wcData.description || "";
        
        // Eliminar shortcodes de Visual Composer/WPBakery
        cleanDescription = cleanDescription.replace(/\[\/?vc_[^\]]*\]/g, "");
        cleanDescription = cleanDescription.replace(/\[\/?(fusion|vc)_[^\]]*\]/g, "");
        
        // Eliminar cualquier shortcode entre corchetes [] que pueda quedar
        cleanDescription = cleanDescription.replace(/\[[^\]]*\]/g, "");
        
        // Eliminar los botones "Mostrar más/Mostrar menos" que aparecen como texto
        cleanDescription = cleanDescription.replace(/Mostrar más|Mostrar menos/gi, "");
        cleanDescription = cleanDescription.replace(/Mostrar másMostrar menos/gi, "");
        
        // Eliminar también los botones con elementos HTML
        cleanDescription = cleanDescription.replace(/<button[^>]*>(Mostrar más|Mostrar menos)<\/button>/gi, "");
        cleanDescription = cleanDescription.replace(/<a[^>]*class="[^"]*mostrarmas[^"]*"[^>]*>.*?<\/a>/gi, "");
        cleanDescription = cleanDescription.replace(/<a[^>]*class="[^"]*mostrarmenos[^"]*"[^>]*>.*?<\/a>/gi, "");
        
        // Eliminar toda la sección de Ubicación completa (desde el h2 hasta el siguiente h2 o hasta el final)
        cleanDescription = cleanDescription.replace(/<h2[^>]*>Ubicación<\/h2>[\s\S]*?(?=<h2|$)/gi, "");
        
        // Eliminar específicamente la sección que usa el nombre en español
        cleanDescription = cleanDescription.replace(/<h2[^>]*>\s*Ubicación\s*<\/h2>[\s\S]*?(?=<h2|<div class="elementor|$)/gi, "");
        
        // Eliminar iframes de Google Maps más específicamente
        cleanDescription = cleanDescription.replace(/<iframe[^>]*google\.com\/maps[^>]*>[\s\S]*?<\/iframe>/gi, "");
        
        // Eliminar divs con clase "ubicacion"
        cleanDescription = cleanDescription.replace(/<div[^>]*class="[^"]*ubicacion[^"]*"[^>]*>[\s\S]*?<\/div>/gi, "");
        
        // Eliminar secciones completas que contengan mapas o ubicación
        cleanDescription = cleanDescription.replace(/<section[^>]*class="[^"]*mapa[^"]*"[^>]*>[\s\S]*?<\/section>/gi, "");
        
        // Limpiar divs vacíos y espacios en blanco excesivos
        cleanDescription = cleanDescription.replace(/<div[^>]*>\s*<\/div>/g, "");
        cleanDescription = cleanDescription.replace(/\s{2,}/g, " ");
        
        // Procesar datos para la aplicación
        const property = {
          id: wcData.id,
          title: wcData.name,
          description: cleanDescription, // Usamos la descripción limpia
          address: wcData.short_description?.replace(/<\/?[^>]+(>|$)/g, "") || "Madrid, España",
          price: wcData.price ? `${parseInt(wcData.price).toLocaleString()}€` : "Consultar precio",
          images: wcData.images || [],
          bedrooms: "2",
          bathrooms: "1",
          area: "80",
          typeProperty: wcData.categories?.[0]?.name || "Propiedad",
          _originalData: wcData
        };
        
        // Convertir la URL original en una URL de proxy
        const proxiedImages = property.images.map(img => {
          const proxiedSrc = `/api/image-proxy?url=${encodeURIComponent(img.src)}`;
          
          return {
            src: proxiedSrc,
            alt: img.name || property.title || "Imagen de propiedad",
            originalSrc: img.src
          };
        });
        
        return {
          ...property,
          images: proxiedImages
        };
      } catch (error) {
        console.error("Error en solicitud a WooCommerce:", error.message);
        isFetching = false;
      }
    }
    
    // Respuesta por defecto si falla todo
    return {
      id: id || "error",
      title: "Error de carga",
      description: "No se pudo cargar la información de esta propiedad.",
      address: "Madrid, España",
      price: "Consultar precio",
      images: [{ src: "/fondoamarillo.jpg", alt: "Imagen no disponible" }],
      bedrooms: "2",
      bathrooms: "1",
      area: "80",
      typeProperty: "Propiedad",
      error: true
    };
  } catch (error) {
    console.error("Error general:", error);
    return {
      id: "error",
      title: "Error de sistema",
      description: "Error interno del servidor",
      images: [{ src: "/fondoamarillo.jpg", alt: "Error" }],
      error: true
    };
  }
}

export async function sendEmail(emailData) {
  try {
      const response = await fetch(`${API_URL}/api/contact`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
          },
          body: JSON.stringify({
              type: 'contact',
              data: emailData
          })
      });

      const data = await response.json();

      if (!response.ok) {
          throw new Error(data.message || 'Error en la respuesta del servidor');
      }

      return data;
  } catch (error) {
      console.error('Error al enviar email:', error);
      throw new Error(error.message || 'Error al enviar el mensaje');
  }
}

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