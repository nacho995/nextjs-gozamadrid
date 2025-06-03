/**
 * CSS Fix Script para solucionar problemas de carga de hojas de estilo en Vercel
 * 
 * Este script detecta errores en la carga de hojas de estilo CSS y las carga 
 * manualmente como elementos <style> si es necesario.
 */

export function initCssFix() {
  console.log('[CSS Fix] Inicializando script de solución para CSS');
  
  // Monitorear errores de carga en las hojas de estilo
  window.addEventListener('error', function(e) {
    // Verificar si el error es de un recurso de tipo link/stylesheet
    if (e.target && e.target.tagName === 'LINK' && e.target.rel === 'stylesheet') {
      console.warn('[CSS Fix] Error al cargar hoja de estilos:', e.target.href);
      
      // Intentar cargar el CSS manualmente
      loadCssInline(e.target.href);
    }
  }, true);
  
  // Verificar todas las hojas de estilo al inicio
  setTimeout(checkAllStylesheets, 1000);
}

/**
 * Carga una hoja de estilos como CSS inline
 */
async function loadCssInline(url) {
  try {
    console.log('[CSS Fix] Intentando cargar CSS inline desde:', url);
    
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('La respuesta no fue exitosa: ' + response.status);
    }
    
    const css = await response.text();
    console.log('[CSS Fix] CSS cargado correctamente, aplicando como estilo inline');
    
    // Crear un nuevo elemento style e inyectar el CSS
    const style = document.createElement('style');
    style.textContent = css;
    style.setAttribute('data-source', url);
    document.head.appendChild(style);
    
    console.log('[CSS Fix] CSS aplicado como estilo inline');
  } catch (error) {
    console.error('[CSS Fix] Error al cargar el CSS inline:', error);
    // En caso de error, intentar cargar un CSS básico
    applyBasicCss();
  }
}

/**
 * Aplica un CSS básico como fallback
 */
function applyBasicCss() {
  console.log('[CSS Fix] Aplicando CSS básico como último recurso');
  
  const basicCss = `
    html, body {
      margin: 0;
      padding: 0;
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #ffffff;
      color: #000000;
    }
    
    /* Estilos para la página 404 */
    .error-container {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(to bottom, #1a202c, #2d3748);
      color: white;
      padding: 1rem;
    }
    .error-content {
      max-width: 28rem;
      width: 100%;
      text-align: center;
    }
    .error-title {
      font-size: 2.25rem;
      font-weight: bold;
      margin-bottom: 1rem;
    }
    .error-message {
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }
    .error-button {
      background-color: #C7A336;
      color: white;
      padding: 0.75rem 1.5rem;
      border-radius: 0.375rem;
      display: inline-block;
      text-decoration: none;
    }
  `;
  
  const style = document.createElement('style');
  style.textContent = basicCss;
  style.setAttribute('data-source', 'basic-fallback');
  document.head.appendChild(style);
}

/**
 * Verifica todas las hojas de estilo para asegurarse de que se han cargado
 */
function checkAllStylesheets() {
  console.log('[CSS Fix] Verificando todas las hojas de estilo');
  
  // Obtener todas las hojas de estilo en el documento
  const stylesheets = document.querySelectorAll('link[rel="stylesheet"]');
  let loadedCount = 0;
  
  stylesheets.forEach(function(stylesheet) {
    // Verificar si la hoja de estilo se ha cargado correctamente
    if (stylesheet.sheet) {
      loadedCount++;
    } else {
      console.warn('[CSS Fix] La hoja de estilo no parece estar cargada:', stylesheet.href);
      
      // Intentar cargar manualmente
      loadCssInline(stylesheet.href);
    }
  });
  
  console.log('[CSS Fix] Hojas de estilo cargadas:', loadedCount, 'de', stylesheets.length);
  
  // Si no hay hojas de estilo o todas fallaron, aplicar CSS básico
  if (stylesheets.length === 0 || loadedCount === 0) {
    console.warn('[CSS Fix] No se detectaron hojas de estilo cargadas correctamente');
    applyBasicCss();
  }
} 