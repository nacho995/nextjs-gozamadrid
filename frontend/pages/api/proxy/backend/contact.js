// Endpoint para gestionar el envío de contactos y visitas usando el backend
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
    console.log('[Contact Proxy] Datos recibidos:', req.body ? Object.keys(req.body) : 'Sin datos');
    
    // Verificar si tenemos datos válidos
    if (!req.body || !req.body.email) {
      return res.status(400).json({
        error: 'Datos incompletos',
        message: 'El email es obligatorio'
      });
    }

    // URL del backend - ajustar según tu configuración
    const backendUrl = process.env.BACKEND_URL || 'https://nextjs-gozamadrid-qrfk.onrender.com';
    let endpoint = '';
    
    // Determinar el endpoint según el tipo
    if (req.body.type === 'visit') {
      endpoint = '/api/property-visit/create';
    } else if (req.body.type === 'offer') {
      endpoint = '/api/property-offer/create';
    } else {
      console.log('[Contact Proxy] Error del backend, usando servicio de respaldo');
      
      // Fallback a servicios externos si el backend falla
      const formData = {
        name: req.body.name || 'Cliente Web',
        email: req.body.email,
        message: `Tipo: ${req.body.type || 'contacto'}\nPropiedad: ${req.body.propertyTitle || 'N/A'}\nNombre: ${req.body.name || 'N/A'}\nEmail: ${req.body.email}\nTeléfono: ${req.body.phone || 'N/A'}\nMensaje: ${req.body.message || 'N/A'}`,
        subject: req.body.type === 'visit' ? 'Nueva solicitud de visita' : req.body.type === 'offer' ? 'Nueva oferta' : 'Nuevo contacto',
        _template: 'box'
      };
      
      console.log('[Contact Proxy] Enviando a FormSubmit:', formData);
      
      const fallbackResponse = await fetch('https://formsubmit.co/ajax/marta@gozamadrid.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (fallbackResponse.ok) {
        return res.status(200).json({
          success: true,
          message: 'Solicitud procesada con servicio de respaldo'
        });
      }
      
      return res.status(500).json({
        error: 'No se pudo procesar la solicitud',
        message: 'Intente más tarde o contacte directamente'
      });
    }

    console.log(`[Contact Proxy] Enviando al backend: ${backendUrl}${endpoint}`);
    
    // Enviar al backend
    const backendResponse = await fetch(`${backendUrl}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(req.body)
    });
    
    if (backendResponse.ok) {
      const result = await backendResponse.json();
      console.log('[Contact Proxy] Respuesta del backend:', result);
      
      return res.status(200).json({
        success: true,
        message: 'Solicitud procesada correctamente'
      });
    } else {
      console.log('[Contact Proxy] Error del backend, usando servicio de respaldo');
      
      // Fallback a servicios externos si el backend falla
      const formData = {
        name: req.body.name || 'Cliente Web',
        email: req.body.email,
        message: `Tipo: ${req.body.type || 'contacto'}\nPropiedad: ${req.body.propertyTitle || 'N/A'}\nNombre: ${req.body.name || 'N/A'}\nEmail: ${req.body.email}\nTeléfono: ${req.body.phone || 'N/A'}\nMensaje: ${req.body.message || 'N/A'}`,
        subject: req.body.type === 'visit' ? 'Nueva solicitud de visita' : req.body.type === 'offer' ? 'Nueva oferta' : 'Nuevo contacto',
        _template: 'box'
      };
      
      console.log('[Contact Proxy] Enviando a FormSubmit:', formData);
      
      // El backend ya tiene nodemailer como fallback, no necesitamos servicios externos
      console.log('[Contact Proxy] Backend falló, pero tiene su propio sistema de fallback con nodemailer');
      
      return res.status(500).json({
        error: 'No se pudo enviar el email',
        message: 'Intente más tarde o contacte directamente'
      });
    }
  } catch (error) {
    console.error('[Contact Proxy] Error general:', error);
    
    // Intentar servicio de respaldo en caso de error
    try {
      const formData = {
        name: req.body.name || 'Cliente Web',
        email: req.body.email,
        message: `Error de conexión - Tipo: ${req.body.type || 'contacto'}\nNombre: ${req.body.name || 'N/A'}\nEmail: ${req.body.email}\nTeléfono: ${req.body.phone || 'N/A'}\nMensaje: ${req.body.message || 'N/A'}`,
        subject: 'Formulario web (error de conexión)',
        _template: 'box'
      };
      
      const emergencyResponse = await fetch('https://formsubmit.co/ajax/marta@gozamadrid.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if (emergencyResponse.ok) {
        return res.status(200).json({
          success: true,
          message: 'Solicitud procesada con servicio de emergencia'
        });
      }
    } catch (emergencyError) {
      console.error('[Contact Proxy] Error en servicio de emergencia:', emergencyError);
    }
    
    return res.status(500).json({
      error: 'Error general al procesar la solicitud',
      message: 'Intente más tarde'
    });
  }
} 