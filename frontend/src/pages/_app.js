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

    return () => {
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleComplete);
      Router.events.off('routeChangeError', handleComplete);
    };
  }, []);

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
