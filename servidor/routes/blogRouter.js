// blogRouter.js
const express = require("express");
const blogRouter = express.Router();
const path = require("path");
const multer = require("multer");
const blogController = require("../controller/blogController");

// Configuración de Multer para almacenar archivos en la carpeta 'uploads'
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      // Asegúrate de que esta ruta exista y sea correcta
      cb(null, path.join(__dirname, '../uploads'));
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      cb(null, uniqueSuffix + '-' + file.originalname);
    }
  });
const upload = multer({ storage: storage });

blogRouter.post("/upload", upload.single('file'), blogController.uploadImage);

blogRouter.get("/upload", (req, res) => {
    res.status(405).json({ message: "Método no permitido. Usa POST para subir imágenes." });
  });
  
blogRouter.get("/", blogController.getData);
blogRouter.get("/:id", blogController.getDataById);
blogRouter.post("/", blogController.addData);


blogRouter.delete("/:id", blogController.deleteData);
blogRouter.patch("/:id", blogController.updateData);

module.exports = blogRouter;
