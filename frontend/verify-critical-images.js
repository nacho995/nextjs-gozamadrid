const fs = require('fs');
const path = require('path');

const criticalImages = [
  'logonuevo.png',
  'logo.png',
  'favicon.ico',
  'manifest.json'
];

console.log('🔍 Verificando imágenes críticas...');

let allPresent = true;

criticalImages.forEach(image => {
  const imagePath = path.join(__dirname, 'public', image);
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    console.log(`✅ ${image} - ${(stats.size / 1024).toFixed(1)} KB`);
  } else {
    console.log(`❌ ${image} - NO ENCONTRADO`);
    allPresent = false;
  }
});

if (allPresent) {
  console.log('✅ Todas las imágenes críticas están presentes');
} else {
  console.log('❌ Faltan imágenes críticas');
}

// Verificar que el directorio de API existe
const apiDir = path.join(__dirname, 'src', 'app', 'api', 'images');
if (fs.existsSync(apiDir)) {
  console.log('✅ Directorio de API de imágenes existe');
} else {
  console.log('❌ Directorio de API de imágenes no existe');
}

console.log('🔍 Verificación completada'); 