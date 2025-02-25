import property from '../models/propertySchema.js';


const propertyController = {
    // Obtiene la lista de properties para previsualización
    getData: async (req, res) => {
        try {
            // Selecciona solo los campos necesarios para la previsualización.
            // Por ejemplo, no incluimos "content" ni "tags"
            const properties = await property.find().select('typeProperty address price description piso wc m2 rooms images createdAt updatedAt');
            res.json(properties);
        } catch (err) {
            console.log("Error fetching properties:", err);
            res.status(500).json({ message: "No se pudieron obtener los properties" });
        }
    },

    // Obtiene el property completo por su ID
    getDataById: async (req, res) => {
        try {
            const { id } = req.params;
            const foundProperty = await property.findById(id);
            res.json(foundProperty);
        } catch (err) {
            console.log("Error fetching property by ID:", err);
            res.status(500).json({ message: "No se pudo obtener el property" });
        }
    },

    // Agrega un nuevo property (se espera que req.body incluya todos los campos, incluido content y tags)
    addData: async (req, res) => {
        try {
            const newproperty = new property(req.body);
            await newproperty.save();
            res.json({ message: "property agregado" });
        } catch (err) {
            console.log("Error adding property:", err);
            res.status(500).json({ message: "No se pudo agregar el property" });
        }
    },

    // Elimina un property por su ID
    deleteData: async (req, res) => {
        try {
            await property.findByIdAndDelete(req.params.id);
            res.json({ message: "property eliminado" });
        } catch (err) {
            console.log("Error deleting property:", err);
            res.status(500).json({ message: "No se pudo eliminar el property" });
        }
    },

    // Actualiza un property por su ID
    updateData: async (req, res) => {
        try {
            await property.findByIdAndUpdate(req.params.id, req.body);
            res.json({ message: "property actualizado" });
        } catch (err) {
            console.log("Error updating property:", err);
            res.status(500).json({ message: "No se pudo actualizar el property" });
        }
    },

    uploadImage: async (req, res) => {
        try {
            if (!req.file) {
                return res.status(400).json({ message: "No se subió ninguna imagen" });
            }
            console.log("Archivo recibido:", req.file); // Debug: Verifica los detalles del archivo subido
      
            const serverUrl = process.env.API_BASE_URL || "http://localhost:3000";
            const imageUrl = `${serverUrl}/uploads/${req.file.filename}`;
            res.json({ imageUrl });
        } catch (err) {
            console.log("Error uploading image:", err);
            res.status(500).json({ message: "No se pudo subir la imagen" });
        }
    }
};

export default propertyController;
