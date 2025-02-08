"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";

const Video = () => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState("/video.mp4"); // Asegúrate de que el archivo esté en la carpeta public

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.loop = true; // Esto asegura que el video se repita
            videoElement.load(); // Recarga el video
            videoElement.play(); // Reproduce el video automáticamente
        }
    }, [videoSrc]); // El video se controla automáticamente sin necesidad de cambiar el src

    return (
        <div className="w-full h-[90vh] overflow-hidden relative">
            {/* Video */}
            <video
                className="absolute top-[-10%] left-0 w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                ref={videoRef}
            >
                <source src={videoSrc} type="video/mp4" />
                Tu navegador no soporta el elemento de video.
            </video>

            {/* Línea gris con texto (si deseas agregar algo más aquí, puedes hacerlo) */}
            <div className="absolute bottom-0 left-0 w-full flex justify-center items-center z-10">
                <div className="relative w-full h-40 flex items-center justify-center">
                    {/* Gradiente con bordes ligeramente transparentes */}
                    <div
                        className="absolute w-full h-full bg-gradient-to-t"
                        style={{
                            background: "linear-gradient(to top, transparent 5%, black 20%, black 80%, transparent 95%)",
                        }}
                    ></div>

                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-400 to-white px-2 text-6xl font-bold">
                        Invierte en bienes inmuebles en Madrid
                    </span>
                </div>
            </div>
            <div className="p-3 bg-white/40 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <Link
          className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-amarillo text-black gap-2 hover:bg-black hover:text-white text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-bold"
          href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
          target="_blank"
          rel="noopener noreferrer"
        >
          Valora el precio de tu propiedad
        </Link>
      </div>
        </div>
    );
};

export default Video;
