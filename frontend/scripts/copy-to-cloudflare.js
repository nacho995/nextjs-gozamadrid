const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios
const sourceDir = path.resolve(__dirname, '../out');
const targetDir = path.resolve(__dirname, '../../cloudflare-deploy');

console.log('Copiando archivos de Next.js al directorio de despliegue de Cloudflare...');

// Verificar que exista el directorio source
if (!fs.existsSync(sourceDir)) {
  console.error(`El directorio source no existe: ${sourceDir}`);
  process.exit(1);
}

// Verificar que exista el directorio target
if (!fs.existsSync(targetDir)) {
  console.error(`El directorio target no existe: ${targetDir}`);
  process.exit(1);
}

// Crear directorio _next si no existe
const nextDir = path.join(targetDir, '_next');
if (!fs.existsSync(nextDir)) {
  fs.mkdirSync(nextDir, { recursive: true });
}

// Copiar archivos
try {
  console.log('Copiando archivos estáticos...');
  execSync(`cp -r ${sourceDir}/* ${targetDir}/`);
  console.log('Archivos copiados correctamente.');
} catch (error) {
  console.error('Error al copiar archivos:', error.message);
  process.exit(1);
}

// Verificar que index.html existe
const indexHtml = path.join(targetDir, 'index.html');
if (!fs.existsSync(indexHtml)) {
  console.error(`No se encontró index.html en el directorio target: ${indexHtml}`);
  process.exit(1);
}

console.log('Despliegue completado con éxito. Los archivos están listos para ser desplegados en Cloudflare.'); 