/**
 * API para obtener una propiedad específica por ID desde MongoDB
 */

import { getPropertiesCollection, handleMongoError } from '../../../lib/mongodb.js';
import { ObjectId } from 'mongodb';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'ID de propiedad requerido' });
  }

  console.log(`[API] Buscando propiedad con ID: ${id}`);

  try {
    // Conectar a MongoDB
    const collection = await getPropertiesCollection();
    
    // Registrar información para depuración
    console.log(`[API][PROPERTIES] ID recibido: ${id}, tipo: ${typeof id}`);
    
    // Buscar la propiedad por ID
    let query;
    let isValidObjectId = false;
    
    try {
      // Verificar si el ID es un ObjectId válido
      isValidObjectId = ObjectId.isValid(id);
      console.log(`[API][PROPERTIES] ¿Es un ObjectId válido?: ${isValidObjectId}`);
      
      if (isValidObjectId) {
        query = { _id: new ObjectId(id) };
      } else {
        // Probar diferentes campos de búsqueda
        query = {
          $or: [
            { _id: id },
            { id: id },
            { slug: id }
          ]
        };
      }
    } catch (error) {
      console.error(`[API][PROPERTIES] Error al procesar ID: ${error.message}`);
      query = { _id: id };
    }

    console.log(`[API] Ejecutando query:`, query);
    
    const property = await collection.findOne(query);

    if (!property) {
      console.log(`[API] Propiedad no encontrada con ID: ${id}`);
      return res.status(404).json({ error: 'Propiedad no encontrada' });
    }

    console.log(`[API] Propiedad encontrada: ${property.title}`);

    // Procesar el precio de la misma manera que en la API de listado
    let normalizedPrice = property.price;
    let priceNumeric = 0;
    
    if (typeof normalizedPrice === 'string') {
      // Remover caracteres no numéricos excepto punto y coma
      const cleanPrice = normalizedPrice.replace(/[^\d.,]/g, '');
      
      if (cleanPrice.includes('.') && !cleanPrice.includes(',')) {
        // Precio con punto como separador de miles: "1.299" → "1299000"
        const priceValue = parseInt(cleanPrice.replace('.', ''));
        if (priceValue < 10000) { // Si es menor que 10.000, asumir que está en miles
          normalizedPrice = (priceValue * 1000).toLocaleString('es-ES');
          priceNumeric = priceValue * 1000;
          console.log(`[API Individual] Precio con punto: ${property.price} → ${priceNumeric}€`);
        } else {
          normalizedPrice = priceValue.toLocaleString('es-ES');
          priceNumeric = priceValue;
          console.log(`[API Individual] Precio directo: ${property.price} → ${priceNumeric}€`);
        }
      } else if (!cleanPrice.includes('.') && !cleanPrice.includes(',')) {
        // Precio simple sin separadores: "725" → "725000"
        const priceValue = parseInt(cleanPrice);
        if (priceValue < 10000) { // Si es menor que 10.000, asumir que está en miles
          normalizedPrice = (priceValue * 1000).toLocaleString('es-ES');
          priceNumeric = priceValue * 1000;
          console.log(`[API Individual] Precio en miles: ${property.price} → ${priceNumeric}€`);
        } else {
          normalizedPrice = priceValue.toLocaleString('es-ES');
          priceNumeric = priceValue;
          console.log(`[API Individual] Precio completo: ${property.price} → ${priceNumeric}€`);
        }
      } else {
        // Otros casos, usar valor original
        priceNumeric = parseInt(cleanPrice.replace(/[.,]/g, ''));
        normalizedPrice = priceNumeric.toLocaleString('es-ES');
      }
    } else if (typeof normalizedPrice === 'number') {
      priceNumeric = normalizedPrice;
      normalizedPrice = normalizedPrice.toLocaleString('es-ES');
    }

    // Normalizar los datos de la propiedad
    const normalizedProperty = {
      _id: property._id,
      id: property._id?.toString(),
      title: property.title || 'Propiedad sin título',
      description: property.description || '',
      price: normalizedPrice,
      priceNumeric: priceNumeric,
      location: property.location || property.address || 'Madrid',
      address: property.address || property.location || 'Madrid',
      coordinates: property.coordinates || null,
      bedrooms: property.bedrooms || property.rooms || '0',
      bathrooms: property.bathrooms || property.wc || '0',
      area: property.area || property.m2 || '0',
      size: property.area || property.m2 || '0',
      propertyType: property.propertyType || property.typeProperty || 'Propiedad',
      status: property.status || 'Disponible',
      featured: property.featured || false,
      images: property.images && Array.isArray(property.images) ? 
        property.images.map((img, index) => {
          // Si es un objeto con src
          if (typeof img === 'object' && img.src) {
            return {
              url: img.src,
              src: img.src,
              alt: img.alt || `${property.title || 'Propiedad'} - Imagen ${index + 1}`
            };
          }
          
          // Si es un string (formato legacy)
          if (typeof img === 'string') {
            return {
              url: img,
              src: img,
              alt: `${property.title || 'Propiedad'} - Imagen ${index + 1}`
            };
          }
          
          return null;
        }).filter(Boolean) : [],
      source: 'mongodb',
      createdAt: property.createdAt || new Date().toISOString(),
      updatedAt: property.updatedAt || new Date().toISOString()
    };

    res.status(200).json({
      success: true,
      property: normalizedProperty
    });

  } catch (error) {
    console.error('[API] Error al obtener propiedad:', error);
    const mongoError = handleMongoError(error);
    
    res.status(500).json({
      success: false,
      error: 'Error al obtener la propiedad',
      details: mongoError.error
    });
  }
} 