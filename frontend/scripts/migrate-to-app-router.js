/**
 * Script para ayudar con la migración desde Pages Router a App Router
 * Este script es informativo y debe ejecutarse manualmente paso por paso
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Este script te guiará en la migración de Pages Router a App Router');
console.log('IMPORTANTE: Este script no realiza cambios automáticos, solo proporciona instrucciones\n');

// Instrucciones paso a paso
console.log('Pasos para migrar de Pages Router a App Router:');
console.log('1. Crear la estructura básica de App Router');
console.log('   mkdir -p src/app');
console.log('   touch src/app/layout.jsx');
console.log('   touch src/app/page.jsx\n');

console.log('2. Migrar el contenido de _app.js y _document.js a layout.jsx:');
console.log('   - Implementar la estructura HTML básica en layout.jsx');
console.log('   - Mover los metadatos globales');
console.log('   - Mover los estilos globales\n');

console.log('3. Migrar las páginas individuales:');
console.log('   - Para cada archivo en src/pages/*.js:');
console.log('     - Crear una carpeta correspondiente en src/app');
console.log('     - Convertir el componente default export a page.jsx');
console.log('     - Actualizar los metadatos usando export const metadata');
console.log('     - Actualizar los imports y rutas según sea necesario\n');

console.log('4. Actualizar next.config.js:');
console.log('   - Eliminar "experimental.appDir: false"');
console.log('   - Considerar mantener output: "export" para generar estáticos\n');

console.log('5. Probar la aplicación:');
console.log('   - Ejecutar "npm run dev" para verificar que todo funciona correctamente');
console.log('   - Revisar las rutas, especialmente las dinámicas\n');

console.log('6. Cuando todo funcione, eliminar la carpeta pages:');
console.log('   - Hacer backup: cp -r src/pages src/pages-backup');
console.log('   - Eliminar: rm -rf src/pages\n');

console.log('Para más información, consulta la documentación oficial de Next.js:');
console.log('https://nextjs.org/docs/app/building-your-application/upgrading/app-router-migration'); 