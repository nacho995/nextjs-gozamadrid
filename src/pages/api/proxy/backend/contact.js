// Endpoint para gestionar el envío de contactos y visitas
export default async function handler(req, res) {
  // Configurar CORS adecuadamente
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  // Manejar preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Verificar que sea un método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Solo se permite POST.' });
  }
  
  try {
    // Mostrar los datos recibidos para depuración
    console.log('[Contact Proxy] Datos recibidos:', req.body ? Object.keys(req.body) : 'Sin datos');
    
    // Verificar si tenemos datos válidos
    if (!req.body || !req.body.email) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El email es obligatorio'
      });
    }
    
    // Preparar contenido del email según el tipo
    let subject = 'Nuevo contacto desde la web';
    let body = '';
    
    // Si es una solicitud de visita
    if (req.body.type === 'visit') {
      subject = 'Nueva solicitud de visita de propiedad';
      body = `
        Nueva solicitud de visita
        
        Propiedad: ${req.body.propertyTitle || 'No especificada'}
        ID Propiedad: ${req.body.propertyId || 'No especificado'}
        Fecha de visita: ${req.body.visitDate || 'No especificada'}
        Hora de visita: ${req.body.visitTime || 'No especificada'}
        Nombre: ${req.body.name || 'No especificado'}
        Email: ${req.body.email}
        Teléfono: ${req.body.phone || 'No especificado'}
        Mensaje: ${req.body.message || 'No especificado'}
      `;
    } 
    // Si es una oferta
    else if (req.body.type === 'offer') {
      subject = 'Nueva oferta para propiedad';
      body = `
        Nueva oferta recibida
        
        Propiedad: ${req.body.propertyTitle || 'No especificada'}
        ID Propiedad: ${req.body.propertyId || 'No especificado'}
        Oferta: ${req.body.offerAmount || 'No especificada'} ${req.body.offerLabel || ''}
        Nombre: ${req.body.name || 'No especificado'}
        Email: ${req.body.email}
        Teléfono: ${req.body.phone || 'No especificado'}
        Mensaje: ${req.body.message || 'No especificado'}
      `;
    }
    // Si es contacto general
    else {
      body = `
        Nuevo mensaje de contacto
        
        Nombre: ${req.body.name || 'No especificado'}
        Email: ${req.body.email}
        Teléfono: ${req.body.phone || 'No especificado'}
        Mensaje: ${req.body.message || 'No especificado'}
      `;
    }
    
    // Datos para formsubmit.co - servicio gratuito para procesamiento de formularios
    const formData = {
      name: req.body.name || 'Cliente Web',
      email: req.body.email,
      message: body,
      subject: subject,
      _template: 'box'
    };
    
    console.log('[Contact Proxy] Enviando a formsubmit.co');
    
    // Enviar al servicio de formularios
    const response = await fetch('https://formsubmit.co/ajax/marta@gozamadrid.com', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Verificar respuesta del servicio
    if (response.ok) {
      const result = await response.json();
      console.log('[Contact Proxy] Respuesta:', result);
      
      return res.status(200).json({
        success: true,
        message: 'Solicitud procesada correctamente'
      });
    } else {
      // Si falla, intentar con un servicio alternativo
      console.log('[Contact Proxy] Fallo en formsubmit, intentando con alternativa');
      
      // Intentar con Web3Forms como alternativa
      const web3FormsResponse = await fetch('https://api.web3forms.com/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          access_key: '4b1ed8d4-53e7-4e8e-b9f2-f46a8513da87', // Clave pública de acceso
          subject: subject,
          from_name: req.body.name || 'Cliente Web',
          email: req.body.email,
          message: body
        })
      });
      
      if (web3FormsResponse.ok) {
        return res.status(200).json({
          success: true,
          message: 'Solicitud procesada con servicio alternativo'
        });
      }
      
      // Si nada funciona, devolver error
      return res.status(500).json({
        error: 'No se pudo procesar la solicitud',
        message: 'Intente más tarde o contacte directamente'
      });
    }
  } catch (error) {
    console.error('[Contact Proxy] Error general:', error);
    return res.status(500).json({
      error: 'Error general al procesar la solicitud',
      message: 'Intente más tarde'
    });
  }
} 