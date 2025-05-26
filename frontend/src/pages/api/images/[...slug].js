import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  const { slug } = req.query;
  const imageName = Array.isArray(slug) ? slug.join('/') : slug;
  
  // Lista de imágenes permitidas para seguridad
  const allowedImages = [
    'logonuevo.png',
    'logo.png',
    'manifest.json',
    'favicon.ico',
    'favicon-16x16.png',
    'favicon-32x32.png'
  ];
  
  if (!allowedImages.includes(imageName)) {
    return res.status(404).json({ error: 'Image not found' });
  }
  
  try {
    const imagePath = path.join(process.cwd(), 'public', imageName);
    
    if (!fs.existsSync(imagePath)) {
      return res.status(404).json({ error: 'Image not found' });
    }
    
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Establecer headers apropiados
    if (imageName.endsWith('.png')) {
      res.setHeader('Content-Type', 'image/png');
    } else if (imageName.endsWith('.jpg') || imageName.endsWith('.jpeg')) {
      res.setHeader('Content-Type', 'image/jpeg');
    } else if (imageName.endsWith('.json')) {
      res.setHeader('Content-Type', 'application/json');
    } else if (imageName.endsWith('.ico')) {
      res.setHeader('Content-Type', 'image/x-icon');
    }
    
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    res.status(200).send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
} 