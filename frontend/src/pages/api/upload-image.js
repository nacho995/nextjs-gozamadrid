import fs from 'fs';
import path from 'path';
import { IncomingForm } from 'formidable';

// Configurar para archivos grandes
export const config = {
  api: {
    bodyParser: false,
  },
};

/**
 * API para subir imágenes localmente
 * POST /api/upload-image
 */
export default async function handler(req, res) {
  // Solo permitir solicitudes POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Crear directorio de uploads si no existe
  const uploadDir = path.join(process.cwd(), 'public', 'uploads');
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  try {
    // Procesar el formulario con archivos
    const form = new IncomingForm({
      uploadDir,
      keepExtensions: true,
      maxFileSize: 10 * 1024 * 1024, // 10MB
    });

    // Procesar el archivo subido
    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Error al procesar el archivo:', err);
        return res.status(500).json({ error: 'Error al procesar el archivo' });
      }

      // Verificar que se subió un archivo
      const file = files.file?.[0] || files.image?.[0];
      if (!file) {
        return res.status(400).json({ error: 'No se proporcionó ningún archivo' });
      }

      // Verificar que es una imagen
      if (!file.mimetype || !file.mimetype.startsWith('image/')) {
        // Eliminar el archivo si no es una imagen
        if (fs.existsSync(file.filepath)) {
          fs.unlinkSync(file.filepath);
        }
        return res.status(400).json({ error: 'El archivo debe ser una imagen' });
      }

      // Generar un nombre único para el archivo (timestamp + nombre original)
      const timestamp = Date.now();
      const originalName = file.originalFilename;
      const fileExt = path.extname(originalName);
      const fileName = `${timestamp}-${path.basename(originalName, fileExt)}${fileExt}`;
      const newFilePath = path.join(uploadDir, fileName);

      // Mover el archivo a la ubicación final
      fs.renameSync(file.filepath, newFilePath);

      // Generar URL relativa para acceder a la imagen
      const imageUrl = `/uploads/${fileName}`;

      // Registrar información sobre la imagen subida
      console.log(`Imagen subida: ${imageUrl} (${file.mimetype}, ${file.size} bytes)`);

      // Devolver la URL de la imagen
      return res.status(200).json({
        success: true,
        imageUrl,
        fileName,
        size: file.size,
        type: file.mimetype
      });
    });
  } catch (error) {
    console.error('Error al subir imagen:', error);
    return res.status(500).json({ error: 'Error interno del servidor al subir imagen' });
  }
} 