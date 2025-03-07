"use client";
import React from 'react';
import Link from "next/link";
import { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/image";
import { motion } from 'framer-motion';
import Head from 'next/head';

// Schema.org para el video
const getVideoSchema = () => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": "Inversión Inmobiliaria en Madrid",
  "description": "Descubre las oportunidades de inversión inmobiliaria en Madrid con Goza Madrid. Video promocional mostrando propiedades exclusivas.",
  "thumbnailUrl": "https://www.gozamadrid.com/video-thumbnail.jpg",
  "uploadDate": "2024-01-01",
  "contentUrl": "https://www.gozamadrid.com/video.mp4",
  "publisher": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.gozamadrid.com/logo.png"
    }
  }
});

const Video = () => {
    const videoRef = useRef(null);
    const [videoSrc, setVideoSrc] = useState("/video.mp4");
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (videoElement) {
            videoElement.loop = true;
            videoElement.load();
            
            // Manejar la carga del video
            videoElement.addEventListener('loadeddata', () => {
                setIsVideoLoaded(true);
            });

            videoElement.play().catch(error => {
                console.log("Error al reproducir el video:", error);
            });

            // Limpieza
            return () => {
                videoElement.removeEventListener('loadeddata', () => {
                    setIsVideoLoaded(true);
                });
            };
        }
    }, [videoSrc]);

    const MotionLink = motion.a;

    return (
        <>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(getVideoSchema()) }}
                />
            </Head>

            <AnimatedOnScroll>
                <section 
                    className="relative"
                    aria-label="Sección de presentación con video"
                >
                    <div className="w-full h-[40vh] lg:h-[90vh] overflow-hidden relative">
                        {/* Fallback para cuando el video no está cargado */}
                        {!isVideoLoaded && (
                            <div 
                                className="absolute inset-0 bg-black/50 flex items-center justify-center"
                                aria-label="Cargando video"
                            >
                                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amarillo"></div>
                            </div>
                        )}
                        
                        <video
                            className="absolute top-0 left-0 w-full h-full object-cover lg:object-fill"
                            autoPlay
                            muted
                            playsInline
                            ref={videoRef}
                            aria-label="Video promocional de Goza Madrid"
                        >
                            <source src={videoSrc} type="video/mp4" />
                            <p>Tu navegador no soporta la reproducción de video. 
                               <a href={videoSrc} download>Descarga el video aquí</a>
                            </p>
                        </video>

                        <div className="absolute top-[25%] lg:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 w-full flex justify-center items-center">
                            <MotionLink
                                href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
                                    px-4 sm:px-6 lg:px-8 
                                    py-2 sm:py-2.5 lg:py-3 
                                    transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
                                    max-w-[90%] sm:max-w-[80%] lg:max-w-none"
                                initial={{ scale: 1 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                aria-label="Valora el precio de tu propiedad - Abre en una nueva ventana"
                            >
                                <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                                    Valora el precio de tu propiedad
                                </span>
                                <span 
                                    className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"
                                    aria-hidden="true"
                                ></span>
                            </MotionLink>
                        </div>
                    </div>

                    <div 
                        className="w-full flex justify-end items-center"
                        role="complementary"
                        aria-label="Mensaje destacado"
                    >
                        <div className="w-full h-12 lg:h-40 mt-[-10vh] sm:mt-[-1vh] md:mt-[-5vh] lg:mt-[-10vh] flex items-center justify-center">
                            <div
                                className="absolute w-full h-[10vh] lg:h-[20vh] md:h-[10vh] sm:h-[10vh] bg-gradient-to-t"
                                style={{
                                    background: "linear-gradient(to top, transparent 5%, black 20%, black 80%, transparent 95%)",
                                }}
                                aria-hidden="true"
                            ></div>
                            <h1 className="relative text-transparent bg-clip-text bg-gradient-to-r 
                                from-white via-amarillo to-white 
                                dark:from-white dark:via-amarillo dark:to-white 
                                px-2 text-sm lg:text-6xl font-bold"
                            >
                                Invierte en bienes inmuebles en Madrid
                            </h1>
                        </div>
                    </div>
                </section>
            </AnimatedOnScroll>
        </>
    );
};

export default Video;
