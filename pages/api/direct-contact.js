// Endpoint directo para el envío de correos sin pasar por el backend
import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Manejar preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }
  
  // Solo permitir POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }
  
  console.log('[Direct Contact] Datos recibidos:', req.body ? Object.keys(req.body) : 'Sin datos');
  
  try {
    console.log('[Direct Contact] Recibida solicitud:', req.body);
    
    // Extraer datos del formulario unificando nomenclaturas frontend/backend
    const { 
      name, nombre, 
      email, 
      phone, telefono, 
      prefix, 
      message, mensaje, 
      asunto 
    } = req.body;
    
    // Normalizar datos
    const normalizedData = {
      nombre: nombre || name || 'Sin nombre',
      email: email || 'correo@nodisponible.com',
      telefono: telefono || phone || 'No proporcionado',
      prefix: prefix || '+34',
      mensaje: mensaje || message || 'Sin mensaje',
      asunto: asunto || 'Formulario de contacto web'
    };
    
    // Validar datos mínimos requeridos
    if (!normalizedData.nombre || !normalizedData.email) {
      return res.status(400).json({ error: 'Nombre y email son obligatorios' });
    }
    
    // Preparar el mensaje en HTML con estilo atractivo
    const htmlMessage = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
        <div style="background-color: #000; padding: 15px; text-align: center; border-radius: 5px 5px 0 0;">
          <h1 style="color: #D4AF37; margin: 0; font-size: 24px;">Nuevo Mensaje de Contacto</h1>
        </div>
        <div style="padding: 20px; background-color: #f9f9f9;">
          <p style="margin-bottom: 15px; font-size: 16px;"><strong>Nombre:</strong> ${normalizedData.nombre}</p>
          <p style="margin-bottom: 15px; font-size: 16px;"><strong>Email:</strong> ${normalizedData.email}</p>
          <p style="margin-bottom: 15px; font-size: 16px;"><strong>Teléfono:</strong> ${normalizedData.prefix} ${normalizedData.telefono}</p>
          <div style="background-color: #fff; padding: 15px; border-left: 4px solid #D4AF37; margin-bottom: 15px;">
            <p style="margin: 0; font-size: 16px;"><strong>Mensaje:</strong></p>
            <p style="margin: 10px 0 0; font-size: 16px;">${normalizedData.mensaje}</p>
          </div>
        </div>
        <div style="background-color: #000; color: #fff; text-align: center; padding: 10px; border-radius: 0 0 5px 5px;">
          <p style="margin: 0; font-size: 14px;">Goza Madrid - Mensaje desde la Web</p>
        </div>
      </div>
    `;
    
    // Array para almacenar todas las promesas de envío
    const promises = [];
    
    // MÉTODO 1: Usar Nodemailer directamente con las credenciales correctas
    try {
      // Crear el transporter con las credenciales del servidor
      const transporter = nodemailer.createTransport({
        host: 'smtp.gmail.com',
        port: 587,
        secure: false,
        auth: {
          user: 'ignaciodalesiolopez@gmail.com',
          pass: 'tjlt deip zhwe mkzm' // Contraseña correcta confirmada
        },
        tls: {
          rejectUnauthorized: false
        }
      });
      
      // Crear la promesa para enviar correo con Nodemailer
      const mailOptions = {
        from: '"Formulario Goza Madrid" <ignaciodalesiolopez@gmail.com>',
        to: 'marta@gozamadrid.com, ignaciodalesio1995@gmail.com',
        subject: `Nuevo mensaje de contacto de ${normalizedData.nombre}`,
        html: htmlMessage,
        text: formatMessage(normalizedData),
        replyTo: normalizedData.email
      };
      
      // Añadir la promesa de envío de Nodemailer
      promises.push(
        new Promise((resolve, reject) => {
          transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
              console.error('[Direct Contact] Error Nodemailer:', error);
              reject(error);
            } else {
              console.log('[Direct Contact] Email enviado via Nodemailer:', info.messageId);
              resolve(info);
            }
          });
        })
      );
      
      console.log('[Direct Contact] Agregado envío por Nodemailer');
    } catch (nodemailerError) {
      console.error('[Direct Contact] Error configurando Nodemailer:', nodemailerError);
    }
    
    // MÉTODO 2: Usar FormSubmit
    // Código de activación para FormSubmit para marta@gozamadrid.com
    const formSubmitCode = '655e72bc841f663154fb80111510aa54';
    
    // Enviar a ambos correos en paralelo usando FormSubmit
    promises.push(
      // Enviar a marta@gozamadrid.com
      fetch(`https://formsubmit.co/ajax/${formSubmitCode}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: normalizedData.nombre,
          email: normalizedData.email,
          _subject: `Nuevo mensaje de contacto de ${normalizedData.nombre}`,
          _template: 'box',
          message: htmlMessage,
          _captcha: 'false'
        })
      })
    );
    
    promises.push(
      // Enviar a ignaciodalesio1995@gmail.com
      fetch('https://formsubmit.co/ajax/ignaciodalesio1995@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: normalizedData.nombre,
          email: normalizedData.email,
          _subject: `Nuevo mensaje de contacto de ${normalizedData.nombre}`,
          _template: 'box',
          message: htmlMessage,
          _captcha: 'false'
        })
      })
    );
    
    // MÉTODO 3: Enviar al backend de Goza Madrid
    try {
      // Intentar enviar al backend como método adicional (tanto HTTP como HTTPS)
      // Primero intento HTTPS
      promises.push(
        fetch('https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            nombre: normalizedData.nombre,
            email: normalizedData.email, 
            telefono: normalizedData.telefono,
            prefix: normalizedData.prefix,
            mensaje: normalizedData.mensaje,
            asunto: normalizedData.asunto,
            ccEmail: 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com'
          })
        })
      );
      
      // Segundo intento HTTP (por si acaso)
      promises.push(
        fetch('http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/contact', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({
            nombre: normalizedData.nombre,
            email: normalizedData.email, 
            telefono: normalizedData.telefono,
            prefix: normalizedData.prefix,
            mensaje: normalizedData.mensaje,
            asunto: normalizedData.asunto,
            ccEmail: 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com'
          })
        })
      );
      
      console.log('[Direct Contact] Agregados intentos de backend (HTTP y HTTPS)');
    } catch (backendError) {
      console.error('[Direct Contact] Error preparando envío al backend (ignorado):', backendError);
    }
    
    // MÉTODO 4: Email.js como alternativa adicional
    try {
      // Agregar Email.js como otra alternativa
      promises.push(
        fetch('https://api.emailjs.com/api/v1.0/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            service_id: 'service_qqnhk07',
            template_id: 'template_ljhtvus',
            user_id: 'OmMNBfZJiSdYY5HwO', 
            template_params: {
              from_name: normalizedData.nombre,
              reply_to: normalizedData.email,
              message: normalizedData.mensaje,
              phone: `${normalizedData.prefix} ${normalizedData.telefono}`,
              to_email: 'marta@gozamadrid.com,ignaciodalesio1995@gmail.com'
            }
          })
        })
      );
      console.log('[Direct Contact] Agregado envío por Email.js');
    } catch (emailJsError) {
      console.error('[Direct Contact] Error preparando Email.js (ignorado):', emailJsError);
    }
    
    // Esperar a que se completen todas las peticiones con un tiempo límite
    const timeout = ms => new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), ms));
    
    // Dar máximo 15 segundos para que se completen las peticiones
    const timeoutPromise = timeout(15000);
    const resultsPromise = Promise.allSettled(promises);
    
    // Usar race para evitar bloquear demasiado tiempo
    const results = await Promise.race([resultsPromise, timeoutPromise.then(() => {
      console.log('[Direct Contact] Timeout alcanzado, continuando con los resultados disponibles');
      return Promise.allSettled(promises);
    })]);
    
    const succeededPromises = results.filter(result => 
      result.status === 'fulfilled' && 
      (!result.value.status || result.value.status < 400 || result.value.ok)
    ).length;
    
    console.log(`[Direct Contact] Métodos de envío exitosos: ${succeededPromises} de ${promises.length}`);
    
    if (succeededPromises > 0) {
      return res.status(200).json({
        success: true,
        message: `Mensaje enviado correctamente por ${succeededPromises} vías`,
        delivered: succeededPromises,
        timestamp: new Date().toISOString()
      });
    } else {
      const errors = results
        .filter(result => result.status === 'rejected')
        .map(result => result.reason);
      
      console.error('[Direct Contact] Errores al enviar:', errors);
      
      // Aunque hubo errores, enviar respuesta exitosa para mejorar UX
      return res.status(200).json({
        success: true,
        message: 'Tu mensaje ha sido procesado',
        note: 'Si no recibes respuesta pronto, por favor contáctanos directamente por teléfono',
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('[Direct Contact] Error general:', error);
    
    // Siempre devolver un mensaje positivo al usuario
    return res.status(200).json({
      success: true,
      message: 'Tu mensaje ha sido procesado',
      note: 'Si no recibes respuesta pronto, por favor contáctanos directamente por teléfono',
      timestamp: new Date().toISOString()
    });
  }
}

// Función para formatear el mensaje
function formatMessage(data) {
  return `
Datos del formulario de contacto:

Nombre: ${data.nombre || 'No proporcionado'}
Email: ${data.email || 'No proporcionado'}
Teléfono: ${data.prefix || '+34'} ${data.telefono || 'No proporcionado'}
Mensaje: ${data.mensaje || 'No proporcionado'}
  `;
} 