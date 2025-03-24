import os from 'os';
import mongoose from 'mongoose';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

/**
 * Script para obtener información del sistema
 * Uso: node systemInfo.js
 */

// Función auxiliar para imprimir en consola con formato
const log = (message, type = 'info') => {
  const types = {
    info: '\x1b[36m%s\x1b[0m', // Cyan
    success: '\x1b[32m%s\x1b[0m', // Verde
    error: '\x1b[31m%s\x1b[0m', // Rojo
    warning: '\x1b[33m%s\x1b[0m', // Amarillo,
    header: '\x1b[1m\x1b[36m%s\x1b[0m', // Cyan Bold
  };

  console.log(types[type] || types.info, message);
};

// Función para obtener las variables de entorno
const getEnvironmentVariables = () => {
  const envVars = {
    NODE_ENV: process.env.NODE_ENV || 'No definido',
    PORT: process.env.PORT || '8081 (por defecto)',
    
    // Variables de MongoDB
    MONGODB_URI: process.env.MONGODB_URI ? 'Configurado' : 'No configurado',
    
    // Variables de correo electrónico
    EMAIL_HOST: process.env.EMAIL_HOST || 'No configurado',
    EMAIL_PORT: process.env.EMAIL_PORT || 'No configurado',
    EMAIL_SECURE: process.env.EMAIL_SECURE || 'No configurado',
    EMAIL_USER: process.env.EMAIL_USER ? 'Configurado' : 'No configurado',
    EMAIL_PASS: process.env.EMAIL_PASS ? 'Configurado' : 'No configurado',
    EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configurado' : 'No configurado',
    EMAIL_RECIPIENT: process.env.EMAIL_RECIPIENT || 'No configurado',
    EMAIL_TO: process.env.EMAIL_TO || 'No configurado',
    
    // Variables de Cloudinary
    CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME ? 'Configurado' : 'No configurado',
    API_KEY: process.env.API_KEY ? 'Configurado' : 'No configurado',
    API_SECRET: process.env.API_SECRET ? 'Configurado' : 'No configurado',
    
    // Variables de AWS
    AWS_REGION: process.env.AWS_REGION || 'No configurado',
    AWS_EB_ENVIRONMENT: process.env.AWS_EB_ENVIRONMENT || 'No configurado',
  };
  
  return envVars;
};

// Función para obtener información del sistema
const getSystemInfo = () => {
  return {
    platform: os.platform(),
    release: os.release(),
    type: os.type(),
    arch: os.arch(),
    uptime: Math.floor(os.uptime() / 60) + ' minutos',
    totalMem: Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100 + ' GB',
    freeMem: Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100 + ' GB',
    cpus: os.cpus().length,
    hostname: os.hostname(),
    nodeVersion: process.version,
    v8Version: process.versions.v8,
  };
};

// Función para verificar la conexión a MongoDB
const checkMongoDBConnection = async () => {
  if (!process.env.MONGODB_URI) {
    return {
      status: 'error',
      message: 'No se ha configurado la URI de MongoDB'
    };
  }
  
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    const dbStatus = mongoose.connection.readyState;
    const status = dbStatus === 1 ? 'success' : 'error';
    const readyStates = {
      0: 'Desconectado',
      1: 'Conectado',
      2: 'Conectando',
      3: 'Desconectando',
    };
    
    return {
      status,
      message: `Estado de la conexión: ${readyStates[dbStatus] || 'Desconocido'}`,
      collections: Object.keys(mongoose.connection.collections).length
    };
  } catch (error) {
    return {
      status: 'error',
      message: 'Error al conectar a MongoDB: ' + error.message
    };
  } finally {
    // Cerrar la conexión al terminar
    try {
      await mongoose.disconnect();
    } catch (error) {
      // Ignorar errores al desconectar
    }
  }
};

// Función principal
const getInfo = async () => {
  log('======= Información del Sistema =======', 'header');
  
  // Información del sistema
  const sysInfo = getSystemInfo();
  log('\n📊 Información del sistema:', 'header');
  Object.entries(sysInfo).forEach(([key, value]) => {
    log(`- ${key}: ${value}`);
  });
  
  // Variables de entorno
  const envVars = getEnvironmentVariables();
  log('\n🔧 Variables de entorno:', 'header');
  Object.entries(envVars).forEach(([key, value]) => {
    log(`- ${key}: ${value}`);
  });
  
  // Verificar conexión a MongoDB
  log('\n📁 Conexión a MongoDB:', 'header');
  const mongoStatus = await checkMongoDBConnection();
  log(`- Estado: ${mongoStatus.message}`, mongoStatus.status);
  if (mongoStatus.collections !== undefined) {
    log(`- Colecciones disponibles: ${mongoStatus.collections}`);
  }
  
  log('\n======= Fin del Informe =======', 'header');
};

// Ejecutar el informe
getInfo()
  .then(() => {
    process.exit(0);
  })
  .catch((error) => {
    console.error('Error al generar el informe:', error);
    process.exit(1);
  }); 