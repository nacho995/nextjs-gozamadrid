"use client";

import "tailwindcss/tailwind.css";

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



export default function Home() {
  const gradientStyle = {
    backgroundImage: "url('/gozamadridwp.jpg')",
    backgroundAttachment: "fixed",
  };

  return (
    <>
      <div className="">
        <div className="fixed inset-0 z-0 opacity-100 bg-contain bg-center" style={gradientStyle}></div>

        <div className="absolute top-0 left-0 w-full z-1">
          <Video />
        </div>

        <div className="relative z-1">
          <div className="w-full 
            mt-[100vh]                 /* móvil por defecto */
            sm:mt-[100vh]              /* tablets pequeñas */
            md:mt-[80vh]              /* tablets */
            lg:mt-[100vh]             /* desktop */
            sm:mb-[60vh] 
            md:mb-[-60vh] 
            lg:mb-[30vh] 
            mb-[60vh]
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




