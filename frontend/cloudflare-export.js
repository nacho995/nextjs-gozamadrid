#!/usr/bin/env node

/**
 * Script para preparar el sitio para Cloudflare Pages
 * Este script genera una versión estática del sitio y copia las funciones
 * de Cloudflare a la ubicación correcta.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Directorios
const sourceDirFunctions = path.resolve(__dirname, 'functions');
const targetDirFunctions = path.resolve(__dirname, '.cloudflare/functions');
const configSourcePath = path.resolve(__dirname, 'public/.well-known/cloudflare-pages.json');
const configTargetPath = path.resolve(__dirname, '.cloudflare/cloudflare-pages.json');

console.log('🚀 Preparando el sitio para Cloudflare Pages...');

// Crear directorio de salida si no existe
if (!fs.existsSync(path.resolve(__dirname, '.cloudflare'))) {
  fs.mkdirSync(path.resolve(__dirname, '.cloudflare'), { recursive: true });
}

// Realizar la construcción estática
try {
  console.log('🔨 Construyendo el sitio estático...');
  execSync('npm run build', { stdio: 'inherit' });
  console.log('✅ Construcción completada');
} catch (error) {
  console.error('❌ Error en la construcción:', error.message);
  process.exit(1);
}

// Copiar funciones de Cloudflare
if (fs.existsSync(sourceDirFunctions)) {
  console.log('📂 Copiando funciones de Cloudflare...');
  try {
    // Borrar directorio anterior si existe
    if (fs.existsSync(targetDirFunctions)) {
      fs.rmSync(targetDirFunctions, { recursive: true, force: true });
    }
    
    // Crear directorio destino
    fs.mkdirSync(targetDirFunctions, { recursive: true });
    
    // Función recursiva para copiar directorios
    const copyDir = (src, dest) => {
      // Crear directorio destino si no existe
      if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest, { recursive: true });
      }
      
      // Obtener todos los archivos y carpetas
      const entries = fs.readdirSync(src, { withFileTypes: true });
      
      // Copiar cada entrada
      for (const entry of entries) {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);
        
        if (entry.isDirectory()) {
          // Si es un directorio, llamar recursivamente
          copyDir(srcPath, destPath);
        } else {
          // Si es un archivo, copiar
          fs.copyFileSync(srcPath, destPath);
        }
      }
    };
    
    // Iniciar copia recursiva
    copyDir(sourceDirFunctions, targetDirFunctions);
    console.log('✅ Funciones copiadas correctamente');
  } catch (error) {
    console.error('❌ Error al copiar funciones:', error.message);
  }
}

// Copiar archivo de configuración
if (fs.existsSync(configSourcePath)) {
  console.log('📄 Copiando archivo de configuración...');
  try {
    fs.copyFileSync(configSourcePath, configTargetPath);
    console.log('✅ Configuración copiada correctamente');
  } catch (error) {
    console.error('❌ Error al copiar configuración:', error.message);
  }
}

console.log('🎉 Preparación completada. Ahora puedes desplegar el directorio "out" y ".cloudflare" a Cloudflare Pages');
console.log('📋 Comando de despliegue sugerido:');
console.log('wrangler pages deploy out --project-name=gozamadrid-frontend-new --commit-dirty=true'); 