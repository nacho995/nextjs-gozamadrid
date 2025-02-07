const Blog = require('../models/blogSchema'); // Usamos el modelo unificado

const blogController = {
  // Obtiene la lista de blogs para previsualización
  getData: async (req, res) => {
    try {
      // Selecciona solo los campos necesarios para la previsualización.
      // Por ejemplo, no incluimos "content" ni "tags"
      const blogs = await Blog.find().select('title description url author category image readTime button createdAt updatedAt');
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
      const blog = await Blog.findById(id);
      res.json(blog);
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
};

module.exports = blogController;
