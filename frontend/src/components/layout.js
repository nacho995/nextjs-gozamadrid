// src/components/layout.js
import React from 'react';
import Head from 'next/head';
import ControlMenu from './header';
import Footer3 from './footer';
import CookieConsent from './CookieConsent';
import { useRouter } from 'next/router';

// Schema.org para la estructura del sitio
const getWebsiteSchema = () => ({
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "Goza Madrid",
  "url": "https://www.realestategozamadrid.com",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "https://www.realestategozamadrid.com/buscar?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
});

// Schema.org para la organización
const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Goza Madrid",
  "url": "https://www.realestategozamadrid.com",
  "logo": "https://www.realestategozamadrid.com/logo.png",
  "contactPoint": {
    "@type": "ContactPoint",
    "telephone": "+34-XXX-XXX-XXX",
    "contactType": "customer service",
    "areaServed": "ES",
    "availableLanguage": ["Spanish", "English"]
  }
});

const Layout = ({ children }) => {
  // Usar el router para detectar la página actual
  const router = useRouter();
  
  // Verificar si estamos en la página de propiedades-lujo
  const isLuxuryPropertiesPage = router.pathname === '/propiedades-lujo';
  
  return (
  <>
    <Head>
      <meta charSet="utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta httpEquiv="X-UA-Compatible" content="IE=edge" />
      <meta name="format-detection" content="telephone=no" />
      <meta name="theme-color" content="#fbbf24" />
      <meta name="msapplication-TileColor" content="#fbbf24" />
      <meta name="msapplication-config" content="/browserconfig.xml" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#fbbf24" />
      
      {/* Metadatos para rendimiento */}
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <link rel="dns-prefetch" href="https://www.google-analytics.com" />
      
      {/* Schema.org structured data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getWebsiteSchema()) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(getOrganizationSchema()) }}
      />
    </Head>

    <div className="flex flex-col min-h-screen bg-transparent">
      {/* Solo mostrar el Header y Footer en páginas diferentes a propiedades-lujo */}
      {!isLuxuryPropertiesPage && (
        <header className="relative z-50">
          <ControlMenu/>
        </header>
      )}

      <main className="flex-grow" role="main" id="main-content">
        {children}
      </main>

      {!isLuxuryPropertiesPage && (
        <footer className="relative z-40">
          <Footer3 />
        </footer>
      )}

      <CookieConsent />
    </div>
  </>
);
};

export default Layout;
