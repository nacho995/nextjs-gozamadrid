"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";

const Video = () => {
  const videoRef = useRef(null);
  const [videoSrc, setVideoSrc] = useState("/video.mp4"); // Asegúrate de que el archivo esté en la carpeta public

  useEffect(() => {
    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.loop = true; // Hace que el video se repita
      videoElement.load(); // Recarga el video
      videoElement.play(); // Reproduce el video automáticamente
    }
  }, [videoSrc]);

  // Usamos el src directamente
  const completeVideoSrc = videoSrc;

  return (
    <AnimatedOnScroll>
      <div className="w-full h-[70vh] sm:h-[90vh] overflow-hidden relative">
        {/* Video de fondo */}
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          muted
          playsInline
          ref={videoRef}
        >
          <source src={completeVideoSrc} type="video/mp4" />
          Tu navegador no soporta el elemento de video.
        </video>

        {/* Gradiente y texto overlay */}
        <div className="absolute bottom-0 left-0 w-full flex justify-center items-center z-10">
          <div className="relative w-full h-24 sm:h-32 flex items-center justify-center">
            {/* Gradiente */}
            <div
              className="absolute w-full h-full bg-gradient-to-t"
              style={{
                background:
                  "linear-gradient(to top, transparent 10%, black 30%, black 70%, transparent 90%)",
              }}
            ></div>
            {/* Texto responsivo */}
            <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-400 to-white px-2 text-xl sm:text-3xl md:text-6xl font-bold">
              Invierte en bienes inmuebles en Madrid
            </span>
          </div>
        </div>

        {/* Botón central */}
        <div className="p-3 bg-white/40 rounded-full absolute top-[65%] sm:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <Link
            className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-amarillo text-black gap-2 hover:bg-black hover:text-white text-xs sm:text-sm md:text-base h-8 sm:h-10 md:h-12 px-3 sm:px-4 md:px-5 font-bold"
            href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
            target="_blank"
            rel="noopener noreferrer"
          >
            Valora el precio de tu propiedad
          </Link>
        </div>
      </div>
    </AnimatedOnScroll>
  );
};

export default Video;
