const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'public/video.mp4',
  'public/videoExpIngles.mp4',
  'public/madrid.jpg',
  'public/logo.png',
  'public/logonuevo.png',
  'public/manifest.json',
  'public/favicon.ico',
  'public/marta.jpeg'
];

console.log('🔍 Verificando archivos críticos...\n');

let allFilesExist = true;
let totalSize = 0;

criticalFiles.forEach(file => {
  const filePath = path.join(__dirname, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    const sizeInMB = (stats.size / (1024 * 1024)).toFixed(2);
    totalSize += stats.size;
    console.log(`✅ ${file} (${sizeInMB} MB)`);
  } else {
    console.log(`❌ ${file} - FALTANTE`);
    allFilesExist = false;
  }
});

console.log(`\n📊 Tamaño total: ${(totalSize / (1024 * 1024)).toFixed(2)} MB`);

if (allFilesExist) {
  console.log('\n🎉 Todos los archivos críticos están presentes');
  process.exit(0);
} else {
  console.log('\n⚠️ Faltan archivos críticos. El despliegue puede fallar.');
  process.exit(1);
}

// Verificar que el directorio de API existe
const apiDir = path.join(__dirname, 'src', 'app', 'api', 'images');
if (fs.existsSync(apiDir)) {
  console.log('✅ Directorio de API de imágenes existe');
} else {
  console.log('❌ Directorio de API de imágenes no existe');
}

console.log('🔍 Verificación completada'); 