"use client";
import React, { useRef, useState } from "react";
import AnimatedOnScroll from "./AnimatedScroll";


export default function YoutubeVideo({ videoId, title }) {
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <AnimatedOnScroll>
      <div className="relative w-full flex flex-col md:flex-row h-[50vh]">
        {/* Contenedor de texto (lado izquierdo en desktop) */}
        <div
          className="w-full md:w-1/2 flex items-center justify-center p-4"
          style={{
            backgroundImage:
              "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/exp-gold.gif')",
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="relative z-10 p-4 flex flex-col justify-center items-center">
            <h2 className="text-white text-sm sm:text-xl lg:text-4xl font-extrabold text-center">
              ¿Por qué unirte a eXp España?
            </h2>
            <p className="text-white text-sm sm:text-md lg:text-3xl font-bold text-center mx-20 mt-1">
              Rompe barreras con una de las agencias inmobiliarias de mayor crecimiento del mundo y descubre nuevas formas de facturar, aprender y hacer crecer tu negocio.
            </p>
          </div>
        </div>
        {/* Contenedor del video (lado derecho en desktop) */}
        <div
          className="w-full md:w-1/2 flex items-center justify-center mt-4 md:mt-0"
          style={{ aspectRatio: "16 / 9" }}
        >
          <iframe
            ref={iframeRef}
            src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}`}
            title={title}
            className="rounded-lg w-full h-full"
            frameBorder="0"
            allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            onClick={handlePlay}
          />
        </div>
      </div>
    </AnimatedOnScroll>
  );
}
