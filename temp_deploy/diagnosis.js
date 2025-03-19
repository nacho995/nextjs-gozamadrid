/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Herramienta de diagnóstico para Cloudflare Pages
 * Ayuda a identificar y resolver problemas comunes en el despliegue estático
 */
(function() {
  // Configuración
  const config = {
    debug: true,
    checkInterval: 1000, // Cada cuánto verificar recursos (ms)
    maxChecks: 10,
    reportToConsole: true,
    reportToUI: true
  };
  
  // Estado de los recursos
  const resources = {
    // Archivos JS principales
    js: [
      { name: 'Next.js chunks', pattern: /\/_next\/static\/chunks\/.*\.js$/, status: 'pending' },
      { name: 'Script Loader', path: '/script-loader.js', status: 'pending' },
      { name: 'MongoDB Handler', path: '/mongodb-handler.js', status: 'pending' },
      { name: 'Property Handler', path: '/property-handler.js', status: 'pending' }
    ],
    // APIs
    api: [
      { name: 'Properties API', path: '/api/properties', status: 'pending' },
      { name: 'WooCommerce Proxy', path: '/api/woocommerce-proxy?endpoint=products', status: 'pending' }
    ],
    // Recursos estáticos
    static: [
      { name: 'CSS Files', pattern: /\.css$/, status: 'pending' },
      { name: 'Images', pattern: /\.(jpg|jpeg|png|gif|webp)$/, status: 'pending' }
    ]
  };
  
  // Contador de verificaciones
  let checkCount = 0;
  
  // Registrar en consola
  function log(message, data, type = 'log') {
    if (config.debug && config.reportToConsole) {
      if (data) {
        console[type](`[Diagnosis] ${message}`, data);
      } else {
        console[type](`[Diagnosis] ${message}`);
      }
    }
  }
  
  // Crear panel UI de diagnóstico
  function createDiagnosisPanel() {
    if (!config.reportToUI) return;
    
    // Comprobar si ya existe
    if (document.getElementById('diagnosis-panel')) return;
    
    // Crear panel flotante
    const panel = document.createElement('div');
    panel.id = 'diagnosis-panel';
    panel.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      width: 320px;
      max-height: 400px;
      overflow-y: auto;
      background-color: rgba(0, 0, 0, 0.8);
      color: white;
      border-radius: 8px;
      padding: 15px;
      font-family: monospace;
      font-size: 12px;
      z-index: 9999;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    // Crear encabezado
    const header = document.createElement('div');
    header.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 15px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.2);
      padding-bottom: 5px;
    `;
    
    const title = document.createElement('div');
    title.textContent = 'Diagnóstico de Cloudflare';
    title.style.fontWeight = 'bold';
    
    const closeBtn = document.createElement('button');
    closeBtn.textContent = 'X';
    closeBtn.style.cssText = `
      background: none;
      border: none;
      color: white;
      cursor: pointer;
      font-weight: bold;
    `;
    closeBtn.onclick = () => {
      panel.style.display = 'none';
    };
    
    header.appendChild(title);
    header.appendChild(closeBtn);
    panel.appendChild(header);
    
    // Contenedor para resultados
    const content = document.createElement('div');
    content.id = 'diagnosis-content';
    panel.appendChild(content);
    
    // Añadir al DOM
    document.body.appendChild(panel);
  }
  
  // Actualizar panel UI con resultados
  function updateDiagnosisPanel() {
    if (!config.reportToUI) return;
    
    const content = document.getElementById('diagnosis-content');
    if (!content) return;
    
    // Limpiar contenido
    content.innerHTML = '';
    
    // Agregar secciones
    addResourceSection('JavaScript', resources.js, content);
    addResourceSection('APIs', resources.api, content);
    addResourceSection('Estáticos', resources.static, content);
    
    // Agregar recomendaciones
    const problems = [];
    
    // Contar problemas por categoría
    const jsProblems = resources.js.filter(r => r.status === 'error').length;
    const apiProblems = resources.api.filter(r => r.status === 'error').length;
    const staticProblems = resources.static.filter(r => r.status === 'error').length;
    
    if (jsProblems > 0) {
      problems.push(`Se encontraron ${jsProblems} problemas con archivos JavaScript. Revisa las cabeceras Content-Type.`);
    }
    
    if (apiProblems > 0) {
      problems.push(`Se encontraron ${apiProblems} problemas con APIs. Verifica la configuración de funciones en Cloudflare.`);
    }
    
    if (staticProblems > 0) {
      problems.push(`Se encontraron ${staticProblems} problemas con recursos estáticos.`);
    }
    
    // Mostrar recomendaciones
    if (problems.length > 0) {
      const recoTitle = document.createElement('div');
      recoTitle.textContent = 'Recomendaciones:';
      recoTitle.style.fontWeight = 'bold';
      recoTitle.style.marginTop = '15px';
      recoTitle.style.borderTop = '1px solid rgba(255, 255, 255, 0.2)';
      recoTitle.style.paddingTop = '5px';
      content.appendChild(recoTitle);
      
      const recoList = document.createElement('ul');
      recoList.style.marginLeft = '15px';
      recoList.style.paddingLeft = '5px';
      
      problems.forEach(problem => {
        const item = document.createElement('li');
        item.textContent = problem;
        item.style.marginBottom = '5px';
        recoList.appendChild(item);
      });
      
      content.appendChild(recoList);
    } else if (checkCount >= config.maxChecks) {
      const allOk = document.createElement('div');
      allOk.textContent = '✅ Todos los recursos parecen estar funcionando correctamente';
      allOk.style.color = '#4CAF50';
      allOk.style.marginTop = '15px';
      content.appendChild(allOk);
    }
  }
  
  // Añadir sección de recursos al panel
  function addResourceSection(title, resourceList, container) {
    const section = document.createElement('div');
    section.style.marginBottom = '10px';
    
    const sectionTitle = document.createElement('div');
    sectionTitle.textContent = title;
    sectionTitle.style.fontWeight = 'bold';
    section.appendChild(sectionTitle);
    
    const list = document.createElement('ul');
    list.style.marginTop = '5px';
    list.style.marginBottom = '10px';
    list.style.paddingLeft = '20px';
    
    resourceList.forEach(resource => {
      const item = document.createElement('li');
      
      const statusColor = resource.status === 'ok' ? '#4CAF50' : 
                         resource.status === 'error' ? '#F44336' : '#FFD700';
                         
      const statusIcon = resource.status === 'ok' ? '✅' : 
                        resource.status === 'error' ? '❌' : '⏳';
      
      item.textContent = `${statusIcon} ${resource.name}`;
      item.style.color = statusColor;
      list.appendChild(item);
    });
    
    section.appendChild(list);
    container.appendChild(section);
  }
  
  // Verificar recursos
  function checkResources() {
    // Incrementar contador
    checkCount++;
    
    // Verificar si hemos alcanzado el máximo de verificaciones
    if (checkCount > config.maxChecks) {
      log('Máximo de verificaciones alcanzado');
      return;
    }
    
    log(`Ejecutando verificación #${checkCount}`);
    
    // Recopilar recursos actuales en la página
    const scripts = Array.from(document.querySelectorAll('script[src]')).map(s => s.src);
    const links = Array.from(document.querySelectorAll('link[href]')).map(l => l.href);
    const images = Array.from(document.querySelectorAll('img[src]')).map(i => i.src);
    
    // Verificar scripts
    resources.js.forEach(resource => {
      if (resource.pattern) {
        // Buscar por patrón
        const found = scripts.some(src => resource.pattern.test(src));
        resource.status = found ? 'ok' : 'error';
      } else if (resource.path) {
        // Buscar por ruta específica
        const found = scripts.some(src => src.includes(resource.path));
        resource.status = found ? 'ok' : 'error';
      }
    });
    
    // Verificar recursos estáticos
    resources.static.forEach(resource => {
      if (resource.pattern) {
        if (resource.pattern.toString().includes('css')) {
          const found = links.some(href => resource.pattern.test(href));
          resource.status = found ? 'ok' : 'error';
        } else if (resource.pattern.toString().includes('jpg|jpeg|png')) {
          const found = images.some(src => resource.pattern.test(src));
          resource.status = found ? 'ok' : 'error';
        }
      }
    });
    
    // Verificar APIs con fetch
    resources.api.forEach(resource => {
      fetch(resource.path)
        .then(response => {
          resource.status = response.ok ? 'ok' : 'error';
          updateDiagnosisPanel();
        })
        .catch(() => {
          resource.status = 'error';
          updateDiagnosisPanel();
        });
    });
    
    // Actualizar panel
    updateDiagnosisPanel();
    
    // Programar siguiente verificación
    setTimeout(checkResources, config.checkInterval);
  }
  
  // Monitorear errores globales
  function monitorErrors() {
    window.addEventListener('error', event => {
      if (event.filename) {
        log(`Error en archivo: ${event.filename}`, {
          message: event.message,
          lineno: event.lineno,
          colno: event.colno
        }, 'error');
      } else {
        log(`Error general: ${event.message}`, null, 'error');
      }
    });
    
    // Monitorear errores de promesas no capturadas
    window.addEventListener('unhandledrejection', event => {
      log(`Promesa rechazada no capturada: ${event.reason}`, null, 'error');
    });
  }
  
  // Monitorear rendimiento y tiempos de carga
  function monitorPerformance() {
    if ('performance' in window && 'getEntriesByType' in performance) {
      // Esperar a que la página cargue completamente
      window.addEventListener('load', () => {
        setTimeout(() => {
          // Obtener métricas de recursos
          const resources = performance.getEntriesByType('resource');
          
          // Filtrar por tipo
          const jsResources = resources.filter(r => r.initiatorType === 'script');
          const cssResources = resources.filter(r => r.initiatorType === 'link' && r.name.endsWith('.css'));
          const imgResources = resources.filter(r => r.initiatorType === 'img');
          
          // Calcular promedios
          const jsAvg = jsResources.reduce((acc, r) => acc + r.duration, 0) / (jsResources.length || 1);
          const cssAvg = cssResources.reduce((acc, r) => acc + r.duration, 0) / (cssResources.length || 1);
          const imgAvg = imgResources.reduce((acc, r) => acc + r.duration, 0) / (imgResources.length || 1);
          
          log('Métricas de rendimiento', {
            'Tiempo promedio JS (ms)': jsAvg.toFixed(2),
            'Tiempo promedio CSS (ms)': cssAvg.toFixed(2),
            'Tiempo promedio imágenes (ms)': imgAvg.toFixed(2),
            'Tiempo total de carga (ms)': performance.timing.loadEventEnd - performance.timing.navigationStart
          });
        }, 1000);
      });
    }
  }
  
  // Iniciar diagnóstico
  function init() {
    log('Iniciando diagnóstico');
    
    // Crear panel UI
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', createDiagnosisPanel);
    } else {
      createDiagnosisPanel();
    }
    
    // Iniciar monitorización
    monitorErrors();
    monitorPerformance();
    
    // Iniciar verificación de recursos
    setTimeout(checkResources, 1000);
  }
  
  // Iniciar
  init();
})(); 