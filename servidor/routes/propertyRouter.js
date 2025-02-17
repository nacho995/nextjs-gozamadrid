const express = require("express");
const propertyRouter = express.Router();
const path = require("path");
const multer = require("multer");
const propertyController = require("../controller/propertyController");

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

propertyRouter.post("/upload", upload.single('file'), propertyController.uploadImage);

propertyRouter.get("/upload", (req, res) => {
    res.status(405).json({ message: "Método no permitido. Usa POST para subir imágenes." });
  });
  
propertyRouter.get("/", propertyController.getData);
propertyRouter.get("/:id", propertyController.getDataById);
propertyRouter.post("/", propertyController.addData);


propertyRouter.delete("/:id", propertyController.deleteData);
propertyRouter.patch("/:id", propertyController.updateData);

module.exports = propertyRouter;