// Script para descargar imágenes de Unsplash para la landing page de propiedades de lujo
const https = require('https');
const fs = require('fs');
const path = require('path');

// Imágenes de Unsplash para propiedades de lujo
const imagesToDownload = [
  {
    // Imagen para el header - propiedad de lujo en Madrid
    url: 'https://source.unsplash.com/random/1920x1080/?luxury,apartment,madrid',
    filename: 'madrid-luxury-property.jpg'
  },
  {
    // Ático de lujo en Salamanca
    url: 'https://source.unsplash.com/random/800x600/?penthouse,luxury',
    filename: 'propiedad-1.jpg'
  },
  {
    // Villa exclusiva en La Moraleja
    url: 'https://source.unsplash.com/random/800x600/?villa,luxury',
    filename: 'propiedad-2.jpg'
  },
  {
    // Piso señorial en Jerónimos
    url: 'https://source.unsplash.com/random/800x600/?apartment,classic,luxury',
    filename: 'propiedad-3.jpg'
  },
  {
    // Chalet independiente en Puerta de Hierro
    url: 'https://source.unsplash.com/random/800x600/?mansion,modern',
    filename: 'propiedad-4.jpg'
  },
  {
    // Equipo de realestategozamadrid.com
    url: 'https://source.unsplash.com/random/900x600/?team,office,realestate',
    filename: 'equipo-gozamadrid.jpg'
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
  console.log('Iniciando descarga de imágenes desde Unsplash...');
  
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
