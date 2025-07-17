/**
 * API para obtener una propiedad específica por ID desde MongoDB
 */

import { connectToDatabase } from '../../../lib/mongodb';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  const { id } = req.query;

  if (req.method === 'PUT') {
    try {
      // Conectar a la base de datos
      const { db } = await connectToDatabase();
      const collection = db.collection('properties');

      // Validar que el ID sea válido
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de propiedad no válido' 
        });
      }

      // Obtener los datos del cuerpo de la petición
      const updateData = req.body;
      
      // Validar que las imágenes tengan la estructura correcta
      if (updateData.images && Array.isArray(updateData.images)) {
        updateData.images = updateData.images.map(img => ({
          src: img.src || '',
          alt: img.alt || ''
        }));
      }

      // Actualizar la propiedad
      const result = await collection.updateOne(
        { _id: new ObjectId(id) },
        { 
          $set: {
            ...updateData,
            updatedAt: new Date()
          }
        }
      );

      if (result.matchedCount === 0) {
        return res.status(404).json({ 
          success: false, 
          message: 'Propiedad no encontrada' 
        });
      }

      // Obtener la propiedad actualizada
      const updatedProperty = await collection.findOne({ _id: new ObjectId(id) });

      res.status(200).json({
        success: true,
        message: 'Propiedad actualizada correctamente',
        property: updatedProperty
      });

    } catch (error) {
      console.error('Error actualizando propiedad:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  } else if (req.method === 'GET') {
    try {
      // Conectar a la base de datos
      const { db } = await connectToDatabase();
      const collection = db.collection('properties');

      // Validar que el ID sea válido
      if (!ObjectId.isValid(id)) {
        return res.status(400).json({ 
          success: false, 
          message: 'ID de propiedad no válido' 
        });
      }

      // Buscar la propiedad por ID
      const property = await collection.findOne({ _id: new ObjectId(id) });

      if (!property) {
        return res.status(404).json({ 
          success: false, 
          message: 'Propiedad no encontrada' 
        });
      }

      res.status(200).json({
        success: true,
        property: property
      });

    } catch (error) {
      console.error('Error obteniendo propiedad:', error);
      res.status(500).json({ 
        success: false, 
        message: 'Error interno del servidor',
        error: error.message 
      });
    }
  } else {
    res.setHeader('Allow', ['GET', 'PUT']);
    res.status(405).json({ 
      success: false, 
      message: `Método ${req.method} no permitido` 
    });
  }
} 