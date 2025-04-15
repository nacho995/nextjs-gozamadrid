// pages/_app.js
import Head from 'next/head';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import '@/styles/globals.css';
import { NavbarProvider } from '../components/context/navBarContext';
import { Toaster } from 'sonner';
import LoadingScreen from '../components/LoadingScreen';
import { useRouter } from 'next/router';
import { UserProvider } from '../context/UserContext';
import { CookieProvider } from '../context/CookieContext';
import config from '@/config/config';
import Script from 'next/script';

// Script para interceptar las peticiones HEAD
const DISABLE_HEAD_SCRIPT = `
  // Desactivar HEAD requests
  (function() {
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      // Si es una petición HEAD, convertir a GET o cancelar
      if (options && options.method && options.method.toUpperCase() === 'HEAD') {
        console.log('[App] Interceptando HEAD request:', url);
        options.method = 'GET';
      }
      return originalFetch(url, options);
    };

    // Interceptar XMLHttpRequest
    const originalXHROpen = XMLHttpRequest.prototype.open;
    XMLHttpRequest.prototype.open = function(method, url, ...rest) {
      // Si es una petición HEAD, convertir a GET o cancelar
      if (method && method.toUpperCase() === 'HEAD') {
        console.log('[App] Interceptando HEAD XHR:', url);
        method = 'GET';
      }
      return originalXHROpen.call(this, method, url, ...rest);
    };
    
    // Parchar el prefetching de Next.js
    if (window.__NEXT_DATA__ && window.__NEXT_DATA__.props) {
      try {
        // Forzar rutas dinámicas para evitar prefetching
        window.__NEXT_DATA__.props.pageProps.__N_SSG = false;
        window.__NEXT_DATA__.props.pageProps.__N_SSP = false;
        
        // Parchar router de Next.js cuando esté disponible
        setTimeout(() => {
          if (window.next && window.next.router) {
            const originalPrefetch = window.next.router.prefetch;
            window.next.router.prefetch = function() {
              console.log('[App] Prefetch desactivado');
              return Promise.resolve();
            };
          }
        }, 0);
      } catch (e) {
        console.warn('[App] No se pudo modificar Next.js data');
      }
    }
    
    console.log('[App] Interceptación de HEAD requests activada');
  })();
`;

// Detectar qué ruta del proxy está disponible
if (typeof window !== 'undefined') {
  // Resolver problema de 404 al cargar directamente una ruta
  // Si estamos en la página 404.html, redirigir a la página principal
  if (window.location.pathname === '/404' || window.location.pathname === '/404.html') {
    window.location.href = '/';
  }

  // Función modificada para verificar la disponibilidad de endpoints usando GET en lugar de HEAD
  async function checkEndpointAvailability(url) {
    try {
      console.log(`[_app.js] Verificando disponibilidad de: ${url}`);
      const response = await fetch(url, {
        method: 'GET', // Cambiado de HEAD a GET
        headers: {
          'Accept': 'application/json'
        },
        // Timeout más corto para la verificación
        signal: AbortSignal.timeout(5000)
      });
      
      const available = response.ok;
      console.log(`[_app.js] Endpoint ${url} disponible:`, available);
      return available;
    } catch (error) {
      console.warn(`[_app.js] Error verificando endpoint ${url}:`, error);
      return false;
    }
  }
  
  // Al cargar, verificar ambas rutas
  const BASE_URL = typeof window !== 'undefined' ? window.location.origin : 'https://www.realestategozamadrid.com';

  Promise.all([
    checkEndpointAvailability(`${BASE_URL}/api/proxy/woocommerce/products`),
    checkEndpointAvailability(`${BASE_URL}/api/proxy/wordpress/posts`),
    checkEndpointAvailability(`${BASE_URL}/api/properties/sources/woocommerce`),
    checkEndpointAvailability(`${BASE_URL}/api/properties/sources/mongodb`)
  ]).then(([wooCommerceProxyAvailable, wordPressProxyAvailable, wooCommerceApiAvailable, mongodbApiAvailable]) => {
    console.log('[_app.js] Estado de endpoints:', {
      'proxy/woocommerce': wooCommerceProxyAvailable,
      'proxy/wordpress': wordPressProxyAvailable,
      'properties/woocommerce': wooCommerceApiAvailable,
      'properties/mongodb': mongodbApiAvailable
    });
    
    // Determinar qué ruta usar basado en la disponibilidad
    const useProxyRoute = !wooCommerceApiAvailable && !mongodbApiAvailable;
    const useWooCommerceProxy = wooCommerceProxyAvailable && !wooCommerceApiAvailable;
    
    window.__USE_PROXY_ROUTE = useProxyRoute;
    window.__USE_WOOCOMMERCE_PROXY = useWooCommerceProxy;
    
    console.log('[_app.js] Configuración de rutas:', {
      useProxyRoute,
      useWooCommerceProxy
    });
    
    if (useProxyRoute) {
      console.log('[_app.js] Usando proxy general debido a que los endpoints directos no están disponibles');
    } else if (useWooCommerceProxy) {
      console.log('[_app.js] Usando proxy específico de WooCommerce');
    } else {
      console.log('[_app.js] Usando endpoints directos de la API');
    }
  }).catch(error => {
    console.error('[_app.js] Error detectando endpoints disponibles:', error);
    // Por defecto, usar endpoints directos
    window.__USE_PROXY_ROUTE = false;
    window.__USE_WOOCOMMERCE_PROXY = false;
  });
}

