import express from 'express';
import { sendNotification } from '../controller/notificationController.js';
import emailConfig from '../config/emailConfig.js';
import mongoose from 'mongoose';

const router = express.Router();

// Ruta para el formulario de contacto
router.post('/contact', sendNotification);

// Cambiamos la forma de exportar
export { router as notificationRouter }; 