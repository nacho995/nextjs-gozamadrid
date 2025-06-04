/**
 * API de MongoDB - CONEXIÓN REAL A BASE DE DATOS
 * Carga propiedades reales desde MongoDB Atlas
 */

import { getPropertiesCollection, handleMongoError } from '../../../../lib/mongodb.js';

// Datos de ejemplo como fallback en caso de error
const FALLBACK_PROPERTIES = [
  {
    _id: "507f1f77bcf86cd799439011",
    title: "Ático en Salamanca",
    description: "Espectacular ático con terraza en el barrio de Salamanca",
    price: 850000,
    bedrooms: 3,
    bathrooms: 2,
    area: 120,
    address: "Calle Serrano 45",
    location: "Salamanca, Madrid",
    images: [
      { src: "/img/property1.jpg", alt: "Salón principal" },
      { src: "/img/property1-2.jpg", alt: "Terraza" }
    ],
    coordinates: { lat: 40.4359, lng: -3.6774 },
    source: 'ejemplo',
    createdAt: new Date().toISOString()
  },
  {
    _id: "507f1f77bcf86cd799439012", 
    title: "Piso en Malasaña",
    description: "Acogedor piso reformado en Malasaña",
    price: 420000,
    bedrooms: 2,
    bathrooms: 1,
    area: 75,
    address: "Calle Fuencarral 88",
    location: "Malasaña, Madrid",
    images: [
      { src: "/img/property2.jpg", alt: "Salón comedor" }
    ],
    coordinates: { lat: 40.4254, lng: -3.7031 },
    source: 'ejemplo',
    createdAt: new Date().toISOString()
  }
];

export default async function handler(req, res) {
  console.log('[API MongoDB] 🚀 Iniciando conexión a MongoDB...');
  
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Obtener parámetros de la consulta
    const { 
      page = 1, 
      limit = 10, 
      search = '', 
      minPrice = '', 
      maxPrice = '', 
      bedrooms = '', 
      bathrooms = '',
      location = ''
    } = req.query;

    console.log('[API MongoDB] 📋 Parámetros:', { page, limit, search, minPrice, maxPrice, bedrooms, bathrooms, location });

    // Conectar a MongoDB
    const collection = await getPropertiesCollection();
    console.log('[API MongoDB] ✅ Conexión establecida, buscando propiedades...');

    // Verificar que la colección existe y contar documentos totales
    const totalDocuments = await collection.countDocuments();
    console.log(`[API MongoDB] 📊 Total de documentos en la colección: ${totalDocuments}`);

    // Construir filtros de búsqueda
    const filters = {};

    // Búsqueda por texto
    if (search) {
      filters.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } }
      ];
    }

    // Filtro por ubicación específica
    if (location) {
      filters.location = { $regex: location, $options: 'i' };
    }

    // Filtros por precio
    if (minPrice || maxPrice) {
      filters.price = {};
      if (minPrice) filters.price.$gte = parseInt(minPrice);
      if (maxPrice) filters.price.$lte = parseInt(maxPrice);
    }

    // Filtros por habitaciones y baños
    if (bedrooms) filters.bedrooms = { $gte: parseInt(bedrooms) };
    if (bathrooms) filters.bathrooms = { $gte: parseInt(bathrooms) };

    console.log('[API MongoDB] 🔍 Aplicando filtros:', JSON.stringify(filters, null, 2));

    // Paginación
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    // Consultar propiedades con filtros
    const properties = await collection
      .find(filters)
      .sort({ createdAt: -1 }) // Ordenar por fecha de creación, más recientes primero
      .skip(skip)
      .limit(limitNum)
      .toArray();

    // Contar total de propiedades que coinciden con los filtros
    const totalCount = await collection.countDocuments(filters);

    console.log(`[API MongoDB] 📊 Encontradas ${properties.length} propiedades de ${totalCount} total`);

    // Normalizar cada propiedad para que tenga la estructura consistente
    const normalizedProperties = properties.map(property => {
      // Lógica inteligente para el precio
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
            console.log(`[MongoDB] Precio con punto: ${property.price} → ${priceNumeric}€`);
          } else {
            normalizedPrice = priceValue.toLocaleString('es-ES');
            priceNumeric = priceValue;
            console.log(`[MongoDB] Precio directo: ${property.price} → ${priceNumeric}€`);
          }
        } else if (!cleanPrice.includes('.') && !cleanPrice.includes(',')) {
          // Precio simple sin separadores: "725" → "725000"
          const priceValue = parseInt(cleanPrice);
          if (priceValue < 10000) { // Si es menor que 10.000, asumir que está en miles
            normalizedPrice = (priceValue * 1000).toLocaleString('es-ES');
            priceNumeric = priceValue * 1000;
            console.log(`[MongoDB] Precio en miles: ${property.price} → ${priceNumeric}€`);
          } else {
            normalizedPrice = priceValue.toLocaleString('es-ES');
            priceNumeric = priceValue;
            console.log(`[MongoDB] Precio completo: ${property.price} → ${priceNumeric}€`);
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

      // Generar imágenes a partir del array de images si existe
      let propertyImages = [];
      if (property.images && Array.isArray(property.images) && property.images.length > 0) {
        propertyImages = property.images.map((img, index) => ({
          url: img,
          alt: `${property.title || 'Propiedad'} - Imagen ${index + 1}`
        }));
      } else {
        // Imagen por defecto si no hay imágenes
        propertyImages = [{
          url: '/default-property.jpg',
          alt: property.title || 'Imagen de propiedad'
        }];
      }

      return {
        _id: property._id,
        id: property._id?.toString(),
        title: property.title || 'Propiedad sin título',
        description: property.description || '',
        price: normalizedPrice,
        priceNumeric: priceNumeric,
        location: property.location || property.address || 'Madrid',
        address: property.address || property.location || 'Madrid',
        coordinates: property.coordinates || null, // ✅ Incluir coordenadas
        bedrooms: property.bedrooms || property.rooms || '0',
        bathrooms: property.bathrooms || property.wc || '0',
        area: property.area || property.m2 || '0',
        size: property.area || property.m2 || '0',
        propertyType: property.propertyType || property.typeProperty || 'Propiedad',
        status: property.status || 'Disponible',
        featured: property.featured || false,
        images: propertyImages,
        image: propertyImages[0]?.url || '/default-property.jpg',
        features: property.features || [],
        source: 'mongodb',
        createdAt: property.createdAt || new Date().toISOString(),
        updatedAt: property.updatedAt || new Date().toISOString()
      };
    });

    return res.status(200).json({
      properties: normalizedProperties,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(totalCount / limitNum),
        totalCount,
        hasMore: skip + properties.length < totalCount
      },
      source: 'mongodb',
      success: true
    });

  } catch (error) {
    console.error('[API MongoDB] ❌ Error:', error);
    
    // En caso de error, devolver datos de fallback
    console.log('[API MongoDB] 🔄 Usando datos de fallback...');
    
    const { page = 1, limit = 10 } = req.query;
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const startIndex = (pageNum - 1) * limitNum;
    const endIndex = startIndex + limitNum;
    
    const fallbackData = FALLBACK_PROPERTIES.slice(startIndex, endIndex);
    
    return res.status(200).json({
      properties: fallbackData,
      pagination: {
        currentPage: pageNum,
        totalPages: Math.ceil(FALLBACK_PROPERTIES.length / limitNum),
        totalCount: FALLBACK_PROPERTIES.length,
        hasMore: endIndex < FALLBACK_PROPERTIES.length
      },
      source: 'fallback',
      success: false,
      error: handleMongoError(error)
    });
  }
} 