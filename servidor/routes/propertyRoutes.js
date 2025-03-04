import express from 'express';
import propertyController from '../controller/propertyController.js';
import Property from '../models/propertySchema.js';

const router = express.Router();

// Rutas principales de propiedades
router.get('/getAllProperties', propertyController.getAllProperties);
router.get('/:id', propertyController.getDataById);
router.get('/', propertyController.getData);
router.post('/', propertyController.addData);
router.put('/:id', propertyController.updateData);
router.delete('/:id', propertyController.deleteData);

// Ruta específica para obtener propiedad por ID
router.get('/:id', propertyController.getPropertyById);

export default router;