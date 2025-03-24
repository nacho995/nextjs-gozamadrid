import dotenv from 'dotenv';
import nodemailer from 'nodemailer';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para probar el envío de correos desde la consola
 * Uso: node testEmailFromConsole.js [destinatario]
 */

// Función auxiliar para imprimir en consola con formato
const log = (message, type = 'info') => {
  const types = {
    info: '\x1b[36m%s\x1b[0m', // Cyan
    success: '\x1b[32m%s\x1b[0m', // Verde
    error: '\x1b[31m%s\x1b[0m', // Rojo
    warning: '\x1b[33m%s\x1b[0m', // Amarillo
  };

  console.log(types[type] || types.info, message);
};

// Función principal
const testEmail = async () => {
  try {
    log('======= Test de envío de correo electrónico =======');
    
    // Recuperar el destinatario de los argumentos
    const recipient = process.argv[2] || process.env.EMAIL_RECIPIENT || process.env.EMAIL_TO || 'marta@gozamadrid.com';
    
    // Mostrar variables de entorno
    log('Configuración:');
    log(`- EMAIL_HOST: ${process.env.EMAIL_HOST || 'smtp.gmail.com'}`);
    log(`- EMAIL_PORT: ${process.env.EMAIL_PORT || '587'}`);
    log(`- EMAIL_SECURE: ${process.env.EMAIL_SECURE || 'false'}`);
    log(`- EMAIL_USER: ${process.env.EMAIL_USER || 'No configurado'}`, process.env.EMAIL_USER ? 'info' : 'warning');
    log(`- EMAIL_PASS/EMAIL_PASSWORD: ${process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD ? 'Configurado' : 'No configurado'}`, 
        (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD) ? 'info' : 'warning');
    log(`- Destinatario: ${recipient}`);
    
    // Crear configuración del transportador
    const emailConfig = {
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
      }
    };
    
    // Verificar si tenemos usuario y contraseña
    if (!emailConfig.auth.user || !emailConfig.auth.pass) {
      log('ERROR: No se ha configurado usuario y/o contraseña de correo electrónico', 'error');
      log('Por favor, configure las variables de entorno EMAIL_USER y EMAIL_PASS', 'error');
      process.exit(1);
    }
    
    log('Creando transportador de correo...', 'info');
    
    // Crear transportador
    const transporter = nodemailer.createTransport(emailConfig);
    
    log('Verificando conexión con el servidor de correo...', 'info');
    
    // Verificar conexión
    const verifyResult = await transporter.verify();
    log(`Conexión verificada: ${verifyResult ? 'Exitosa' : 'Fallida'}`, verifyResult ? 'success' : 'error');
    
    // Configurar el correo
    const mailOptions = {
      from: `"Goza Madrid Test" <${process.env.EMAIL_USER || 'notificaciones@gozamadrid.com'}>`,
      to: recipient,
      subject: `Test de correo desde AWS Beanstalk - ${new Date().toLocaleString('es-ES')}`,
      html: `
        <h1>Prueba de envío de correo</h1>
        <p>Este es un correo de prueba enviado desde el servidor AWS Beanstalk.</p>
        <p><strong>Fecha y hora:</strong> ${new Date().toLocaleString('es-ES')}</p>
        <p><strong>Entorno:</strong> ${process.env.NODE_ENV || 'No especificado'}</p>
        <p><strong>Hostname:</strong> ${process.env.HOSTNAME || 'No disponible'}</p>
        <hr>
        <p>Si recibiste este correo, la configuración de correo electrónico está funcionando correctamente.</p>
      `
    };
    
    log('Enviando correo de prueba...', 'info');
    
    // Enviar el correo
    const info = await transporter.sendMail(mailOptions);
    
    log('¡Correo enviado correctamente!', 'success');
    log(`ID del mensaje: ${info.messageId}`, 'success');
    log(`Aceptado por: ${info.accepted.join(', ')}`, 'success');
    
    log('======= Test finalizado =======', 'success');
    return true;
  } catch (error) {
    log('Error al enviar el correo:', 'error');
    log(error.message, 'error');
    
    if (error.code === 'EAUTH') {
      log('Error de autenticación. Verifique usuario y contraseña.', 'error');
    } else if (error.code === 'ESOCKET') {
      log('Error de conexión. Verifique la configuración del servidor y el puerto.', 'error');
    }
    
    log('Información detallada del error:', 'error');
    console.error(error);
    
    log('======= Test fallido =======', 'error');
    return false;
  }
};

// Ejecutar el test
testEmail()
  .then((result) => {
    process.exit(result ? 0 : 1);
  })
  .catch(() => {
    process.exit(1);
  }); 