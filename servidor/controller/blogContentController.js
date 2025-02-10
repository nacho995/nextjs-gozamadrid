const blog = require('../models/blogContentSchema');
const { getDataById } = require('./blogController');

const blogControllerContent = { 
  getData: async (req, res) => {
    try {
      // ¡Atención! Aquí usas "Blog.find()", pero solo has importado "blog"
      // Debe usarse "blog.find()" si la variable importada se llama "blog".
      const response = await blog.find(); 
      res.json(response);
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: "No blog getted" });
    }
  },
  getDataById: async (req, res) => {
    try {
      const { id } = req.params;
      const response = await blog.findById(id);
      res.json(response);
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: "No blog getted" });
    }
  },
  deleteData: async (req, res) => {
    try {
      await blog.findByIdAndDelete(req.params.id);
      res.json({ message: "Blog deleted" });
    } catch (err) {
      console.log("Error:", err);
      res.status(500).json({ message: "No blog deleted" });
    }
  },
};

module.exports = blogControllerContent;
