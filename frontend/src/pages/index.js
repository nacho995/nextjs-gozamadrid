// src/pages/index.js
import Head from 'next/head';
import Home from '@/components/home';

function Index() {
  const pageTitle = "Goza Madrid | Inmobiliaria de Lujo en Madrid | Compra, Venta y Alquiler";
  const pageDescription = "Especialistas en propiedades de lujo en Madrid. Servicios inmobiliarios premium, asesoramiento personalizado y amplia cartera de propiedades exclusivas en las mejores zonas de Madrid.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://gozamadrid.com" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://gozamadrid.com/img/home-hero.jpg" />
        <meta property="og:url" content="https://gozamadrid.com" />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://gozamadrid.com/img/home-hero.jpg" />

        {/* Schema.org RealEstateAgent */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Goza Madrid Inmobiliaria",
            "image": "https://gozamadrid.com/logo.png",
            "description": pageDescription,
            "url": "https://gozamadrid.com",
            "telephone": "+34 919 012 103",
            "email": "marta@gozamadrid.com",
            "address": {
              "@type": "PostalAddress",
              "streetAddress": "Calle de Alcalá, 96",
              "addressLocality": "Madrid",
              "postalCode": "28009",
              "addressCountry": "ES"
            },
            "geo": {
              "@type": "GeoCoordinates",
              "latitude": "40.423697",
              "longitude": "-3.676181"
            },
            "areaServed": {
              "@type": "City",
              "name": "Madrid"
            },
            "priceRange": "€€€€",
            "sameAs": [
              "https://www.facebook.com/gozamadrid",
              "https://www.instagram.com/gozamadrid",
              "https://www.linkedin.com/company/gozamadrid"
            ],
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Servicios Inmobiliarios",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Venta de Propiedades de Lujo"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Alquiler de Propiedades Premium"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Asesoramiento Inmobiliario"
                  }
                }
              ]
            }
          })}
        </script>

        {/* Schema.org WebSite */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            "name": "Goza Madrid Inmobiliaria",
            "url": "https://gozamadrid.com",
            "potentialAction": {
              "@type": "SearchAction",
              "target": {
                "@type": "EntryPoint",
                "urlTemplate": "https://gozamadrid.com/buscar?q={search_term_string}"
              },
              "query-input": "required name=search_term_string"
            }
          })}
        </script>

        {/* Metadatos adicionales */}
        <meta name="keywords" content="inmobiliaria lujo madrid, propiedades exclusivas madrid, compra venta lujo, alquiler premium madrid, asesoramiento inmobiliario" />
        <meta name="author" content="Goza Madrid Inmobiliaria" />
        <meta property="og:locale" content="es_ES" />
        <link rel="alternate" hrefLang="es" href="https://gozamadrid.com" />
        <link rel="alternate" hrefLang="en" href="https://gozamadrid.com/en" />
        <meta name="geo.region" content="ES-M" />
        <meta name="geo.placename" content="Madrid" />
        <meta name="geo.position" content="40.423697;-3.676181" />
        <meta name="ICBM" content="40.423697, -3.676181" />
      </Head>

      <Home />
    </>
  );
}

export default Index;
