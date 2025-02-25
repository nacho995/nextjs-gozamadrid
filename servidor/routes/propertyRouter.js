import express from 'express';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import propertyController from '../controller/propertyController.js';

const propertyRouter = express.Router();

// Configurar el storage para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'properties', // Subcarpeta para propiedades
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' }, // Tamaño máximo
      { quality: 'auto' } // Optimización automática
    ]
  }
});

// Middleware de multer con Cloudinary
const upload = multer({ storage: storage });

// Ruta para subir una sola imagen
propertyRouter.post("/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }
    
    // req.file.path contendrá la URL de Cloudinary
    res.status(200).json({ 
      message: "Imagen subida correctamente",
      imageUrl: req.file.path
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al subir la imagen",
      error: error.message 
    });
  }
});

// Ruta para subir múltiples imágenes
propertyRouter.post("/upload-multiple", upload.array('files', 10), async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No se han subido archivos" });
    }

    const imageUrls = req.files.map(file => file.path);
    
    res.status(200).json({ 
      message: "Imágenes subidas correctamente",
      imageUrls: imageUrls
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al subir las imágenes",
      error: error.message 
    });
  }
});

// Ruta para eliminar una imagen de Cloudinary
propertyRouter.delete("/delete-image", async (req, res) => {
  try {
    const { public_id } = req.body;
    if (!public_id) {
      return res.status(400).json({ message: "Se requiere el public_id de la imagen" });
    }

    const result = await cloudinary.v2.uploader.destroy(public_id);
    res.status(200).json({ 
      message: "Imagen eliminada correctamente",
      result 
    });
  } catch (error) {
    res.status(500).json({ 
      message: "Error al eliminar la imagen",
      error: error.message 
    });
  }
});

// Rutas existentes
propertyRouter.get("/", propertyController.getData);
propertyRouter.get("/:id", propertyController.getDataById);
propertyRouter.post("/", propertyController.addData);
propertyRouter.delete("/:id", propertyController.deleteData);
propertyRouter.patch("/:id", propertyController.updateData);

export default propertyRouter;