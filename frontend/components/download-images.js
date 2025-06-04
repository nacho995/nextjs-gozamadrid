// Script para descargar imágenes de ejemplo para la landing page
const https = require('https');
const fs = require('fs');
const path = require('path');

const imagesToDownload = [
  {
    url: 'https://placekitten.com/1920/1080',
    filename: 'madrid-luxury-property.jpg',
    description: 'Imagen para el header - propiedad de lujo en Madrid'
  },
  {
    url: 'https://placekitten.com/800/600',
    filename: 'propiedad-1.jpg',
    description: 'Ático de lujo en Salamanca'
  },
  {
    url: 'https://placekitten.com/801/600',
    filename: 'propiedad-2.jpg',
    description: 'Villa exclusiva en La Moraleja'
  },
  {
    url: 'https://placekitten.com/802/600',
    filename: 'propiedad-3.jpg',
    description: 'Piso señorial en Jerónimos'
  },
  {
    url: 'https://placekitten.com/803/600',
    filename: 'propiedad-4.jpg',
    description: 'Chalet independiente en Puerta de Hierro'
  },
  {
    url: 'https://placekitten.com/900/600',
    filename: 'equipo-gozamadrid.jpg',
    description: 'Equipo de realestategozamadrid.com'
  }
];

const downloadImage = (url, filename) => {
  return new Promise((resolve, reject) => {
    const targetDir = path.join(__dirname, '../../../../public/img/lujo');
    
    // Asegurarse de que el directorio existe
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }
    
    const filePath = path.join(targetDir, filename);
    const file = fs.createWriteStream(filePath);
    
    https.get(url, (response) => {
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`✓ Descargada imagen: ${filename}`);
        resolve();
      });
      
      file.on('error', (err) => {
        fs.unlink(filePath, () => {});
        console.error(`✗ Error descargando ${filename}:`, err.message);
        reject(err);
      });
    }).on('error', (err) => {
      fs.unlink(filePath, () => {});
      console.error(`✗ Error descargando ${filename}:`, err.message);
      reject(err);
    });
  });
};

const downloadAllImages = async () => {
  console.log('Iniciando descarga de imágenes...');
  
  try {
    for (const image of imagesToDownload) {
      await downloadImage(image.url, image.filename);
    }
    console.log('¡Todas las imágenes descargadas con éxito!');
  } catch (error) {
    console.error('Error en el proceso de descarga:', error);
  }
};

downloadAllImages();
