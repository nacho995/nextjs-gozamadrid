// Importaciones
import dotenv from 'dotenv';
import cors from 'cors';
import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import multer from 'multer';

// Para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar rutas (convertir a import)
import dataClientRouter from "./routes/router.js";
import prefixRouter from "./routes/routerPrefix.js";
import blogRouter from "./routes/blogRouter.js";
import userRouter from "./routes/userContentRouter.js";
import propertyRouter from "./routes/propertyRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middlewares
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use(express.json());
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));

// Configuración de Cloudinary
cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET
});

// Configurar el storage para Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary.v2,
  params: {
    folder: 'GozaMadrid',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }]
  }
});

// Crear el middleware de multer
const upload = multer({ storage: storage });

// Rutas
app.use("/emails", dataClientRouter);
app.use("/prefix", prefixRouter);
app.use("/blog", blogRouter);
app.use("/user", userRouter);
app.use("/property", propertyRouter);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Connected to BBDD"))
  .catch(error => console.log("Error trying to connect to BBDD:", error));

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
}); 