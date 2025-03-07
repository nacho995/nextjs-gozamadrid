// pages/_app.js
import Head from 'next/head';
import Router from 'next/router';
import { useState, useEffect } from 'react';
import Layout from '../components/layout';
import '../styles/globals.css';
import { NavbarProvider } from '../components/context/navBarContext';
import { Toaster } from 'react-hot-toast';
import LoadingScreen from '../components/LoadingScreen';
import { useRouter } from 'next/router';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [hideControlMenu, setHideControlMenu] = useState(false);

  // Efecto para manejar la carga
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

  // Efecto separado para controlar la visibilidad del ControlMenu
  useEffect(() => {
    const isPropertyDetailPage = router.pathname === '/property/[id]';
    setHideControlMenu(isPropertyDetailPage);
  }, [router.pathname]);

  return (
    <>
      <Head>
        <title>Goza Madrid | Inmobiliaria de Lujo en Madrid</title>
        <meta name="description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas. Asesoramiento personalizado para inversores nacionales e internacionales." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/logo.png" />
        
        {/* Metadatos básicos */}
        <meta name="author" content="Goza Madrid Inmobiliaria" />
        <meta name="robots" content="index, follow" />
        <meta name="theme-color" content="#f59e0b" />
        <meta name="format-detection" content="telephone=no" />
        
        {/* Open Graph por defecto */}
        <meta property="og:type" content="website" />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />
        <meta property="og:title" content="Goza Madrid | Inmobiliaria de Lujo en Madrid" />
        <meta property="og:description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas." />
        <meta property="og:image" content="https://gozamadrid.com/img/og-image.jpg" />
        <meta property="og:url" content="https://gozamadrid.com" />

        {/* Twitter Card por defecto */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Goza Madrid | Inmobiliaria de Lujo en Madrid" />
        <meta name="twitter:description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas." />
        <meta name="twitter:image" content="https://gozamadrid.com/img/twitter-image.jpg" />

        {/* Schema.org Organization */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Goza Madrid Inmobiliaria",
            "description": "Agencia inmobiliaria especializada en propiedades de lujo en Madrid",
            "url": "https://gozamadrid.com",
            "logo": "https://gozamadrid.com/logo.png",
            "image": "https://gozamadrid.com/img/office.jpg",
            "address": {
              "@type": "PostalAddress",
              "addressLocality": "Madrid",
              "addressRegion": "Madrid",
              "addressCountry": "ES"
            },
            "contactPoint": {
              "@type": "ContactPoint",
              "telephone": "+34-XXX-XXX-XXX",
              "contactType": "customer service"
            },
            "sameAs": [
              "https://www.facebook.com/gozamadrid",
              "https://www.instagram.com/gozamadrid",
              "https://www.linkedin.com/company/gozamadrid"
            ]
          })}
        </script>

        {/* Metadatos de idioma y región */}
        <meta property="og:locale" content="es_ES" />
        <link rel="alternate" href="https://gozamadrid.com" hreflang="es-ES" />
        <link rel="alternate" href="https://gozamadrid.com/en" hreflang="en" />
        <link rel="alternate" href="https://gozamadrid.com" hreflang="x-default" />

        {/* Estilos globales */}
        <style jsx global>{`
          :root {
            --color-amarillo: #f59e0b;
            --color-amarillo-rgb: 245, 158, 11;
            --color-amarillo-hover: #d97706;
          }
          
          .prose img.float-left, .prose img.float-right {
            margin: 0;
          }
          
          .prose p:has(img.float-left), .prose p:has(img.float-right) {
            overflow: auto;
          }
        `}</style>
      </Head>
      
      {loading && <LoadingScreen />}
      
      <NavbarProvider>
        <Layout hideControlMenu={hideControlMenu}>
          <Component {...pageProps} />
        </Layout>
        <Toaster />
      </NavbarProvider>
    </>
  );
}

export default MyApp;
