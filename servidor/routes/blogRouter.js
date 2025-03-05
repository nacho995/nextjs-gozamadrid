// blogRouter.js
import express from 'express';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';
import blogController from '../controller/blogController.js';
import Blog from '../models/blogSchema.js';
import mongoose from 'mongoose';

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
blogRouter.get("/", async (req, res) => {
  try {
    // Obtener todos los blogs con los campos necesarios
    const blogs = await Blog.find().select('title description author category readTime button image tags createdAt updatedAt');
    
    // Log para verificar que se están obteniendo los blogs
    console.log(`Se encontraron ${blogs.length} blogs en MongoDB`);
    
    // Devolver los blogs
    res.status(200).json(blogs);
  } catch (error) {
    console.error('Error al obtener blogs:', error);
    res.status(500).json({ message: 'Error al obtener blogs', error: error.message });
  }
});
blogRouter.get("/:id", async (req, res) => {
  try {
    // Obtener el blog completo sin filtrar campos
    const blog = await Blog.findById(req.params.id);
    
    if (!blog) {
      return res.status(404).json({ message: 'Blog no encontrado' });
    }
    
    // Log para verificar que los campos están presentes
    console.log('Blog encontrado:', {
      id: blog._id,
      title: blog.title,
      hasContent: !!blog.content,
      contentLength: blog.content ? blog.content.length : 0,
      readTime: blog.readTime
    });
    
    // Devolver el blog completo
    res.status(200).json(blog);
  } catch (error) {
    console.error('Error al obtener blog:', error);
    res.status(500).json({ message: 'Error al obtener blog', error: error.message });
  }
});
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

// Añadir una ruta para actualizar un blog específico
blogRouter.patch("/update-content/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const { content, readTime } = req.body;
    
    // Construir el objeto de actualización
    const updateData = {};
    if (content) updateData.content = content;
    if (readTime) updateData.readTime = readTime;
    
    // Actualizar el blog
    const updatedBlog = await Blog.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    );
    
    if (!updatedBlog) {
      return res.status(404).json({ message: 'Blog no encontrado' });
    }
    
    // Log para verificar la actualización
    console.log('Blog actualizado:', {
      id: updatedBlog._id,
      title: updatedBlog.title,
      hasContent: !!updatedBlog.content,
      contentLength: updatedBlog.content ? updatedBlog.content.length : 0,
      readTime: updatedBlog.readTime
    });
    
    res.status(200).json(updatedBlog);
  } catch (error) {
    console.error('Error al actualizar blog:', error);
    res.status(500).json({ message: 'Error al actualizar blog', error: error.message });
  }
});

// Añadir un endpoint de prueba simple
blogRouter.get("/test", (req, res) => {
  res.status(200).json({ message: "API de blogs funcionando correctamente" });
});

export default blogRouter;
