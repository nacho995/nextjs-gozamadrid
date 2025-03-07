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
            // Por ejemplo, no incluimos "content" ni "tags"
            const blogs = await Blog.find().select('title description author category readTime button image tags createdAt updatedAt');
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
            const newBlog = new Blog(req.body);
            await newBlog.save();
            res.json({ message: "Blog agregado" });
        } catch (err) {
            console.log("Error adding blog:", err);
            res.status(500).json({ message: "No se pudo agregar el blog" });
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
            await Blog.findByIdAndUpdate(req.params.id, req.body);
            res.json({ message: "Blog actualizado" });
        } catch (err) {
            console.log("Error updating blog:", err);
            res.status(500).json({ message: "No se pudo actualizar el blog" });
        }
    },

    uploadImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se subió ninguna imagen" });
            }

            const imageUrl = `${req.protocol}://${req.get('host')}/uploads/${req.file.filename}`;
            res.json({ imageUrl });
        } catch (err) {
            console.log("Error uploading image:", err);
            res.status(500).json({ message: "No se pudo subir la imagen" });
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
