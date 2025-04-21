import express from 'express';
import cloudinaryController from '../controller/cloudinaryController.js';
import { verifyToken } from '../middlewares/auth.js'; // Aseguramos que solo usuarios autenticados puedan obtener firmas

const cloudinaryRouter = express.Router();

// Endpoint para obtener la firma para subir a Cloudinary
// Usamos GET porque no necesitamos enviar datos en el body para esta operación
cloudinaryRouter.get('/signature', verifyToken, cloudinaryController.generateSignature);

export default cloudinaryRouter; 