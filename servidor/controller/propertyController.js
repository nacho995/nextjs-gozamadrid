import Property from '../models/propertySchema.js';

// Controlador para propiedades
const propertyController = {
    // Obtener todas las propiedades
    getAllProperties: async (req, res) => {
        try {
            const properties = await Property.find();
            res.status(200).json(properties);
        } catch (error) {
            console.error('Error al obtener propiedades:', error);
            res.status(500).json({ message: 'Error al obtener propiedades', error: error.message });
        }
    },

    // Obtener datos por ID
    getDataById: async (req, res) => {
        try {
            const property = await Property.findById(req.params.id);
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            res.json(property);
        } catch (error) {
            console.error('Error al obtener propiedad por ID:', error);
            res.status(500).json({ message: 'Error al obtener propiedad', error: error.message });
        }
    },

    // Obtener datos (con posible filtrado)
    getData: async (req, res) => {
        try {
            // Implementar filtros si es necesario
            const filter = {};
            
            // Si hay parámetros de consulta, aplicarlos como filtros
            if (req.query.typeProperty) {
                filter.typeProperty = req.query.typeProperty;
            }
            
            if (req.query.minPrice && req.query.maxPrice) {
                filter.price = { 
                    $gte: req.query.minPrice, 
                    $lte: req.query.maxPrice 
                };
            } else if (req.query.minPrice) {
                filter.price = { $gte: req.query.minPrice };
            } else if (req.query.maxPrice) {
                filter.price = { $lte: req.query.maxPrice };
            }
            
            // Buscar propiedades con los filtros aplicados
            const properties = await Property.find(filter);
            console.log(`Obtenidas ${properties.length} propiedades con filtros:`, filter);
            
            // Agregar este log para ver qué propiedades se están devolviendo
            if (properties.length > 0) {
                console.log('Primera propiedad:', {
                    id: properties[0]._id,
                    title: properties[0].title,
                    price: properties[0].price
                });
            }
            
            res.json(properties);
        } catch (error) {
            console.error('Error al obtener propiedades filtradas:', error);
            res.status(500).json({ message: 'Error al obtener propiedades', error: error.message });
        }
    },

    // Añadir nueva propiedad
    addData: async (req, res) => {
        try {
            const newProperty = new Property(req.body);
            const savedProperty = await newProperty.save();
            console.log('Nueva propiedad creada:', savedProperty._id);
            res.status(201).json(savedProperty);
        } catch (error) {
            console.error('Error al crear propiedad:', error);
            res.status(500).json({ message: 'Error al crear propiedad', error: error.message });
        }
    },

    // Actualizar propiedad existente
    updateData: async (req, res) => {
        try {
            const updatedProperty = await Property.findByIdAndUpdate(
                req.params.id,
                req.body,
                { new: true }
            );
            
            if (!updatedProperty) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            
            console.log('Propiedad actualizada:', updatedProperty._id);
            res.json(updatedProperty);
        } catch (error) {
            console.error('Error al actualizar propiedad:', error);
            res.status(500).json({ message: 'Error al actualizar propiedad', error: error.message });
        }
    },

    // Eliminar propiedad
    deleteData: async (req, res) => {
        try {
            const deletedProperty = await Property.findByIdAndDelete(req.params.id);
            
            if (!deletedProperty) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            
            console.log('Propiedad eliminada:', req.params.id);
            res.json({ message: 'Propiedad eliminada correctamente', id: req.params.id });
        } catch (error) {
            console.error('Error al eliminar propiedad:', error);
            res.status(500).json({ message: 'Error al eliminar propiedad', error: error.message });
        }
    },

    // Buscar propiedad por tipo de ID personalizado
    findPropertyByCustomId: async (req, res) => {
        try {
            const { idType, idValue } = req.params;
            let property;
            
            // Buscar según el tipo de ID
            switch (idType) {
                case 'mongodb':
                    property = await Property.findById(idValue);
                    break;
                case 'reference':
                    property = await Property.findOne({ reference: idValue });
                    break;
                case 'address':
                    property = await Property.findOne({ 
                        address: { $regex: new RegExp(idValue, 'i') } 
                    });
                    break;
                default:
                    return res.status(400).json({ 
                        message: 'Tipo de ID no válido. Usar: mongodb, reference o address' 
                    });
            }
            
            if (!property) {
                return res.status(404).json({ 
                    message: `Propiedad no encontrada con ${idType}: ${idValue}` 
                });
            }
            
            res.json(property);
        } catch (error) {
            console.error('Error al buscar propiedad por ID personalizado:', error);
            res.status(500).json({ 
                message: 'Error al buscar propiedad', 
                error: error.message 
            });
        }
    },

    // Crear notificación de propiedad
    createNotification: async (req, res) => {
        try {
            // Implementación básica - se puede expandir según necesidades
            const { propertyId, email, name, message, phone } = req.body;
            
            if (!propertyId || !email || !name) {
                return res.status(400).json({ 
                    message: 'Faltan datos requeridos: propertyId, email y name son obligatorios' 
                });
            }
            
            // Verificar que la propiedad existe
            const property = await Property.findById(propertyId);
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            
            // Aquí podrías guardar la notificación en una colección separada
            // o enviar un email, etc.
            
            console.log('Notificación de propiedad recibida:', {
                propertyId, email, name, message, phone
            });
            
            res.status(201).json({ 
                success: true, 
                message: 'Notificación recibida correctamente' 
            });
        } catch (error) {
            console.error('Error al crear notificación de propiedad:', error);
            res.status(500).json({ 
                message: 'Error al procesar la notificación', 
                error: error.message 
            });
        }
    },

    // Obtener notificación por ID
    getNotification: async (req, res) => {
        // Implementación básica - se puede expandir según necesidades
        res.status(501).json({ 
            message: 'Funcionalidad no implementada' 
        });
    },

    uploadImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se subió ninguna imagen" });
            }
            console.log("Archivo recibido:", req.file);

            // Obtener la URL de Cloudinary
            const imageUrl = req.file.path;
            console.log("URL de la imagen:", imageUrl);

            // Devolver la respuesta con la URL de la imagen
            res.status(200).json({ 
                success: true,
                message: "Imagen subida correctamente",
                imageUrl: imageUrl,
                url: imageUrl, // Para compatibilidad
                secure_url: imageUrl.replace('http://', 'https://'),
                public_id: req.file.filename
            });
        } catch (err) {
            console.error("Error al subir imagen:", err);
            res.status(500).json({ 
                success: false,
                message: "Error al subir la imagen",
                error: err.message 
            });
        }
    },

    // Obtener una propiedad por ID
    getPropertyById: async (req, res) => {
        try {
            const property = await Property.findById(req.params.id);
            if (!property) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            res.status(200).json(property);
        } catch (error) {
            console.error('Error al obtener propiedad:', error);
            res.status(500).json({ message: 'Error al obtener propiedad', error: error.message });
        }
    },

    // Crear una nueva propiedad
    createProperty: async (req, res) => {
        try {
            console.log('Datos recibidos para crear propiedad:', JSON.stringify(req.body, null, 2));
            console.log('Archivos recibidos:', req.files);
            
            // Crear un objeto con los campos necesarios
            const propertyData = {
                title: req.body.title,
                description: req.body.description,
                price: req.body.price,
                location: req.body.location,
                bedrooms: req.body.bedrooms,
                bathrooms: req.body.bathrooms,
                area: req.body.area,
                propertyType: req.body.propertyType,
                features: req.body.features || [],
                address: req.body.address || req.body.location,
                rooms: req.body.bedrooms,
                wc: req.body.bathrooms,
                piso: req.body.piso || '1',
                m2: req.body.area,
                priceM2: req.body.priceM2 || '',
                images: [] // Inicializar el array de imágenes
            };

            // Procesar imágenes del cuerpo de la solicitud
            if (req.body.images && Array.isArray(req.body.images)) {
                propertyData.images = req.body.images.map(img => ({
                    src: img.src || img,
                    alt: img.alt || 'Imagen de propiedad'
                })).filter(img => img.src);
            }
            
            // Procesar imágenes subidas como archivos
            if (req.files && req.files.length > 0) {
                const fileImages = req.files.map(file => ({
                    src: file.path,
                    alt: 'Imagen de propiedad',
                    public_id: file.filename
                }));
                propertyData.images = [...propertyData.images, ...fileImages];
            }

            console.log('Datos finales de la propiedad:', JSON.stringify(propertyData, null, 2));
            
            const newProperty = new Property(propertyData);
            const savedProperty = await newProperty.save();
            
            console.log('Propiedad guardada:', JSON.stringify(savedProperty, null, 2));
            
            res.status(201).json(savedProperty);
        } catch (error) {
            console.error('Error al crear propiedad:', error);
            res.status(500).json({ message: 'Error al crear propiedad', error: error.message });
        }
    },

    // Actualizar una propiedad
    updateProperty: async (req, res) => {
        try {
            console.log('Actualizando propiedad:', req.params.id);
            console.log('Datos recibidos:', req.body);
            console.log('Archivos recibidos:', req.files);
            
            // Preparar el objeto de actualización
            const updateData = { ...req.body };
            
            // Procesar imágenes si se han subido
            if (req.files && req.files.length > 0) {
                // Obtener la propiedad actual para añadir a las imágenes existentes
                const property = await Property.findById(req.params.id);
                const existingImages = property.images || [];
                
                // Procesar las nuevas imágenes desde Cloudinary
                const newImages = req.files.map(file => {
                    return {
                        src: file.path, // URL de Cloudinary
                        alt: req.body.title || 'Imagen de propiedad',
                        public_id: file.filename // ID público de Cloudinary
                    };
                });
                
                // Combinar imágenes existentes con nuevas
                updateData.images = [...existingImages, ...newImages];
                console.log('Imágenes actualizadas:', updateData.images);
            }
            
            // Si se enviaron URLs de imágenes en el cuerpo (para imágenes externas)
            if (req.body.imageUrls && Array.isArray(req.body.imageUrls)) {
                const existingImages = updateData.images || [];
                const externalImages = req.body.imageUrls.map((url, index) => ({
                    src: url,
                    alt: (req.body.imageAlts && req.body.imageAlts[index]) || 'Imagen de propiedad'
                }));
                
                updateData.images = [...existingImages, ...externalImages];
            }
            
            // Actualizar la propiedad
            const updatedProperty = await Property.findByIdAndUpdate(
                req.params.id,
                updateData,
                { new: true, runValidators: true }
            );
            
            if (!updatedProperty) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            
            res.status(200).json(updatedProperty);
        } catch (error) {
            console.error('Error al actualizar propiedad:', error);
            res.status(500).json({ message: 'Error al actualizar propiedad', error: error.message });
        }
    },

    // Eliminar una propiedad
    deleteProperty: async (req, res) => {
        try {
            const deletedProperty = await Property.findByIdAndDelete(req.params.id);
            
            if (!deletedProperty) {
                return res.status(404).json({ message: 'Propiedad no encontrada' });
            }
            
            res.status(200).json({ message: 'Propiedad eliminada correctamente' });
        } catch (error) {
            console.error('Error al eliminar propiedad:', error);
            res.status(500).json({ message: 'Error al eliminar propiedad', error: error.message });
        }
    }
};

export default propertyController;
