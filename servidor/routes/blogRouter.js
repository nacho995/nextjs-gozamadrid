// blogRouter.js
import express from 'express';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import blogController from '../controller/blogController.js';
import Blog from '../models/blogSchema.js';
import mongoose from 'mongoose';
import { verifyToken, isAdmin } from '../middlewares/auth.js';
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
    ],
    // Generar un nombre de archivo único
    public_id: (req, file) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      return `blog-${uniqueSuffix}`;
    }
  }
});

// Middleware de multer con Cloudinary
const upload = multer({ 
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten archivos de imagen'), false);
    }
  }
});

// Rutas CRUD básicas
blogRouter.get("/", blogController.getData);
blogRouter.get("/:id", blogController.getDataById);
blogRouter.post("/", verifyToken, blogController.addData);
blogRouter.delete("/:id", verifyToken, blogController.deleteData);
blogRouter.put("/:id", verifyToken, blogController.updateData);

// Ruta para subir imágenes
blogRouter.post("/upload", verifyToken, upload.single('image'), blogController.uploadImage);

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

// Ruta para actualización específica de contenido
blogRouter.patch("/update-content/:id", blogController.updateBlogContent);

// Ruta de prueba simple
blogRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "API de blogs funcionando correctamente" });
});

// Añadir esta ruta temporal para actualizar todos los blogs sin content
blogRouter.post("/fix-missing-content", async (req, res) => {
  try {
    // Buscar todos los blogs sin content
    const blogsWithoutContent = await Blog.find({ content: { $exists: false } });
    
    console.log(`Encontrados ${blogsWithoutContent.length} blogs sin contenido`);
    
    // Actualizar cada blog para añadir un contenido por defecto
    const updatePromises = blogsWithoutContent.map(blog => {
      return Blog.findByIdAndUpdate(
        blog._id,
        { 
          content: `<p>${blog.description || 'Contenido por defecto'}</p>
                   <p>Este contenido se ha generado automáticamente porque el blog original no tenía contenido.</p>`
        },
        { new: true }
      );
    });
    
    const updatedBlogs = await Promise.all(updatePromises);
    
    res.status(200).json({ 
      message: `Se han actualizado ${updatedBlogs.length} blogs`,
      updatedBlogs: updatedBlogs.map(blog => ({ id: blog._id, title: blog.title }))
    });
  } catch (error) {
    console.error('Error al actualizar blogs sin contenido:', error);
    res.status(500).json({ message: 'Error al actualizar blogs', error: error.message });
  }
});

// Añadir un endpoint para verificar la conexión y el modelo
blogRouter.get("/debug", async (req, res) => {
  try {
    // Verificar que el modelo esté definido correctamente
    console.log('Modelo Blog:', {
      modelName: Blog.modelName,
      collection: Blog.collection.name,
      schema: Object.keys(Blog.schema.paths)
    });
    
    // Contar documentos en la colección
    const count = await Blog.countDocuments();
    console.log(`La colección tiene ${count} documentos`);
    
    // Devolver información de depuración
    res.status(200).json({
      model: {
        name: Blog.modelName,
        collection: Blog.collection.name,
        schemaFields: Object.keys(Blog.schema.paths)
      },
      count,
      connectionState: mongoose.connection.readyState
    });
  } catch (error) {
    console.error('Error en endpoint de depuración:', error);
    res.status(500).json({ message: 'Error en endpoint de depuración', error: error.message });
  }
});

export default blogRouter;
