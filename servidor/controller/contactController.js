import dotenv from 'dotenv';
// import nodemailer from 'nodemailer';
// import smtpTransport from 'nodemailer-smtp-transport';
import sgMail from '@sendgrid/mail'; // Importar SendGrid
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

// Configurar SendGrid API Key
if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  console.log('[ContactController] SendGrid API Key configurada.');
} else {
  console.error('[ContactController] ¡ERROR CRÍTICO! Falta la variable de entorno SENDGRID_API_KEY.');
  // Considera lanzar un error o manejar esto de forma más robusta
}

// Para obtener la ruta absoluta
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Loguear destinatario configurado (si aún es relevante)
console.log('EMAIL_RECIPIENT (Admin notification): ', process.env.EMAIL_RECIPIENT);

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

// --- Funciones de Nodemailer y Fallbacks Comentadas ---
/*
const createTransporter = () => {
  // ... (código de Nodemailer) ...
};

const sendEmailViaSMTP2GO = async (mailOptions) => {
  // ... (código SMTP2GO) ...
};

const sendEmailViaExternalService = async (mailOptions) => {
  // ... (código FormSubmit) ...
};

const sendEmailWithFallbacks = async (mailOptions) => {
  // ... (código de fallbacks) ...
};
*/

// Función para enviar correo de prueba (actualizar para usar SendGrid)
export const testEmail = async (req, res) => {
  try {
    const msg = {
      to: 'ignaciodalesio1995@gmail.com', // Cambiar si es necesario
      // ¡Importante! SendGrid requiere un remitente verificado.
      // Usa un email de un dominio que hayas verificado en SendGrid.
      from: process.env.SENDGRID_VERIFIED_SENDER || 'test@yourverifieddomain.com', 
      subject: 'Correo de prueba SendGrid - ' + new Date().toISOString(),
      text: 'Este es un correo de prueba enviado desde la API de Goza Madrid usando SendGrid.',
      html: `<h1>Correo de prueba SendGrid</h1><p>Fecha: ${new Date().toLocaleString()}</p>`,
    };

    console.log('Enviando correo de prueba SendGrid:', msg.subject);
    const response = await sgMail.send(msg);
    console.log('Correo de prueba SendGrid enviado:', response[0].statusCode, response[0].headers);
    logToFile('Correo prueba SendGrid enviado', { response });

    return res.status(200).json({
      success: true,
      message: 'Correo de prueba SendGrid enviado correctamente',
      data: { statusCode: response[0].statusCode }
    });

  } catch (error) {
    console.error('Error al enviar correo de prueba SendGrid:', error);
    if (error.response) {
      console.error('SendGrid Error Body:', error.response.body)
    }
    logToFile('Error prueba SendGrid', { error: error.message, responseBody: error.response?.body });
    return res.status(500).json({
      success: false,
      message: 'Error al enviar correo de prueba SendGrid',
      error: error.message
    });
  }
};

// --- Función Principal sendContactEmail (Simplificada para diagnóstico) ---
export const sendContactEmail = async (req, res) => {
  try {
    console.log('[CONTACT] Recibida petición en sendContactEmail');
    console.log('[CONTACT] Method:', req.method);
    console.log('[CONTACT] URL:', req.url);
    console.log('[CONTACT] Headers:', JSON.stringify(req.headers));
    console.log('[CONTACT] Body:', JSON.stringify(req.body));
    
    // Devolver siempre éxito para propósitos de diagnóstico
    return res.status(200).json({
      success: true,
      message: 'Diagnóstico completado - ver logs del servidor',
      receivedBody: req.body
    });
  } catch (error) {
    console.error('[CONTACT] Error en sendContactEmail:', error);
    return res.status(500).json({
      success: false,
      message: 'Error interno del servidor durante el diagnóstico'
    });
  }
}; 