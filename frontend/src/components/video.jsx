"use client";
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/image";

const Video = () => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState("/video.mp4"); // Asegúrate de que el archivo esté en la carpeta public

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.loop = true; // Repetir video
            videoElement.load(); // Recargar el video
            videoElement.play(); // Reproducir automáticamente
        }
    }, [videoSrc]);

    return (
        <AnimatedOnScroll>
            <div className="w-full h-[40vh] lg:h-[90vh] overflow-hidden relative">
                {/* Video */}
                <video
                    className="absolute top-0 left-0 w-full h-full object-cover lg:object-fill"
                    autoPlay
                    muted
                    playsInline
                    ref={videoRef}
                >
                    <source src={videoSrc} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                </video>

                {/* Botón centrado */}
                <div className="absolute top-[25%] lg:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center items-center">
                    <Link
                        href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
                            px-4 sm:px-6 lg:px-8 
                            py-2 sm:py-2.5 lg:py-3 
                            transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
                            max-w-[90%] sm:max-w-[80%] lg:max-w-none"
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                            Valora el precio de tu propiedad
                        </span>
                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                    </Link>
                </div>
            </div>

            {/* Línea gris con texto - Ahora fuera del contenedor del video */}
            <div className="w-full flex justify-end items-center">
                <div className="w-full h-12 lg:h-40 mt-[-10vh] sm:mt-[-1vh] md:mt-[-5vh] lg:mt-[-10vh] flex items-center justify-center">
                    <div
                        className="absolute w-full h-[10vh]  lg:h-[20vh] md:h-[10vh] sm:h-[10vh] bg-gradient-to-t"
                        style={{
                            background:
                                "linear-gradient(to top, transparent 5%, black 20%, black 80%, transparent 95%)",
                        }}
                    ></div>
                    <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-400 to-white px-2 text-sm lg:text-6xl font-bold">
                        Invierte en bienes inmuebles en Madrid
                    </span>
                </div>
            </div>
        </AnimatedOnScroll>
    );
};

export default Video;
