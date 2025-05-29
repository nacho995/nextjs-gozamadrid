// Proxy para evitar problemas de mixed content (HTTPS a HTTP)
export default async function handler(req, res) {
  // Permitir CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, X-Requested-With');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir GET y POST
  if (req.method !== 'GET' && req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  try {
    // URL base del API backend
    const API_URL = 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    
    // Extraer la ruta y los parámetros de la solicitud
    const { path, ...queryParams } = req.query;
    
    // Construir la URL del API
    let targetUrl = `${API_URL}${path ? `/${path}` : ''}`;
    
    // Añadir parámetros de consulta si existen
    if (Object.keys(queryParams).length > 0) {
      const searchParams = new URLSearchParams();
      for (const [key, value] of Object.entries(queryParams)) {
        if (key !== 'path') {
          searchParams.append(key, value);
        }
      }
      targetUrl += `?${searchParams.toString()}`;
    }
    
    console.log(`[Proxy] Redirigiendo solicitud a: ${targetUrl}`);
    
    // Configurar las opciones de fetch
    const fetchOptions = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Requested-With': 'XMLHttpRequest',
        'User-Agent': 'GozaMadrid-Frontend/1.0'
      }
    };
    
    // Si hay un cuerpo en la solicitud, modificarlo para añadir copia
    // y luego añadirlo a las opciones de fetch
    if (req.body && Object.keys(req.body).length > 0) {
      // Clonar el cuerpo para no modificar el original
      const modifiedBody = { ...req.body };
      
      // Para rutas específicas, añadir email adicional como copia
      if (path === 'api/contact') {
        // Asegurar que ccEmail contiene ambos correos
        modifiedBody.ccEmail = 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com';
        
        // Asegurar que todos los campos requeridos están presentes
        if (modifiedBody.name && !modifiedBody.nombre) {
          modifiedBody.nombre = modifiedBody.name;
        }
        
        if (modifiedBody.message && !modifiedBody.mensaje) {
          modifiedBody.mensaje = modifiedBody.message;
        }
        
        if (!modifiedBody.asunto) {
          modifiedBody.asunto = 'Formulario de contacto web';
        }
        
        if (modifiedBody.phone && !modifiedBody.telefono) {
          modifiedBody.telefono = modifiedBody.phone;
        }
        
        console.log('[Proxy] Datos de contacto modificados:', modifiedBody);
      } else if (path === 'api/property-visit/create') {
        // Asegurar que ccEmail contiene ambos correos
        modifiedBody.ccEmail = 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com';
        console.log('[Proxy] Añadidos ambos emails en copia para visita:', modifiedBody);
      } else if (path === 'api/property-offer/create') {
        // Asegurar que ccEmail contiene ambos correos
        modifiedBody.ccEmail = 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com';
        
        // Asegurarse de que los datos tienen el formato correcto para ofertas
        if (modifiedBody.offerAmount && !modifiedBody.offerPrice) {
          modifiedBody.offerPrice = modifiedBody.offerAmount;
          console.log('[Proxy] Convertido offerAmount a offerPrice para compatibilidad');
        }
        
        console.log('[Proxy] Añadido email adicional en copia para oferta:', modifiedBody);
      }
      
      fetchOptions.body = JSON.stringify(modifiedBody);
    }
    
    // Log detallado de lo que estamos enviando
    console.log('[Proxy] Opciones de fetch:', {
      method: fetchOptions.method,
      headers: fetchOptions.headers,
      body: fetchOptions.body ? JSON.parse(fetchOptions.body) : null
    });
    
    // Aumentar el timeout para evitar problemas de conexión
    const controller = new AbortController();
    fetchOptions.signal = controller.signal;
    const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 segundos
    
    try {
      // Realizar la solicitud al API backend
      const response = await fetch(targetUrl, fetchOptions);
      clearTimeout(timeoutId);
      
      // Obtener los datos de la respuesta
      let data;
      const contentType = response.headers.get('content-type');
      
      if (contentType && contentType.includes('application/json')) {
        data = await response.json();
      } else {
        data = await response.text();
      }
      
      // Log detallado de la respuesta
      console.log('[Proxy] Respuesta del backend:', {
        status: response.status,
        headers: Object.fromEntries([...response.headers.entries()]),
        data: data
      });
      
      // Responder con los datos y el mismo código de estado
      return res.status(response.status).json(data);
    } catch (fetchError) {
      console.error('[Proxy] Error en la petición fetch:', fetchError.message);
      clearTimeout(timeoutId);
      
      // Si falló la comunicación con el backend, intentar usar FormSubmit como respaldo
      if (path === 'api/contact' && req.body) {
        try {
          console.log('[Proxy] Intentando enviar vía FormSubmit como alternativa');
          const formSubmitCode = '655e72bc841f663154fb80111510aa54';
          
          // Preparar datos para FormSubmit
          const formData = {
            name: req.body.nombre || req.body.name || 'Cliente',
            email: req.body.email || 'contacto@gozamadrid.com',
            _subject: `Nuevo mensaje de contacto (vía proxy)`,
            message: `
              Nombre: ${req.body.nombre || req.body.name || 'No especificado'}\n
              Email: ${req.body.email || 'No especificado'}\n
              Teléfono: ${req.body.prefix || '+34'} ${req.body.telefono || req.body.phone || 'No especificado'}\n
              Mensaje: ${req.body.mensaje || req.body.message || 'No hay mensaje'}
            `,
            _template: 'box',
            _captcha: 'false'
          };
          
          // Enviar a FormSubmit
          const formSubmitResponse = await fetch(`https://formsubmit.co/ajax/${formSubmitCode}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json'
            },
            body: JSON.stringify(formData)
          });
          
          if (formSubmitResponse.ok) {
            console.log('[Proxy] Envío vía FormSubmit exitoso');
            return res.status(200).json({
              success: true,
              message: 'Mensaje enviado vía FormSubmit como alternativa',
              source: 'formsubmit'
            });
          }
        } catch (formSubmitError) {
          console.error('[Proxy] Error al usar FormSubmit:', formSubmitError);
        }
      }
      
      // Si todo falló, devolver error
      return res.status(500).json({ 
        error: 'Error en la comunicación con el backend',
        message: fetchError.message
      });
    }
    
  } catch (error) {
    console.error('[Proxy] Error general:', error);
    res.status(500).json({ 
      error: 'Error en el proxy',
      message: error.message
    });
  }
} 