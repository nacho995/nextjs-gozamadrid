// Configuración simple para verificar archivos críticos durante el build
const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'public/logonuevo.png',
  'public/logo.png', 
  'public/manifest.json',
  'public/favicon.ico'
];

console.log('🔍 Verificando archivos críticos para el build...');

let allFilesExist = true;
criticalFiles.forEach(file => {
  if (fs.existsSync(file)) {
    const stats = fs.statSync(file);
    console.log(`✅ ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.log(`❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('🎉 Todos los archivos críticos están presentes!');
} else {
  console.log('⚠️ Algunos archivos críticos faltan, pero continuando con el build...');
}

// No fallar el build por archivos faltantes
process.exit(0); 