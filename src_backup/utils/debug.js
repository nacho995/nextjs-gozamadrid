/**
 * Debug Client Script para Vercel
 * Este script registra información sobre el entorno y la carga de recursos
 */

let debugContainer = null;

export function initDebug() {
  // Solo inicializar si estamos en un entorno de desarrollo o si la URL contiene el parámetro debug
  if (!window.location.hostname.includes('vercel.app') && 
      !window.location.search.includes('debug=true')) {
    return;
  }

  console.log('[Debug] Inicializando script de depuración');
  
  // Crear un elemento de log flotante
  debugContainer = document.createElement('div');
  debugContainer.id = 'vercel-debug-log';
  debugContainer.style.cssText = 'position:fixed;bottom:10px;right:10px;max-width:400px;max-height:300px;overflow:auto;background:rgba(0,0,0,0.8);color:#fff;font-family:monospace;padding:10px;border-radius:5px;z-index:100000;font-size:12px;';
  document.body.appendChild(debugContainer);

  // Iniciar monitoreo
  logEnvironmentInfo();
  logLoadPerformance();
  monitorErrors();
}

function logEnvironmentInfo() {
  const envInfo = {
    userAgent: navigator.userAgent,
    viewport: `${window.innerWidth}x${window.innerHeight}`,
    devicePixelRatio: window.devicePixelRatio,
    connection: navigator.connection ? {
      type: navigator.connection.effectiveType,
      downlink: navigator.connection.downlink,
      rtt: navigator.connection.rtt
    } : 'No disponible'
  };

  log('Información del entorno:', envInfo);
}

function logLoadPerformance() {
  if (window.performance) {
    const timing = performance.timing;
    const loadTime = timing.loadEventEnd - timing.navigationStart;
    const dnsTime = timing.domainLookupEnd - timing.domainLookupStart;
    const tcpTime = timing.connectEnd - timing.connectStart;
    const ttfb = timing.responseStart - timing.navigationStart;

    log('Rendimiento de carga:', {
      total: `${loadTime}ms`,
      dns: `${dnsTime}ms`,
      tcp: `${tcpTime}ms`,
      ttfb: `${ttfb}ms`
    });
  }
}

function monitorErrors() {
  window.addEventListener('error', function(event) {
    log('Error:', {
      message: event.message,
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });

  window.addEventListener('unhandledrejection', function(event) {
    log('Promesa no manejada:', {
      reason: event.reason
    });
  });
}

function log(title, data) {
  if (!debugContainer) return;

  const entry = document.createElement('div');
  entry.style.borderBottom = '1px solid rgba(255,255,255,0.1)';
  entry.style.marginBottom = '5px';
  entry.style.paddingBottom = '5px';

  const timestamp = new Date().toLocaleTimeString();
  entry.innerHTML = `
    <div style="color:#aaa;font-size:10px;">[${timestamp}] ${title}</div>
    <div style="margin-top:3px;">${JSON.stringify(data, null, 2)}</div>
  `;

  debugContainer.insertBefore(entry, debugContainer.firstChild);

  // Limitar el número de entradas
  while (debugContainer.children.length > 50) {
    debugContainer.removeChild(debugContainer.lastChild);
  }

  // También logear a la consola
  console.log(`[Debug] ${title}:`, data);
} 