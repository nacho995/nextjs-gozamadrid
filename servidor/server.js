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
import { notificationRouter } from './routes/notificationRoutes.js';  // Importación nombrada
import propertyNotificationRoutes from './routes/propertyNotificationRoutes.js';


// Para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar rutas (convertir a import)
import prefixRouter from "./routes/routerPrefix.js";
import blogRouter from "./routes/blogRouter.js";
import userRouter from "./routes/userContentRouter.js";
import propertyRouter from "./routes/propertyRouter.js";

dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Lista de dominios permitidos
const allowedOrigins = [
    'https://goza-madrid-qbw9.onrender.com',  // Tu dominio de frontend en producción
    'http://localhost:3000',                   // Para desarrollo local
    'http://localhost:3001'                    // Para desarrollo local
];

// Configuración CORS
app.use(cors({
    origin: function(origin, callback) {
        // Permitir peticiones sin origin (como las peticiones mobile o postman)
        if (!origin) return callback(null, true);
        
        if (allowedOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('No permitido por CORS'));
        }
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true
}));

app.use(express.json());

// Middleware para debugging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

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
app.use("/property-notification", propertyRouter);
app.use('/api', notificationRouter);
app.use("/prefix", prefixRouter);
app.use("/blog", blogRouter);
app.use("/user", userRouter);
app.use("/property", propertyRouter);
app.use('/api/property-notification', propertyNotificationRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to BBDD"))
  .catch(error => console.log("Error trying to connect to BBDD:", error));

// Manejador de errores
app.use((err, req, res, next) => {
    console.error('Error en el servidor:', err);
    res.status(500).json({
        success: false,
        message: err.message || 'Error interno del servidor'
    });
});

// Iniciar servidor
app.listen(port, () => {
  console.log(`Server running in http://localhost:${port}`);
}); 