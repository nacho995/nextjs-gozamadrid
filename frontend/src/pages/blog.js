import React from 'react';
import Head from 'next/head';
import BlogPage from "@/components/blog/blogPage";

export default function BlogPreview() {
  const pageTitle = "Blog Inmobiliario Madrid | Noticias y Tendencias | Goza Madrid";
  const pageDescription = "Explora nuestro blog especializado en el mercado inmobiliario de Madrid. Artículos sobre tendencias, inversiones, consejos para comprar o vender, y análisis del sector inmobiliario madrileño.";

  return (
    <>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta name="robots" content="index, follow" />
        <link rel="canonical" href="https://realestategozamadrid.com/blog" />

        {/* Open Graph */}
        <meta property="og:type" content="blog" />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:image" content="https://realestategozamadrid.com/img/blog-header.jpg" />
        <meta property="og:url" content="https://realestategozamadrid.com/blog" />
        <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={pageDescription} />
        <meta name="twitter:image" content="https://realestategozamadrid.com/img/blog-header.jpg" />

        {/* Schema.org Blog */}
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Blog",
            "name": "Blog Inmobiliario Goza Madrid",
            "description": pageDescription,
            "url": "https://realestategozamadrid.com/blog",
            "image": "https://realestategozamadrid.com/img/blog-header.jpg",
            "publisher": {
              "@type": "Organization",
              "name": "Goza Madrid Inmobiliaria",
              "logo": {
                "@type": "ImageObject",
                "url": "https://realestategozamadrid.com/logo.png"
              }
            },
            "author": {
              "@type": "Organization",
              "name": "Goza Madrid Inmobiliaria",
              "url": "https://realestategozamadrid.com"
            },
            "inLanguage": "es",
            "copyrightYear": new Date().getFullYear(),
            "genre": ["Real Estate", "Property Market", "Investment Advice"],
            "keywords": "mercado inmobiliario madrid, tendencias inmobiliarias, inversión propiedades, consejos inmobiliarios"
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
                "name": "Blog",
                "item": "https://realestategozamadrid.com/blog"
              }
            ]
          })}
        </script>

        {/* Metadatos adicionales */}
        <meta name="keywords" content="blog inmobiliario madrid, noticias inmobiliarias, tendencias mercado inmobiliario, consejos compra venta, inversión inmobiliaria madrid" />
        <meta property="article:publisher" content="https://www.facebook.com/gozamadrid" />
        <meta name="author" content="Goza Madrid Inmobiliaria" />

        {/* Metadatos de compartir */}
        <meta name="twitter:site" content="@gozamadrid" />
        <meta name="twitter:creator" content="@gozamadrid" />
        <meta property="og:locale" content="es_ES" />
      </Head>

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative bg-gradient-to-b from-black to-gray-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Blog Inmobiliario
            </h1>
            <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
              Descubre las últimas tendencias, consejos y noticias sobre el mercado inmobiliario en Madrid.
            </p>
          </div>
        </div>
        <div
          className="fixed inset-0 z-0 opacity-100"
          style={{
            backgroundImage: "url('/gozamadridwp2.jpg')",
            backgroundAttachment: "fixed",
          }}
        ></div>
        <BlogPage />
      </div>
    </>
  );
} 