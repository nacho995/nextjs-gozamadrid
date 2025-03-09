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

// Ruta específica para subir imágenes
router.post('/upload-image', verifyToken, isAdmin, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: "No se ha subido ningún archivo" });
        }
        
        // Devolver la URL de Cloudinary
        res.status(200).json({ 
            message: "Imagen subida correctamente",
            imageUrl: req.file.path,
            public_id: req.file.filename
        });
    } catch (error) {
        console.error('Error al subir imagen:', error);
        res.status(500).json({ 
            message: "Error al subir la imagen",
            error: error.message 
        });
    }
});

export default router;