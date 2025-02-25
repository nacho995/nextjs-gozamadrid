// pages/_app.js
import Head from 'next/head';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import '../globals.css';
import ControlMenu from '@/components/header';
import { NavbarProvider } from '../components/context/navBarContext';
import { Toaster } from 'react-hot-toast';


function MyApp({ Component, pageProps }) {
  const [loading, setLoading] = useState(false);

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

  return (
    <>
      <Head>
        <title>Goza Madrid</title>
        <link rel="icon" href="/logo.png" />
        <meta name="description" content="Descripción de mi sitio web" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>
      <NavbarProvider>
        {loading ? (
          <div className="flex justify-center items-center h-screen w-full bg-white">
            <p className="text-2xl font-bold">Cargando...</p>
          </div>
        ) : (
          <>
            <Layout>
              <Component {...pageProps} />
            </Layout>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#333',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  theme: {
                    primary: '#4CAF50',
                  },
                },
                error: {
                  duration: 3000,
                  theme: {
                    primary: '#E53E3E',
                  },
                },
              }}
            />
          </>
        )}
      </NavbarProvider>
    </>
  );
}

export default MyApp;
