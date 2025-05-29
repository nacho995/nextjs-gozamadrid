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

// Detectar qué ruta del proxy está disponible - simplificado
if (typeof window !== 'undefined') {
  // Resolver problema de 404 al cargar directamente una ruta
  if (window.location.pathname === '/404' || window.location.pathname === '/404.html') {
    window.location.href = '/';
  }

  // Función simplificada para verificar endpoints
  async function checkEndpointAvailability(url) {
    try {
      console.log(`[_app.js] Verificando disponibilidad de: ${url}`);
      const response = await fetch(url, {
        method: 'GET',
        headers: { 'Accept': 'application/json' },
        signal: AbortSignal.timeout(3000) // Timeout reducido
      });
      
      const available = response.ok;
      console.log(`[_app.js] Endpoint ${url} disponible:`, available);
      return available;
    } catch (error) {
      console.warn(`[_app.js] Error verificando endpoint ${url}:`, error.message);
      return false;
    }
  }
  
  // Al cargar, verificar endpoints principales
  const BASE_URL = window.location.origin;

  Promise.all([
    checkEndpointAvailability(`${BASE_URL}/api/properties/sources/mongodb`),
    checkEndpointAvailability(`${BASE_URL}/api/properties/sources/woocommerce`),
    checkEndpointAvailability(`${BASE_URL}/api/proxy/wordpress/posts`)
  ]).then(([mongodbAvailable, wooCommerceAvailable, wordPressProxyAvailable]) => {
    console.log('[_app.js] Estado de endpoints:', {
      'properties/mongodb': mongodbAvailable,
      'properties/woocommerce': wooCommerceAvailable,
      'proxy/wordpress': wordPressProxyAvailable
    });
    
    // Configuración simplificada
    window.__ENDPOINTS_STATUS = {
      mongodb: mongodbAvailable,
      woocommerce: wooCommerceAvailable,
      wordpress: wordPressProxyAvailable
    };
    
    console.log('[_app.js] Configuración de rutas:', window.__ENDPOINTS_STATUS);
    console.log('[_app.js] Usando endpoints directos de la API');
  }).catch(error => {
    console.error('[_app.js] Error detectando endpoints disponibles:', error);
    // Configuración por defecto
    window.__ENDPOINTS_STATUS = {
      mongodb: true,
      woocommerce: true,
      wordpress: true
    };
  });
}

// Función para cargar la configuración global - simplificada
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
      frontendUrl: '',
      apiUrl: '/api/properties',
      debug: process.env.NODE_ENV === 'development'
    };

    // Forzar uso de endpoints directos para MongoDB
    if (window.appConfig.endpoints && window.appConfig.endpoints.mongodb) {
      window.appConfig.endpoints.mongodb.useProxy = false;
      console.log('[_app.js] Forzando uso de endpoint directo para MongoDB');
    }
    window.appConfig.useProxyForMongoDB = false;
    console.log('[_app.js] Forzando useProxyForMongoDB a false globalmente');

    console.log('[_app.js] Configuración cargada exitosamente:', window.appConfig);
    return true;
  } catch (error) {
    console.error('[_app.js] Error cargando la configuración:', error);
    
    // Configuración por defecto en caso de error
    window.appConfig = {
      frontendUrl: '',
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
      },
      useProxyForMongoDB: false
    };
    
    console.log('[_app.js] Usando configuración por defecto');
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

  // Verificar si la página tiene su propio layout personalizado
  const getLayout = Component.getLayout || ((page) => (
    <Layout hideControlMenu={hideControlMenu}>{page}</Layout>
  ));

  return (
    <CookieProvider>
      <UserProvider>
        <NavbarProvider>
          <>
            <Head>
              {/* Meta tags */}
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta charSet="UTF-8" />
              <meta name="theme-color" content="#C7A336" /> {/* Color amarillo personalizado */}

              {/* Favicon links - Logo de pestaña */}
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} sizes="any" />
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} type="image/png" sizes="32x32" />
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} type="image/png" sizes="16x16" />
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} type="image/png" sizes="48x48" />
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} type="image/png" sizes="64x64" />
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} type="image/png" sizes="128x128" />
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} type="image/png" sizes="256x256" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="180x180" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="152x152" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="144x144" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="120x120" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="114x114" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="76x76" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="72x72" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="60x60" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="57x57" />
              <link rel="manifest" href={`${assetPrefix}/manifest.json`} />

              {/* Preconnect hints */}
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
              
              {/* Font stylesheet */}
              <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;800;900&family=Roboto:wght@300;400;500;700&display=swap" rel="stylesheet" />
              
              {/* Deshabilitar prefetching para ciertas páginas o globalmente */}
              <meta httpEquiv="x-dns-prefetch-control" content="off" />
            </Head>

            {/* Meta Pixel Code - Base */}
            <Script id="meta-pixel-base" strategy="afterInteractive">
              {`
                !function(f,b,e,v,n,t,s)
                {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
                n.callMethod.apply(n,arguments):n.queue.push(arguments)};
                if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
                n.queue=[];t=b.createElement(e);t.async=!0;
                t.src=v;s=b.getElementsByTagName(e)[0];
                s.parentNode.insertBefore(t,s)}(window, document,'script',
                'https://connect.facebook.net/en_US/fbevents.js');
                fbq('init', '952341806905435');
                fbq('track', 'PageView');
              `}
            </Script>
            {/* Meta Pixel Code - NoScript Fallback */}
            <noscript>
              <img height="1" width="1" style={{ display: 'none' }}
                   src="https://www.facebook.com/tr?id=952341806905435&ev=PageView&noscript=1"
                   alt="" // Añadido alt vacío por accesibilidad
              />
            </noscript>
            {/* End Meta Pixel Code */}

            {/* Global Loading Screen */}
            {loading && <LoadingScreen />}
            
            {/* Aplicar el layout personalizado o el predeterminado */}
            {getLayout(<Component {...pageProps} />)}
          </>
        </NavbarProvider>
      </UserProvider>
    </CookieProvider>
  );
}

export default MyApp;
