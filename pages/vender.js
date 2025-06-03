import Head from "next/head";
import RegisterForm from "@/components/FormContact";
import VenderPropiedad from "@/components/vender/venderPropiedad";

export default function Vender() {
  const pageTitle = "Vender tu Propiedad en Madrid | Servicios de Venta | Goza Madrid";
  const pageDescription = "Confía en los expertos para vender tu propiedad en Madrid. Valoración gratuita, marketing especializado, y asesoramiento completo para maximizar el valor de tu inmueble.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://realestategozamadrid.com/vender" />

        {/* Open Graph */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://realestategozamadrid.com/img/vender-propiedad.jpg" />
        <meta property="og:url" content="https://realestategozamadrid.com/vender" />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://realestategozamadrid.com/img/vender-propiedad.jpg" />

        {/* Schema.org Service */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Service",
            "name": "Servicios de Venta de Propiedades",
            "description": pageDescription,
            "provider": {
              "@type": "RealEstateAgent",
              "name": "Goza Madrid Inmobiliaria",
              "url": "https://realestategozamadrid.com",
              "telephone": "+34 919 012 103",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "Calle de Alcalá, 96",
                "addressLocality": "Madrid",
                "postalCode": "28009",
                "addressCountry": "ES"
              }
            },
            "areaServed": {
              "@type": "City",
              "name": "Madrid"
            },
            "hasOfferCatalog": {
              "@type": "OfferCatalog",
              "name": "Servicios de Venta",
              "itemListElement": [
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Valoración Gratuita",
                    "description": "Análisis profesional del valor de mercado de tu propiedad"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Marketing Inmobiliario",
                    "description": "Estrategia de marketing personalizada para tu propiedad"
                  }
                },
                {
                  "@type": "Offer",
                  "itemOffered": {
                    "@type": "Service",
                    "name": "Asesoramiento Legal",
                    "description": "Apoyo legal completo durante todo el proceso de venta"
                  }
                }
              ]
            }
          })}
        </script>

        {/* Schema.org BreadcrumbList */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Inicio",
                "item": "https://realestategozamadrid.com"
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Servicios",
                "item": "https://realestategozamadrid.com/servicios"
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": "Vender",
                "item": "https://realestategozamadrid.com/vender"
              }
            ]
          })}
        </script>

        {/* Schema.org RealEstateAgent */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "RealEstateAgent",
            "name": "Goza Madrid Inmobiliaria",
            "image": "https://realestategozamadrid.com/logo.png",
            "description": "Agencia inmobiliaria especializada en la venta de propiedades en Madrid",
            "url": "https://realestategozamadrid.com",
            "telephone": "+34 919 012 103",
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
            "areaServed": "Madrid",
            "priceRange": "€€€€"
          })}
        </script>

        {/* Metadatos adicionales */}
        <meta name="keywords" content="vender propiedad madrid, venta inmuebles madrid, valoración gratuita, agente inmobiliario madrid, vender piso madrid" />
        <meta name="author" content="Goza Madrid Inmobiliaria" />
        <meta property="og:locale" content="es_ES" />
        <meta name="geo.region" content="ES-M" />
        <meta name="geo.placename" content="Madrid" />
        <meta name="geo.position" content="40.423697;-3.676181" />
        <meta name="ICBM" content="40.423697, -3.676181" />
      </Head>

      <VenderPropiedad/>
      <RegisterForm/>
    </>
  );
}




