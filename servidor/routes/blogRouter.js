// blogRouter.js
import express from 'express';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import blogController from '../controller/blogController.js';

const blogRouter = express.Router();

// Configurar el storage para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'blog',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [
      { width: 1920, height: 1080, crop: 'limit' },
      { quality: 'auto' }
    ]
  }
});

// Middleware de multer con Cloudinary
const upload = multer({ storage: storage });

// Rutas para el blog
blogRouter.get("/", blogController.getData);
blogRouter.get("/:id", blogController.getDataById);
blogRouter.post("/", blogController.addData);
blogRouter.delete("/:id", blogController.deleteData);
blogRouter.patch("/:id", blogController.updateData);

// Rutas para subir imágenes
blogRouter.post("/upload", upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No se ha subido ningún archivo" });
    }
    
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

// Ruta para eliminar una imagen
blogRouter.delete("/delete-image", async (req, res) => {
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

export default blogRouter;
