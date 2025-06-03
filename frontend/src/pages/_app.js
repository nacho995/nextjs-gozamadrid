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
import { UserProvider } from '../../context/UserContext';
import { CookieProvider } from '../../context/CookieContext';
import config from '@/config/config';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [hideControlMenu, setHideControlMenu] = useState(false);
  const assetPrefix = process.env.NEXT_PUBLIC_ASSET_PREFIX || '';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.appConfig = {
        frontendUrl: '',
        apiUrl: '/api/properties',
        debug: process.env.NODE_ENV === 'development',
        timeout: 15000,
        retries: 3,
        backoff: true,
        endpoints: {
          mongodb: {
            url: '/api/properties/sources/mongodb',
            available: true,
            params: {}
          }
        },
        useProxyForMongoDB: false
      };
      console.log('[_app.js] Configuración estática iniciada');
    }
  }, []);

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

  useEffect(() => {
    const hideOnPaths = ['/admin', '/login'];
    const shouldHide = hideOnPaths.some(path => router.pathname.startsWith(path));
    setHideControlMenu(shouldHide);
  }, [router.pathname]);

  const getLayout = Component.getLayout || ((page) => (
    <Layout hideControlMenu={hideControlMenu}>{page}</Layout>
  ));

  return (
    <CookieProvider>
      <UserProvider>
        <NavbarProvider>
          <>
            <Head>
              {/* Meta tags básicos */}
              <meta name="viewport" content="width=device-width, initial-scale=1" />
              <meta charSet="UTF-8" />
              <meta name="theme-color" content="#C7A336" />

              {/* Favicon links */}
              <link rel="icon" href={`${assetPrefix}/logopestana.png`} sizes="any" />
              <link rel="apple-touch-icon" href={`${assetPrefix}/logopestana.png`} sizes="180x180" />
              <link rel="manifest" href={`${assetPrefix}/manifest.json`} />

              {/* Preconnect hints */}
              <link rel="preconnect" href="https://fonts.googleapis.com" />
              <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
            </Head>

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
