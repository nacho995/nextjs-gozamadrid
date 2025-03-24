#!/usr/bin/env node

/**
 * Script para verificar variables de entorno en Vercel
 * 
 * Uso:
 * 1. Directamente: node scripts/check-vercel-env.js
 */

require('dotenv').config();

// Función para verificar una variable de entorno
function checkEnv(name, secret = false) {
  const value = process.env[name];
  const exists = !!value;
  const display = secret && exists ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}` : value;
  
  console.log(`${exists ? '✅' : '❌'} ${name}: ${exists ? (secret ? display : value) : 'NO CONFIGURADA'}`);
  
  return exists;
}

// Verificación principal
console.log('\n🔍 Verificando variables de entorno para Vercel');
console.log('==============================================');

const vercelVars = {
  // Variables de entorno básicas de Vercel
  vercel: ['VERCEL', 'VERCEL_ENV', 'VERCEL_URL', 'VERCEL_REGION'],
  
  // Variables de entorno públicas del proyecto
  public: [
    'NEXT_PUBLIC_WOO_COMMERCE_KEY',
    'NEXT_PUBLIC_WOO_COMMERCE_SECRET',
    'NEXT_PUBLIC_WC_API_URL',
  ],
  
  // Variables de entorno privadas del proyecto
  private: [
    'WOO_COMMERCE_KEY',
    'WOO_COMMERCE_SECRET',
  ],
};

// Verificar variables de entorno de Vercel
console.log('\n🔹 Variables de entorno de Vercel:');
const vercelCount = vercelVars.vercel.filter(v => checkEnv(v)).length;
console.log(`${vercelCount}/${vercelVars.vercel.length} variables de Vercel configuradas`);

// Verificar variables de entorno públicas
console.log('\n🔹 Variables de entorno públicas:');
const publicCount = vercelVars.public.filter(v => {
  const isSecret = v.includes('KEY') || v.includes('SECRET');
  return checkEnv(v, isSecret);
}).length;
console.log(`${publicCount}/${vercelVars.public.length} variables públicas configuradas`);

// Verificar variables de entorno privadas
console.log('\n🔹 Variables de entorno privadas:');
const privateCount = vercelVars.private.filter(v => checkEnv(v, true)).length;
console.log(`${privateCount}/${vercelVars.private.length} variables privadas configuradas`);

// Resultado final
console.log('\n📊 Resumen:');
const totalCount = vercelCount + publicCount + privateCount;
const totalVars = vercelVars.vercel.length + vercelVars.public.length + vercelVars.private.length;
const percentage = Math.round((totalCount / totalVars) * 100);

console.log(`${totalCount}/${totalVars} (${percentage}%) variables de entorno configuradas`);

if (percentage === 100) {
  console.log('✅ Todas las variables de entorno están configuradas correctamente');
} else if (percentage >= 70) {
  console.log('⚠️ La mayoría de las variables de entorno están configuradas, pero faltan algunas');
} else {
  console.log('❌ Faltan muchas variables de entorno importantes');
}

// Verificar entorno actual
console.log('\n🌐 Entorno actual:');
console.log(`Node.js: ${process.version}`);
console.log(`Entorno: ${process.env.NODE_ENV || 'No definido'}`);
console.log(`Directorio de trabajo: ${process.cwd()}`);

// Salir con código de éxito o error
if (percentage < 70) {
  console.log('\n❌ Verificación fallida: Configuración incompleta');
  process.exit(1);
} else {
  console.log('\n✅ Verificación completada');
  process.exit(0);
} 