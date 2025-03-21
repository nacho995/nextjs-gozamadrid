// pages/_app.js
import Head from 'next/head';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import '@/styles/globals.css';
import { NavbarProvider } from '../components/context/navBarContext';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';
import { useRouter } from 'next/router';
import { UserProvider } from '../context/UserContext';
import { CookieProvider } from '../context/CookieContext';

// Detectar qué ruta del proxy está disponible
if (typeof window !== 'undefined') {
  // Resolver problema de 404 al cargar directamente una ruta
  // Si estamos en la página 404.html, redirigir a la página principal
  if (window.location.pathname === '/404' || window.location.pathname === '/404.html') {
    window.location.href = '/';
  }

  // Función para verificar si una ruta está disponible
  const checkEndpointAvailability = async (url) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch(url, {
        method: 'HEAD',
        signal: controller.signal,
        cache: 'no-store'
      }).finally(() => clearTimeout(timeoutId));
      
      return response.ok;
    } catch (error) {
      console.error(`Error comprobando endpoint ${url}:`, error);
      return false;
    }
  };
  
  // Al cargar, verificar ambas rutas
  Promise.all([
    checkEndpointAvailability('/api/proxy?service=woocommerce&resource=products'),
    checkEndpointAvailability('/api/woocommerce-proxy?endpoint=products')
  ]).then(([proxyAvailable, woocommerceProxyAvailable]) => {
    console.log(`Disponibilidad de endpoints - Proxy general: ${proxyAvailable}, WooCommerce proxy: ${woocommerceProxyAvailable}`);
    
    // Guardar la configuración según el resultado
    window.__USE_WOOCOMMERCE_PROXY_ROUTE = woocommerceProxyAvailable && !proxyAvailable;
    
    console.log(`Usando ruta: ${window.__USE_WOOCOMMERCE_PROXY_ROUTE ? 'WooCommerce proxy específico' : 'Proxy general'}`);
  }).catch(error => {
    console.error('Error detectando endpoints disponibles:', error);
    // Por defecto, usar el proxy general
    window.__USE_WOOCOMMERCE_PROXY_ROUTE = false;
  });
}

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hideControlMenu, setHideControlMenu] = useState(false);
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';

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
    <CookieProvider>
      <UserProvider>
        <Head>
          <title>Goza Madrid | Inmobiliaria de Lujo en Madrid</title>
          <meta name="description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas. Asesoramiento personalizado para inversores nacionales e internacionales." />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <link rel="icon" href={`${assetPrefix}/logo.png`} />
          
          {/* Metadatos básicos */}
          <meta charSet="UTF-8" />
          <meta name="author" content="Goza Madrid" />
          <meta name="robots" content="index, follow" />
          
          {/* Open Graph / Facebook */}
          <meta property="og:type" content="website" />
          <meta property="og:url" content="https://gozamadrid.com/" />
          <meta property="og:title" content="Goza Madrid | Inmobiliaria de Lujo en Madrid" />
          <meta property="og:description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas. Asesoramiento personalizado para inversores nacionales e internacionales." />
          <meta property="og:image" content="https://gozamadrid.com/og-image.jpg" />
          
          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content="https://gozamadrid.com/" />
          <meta property="twitter:title" content="Goza Madrid | Inmobiliaria de Lujo en Madrid" />
          <meta property="twitter:description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas. Asesoramiento personalizado para inversores nacionales e internacionales." />
          <meta property="twitter:image" content="https://gozamadrid.com/twitter-image.jpg" />
          <script src="/config.js" />
        </Head>
        
        {loading && <LoadingScreen />}
        
        <NavbarProvider>
          <Layout hideControlMenu={hideControlMenu}>
            <Component {...pageProps} />
          </Layout>
          <Toaster />
        </NavbarProvider>
      </UserProvider>
    </CookieProvider>
  );
}

export default MyApp;
