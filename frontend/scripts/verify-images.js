#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Lista de imágenes críticas que deben estar presentes
const criticalImages = [
  'logonuevo.png',
  'logo.png',
  'fondoamarillo.jpg',
  'fondonegro.jpg',
  'gzmdinero.png',
  'inicio.jpg',
  'gozamadridwp.jpg',
  'analisis.png',
  'agenteinmo.png',
  'analisisdemercado.jpeg',
  'agentesinmobiliarios.jpeg',
  'formFoto.jpeg',
  'exp-gold.gif',
  'guia.jpg',
  'acuerdosyconvenios.jpg',
  'favicon-32x32.png',
  'favicon-16x16.png',
  'manifest.json'
];

const publicDir = path.join(__dirname, '..', 'public');

console.log('🔍 Verificando imágenes críticas...');
console.log(`📁 Directorio público: ${publicDir}`);

let missingImages = [];
let foundImages = [];

criticalImages.forEach(imageName => {
  const imagePath = path.join(publicDir, imageName);
  
  if (fs.existsSync(imagePath)) {
    const stats = fs.statSync(imagePath);
    foundImages.push({
      name: imageName,
      size: (stats.size / 1024).toFixed(2) + ' KB',
      path: imagePath
    });
    console.log(`✅ ${imageName} - ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    missingImages.push(imageName);
    console.log(`❌ ${imageName} - NO ENCONTRADA`);
  }
});

console.log('\n📊 Resumen:');
console.log(`✅ Imágenes encontradas: ${foundImages.length}`);
console.log(`❌ Imágenes faltantes: ${missingImages.length}`);

if (missingImages.length > 0) {
  console.log('\n🚨 Imágenes faltantes:');
  missingImages.forEach(img => console.log(`   - ${img}`));
  console.log('\n⚠️  Algunas imágenes críticas no están presentes. Esto puede causar errores 404 en producción.');
  process.exit(1);
} else {
  console.log('\n🎉 Todas las imágenes críticas están presentes!');
  process.exit(0);
} 