// Función para cargar la configuración global
async function loadConfig() {
  try {
    console.log('[_app.js] Cargando configuración desde:', '/api/config/properties');
    
    const response = await fetch('/api/config/properties', {
      headers: {
        'Accept': 'application/json',
        'Cache-Control': 'no-cache'
      }
    });
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const { success, config: apiConfig, message } = await response.json();
    
    if (!success) {
      throw new Error(message || 'Error al cargar la configuración');
    }
    
    window.appConfig = {
      ...apiConfig,
      frontendUrl: '',  // Usar rutas relativas en el cliente
      apiUrl: '/api/properties',
      debug: process.env.NODE_ENV === 'development'
    };
    
    console.log('[_app.js] Configuración cargada exitosamente:', window.appConfig);
    return true;
  } catch (error) {
    console.error('[_app.js] Error cargando la configuración:', error);
    
    // Configuración por defecto en caso de error
    window.appConfig = {
      frontendUrl: '',  // Usar rutas relativas en el cliente
      apiUrl: '/api/properties',
      debug: process.env.NODE_ENV === 'development',
      timeout: 15000,
      retries: 3,
      backoff: true,
      endpoints: {
        woocommerce: {
          url: '/api/properties/sources/woocommerce',
          available: true,
          params: {}
        },
        mongodb: {
          url: '/api/properties/sources/mongodb',
          available: true,
          params: {}
        }
      }
    };
    
    console.log('[_app.js] Usando configuración por defecto:', window.appConfig);
    return false;
  }
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hideControlMenu, setHideControlMenu] = useState(false);
  const [configLoaded, setConfigLoaded] = useState(false);
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';

  // Efecto para cargar la configuración
  useEffect(() => {
    async function initConfig() {
      if (typeof window !== 'undefined' && !configLoaded) {
        const success = await loadConfig();
        setConfigLoaded(success);
      }
    }
    initConfig();
  }, [configLoaded]);

  // Efecto para manejar la carga
  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Efecto para manejar la navegación
  useEffect(() => {
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleComplete);
    Router.events.on('routeChangeError', handleComplete);

    // Verificar si estamos en la página 404 y redirigir si es necesario
    if (typeof window !== 'undefined' && (window.location.pathname === '/404' || window.location.pathname === '/404.html')) {
      router.replace('/');
    }

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleComplete);
      Router.events.off('routeChangeError', handleComplete);
    };
  }, [router]);

  // Efecto para ocultar el menú de control en ciertas rutas
  useEffect(() => {
    const hideOnPaths = ['/admin', '/login'];
    const shouldHide = hideOnPaths.some(path => router.pathname.startsWith(path));
    setHideControlMenu(shouldHide);
  }, [router.pathname]);

  return (
    <>
      <Head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#000000" />
        
        {/* Metatags globales para compartir en redes sociales */}
        <meta property="og:image" content="https://realestategozamadrid.com/logo-social.png" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:alt" content="Logo de Goza Madrid eXp Realty" />
        <meta property="og:site_name" content="Goza Madrid eXp" />
        <meta property="fb:app_id" content="966242223397117" />
        <meta property="og:type" content="website" />
        
        {/* Twitter */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:image" content="https://realestategozamadrid.com/logo-social.png" />
        
        {/* Script para verificar en Facebook */}
        <meta name="facebook-domain-verification" content="62e9m8ukfxs7w9s8gfsvr1w9fewju9" />
      </Head>
      
      <Script
        id="disable-head-requests"
        strategy="beforeInteractive"
        dangerouslySetInnerHTML={{ __html: DISABLE_HEAD_SCRIPT }}
      />
      <CookieProvider>
        <UserProvider>
          <NavbarProvider>
            <Toaster position="top-right" richColors closeButton />
            {loading && <LoadingScreen />}
            <Layout hideControlMenu={hideControlMenu}>
              <Component {...pageProps} />
            </Layout>
          </NavbarProvider>
        </UserProvider>
      </CookieProvider>
    </>
  );
}

export default MyApp;
