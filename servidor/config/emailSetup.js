/**
 * Configuración de correo electrónico
 * Este archivo establece las variables de entorno para el envío de correos
 * directamente desde el código, sin depender de la configuración de AWS Beanstalk.
 */

// Importar el archivo de credenciales
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Intentar cargar credenciales desde un archivo JSON local
let credentials = { user: null, pass: null, recipient: null };
try {
  // Intentar leer el archivo de credenciales
  const credentialsPath = path.join(__dirname, 'email-credentials.json');
  
  if (fs.existsSync(credentialsPath)) {
    const fileContent = fs.readFileSync(credentialsPath, 'utf8');
    credentials = JSON.parse(fileContent);
    console.log('✅ Credenciales de email cargadas desde archivo JSON');
  } else {
    console.log('⚠️ No se encontró el archivo de credenciales');
  }
} catch (error) {
  console.log('⚠️ Error al cargar credenciales:', error.message);
  console.log('⚠️ Se usarán valores predeterminados o variables de entorno');
}

// Configuración para Gmail (ajustar según sea necesario)
const emailConfig = {
  // Servidor SMTP
  EMAIL_HOST: 'smtp.gmail.com',
  EMAIL_PORT: '587',
  EMAIL_SECURE: 'false', // true para 465, false para otros puertos
  
  // Credenciales (se sobrescriben con los valores importados si existen)
  EMAIL_USER: credentials.user || 'ignaciodalesiolopez@gmail.com',
  EMAIL_PASS: credentials.pass || 'tjlt deip zhwe mkzm',

  // Destinatario de notificaciones
  EMAIL_RECIPIENT: credentials.recipient || 'marta@gozamadrid.com,ignaciodalesio1995@gmail.com',
  EMAIL_TO: credentials.recipient || 'marta@gozamadrid.com,ignaciodalesio1995@gmail.com',
  
  // Alias alternativo
  EMAIL_PASSWORD: credentials.pass || 'tjlt deip zhwe mkzm',
  
  // Remitente por defecto
  EMAIL_FROM: 'ignaciodalesiolopez@gmail.com'
};

// Establecer las variables de entorno si no están ya definidas
Object.entries(emailConfig).forEach(([key, value]) => {
  if (!process.env[key]) {
    console.log(`Estableciendo variable de entorno ${key} desde configuración local`);
    process.env[key] = value;
  } else {
    console.log(`Variable de entorno ${key} ya está configurada`);
  }
});

// Exportar la configuración para referencia
export default emailConfig;

// Verificar la configuración establecida
console.log('Configuración de correo electrónico establecida:');
console.log({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === 'true',
  user: process.env.EMAIL_USER ? '✓ Configurado' : '✗ No configurado',
  pass: process.env.EMAIL_PASS ? '✓ Configurado' : '✗ No configurado',
  recipient: process.env.EMAIL_RECIPIENT
}); 