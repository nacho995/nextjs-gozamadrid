// src/pages/index.js - VERSIÓN FINAL RESTAURADA
import React from 'react';
import Head from 'next/head';
import { getCleanJsonLd } from "@/utils/structuredDataHelper";

// Importación de componentes - TODOS FUNCIONAN CORRECTAMENTE
import Eslogan from "../components/eslogan";
import ImageSlider from "../components/slider";
import Video from "../components/video";
import Cards from "../components/cards";
import BlogHome from "../components/blog";
import RegisterForm from "../components/FormContact";
import Guide from "../components/guia";
import Agreements from "../components/Agreements";


export default function Home() {
  
  return (
    <>
      <Head>
        <title>Goza Madrid - Inmobiliaria de Lujo en Madrid</title>
        <meta name="description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        
        {/* Script de diagnóstico para producción */}
        <script 
          dangerouslySetInnerHTML={{
            __html: `
              if (window.location.hostname === 'www.realestategozamadrid.com') {
                const script = document.createElement('script');
                script.src = '/video-diagnostic.js';
                script.async = true;
                document.head.appendChild(script);
              }
            `
          }}
        />
      </Head>
      
      <div className="relative">
        {/* PÁGINA COMPLETA RESTAURADA - LAYOUT ORIGINAL */}
        <Video />
        <Cards />
        <Eslogan />
        <ImageSlider />
        <BlogHome />
        <Guide />
        <RegisterForm />
        <Agreements />
      </div>
    </>
  );
}
