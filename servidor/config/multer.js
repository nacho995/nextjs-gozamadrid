import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import cloudinary from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Configurar Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// Configuración para Cloudinary (propiedades)
const cloudinaryStorage = new CloudinaryStorage({
    cloudinary: cloudinary.v2,
    params: {
        folder: 'properties',
        allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        transformation: [
            { width: 2000, height: 1500, crop: 'limit' },
            { quality: 'auto' }
        ],
        // Generar un nombre de archivo único
        public_id: (req, file) => {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = file.originalname.split('.')[0];
            return `property-${filename}-${uniqueSuffix}`;
        }
    }
});

// Configuración del almacenamiento local (mantener como respaldo)
const diskStorage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(dirname(__dirname), 'uploads'));
    },
    filename: function (req, file, cb) {
        // Generar un nombre único para el archivo
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const extension = path.extname(file.originalname);
        cb(null, file.fieldname + '-' + uniqueSuffix + extension);
    }
});

// Filtro de archivos
const fileFilter = (req, file, cb) => {
    // Verificar que sea una imagen
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

// Configuración de multer con Cloudinary
const upload = multer({
    storage: cloudinaryStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 250 * 1024 * 1024 // Límite aumentado a 250MB
    }
});

// Exportar también la versión con almacenamiento en disco por si es necesario
export const diskUpload = multer({
    storage: diskStorage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 250 * 1024 * 1024 // Límite aumentado a 250MB
    }
});

export default upload;
