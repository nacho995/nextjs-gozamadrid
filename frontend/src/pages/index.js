// src/pages/index.js
import React from 'react';
import Head from 'next/head';
import { getCleanJsonLd } from "@/utils/structuredDataHelper";

// Importación de componentes directamente en lugar de a través de HomeComponent
import Eslogan from "../components/eslogan";
import ImageSlider from "../components/slider";
import BlogHome from "../components/blog";
import CounterExp from "../components/countereXp";
import Video from "../components/video";
import YoutubeVideo from "../components/Youtube";
import Cards from "../components/cards";
import RegisterForm from "../components/FormContact";
import Guide from "../components/guia";
import Agreements from "../components/Agreements";

export default function Home() {
  const gradientStyle = {
    backgroundImage: "url('/gozamadridwp.jpg')",
    backgroundAttachment: "fixed",
  };

  // Datos para RealEstateAgent
  const agentData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Goza Madrid",
    "description": "Agencia inmobiliaria especializada en Madrid, ofreciendo servicios de compra, venta y alquiler de propiedades",
    "url": "https://realestategozamadrid.com",
    "logo": "https://realestategozamadrid.com/logo.png",
    "image": "https://realestategozamadrid.com/og-image.jpg",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nueva España",
      "addressLocality": "Madrid",
      "postalCode": "28009",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.423399",
      "longitude": "-3.676840"
    },
    "telephone": "+34 919 012 103",
    "email": "marta@gozamadrid.com",
    "sameAs": [
      "https://www.facebook.com/GozaMadridAI",
      "https://instagram.com/Gozamadrid54",
      "https://x.com/Marta12857571",
      "https://www.linkedin.com/in/marta-lópez-55516099/",
      "https://www.youtube.com/@gozamadrid2410"
    ]
  };

  // Datos para WebSite
  const websiteData = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "Goza Madrid",
    "url": "https://www.realestategozamadrid.com",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://www.realestategozamadrid.com/buscar?q={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Datos para RealEstateAgency
  const agencyData = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgency",
    "name": "Goza Madrid",
    "image": "https://realestategozamadrid.com/logo.png",
    "logo": {
      "@type": "ImageObject",
      "url": "https://realestategozamadrid.com/logo.png",
      "width": 150,
      "height": 65
    },
    "url": "https://realestategozamadrid.com",
    "description": "Agencia inmobiliaria especializada en Madrid, ofreciendo servicios de compra, venta y alquiler de propiedades",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Nueva España",
      "addressLocality": "Madrid",
      "postalCode": "28009",
      "addressCountry": "ES"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "40.423399",
      "longitude": "-3.676840"
    },
    "telephone": "+34 919 012 103",
    "email": "marta@gozamadrid.com",
    "sameAs": [
      "https://www.facebook.com/GozaMadridAI",
      "https://instagram.com/Gozamadrid54",
      "https://x.com/Marta12857571",
      "https://www.linkedin.com/in/marta-lópez-55516099/",
      "https://www.youtube.com/@gozamadrid2410"
    ],
    "openingHoursSpecification": [
      {
        "@type": "OpeningHoursSpecification",
        "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
        "opens": "09:00",
        "closes": "18:00"
      }
    ]
  };

  // Convertir a JSON-LD limpio
  const cleanAgentData = getCleanJsonLd(agentData);
  const cleanWebsiteData = getCleanJsonLd(websiteData);
  const cleanAgencyData = getCleanJsonLd(agencyData);

  return (
    <>
      <Head>
        <title>Goza Madrid - Inmobiliaria de Lujo en Madrid</title>
        <meta name="description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Datos estructurados principales - RealEstateAgent */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: cleanAgentData }}
        />
        
        {/* WebSite datos estructurados */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: cleanWebsiteData }}
        />

        {/* RealEstateAgency datos estructurados */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: cleanAgencyData }}
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
