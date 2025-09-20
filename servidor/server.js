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
const defaultOrigins = [
    'http://localhost:3000',
    'http://localhost:5173',
    'http://localhost:5174',
    'http://localhost:5175',
    'https://blogs.realestategozamadrid.com',
    'https://realestategozamadrid.com',
    'https://www.realestategozamadrid.com',
    'https://nextjs-gozamadrid-qrfk.onrender.com', // Backend en Render
    'https://api.realestategozamadrid.com' // Mantener como fallback
];

const allowedOrigins = process.env.CORS_ORIGIN ? process.env.CORS_ORIGIN.split(',') : defaultOrigins;

const corsOptions = {
    origin: function (origin, callback) {
        console.log(`🔍 CORS Check: Origin recibido: "${origin}"`);
        console.log('🔍 CORS Check: Allowed origins:', allowedOrigins);
        
        // Permitir requests sin origin (como desde aplicaciones móviles)
        if (!origin) {
            console.log(`✅ CORS: Request sin origin permitido`);
            callback(null, true);
            return;
        }
        
        // Verificar si el origin está en la lista permitida
        if (allowedOrigins.indexOf(origin) !== -1) {
            console.log(`✅ CORS: Origin ${origin} permitido`);
            callback(null, true);
            return;
        }
        
        // Para debug en producción, permitir temporalmente todos los orígenes de realestategozamadrid
        if (origin.includes('realestategozamadrid.com')) {
            console.log(`✅ CORS: Origin ${origin} permitido (dominio realestategozamadrid)`);
            callback(null, true);
            return;
        }
        
        console.error(`❌ CORS error: Origin ${origin} not allowed.`);
        console.log('Allowed origins:', allowedOrigins);
        // En lugar de enviar un error, rechazar silenciosamente
        callback(null, false);
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: [
        'Content-Type', 
        'Authorization', 
        'X-Requested-With', 
        'Cache-Control', 
        'Pragma', 
        'Expires',
        'Accept',
        'Origin',
        'X-CSRF-Token'
    ],
    exposedHeaders: [
        'Content-Type', 
        'Authorization', 
        'Cache-Control', 
        'Pragma', 
        'Expires',
        'X-Total-Count'
    ],
    optionsSuccessStatus: 200 // Para soportar navegadores legacy
};

app.use(cors(corsOptions));
// Habilitar pre-flight para todas las rutas
app.options('*', cors(corsOptions));

// Middleware adicional para manejar CORS manualmente si es necesario
app.use((req, res, next) => {
    const origin = req.headers.origin;
    
    // Log para debugging
    console.log(`🔍 CORS Middleware: ${req.method} ${req.url} from origin: ${origin || 'null'}`);
    
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
        console.log(`✅ CORS Header set for origin: ${origin}`);
    } else if (!origin) {
        // Para requests sin origin (como desde Postman o aplicaciones móviles)
        res.header('Access-Control-Allow-Origin', '*');
        console.log('✅ CORS Header set to * for no-origin request');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Cache-Control,Pragma,Expires,Accept,Origin,X-CSRF-Token');
    
    if (req.method === 'OPTIONS') {
        console.log('🔄 Handling OPTIONS preflight request');
        res.sendStatus(200);
    } else {
        next();
    }
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

// Middleware específico para rutas de usuario (login)
app.use('/api/user', (req, res, next) => {
    console.log(`🔐 User route middleware: ${req.method} ${req.url}`);
    
    // Asegurar headers de CORS para rutas de usuario
    const origin = req.headers.origin;
    if (origin && allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    } else {
        res.header('Access-Control-Allow-Origin', '*');
    }
    
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type,Authorization,X-Requested-With,Cache-Control,Pragma,Expires,Accept,Origin,X-CSRF-Token');
    
    if (req.method === 'OPTIONS') {
        console.log('🔄 User route OPTIONS handled');
        return res.sendStatus(200);
    }
    
    next();
});

// Middleware específico para rutas de usuario con CORS mejorado
app.use('/api/user', (req, res, next) => {
    console.log(`🔐 User API: ${req.method} ${req.url} from origin: ${req.headers.origin || 'null'}`);
    
    // Configurar headers CORS específicos para user API
    const origin = req.headers.origin;
    if (origin && (allowedOrigins.includes(origin) || origin.includes('realestategozamadrid.com'))) {
        res.header('Access-Control-Allow-Origin', origin);
        res.header('Access-Control-Allow-Credentials', 'true');
    }
    
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Cache-Control, Pragma, Expires, Accept, Origin, X-CSRF-Token');
    
    // Manejar preflight requests
    if (req.method === 'OPTIONS') {
        console.log('✅ User API: Handling OPTIONS preflight request');
        res.status(200).end();
        return;
    }
    
    next();
});

// Rutas
app.use('/api/properties', propertyRoutes);
app.use('/api', notificationRouter);
app.use("/prefix", prefixRouter);
app.use('/api', prefixRouter); // Agregar las rutas de property-notification directamente
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