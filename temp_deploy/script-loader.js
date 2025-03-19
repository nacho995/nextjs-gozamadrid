/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Script Loader v1.0
 * Carga los scripts de corrección en el orden adecuado y con la prioridad correcta
 */
(function() {
  // Configuración
  const config = {
    debug: true,
    scripts: [
      {
        id: 'early-error-interceptor',
        src: '/fixes/early-error-interceptor.js',
        priority: 'high', // 'high' se carga lo antes posible
        async: false,
        defer: false
      },
      {
        id: '404-handler',
        src: '/fixes/404-handler.js',
        priority: 'high',
        async: false,
        defer: false
      },
      {
        id: 'image-fallback',
        src: '/fixes/image-fallback.js',
        priority: 'high',
        async: false,
        defer: false
      },
      {
        id: 'mongodb-handler',
        src: '/mongodb-handler.js',
        priority: 'normal',
        async: true,
        defer: false
      },
      {
        id: 'property-handler',
        src: '/property-handler.js',
        priority: 'normal',
        async: true,
        defer: false
      }
    ]
  };
  
  // Función para registrar mensajes en la consola
  function log(message, data) {
    if (config.debug) {
      if (data) {
        console.log(`[ScriptLoader] ${message}`, data);
      } else {
        console.log(`[ScriptLoader] ${message}`);
      }
    }
  }
  
  // Verificar si un script ya está cargado
  function isScriptLoaded(id) {
    return !!document.getElementById(id);
  }
  
  // Cargar un script con la prioridad adecuada
  function loadScript(scriptConfig) {
    if (isScriptLoaded(scriptConfig.id)) {
      log(`Script ${scriptConfig.id} ya está cargado, saltando...`);
      return;
    }
    
    log(`Cargando script: ${scriptConfig.id}`);
    
    const script = document.createElement('script');
    script.id = scriptConfig.id;
    script.src = scriptConfig.src;
    
    // Establecer el tipo de contenido correcto para evitar problemas de MIME
    script.type = 'application/javascript';
    
    if (scriptConfig.async) script.async = true;
    if (scriptConfig.defer) script.defer = true;
    
    // Manejar eventos de carga
    script.onload = () => log(`Script ${scriptConfig.id} cargado correctamente`);
    script.onerror = (error) => {
      log(`Error cargando script ${scriptConfig.id}`, error);
      // Intentar cargar con un parámetro adicional para evitar caché
      retryScriptLoad(scriptConfig);
    };
    
    // Insertar el script según su prioridad
    if (scriptConfig.priority === 'high') {
      // Los scripts de alta prioridad van en <head> lo antes posible
      const head = document.head || document.getElementsByTagName('head')[0];
      head.insertBefore(script, head.firstChild);
    } else {
      // Los scripts de prioridad normal van al final del body
      const body = document.body || document.getElementsByTagName('body')[0];
      body.appendChild(script);
    }
  }
  
  // Función para reintentar la carga de un script
  function retryScriptLoad(scriptConfig) {
    log(`Reintentando carga del script: ${scriptConfig.id}`);
    
    const script = document.createElement('script');
    script.id = scriptConfig.id + '-retry';
    script.src = scriptConfig.src + '?retry=' + Date.now();
    script.type = 'application/javascript';
    
    if (scriptConfig.async) script.async = true;
    if (scriptConfig.defer) script.defer = true;
    
    script.onload = () => log(`Script ${scriptConfig.id} cargado correctamente en reintento`);
    script.onerror = (error) => {
      log(`Error en reintento de carga del script ${scriptConfig.id}`, error);
      // Si falla el reintento, crear una versión inline del script para casos críticos
      if (scriptConfig.priority === 'high') {
        createEmergencyFallback(scriptConfig);
      }
    };
    
    // Insertar el script
    if (scriptConfig.priority === 'high') {
      const head = document.head || document.getElementsByTagName('head')[0];
      head.insertBefore(script, head.firstChild);
    } else {
      const body = document.body || document.getElementsByTagName('body')[0];
      body.appendChild(script);
    }
  }
  
  // Crear una versión de emergencia para scripts críticos que no se pueden cargar
  function createEmergencyFallback(scriptConfig) {
    log(`Creando fallback de emergencia para: ${scriptConfig.id}`);
    
    // Fallbacks básicos para scripts críticos
    const fallbacks = {
      'early-error-interceptor': function() {
        window.addEventListener('error', function(event) {
          if (event.target && (event.target.tagName === 'SCRIPT' || event.target.tagName === 'LINK')) {
            console.error('Error cargando recurso:', event.target.src || event.target.href);
          }
        }, true);
      },
      '404-handler': function() {
        const originalFetch = window.fetch;
        window.fetch = function(resource, init) {
          if (typeof resource === 'string' && resource.includes('/api/')) {
            return originalFetch.apply(this, arguments)
              .then(response => {
                if (response.status === 404) {
                  console.warn('API no encontrada:', resource);
                  if (resource.includes('/api/properties')) {
                    return new Response(JSON.stringify({
                      properties: []
                    }), {
                      status: 200,
                      headers: { 'Content-Type': 'application/json' }
                    });
                  }
                }
                return response;
              })
              .catch(error => {
                console.error('Error en fetch:', error);
                throw error;
              });
          }
          return originalFetch.apply(this, arguments);
        };
      },
      'image-fallback': function() {
        document.querySelectorAll('img').forEach(img => {
          img.addEventListener('error', function() {
            if (!this.getAttribute('data-fallback-applied')) {
              this.setAttribute('data-fallback-applied', 'true');
              this.style.backgroundColor = '#6D28D9';
              this.style.display = 'flex';
              this.style.alignItems = 'center';
              this.style.justifyContent = 'center';
              this.style.color = 'white';
              this.style.fontSize = '12px';
              this.style.textAlign = 'center';
              this.style.padding = '10px';
              this.style.border = '1px solid #ccc';
              this.style.borderRadius = '5px';
              this.alt = this.alt || 'Imagen no disponible';
            }
          });
        });
      }
    };
    
    // Si tenemos un fallback para este script, ejecutarlo
    if (fallbacks[scriptConfig.id]) {
      // Crear un script inline
      const inlineScript = document.createElement('script');
      inlineScript.id = scriptConfig.id + '-emergency';
      inlineScript.textContent = `(${fallbacks[scriptConfig.id].toString()})();`;
      
      // Insertar al inicio del head
      const head = document.head || document.getElementsByTagName('head')[0];
      head.insertBefore(inlineScript, head.firstChild);
      
      log(`Fallback de emergencia creado para: ${scriptConfig.id}`);
    }
  }
  
  // Cargar todos los scripts
  function loadAllScripts() {
    log('Iniciando carga de scripts...');
    
    // Primero los scripts de alta prioridad
    const highPriorityScripts = config.scripts.filter(s => s.priority === 'high');
    highPriorityScripts.forEach(loadScript);
    
    // Luego los demás scripts
    const normalPriorityScripts = config.scripts.filter(s => s.priority !== 'high');
    
    // Cargar scripts normales después de que el DOM esté listo
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => {
        normalPriorityScripts.forEach(loadScript);
      });
    } else {
      normalPriorityScripts.forEach(loadScript);
    }
  }
  
  // Iniciar carga inmediatamente
  loadAllScripts();
})(); 