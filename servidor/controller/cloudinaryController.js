import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config(); // Cargar variables de entorno

const cloudinaryController = {
    generateSignature: (req, res) => {
        try {
            const timestamp = Math.round((new Date).getTime() / 1000);

            // Parámetros que queremos incluir en la firma.
            // Estos parámetros deben coincidir con los que el frontend usará en la petición a Cloudinary,
            // excepto por 'api_key', 'timestamp' y 'signature'.
            const params_to_sign = {
                timestamp: timestamp,
                folder: 'properties', // La carpeta donde se guardarán las imágenes de propiedades
                // Definimos las mismas transformaciones que teníamos en multer.js
                transformation: 'w_2000,h_1500,c_limit/q_auto', // Formato string para la firma
                // Podríamos añadir más parámetros aquí si fuera necesario (ej. allowed_formats)
            };

            const apiSecret = process.env.API_SECRET;
            const apiKey = process.env.API_KEY; // Necesitamos la API Key pública también
            const cloudName = process.env.CLOUDINARY_CLOUD_NAME;

            if (!apiSecret || !apiKey || !cloudName) {
                console.error('Error: Faltan variables de entorno de Cloudinary (API_SECRET, API_KEY, CLOUDINARY_CLOUD_NAME)');
                return res.status(500).json({
                    success: false,
                    message: 'Error de configuración del servidor (Cloudinary)'
                });
            }

            // Generamos la firma
            const signature = cloudinary.utils.api_sign_request(params_to_sign, apiSecret);

            // Enviamos la firma y los datos necesarios al frontend
            res.status(200).json({
                success: true,
                signature: signature,
                timestamp: timestamp,
                apiKey: apiKey,
                cloudName: cloudName,
                // Incluimos también los parámetros firmados para que el frontend sepa qué enviar
                // (excepto timestamp que ya va por separado)
                folder: params_to_sign.folder,
                transformation: params_to_sign.transformation
            });

        } catch (error) {
            console.error('Error al generar la firma de Cloudinary:', error);
            res.status(500).json({
                success: false,
                message: 'Error al generar la firma para la subida',
                error: error.message
            });
        }
    }
};

export default cloudinaryController; 