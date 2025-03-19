/**
 * Simplified Post-build script con mejor manejo de errores para Vercel
 */

const fs = require('fs');
const path = require('path');

// Simple script loader injection for HTML files
(async function() {
  try {
    console.log('Iniciando proceso post-build simplificado...');
    
    // Configuration
    const outputDir = path.resolve(__dirname, '../out');
    const scriptTag = '<script id="script-loader" src="/script-loader.js"></script>';
    const headTag = '<head>';
    
    // Verificar que el script-loader.js existe en public
    const scriptLoaderPath = path.resolve(__dirname, '../public/script-loader.js');
    
    if (!fs.existsSync(scriptLoaderPath)) {
      console.warn('⚠️ Advertencia: script-loader.js no encontrado en /public.');
      console.log('Continuando con el despliegue sin añadir el script-loader...');
      return;
    }
    
    // Verificar si el directorio de salida existe
    if (!fs.existsSync(outputDir)) {
      console.warn(`⚠️ Advertencia: El directorio de salida ${outputDir} no existe.`);
      console.log('Continuando con el despliegue sin procesar archivos HTML...');
      return;
    }
    
    try {
      // Verificar que podemos leer el directorio
      const files = fs.readdirSync(outputDir);
      const htmlFiles = files.filter(file => file.endsWith('.html'));
      
      if (htmlFiles.length === 0) {
        console.warn('⚠️ No se encontraron archivos HTML en el directorio de salida.');
        console.log('Continuando con el despliegue sin modificaciones...');
        return;
      }
      
      console.log(`📄 Encontrados ${htmlFiles.length} archivos HTML para procesar.`);
      
      let processedCount = 0;
      let successCount = 0;
      
      // Process each HTML file
      for (const htmlFile of htmlFiles) {
        processedCount++;
        
        try {
          const filePath = path.join(outputDir, htmlFile);
          const content = fs.readFileSync(filePath, 'utf8');
          
          // Skip if script is already included
          if (content.includes('id="script-loader"')) {
            console.log(`✓ Script ya incluido en ${htmlFile}, saltando...`);
            continue;
          }
          
          // Only insert if head tag exists
          if (content.includes(headTag)) {
            const updatedContent = content.replace(
              headTag,
              `${headTag}\n  ${scriptTag}`
            );
            
            fs.writeFileSync(filePath, updatedContent);
            successCount++;
            console.log(`✅ Script insertado correctamente en ${htmlFile}`);
          } else {
            console.warn(`⚠️ No se encontró la etiqueta <head> en ${htmlFile}`);
          }
        } catch (fileError) {
          console.error(`❌ Error al procesar ${htmlFile}: ${fileError.message}`);
          // Continue with next file
        }
      }
      
      console.log(`🎉 Proceso completado: ${successCount} de ${processedCount} archivos modificados correctamente.`);
    } catch (dirError) {
      console.error(`❌ Error al leer el directorio: ${dirError.message}`);
      console.log('Continuando con el despliegue sin modificaciones...');
    }
  } catch (error) {
    // Catch-all for any unexpected errors
    console.error(`❌ Error inesperado: ${error.message}`);
    console.log('Continuando con el despliegue a pesar del error...');
  }
})(); 