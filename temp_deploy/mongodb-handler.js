/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * MongoDB Property Handler v1.3
 * Este script detecta si la URL contiene un ID de MongoDB y carga la propiedad 
 * correspondiente directamente desde la API.
 */
(function() {
  const MongoDBHandler = {
    // Configuración
    config: {
      apiBaseUrl: 'https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com',
      propertyEndpoint: '/property',
      mongoIdPattern: /^[0-9a-fA-F]{24}$/,
      debug: window.appConfig?.debug || true
    },

    // Inicialización
    init: function() {
      this.log('Inicializando MongoDB Handler v1.3...');
      
      // Comprobar la URL actual cuando se carga la página
      this.checkCurrentUrl();
      
      // Escuchar cambios en la navegación
      window.addEventListener('popstate', () => this.checkCurrentUrl());
      
      // Interceptar clicks en enlaces internos
      document.addEventListener('click', (e) => this.handleLinkClick(e));

      // Escuchar eventos de mongodb-property-loader.js
      document.addEventListener('mongodb-property-loaded', (e) => {
        if (e.detail && e.detail.property) {
          this.log('Evento recibido: mongodb-property-loaded');
          this.renderProperty(e.detail.property);
        }
      });

      // Comprobar hash al inicio
      this.checkHash();

      // Escuchar cambios en el hash
      window.addEventListener('hashchange', () => this.checkHash());

      // Interceptar errores de carga de propiedades estáticas
      window.addEventListener('error', (event) => {
        if (event.message && event.message.includes('Failed to load static props')) {
          this.log('Detectado error de carga de props estáticas');
          
          // Verificar si estamos en una URL de propiedad
          const path = window.location.pathname;
          if (path.startsWith('/property/')) {
            const propertyId = path.split('/property/')[1].split('/')[0].split('.')[0];
            if (this.config.mongoIdPattern.test(propertyId)) {
              this.log('Recuperando de error en propiedad MongoDB');
              window.location.href = `/#property=${propertyId}`;
              event.preventDefault();
            }
          }
        }
      });
    },

    // Registrar mensajes en la consola
    log: function(message, data) {
      if (this.config.debug) {
        if (data) {
          console.log(`[MongoDBHandler] ${message}`, data);
        } else {
          console.log(`[MongoDBHandler] ${message}`);
        }
      }
    },

    // Verificar el hash para procesar propiedades
    checkHash: function() {
      const hash = window.location.hash;
      if (hash.startsWith('#property=')) {
        const propertyId = hash.replace('#property=', '');
        
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`Propiedad MongoDB en hash detectada: ${propertyId}`);
          this.loadProperty(propertyId);
        }
      }
    },

    // Comprobar la URL actual
    checkCurrentUrl: function() {
      // Primero verificar el hash que tiene prioridad
      if (window.location.hash.startsWith('#property=')) {
        return this.checkHash();
      }

      // Parámetros de consulta para compatibilidad con páginas anteriores
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.has('property_id')) {
        const propertyId = urlParams.get('property_id');
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`ID de MongoDB encontrado en parámetros: ${propertyId}`);
          // Actualizar a formato hash para consistencia
          window.history.replaceState(null, '', `/#property=${propertyId}`);
          this.loadProperty(propertyId);
          return true;
        }
      }
      
      // Verificar URL normal
      const path = window.location.pathname;
      this.log(`Comprobando URL: ${path}`);
      
      if (path.startsWith('/property/')) {
        const propertyId = path.split('/property/')[1].split('/')[0].split('.')[0];
        this.log(`ID encontrado en la URL: ${propertyId}`);
        
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`ID válido de MongoDB: ${propertyId}`);
          
          // Comprobar si ya existe un componente para esta propiedad
          const existingContainer = document.querySelector('.property-content[data-property-component="true"]');
          if (existingContainer) {
            this.log('Componente PropertyContent encontrado, saltando carga directa');
            // Añadir atributo para identificarlo como propiedad de MongoDB
            existingContainer.setAttribute('data-mongodb-id', propertyId);
            return true;
          }
          
          // Convertir a formato hash para consistencia y evitar problemas de Next.js
          window.history.replaceState(null, '', `/#property=${propertyId}`);
          this.loadProperty(propertyId);
          return true;
        }
      }
      
      return false;
    },

    // Manejar clics en enlaces
    handleLinkClick: function(e) {
      // Solo procesar enlaces que puedan ser de propiedades de MongoDB
      const link = e.target.closest('a');
      if (!link) return;
      
      const href = link.getAttribute('href');
      if (!href) return;
      
      // Comprobar si ya es un enlace de hash property
      if (href.startsWith('#property=')) {
        // Ya está en el formato correcto, dejarlo pasar
        return;
      }
      
      // Comprobar si es un enlace a una propiedad
      if (href.startsWith('/property/')) {
        const propertyId = href.split('/property/')[1].split('/')[0].split('.')[0];
        
        if (this.config.mongoIdPattern.test(propertyId)) {
          this.log(`Interceptando clic en enlace a propiedad MongoDB: ${propertyId}`);
          e.preventDefault(); // Siempre prevenir para IDs de MongoDB
          
          // Usar directamente el hash para propiedades MongoDB
          window.location.href = `/#property=${propertyId}`;
        }
      }
    },

    // Mostrar indicador de carga
    showLoading: function() {
      let loader = document.getElementById('mongodb-loader');
      
      if (!loader) {
        loader = document.createElement('div');
        loader.id = 'mongodb-loader';
        loader.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
        loader.innerHTML = `
          <div class="bg-white p-6 rounded-lg shadow-xl text-center">
            <div class="w-16 h-16 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p class="text-gray-800 font-semibold">Cargando propiedad...</p>
          </div>
        `;
        document.body.appendChild(loader);
      } else {
        loader.style.display = 'flex';
      }
    },

    // Ocultar indicador de carga
    hideLoading: function() {
      const loader = document.getElementById('mongodb-loader');
      if (loader) {
        loader.style.display = 'none';
      }
    },

    // Mostrar mensaje de error
    showError: function(message) {
      this.log(`Error: ${message}`);
      
      // Crear modal de error
      const errorModal = document.createElement('div');
      errorModal.className = 'fixed top-0 left-0 w-full h-full flex items-center justify-center bg-black bg-opacity-50 z-50';
      errorModal.innerHTML = `
        <div class="bg-white p-6 rounded-lg shadow-xl max-w-md mx-auto">
          <h3 class="text-xl font-bold text-red-600 mb-4">Error al cargar la propiedad</h3>
          <p class="text-gray-800 mb-6">${message}</p>
          <div class="flex justify-end">
            <button class="px-4 py-2 bg-amber-500 text-white rounded hover:bg-amber-600 transition-colors">Aceptar</button>
          </div>
        </div>
      `;
      
      // Cerrar el modal al hacer clic en el botón
      errorModal.querySelector('button').addEventListener('click', () => {
        errorModal.remove();
      });
      
      document.body.appendChild(errorModal);
    },

    // Cargar propiedad desde la API
    loadProperty: function(propertyId) {
      this.log(`Cargando propiedad: ${propertyId}`);
      this.showLoading();
      
      const url = `${this.config.apiBaseUrl}${this.config.propertyEndpoint}/${propertyId}`;
      
      fetch(url)
        .then(response => {
          if (!response.ok) {
            throw new Error(`Error al cargar la propiedad: ${response.status}`);
          }
          return response.json();
        })
        .then(data => {
          this.log('Datos de propiedad recibidos:', data);
          
          // Asegurar que tenga el campo source
          if (!data.source) {
            data.source = 'mongodb';
          }
          
          // Emitir evento para actualizar componentes existentes
          const event = new CustomEvent('property-data-available', {
            detail: { property: data }
          });
          document.dispatchEvent(event);
          
          // Solo renderizar si no hay un componente existente
          const existingContainer = document.querySelector('.property-content[data-property-component="true"]');
          if (!existingContainer) {
            this.renderProperty(data);
          }
        })
        .catch(error => {
          this.log('Error al cargar la propiedad:', error);
          this.showError(error.message);
        })
        .finally(() => {
          this.hideLoading();
        });
    },

    // Renderizar la propiedad en la página
    renderProperty: function(property) {
      if (!property) {
        this.log('Error: No se puede renderizar una propiedad indefinida');
        return;
      }
      
      this.log('Renderizando propiedad:', property.title || property.name);
      
      // Actualizar el título de la página
      document.title = `${property.title || property.name || 'Propiedad'} | Goza Madrid`;
      
      // Buscar un contenedor PropertyContent existente
      let propertyComponent = document.querySelector('.property-content[data-property-component="true"]');
      
      // Si existe el componente, solo actualizar sus datos
      if (propertyComponent) {
        this.log('Componente PropertyContent encontrado, actualizando datos');
        this.updateExistingComponent(propertyComponent, property);
        return;
      }
      
      // Si no existe, crear una visualización completa
      this.log('Creando visualización completa de la propiedad');
      this.createFullPropertyView(property);
    },
    
    // Actualizar un componente PropertyContent existente
    updateExistingComponent: function(component, property) {
      // Actualizar título si existe
      const titleElement = component.querySelector('h1');
      if (titleElement && property.title) {
        titleElement.textContent = property.title;
      }
      
      // Actualizar precio si existe
      const priceElement = component.querySelector('.property-price');
      if (priceElement && property.price) {
        priceElement.textContent = typeof property.price === 'number' 
          ? `${property.price.toLocaleString('es-ES')}€` 
          : property.price;
      }
      
      // Actualizar descripción si existe
      const descriptionElement = component.querySelector('.property-description');
      if (descriptionElement && property.description) {
        descriptionElement.innerHTML = property.description;
      }
      
      // Actualizar imágenes si existen
      const imageContainer = component.querySelector('.property-gallery');
      if (imageContainer && property.images && property.images.length > 0) {
        this.updateImages(imageContainer, property.images);
      }
    },
    
    // Actualizar imágenes en un contenedor existente
    updateImages: function(container, images) {
      // Implementación específica para actualizar imágenes
      this.log('Actualizando imágenes:', images.length);
      
      // Limpiar contenedor actual
      container.innerHTML = '';
      
      // Añadir imagen principal
      const mainImage = document.createElement('img');
      mainImage.src = images[0];
      mainImage.alt = 'Imagen principal de la propiedad';
      mainImage.className = 'w-full h-full object-cover';
      container.appendChild(mainImage);
      
      // Si hay más imágenes, añadir controles de navegación
      if (images.length > 1) {
        // Aquí iría el código para crear un carrusel
      }
    },
    
    // Crear una visualización completa de la propiedad
    createFullPropertyView: function(property) {
      this.log('Renderizando propiedad completa:', property.title || property.name);
      this.log('Imágenes disponibles:', property.images ? property.images.length : 0);
      
      // Limpiar toda la página para la visualización de propiedad
      document.body.className = 'property-view-active';
      
      // Obtener o crear el contenedor para la propiedad
      let container = document.getElementById('property-container');
      
      if (!container) {
        this.log('Creando contenedor para la propiedad');
        container = document.createElement('div');
        container.id = 'property-container';
        container.className = 'container mx-auto px-4 py-8';
        
        // Encontrar el contenedor principal
        const mainContent = document.querySelector('#main-content') || document.querySelector('main');
        
        if (mainContent) {
          mainContent.innerHTML = '';
          mainContent.appendChild(container);
        } else {
          // Si no hay main, insertarlo después del header o al principio del body
          const header = document.querySelector('header');
          if (header) {
            header.insertAdjacentElement('afterend', container);
          } else {
            document.body.prepend(container);
          }
        }
      } else {
        container.innerHTML = '';
      }
      
      // Crear el contenido de la propiedad
      const propertyContent = document.createElement('div');
      propertyContent.className = 'bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden property-content';
      propertyContent.setAttribute('data-property-id', property._id);
      propertyContent.setAttribute('data-property-component', 'true');
      propertyContent.setAttribute('data-source', 'mongodb');
      
      // Agregar imágenes en carrusel si existen
      if (property.images && property.images.length > 0) {
        const gallery = document.createElement('div');
        gallery.className = 'property-gallery relative h-[300px] md:h-[400px] lg:h-[500px] overflow-hidden';
        
        // Imagen principal
        const mainImage = document.createElement('img');
        mainImage.src = property.images[0];
        mainImage.alt = property.title || property.name || 'Imagen de propiedad';
        mainImage.className = 'w-full h-full object-cover';
        
        gallery.appendChild(mainImage);
        propertyContent.appendChild(gallery);
      }
      
      // Información principal
      const infoContainer = document.createElement('div');
      infoContainer.className = 'p-6';
      
      // Título y precio
      const header = document.createElement('div');
      header.className = 'flex flex-col md:flex-row md:justify-between md:items-start mb-6';
      
      const titleDiv = document.createElement('div');
      titleDiv.className = 'mb-4 md:mb-0';
      
      const title = document.createElement('h1');
      title.className = 'text-2xl md:text-3xl font-bold mb-2';
      title.textContent = property.title || property.name || 'Propiedad';
      
      const location = document.createElement('p');
      location.className = 'text-gray-500 dark:text-gray-400 flex items-center';
      location.innerHTML = `<span class="mr-2">📍</span> ${property.location || property.address || 'Madrid'}`;
      
      titleDiv.appendChild(title);
      titleDiv.appendChild(location);
      
      const priceDiv = document.createElement('div');
      priceDiv.className = 'property-price bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 px-4 py-2 rounded-md text-lg md:text-xl font-bold';
      priceDiv.textContent = property.price 
        ? `${typeof property.price === 'number' ? property.price.toLocaleString('es-ES') : property.price}€` 
        : 'Precio a consultar';
      
      header.appendChild(titleDiv);
      header.appendChild(priceDiv);
      infoContainer.appendChild(header);
      
      // Características principales
      const features = document.createElement('div');
      features.className = 'grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 p-4 bg-gray-50 dark:bg-gray-900/30 rounded-lg';
      
      const createFeature = (icon, label, value) => {
        const feature = document.createElement('div');
        feature.className = 'flex flex-col items-center text-center';
        
        const iconSpan = document.createElement('span');
        iconSpan.className = 'text-2xl text-amber-600 dark:text-amber-400 mb-1';
        iconSpan.innerHTML = icon;
        
        const valueSpan = document.createElement('span');
        valueSpan.className = 'text-lg font-semibold';
        valueSpan.textContent = value;
        
        const labelSpan = document.createElement('span');
        labelSpan.className = 'text-sm text-gray-500 dark:text-gray-400';
        labelSpan.textContent = label;
        
        feature.appendChild(iconSpan);
        feature.appendChild(valueSpan);
        feature.appendChild(labelSpan);
        
        return feature;
      };
      
      features.appendChild(createFeature('🛏️', 'Habitaciones', property.bedrooms || 'N/A'));
      features.appendChild(createFeature('🚿', 'Baños', property.bathrooms || 'N/A'));
      features.appendChild(createFeature('📏', 'Superficie', `${property.area || property.size || property.m2 || 'N/A'} m²`));
      features.appendChild(createFeature('🏢', 'Tipo', property.type || 'Propiedad'));
      
      infoContainer.appendChild(features);
      
      // Descripción
      const descriptionTitle = document.createElement('h2');
      descriptionTitle.className = 'text-xl font-bold mb-3';
      descriptionTitle.textContent = 'Descripción';
      
      const description = document.createElement('div');
      description.className = 'property-description mb-6 text-gray-700 dark:text-gray-300 leading-relaxed';
      description.innerHTML = property.description || 'No hay descripción disponible para esta propiedad.';
      
      infoContainer.appendChild(descriptionTitle);
      infoContainer.appendChild(description);
      
      // Sección de contacto
      const contactSection = document.createElement('div');
      contactSection.className = 'mt-8 p-6 bg-gray-50 dark:bg-gray-900/30 rounded-lg text-center';
      
      const contactTitle = document.createElement('h2');
      contactTitle.className = 'text-xl font-bold mb-2';
      contactTitle.textContent = '¿Interesado en esta propiedad?';
      
      const contactText = document.createElement('p');
      contactText.className = 'mb-4';
      contactText.textContent = 'Contacta con nosotros para obtener más información sobre esta propiedad.';
      
      const contactButton = document.createElement('a');
      contactButton.href = 'mailto:info@gozamadrid.com?subject=Información sobre propiedad';
      contactButton.className = 'inline-block px-6 py-3 bg-amber-500 text-white font-medium rounded-md hover:bg-amber-600 transition-colors';
      contactButton.textContent = 'Contactar';
      
      contactSection.appendChild(contactTitle);
      contactSection.appendChild(contactText);
      contactSection.appendChild(contactButton);
      
      infoContainer.appendChild(contactSection);
      propertyContent.appendChild(infoContainer);
      
      // Agregar todo al contenedor principal
      container.appendChild(propertyContent);
      
      // Botón para volver
      const backButton = document.createElement('div');
      backButton.className = 'fixed top-4 left-4 bg-white dark:bg-gray-800 p-2 rounded-full shadow-md cursor-pointer z-50';
      backButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>';
      backButton.addEventListener('click', () => {
        window.location.href = '/';
      });
      document.body.appendChild(backButton);
    }
  };

  // Inicializar cuando el DOM esté listo
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => MongoDBHandler.init());
  } else {
    MongoDBHandler.init();
  }

  // Exponer el manejador para uso externo
  window.mongoDBHandler = MongoDBHandler;
})(); 