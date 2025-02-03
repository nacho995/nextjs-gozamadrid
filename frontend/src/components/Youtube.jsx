"use client";
import React, { useRef, useState } from "react";

const YoutubeVideo = ({ videoId, title }) => {
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  return (
    <div className="relative w-full flex justify-end">
      <hr className="absolute top-0 left-0 w-full  border-gray-500" />
      <div
        className="absolute left-0 bg-cover bg-center p-4 w-1/2 z-10 flex flex-col justify-center items-center h-full"
        style={{
          backgroundImage:
            "linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/exp-gold.gif')",
        }}
      >
        <div className="relative z-10 p-4 flex flex-col justify-center items-center rounded-lg">
          <h2 className="text-white text-8xl font-extrabold text-center">
            ¿Por qué unirte a eXp España?
          </h2>
          <p className="text-white text-xl font-bold text-center mx-20 mt-1">
            Rompe barreras con una de las agencias inmobiliarias de mayor crecimiento del mundo y descubre nuevas formas de facturar, aprender y hacer crecer tu negocio.
          </p>
        </div>
      </div>

      <hr className="absolute bottom-0 left-0 w-full border-gray-500" />
      <div className="relative mr-15 w-1/2" style={{ aspectRatio: "16 / 9" }}>
        <iframe
          ref={iframeRef}
          src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}`}
          title={title}
          className="rounded-lg absolute inset-0 w-full h-full"
          frameBorder="0"
          allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          onClick={handlePlay}
        />
      </div>
    </div>
  );
};

export default YoutubeVideo;
