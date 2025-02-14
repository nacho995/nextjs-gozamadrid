import Head from 'next/head';
import { useState, useEffect } from 'react';
import Router from 'next/router';
import Layout from '../components/layout';
import '../globals.css';

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
      {loading ? (
        // Loading screen displayed during page transitions
        <div className="flex justify-center items-center h-screen w-full bg-white">
          <p className="text-2xl font-bold">Cargando...</p>
        </div>
      ) : (
        <Layout>
          <Component {...pageProps} />
        </Layout>
      )}
    </>
  );
}

export default MyApp;
