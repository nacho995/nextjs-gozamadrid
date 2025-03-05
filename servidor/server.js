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

// Definir los orígenes permitidos
const allowedOrigins = [
  'https://goza-madrid-qbw9.onrender.com', 
  'https://goza-madrid.onrender.com',
  'https://blogsypropiedades.onrender.com', 
  'http://localhost:4000',
  'http://localhost:5173',
  'http://localhost:3000',
  'https://realestategozamadrid.com'  // Añadir el dominio de WordPress
];

// Modificar la configuración CORS para ser más permisiva con recursos estáticos
app.use(cors({
  credentials: true,
  origin: function(origin, callback) {
    // Permitir solicitudes sin origin (como recursos estáticos) o si está en la lista
    if (!origin || allowedOrigins.some(allowed => origin.includes(allowed))) {
      callback(null, true);
    } else {
      console.log('Origen bloqueado por CORS:', origin);
      callback(null, true); // Temporalmente permitir todos los orígenes para debugging
    }
  },
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  optionsSuccessStatus: 204,
  preflightContinue: false,
  exposedHeaders: ['Content-Length', 'Content-Type'] // Permitir estos headers
}));

// Middleware para depurar solicitudes CORS
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  console.log('Origin:', req.headers.origin);
  console.log('Referer:', req.headers.referer);
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

// Configurar headers para recursos estáticos
app.use('/uploads', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Cross-Origin-Resource-Policy', 'cross-origin');
  next();
}, express.static(path.join(__dirname, 'uploads')));

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
    
    // Modificar para escuchar en todas las interfaces
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT} en todas las interfaces`);
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