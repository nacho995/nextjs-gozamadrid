/**
 * 404 Handler v1.0
 * Redirige a la página principal si estamos en la raíz y muestra un 404
 */
(function() {
  console.log('[404-Handler] Inicializando...');
  
  // Verificar si estamos en una página 404
  function is404Page() {
    // Verifica si el título o el contenido indican que es una página 404
    return document.title.includes('404') || 
           document.body.textContent.includes('Página no encontrada') ||
           document.querySelector('h1, h2, h3, h4, h5')?.textContent.includes('no encontrada');
  }
  
  // Verificar si estamos en la raíz
  function isRootPath() {
    const path = window.location.pathname;
    return path === '/' || path === '/index' || path === '/index.html';
  }
  
  // Redireccionar a la página específica
  function redirectToMainPage() {
    // Intentamos redirigir a la primera página que exista
    const pagesToTry = [
      '/index.html',
      '/vender-comprar.html',
      '/listar-propiedades.html',
      '/vender.html',
      '/contacto.html'
    ];
    
    console.log('[404-Handler] Intentando redirigir a una página válida...');
    
    // Verificar cuál de las páginas existe y redirigir a la primera que encontremos
    const checkPage = (index) => {
      if (index >= pagesToTry.length) {
        console.log('[404-Handler] No se encontró ninguna página válida');
        return;
      }
      
      const page = pagesToTry[index];
      fetch(page)
        .then(response => {
          if (response.ok) {
            console.log(`[404-Handler] Redirigiendo a ${page}`);
            window.location.href = page;
          } else {
            checkPage(index + 1);
          }
        })
        .catch(() => checkPage(index + 1));
    };
    
    checkPage(0);
  }
  
  // Función principal
  function handlePossible404() {
    // Si estamos en la raíz y es una página 404, redirigir
    if (isRootPath() && is404Page()) {
      console.log('[404-Handler] Detectada página 404 en la raíz');
      redirectToMainPage();
    }
  }
  
  // Ejecutar después de que la página se haya cargado completamente
  if (document.readyState === 'complete') {
    handlePossible404();
  } else {
    window.addEventListener('load', handlePossible404);
  }
})(); 