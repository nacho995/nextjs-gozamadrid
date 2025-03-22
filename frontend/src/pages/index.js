// src/pages/index.js
import React from 'react';
import Head from 'next/head';

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

  return (
    <>
      <Head>
        <title>Goza Madrid - Inmobiliaria de Lujo en Madrid</title>
        <meta name="description" content="Expertos en servicios inmobiliarios de lujo en Madrid. Compra, venta y alquiler de propiedades exclusivas." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
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
