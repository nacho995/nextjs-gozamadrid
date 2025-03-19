/**
 * Script de diagnóstico para verificar la configuración del frontend de Goza Madrid
 * Este script se puede cargar en el navegador para diagnosticar problemas de conexión
 * con las APIs y la configuración general.
 */
(function() {
  console.log("=== Diagnóstico de Goza Madrid iniciado ===");
  
  // Variable para almacenar los resultados
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    environment: {},
    config: {},
    endpoints: {},
    dom: {},
    recommendations: []
  };
  
  // 1. Verificar entorno
  diagnosticResults.environment = {
    userAgent: navigator.userAgent,
    language: navigator.language,
    cookiesEnabled: navigator.cookieEnabled,
    onLine: navigator.onLine,
    url: window.location.href,
    referrer: document.referrer || 'N/A'
  };
  
  // 2. Verificar configuración global
  if (window.appConfig) {
    diagnosticResults.config.appConfig = window.appConfig;
    console.log("✅ appConfig encontrado:", window.appConfig);
  } else {
    diagnosticResults.config.appConfig = null;
    console.error("❌ appConfig no está definido");
    diagnosticResults.recommendations.push("El archivo appConfig.js no se ha cargado correctamente. Verifica que se esté incluyendo en el HTML.");
  }
  
  if (window.CONFIG) {
    diagnosticResults.config.CONFIG = {
      WC_API_URL: window.CONFIG.WC_API_URL || 'No definido',
      WOO_COMMERCE_KEY: window.CONFIG.WOO_COMMERCE_KEY ? 'Configurado' : 'No configurado'
    };
    console.log("✅ CONFIG encontrado");
  } else {
    diagnosticResults.config.CONFIG = null;
    console.error("❌ CONFIG no está definido");
    diagnosticResults.recommendations.push("La configuración de WooCommerce no está disponible. Verifica que appConfig.js se cargue correctamente.");
  }
  
  // 3. Verificación del DOM
  setTimeout(() => {
    // Verificar si hay elementos clave en la página
    const propertyContainer = document.querySelector('section[aria-label="Listado de propiedades"]');
    diagnosticResults.dom.propertyContainer = !!propertyContainer;
    
    if (!propertyContainer) {
      console.error("❌ No se encontró el contenedor de propiedades");
      diagnosticResults.recommendations.push("No se encontró el contenedor de propiedades en la página. Esto puede indicar que la aplicación no se renderizó correctamente.");
    } else {
      const propertyCards = propertyContainer.querySelectorAll('a[href^="/property/"]');
      diagnosticResults.dom.propertyCardsCount = propertyCards.length;
      console.log(`✅ Encontradas ${propertyCards.length} tarjetas de propiedades`);
    }
    
    const loadingIndicator = document.querySelector('p.text-lg.text-white.font-medium.mb-2');
    diagnosticResults.dom.loadingIndicator = !!loadingIndicator && loadingIndicator.textContent.includes('Cargando');
    
    const errorMessage = document.querySelector('h3.text-xl.text-white.font-semibold.mb-2');
    diagnosticResults.dom.errorMessage = errorMessage ? errorMessage.textContent : null;
    
    if (errorMessage) {
      console.error("❌ Se encontró un mensaje de error:", errorMessage.textContent);
      diagnosticResults.recommendations.push(`Se detectó un mensaje de error en la página: "${errorMessage.textContent}"`);
    }
    
    // Mostrar recomendaciones según el análisis
    generateRecommendations();
    
    // Mostrar resultados finales
    console.log("=== Resultados del diagnóstico ===");
    console.log(diagnosticResults);
    
    // Crear o actualizar el elemento de resultados en la página
    displayResults();
  }, 2000);
  
  // 4. Verificar endpoints
  async function checkEndpoint(url, name) {
    console.log(`Verificando endpoint ${name}: ${url}`);
    try {
      const response = await fetch(url, {
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache'
        }
      });
      
      diagnosticResults.endpoints[name] = {
        url,
        status: response.status,
        ok: response.ok
      };
      
      if (response.ok) {
        try {
          const data = await response.json();
          diagnosticResults.endpoints[name].data = typeof data === 'object' ? {
            type: Array.isArray(data) ? 'array' : 'object',
            length: Array.isArray(data) ? data.length : (data.properties ? data.properties.length : 'N/A'),
            keys: Object.keys(data).slice(0, 5)
          } : 'no es un objeto';
          console.log(`✅ Endpoint ${name} respondió correctamente:`, diagnosticResults.endpoints[name].data);
        } catch (parseError) {
          diagnosticResults.endpoints[name].parseError = parseError.message;
          console.error(`❌ Error al parsear respuesta de ${name}:`, parseError);
          diagnosticResults.recommendations.push(`El endpoint ${name} no devolvió un JSON válido. Verifica la respuesta del servidor.`);
        }
      } else {
        console.error(`❌ Error en endpoint ${name}: ${response.status}`);
        diagnosticResults.recommendations.push(`El endpoint ${name} respondió con estado ${response.status}. Verifica la configuración del servidor.`);
      }
    } catch (fetchError) {
      diagnosticResults.endpoints[name] = {
        url,
        error: fetchError.message
      };
      console.error(`❌ No se pudo conectar con ${name}:`, fetchError);
      diagnosticResults.recommendations.push(`No se pudo conectar con el endpoint ${name}. Posible problema de red o CORS.`);
    }
    
    // Actualizar resultados en la página
    displayResults();
  }
  
  // Realizar verificaciones de endpoints si appConfig está disponible
  if (window.appConfig) {
    const baseUrl = window.appConfig.frontendUrl || window.location.origin;
    
    // Verificar el endpoint principal de propiedades
    checkEndpoint(`${baseUrl}/api/properties`, 'properties');
    
    // Verificar endpoints de proxy
    checkEndpoint(`${baseUrl}/api/proxy?service=mongodb&resource=property`, 'mongodbProxy');
    checkEndpoint(`${baseUrl}/api/woocommerce-proxy?endpoint=products`, 'woocommerceProxy');
    
    // Verificar el endpoint de diagnóstico
    checkEndpoint(`${baseUrl}/api/diagnostico`, 'diagnostico');
  }
  
  // Generar recomendaciones adicionales basadas en los resultados
  function generateRecommendations() {
    // Verificar si hay algún endpoint con error pero otros funcionan
    const workingEndpoints = Object.values(diagnosticResults.endpoints).filter(e => e.ok).length;
    const failedEndpoints = Object.values(diagnosticResults.endpoints).filter(e => !e.ok).length;
    
    if (workingEndpoints > 0 && failedEndpoints > 0) {
      diagnosticResults.recommendations.push("Algunos endpoints funcionan pero otros no. Esto puede indicar un problema de configuración parcial.");
    }
    
    // Verificar si la configuración de appConfig parece incorrecta
    if (window.appConfig && window.appConfig.frontendUrl && !window.location.href.includes(window.appConfig.frontendUrl)) {
      diagnosticResults.recommendations.push(`La URL frontend configurada (${window.appConfig.frontendUrl}) no coincide con la URL actual (${window.location.origin}). Verifica la configuración.`);
    }
    
    // Si no hay propiedades pero los endpoints funcionan
    if (diagnosticResults.dom.propertyCardsCount === 0 && 
        diagnosticResults.endpoints.properties && 
        diagnosticResults.endpoints.properties.ok) {
      diagnosticResults.recommendations.push("Los endpoints funcionan pero no se muestran propiedades. Puede ser un problema de renderizado en el frontend.");
    }
  }
  
  // Mostrar resultados en la página para facilitar el diagnóstico
  function displayResults() {
    let resultsContainer = document.getElementById('goza-madrid-diagnostic-results');
    
    if (!resultsContainer) {
      resultsContainer = document.createElement('div');
      resultsContainer.id = 'goza-madrid-diagnostic-results';
      resultsContainer.style.cssText = 'position:fixed; top:10px; right:10px; width:400px; max-height:90vh; overflow:auto; background:rgba(0,0,0,0.8); color:white; padding:15px; border-radius:10px; font-family:monospace; z-index:10000; font-size:12px;';
      document.body.appendChild(resultsContainer);
      
      // Agregar botón para ocultar/mostrar
      const toggleButton = document.createElement('button');
      toggleButton.textContent = 'Ocultar';
      toggleButton.style.cssText = 'background:#FFD700; color:black; border:none; padding:5px 10px; border-radius:4px; cursor:pointer; margin-bottom:10px;';
      toggleButton.onclick = function() {
        const content = document.getElementById('goza-madrid-diagnostic-content');
        if (content.style.display === 'none') {
          content.style.display = 'block';
          toggleButton.textContent = 'Ocultar';
        } else {
          content.style.display = 'none';
          toggleButton.textContent = 'Mostrar';
        }
      };
      
      resultsContainer.appendChild(toggleButton);
      
      // Contenedor para el contenido
      const contentDiv = document.createElement('div');
      contentDiv.id = 'goza-madrid-diagnostic-content';
      resultsContainer.appendChild(contentDiv);
    }
    
    const contentDiv = document.getElementById('goza-madrid-diagnostic-content');
    
    // Actualizar contenido
    let html = '<h3 style="margin:0 0 10px 0; color:#FFD700;">Diagnóstico Goza Madrid</h3>';
    
    // Añadir recomendaciones en la parte superior si existen
    if (diagnosticResults.recommendations.length > 0) {
      html += '<div style="background:rgba(255,0,0,0.2); padding:10px; border-radius:5px; margin-bottom:10px;">';
      html += '<strong>Recomendaciones:</strong><ul>';
      diagnosticResults.recommendations.forEach(rec => {
        html += `<li>${rec}</li>`;
      });
      html += '</ul></div>';
    }
    
    // Mostrar estado de la configuración
    html += '<div style="margin-bottom:10px;"><strong>Configuración:</strong> ';
    html += window.appConfig ? '✅ OK' : '❌ Error';
    html += '</div>';
    
    // Mostrar estado de los endpoints
    html += '<div style="margin-bottom:10px;"><strong>Endpoints:</strong><ul>';
    Object.entries(diagnosticResults.endpoints).forEach(([name, data]) => {
      const status = data.ok ? '✅' : '❌';
      html += `<li>${status} ${name}: ${data.status || data.error || 'Pendiente'}</li>`;
    });
    html += '</ul></div>';
    
    // Información del DOM
    html += '<div><strong>Elementos DOM:</strong><ul>';
    html += `<li>${diagnosticResults.dom.propertyContainer ? '✅' : '❌'} Contenedor de propiedades</li>`;
    if (diagnosticResults.dom.propertyCardsCount !== undefined) {
      html += `<li>Propiedades encontradas: ${diagnosticResults.dom.propertyCardsCount}</li>`;
    }
    if (diagnosticResults.dom.errorMessage) {
      html += `<li>❌ Error: ${diagnosticResults.dom.errorMessage}</li>`;
    }
    html += '</ul></div>';
    
    // Mostrar detalles técnicos
    html += '<div style="margin-top:10px; font-size:10px; color:#999;">';
    html += `URL: ${window.location.href}<br>`;
    html += `Timestamp: ${diagnosticResults.timestamp}`;
    html += '</div>';
    
    contentDiv.innerHTML = html;
  }
})(); 