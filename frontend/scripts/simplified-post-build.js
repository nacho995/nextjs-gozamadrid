/**
 * Simplified Post-build script con mejor manejo de errores para Vercel
 */

const fs = require('fs');
const path = require('path');

// Configuración
const config = {
  outputDir: path.resolve(__dirname, '../out'),
  scriptTag: '<script id="script-loader" src="/script-loader.js"></script>',
  insertAfter: '<head>'
};

// Función principal
async function insertScriptLoader() {
  console.log('Iniciando proceso post-build simplificado...');
  
  try {
    // Verificar la existencia del directorio de salida
    if (!fs.existsSync(config.outputDir)) {
      console.warn(`Advertencia: El directorio ${config.outputDir} no existe. Intentando crear...`);
      fs.mkdirSync(config.outputDir, { recursive: true });
    }
    
    // Leer todos los archivos HTML en el directorio de salida
    const files = fs.readdirSync(config.outputDir);
    const htmlFiles = files.filter(file => file.endsWith('.html'));
    
    console.log(`Encontrados ${htmlFiles.length} archivos HTML`);
    
    let modifiedCount = 0;
    
    // Procesar cada archivo HTML
    for (const htmlFile of htmlFiles) {
      const filePath = path.join(config.outputDir, htmlFile);
      
      try {
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
      } catch (fileError) {
        console.error(`Error al procesar el archivo ${htmlFile}:`, fileError.message);
      }
    }
    
    console.log(`Proceso completado. Modificados ${modifiedCount} de ${htmlFiles.length} archivos.`);
    return true;
  } catch (error) {
    console.error('Error durante el proceso:', error.message);
    // No salimos con código de error para no interrumpir el despliegue en Vercel
    console.log('Continuando con el despliegue a pesar del error...');
    return false;
  }
}

// Ejecutar el script
insertScriptLoader(); 