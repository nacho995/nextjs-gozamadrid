import '../src/styles/globals.css';
import Head from 'next/head';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useEffect } from 'react';
import Script from 'next/script';

// Script para interceptar las peticiones HEAD
const DISABLE_HEAD_SCRIPT = `
  // Desactivar HEAD requests
  (function() {
    // Interceptar fetch
    const originalFetch = window.fetch;
    window.fetch = function(url, options = {}) {
      // Si es una petición HEAD, convertir a GET o cancelar
      if (options.method && options.method.toUpperCase() === 'HEAD') {
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

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Configurar variables globales
    window.appConfig = {
      debug: process.env.NODE_ENV === 'development',
      frontendUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://gozamadrid.com',
      apiUrl: process.env.MONGODB_URL || 'https://api.realestategozamadrid.com',
      isConfigLoaded: true
    };
    
    // Desactivar prefetch para evitar peticiones HEAD
    if (typeof window !== 'undefined' && window.next && window.next.router) {
      const originalPrefetch = window.next.router.prefetch;
      window.next.router.prefetch = function() {
        return Promise.resolve();
      };
    }
  }, []);

  return (
    <>
      <Head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta charSet="utf-8" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      
      {/* Script para interceptar peticiones HEAD */}
      <Script id="disable-head-requests" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: DISABLE_HEAD_SCRIPT }} />
      
      <Header />
      <Component {...pageProps} />
      <Footer />
    </>
  );
}

export default MyApp; 