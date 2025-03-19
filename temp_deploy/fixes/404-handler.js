/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/* Content-Type: application/javascript */
/**
 * Manejador de 404 para recursos
 * Intenta cargar recursos alternativos cuando los originales fallan
 */
(function() {
  // Configuración
  const config = {
    debug: true,
    apiBase: window.location.origin + "/api",
    alternativeEndpoints: {
      "/api/proxy": "/api/proxy-alternative",
      "/api/woocommerce-proxy": "/api/wc-proxy"
    }
  };

  // Función para registrar en consola
  function log(message, data) {
    if (config.debug) {
      console.log(`[404Handler] ${message}`, data || "");
    }
  }

  // Interceptar errores de fetch para rutas de API
  const originalFetch = window.fetch;
  
  window.fetch = function(resource, init) {
    if (typeof resource === "string" && resource.includes("/api/")) {
      return originalFetch.apply(this, arguments)
        .then(response => {
          if (response.status === 404) {
            // Comprobar si tenemos una ruta alternativa
            const url = new URL(resource, window.location.origin);
            const path = url.pathname;
            
            if (config.alternativeEndpoints[path]) {
              const params = url.search;
              const newUrl = config.alternativeEndpoints[path] + params;
              
              log(`Ruta ${path} no encontrada. Intentando ruta alternativa: ${newUrl}`);
              
              // Intentar con la ruta alternativa
              return originalFetch(newUrl, init);
            }
            
            // Crear una respuesta simulada para APIs que no existen
            if (path.includes("/api/woocommerce-proxy") || path.includes("/api/wordpress-proxy")) {
              log(`API no encontrada: ${path}. Devolviendo respuesta simulada.`);
              
              return new Response(JSON.stringify({
                success: false,
                error: "API no disponible",
                message: "Esta API no está disponible en modo estático. Por favor, use la versión dinámica de la aplicación."
              }), {
                status: 200,
                headers: { "Content-Type": "application/json" }
              });
            }
          }
          return response;
        })
        .catch(error => {
          log(`Error en fetch: ${error.message}`);
          throw error;
        });
    }
    
    return originalFetch.apply(this, arguments);
  };

  // Intentar recuperar recursos JavaScript que no se encuentran
  function handleMissingScripts() {
    // Buscar elementos script sin cargar
    const scripts = document.querySelectorAll("script[src]");
    
    scripts.forEach(script => {
      script.addEventListener("error", function(event) {
        const src = script.getAttribute("src");
        
        // Si es un archivo de Next.js con hash, intentar cargarlo de forma diferente
        if (src && src.includes("-") && src.endsWith(".js")) {
          log(`Script no encontrado: ${src}. Intentando gestionar el error.`);
          
          // Crear un script alternativo
          const alternativeScript = document.createElement("script");
          alternativeScript.type = "application/javascript";
          
          // Agregar un parámetro para evitar la caché
          alternativeScript.src = src + "?bypass=1&t=" + Date.now();
          alternativeScript.async = true;
          
          // Reemplazar el script original
          if (script.parentNode) {
            script.parentNode.replaceChild(alternativeScript, script);
            log(`Script reemplazado: ${src}`);
          }
        }
      });
    });
  }
  
  // Ejecutar cuando el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", handleMissingScripts);
  } else {
    handleMissingScripts();
  }

  log("Manejador de 404 inicializado");
})(); 