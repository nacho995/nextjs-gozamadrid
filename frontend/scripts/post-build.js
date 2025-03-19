/**
 * Post-build script
 * Este script inserta nuestro script-loader en todos los archivos HTML después del build
 */

const fs = require('fs');
const path = require('path');
const glob = require('glob');

// Configuración
const config = {
  outputDir: path.resolve(__dirname, '../out'),
  scriptTag: '<script id="script-loader" src="/script-loader.js"></script>',
  insertAfter: '<head>'
};

// Función principal
async function insertScriptLoader() {
  console.log('Iniciando proceso post-build...');
  
  // Buscar todos los archivos HTML en el directorio de salida
  const htmlFiles = glob.sync('**/*.html', { cwd: config.outputDir });
  console.log(`Encontrados ${htmlFiles.length} archivos HTML`);
  
  let modifiedCount = 0;
  
  // Procesar cada archivo HTML
  for (const htmlFile of htmlFiles) {
    const filePath = path.join(config.outputDir, htmlFile);
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Verificar si el script ya está incluido
    if (content.includes('id="script-loader"')) {
      console.log(`Script ya incluido en ${htmlFile}, saltando...`);
      continue;
    }
    
    // Insertar el script después de la etiqueta <head>
    if (content.includes(config.insertAfter)) {
      content = content.replace(
        config.insertAfter,
        `${config.insertAfter}\n  ${config.scriptTag}`
      );
      fs.writeFileSync(filePath, content);
      modifiedCount++;
      console.log(`Script insertado en ${htmlFile}`);
    } else {
      console.warn(`No se encontró la etiqueta ${config.insertAfter} en ${htmlFile}`);
    }
  }
  
  console.log(`Proceso completado. Modificados ${modifiedCount} de ${htmlFiles.length} archivos.`);
}

// Verificar la existencia del directorio de salida
if (!fs.existsSync(config.outputDir)) {
  console.error(`Error: El directorio ${config.outputDir} no existe.`);
  process.exit(1);
}

// Ejecutar el script
insertScriptLoader().catch(error => {
  console.error('Error durante el proceso:', error);
  process.exit(1);
}); 