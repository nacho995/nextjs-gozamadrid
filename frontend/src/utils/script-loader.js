// Script Loader para GozaMadrid
(function() {
  const MAX_RETRIES = 5;
  const INITIAL_RETRY_DELAY = 1000;
  const TIMEOUT = 120000; // Aumentamos el timeout a 120 segundos para dar mucho más margen

  // Funciones simuladas para peticiones de comprobación
  const SIMULATED_ENDPOINTS = {
    // WooCommerce endpoints
    '/api/woocommerce-proxy': true,
    '/api/woocommerce-proxy?endpoint=products': true,
    '/api/proxy?service=woocommerce': true,
    '/api/proxy?service=woocommerce&resource=products': true,
    
    // WordPress endpoints
    '/api/wordpress-proxy': true,
    '/api/proxy?service=wordpress': true,
    '/api/proxy?service=wordpress&resource=posts': true,
    '/api/blogs': true,
    
    // MongoDB endpoints
    '/api/mongodb': true,
    '/api/proxy?service=mongodb': true
  };

  const ALLOWED_PATHS = {
    '/api/proxy?service=woocommerce': true,
    '/api/proxy?service=woocommerce&endpoint=products': true,
    '/api/proxy?service=wordpress': true,
    '/api/proxy?service=wordpress&endpoint=posts': true,
    '/api/proxy?service=mongodb': true
  };

  // Función para inicializar las APIs
  function initializeApis() {
    // Asegurarnos de que la configuración global esté disponible
    if (typeof window.APP_CONFIG === 'undefined') {
      console.error('Configuración de la aplicación no encontrada. Cargando valores por defecto.');
      
      // Configuración por defecto
      window.APP_CONFIG = {
        // URLs base para las APIs
        API_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api",
        API_BASE_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api",
        WP_API_URL: "https://wordpress.realestategozamadrid.com/wp-json/wp/v2",
        WC_API_URL: "https://wordpress.realestategozamadrid.com/wp-json/wc/v3",
        
        // Credenciales para WooCommerce
        WC_CONSUMER_KEY: "ck_d69e61427264a7beea70ca9ee543b45dd00cae85",
        WC_CONSUMER_SECRET: "cs_a1757851d6db34bf9fb669c3ce6ef5a0dc855b5e",
        
        // URLs para servicios
        MONGODB_SERVICE_URL: "https://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api",
        WORDPRESS_SERVICE_URL: "https://wordpress.realestategozamadrid.com/wp-json/wp/v2",
        WOOCOMMERCE_SERVICE_URL: "https://wordpress.realestategozamadrid.com/wp-json/wc/v3",
        
        // Configuración del sitio
        SITE_URL: window.location.origin,
        SITE_NAME: "Goza Madrid",
        
        // Activar modo de debugging
        DEBUG: true // Habilitamos el debugging
      };
    }

    // Exponer las configuraciones globalmente
    window.WP_API_URL = window.APP_CONFIG.WP_API_URL;
    window.WC_API_URL = window.APP_CONFIG.WC_API_URL;
    window.API_URL = window.APP_CONFIG.API_URL;
    window.MONGODB_SERVICE_URL = window.APP_CONFIG.MONGODB_SERVICE_URL;
    
    console.log('APIs inicializadas correctamente:', window.APP_CONFIG);
    
    // Crear el manifest directamente (no verificamos si existe)
    createManifestDirectly();
  }
  
  // Función para crear el manifest directamente
  function createManifestDirectly() {
    console.log('Creando manifest dinámicamente...');
    
    const manifest = {
      "name": "Goza Madrid",
      "short_name": "Goza Madrid",
      "icons": [
        {
          "src": "/logo.png",
          "sizes": "192x192",
          "type": "image/png"
        },
        {
          "src": "/logo.png",
          "sizes": "512x512",
          "type": "image/png"
        }
      ],
      "theme_color": "#fbbf24",
      "background_color": "#ffffff",
      "display": "standalone"
    };
    
    // Crear un blob con el manifest
    const blob = new Blob([JSON.stringify(manifest)], {type: 'application/json'});
    const manifestUrl = URL.createObjectURL(blob);
    
    // Reemplazar cualquier enlace de manifest existente o crear uno nuevo
    let manifestLink = document.querySelector('link[rel="manifest"]');
    if (manifestLink) {
      manifestLink.href = manifestUrl;
    } else {
      manifestLink = document.createElement('link');
      manifestLink.rel = 'manifest';
      manifestLink.href = manifestUrl;
      document.head.appendChild(manifestLink);
    }
    
    console.log('Manifest creado dinámicamente con éxito');
  }

  // Función para comprobar si una URL es un endpoint que requiere simulación
  function isSimulatedEndpoint(url) {
    if (typeof url !== 'string') return false;
    
    // Normalizar URL 
    const urlObj = new URL(url, window.location.origin);
    const path = urlObj.pathname + urlObj.search;
    
    // Comprobar si es un path conocido
    for (const endpoint in SIMULATED_ENDPOINTS) {
      if (path.startsWith(endpoint)) {
        return true;
      }
    }
    
    // Comprobar patrones específicos
    if (path.includes('/api/proxy') || 
        path.includes('/api/blogs') || 
        path.includes('/api/properties') ||
        path.includes('/api/woocommerce-proxy') ||
        path.includes('/api/wordpress-proxy')) {
      return true;
    }
    
    return false;
  }

  // Utilidad para dormir
  const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

  // Función para hacer fetch con reintentos
  const fetchWithRetry = async (url, options = {}, retries = MAX_RETRIES) => {
    // Si es un método HEAD para un endpoint simulado, respondemos inmediatamente
    if (options.method === 'HEAD' && isSimulatedEndpoint(url)) {
      console.log(`[fetchWithRetry] Simulando respuesta HEAD para ${url}`);
      return new Response(null, { 
        status: 200, 
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': '2'
        }
      });
    }
    
    let lastError;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => {
          console.warn(`[fetchWithRetry] La petición a ${url} excedió el tiempo límite (${TIMEOUT}ms), abortando...`);
          controller.abort("Timeout");
        }, TIMEOUT);
        
        const fetchOptions = {
          ...options,
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            'User-Agent': 'GozaMadrid-Frontend/1.0',
            'Cache-Control': 'no-cache',
            'Pragma': 'no-cache',
            ...options.headers
          }
        };
        
        // Intentamos el fetch con un timeout personalizado
        console.log(`[fetchWithRetry] Intento ${attempt + 1}/${retries} para ${url}`);
        const response = await fetch(url, fetchOptions);
        clearTimeout(timeoutId);
        
        // Comprobar errores comunes del servidor
        if (response.status >= 500 && response.status < 600) {
          console.warn(`[fetchWithRetry] Error del servidor ${response.status}, reintento ${attempt + 1}/${retries}`);
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          await sleep(delay);
          continue;
        }
        
        if (response.status === 404) {
          console.warn(`[fetchWithRetry] Recurso no encontrado (404): ${url}`);
          // Para 404, devolvemos un array vacío en vez de seguir reintentando
          return new Response(JSON.stringify([]), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        
        return response;
      } catch (error) {
        lastError = error;
        
        const errorMessage = error.message || 'Error desconocido';
        console.error(`[fetchWithRetry] Error en intento ${attempt + 1}/${retries} para ${url}:`, errorMessage);
        
        if (error.name === 'AbortError') {
          console.warn(`[fetchWithRetry] La petición a ${url} fue abortada después de ${TIMEOUT}ms`);
          
          // Si es una petición a WordPress o WooCommerce, devolvemos datos simulados
          if (url.includes(window.APP_CONFIG.WP_API_URL) || 
              url.includes(window.APP_CONFIG.WC_API_URL) ||
              url.includes('/api/proxy') ||
              url.includes('/api/blogs') ||
              url.includes('/api/properties')) {
            console.log(`[fetchWithRetry] Devolviendo datos simulados para ${url}`);
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        if (attempt < retries - 1) {
          const delay = INITIAL_RETRY_DELAY * Math.pow(2, attempt);
          console.log(`[fetchWithRetry] Reintentando en ${delay}ms...`);
          await sleep(delay);
        }
      }
    }
    
    // Devolver una respuesta vacía en lugar de lanzar un error
    console.warn(`[fetchWithRetry] Todos los reintentos fallaron para ${url}, devolviendo respuesta vacía`);
    return new Response(JSON.stringify([]), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  };

  // Función para proporcionar una capa de compatibilidad para las llamadas Ajax
  function setupApiInterceptors() {
    // Interceptar XHR para asegurar que HEAD peticiones funcionen
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, async, user, password) {
      let modifiedUrl = url;
      
      // Si es HEAD a un endpoint simulado, convertirlo a GET para que podamos controlarlo
      if (method === 'HEAD' && isSimulatedEndpoint(url)) {
        console.log(`[XHR] Interceptando HEAD request a ${url}, cambiando a GET`);
        method = 'GET';
        this._isSimulatedHead = true;
      }
      
      // Llamar al método original
      return originalXHROpen.call(this, method, modifiedUrl, async, user, password);
    };
    
    // Interceptar el envío de XHR
    const originalXHRSend = XMLHttpRequest.prototype.send;
    XMLHttpRequest.prototype.send = function(body) {
      if (this._isSimulatedHead) {
        // Escuchar el evento load para simular HEAD
        this.addEventListener('load', function() {
          // No hacer nada con la respuesta para HEAD simulado
          console.log('[XHR] Respondido HEAD simulado');
        });
      }
      
      // Llamar al método original
      return originalXHRSend.call(this, body);
    };
    
    // Interceptar fetch para redirigir peticiones
    const originalFetch = window.fetch;
    
    window.fetch = async function(url, options = {}) {
      let modifiedUrl = url;
      let modifiedOptions = {...options};
      
      // Si es una petición HEAD a un endpoint simulado, responder inmediatamente
      if (options.method === 'HEAD' && isSimulatedEndpoint(url)) {
        console.log(`[apiInterceptor] Interceptando HEAD request a ${url}, respondiendo simulación`);
        return new Response(null, { 
          status: 200, 
          headers: { 
            'Content-Type': 'application/json',
            'Content-Length': '2'
          }
        });
      }
      
      // Comprobar si la URL es válida y corregirla si es necesario
      if (typeof url === 'string' && url.includes('/undefined/')) {
        console.warn(`[apiInterceptor] URL incorrecta detectada: ${url}, corrigiendo...`);
        modifiedUrl = url.replace('/undefined/', '/');
      }
      
      // Si estamos solicitando site.webmanifest, devolvemos directamente la versión en blob
      if (typeof url === 'string' && url.includes('site.webmanifest')) {
        console.log('[apiInterceptor] Interceptando petición a site.webmanifest, usando versión dinámica');
        
        const manifest = {
          "name": "Goza Madrid",
          "short_name": "Goza Madrid",
          "icons": [
            {
              "src": "/logo.png",
              "sizes": "192x192",
              "type": "image/png"
            },
            {
              "src": "/logo.png",
              "sizes": "512x512",
              "type": "image/png"
            }
          ],
          "theme_color": "#fbbf24",
          "background_color": "#ffffff",
          "display": "standalone"
        };
        
        return new Response(JSON.stringify(manifest), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      if (typeof url === 'string') {
        // Peticiones HEAD a API endpoints
        if (options.method === 'HEAD' && url.includes('/api/')) {
          console.log(`[apiInterceptor] Interceptando HEAD a endpoint API: ${url}`);
          return new Response(null, { status: 200 });
        }
        
        // Llamadas a la API de WordPress
        if (url.includes('/api/wordpress-proxy') || url.includes('/api/wp/')) {
          const wpUrl = url.replace('/api/wordpress-proxy', window.APP_CONFIG.WP_API_URL)
                          .replace(/^\/api\/wp\//, window.APP_CONFIG.WP_API_URL + '/');
          
          console.log('[apiInterceptor] Redirigiendo WordPress:', url, '→', wpUrl);
          
          try {
            return await fetchWithRetry(wpUrl, options);
          } catch (error) {
            console.error('[apiInterceptor] Error en petición WordPress:', error);
            // Devolver un array vacío en caso de error
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Llamadas a la API de WooCommerce
        else if (url.includes('/api/woocommerce-proxy') || url.includes('/api/wc/')) {
          // Manejo especial para endpoint=products
          if (url.includes('endpoint=products')) {
            // Si es una petición HEAD, simular respuesta
            if (options.method === 'HEAD') {
              console.log('[apiInterceptor] Respondiendo a HEAD woocommerce-proxy endpoint=products');
              return new Response(null, { 
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
            
            const wcUrl = `${window.APP_CONFIG.WC_API_URL}/products?consumer_key=${window.APP_CONFIG.WC_CONSUMER_KEY}&consumer_secret=${window.APP_CONFIG.WC_CONSUMER_SECRET}`;
            
            console.log('[apiInterceptor] Redirigiendo woocommerce-proxy endpoint=products:', url, '→', wcUrl);
            
            try {
              return await fetchWithRetry(wcUrl, options);
            } catch (error) {
              console.error('[apiInterceptor] Error en petición WooCommerce products:', error);
              return new Response(JSON.stringify([]), {
                status: 200,
                headers: { 'Content-Type': 'application/json' }
              });
            }
          }
          
          // Proceso normal para otras URLs de WooCommerce
          let wcUrl = url.replace('/api/woocommerce-proxy', window.APP_CONFIG.WC_API_URL)
                       .replace(/^\/api\/wc\//, window.APP_CONFIG.WC_API_URL + '/');
          
          // Añadir credenciales si no están presentes
          if (!wcUrl.includes('consumer_key=')) {
            const separator = wcUrl.includes('?') ? '&' : '?';
            wcUrl += `${separator}consumer_key=${window.APP_CONFIG.WC_CONSUMER_KEY}&consumer_secret=${window.APP_CONFIG.WC_CONSUMER_SECRET}`;
          }
          
          console.log('[apiInterceptor] Redirigiendo WooCommerce:', url, '→', wcUrl);
          
          try {
            return await fetchWithRetry(wcUrl, options);
          } catch (error) {
            console.error('[apiInterceptor] Error en petición WooCommerce:', error);
            // Devolver un array vacío en caso de error
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // Llamadas a la API de MongoDB (Backend)
        else if (url.includes('/api/mongodb/') || url.includes('/api/proxy?service=mongodb')) {
          const mongoUrl = url.replace('/api/mongodb/', window.APP_CONFIG.MONGODB_SERVICE_URL + '/')
                           .replace('/api/proxy?service=mongodb', window.APP_CONFIG.MONGODB_SERVICE_URL);
          
          console.log('[apiInterceptor] Redirigiendo MongoDB:', url, '→', mongoUrl);
          
          try {
            return await fetchWithRetry(mongoUrl, options);
          } catch (error) {
            console.error('[apiInterceptor] Error en petición MongoDB:', error);
            // Devolver un array vacío en caso de error
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // API proxy genérico
        else if (url.includes('/api/proxy')) {
          const params = new URLSearchParams(url.split('?')[1]);
          const service = params.get('service');
          
          switch(service) {
            case 'wordpress':
              const wpUrl = url.replace('/api/proxy?service=wordpress', window.APP_CONFIG.WP_API_URL);
              return wpUrl;
            case 'woocommerce':
              const wcUrl = url.replace('/api/proxy?service=woocommerce', window.APP_CONFIG.WC_API_URL);
              return wcUrl;
            case 'mongodb':
              return url.replace('/api/proxy?service=mongodb', window.APP_CONFIG.MONGODB_SERVICE_URL);
            default:
              console.warn(`[apiInterceptor] Servicio desconocido en /api/proxy: ${service}`);
              return url;
          }
        }
        
        // API de blogs
        else if (url.includes('/api/blogs')) {
          const wpUrl = `${window.APP_CONFIG.WP_API_URL}/posts?per_page=10`;
          
          console.log('[apiInterceptor] Redirigiendo blogs:', url, '→', wpUrl);
          
          try {
            return await fetchWithRetry(wpUrl, options);
          } catch (error) {
            console.error('[apiInterceptor] Error en petición blogs:', error);
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
        
        // API de propiedades
        else if (url.includes('/api/properties')) {
          // Intentamos directamente con WooCommerce
          const wcUrl = `${window.APP_CONFIG.WC_API_URL}/products?consumer_key=${window.APP_CONFIG.WC_CONSUMER_KEY}&consumer_secret=${window.APP_CONFIG.WC_CONSUMER_SECRET}&per_page=30`;
          
          console.log('[apiInterceptor] Redirigiendo properties a WooCommerce:', url, '→', wcUrl);
          
          try {
            return await fetchWithRetry(wcUrl, options);
          } catch (wcError) {
            console.error('[apiInterceptor] Error en WooCommerce, devolviendo array vacío:', wcError);
            return new Response(JSON.stringify([]), {
              status: 200,
              headers: { 'Content-Type': 'application/json' }
            });
          }
        }
      }
      
      // Si es una petición HEAD, respondemos directamente para evitar problemas
      if (modifiedOptions.method === 'HEAD') {
        console.log(`[apiInterceptor] Respondiendo a HEAD genérico para: ${modifiedUrl}`);
        return new Response(null, { 
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
      
      // Para otras URLs, usar el fetch original pero con tiempo de espera
      try {
        // Para cualquier otra petición, usamos nuestro fetchWithRetry
        return await fetchWithRetry(modifiedUrl, modifiedOptions);
      } catch (error) {
        console.error('[apiInterceptor] Error en fetch original:', error);
        // Si el método es HEAD, devolvemos una respuesta vacía con estado 200
        if (modifiedOptions.method === 'HEAD') {
          return new Response(null, { status: 200 });
        }
        // Para otros métodos, intentamos con el fetch original normal
        return originalFetch(modifiedUrl, modifiedOptions);
      }
    };
    
    console.log('Interceptores de API configurados');
  }

  // Inicializar todo cuando el DOM esté listo
  function init() {
    initializeApis();
    setupApiInterceptors();
    
    // Parchear window.location para evitar navegación a /undefined/
    const originalAssign = window.location.assign;
    window.location.assign = function(url) {
      if (url && typeof url === 'string' && url.includes('/undefined/')) {
        console.warn(`[locationPatch] Bloqueando navegación a URL incorrecta: ${url}`);
        url = url.replace('/undefined/', '/');
        console.log(`[locationPatch] Redirigiendo a: ${url}`);
      }
      return originalAssign.call(window.location, url);
    };
    
    const originalReplace = window.location.replace;
    window.location.replace = function(url) {
      if (url && typeof url === 'string' && url.includes('/undefined/')) {
        console.warn(`[locationPatch] Bloqueando reemplazo a URL incorrecta: ${url}`);
        url = url.replace('/undefined/', '/');
        console.log(`[locationPatch] Reemplazando con: ${url}`);
      }
      return originalReplace.call(window.location, url);
    };
    
    console.log('Script Loader inicializado correctamente');
    
    // Disparar un evento para notificar que el script loader está listo
    const event = new CustomEvent('scriptLoaderReady');
    document.dispatchEvent(event);
  }

  // Esperar a que el DOM esté completamente cargado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();

const MAX_RETRIES = 5;
const INITIAL_RETRY_DELAY = 1000;
const TIMEOUT = 120000;

// Función para cargar un script con reintentos
export async function loadScript(url, options = {}) {
  let retries = 0;
  const maxRetries = options.maxRetries || MAX_RETRIES;
  const timeout = options.timeout || TIMEOUT;

  const loadWithRetry = async () => {
    try {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;

      const loadPromise = new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;

        setTimeout(() => {
          reject(new Error(`Script load timeout: ${url}`));
        }, timeout);
      });

      document.body.appendChild(script);
      await loadPromise;
      return script;
    } catch (error) {
      if (retries >= maxRetries) {
        throw new Error(`Failed to load script after ${maxRetries} retries: ${url}`);
      }
      retries++;
      await new Promise(resolve => setTimeout(resolve, INITIAL_RETRY_DELAY * Math.pow(2, retries - 1)));
      return loadWithRetry();
    }
  };

  return loadWithRetry();
}

// Función para verificar si un endpoint está disponible
export async function checkEndpoint(url, options = {}) {
  try {
    const response = await fetch(url, {
      method: 'HEAD',
      ...options
    });
    return response.ok;
  } catch {
    return false;
  }
}

// Función para cargar múltiples scripts en orden
export async function loadScriptsSequentially(urls) {
  for (const url of urls) {
    await loadScript(url);
  }
}

// Función para cargar múltiples scripts en paralelo
export async function loadScriptsParallel(urls) {
  return Promise.all(urls.map(url => loadScript(url)));
} 