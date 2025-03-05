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
import { notificationRouter } from './routes/notificationRoutes.js';

// Para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar rutas
import propertyNotificationRoutes from './routes/propertyNotificationRoutes.js';
import prefixRouter from "./routes/routerPrefix.js";
import blogRouter from "./routes/blogRouter.js";
import userRouter from "./routes/userContentRouter.js";
import propertyRoutes from './routes/propertyRoutes.js';
import propertyOfferRoutes from './routes/propertyOfferRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

// Configuración CORS más permisiva para desarrollo
app.use(cors({
  origin: '*',  // En producción, restringe esto a dominios específicos
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  credentials: true,
  optionsSuccessStatus: 200
}));

// Middleware para depurar solicitudes
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  console.log('Headers:', req.headers);
  next();
});

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
app.use('/api', notificationRouter);
app.use("/prefix", prefixRouter);
app.use("/blog", blogRouter);
app.use("/user", userRouter);
app.use('/property', propertyRoutes);
app.use('/api/property-notification', propertyNotificationRoutes);
app.use('/api/property-offer', propertyOfferRoutes); 

// Añadir esta línea para servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Añadir un middleware para verificar que las solicitudes llegan al servidor
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Headers:', JSON.stringify(req.headers));
  next();
});

// Añadir una ruta de prueba en la raíz
app.get('/', (req, res) => {
  res.status(200).json({ message: 'Servidor funcionando correctamente' });
});

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('Conectado a MongoDB');
    console.log('URI de conexión:', process.env.MONGODB_URI.replace(/mongodb\+srv:\/\/([^:]+):[^@]+@/, 'mongodb+srv://$1:****@')); // Oculta la contraseña
    app.listen(PORT, () => {
      console.log(`Servidor corriendo en puerto ${PORT}`);
    });

    // Añadir un log para verificar la conexión a MongoDB
    mongoose.connection.on('connected', () => {
      console.log('Conectado a MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Error de conexión a MongoDB:', err);
    });
  })
  .catch(err => {
    console.error('Error al conectar a MongoDB:', err);
  });

// Middleware para logging de errores
app.use((err, req, res, next) => {
  console.error('Error en el servidor:', err);
  console.error('Stack trace:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Error interno del servidor',
    stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});