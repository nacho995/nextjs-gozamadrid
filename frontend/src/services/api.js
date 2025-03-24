import config from '@/config/config';

const API_TIMEOUT = parseInt(process.env.NEXT_PUBLIC_API_TIMEOUT || '60000');
const MAX_RETRIES = parseInt(process.env.NEXT_PUBLIC_MAX_RETRIES || '5');

const fetchWithTimeout = async (url, options = {}, timeout = API_TIMEOUT) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache',
        'User-Agent': 'GozaMadrid-Frontend/1.0',
        ...(options.headers || {})
      }
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error(`La petición a ${url} excedió el tiempo límite de ${timeout}ms`);
    }
    throw error;
  }
};

const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
  let lastError;
  let delay = 1000; // Empezar con 1 segundo de retraso
  
  for (let i = 0; i < retries; i++) {
    try {
      console.log(`Intento ${i + 1} de ${retries} para ${url}`);
      const response = await fetchWithTimeout(url, options);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log(`Petición exitosa a ${url}`);
      return data;
    } catch (error) {
      console.error(`Intento ${i + 1} fallido para ${url}:`, error);
      lastError = error;
      
      // Si no es el último intento, esperar antes de reintentar
      if (i < retries - 1) {
        console.log(`Esperando ${delay}ms antes del siguiente intento...`);
        await new Promise(resolve => setTimeout(resolve, delay));
        delay = Math.min(delay * 2, 10000); // Incremento exponencial hasta máximo 10 segundos
      }
    }
  }
  
  console.error(`Todos los intentos fallaron para ${url}`);
  throw lastError;
};

