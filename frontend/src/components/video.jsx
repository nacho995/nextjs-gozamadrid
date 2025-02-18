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
            <div className="w-full md:mt-[-15vh] md:h-[90vh] h-[40vh] lg:mt-[0.5vh] overflow-hidden relative">
                {/* Video */}
                <video
                    className="absolute md:top-[-10%] left-0 w-[110vw] md:h-full lg:object-cover"
                    autoPlay
                    muted
                    playsInline
                    ref={videoRef}
                >
                    <source src={videoSrc} type="video/mp4" />
                    Tu navegador no soporta el elemento de video.
                </video>

                {/* Línea gris con texto */}
                <div
                    className="w-full flex justify-center items-center z-10 relative mt-[35%] lg:mt-[35%] lg:mb-[3.5vh] md:mb-[20vh] md:absolute md:bottom-0 md:left-0"
                >
                    <div className="relative w-full md:h-40 h-12 flex items-center justify-center">
                        <div
                            className="absolute w-full h-full bg-gradient-to-t"
                            style={{
                                background:
                                    "linear-gradient(to top, transparent 5%, black 20%, black 80%, transparent 95%)",
                            }}
                        ></div>
                        <span className="relative text-transparent bg-clip-text bg-gradient-to-r from-white via-yellow-400 to-white px-2 md:text-6xl text-sm font-bold">
                            Invierte en bienes inmuebles en Madrid
                        </span>
                    </div>
                </div>


                {/* Botón centrado dentro del video:
            - En móviles/tablets (default): top-1/4 (25% desde arriba)
            - En PC (a partir de md): top-1/2 (centrado verticalmente) */}
                <div className="p-3 bg-white/40 rounded-full absolute top-[10vh] md:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
                    <Link
                        className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-amarillo text-black gap-2 hover:bg-black hover:text-white text-sm sm:text-lg h-10 sm:h-12 px-4 sm:px-5 font-bold"
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
