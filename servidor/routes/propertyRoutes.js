import express from 'express';
import propertyController from '../controller/propertyController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Rutas públicas
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, isAdmin, upload.array('images', 10), propertyController.createProperty);
router.put('/:id', verifyToken, isAdmin, upload.array('images', 10), propertyController.updateProperty);
router.delete('/:id', verifyToken, isAdmin, propertyController.deleteProperty);

export default router;