/**
 * MongoDB Property Loader v1.1
 * Script especializado para cargar propiedades de MongoDB de forma eficiente
 */
(function() {
  // Control de ejecución para evitar múltiples instancias
  if (window._mongoDBPropertyLoader) {
    console.log('MongoDB Property Loader: Ya inicializado');
    return;
  }

  console.log('MongoDB Property Loader: Inicializado v1.1');
  
  // Estado del cargador
  const state = {
    currentPropertyId: null,
    loadingInProgress: false,
    lastAttempt: 0,
    failedAttempts: 0,
    MAX_RETRIES: 3,
    RETRY_DELAY: 2000,
    properties: {} // Caché local
  };
  
  /**
   * Determina si un ID es de MongoDB
   */
  function isMongoDBId(id) {
    return id && /^[0-9a-f]{24}$/i.test(id);
  }
  
  /**
   * Extrae el ID de la propiedad de la URL
   */
  function getPropertyIdFromUrl() {
    // Comprobar formato /property/ID
    const pathMatch = window.location.pathname.match(/\/property\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      const id = pathMatch[1];
      if (isMongoDBId(id)) {
        return id;
      }
    }
    
    // Comprobar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('property_id');
    if (paramId && isMongoDBId(paramId)) {
      return paramId;
    }
    
    return null;
  }
  
  /**
   * Carga una propiedad desde la API con manejo de errores mejorado
   */
  async function loadProperty(id) {
    if (!id || !isMongoDBId(id)) {
      throw new Error('ID inválido para cargar propiedad de MongoDB');
    }
    
    // Verificar si ya está en caché local
    if (state.properties[id] && Date.now() - state.properties[id].timestamp < 300000) {
      console.log('MongoDB Property Loader: Usando propiedad en caché:', id);
      return state.properties[id].data;
    }
    
    // Control para evitar múltiples solicitudes simultáneas
    if (state.loadingInProgress) {
      console.log('MongoDB Property Loader: Ya hay una carga en progreso, esperando...');
      
      // Esperar a que termine la carga actual
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!state.loadingInProgress) {
            clearInterval(checkInterval);
            resolve();
          }
        }, 100);
      });
      
      // Verificar si ahora tenemos la propiedad cargada
      if (state.properties[id]) {
        return state.properties[id].data;
      }
    }
    
    state.loadingInProgress = true;
    state.currentPropertyId = id;
    state.lastAttempt = Date.now();
    
    // URLs de API a intentar (por orden de prioridad)
    const apiUrls = [
      `/api/property-id?id=${id}&format=json&t=${Date.now()}`,
      `/api/properties?id=${id}&source=mongodb&t=${Date.now()}`
    ];
    
    let propertyData = null;
    let lastError = null;
    
    // Intentar cada URL
    for (const apiUrl of apiUrls) {
      try {
        console.log(`MongoDB Property Loader: Consultando API: ${apiUrl}`);
        
        // Usar AbortSignal para timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 segundos
        
        const response = await fetch(apiUrl, {
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache'
          },
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Error HTTP ${response.status}`);
        }
        
        const data = await response.json();
        
        // Verificar si tenemos datos válidos
        if (data && data.property) {
          propertyData = data.property;
          break; // Salir del bucle si encontramos la propiedad
        } else if (data && data.properties && data.properties.length > 0) {
          propertyData = data.properties[0];
          break;
        } else {
          throw new Error('Respuesta sin datos válidos de propiedad');
        }
      } catch (error) {
        lastError = error;
        console.warn(`MongoDB Property Loader: Error en ${apiUrl}:`, error.message);
        // Continuar con la siguiente URL
      }
    }
    
    // Si no pudimos cargar la propiedad, intentar recuperar de localStorage
    if (!propertyData) {
      try {
        const cached = localStorage.getItem(`mongodb_property_${id}`);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (parsedCache && parsedCache.property) {
            console.log('MongoDB Property Loader: Recuperando de localStorage:', id);
            propertyData = parsedCache.property;
          }
        }
      } catch (e) {
        console.error('Error al recuperar de localStorage:', e);
      }
    }
    
    // Almacenar el resultado en caché local
    if (propertyData) {
      console.log('MongoDB Property Loader: Propiedad cargada correctamente:', id);
      state.properties[id] = {
        data: propertyData,
        timestamp: Date.now(),
        source: 'api'
      };
      
      // Guardar en localStorage como respaldo
      try {
        localStorage.setItem(`mongodb_property_${id}`, JSON.stringify({
          timestamp: Date.now(),
          property: propertyData
        }));
      } catch (e) {
        console.warn('Error al guardar en localStorage:', e);
      }
      
      // Exponer para otros scripts
      window.__MONGO_PROPERTY_DATA__ = propertyData;
      
      // Resetear contador de intentos fallidos
      state.failedAttempts = 0;
    } else {
      console.error('MongoDB Property Loader: No se pudo cargar la propiedad:', id);
      state.failedAttempts++;
      
      if (lastError) {
        throw lastError;
      } else {
        throw new Error('No se pudo cargar la propiedad');
      }
    }
    
    state.loadingInProgress = false;
    return propertyData;
  }
  
  /**
   * Inicializa el cargador de propiedades
   */
  async function init() {
    const propertyId = getPropertyIdFromUrl();
    
    if (propertyId) {
      console.log('MongoDB Property Loader: Detectada propiedad en URL:', propertyId);
      
      try {
        // Indicar a otros scripts que estamos intentando cargar
        const initEvent = new CustomEvent('mongodb-property-loading', {
          detail: { propertyId }
        });
        document.dispatchEvent(initEvent);
        
        // Cargar la propiedad
        const property = await loadProperty(propertyId);
        
        // Notificar que la propiedad está cargada
        const event = new CustomEvent('mongodb-property-loaded', {
          detail: { property }
        });
        document.dispatchEvent(event);
        window.dispatchEvent(event);
        
        // Si tenemos handlers de propiedad registrados, notificarlos
        if (window.propertyHandler && typeof window.propertyHandler.setProperty === 'function') {
          window.propertyHandler.setProperty(property);
        }
        
        return property;
      } catch (error) {
        console.error('MongoDB Property Loader: Error al cargar propiedad:', error);
        
        // Notificar el error
        const errorEvent = new CustomEvent('mongodb-property-error', {
          detail: { propertyId, error: error.message }
        });
        document.dispatchEvent(errorEvent);
        
        // Si tenemos handlers de error registrados, notificarlos
        if (window.propertyHandler && typeof window.propertyHandler.onLoadError === 'function') {
          window.propertyHandler.onLoadError(propertyId, error);
        }
        
        // Programar reintento si no hemos excedido el máximo
        if (state.failedAttempts < state.MAX_RETRIES) {
          console.log(`MongoDB Property Loader: Programando reintento ${state.failedAttempts + 1}/${state.MAX_RETRIES}...`);
          
          setTimeout(() => {
            init();
          }, state.RETRY_DELAY);
        }
      }
    }
  }
  
  // Exponer API pública
  window._mongoDBPropertyLoader = {
    loadProperty,
    getPropertyId: getPropertyIdFromUrl,
    isMongoDBId,
    getState: () => ({ ...state }),
    reload: () => {
      state.failedAttempts = 0;
      state.loadingInProgress = false;
      return init();
    }
  };
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState !== 'loading') {
    init();
  } else {
    document.addEventListener('DOMContentLoaded', init);
  }
})(); 