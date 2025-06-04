import { MongoClient, ObjectId } from 'mongodb';

// Configuración de MongoDB
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://nachete:realestate@cluster0.q8c31.mongodb.net/realestate?retryWrites=true&w=majority';
const MONGODB_DB = process.env.MONGODB_DB || 'realestate';

let client;
let clientPromise;

async function connectToDatabase() {
  if (clientPromise) {
    return clientPromise;
  }

  try {
    client = new MongoClient(MONGODB_URI);
    clientPromise = client.connect();
    console.log('✅ MongoDB: Nueva conexión establecida para update-coordinates');
    return clientPromise;
  } catch (error) {
    console.error('❌ MongoDB: Error de conexión para update-coordinates:', error);
    throw error;
  }
}

export default async function handler(req, res) {
  console.log('[Update Coordinates] 🚀 Iniciando actualización de coordenadas');

  if (req.method !== 'POST') {
    return res.status(405).json({ 
      error: 'Método no permitido. Use POST.',
      method: req.method 
    });
  }

  try {
    const { _id, coordinates, title, address } = req.body;

    // Validación de datos
    if (!_id || !coordinates || !coordinates.lat || !coordinates.lng) {
      return res.status(400).json({ 
        error: 'Faltan datos requeridos: _id, coordinates.lat, coordinates.lng',
        received: { _id, coordinates, title, address }
      });
    }

    // Validar que las coordenadas sean números válidos
    const lat = parseFloat(coordinates.lat);
    const lng = parseFloat(coordinates.lng);

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({ 
        error: 'Las coordenadas deben ser números válidos',
        received: coordinates
      });
    }

    // Validar rangos de coordenadas para Madrid
    if (lat < 40.0 || lat > 41.0 || lng < -4.5 || lng > -3.0) {
      console.warn(`⚠️ Coordenadas fuera del rango de Madrid: lat=${lat}, lng=${lng}`);
    }

    console.log(`[Update Coordinates] 📍 Actualizando ${title}: lat=${lat}, lng=${lng}`);

    // Conectar a MongoDB
    await connectToDatabase();
    const db = client.db(MONGODB_DB);
    const collection = db.collection('properties');

    // Actualizar la propiedad con las coordenadas
    const updateResult = await collection.updateOne(
      { _id: new ObjectId(_id) },
      { 
        $set: { 
          coordinates: { lat, lng },
          updatedAt: new Date()
        }
      }
    );

    if (updateResult.matchedCount === 0) {
      return res.status(404).json({ 
        error: 'Propiedad no encontrada',
        _id: _id
      });
    }

    if (updateResult.modifiedCount === 0) {
      console.log(`📍 ${title}: Las coordenadas ya estaban actualizadas`);
      return res.status(200).json({ 
        success: true,
        message: 'Las coordenadas ya estaban actualizadas',
        property: { _id, title, coordinates: { lat, lng } },
        matchedCount: updateResult.matchedCount,
        modifiedCount: updateResult.modifiedCount
      });
    }

    console.log(`✅ ${title}: Coordenadas actualizadas exitosamente`);

    // Verificar la actualización
    const updatedProperty = await collection.findOne(
      { _id: new ObjectId(_id) },
      { projection: { title: 1, coordinates: 1, address: 1, location: 1 } }
    );

    return res.status(200).json({
      success: true,
      message: 'Coordenadas actualizadas exitosamente',
      property: {
        _id: _id,
        title: title,
        address: address,
        coordinates: { lat, lng }
      },
      verification: updatedProperty,
      matchedCount: updateResult.matchedCount,
      modifiedCount: updateResult.modifiedCount
    });

  } catch (error) {
    console.error('[Update Coordinates] ❌ Error:', error);
    
    // Error específico de MongoDB
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({ 
        error: 'Error de base de datos',
        details: error.message,
        code: error.code
      });
    }

    // Error de ObjectId inválido
    if (error.message.includes('ObjectId')) {
      return res.status(400).json({ 
        error: 'ID de propiedad inválido',
        details: error.message
      });
    }

    return res.status(500).json({ 
      error: 'Error interno del servidor',
      details: error.message 
    });
  }
} 