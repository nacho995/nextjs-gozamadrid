import express from 'express';
import { sendPropertyNotification } from '../controller/propertyNotificationController.js';

const router = express.Router();

// Ruta para crear una nueva visita
router.post('/create', sendPropertyNotification);

export default router; 