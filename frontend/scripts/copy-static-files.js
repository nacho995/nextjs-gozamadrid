#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '..', 'public');
const buildDir = path.join(__dirname, '..', '.next', 'static');
const outDir = path.join(__dirname, '..', 'out');

// Lista de archivos críticos que deben copiarse
const criticalFiles = [
  'logonuevo.png',
  'logo.png',
  'manifest.json',
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png'
];

console.log('📁 Copiando archivos estáticos críticos...');

// Función para copiar archivo
function copyFile(src, dest) {
  try {
    if (!fs.existsSync(path.dirname(dest))) {
      fs.mkdirSync(path.dirname(dest), { recursive: true });
    }
    fs.copyFileSync(src, dest);
    console.log(`✅ Copiado: ${path.basename(src)}`);
    return true;
  } catch (error) {
    console.error(`❌ Error copiando ${path.basename(src)}:`, error.message);
    return false;
  }
}

// Copiar archivos críticos al directorio out (para export estático)
if (fs.existsSync(outDir)) {
  console.log('\n📦 Copiando a directorio out/...');
  criticalFiles.forEach(file => {
    const src = path.join(publicDir, file);
    const dest = path.join(outDir, file);
    
    if (fs.existsSync(src)) {
      copyFile(src, dest);
    } else {
      console.warn(`⚠️  Archivo no encontrado: ${file}`);
    }
  });
}

// Verificar que los archivos existen en public
console.log('\n🔍 Verificando archivos en public/...');
let allFilesExist = true;

criticalFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  if (fs.existsSync(filePath)) {
    const stats = fs.statSync(filePath);
    console.log(`✅ ${file} - ${(stats.size / 1024).toFixed(2)} KB`);
  } else {
    console.error(`❌ ${file} - NO ENCONTRADO`);
    allFilesExist = false;
  }
});

if (allFilesExist) {
  console.log('\n🎉 Todos los archivos críticos están presentes!');
  process.exit(0);
} else {
  console.error('\n🚨 Algunos archivos críticos faltan!');
  process.exit(1);
} 