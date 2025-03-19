/**
 * 404 Handler v1.1
 * Este script detecta errores 404 en páginas de propiedades y redirige a la implementación adecuada
 */
(function() {
  const NotFoundHandler = {
    config: {
      debug: true,
      mongoIdPattern: /^[0-9a-fA-F]{24}$/,
      redirectDelay: 100
    },
    
    init: function() {
      this.log('Inicializando 404 Handler v1.1...');
      
      // Detectar si estamos en una página 404
      if (document.title.includes('404') || 
          document.querySelector('.error-404') || 
          document.querySelector('[data-error="404"]')) {
        this.log('Página 404 detectada');
        this.handleNotFound();
      }
      
      // Vigilar cambios en la URL para propiedades
      this.watchPropertyLinks();
      
      // Interceptar errores de carga de propiedades estáticas
      this.interceptStaticPropsError();
    },
    
    log: function(message, data) {
      if (this.config.debug) {
        if (data) {
          console.log(`[404Handler] ${message}`, data);
        } else {
          console.log(`[404Handler] ${message}`);
        }
      }
    },
    
    handleNotFound: function() {
      // Obtener la URL actual
      const currentPath = window.location.pathname;
      this.log(`Analizando ruta: ${currentPath}`);
      
      // Comprobar si es una página de propiedad
      if (currentPath.startsWith('/property/')) {
        const propertyId = currentPath.split('/property/')[1].split('/')[0].split('.')[0];
        this.log(`ID encontrado en URL 404: ${propertyId}`);
        
        // Verificar si es un ID de MongoDB
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`ID válido de MongoDB detectado en URL 404: ${propertyId}`);
          
          // Redirigir usando el enfoque de hash routing para compatibilidad con los scripts existentes
          setTimeout(() => {
            window.location.href = `/#property=${propertyId}`;
          }, this.config.redirectDelay);
          
          return true;
        }
      }
      
      return false;
    },
    
    interceptStaticPropsError: function() {
      // Interceptar errores de carga de propiedades estáticas en runtime
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('Failed to load static props')) {
          this.log('Detectado error de carga de props estáticas');
          
          // Verificar si estamos en una URL de propiedad
          const path = window.location.pathname;
          if (path.startsWith('/property/')) {
            const propertyId = path.split('/property/')[1].split('/')[0].split('.')[0];
            this.log(`ID encontrado en URL con error: ${propertyId}`);
            
            if (this.config.mongoIdPattern.test(propertyId)) {
              this.log(`Recuperando de error en propiedad MongoDB: ${propertyId}`);
              
              // Prevenir comportamiento por defecto y mostrar un loader temporal
              event.preventDefault();
              this.showLoadingIndicator();
              
              // Redirigir a la versión hash para que mongodb-handler.js la procese
              setTimeout(() => {
                window.location.href = `/#property=${propertyId}`;
              }, 500);
              
              return true;
            }
          }
        }
      }, true); // Capture phase para intentar interceptar antes que otros handlers
    },
    
    // Mostrar un indicador de carga temporal mientras se redirige
    showLoadingIndicator: function() {
      const loader = document.createElement('div');
      loader.id = 'temp-loading-indicator';
      loader.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.7);display:flex;align-items:center;justify-content:center;z-index:9999;';
      
      const spinnerContainer = document.createElement('div');
      spinnerContainer.style.cssText = 'background:white;padding:20px;border-radius:8px;text-align:center;';
      
      const spinner = document.createElement('div');
      spinner.style.cssText = 'width:40px;height:40px;border:4px solid rgba(0,0,0,0.1);border-left-color:#f59e0b;border-radius:50%;animation:spin 1s linear infinite;margin:0 auto 10px;';
      
      const text = document.createElement('p');
      text.textContent = 'Cargando propiedad...';
      text.style.cssText = 'margin:0;font-family:system-ui,-apple-system,sans-serif;';
      
      // Añadir animación de spin
      const style = document.createElement('style');
      style.textContent = '@keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}';
      document.head.appendChild(style);
      
      spinnerContainer.appendChild(spinner);
      spinnerContainer.appendChild(text);
      loader.appendChild(spinnerContainer);
      document.body.appendChild(loader);
    },
    
    watchPropertyLinks: function() {
      // Observar clicks en enlaces a propiedades
      document.addEventListener('click', (e) => {
        const link = e.target.closest('a');
        if (!link) return;
        
        const href = link.getAttribute('href');
        if (!href || !href.startsWith('/property/')) return;
        
        const propertyId = href.split('/property/')[1].split('/')[0].split('.')[0];
        
        // Si es un ID de MongoDB, verificar si la página existe o podría dar 404
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`Interceptando clic en enlace a propiedad MongoDB: ${propertyId}`);
          
          // Prevenir navegación tradicional
          e.preventDefault();
          
          // Mostrar indicador de carga
          this.showLoadingIndicator();
          
          // Redirigir directamente con hash para el procesamiento de mongodb-handler.js
          setTimeout(() => {
            window.location.href = `/#property=${propertyId}`;
          }, 100);
        }
      });
      
      // Detectar cambios en el hash para procesar propiedades de MongoDB
      window.addEventListener('hashchange', () => {
        const hash = window.location.hash;
        if (hash.startsWith('#property=')) {
          const propertyId = hash.replace('#property=', '');
          
          if (this.config.mongoIdPattern.test(propertyId)) {
            this.log(`Procesando propiedad MongoDB desde hash: ${propertyId}`);
            
            // Verificar si exist el manejador de MongoDB
            if (window.mongoDBHandler && typeof window.mongoDBHandler.loadProperty === 'function') {
              // Usar la función de carga directamente
              window.mongoDBHandler.loadProperty(propertyId);
            }
          }
        }
      });
      
      // Comprobar el hash al cargar
      if (window.location.hash.startsWith('#property=')) {
        const propertyId = window.location.hash.replace('#property=', '');
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`Propiedad MongoDB en hash detectada al cargar: ${propertyId}`);
          
          // Dar tiempo para que otros scripts se inicialicen
          setTimeout(() => {
            if (window.mongoDBHandler && typeof window.mongoDBHandler.loadProperty === 'function') {
              // Usar la función de carga directamente
              window.mongoDBHandler.loadProperty(propertyId);
            }
          }, 300);
        }
      }
    }
  };
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => NotFoundHandler.init());
  } else {
    NotFoundHandler.init();
  }
  
  // Exponer para uso externo
  window.notFoundHandler = NotFoundHandler;
})(); 