import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    const { file = 'video.mp4' } = req.query;
    
    // Validar el nombre del archivo para seguridad
    const allowedFiles = ['video.mp4', 'videoExpIngles.mp4'];
    if (!allowedFiles.includes(file)) {
      return res.status(404).json({ error: 'Archivo no encontrado' });
    }

    // Ruta al archivo en el directorio public
    const filePath = path.join(process.cwd(), 'public', file);
    
    // Verificar si el archivo existe
    if (!fs.existsSync(filePath)) {
      console.error(`[Video API] Archivo no encontrado: ${filePath}`);
      return res.status(404).json({ error: 'Video no encontrado' });
    }

    // Obtener información del archivo
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    // Configurar headers para video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Length', fileSize);
    res.setHeader('Cache-Control', 'public, max-age=31536000'); // 1 año

    if (range) {
      // Manejar requests de rango para streaming
      const parts = range.replace(/bytes=/, "").split("-");
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunksize = (end - start) + 1;
      
      const file = fs.createReadStream(filePath, { start, end });
      
      res.setHeader('Content-Range', `bytes ${start}-${end}/${fileSize}`);
      res.setHeader('Content-Length', chunksize);
      res.status(206);
      
      file.pipe(res);
    } else {
      // Enviar el archivo completo
      res.status(200);
      const file = fs.createReadStream(filePath);
      file.pipe(res);
    }

    console.log(`[Video API] ✅ Sirviendo video: ${file} (${fileSize} bytes)`);
    
  } catch (error) {
    console.error('[Video API] ❌ Error sirviendo video:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
} 