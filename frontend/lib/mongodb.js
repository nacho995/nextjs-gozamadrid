import { MongoClient } from 'mongodb';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nacho995:eminem50cent@cluster0.o6i9n.mongodb.net/GozaMadrid?retryWrites=true&w=majority&socketTimeoutMS=30000&connectTimeoutMS=30000';
const MONGODB_DB = 'GozaMadrid';

if (!MONGODB_URI) {
  throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

/**
 * Global is used here to maintain a cached connection across hot reloads
 * in development. This prevents connections growing exponentially
 * during API Route usage.
 */
let cached = global.mongo;

if (!cached) {
  cached = global.mongo = { conn: null, promise: null };
}

export async function connectToDatabase() {
  if (cached.conn) {
    console.log('✅ MongoDB: Usando conexión existente');
    return cached.conn;
  }

  if (!cached.promise) {
    // Opciones de conexión actualizadas para driver moderno de MongoDB
    const opts = {
      serverSelectionTimeoutMS: 30000,
      connectTimeoutMS: 30000,
      socketTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      retryWrites: true,
      w: 'majority'
    };

    console.log('🔄 MongoDB: Estableciendo nueva conexión...');
    cached.promise = MongoClient.connect(MONGODB_URI, opts).then((client) => {
      console.log('✅ MongoDB: Conexión establecida exitosamente');
      return {
        client,
        db: client.db(MONGODB_DB),
      };
    }).catch((error) => {
      console.error('❌ MongoDB: Error de conexión:', error);
      cached.promise = null;
      throw error;
    });
  }

  try {
    cached.conn = await cached.promise;
    return cached.conn;
  } catch (e) {
    cached.promise = null;
    throw e;
  }
}

export async function getPropertiesCollection() {
  const { db } = await connectToDatabase();
  return db.collection('properties');
}

export async function closeConnection() {
  if (cached.conn) {
    await cached.conn.client.close();
    cached.conn = null;
    cached.promise = null;
    console.log('🔒 MongoDB: Conexión cerrada');
  }
}

// Función de utilidad para manejar errores de MongoDB
export function handleMongoError(error) {
  console.error('MongoDB Error:', error);
  
  if (error.name === 'MongoNetworkError') {
    return { error: 'Error de red al conectar con MongoDB', code: 'NETWORK_ERROR' };
  } else if (error.name === 'MongoServerSelectionError') {
    return { error: 'No se pudo conectar al servidor MongoDB', code: 'SERVER_SELECTION_ERROR' };
  } else if (error.name === 'MongoTimeoutError') {
    return { error: 'Timeout al conectar con MongoDB', code: 'TIMEOUT_ERROR' };
  } else {
    return { error: 'Error interno de MongoDB', code: 'INTERNAL_ERROR' };
  }
} 