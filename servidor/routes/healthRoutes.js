import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';
// import nodemailer from 'nodemailer'; // Ya no se usa

dotenv.config();

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Función auxiliar para verificar si un servicio está "configurado"
// Ahora verifica las variables clave de SendGrid
const checkEmailConfig = () => {
  return {
    sendgridApiKey: process.env.SENDGRID_API_KEY ? true : false,
    sendgridVerifiedSender: process.env.SENDGRID_VERIFIED_SENDER ? true : false,
    recipient: process.env.EMAIL_RECIPIENT ? true : false, // Mantenemos EMAIL_RECIPIENT
  };
};

// Ruta principal de health check
router.get('/', async (req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;
  const emailConfig = checkEmailConfig();
  const memoryUsage = process.memoryUsage();
  const uptime = process.uptime();
  const loadAvg = os.loadavg();

  const healthStatus = {
    status: mongoConnected ? 'OK' : 'ERROR',
    timestamp: new Date().toISOString(),
    dependencies: {
      mongodb: {
        status: mongoConnected ? 'OK' : 'ERROR',
        connectionState: mongoose.connection.readyState,
        message: mongoConnected ? 'Conectado' : 'Desconectado'
      },
      emailService: {
        provider: 'SendGrid',
        status: emailConfig.sendgridApiKey && emailConfig.sendgridVerifiedSender && emailConfig.recipient ? 'CONFIGURED' : 'NOT_CONFIGURED',
        details: emailConfig
      }
    },
    system: {
      uptime: `${Math.floor(uptime / 60 / 60)}h ${Math.floor((uptime / 60) % 60)}m ${Math.floor(uptime % 60)}s`,
      memory: {
        rss: `${(memoryUsage.rss / 1024 / 1024).toFixed(2)} MB`,
        heapTotal: `${(memoryUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`,
        heapUsed: `${(memoryUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
        external: `${(memoryUsage.external / 1024 / 1024).toFixed(2)} MB`,
      },
      cpuLoad: loadAvg,
      hostname: os.hostname(),
      platform: os.platform(),
      arch: os.arch()
    }
  };

  // Siempre devolver 200 OK independientemente del estado de MongoDB
  // para que el health check de ELB funcione correctamente
  res.status(200).json(healthStatus);
});

// Ruta para probar la conexión de email (eliminada o comentada)
/*
router.get('/test-email-connection', async (req, res) => {
  console.log('[Health Check] Iniciando prueba de conexión de email...');

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || 
      !(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)) {
    console.warn('[Health Check] Faltan variables de entorno para prueba de email.');
    return res.status(400).json({
      success: false,
      message: 'Faltan variables de entorno de email para la prueba.',
      missing: {
          host: !process.env.EMAIL_HOST,
          user: !process.env.EMAIL_USER,
          pass: !(process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD)
      }
    });
  }

  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD
      },
      connectionTimeout: 5000 // 5 segundos de timeout
    });

    console.log('[Health Check] Verificando conexión con servidor SMTP...', { 
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || '587',
        secure: process.env.EMAIL_SECURE === 'true',
        user: process.env.EMAIL_USER ? 'Configurado' : 'No configurado',
        pass: (process.env.EMAIL_PASS || process.env.EMAIL_PASSWORD) ? 'Configurado' : 'No configurado' 
    });
    await transporter.verify();
    console.log('[Health Check] Conexión SMTP verificada correctamente.');
    res.status(200).json({ success: true, message: 'Conexión con servidor SMTP verificada.' });
  } catch (error) {
    console.error('[Health Check] Error al verificar conexión SMTP:', error);
    res.status(500).json({ 
        success: false, 
        message: 'Error al verificar la conexión con el servidor SMTP.', 
        error: error.message,
        code: error.code
    });
  }
});
*/

export default router; 