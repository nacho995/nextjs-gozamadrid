import express from 'express';
import propertyController from '../controller/propertyController.js';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
import upload from '../config/multer.js';

const router = express.Router();

// Rutas públicas
router.get('/', propertyController.getAllProperties);
router.get('/:id', propertyController.getPropertyById);

// Ruta específica para MongoDB
router.get('/sources/mongodb', propertyController.getAllProperties);

// Rutas protegidas (requieren autenticación)
router.post('/', verifyToken, isAdmin, propertyController.createProperty);
router.put('/:id', verifyToken, isAdmin, propertyController.updateProperty);
router.delete('/:id', verifyToken, isAdmin, propertyController.deleteProperty);

// Ruta específica para subir imágenes
router.post('/upload-image', verifyToken, isAdmin, upload.single('image'), propertyController.uploadImage);

export default router;