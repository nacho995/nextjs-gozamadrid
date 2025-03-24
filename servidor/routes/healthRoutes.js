import express from 'express';
import mongoose from 'mongoose';
import os from 'os';
import nodemailer from 'nodemailer';
import { testEmail } from '../controller/contactController.js';

const router = express.Router();

// Endpoint para verificar el estado del servidor
router.get('/', async (req, res) => {
  try {
    // Información del sistema
    const systemInfo = {
      uptime: Math.floor(process.uptime()),
      memory: {
        total: Math.round(os.totalmem() / (1024 * 1024 * 1024) * 100) / 100 + ' GB',
        free: Math.round(os.freemem() / (1024 * 1024 * 1024) * 100) / 100 + ' GB',
        usage: Math.round((1 - os.freemem() / os.totalmem()) * 10000) / 100 + '%'
      },
      cpu: os.cpus().length,
      hostname: os.hostname(),
      platform: os.platform(),
      nodeVersion: process.version
    };

    // Estado de MongoDB
    const dbStatus = mongoose.connection.readyState;
    const dbReady = dbStatus === 1;
    const dbStatusText = ['Desconectado', 'Conectado', 'Conectando', 'Desconectando'][dbStatus] || 'Desconocido';

    // Variables de entorno para correo electrónico
    const emailConfig = {
      host: process.env.EMAIL_HOST ? true : false,
      port: process.env.EMAIL_PORT ? true : false,
      user: process.env.EMAIL_USER ? true : false,
      pass: (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD) ? true : false,
      recipient: (process.env.EMAIL_RECIPIENT || process.env.EMAIL_TO) ? true : false
    };

    // Estado general
    const status = {
      server: "OK",
      database: dbReady ? "OK" : "ERROR",
      email: (emailConfig.host && emailConfig.port && emailConfig.user && emailConfig.pass) ? "OK" : "CONFIGURACIÓN INCOMPLETA"
    };

    // Determinar el estado general del sistema
    const overallStatus = !dbReady ? "ERROR" : 
                         (status.email !== "OK" ? "ADVERTENCIA" : "OK");

    return res.status(200).json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      uptime: systemInfo.uptime,
      components: {
        server: {
          status: status.server,
          info: systemInfo
        },
        database: {
          status: status.database,
          connection: dbStatusText,
          collections: Object.keys(mongoose.connection.collections).length
        },
        email: {
          status: status.email,
          config: emailConfig
        }
      }
    });
  } catch (error) {
    console.error('Error en el health check:', error);
    return res.status(500).json({
      status: "ERROR",
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

// Endpoint para verificar conexión al servidor de correo
router.get('/email', async (req, res) => {
  try {
    // Verificar si tenemos la configuración necesaria
    if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || 
        !(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)) {
      return res.status(400).json({
        status: "ERROR",
        message: "Configuración de correo incompleta",
        missingConfig: {
          host: !process.env.EMAIL_HOST,
          user: !process.env.EMAIL_USER,
          pass: !(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)
        }
      });
    }

    // Crear transportador
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
      }
    });

    // Verificar conexión
    const verifyResult = await transporter.verify();

    return res.status(200).json({
      status: verifyResult ? "OK" : "ERROR",
      message: verifyResult ? "Conexión al servidor de correo verificada" : "No se pudo verificar la conexión",
      config: {
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || '587',
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER ? 'Configurado' : 'No configurado',
        pass: (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD) ? 'Configurado' : 'No configurado'
      }
    });
  } catch (error) {
    console.error('Error en la verificación de correo:', error);
    return res.status(500).json({
      status: "ERROR",
      message: "Error al verificar conexión de correo",
      error: error.message
    });
  }
});

// Endpoint para verificar conexión a MongoDB
router.get('/mongodb', async (req, res) => {
  try {
    // Verificar estado de la conexión
    const dbStatus = mongoose.connection.readyState;
    const dbReady = dbStatus === 1;
    const dbStatusText = ['Desconectado', 'Conectado', 'Conectando', 'Desconectando'][dbStatus] || 'Desconocido';

    return res.status(200).json({
      status: dbReady ? "OK" : "ERROR",
      connection: dbStatusText,
      collections: Object.keys(mongoose.connection.collections).length,
      databaseName: mongoose.connection.name || 'No disponible'
    });
  } catch (error) {
    console.error('Error en la verificación de MongoDB:', error);
    return res.status(500).json({
      status: "ERROR",
      message: "Error al verificar conexión a MongoDB",
      error: error.message
    });
  }
});

// Ruta para prueba de email
router.get('/email', testEmail);
router.post('/email', testEmail);

export default router; 