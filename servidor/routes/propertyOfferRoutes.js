import express from 'express';
import { sendPropertyOfferNotification } from '../controller/propertyOfferController.js';

const router = express.Router();

// Ruta para crear una nueva oferta
router.post('/create', sendPropertyOfferNotification);
// Añadir la misma ruta con barra final para manejar ambos casos
router.post('/create/', sendPropertyOfferNotification);

export default router; 