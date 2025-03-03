import express from 'express';
import { createPropertyOffer } from '../controller/propertyOfferController.js';

const router = express.Router();

// Ruta para crear una nueva oferta
router.post('/create', createPropertyOffer);

export default router; 