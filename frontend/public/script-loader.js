/**
 * Script Loader v1.0
 * Carga básica de scripts esenciales
 */
(function() {
  // Configuración simplificada
  const config = {
    debug: true,
    scripts: [
      {
        id: 'mongodb-handler',
        src: '/mongodb-handler.js',
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
    
    if (scriptConfig.async) script.async = true;
    if (scriptConfig.defer) script.defer = true;
    
    // Manejar eventos de carga
    script.onload = () => log(`Script ${scriptConfig.id} cargado correctamente`);
    script.onerror = (error) => log(`Error cargando script ${scriptConfig.id}`, error);
    
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