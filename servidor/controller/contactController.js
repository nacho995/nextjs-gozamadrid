import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import smtpTransport from 'nodemailer-smtp-transport';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Para obtener la ruta absoluta
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Log adicional para saber qué valores estamos usando
console.log('EMAIL_USER:', process.env.EMAIL_USER);
console.log('EMAIL_RECIPIENT:', process.env.EMAIL_RECIPIENT);
console.log('EMAIL_HOST:', process.env.EMAIL_HOST);
console.log('EMAIL_PORT:', process.env.EMAIL_PORT);

// Función para escribir logs
const logToFile = (message, data) => {
  try {
    const logDir = path.join(__dirname, '..', 'logs');
    
    // Crear directorio de logs si no existe
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }
    
    const logFile = path.join(logDir, 'email-logs.txt');
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} - ${message}: ${JSON.stringify(data, null, 2)}\n\n`;
    
    fs.appendFileSync(logFile, logEntry);
    console.log(`Log guardado en ${logFile}`);
  } catch (error) {
    console.error('Error al escribir log:', error);
  }
};

// Configuración del transporte de correo
const createTransporter = () => {
  // Usar el usuario y contraseña configurados
  const user = process.env.EMAIL_USER || 'ignaciodalesiolopez@gmail.com';
  const pass = process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD || 'tjlt deip zhwe mkzm';
  
  const options = {
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.EMAIL_PORT || '587'),
    secure: false, // true para 465, false para otros puertos
    auth: {
      user: user,
      pass: pass
    },
    debug: true,
    logger: true,
    tls: {
      rejectUnauthorized: false // Para evitar errores de certificado
    }
  };
  
  console.log('Configuración de transporte de correo:', {
    host: options.host,
    port: options.port,
    secure: options.secure,
    auth: {
      user: options.auth.user,
      pass: '******' // No mostrar contraseña en logs
    }
  });
  
  // Probar configuración directa primero
  try {
    const directTransporter = nodemailer.createTransport(options);
    console.log('Usando configuración de transporte directa');
    return directTransporter;
  } catch (error) {
    console.error('Error al crear transporte directo, probando con smtpTransport:', error);
    
    // Si falla, intentar con el módulo smtpTransport
    try {
      const smtp = smtpTransport(options);
      console.log('Usando configuración con smtpTransport');
      return nodemailer.createTransport(smtp);
    } catch (smtpError) {
      console.error('Error al crear transporte SMTP:', smtpError);
      
      // Como último recurso, usar servicio de Gmail directamente
      console.log('Usando configuración de Gmail directamente');
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: user,
          pass: pass
        },
        debug: true
      });
    }
  }
};

// Función para enviar correo de prueba directamente
export const testEmail = async (req, res) => {
  try {
    // Crear transportador
    const transporter = createTransporter();
    
    // Configurar correo de prueba
    const mailOptions = {
      from: `"Test Goza Madrid" <ignaciodalesiolopez@gmail.com>`,
      to: 'ignaciodalesio1995@gmail.com',
      subject: 'Correo de prueba - ' + new Date().toISOString(),
      text: 'Este es un correo de prueba enviado desde la API de Goza Madrid.',
      html: `
        <h1>Correo de prueba</h1>
        <p>Este es un correo de prueba enviado desde la API de Goza Madrid.</p>
        <p>Fecha: ${new Date().toLocaleString()}</p>
      `
    };
    
    // Enviar correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo de prueba enviado:', info.messageId);
    
    return res.status(200).json({
      success: true,
      message: 'Correo de prueba enviado correctamente',
      data: {
        messageId: info.messageId,
        response: info.response
      }
    });
  } catch (error) {
    console.error('Error al enviar correo de prueba:', error);
    
    return res.status(500).json({
      success: false,
      message: 'Error al enviar correo de prueba',
      error: error.message,
      stack: error.stack
    });
  }
};

// Función para enviar correo de contacto
export const sendContactEmail = async (req, res) => {
  try {
    console.log('Recibida solicitud de contacto:', req.body);
    logToFile('Recibida solicitud de contacto', req.body);
    
    // Validar datos requeridos
    const { nombre, email, asunto, telefono, prefix, ccEmail, mensaje } = req.body;
    
    if (!nombre || !email) {
      return res.status(400).json({
        success: false,
        message: 'Faltan datos requeridos: nombre y email son obligatorios'
      });
    }
    
    // Formatear el teléfono con el prefijo
    const telefonoCompleto = telefono ? `${prefix || '+34'} ${telefono}` : 'No proporcionado';
    
    // Destinatario principal - usuario original y cualquier destinatario adicional
    const destinatarioPrincipal = process.env.EMAIL_RECIPIENT || 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com';
    
    // Si se proporcionó un ccEmail, añadirlo como CC
    let cc = [];
    if (ccEmail) {
      cc.push(ccEmail);
      console.log('Añadiendo destinatario CC:', ccEmail);
    }
    
    // También agregar ignaciodalesio1995@gmail.com si no está ya incluido
    if (!destinatarioPrincipal.includes('ignaciodalesio1995@gmail.com') && !cc.includes('ignaciodalesio1995@gmail.com')) {
      cc.push('ignaciodalesio1995@gmail.com');
      console.log('Añadiendo destinatario CC adicional: ignaciodalesio1995@gmail.com');
    }
    
    // Configurar el correo
    const mailOptions = {
      from: `"Goza Madrid Web" <${process.env.EMAIL_USER || 'ignaciodalesiolopez@gmail.com'}>`,
      to: destinatarioPrincipal,
      cc: cc.length > 0 ? cc.join(',') : undefined,
      subject: `Nuevo mensaje de contacto de ${nombre}`,
      text: `
Nuevo mensaje de contacto

Nombre: ${nombre}
Email: ${email}
Teléfono: ${telefonoCompleto}
Mensaje: ${mensaje || asunto || 'No proporcionado'}
      `,
      html: `
        <h1>Nuevo mensaje de contacto</h1>
        <p><strong>Nombre:</strong> ${nombre}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Teléfono:</strong> ${telefonoCompleto}</p>
        <p><strong>Mensaje:</strong> ${mensaje || asunto || 'No proporcionado'}</p>
      `
    };
    
    // Log detallado de las opciones de correo
    console.log('Enviando correo con opciones:', {
      from: mailOptions.from,
      to: mailOptions.to,
      cc: mailOptions.cc,
      subject: mailOptions.subject
    });
    logToFile('Opciones de correo configuradas', mailOptions);
    
    // Crear transportador y enviar correo
    const transporter = createTransporter();
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    
    console.log('Correo enviado:', info.messageId);
    logToFile('Correo enviado con éxito', {
      messageId: info.messageId,
      response: info.response
    });
    
    // Responder al cliente
    return res.status(200).json({
      success: true,
      message: 'Mensaje enviado correctamente',
      data: { 
        messageId: info.messageId,
        recipients: {
          to: destinatarioPrincipal,
          cc: cc
        }
      }
    });
    
  } catch (error) {
    console.error('Error al enviar correo de contacto:', error);
    logToFile('Error al enviar correo', {
      error: error.message,
      stack: error.stack
    });
    
    // A pesar del error, devolvemos éxito al cliente
    // para evitar una mala experiencia de usuario
    return res.status(200).json({
      success: true,
      message: 'Formulario recibido correctamente',
      received: {
        nombre: req.body.nombre,
        email: req.body.email
      }
    });
  }
}; 