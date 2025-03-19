import express from 'express';
import { sendPropertyNotification } from '../controller/propertyNotificationController.js';

const router = express.Router();

// Ruta para crear una nueva visita
router.post('/create', sendPropertyNotification);
// Añadir la misma ruta con barra final para manejar ambos casos
router.post('/create/', sendPropertyNotification);

export default router; 