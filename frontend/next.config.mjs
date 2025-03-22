// next.config.mjs - Configuración complementaria para Next.js
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

// Función para ejecutar el script post-build
const runPostBuildScript = async () => {
  try {
    console.log('Ejecutando script post-build para insertar script-loader...');
    execSync('node scripts/simplified-post-build.js', { stdio: 'inherit' });
    return true;
  } catch (error) {
    console.error('Error en el script post-build:', error);
    return false;
  }
};

// Función para verificar archivos esenciales
const verifyEssentialFiles = () => {
  const essentialFiles = [
    { path: 'public/config.js', name: 'Configuración global' },
    { path: 'public/script-loader.js', name: 'Cargador de scripts' },
    { path: 'public/mongodb-handler.js', name: 'Manejador de MongoDB' }
  ];
  
  let allFilesExist = true;
  
  for (const file of essentialFiles) {
    const filePath = path.resolve(process.cwd(), file.path);
    
    if (!fs.existsSync(filePath)) {
      console.error(`⚠️ ADVERTENCIA: El archivo ${file.name} (${file.path}) no existe.`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
};

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Asegurarnos de que las configuraciones de next.config.js se apliquen también
  ...require('./next.config.js'),
  
  // Hooks de construcción
  onBuildStart: async () => {
    console.log('🚀 Iniciando construcción de Next.js...');
    verifyEssentialFiles();
  },
  
  // Hook de post-construcción para insertar scripts
  onBuildComplete: async () => {
    console.log('✅ Construcción de Next.js completada, ejecutando tareas post-build...');
    await runPostBuildScript();
  }
};

export default nextConfig; 