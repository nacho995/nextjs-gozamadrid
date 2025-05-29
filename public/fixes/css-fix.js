/**
 * CSS Fixer v1.0
 * Detecta errores 404 de estilos CSS y los intenta cargar desde _next/static/css
 */
(function() {
  console.log('[CSS-Fixer] Inicializando corrector de CSS...');
  
  // Crear un elemento <link> para los estilos
  function createCssLink(href) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.type = 'text/css';
    link.href = href;
    return link;
  }
  
  // Interceptar errores de carga
  window.addEventListener('error', function(e) {
    const target = e.target;
    // Verificar si es un error de carga de CSS
    if (target && target.tagName === 'LINK' && 
        target.rel === 'stylesheet' && 
        target.href && 
        target.href.indexOf('styles.css') !== -1) {
      
      console.log('[CSS-Fixer] Detectado error de carga de CSS:', target.href);
      
      // Buscar archivos CSS en _next/static/css
      fetch('/_next/static/css/')
        .then(response => {
          if (response.ok) {
            return response.text();
          }
          throw new Error('No se pudo acceder al directorio CSS');
        })
        .then(html => {
          // Extraer nombres de archivos CSS del HTML de directorio
          const cssFiles = Array.from(html.matchAll(/href="([^"]+\.css)"/g)).map(m => m[1]);
          if (cssFiles.length > 0) {
            console.log('[CSS-Fixer] Encontrados archivos CSS:', cssFiles);
            
            // Cargar cada archivo CSS encontrado
            cssFiles.forEach(cssFile => {
              const fullPath = `/_next/static/css/${cssFile.split('/').pop()}`;
              console.log('[CSS-Fixer] Cargando CSS alternativo:', fullPath);
              document.head.appendChild(createCssLink(fullPath));
            });
          }
        })
        .catch(error => {
          console.error('[CSS-Fixer] Error al buscar archivos CSS alternativos:', error);
          
          // Plan B: Intentar cargar el primer CSS que encontremos en _next
          const cssLink = createCssLink('/_next/static/css/91e3ce29c75b18dd.css');
          document.head.appendChild(cssLink);
          console.log('[CSS-Fixer] Intentando cargar CSS predeterminado');
        });
      
      // Evitar que se siga propagando el error original
      e.preventDefault();
      return true;
    }
  }, true);
  
  // También verificamos inmediatamente si ya hay un link de estilos que no esté cargando
  setTimeout(() => {
    const styleLinks = document.querySelectorAll('link[rel="stylesheet"]');
    let needsFixing = false;
    
    styleLinks.forEach(link => {
      if (!link.sheet && link.href.indexOf('styles.css') !== -1) {
        console.log('[CSS-Fixer] Detectado link de estilos no cargado:', link.href);
        needsFixing = true;
      }
    });
    
    if (needsFixing || styleLinks.length === 0) {
      console.log('[CSS-Fixer] Aplicando fix de estilos inmediatamente');
      // Agregar el CSS manualmente
      const cssLink = createCssLink('/_next/static/css/91e3ce29c75b18dd.css');
      document.head.appendChild(cssLink);
    }
  }, 1000);
})(); 