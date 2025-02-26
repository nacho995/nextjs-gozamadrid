import express from 'express';
import { sendNotification } from '../controller/notificationController.js';

const router = express.Router();

// Si no estás usando autenticación por ahora, puedes quitar el middleware 'protect'
router.post('/contact', sendNotification);

// Cambiamos la forma de exportar
export { router as notificationRouter }; 