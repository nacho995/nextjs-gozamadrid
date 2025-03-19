/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Early Error Interceptor v1.0
 * Este script se carga al inicio y captura errores de carga de propiedades estáticas
 * antes de que Next.js tenga oportunidad de redireccionar a una página 404.
 */
(function() {
  // Patrón de ID de MongoDB
  const mongoIdPattern = /^[0-9a-fA-F]{24}$/;
  
  // Función para verificar si estamos en una página de propiedad
  function isPropertyPage() {
    return window.location.pathname.startsWith('/property/');
  }
  
  // Función para extraer el ID de propiedad de la URL
  function extractPropertyId() {
    if (!isPropertyPage()) return null;
    
    const path = window.location.pathname;
    return path.split('/property/')[1].split('/')[0].split('.')[0];
  }
  
  // Función para verificar si es un ID de MongoDB válido
  function isMongoId(id) {
    return mongoIdPattern.test(id);
  }
  
  // Función para mostrar un loader temporal
  function showLoader() {
    // Solo mostrar si no existe ya
    if (document.getElementById('early-loader')) return;
    
    const loader = document.createElement('div');
    loader.id = 'early-loader';
    loader.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(255,255,255,0.9);display:flex;align-items:center;justify-content:center;z-index:99999;';
    
    const content = document.createElement('div');
    content.style.cssText = 'text-align:center;';
    
    const spinner = document.createElement('div');
    spinner.style.cssText = 'width:50px;height:50px;border:5px solid rgba(245,158,11,0.2);border-left-color:rgb(245,158,11);border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 15px;';
    
    const message = document.createElement('div');
    message.textContent = 'Cargando propiedad...';
    message.style.cssText = 'color:#333;font-family:system-ui,-apple-system,sans-serif;font-size:16px;';
    
    // Añadir animación
    const style = document.createElement('style');
    style.textContent = '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
    
    content.appendChild(spinner);
    content.appendChild(message);
    loader.appendChild(content);
    
    // Añadir al documento apenas esté disponible
    if (document.body) {
      document.body.appendChild(loader);
      document.head.appendChild(style);
    } else {
      // Si el body aún no está disponible, esperar
      window.addEventListener('DOMContentLoaded', () => {
        document.body.appendChild(loader);
        document.head.appendChild(style);
      });
    }
  }
  
  // Redireccionar a la versión con hash de la propiedad
  function redirectToHashProperty(propertyId) {
    console.log(`[EarlyInterceptor] Redireccionando a: /#property=${propertyId}`);
    window.location.href = `/#property=${propertyId}`;
  }
  
  // Interceptor temprano para errores de Next.js
  function setupErrorInterceptor() {
    // Interceptar errores generales (incluidos los de red)
    window.addEventListener('error', function(event) {
      // Verificar si es un error relacionado con propiedades estáticas
      if (event.message && (
          event.message.includes('Failed to load static props') || 
          event.message.includes('ChunkLoadError') ||
          event.message.includes('Loading chunk') ||
          event.message.includes('NetworkError')
      )) {
        console.log('[EarlyInterceptor] Error detectado:', event.message);
        
        // Comprobar si estamos en una página de propiedad
        const propertyId = extractPropertyId();
        if (propertyId && isMongoId(propertyId)) {
          console.log(`[EarlyInterceptor] Detectada propiedad MongoDB: ${propertyId}`);
          
          // Mostrar loader y redireccionar
          showLoader();
          
          // Prevenir comportamiento por defecto si es posible
          if (event.preventDefault) {
            event.preventDefault();
          }
          
          // Redireccionar después de un breve retraso
          setTimeout(() => {
            redirectToHashProperty(propertyId);
          }, 300);
          
          return true;
        }
      }
    }, true); // Usar capture phase para interceptar antes
    
    // Observador de mutaciones para detectar contenido 404
    function detect404Content() {
      const observer = new MutationObserver(function(mutations) {
        for (const mutation of mutations) {
          if (mutation.type === 'childList' && mutation.addedNodes.length) {
            // Buscar indicadores de página 404
            const has404 = document.title.includes('404') || 
                          document.querySelector('.error-404') || 
                          document.querySelector('[data-error="404"]') ||
                          document.querySelector('h1:contains("404")') ||
                          document.querySelector('*:contains("not found")');
            
            if (has404) {
              console.log('[EarlyInterceptor] Contenido 404 detectado');
              
              const propertyId = extractPropertyId();
              if (propertyId && isMongoId(propertyId)) {
                console.log(`[EarlyInterceptor] Recuperando de 404 para propiedad: ${propertyId}`);
                
                showLoader();
                observer.disconnect();
                
                setTimeout(() => {
                  redirectToHashProperty(propertyId);
                }, 200);
              }
            }
          }
        }
      });
      
      // Observar cambios en el body
      if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
      } else {
        window.addEventListener('DOMContentLoaded', () => {
          observer.observe(document.body, { childList: true, subtree: true });
        });
      }
    }
    
    // Detectar contenido 404
    detect404Content();
  }
  
  // Comprobación rápida al iniciar
  function initialCheck() {
    // Si estamos en una página de propiedad, verificar el ID
    const propertyId = extractPropertyId();
    
    if (propertyId && isMongoId(propertyId)) {
      console.log(`[EarlyInterceptor] Propiedad MongoDB detectada: ${propertyId}`);
      
      // Si es ID de MongoDB, mostrar loader por si acaso
      showLoader();
      
      // Verificar si el hash ya está configurado para evitar redirección innecesaria
      if (!window.location.hash.startsWith('#property=')) {
        // Si estamos seguros de que es una propiedad MongoDB, redireccionar después de dejar
        // que Next.js intente cargarla por si tiene una versión estática
        setTimeout(() => {
          // Verificar si hay un error de carga visible o si el contenido aún no aparece
          const hasError = document.querySelector('.nextjs-error') || 
                          document.querySelector('.error-page') ||
                          document.title.includes('404');
          
          const propertyComponent = document.querySelector('.property-content');
          
          // Si hay error o no hay contenido de propiedad cargado, redireccionar al hash
          if (hasError || !propertyComponent) {
            console.log('[EarlyInterceptor] Contenido no cargado correctamente, redireccionando');
            redirectToHashProperty(propertyId);
          } else {
            // Si todo está bien, quitar el loader
            const loader = document.getElementById('early-loader');
            if (loader) loader.remove();
          }
        }, 1500); // Esperar 1.5 segundos para que Next.js intente cargar
      }
    }
  }
  
  // Iniciar el interceptor
  console.log('[EarlyInterceptor] Inicializando...');
  setupErrorInterceptor();
  
  // Ejecutar comprobación inicial después de que Next.js haya tenido tiempo de cargar
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initialCheck);
  } else {
    // Dar tiempo a que Next.js intente cargar antes de intervenir
    setTimeout(initialCheck, 200);
  }
})();

