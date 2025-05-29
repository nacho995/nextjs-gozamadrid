const fs = require('fs');
const path = require('path');

// Archivos críticos que necesitan estar disponibles en la raíz
const criticalFiles = [
  'manifest.json',
  'favicon.ico',
  'logo.png',
  'video.mp4'
];

console.log('📋 Copiando archivos estáticos críticos...');

criticalFiles.forEach(file => {
  const source = path.join(__dirname, 'frontend', 'public', file);
  const destination = path.join(__dirname, file);
  
  try {
    if (fs.existsSync(source)) {
      fs.copyFileSync(source, destination);
      console.log(`✅ Copiado: ${file}`);
    } else {
      console.log(`⚠️ No encontrado: ${file}`);
    }
  } catch (error) {
    console.log(`❌ Error copiando ${file}:`, error.message);
  }
});

console.log('🎉 Proceso de copia completado'); 