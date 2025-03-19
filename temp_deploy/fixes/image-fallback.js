/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Manejador de errores de carga de imágenes
 * Proporciona alternativas cuando las imágenes no se pueden cargar
 */
(function() {
  // Configuración
  const config = {
    debug: true,
    fallbackColors: ['#1E3A8A', '#6D28D9', '#BE185D', '#047857', '#92400E'],
    textColor: '#FFFFFF',
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif'
  };
  
  // Función para registrar en consola
  function log(message, data) {
    if (config.debug) {
      if (data) {
        console.log(`[ImageFallback] ${message}`, data);
      } else {
        console.log(`[ImageFallback] ${message}`);
      }
    }
  }
  
  // Obtener un color aleatorio del array de colores
  function getRandomColor() {
    const index = Math.floor(Math.random() * config.fallbackColors.length);
    return config.fallbackColors[index];
  }
  
  // Crear un elemento canvas con un gradiente colorido
  function createFallbackCanvas(width, height, alt) {
    const canvas = document.createElement('canvas');
    canvas.width = width || 300;
    canvas.height = height || 200;
    
    const ctx = canvas.getContext('2d');
    
    // Crear un gradiente
    const color = getRandomColor();
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, adjustColor(color, -30));
    
    // Rellenar el fondo
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Añadir un texto si hay un alt text
    if (alt && alt !== 'undefined' && alt !== 'null') {
      ctx.font = `bold ${Math.min(canvas.width / 20, 18)}px ${config.fontFamily}`;
      ctx.fillStyle = config.textColor;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      
      // Limitar el texto a un máximo de 25 caracteres
      const displayText = alt.length > 25 ? alt.substring(0, 22) + '...' : alt;
      
      // Añadir un fondo semi-transparente para el texto
      const textMetrics = ctx.measureText(displayText);
      const textWidth = textMetrics.width + 20;
      const textHeight = 30;
      const textX = canvas.width / 2 - textWidth / 2;
      const textY = canvas.height / 2 - textHeight / 2;
      
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(textX, textY, textWidth, textHeight);
      
      // Dibujar el texto
      ctx.fillStyle = config.textColor;
      ctx.fillText(displayText, canvas.width / 2, canvas.height / 2);
    }
    
    // Dibujar un icono de imagen no disponible
    drawImageIcon(ctx, canvas.width / 2, canvas.height / 3);
    
    return canvas;
  }
  
  // Dibujar un icono simple de imagen
  function drawImageIcon(ctx, x, y) {
    const size = 40;
    
    // Dibujar marco
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.rect(x - size/2, y - size/2, size, size);
    ctx.stroke();
    
    // Dibujar montañas (paisaje)
    ctx.beginPath();
    ctx.moveTo(x - size/2, y + size/2);
    ctx.lineTo(x - size/4, y);
    ctx.lineTo(x, y + size/4);
    ctx.lineTo(x + size/4, y - size/4);
    ctx.lineTo(x + size/2, y + size/6);
    ctx.lineTo(x + size/2, y + size/2);
    ctx.closePath();
    ctx.stroke();
    
    // Dibujar sol
    ctx.beginPath();
    ctx.arc(x + size/6, y - size/6, size/10, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    ctx.fill();
  }
  
  // Ajustar un color haciéndolo más claro u oscuro
  function adjustColor(hex, amount) {
    // Convertir hex a RGB
    let r = parseInt(hex.substring(1, 3), 16);
    let g = parseInt(hex.substring(3, 5), 16);
    let b = parseInt(hex.substring(5, 7), 16);
    
    // Ajustar valores RGB
    r = Math.max(0, Math.min(255, r + amount));
    g = Math.max(0, Math.min(255, g + amount));
    b = Math.max(0, Math.min(255, b + amount));
    
    // Convertir de nuevo a hex
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  
  // Actualizar una imagen fallida con un canvas como alternativa
  function updateImageWithFallback(image) {
    // Obtener dimensiones originales
    const width = image.width || 300;
    const height = image.height || 200;
    const alt = image.alt || 'Imagen no disponible';
    
    // Crear un canvas de reemplazo
    const canvas = createFallbackCanvas(width, height, alt);
    
    // Actualizar la imagen
    image.src = canvas.toDataURL('image/png');
    
    log(`Imagen reemplazada con fallback: ${alt}`);
  }
  
  // Añadir manejadores de error a todas las imágenes en la página
  function setupImageErrorHandlers() {
    log('Configurando manejadores de error para imágenes');
    
    // Escuchar el evento de error en todas las imágenes actuales
    document.querySelectorAll('img').forEach(img => {
      if (!img.hasAttribute('data-fallback-applied')) {
        img.setAttribute('data-fallback-applied', 'true');
        
        img.addEventListener('error', function() {
          updateImageWithFallback(this);
        });
      }
    });
    
    // Observar el DOM para nuevas imágenes
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        if (mutation.type === 'childList') {
          mutation.addedNodes.forEach(node => {
            if (node.nodeName === 'IMG' && !node.hasAttribute('data-fallback-applied')) {
              node.setAttribute('data-fallback-applied', 'true');
              
              node.addEventListener('error', function() {
                updateImageWithFallback(this);
              });
            } else if (node.querySelectorAll) {
              node.querySelectorAll('img').forEach(img => {
                if (!img.hasAttribute('data-fallback-applied')) {
                  img.setAttribute('data-fallback-applied', 'true');
                  
                  img.addEventListener('error', function() {
                    updateImageWithFallback(this);
                  });
                }
              });
            }
          });
        }
      });
    });
    
    // Iniciar observación
    observer.observe(document.body, { 
      childList: true,
      subtree: true
    });
  }
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupImageErrorHandlers);
  } else {
    setupImageErrorHandlers();
  }
  
  log('Manejador de fallback de imágenes inicializado');
})(); 