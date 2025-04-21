// Importaciones
import dotenv from 'dotenv';
// Cargar variables de entorno primero
dotenv.config();

// Cargar configuración de correo (debe estar después de dotenv.config y antes de otros imports)

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
import process from 'process'; // Asegúrate de importar process

// Para usar __dirname en ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Importar rutas
import propertyVisitRoutes from './routes/propertyVisitRoutes.js';
import prefixRouter from "./routes/routerPrefix.js";
import blogRouter from "./routes/blogRouter.js";
import userRouter from "./routes/userContentRouter.js";
import propertyRoutes from './routes/propertyRoutes.js';
import propertyOfferRoutes from './routes/propertyOfferRoutes.js';
import healthRoutes from './routes/healthRoutes.js';
import cloudinaryRouter from './routes/cloudinaryRouter.js';
import { sendContactEmail, testEmail } from './controller/contactController.js';

// <<< MANEJADORES GLOBALES DE ERRORES >>>
process.on('uncaughtException', (err, origin) => {
  console.error('<<<<< UNCAUGHT EXCEPTION >>>>>');
  console.error('Error:', err);
  console.error('Origin:', origin);
  console.error('Stack:', err.stack);
  // Considera cerrar el proceso limpiamente aquí si es necesario,
  // pero para depuración, solo loguearlo puede ser suficiente inicialmente.
  // process.exit(1); 
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('<<<<< UNHANDLED REJECTION >>>>>');
  console.error('Reason:', reason);
  console.error('Promise:', promise);
  // Es común loguear el error y quizás cerrar, dependiendo de la criticidad.
});
// <<< FIN MANEJADORES GLOBALES DE ERRORES >>>

const app = express();
const PORT = process.env.PORT || 8081;

// Configurar CORS con opciones avanzadas
const allowedOrigins = process.env.CORS_ORIGIN 
  ? process.env.CORS_ORIGIN.split(',') 
  : [
      'https://realestategozamadrid.com',
      'http://realestategozamadrid.com',
      'https://www.realestategozamadrid.com',
      'http://www.realestategozamadrid.com',
      'https://blog.realestategozamadrid.com',
      'http://blog.realestategozamadrid.com',
      'https://subir.realestategozamadrid.com',
      'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
      'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
      'https://gozamadrid.pages.dev',
      'https://*.gozamadrid.pages.dev',
      'https://gozamadrid-frontend.pages.dev',
      'https://gozamadrid-frontend-hzb50dzj9-nacho995s-projects.vercel.app',
      'http://localhost:3000'
    ];

// Middleware para normalizar rutas (eliminar barras finales)
app.use((req, res, next) => {
  if (req.path.length > 1 && req.path.endsWith('/')) {
    // Mantener la ruta original para que las rutas con barra final también funcionen
    next();
  } else {
    next();
  }
});

// Configuración de CORS
app.use(cors({
  origin: function(origin, callback) {
    // Permitir solicitudes sin origen (como aplicaciones móviles o curl)
    if (!origin) return callback(null, true);
    
    // Verificar si el origen está en la lista de permitidos
    if (allowedOrigins.indexOf(origin) !== -1 || allowedOrigins.includes('*')) {
      callback(null, true);
    } else {
      console.warn(`Origen bloqueado por CORS: ${origin}`);
      callback(null, true); // Permitir todos los orígenes en producción por ahora
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Origin', 'X-Requested-With']
}));

// <<< LOG INICIAL >>>
app.use((req, res, next) => {
  console.log(`[SERVER ENTRY] ${req.method} ${req.url}`);
  next();
});

// Middleware para parsear JSON
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Middleware para logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

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
const upload = multer({ 
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }
});

// <<< LOG ANTES DE ROUTER >>>
app.use((req, res, next) => {
  if (req.url.startsWith('/api/properties')) {
    console.log(`[BEFORE PROPERTY ROUTER] ${req.method} ${req.url}`);
  }
  next();
});

// Rutas
app.use('/api/properties', propertyRoutes);
app.use('/api', notificationRouter);
app.use("/prefix", prefixRouter);
app.use("/api/blogs", blogRouter);
app.use("/user", userRouter);
app.use('/api/cloudinary', cloudinaryRouter);

// Rutas específicas para ofertas y visitas de propiedades
app.use('/api/property-visit', propertyVisitRoutes);
app.use('/api/property-offer', propertyOfferRoutes);

// Rutas para health check y monitoreo
app.use('/api/health', healthRoutes);

// Ruta especial para el formulario de contacto
app.post('/api/contact', sendContactEmail);
// Añadir la misma ruta con barra final para manejar ambos casos
app.post('/api/contact/', sendContactEmail);

// Ruta de prueba para el envío de correos
app.post('/api/test-email', testEmail);

// Middleware para manejar rutas con barra final o sin ella
app.use((req, res, next) => {
  // Verificar si la ruta termina con una barra y no es la raíz
  if (req.path.length > 1 && req.path.endsWith('/')) {
    // Redirigir a la misma ruta sin la barra final
    const newPath = req.path.slice(0, -1);
    console.log(`Redirigiendo de ${req.path} a ${newPath}`);
    req.url = newPath + req.url.slice(req.path.length);
  }
  next();
});

// Middleware para manejar rutas específicas que causan problemas
app.use((req, res, next) => {
  // Verificar si la URL contiene property-visit o property-offer
  if (req.url.includes('/api/property-visit') || req.url.includes('/api/property-offer')) {
    console.log('URL original:', req.url);
    
    // Normalizar la ruta para property-visit
    if (req.url.includes('/api/property-visit')) {
      req.url = req.url.replace(/\/api\/property-visit\/create\/?.*/, '/api/property-visit/create');
    }
    
    // Normalizar la ruta para property-offer
    if (req.url.includes('/api/property-offer')) {
      req.url = req.url.replace(/\/api\/property-offer\/create\/?.*/, '/api/property-offer/create');
    }
    
    console.log('URL normalizada:', req.url);
  }
  next();
});

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