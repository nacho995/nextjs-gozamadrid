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
      'https://blogs.realestategozamadrid.com',
      'http://blogs.realestategozamadrid.com',
      'https://subir.realestategozamadrid.com',
      'https://nextjs-gozamadrid-qrfk.onrender.com',
      'https://gozamadrid-backend-778f.onrender.com',
      'https://api.realestategozamadrid.com',
      'https://backend.realestategozamadrid.com',
      'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
      'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
      'https://gozamadrid.pages.dev',
      'https://*.gozamadrid.pages.dev',
      'https://gozamadrid-frontend.pages.dev',
      'https://gozamadrid-frontend-hzb50dzj9-nacho995s-projects.vercel.app',
      'http://localhost:3000',
      'http://localhost:5174'
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

// Configuración// <<< CORS >>>  
app.use(cors({
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      // Permitir todas las solicitudes sin origen (en desarrollo, las llamadas directas a la API, etc.)
      if (!origin) return callback(null, true);
      
      // Comprobar patrón de wildcard
      const wildcardOrigin = allowedOrigins.find(allowed => {
        if (allowed.includes('*')) {
          const prefix = allowed.split('*')[0];
          return origin.indexOf(prefix) === 0;
        }
        return false;
      });
      
      if (wildcardOrigin) {
        return callback(null, true);
      }
      
      // En modo desarrollo, permitir todos los orígenes
      if (process.env.NODE_ENV === 'development') {
        return callback(null, true);
      }
      
      console.log(`Origin bloqueado: ${origin}`);
      return callback(null, true); // Temporalmente permitir todos los orígenes mientras solucionamos el problema
    }
    callback(null, true);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token', 'Cache-Control', 'X-Requested-With', 'Cache-Control', 'cache-control', 'Accept', 'Accept-Version', 'Content-Length', 'Content-MD5', 'Date', 'X-Api-Version', 'Pragma', 'Expires'],
  exposedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires']
}));

// Middleware específico para manejar peticiones OPTIONS
app.options('*', (req, res) => {
  // Establecer los encabezados CORS manualmente para asegurarnos que funcionan los preflight
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cache-Control, cache-control, Accept, Accept-Version, Content-Length, Content-MD5, Date, X-Api-Version, Origin, X-Requested-With');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

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
app.use('/api/user', userRouter);
app.use('/api/cloudinary', cloudinaryRouter);

// Rutas específicas para ofertas y visitas de propiedades
app.use('/api/property-visit', propertyVisitRoutes);
app.use('/api/property-offer', propertyOfferRoutes);

// Rutas para health check y monitoreo
app.use('/api/health', healthRoutes);

// Ruta de prueba para el formulario de contacto
app.post('/api/test-contact', (req, res) => {
  console.log('[TEST-CONTACT] Recibida petición de prueba');
  console.log('[TEST-CONTACT] Headers:', JSON.stringify(req.headers));
  console.log('[TEST-CONTACT] Body:', JSON.stringify(req.body));
  return res.status(200).json({
    success: true,
    message: 'Prueba exitosa',
    receivedBody: req.body
  });
});

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
const connectDB = async () => {
  const mongoUri = process.env.MONGODB_URI;
  if (!mongoUri) {
    console.error('Error: MONGODB_URI no está definida en las variables de entorno.');
    process.exit(1);
  }

  // Opciones de conexión actualizadas para Mongoose 8.x
  const options = {
    serverSelectionTimeoutMS: 5000, // Timeout si no se puede seleccionar servidor
    socketTimeoutMS: 45000, // Cerrar sockets después de 45 segundos de inactividad
    // keepAlive y keepAliveInitialDelay ya no son compatibles con Mongoose 8.x
  };

  // Manejadores de eventos de conexión de Mongoose
  mongoose.connection.on('connected', () => {
    console.log('Mongoose conectado a la DB');
    // Imprimir información sobre la conexión
    console.log(`MongoDB conectado a: ${mongoose.connection.host}`);
  });

  mongoose.connection.on('error', (err) => {
    console.error('Error de conexión de Mongoose:', err);
  });

  mongoose.connection.on('disconnected', () => {
    console.log('Mongoose desconectado');
    // Intentar reconectar automáticamente después de una desconexión
    console.log('Intentando reconectar a MongoDB...');
    
    // Evitar múltiples intentos de reconexión simultáneos
    if (!mongoose.connection.readyState) {
      setTimeout(async () => {
        try {
          await mongoose.connect(mongoUri, options);
          console.log('Reconexión a MongoDB exitosa');
        } catch (err) {
          console.error('Error al intentar reconectar a MongoDB:', err);
        }
      }, 5000); // Intentar reconectar después de 5 segundos
    }
  });
  
  mongoose.connection.on('close', () => {
     console.log('Conexión de Mongoose cerrada');
  });

  try {
    console.log('Intentando conectar a MongoDB...');
    await mongoose.connect(mongoUri, options);
    // La conexión fue exitosa si llegamos aquí (el evento 'connected' también se disparará)
    
    // Iniciar el servidor solo después de conectar a la base de datos
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Servidor corriendo en puerto ${PORT} en todas las interfaces`);
    });

  } catch (err) {
    console.error('Error inicial al conectar a MongoDB:', err);
    // Salir del proceso si la conexión inicial falla
    // Damos un pequeño margen antes de salir por si es un error temporal
    setTimeout(() => process.exit(1), 1000);
  }
};

// Llamar a la función para conectar a la base de datos e iniciar el servidor
connectDB();

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

// <<< LOG PERIÓDICO DE VIDA (COMENTADO) >>>
/*
setInterval(() => {
  console.log('<<<<< SERVER HEARTBEAT >>>>> - ', new Date().toISOString());
}, 5000); // Loguea cada 5 segundos
*/

console.log('<<<<< END OF server.js SCRIPT EXECUTION >>>>>');
// <<< FIN LOG PERIÓDICO >>>