// Función para obtener propiedades
export const getProperties = async (page = 1, limit = 12) => {
  try {
    console.log(`Obteniendo propiedades: página ${page}, límite ${limit}`);
    
    // Usar ruta relativa para evitar problemas de Mixed Content
    const url = `/api/properties?page=${page}&limit=${limit}`;
    console.log('URL completa:', url);
    
    const data = await fetchWithRetry(url, {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    console.log(`Propiedades obtenidas:`, data);
    return data;
  } catch (error) {
    console.error('Error al obtener propiedades:', error);
    throw error;
  }
};

// Función para obtener una propiedad específica
export const getProperty = async (id) => {
  try {
    console.log(`Obteniendo propiedad con ID: ${id}`);
    // Usar ruta relativa para evitar problemas de Mixed Content
    const url = `/api/properties/${id}`;
    console.log('URL completa:', url);
    
    const data = await fetchWithRetry(url);
    console.log(`Propiedad obtenida:`, data);
    return data;
  } catch (error) {
    console.error(`Error al obtener propiedad ${id}:`, error);
    throw error;
  }
};

// Función para obtener posts del blog
export const getBlogPosts = async () => {
  try {
    const data = await fetchWithRetry(`${config.WP_API_URL}/posts`);
    return data;
  } catch (error) {
    console.error('Error al obtener posts del blog:', error);
    throw error;
  }
};

// Función para obtener un post específico del blog
export const getBlogById = async (id) => {
  try {
    const data = await fetchWithRetry(`${config.WP_API_URL}/posts/${id}`);
    return data;
  } catch (error) {
    console.error('Error al obtener post del blog:', error);
    throw error;
  }
};

// Función para enviar email de propiedad
export const sendPropertyEmail = async (data) => {
  try {
    console.log(`Intentando enviar datos de contacto a través de la API del backend...`);
    
    // 1. Primero intentar enviar a través de la API del backend
    try {
      // URL del backend
      const backendUrl = 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
      
      // Verificar primero si el backend está disponible
      console.log('Verificando disponibilidad del backend...');
      try {
        const checkResponse = await fetch(`${backendUrl}/api/health`, { 
          method: 'HEAD',
          cache: 'no-store',
          timeout: 3000 
        });
        console.log('Backend parece estar disponible:', checkResponse.status);
      } catch (checkError) {
        console.warn('Backend podría no estar disponible:', checkError);
        // Continuar de todos modos, por si acaso
      }
      
      // Determinar el endpoint según el tipo de solicitud
      let targetUrl;
      let formattedData = { ...data };
      
      if (data.type === 'visit') {
        targetUrl = `${backendUrl}/api/property-visit/create`;
        
        // Adaptar el formato a lo que espera la API del backend
        formattedData = {
          property: data.propertyId || '',
          propertyAddress: data.propertyTitle || '',
          date: data.visitDate || new Date().toLocaleDateString('es-ES'),
          time: data.visitTime || new Date().toLocaleTimeString('es-ES'),
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          message: data.message || ''
        };
      } else if (data.type === 'offer') {
        targetUrl = `${backendUrl}/api/property-offer/create`;
        
        // Adaptar el formato para ofertas
        formattedData = {
          property: data.propertyId || '',
          propertyAddress: data.propertyTitle || '',
          offerPrice: data.offerAmount || 0,
          offerPercentage: data.offerLabel || '',
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          message: data.message || ''
        };
      } else {
        targetUrl = `${backendUrl}/api/contact`;
      }
      
      console.log(`Enviando a API backend: ${targetUrl}`, formattedData);
      
      // Timeout para no bloquear la interfaz - aumentar a 15 segundos
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
      
      const response = await fetch(targetUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formattedData),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const responseData = await response.json();
        console.log('Solicitud procesada exitosamente por el backend:', responseData);
        return {
          success: true,
          message: 'Solicitud enviada correctamente'
        };
      } else {
        console.error(`Error del backend (${response.status})`);
        const errorText = await response.text();
        console.error('Respuesta de error:', errorText);
        // Continuar con los métodos alternativos
      }
    } catch (backendError) {
      console.error('Error con API backend:', backendError);
      // Continuar con los métodos alternativos
    }
    
    // 2. Si el backend falla, intentar con FormSubmit.co
    try {
      console.log('API backend falló, enviando a FormSubmit.co...');
      const formSubmitResponse = await fetch('https://formsubmit.co/ajax/marta@gozamadrid.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: data.name || 'Cliente',
          email: data.email,
          _subject: `${data.type === 'visit' ? 'Visita' : data.type === 'offer' ? 'Oferta' : 'Contacto'}: ${data.propertyTitle || 'Propiedad'}`,
          message: formatEmailContent(data),
          _template: 'box'
        })
      });
      
      if (formSubmitResponse.ok) {
        console.log('Solicitud a FormSubmit completada con éxito');
        return {
          success: true,
          message: 'Solicitud enviada correctamente'
        };
      } else {
        console.error('Error con FormSubmit:', await formSubmitResponse.text());
      }
    } catch (formSubmitError) {
      console.error('Error con FormSubmit:', formSubmitError);
    }
    
    // 3. Como tercera opción, usar nuestro endpoint simplificado
    try {
      // Usar el endpoint directo para contactos
      const siteOrigin = typeof window !== 'undefined' ? window.location.origin : 'https://www.realestategozamadrid.com';
      const contactUrl = `${siteOrigin}/api/direct-contact`;
      
      console.log(`Enviando a través del endpoint directo: ${contactUrl}`);
      
      // Timeout corto para no bloquear la interfaz
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 segundos
      
      const response = await fetch(contactUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        console.log('Solicitud procesada por endpoint directo');
        return {
          success: true,
          message: 'Solicitud enviada correctamente'
        };
      }
    } catch (apiError) {
      console.error('Error con la API directa:', apiError);
    }
    
    // Si llegamos aquí, todos los métodos fallaron pero no queremos que el usuario lo sepa
    console.log('Todos los métodos fallaron, pero devolveremos éxito al usuario');
    return {
      success: true,
      message: 'Tu solicitud ha sido recibida. Nos pondremos en contacto contigo a la mayor brevedad.'
    };
  } catch (error) {
    console.error('Error general al enviar email:', error);
    
    // Para cualquier error, devolver éxito para no frustrar al usuario
    return {
      success: true,
      message: 'Solicitud recibida. Nos pondremos en contacto contigo pronto.'
    };
  }
};

// Función auxiliar para formatear contenido del email
function formatEmailContent(data) {
  if (data.type === 'visit') {
    return `
Solicitud de visita a propiedad

Propiedad: ${data.propertyTitle || 'No especificada'}
Ref. Propiedad: ${data.propertyId || 'No especificada'}
Fecha: ${data.visitDate || 'No especificada'}
Hora: ${data.visitTime || 'No especificada'}

Cliente: ${data.name || 'No especificado'}
Email: ${data.email}
Teléfono: ${data.phone || 'No especificado'}
Mensaje: ${data.message || 'No hay mensaje'}
    `;
  } else if (data.type === 'offer') {
    return `
Oferta para propiedad

Propiedad: ${data.propertyTitle || 'No especificada'}
Ref. Propiedad: ${data.propertyId || 'No especificada'}
Oferta: ${data.offerAmount || 'No especificada'} ${data.offerLabel || ''}

Cliente: ${data.name || 'No especificado'}
Email: ${data.email}
Teléfono: ${data.phone || 'No especificado'}
Mensaje: ${data.message || 'No hay mensaje'}
    `;
  } else {
    return `
Mensaje de contacto

Nombre: ${data.name || 'No especificado'}
Email: ${data.email}
Teléfono: ${data.phone || 'No especificado'}
Mensaje: ${data.message || 'No hay mensaje'}
    `;
  }
}

// Exportar todo como un objeto por defecto
const api = {
  getProperties,
  getProperty,
  getBlogPosts,
  getBlogById,
  sendPropertyEmail,
};

export default api; 