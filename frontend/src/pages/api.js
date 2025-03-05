const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

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
  
  // 1. Intentar obtener blogs de WordPress
  try {
    const wpResponse = await fetch(
      "https://realestategozamadrid.com/wp-json/wp/v2/posts?_embed"
    );
    
    if (wpResponse.ok) {
      const wpBlogs = await wpResponse.json();
      
      // Añadir los blogs de WordPress al array, con la fuente marcada
      wpBlogs.forEach(blog => {
        allBlogs.push({
          ...blog,
          source: 'wordpress'  // Marcar el origen
        });
      });
    }
  } catch (error) {
    console.log("Error con WordPress:", error.message);
  }
  
  // 2. Intentar obtener blogs de MongoDB (siempre, no importa si WordPress funcionó)
  try {
    const mongoResponse = await fetch(`${API_URL}/blog`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    if (mongoResponse.ok) {
      const mongoBlogs = await mongoResponse.json();
      
      // Añadir los blogs de MongoDB al array, con la fuente marcada
      mongoBlogs.forEach(blog => {
        allBlogs.push({
          ...blog,
          source: 'mongodb'  // Marcar el origen
        });
      });
    }
  } catch (error) {
    console.log("Error con MongoDB:", error.message);
  }
  
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
    const apiUrl = process.env.NEXT_LOCAL_API_URL || 'http://localhost:4000';
    console.log(`Obteniendo blog con ID ${id} desde ${apiUrl}/blog/${id}`);
    
    // Usar fetch directamente sin ninguna transformación
    const response = await fetch(`${apiUrl}/blog/${id}`);
    
    if (!response.ok) {
      throw new Error(`Error al obtener blog: ${response.status}`);
    }
    
    // Obtener datos RAW y mostrarlos en consola tal cual vienen
    const data = await response.json();
    console.log("Datos crudos recibidos del API:", data);
    console.log("Campos disponibles:", Object.keys(data));
    console.log("¿Tiene content?", data.hasOwnProperty('content'));
    console.log("Tipo de content:", typeof data.content);
    
    // NO transformar los datos, devolverlos tal cual
    return data;
  } catch (error) {
    console.error("Error obteniendo blog por ID:", error);
    throw error;
  }
}

export async function getPropertyPosts() {
  let wpData = [];
  let localData = [];
  
  // Intentar obtener propiedades de WordPress
  try {
    // Primero, obtener la primera página para saber cuántas páginas hay en total
    const firstPageResponse = await fetch(
      `https://realestategozamadrid.com/wp-json/wc/v3/products?consumer_key=ck_3efe242c61866209c650716bed69999cbf00a09c&consumer_secret=cs_d9a74b0a40175d14515e4f7663c126b82b09aa2d&per_page=100`
    );
    
    if (!firstPageResponse.ok) {
      throw new Error(`Error al obtener propiedades: ${firstPageResponse.status}`);
    }
    
    // Obtener el número total de páginas
    const totalPages = parseInt(firstPageResponse.headers.get('X-WP-TotalPages') || '1');
    
    // Obtener los datos de la primera página
    const firstPageData = await firstPageResponse.json();
    wpData = [...firstPageData];
    
    // Si hay más de una página, obtener el resto
    if (totalPages > 1) {
      // Crear un array de promesas para obtener todas las páginas restantes
      const pagePromises = [];
      
      for (let page = 2; page <= totalPages; page++) {
        pagePromises.push(
          fetch(`https://realestategozamadrid.com/wp-json/wc/v3/products?consumer_key=ck_3efe242c61866209c650716bed69999cbf00a09c&consumer_secret=cs_d9a74b0a40175d14515e4f7663c126b82b09aa2d&per_page=100&page=${page}`)
            .then(response => {
              if (!response.ok) {
                throw new Error(`Error al obtener página ${page}: ${response.status}`);
              }
              return response.json();
            })
        );
      }
      
      // Esperar a que todas las promesas se resuelvan
      const pagesData = await Promise.all(pagePromises);
      
      // Combinar todos los datos
      pagesData.forEach(pageData => {
        wpData = [...wpData, ...pageData];
      });
    }
    
  } catch (error) {
    console.error("Error al obtener propiedades de WordPress:", error);
  }
  
  // Intentar obtener propiedades de la API local
  try {
    const localResponse = await fetch(`${API_URL}/property`);
    
    if (localResponse.ok) {
      const contentType = localResponse.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        localData = await localResponse.json();
      } else {
        console.error("La respuesta no es JSON válido:", await localResponse.text());
      }
    } else {
      console.error(`Error al obtener propiedades locales: ${localResponse.status}`);
    }
  } catch (localError) {
    console.error("Error al obtener propiedades de API local:", localError);
  }
  
  // Combinar los resultados de ambas fuentes
  const combinedData = [...wpData, ...localData];
  
  return combinedData;
}

export async function getPropertyById(id) {
  try {
    
    
    const isMongoId = id && id.length === 24 && /^[0-9a-fA-F]{24}$/.test(id);
    
    if (isMongoId) {
      // Es un ID de MongoDB, obtener de la API local
      const response = await fetch(`${API_URL}/property/${id}`);
      
      if (!response.ok) {
        throw new Error(`Error al obtener propiedad de MongoDB: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    } else {
      // Es un ID de WordPress, obtener de la API de WordPress
      const response = await fetch(
        `https://realestategozamadrid.com/wp-json/wc/v3/products/${id}?consumer_key=ck_3efe242c61866209c650716bed69999cbf00a09c&consumer_secret=cs_d9a74b0a40175d14515e4f7663c126b82b09aa2d`
      );
      
      if (!response.ok) {
        throw new Error(`Error al obtener propiedad de WordPress: ${response.status}`);
      }
      
      const data = await response.json();
      
      return data;
    }
  } catch (error) {
    console.error("Error en getPropertyById:", error);
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
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';
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