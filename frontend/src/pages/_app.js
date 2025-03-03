// pages/_app.js
import Head from 'next/head';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import '../globals.css';
import { NavbarProvider } from '../components/context/navBarContext';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';
import SamsungInternetFix from '../components/SamsungInternetFix';


function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);
    
    const handleStart = () => setLoading(true);
    const handleComplete = () => setLoading(false);

    Router.events.on('routeChangeStart', handleStart);
    Router.events.on('routeChangeComplete', handleComplete);
    Router.events.on('routeChangeError', handleComplete);

    return () => {
      clearTimeout(timer);
      Router.events.off('routeChangeStart', handleStart);
      Router.events.off('routeChangeComplete', handleComplete);
      Router.events.off('routeChangeError', handleComplete);
    };
  }, []);

  return (
    <>
      <Head>
        <title>Goza Madrid</title>
        <link rel="icon" href="/logo.png" />
        <meta name="description" content="Descripción de mi sitio web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style jsx global>{`
          :root {
            --color-amarillo: #f59e0b;
            --color-amarillo-rgb: 245, 158, 11;
            --color-amarillo-hover: #d97706;
          }
          
          /* Configurar Tailwind Typography para que respete nuestros estilos personalizados */
          .prose img.float-left, .prose img.float-right {
            margin: 0;
          }
          
          .prose p:has(img.float-left), .prose p:has(img.float-right) {
            overflow: auto;
          }
        `}</style>
      </Head>
      
      <SamsungInternetFix />
      
      {loading && <LoadingScreen />}
      
      <NavbarProvider>
        <Layout>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </NavbarProvider>
    </>
  );
}

export default MyApp;
