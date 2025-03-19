/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Property Handler - Integración para propiedades MongoDB
 * Versión 2.3
 * 
 * Maneja la carga y visualización de propiedades de MongoDB
 * desde la API de GozaMadrid.
 */
(function() {
  // No ejecutar en desarrollo local excepto para pruebas
  if ((window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
      && !window.location.search.includes('test_property_handler=true')) {
    console.log('PropertyHandler: Ejecutando en desarrollo local, no activo (usar test_property_handler=true para pruebas)');
    return;
  }

  console.log('PropertyHandler: Inicializado v2.6');

  // Control de intentos de recuperación para evitar bucles infinitos
  let recoveryAttempts = 0;
  const MAX_RECOVERY_ATTEMPTS = 3;
  let recoveryOverlayCreated = false;
  let isLoadingProperty = false;
  let currentPropertyId = null;
  let propertyData = null;
  const API_TIMEOUT = 30000; // Aumentado a 30 segundos

  /**
   * Determina si un ID corresponde a una propiedad MongoDB
   */
  function isMongoDBId(id) {
    return id && /^[0-9a-f]{24}$/i.test(id);
  }

  /**
   * Obtiene el ID de propiedad desde la URL actual
   */
  function getPropertyIdFromUrl() {
    // Comprobar formato /property/ID
    const pathMatch = window.location.pathname.match(/\/property\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      console.log('PropertyHandler: ID detectado en la ruta:', pathMatch[1]);
      return pathMatch[1];
    }
    
    // Comprobar parámetros de URL
    const urlParams = new URLSearchParams(window.location.search);
    const paramId = urlParams.get('property_id');
    if (paramId) {
      console.log('PropertyHandler: ID detectado en parámetros:', paramId);
      return paramId;
    }
    
    return null;
  }

  /**
   * Redirige a la versión API de la propiedad si es necesario
   */
  function redirectToApiVersion(id) {
    if (!id) return false;
    
    // IMPORTANTE: Ahora redirigimos al formato correcto /property/[id]
    // en lugar de la ruta de API incorrecta
    const currentPath = window.location.pathname;
    
    if (currentPath.startsWith('/api/') || 
        currentPath.includes('/property-direct/') || 
        currentPath.includes('/property-id/')) {
      
      // Si estamos en una ruta de API, redirigir a la página de propiedad
      const newUrl = `/property/${id}`;
      console.log(`PropertyHandler: Redirigiendo de API a página de propiedad: ${newUrl}`);
      window.location.href = newUrl;
      return true;
    }
    
    // Eliminar el parámetro source=mongodb si existe, puede causar problemas de ruteo
    const currentUrl = new URL(window.location.href);
    if (currentUrl.searchParams.has('source')) {
      currentUrl.searchParams.delete('source');
      const newUrl = currentUrl.toString();
      console.log(`PropertyHandler: Eliminando parámetro source, redirigiendo a: ${newUrl}`);
      window.history.replaceState({}, document.title, newUrl);
    }
    
    return false;
  }

  /**
   * Crea un overlay para mostrar que se está cargando/recuperando la propiedad
   */
  function showRecoveryOverlay(propertyId) {
    // Evitar crear múltiples overlays
    if (recoveryOverlayCreated) {
      return;
    }
    
    console.log('PropertyHandler: Mostrando overlay de recuperación para ID:', propertyId);
    
    // Incrementar contador de intentos
    recoveryAttempts++;
    
    // Crear overlay
    const overlay = document.createElement('div');
    overlay.id = 'property-recovery-overlay';
    overlay.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(255, 255, 255, 0.9);
      z-index: 9999;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      color: #333;
      padding: 20px;
      text-align: center;
    `;
    
    let statusMessage;
    
    if (recoveryAttempts > MAX_RECOVERY_ATTEMPTS) {
      // Mensaje de error después de demasiados intentos
      statusMessage = `
        <h2 style="margin-bottom: 20px;">No se pudo cargar la propiedad</h2>
        <p style="margin-bottom: 15px;">Lo sentimos, no pudimos cargar la información de esta propiedad después de varios intentos (ID: ${propertyId}).</p>
        <p style="margin-bottom: 20px;">Por favor, inténtelo de nuevo más tarde o contacte con nosotros si el problema persiste.</p>
        <button id="go-home-button" style="padding: 10px 20px; background-color: #0070f3; color: white; border: none; border-radius: 4px; cursor: pointer;">Volver a la página principal</button>
        <button id="retry-button" style="padding: 10px 20px; background-color: #333; color: white; border: none; border-radius: 4px; cursor: pointer; margin-left: 10px;">Intentar de nuevo</button>
      `;
    } else {
      // Mensaje de carga normal
      statusMessage = `
        <h2 style="margin-bottom: 20px;">Cargando propiedad...</h2>
        <p style="margin-bottom: 15px;">Estamos recuperando los datos de esta propiedad desde nuestra base de datos.</p>
        <div style="width: 50px; height: 50px; border: 5px solid #f3f3f3; border-top: 5px solid #0070f3; border-radius: 50%; animation: spin 1s linear infinite; margin-bottom: 20px;"></div>
        <p>ID de Propiedad: ${propertyId}</p>
        <p style="font-size: 0.8em; margin-top: 10px;">Intento ${recoveryAttempts} de ${MAX_RECOVERY_ATTEMPTS}</p>
      `;
    }
    
    overlay.innerHTML = `
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
      ${statusMessage}
    `;
    
    // Agregar al DOM
    document.body.appendChild(overlay);
    recoveryOverlayCreated = true;
    
    // Configurar botones si existen
    const homeButton = document.getElementById('go-home-button');
    if (homeButton) {
      homeButton.addEventListener('click', function() {
        window.location.href = '/';
      });
    }
    
    const retryButton = document.getElementById('retry-button');
    if (retryButton) {
      retryButton.addEventListener('click', function() {
        recoveryAttempts = 0;
        removeRecoveryOverlay();
        setTimeout(() => {
          fetchPropertyData(propertyId);
        }, 500);
      });
    }
    
    if (recoveryAttempts <= MAX_RECOVERY_ATTEMPTS) {
      // Intentar cargar la propiedad después de un corto retraso
      setTimeout(() => {
        fetchPropertyData(propertyId);
      }, 1500);
    }
  }

  /**
   * Elimina el overlay de recuperación
   */
  function removeRecoveryOverlay() {
    const overlay = document.getElementById('property-recovery-overlay');
    if (overlay) {
      overlay.remove();
      recoveryOverlayCreated = false;
    }
  }

  /**
   * Intenta varias APIs para obtener los datos de la propiedad
   */
  async function fetchPropertyData(id) {
    if (!id || isLoadingProperty) return null;
    
    isLoadingProperty = true;
    currentPropertyId = id;
    console.log(`PropertyHandler: Cargando datos de propiedad ${id} (intento ${recoveryAttempts}/${MAX_RECOVERY_ATTEMPTS})`);
    
    try {
      // Intentar múltiples endpoints en orden
      const apiUrls = [
        `/api/property-id?id=${id}&format=json&t=${Date.now()}`,
        `/api/properties?id=${id}&source=mongodb&t=${Date.now()}`,
        `/api/property-direct/${id}?format=json&t=${Date.now()}`
      ];
      
      let successData = null;
      let lastError = null;
      
      // Probar cada URL hasta encontrar una que funcione
      for (const apiUrl of apiUrls) {
        try {
          console.log('PropertyHandler: Consultando API:', apiUrl);
          
          const response = await fetch(apiUrl, {
            headers: {
              'Accept': 'application/json',
              'Cache-Control': 'no-cache'
            },
            // Timeout para evitar esperar indefinidamente
            signal: AbortSignal.timeout(API_TIMEOUT)
          });
          
          if (!response.ok) {
            console.warn(`PropertyHandler: Error HTTP ${response.status} en ${apiUrl}`);
            continue; // Intentar siguiente URL
          }
          
          const data = await response.json();
          
          // Verificar si tenemos datos válidos
          if (data && data.property) {
            successData = data.property;
            console.log('PropertyHandler: Datos recibidos correctamente de', apiUrl);
            break; // Salir del bucle si tenemos éxito
          } else if (data && data.properties && data.properties.length > 0) {
            successData = data.properties[0];
            console.log('PropertyHandler: Datos recibidos del listado en', apiUrl);
            break;
          }
        } catch (urlError) {
          console.warn(`PropertyHandler: Error al consultar ${apiUrl}:`, urlError);
          lastError = urlError;
          // Continuar con la siguiente URL
        }
      }
      
      if (successData) {
        // Tenemos datos exitosos
        propertyData = successData;
        
        // Guardar en localStorage como caché de respaldo
        try {
          localStorage.setItem(`mongodb_property_${id}`, JSON.stringify({
            timestamp: Date.now(),
            property: successData
          }));
        } catch (e) {
          console.warn('PropertyHandler: Error al guardar en localStorage:', e);
        }
        
        // Exponer para componentes React
        window.__PROPERTY_DATA__ = successData;
        window.__MONGO_PROPERTY_DATA__ = successData;
        
        // Si se creó un overlay, quitarlo
        removeRecoveryOverlay();
        
        // Inyectar datos en la página
        injectPropertyData(successData);
        isLoadingProperty = false;
        recoveryAttempts = 0;  // Resetear contador de intentos
        
        return successData;
      } else {
        // Ninguna API tuvo éxito
        throw lastError || new Error('Ninguna API devolvió datos válidos');
      }
    } catch (error) {
      console.error('PropertyHandler: Error al cargar datos:', error);
      
      // Intentar recuperar de localStorage como respaldo
      try {
        const cached = localStorage.getItem(`mongodb_property_${id}`);
        if (cached) {
          const parsedCache = JSON.parse(cached);
          if (parsedCache && parsedCache.property) {
            console.log('PropertyHandler: Usando datos de caché:', parsedCache.property);
            propertyData = parsedCache.property;
            
            // Exponer para componentes React
            window.__PROPERTY_DATA__ = parsedCache.property;
            window.__MONGO_PROPERTY_DATA__ = parsedCache.property;
            
            // Inyectar datos en la página
            injectPropertyData(parsedCache.property);
            isLoadingProperty = false;
            recoveryAttempts = 0;  // Resetear contador de intentos
            
            // Quitar overlay si existe
            removeRecoveryOverlay();
            
            return parsedCache.property;
          }
        }
      } catch (e) {
        console.error('PropertyHandler: Error al recuperar caché:', e);
      }
      
      isLoadingProperty = false;
      
      // Si aún no hemos excedido intentos máximos, mostrar overlay
      if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
        showRecoveryOverlay(id);
      } else if (recoveryAttempts === MAX_RECOVERY_ATTEMPTS) {
        // Último intento
        showRecoveryOverlay(id);
      } else {
        // Demasiados intentos, redirigir a home si no hay overlay
        if (!recoveryOverlayCreated) {
          showRecoveryOverlay(id);
        }
      }
      
      return null;
    }
  }

  /**
   * Inyecta los datos de la propiedad en la página
   */
  function injectPropertyData(property) {
    if (!property) return;
    
    console.log('PropertyHandler: Inyectando datos de propiedad en la página');
    
    // Asegurarnos de que la propiedad tiene todas las propiedades necesarias
    property.title = property.title || property.name || 'Propiedad en Madrid';
    property.description = property.description || property.content || '';
    
    // Si no hay contenedor para la propiedad, crearlo
    const existingContainer = document.querySelector('.property-content, [data-property-component="true"], .property-detail, #property-detail');
    
    if (!existingContainer) {
      console.log('PropertyHandler: Creando contenedor de propiedad porque no existe');
      
      // Buscar el contenedor principal donde insertar nuestro contenido
      const mainContainer = document.querySelector('main') || document.querySelector('.main') || document.body;
      
      // Crear un nuevo contenedor
      const propertyContainer = document.createElement('div');
      propertyContainer.className = 'property-detail';
      propertyContainer.id = 'property-detail';
      propertyContainer.setAttribute('data-property-component', 'true');
      propertyContainer.setAttribute('data-mongodb-id', property._id || property.id);
      
      // Crear contenido HTML básico para la propiedad
      propertyContainer.innerHTML = `
        <div class="property-header">
          <h1 class="property-title">${property.title}</h1>
          <div class="property-price">${typeof property.price === 'number' ? `${property.price.toLocaleString('es-ES')}€` : (property.price || '')}</div>
        </div>
        <div class="property-images"></div>
        <div class="property-description">${property.description}</div>
      `;
      
      // Insertar al principio del contenedor principal
      mainContainer.insertBefore(propertyContainer, mainContainer.firstChild);
    }
    
    // Crear evento personalizado
    const event = new CustomEvent('propertyDataLoaded', {
      detail: { property }
    });
    
    // Disparar eventos
    document.dispatchEvent(event);
    window.dispatchEvent(new CustomEvent('property-data-loaded', { 
      detail: { property } 
    }));
    
    // Buscar elementos donde inyectar datos (incluyendo el que acabamos de crear)
    const titleElements = document.querySelectorAll('h1.property-title, .property-header h1, .property-name, .property-title');
    const descElements = document.querySelectorAll('.property-description, .property-desc, .description');
    const priceElements = document.querySelectorAll('.property-price, .price');
    const imageContainers = document.querySelectorAll('.property-images, .gallery, .image-gallery');
    
    // Actualizar título
    titleElements.forEach(el => {
      if (property.title) {
        el.textContent = property.title;
      }
    });
    
    // Actualizar descripción
    descElements.forEach(el => {
      if (property.description) {
        el.innerHTML = property.description;
      }
    });
    
    // Actualizar precio
    priceElements.forEach(el => {
      if (property.price) {
        el.textContent = typeof property.price === 'number' 
          ? `${property.price.toLocaleString('es-ES')}€` 
          : property.price;
      }
    });
    
    // Actualizar imágenes si hay contenedor
    if (imageContainers.length > 0 && property.images && property.images.length > 0) {
      const container = imageContainers[0];
      
      // Limpiar contenedor
      container.innerHTML = '';
      
      // Crear elementos de imagen
      property.images.forEach(img => {
        let imgUrl = '';
        if (typeof img === 'string') {
          imgUrl = img;
        } else if (img.url) {
          imgUrl = img.url;
        } else if (img.src) {
          imgUrl = img.src;
        }
        
        if (!imgUrl) return;
        
        const imgElement = document.createElement('img');
        imgElement.src = imgUrl;
        imgElement.alt = property.title || 'Imagen de propiedad';
        imgElement.className = 'property-image';
        imgElement.style.maxWidth = '100%';
        imgElement.style.height = 'auto';
        imgElement.style.marginBottom = '10px';
        
        container.appendChild(imgElement);
      });
    }
    
    // Actualizar el título de la página
    document.title = `${property.title} | GozaMadrid`;
    
    // Revisar si necesitamos eliminar el mensaje de 404
    // Corregido: Usamos una búsqueda más segura y directa para encontrar el mensaje 404
    try {
      // Buscar todos los h2 y verificar su contenido
      const allH2Elements = document.querySelectorAll('h2');
      for (let i = 0; i < allH2Elements.length; i++) {
        const h2 = allH2Elements[i];
        if (h2.textContent.includes('This page could not be found')) {
          const notFoundContainer = h2.closest('div');
          if (notFoundContainer) {
            console.log('PropertyHandler: Eliminando mensaje de 404');
            notFoundContainer.style.display = 'none';
          }
          break;
        }
      }
    } catch (error) {
      console.warn('PropertyHandler: Error al intentar ocultar mensaje 404:', error);
    }
  }

  /**
   * Inicializa la detección y carga de propiedades
   */
  function init() {
    console.log('PropertyHandler: Inicializando...');
    
    // Obtener ID de propiedad
    const propertyId = getPropertyIdFromUrl();
    
    if (propertyId) {
      console.log('PropertyHandler: ID de propiedad detectado:', propertyId);
      
      // Verificar si es un ID de MongoDB
      if (isMongoDBId(propertyId)) {
        console.log('PropertyHandler: Es una propiedad de MongoDB');
        
        // Verificar si debemos redirigir a versión API
        if (!redirectToApiVersion(propertyId)) {
          // Si no redirigimos, cargar datos
          // Agregar un breve retraso para asegurar que la página esté cargada
          setTimeout(() => {
            fetchPropertyData(propertyId);
          }, 300);
        }
      } else {
        console.log('PropertyHandler: No es un ID de MongoDB, no necesita intervención');
      }
    } else {
      console.log('PropertyHandler: No se detectó ID de propiedad en la URL');
    }
  }
  
  // Exponer funciones útiles globalmente
  window.propertyHandler = {
    isMongoDBId,
    getPropertyId: getPropertyIdFromUrl,
    fetchProperty: fetchPropertyData,
    setProperty: function(property) {
      propertyData = property;
      injectPropertyData(property);
    },
    getCurrentProperty: function() {
      return propertyData;
    },
    onLoadError: function(id) {
      // Si MongoDBHandler reporta un error, intentamos recuperar
      if (recoveryAttempts < MAX_RECOVERY_ATTEMPTS) {
        showRecoveryOverlay(id);
      }
    },
    forceReload: function(id) {
      recoveryAttempts = 0;
      isLoadingProperty = false;
      if (id || currentPropertyId) {
        fetchPropertyData(id || currentPropertyId);
      }
    }
  };
  
  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})(); 