/**
 * Interceptor de errores temprano
 * Ayuda a manejar errores de carga de scripts y recursos
 */
(function() {
  // Configuración
  const config = {
    debug: true,
    maxRetries: 3,
    retryDelay: 500,
    correctMIMETypes: {
      js: 'application/javascript',
      css: 'text/css',
      json: 'application/json'
    }
  };

  // Para almacenar recursos que se están reintentando
  const retryingResources = new Map();

  // Función para registrar en consola
  function log(message, data) {
    if (config.debug) {
      console.log(`[ErrorInterceptor] ${message}`, data || '');
    }
  }

  // Interceptar errores en el evento error global
  window.addEventListener('error', function(event) {
    if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
      handleResourceError(event.target);
      // Evitar que el error se propague
      event.preventDefault();
      return false;
    }
  }, true); // Usar capturing para interceptar antes que otros handlers

  // Manejar errores de recursos
  function handleResourceError(element) {
    const src = element.src || element.href;
    if (!src) return;

    const extension = src.split('.').pop().toLowerCase();
    if (!extension || !config.correctMIMETypes[extension]) return;

    const retryCount = retryingResources.get(src) || 0;
    if (retryCount >= config.maxRetries) {
      log(`Máximo de reintentos alcanzado para ${src}`);
      return;
    }

    log(`Error cargando recurso: ${src}. Reintentando (${retryCount + 1}/${config.maxRetries})...`);
    retryingResources.set(src, retryCount + 1);

    // Esperar antes de reintentar
    setTimeout(() => {
      retryResource(element, src, extension);
    }, config.retryDelay * (retryCount + 1));
  }

  // Reintentar cargar el recurso
  function retryResource(element, src, extension) {
    log(`Reintentando carga: ${src}`);

    // Crear un nuevo elemento
    let newElement;
    
    if (element.tagName === 'SCRIPT') {
      newElement = document.createElement('script');
      newElement.type = config.correctMIMETypes[extension];
      newElement.src = src + (src.includes('?') ? '&' : '?') + 'retry=' + Date.now();
      if (element.async) newElement.async = true;
      if (element.defer) newElement.defer = true;
    } else if (element.tagName === 'LINK' && element.rel === 'stylesheet') {
      newElement = document.createElement('link');
      newElement.rel = 'stylesheet';
      newElement.href = src + (src.includes('?') ? '&' : '?') + 'retry=' + Date.now();
      newElement.type = config.correctMIMETypes[extension];
    }

    if (newElement) {
      // Reemplazar el elemento original
      const parent = element.parentNode;
      if (parent) {
        parent.replaceChild(newElement, element);
        log(`Elemento reemplazado: ${src}`);
      }
    }
  }

  // Modificar fetch para interceptar respuestas HTTP con MIME types incorrectos
  const originalFetch = window.fetch;
  window.fetch = function() {
    return originalFetch.apply(this, arguments)
      .then(response => {
        if (!response.ok && response.status === 404) {
          const url = response.url;
          const extension = url.split('.').pop().toLowerCase();
          
          if (extension && config.correctMIMETypes[extension]) {
            log(`Detectada respuesta 404 para ${url}. Podría ser un problema de MIME type.`);
          }
        }
        return response;
      })
      .catch(error => {
        log(`Error en fetch: ${error.message}`);
        throw error;
      });
  };

  log('Interceptor de errores inicializado');
})(); 