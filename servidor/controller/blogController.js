import Blog from '../models/blogSchema.js';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import mongoose from 'mongoose';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const blogController = {
    // Obtiene la lista de blogs para previsualización
    getData: async (req, res) => {
        try {
            // Selecciona solo los campos necesarios para la previsualización.
            // Por ejemplo, no incluimos "content"
            const blogs = await Blog.find().select('title description author category readTime button images tags createdAt updatedAt');
            res.json(blogs);
        } catch (err) {
            console.log("Error fetching blogs:", err);
            res.status(500).json({ message: "No se pudieron obtener los blogs" });
        }
    },

    // Obtiene el blog completo por su ID
    getDataById: async (req, res) => {
        try {
            const { id } = req.params;
            console.log("Buscando blog por ID:", id);
            
            // Validar que el ID tenga formato válido de MongoDB
            if (!mongoose.Types.ObjectId.isValid(id)) {
                console.log("ID inválido:", id);
                return res.status(400).json({ message: "ID de blog inválido" });
            }
            
            // Buscar el blog incluyendo explícitamente todos los campos
            const foundBlog = await Blog.findById(id).lean();
            
            if (!foundBlog) {
                console.log("Blog no encontrado con ID:", id);
                return res.status(404).json({ message: "Blog no encontrado" });
            }
            
            // Verificación del contenido del documento
            console.log("===== DOCUMENTO DE MONGODB =====");
            console.log('ID:', id);
            console.log('Campos en documento:', Object.keys(foundBlog));
            console.log('Content existe:', 'content' in foundBlog);
            console.log('Content value:', foundBlog.content);
            console.log('Content type:', typeof foundBlog.content);
            console.log('===============================');
            
            // Enviar el documento como JSON
            res.json(foundBlog);
        } catch (err) {
            console.log("Error fetching blog by ID:", err);
            res.status(500).json({ message: "No se pudo obtener el blog" });
        }
    },

    // Agrega un nuevo blog (se espera que req.body incluya todos los campos, incluido content y tags)
    addData: async (req, res) => {
        try {
            console.log('Datos recibidos en addData:', JSON.stringify(req.body, null, 2));
            console.log('Imagen principal recibida:', req.body.image);
            console.log('Array de imágenes recibido:', req.body.images);
            
            // Validar campos requeridos
            if (!req.body.title || !req.body.description || !req.body.content) {
                return res.status(400).json({ 
                    message: "Faltan campos requeridos", 
                    required: ['title', 'description', 'content'] 
                });
            }

            // Procesar imágenes
            let processedImages = [];

            // Procesar imagen principal si existe
            if (req.body.image) {
                console.log('Procesando imagen principal:', req.body.image);
                if (typeof req.body.image === 'string') {
                    processedImages.push({
                        src: req.body.image,
                        alt: req.body.title
                    });
                } else if (req.body.image.src) {
                    processedImages.push({
                        src: req.body.image.src,
                        alt: req.body.image.alt || req.body.title
                    });
                }
                console.log('Imagen principal procesada:', processedImages);
            }

            // Procesar array de imágenes adicionales
            if (req.body.images && Array.isArray(req.body.images)) {
                console.log('Procesando array de imágenes:', req.body.images);
                const additionalImages = req.body.images
                    .filter(img => {
                        if (typeof img === 'string') {
                            return img.trim() !== '' && 
                                   (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:image'));
                        }
                        return img && img.src && typeof img.src === 'string';
                    })
                    .map(img => {
                        if (typeof img === 'string') {
                            return {
                                src: img,
                                alt: req.body.title
                            };
                        }
                        return {
                            src: img.src,
                            alt: img.alt || req.body.title
                        };
                    });
                
                console.log('Imágenes adicionales procesadas:', additionalImages);
                
                // Añadir imágenes adicionales que no estén duplicadas
                additionalImages.forEach(img => {
                    if (!processedImages.some(existingImg => existingImg.src === img.src)) {
                        processedImages.push(img);
                    }
                });
            }

            console.log('Array final de imágenes procesadas:', processedImages);

            // Crear el objeto del blog
            const blogData = {
                ...req.body,
                images: processedImages,
                author: req.body.author || user?.name || 'Anónimo',
                category: req.body.category || 'General',
                tags: Array.isArray(req.body.tags) ? req.body.tags : [],
                readTime: req.body.readTime || "5"
            };

            // Eliminar el campo image antiguo si existe
            delete blogData.image;

            console.log('Datos finales del blog antes de guardar:', JSON.stringify(blogData, null, 2));

            // Crear y guardar el blog
            const newBlog = new Blog(blogData);
            const savedBlog = await newBlog.save();

            console.log('Blog guardado:', JSON.stringify(savedBlog, null, 2));
            
            res.json({ 
                message: "Blog agregado exitosamente",
                blog: savedBlog
            });
        } catch (err) {
            console.error("Error al agregar blog:", err);
            res.status(500).json({ 
                message: "No se pudo agregar el blog", 
                error: err.message,
                stack: err.stack 
            });
        }
    },

    // Elimina un blog por su ID
    deleteData: async (req, res) => {
        try {
            await Blog.findByIdAndDelete(req.params.id);
            res.json({ message: "Blog eliminado" });
        } catch (err) {
            console.log("Error deleting blog:", err);
            res.status(500).json({ message: "No se pudo eliminar el blog" });
        }
    },

    // Actualiza un blog por su ID
    updateData: async (req, res) => {
        try {
            console.log('Datos recibidos en updateData:', req.body);
            
            // Procesar las imágenes
            let processedImages = [];

            // Procesar imagen principal si existe
            if (req.body.image) {
                if (typeof req.body.image === 'string') {
                    processedImages.push({
                        src: req.body.image,
                        alt: req.body.title
                    });
                } else if (req.body.image.src) {
                    processedImages.push({
                        src: req.body.image.src,
                        alt: req.body.image.alt || req.body.title
                    });
                }
            }

            // Procesar array de imágenes adicionales
            if (req.body.images && Array.isArray(req.body.images)) {
                const additionalImages = req.body.images
                    .filter(img => {
                        if (typeof img === 'string') {
                            return img.trim() !== '' && 
                                   (img.startsWith('http') || img.startsWith('/') || img.startsWith('data:image'));
                        }
                        return img && img.src && typeof img.src === 'string';
                    })
                    .map(img => {
                        if (typeof img === 'string') {
                            return {
                                src: img,
                                alt: req.body.title
                            };
                        }
                        return {
                            src: img.src,
                            alt: img.alt || req.body.title
                        };
                    });
                
                // Añadir imágenes adicionales que no estén duplicadas
                additionalImages.forEach(img => {
                    if (!processedImages.some(existingImg => existingImg.src === img.src)) {
                        processedImages.push(img);
                    }
                });
            }

            const updateData = {
                ...req.body,
                images: processedImages
            };

            // Eliminar el campo image antiguo si existe
            delete updateData.image;

            const updatedBlog = await Blog.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true }
            );

            if (!updatedBlog) {
                return res.status(404).json({ message: "Blog no encontrado" });
            }

            res.json({ 
                message: "Blog actualizado",
                blog: updatedBlog
            });
        } catch (err) {
            console.error("Error updating blog:", err);
            res.status(500).json({ message: "No se pudo actualizar el blog", error: err.message });
        }
    },

    uploadImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se subió ninguna imagen" });
            }
            console.log("Archivo recibido:", req.file);

            // Obtener la URL de Cloudinary
            const imageUrl = req.file.path;
            console.log("URL de la imagen:", imageUrl);

            // Devolver la respuesta con la URL de la imagen
            res.status(200).json({ 
                success: true,
                message: "Imagen subida correctamente",
                imageUrl: imageUrl,
                url: imageUrl, // Para compatibilidad
                secure_url: imageUrl.replace('http://', 'https://'),
                public_id: req.file.filename
            });
        } catch (err) {
            console.error("Error al subir imagen:", err);
            res.status(500).json({ 
                success: false,
                message: "Error al subir la imagen",
                error: err.message 
            });
        }
    },

    // Añadir una función para actualizar el blog existente
    updateBlogContent: async (req, res) => {
        try {
            const { id } = req.params;
            const { content } = req.body;
            
            if (!content) {
                return res.status(400).json({ message: 'El contenido es obligatorio' });
            }
            
            const updatedBlog = await Blog.findByIdAndUpdate(
                id,
                { content },
                { new: true }
            );
            
            if (!updatedBlog) {
                return res.status(404).json({ message: 'Blog no encontrado' });
            }
            
            res.status(200).json(updatedBlog);
        } catch (error) {
            console.error('Error al actualizar el contenido del blog:', error);
            res.status(500).json({ message: 'Error al actualizar el blog', error: error.message });
        }
    }
};

export default blogController;
