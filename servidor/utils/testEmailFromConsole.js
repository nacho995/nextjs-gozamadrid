import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import chalk from 'chalk';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para probar el envío de correos desde la consola
 * Uso: node testEmailFromConsole.js [destinatario]
 */

// Colores para logs
const colors = {
  info: chalk.blue,
  success: chalk.green,
  warning: chalk.yellow,
  error: chalk.red,
  debug: chalk.magenta
};

const log = (message, level = 'info') => {
  const colorFunc = colors[level] || colors.info;
  console.log(colorFunc(message));
};

log('\n--- Script de Prueba de Email (SendGrid) ---');

// --- Verificación de Configuración SendGrid ---

const SENDGRID_API_KEY = process.env.SENDGRID_API_KEY;
const SENDGRID_VERIFIED_SENDER = process.env.SENDGRID_VERIFIED_SENDER;
const EMAIL_RECIPIENT_ADMIN = process.env.EMAIL_RECIPIENT;

let configOk = true;

log('\nVerificando configuración de SendGrid:');
if (SENDGRID_API_KEY) {
  log('- SENDGRID_API_KEY: Configurada', 'success');
  sgMail.setApiKey(SENDGRID_API_KEY);
} else {
  log('- SENDGRID_API_KEY: ¡NO CONFIGURADA!', 'error');
  configOk = false;
}

if (SENDGRID_VERIFIED_SENDER) {
  log(`- SENDGRID_VERIFIED_SENDER: ${SENDGRID_VERIFIED_SENDER}`, 'success');
} else {
  log('- SENDGRID_VERIFIED_SENDER: ¡NO CONFIGURADO!', 'error');
  configOk = false;
}

const recipient = process.argv[2] || EMAIL_RECIPIENT_ADMIN || 'marta@gozamadrid.com';
log(`- Destinatario de prueba: ${recipient}`);

if (!configOk) {
  log('\nError: Faltan variables de entorno esenciales para SendGrid.', 'error');
  process.exit(1);
}

// --- Función de Envío --- 

const sendTestEmail = async () => {
  log('\nPreparando mensaje de prueba...');
  const subject = `Correo de Prueba SendGrid - ${new Date().toISOString()}`;
  const text = `Este es un correo de prueba enviado desde el script testEmailFromConsole.js usando SendGrid.\nFecha: ${new Date().toLocaleString()}`;
  const html = `
    <h1>Correo de Prueba SendGrid</h1>
    <p>Este script verifica la configuración y envío a través de SendGrid.</p>
    <p><strong>Remitente Verificado:</strong> ${SENDGRID_VERIFIED_SENDER}</p>
    <p><strong>Destinatario:</strong> ${recipient}</p>
    <p><strong>Fecha de envío:</strong> ${new Date().toLocaleString()}</p>
    <hr>
    <p><em>Goza Madrid - Script de Prueba</em></p>
  `;

  const msg = {
    to: recipient.split(',').map(e => e.trim()), // Permite múltiples destinatarios separados por coma
    from: {
      email: SENDGRID_VERIFIED_SENDER,
      name: "Goza Madrid (Test Script)"
    },
    subject: subject,
    text: text,
    html: html,
  };

  log(`Enviando a: ${msg.to.join(', ')}`);
  log(`Desde: ${msg.from.email} (${msg.from.name})`);
  log(`Asunto: ${msg.subject}`);

  try {
    const response = await sgMail.send(msg);
    log('\n¡Correo de prueba enviado con éxito!', 'success');
    log(`Status Code: ${response[0].statusCode}`);
    log(`Headers: ${JSON.stringify(response[0].headers)}`);
  } catch (error) {
    log('\nError al enviar el correo de prueba:', 'error');
    console.error(error);
    if (error.response) {
      log('SendGrid Error Body:', 'error');
      console.error(error.response.body)
    }
    process.exit(1);
  }
};

// --- Ejecución --- 

sendTestEmail();

/* Código anterior de Nodemailer comentado
import nodemailer from 'nodemailer';
...
const transporter = nodemailer.createTransport({...});
...
transporter.sendMail({...});
*/ 