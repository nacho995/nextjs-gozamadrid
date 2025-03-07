"use client";

import "tailwindcss/tailwind.css";
import Head from 'next/head';
import Eslogan from "./eslogan";
import ImageSlider from "./slider";
import BlogHome from "./blog";
import CounterExp from "./countereXp";
import Video from "./video";
import YoutubeVideo from "./Youtube";
import Cards from "./cards";
import RegisterForm from "./FormContact";
import Guide from "./guia";
import Agreements from "./Agreements";

// Schema.org para la página principal
const getHomeSchema = () => ({
  "@context": "https://schema.org",
  "@type": "RealEstateAgent",
  "name": "Goza Madrid",
  "description": "Agencia inmobiliaria especializada en Madrid. Ofrecemos servicios de compra, venta y alquiler de propiedades, con un enfoque personalizado y profesional.",
  "url": "https://www.gozamadrid.com",
  "logo": "https://www.gozamadrid.com/logo.png",
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Madrid",
    "addressRegion": "Madrid",
    "addressCountry": "ES"
  },
  "sameAs": [
    "https://www.facebook.com/gozamadrid",
    "https://www.instagram.com/gozamadrid",
    "https://www.linkedin.com/company/gozamadrid"
  ],
  "areaServed": {
    "@type": "City",
    "name": "Madrid"
  }
});

export default function Home() {
  const gradientStyle = {
    backgroundImage: "url('/gozamadridwp.jpg')",
    backgroundAttachment: "fixed",
  };

  return (
    <>
      <Head>
        <title>Goza Madrid | Agencia Inmobiliaria de Lujo en Madrid</title>
        <meta name="description" content="Descubre las mejores propiedades inmobiliarias en Madrid. Especialistas en compra, venta y alquiler de viviendas de lujo. Servicio personalizado y profesional." />
        <meta name="keywords" content="inmobiliaria madrid, propiedades lujo madrid, comprar casa madrid, vender piso madrid, alquiler viviendas madrid" />
        <link rel="canonical" href="https://www.gozamadrid.com" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Goza Madrid | Agencia Inmobiliaria de Lujo en Madrid" />
        <meta property="og:description" content="Especialistas en propiedades inmobiliarias de lujo en Madrid. Encuentra tu hogar ideal con nosotros." />
        <meta property="og:url" content="https://www.gozamadrid.com" />
        <meta property="og:image" content="https://www.gozamadrid.com/og-image.jpg" />
        <meta property="og:site_name" content="Goza Madrid" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Goza Madrid | Inmobiliaria de Lujo en Madrid" />
        <meta name="twitter:description" content="Tu agencia inmobiliaria de confianza en Madrid. Propiedades exclusivas y servicio personalizado." />
        <meta name="twitter:image" content="https://www.gozamadrid.com/twitter-card.jpg" />
        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />
        <meta name="author" content="Goza Madrid" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getHomeSchema()) }}
        />
      </Head>

      <div className="">
        <div className="fixed inset-0 z-0 opacity-100 bg-cover bg-center" style={gradientStyle}></div>

        <div className="absolute top-0 left-0 w-full z-1">
          <Video />
        </div>

        <div className="relative z-1">
          <div className="w-full 
            mt-[130vh]                 /* móvil por defecto */
            sm:mt-[130vh]              /* tablets pequeñas */
            md:mt-[80vh]              /* tablets */
            lg:mt-[100vh]             /* desktop */
            sm:mb-[155vh] 
            md:mb-[-60vh] 
            lg:mb-[30vh] 
            mb-[145vh]
            h-[50vh] 
            md:h-[100vh] 
            flex justify-center items-center"
          >
            <Cards />
          </div>

          <div className="w-full h[100vh] lg:mt-[-30vh] md:mt-[100vh]">
            <Eslogan />
          </div>
          <div className="w-full mb-4">
            <ImageSlider />
          </div>
          <div className="w-full mb-4">
            <BlogHome />
          </div>
          <div className="w-full h-[60vh] mb-4">
            <Guide />
          </div>
          <div>
            <CounterExp />
          </div>
          <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
          <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
          <div className="w-full mb-4">
            <YoutubeVideo videoId="UHx6yIrI5UY" title="Goza Madrid" />
          </div>
          <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
          <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
          
          <div className="w-full p-4 max-w-full mt-[40vh] sm:mt-[40vh] md:mt-16 lg:mt-0">
            <RegisterForm />
          </div>
        </div>
      </div>

      <div className="relative z-50 w-full min-h-[50vh]">
        <Agreements />
      </div>
    </>
  );
}




