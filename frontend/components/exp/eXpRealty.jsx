"use client";

import React, { useRef, useState } from "react";
import Link from "next/link";
import Image from "next/legacy/image";
import AnimatedOnScroll from "../AnimatedScroll";
import Head from "next/head";
import { getCleanJsonLd } from "@/utils/structuredDataHelper";
import { organizationData, videoData } from "@/data/expRealtyStructuredData";

export default function ExpRealty({ videoId, title }) {
    const iframeRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    const handlePlay = () => {
        setIsPlaying(true);
    };

    // Preparar datos estructurados limpios
    const customizedVideoData = {
        ...videoData,
        embedUrl: `https://www.youtube.com/embed/${videoId}`,
        contentUrl: `https://www.youtube.com/watch?v=${videoId}`,
        thumbnailUrl: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
    };
    
    // Convertir a JSON-LD limpio
    const cleanOrgData = getCleanJsonLd(organizationData);
    const cleanVideoData = getCleanJsonLd(customizedVideoData);

    return (
        <section className="exp-realty-section" aria-label="eXp Realty - Inmobiliaria Digital Internacional">
            {/* Datos estructurados - Usando JSON-LD directo sin entidades HTML */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: cleanOrgData }}
            />
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: cleanVideoData }}
            />
            
            {/* Fondo absoluto con gradiente y opacidad */}
            <div
                className="fixed inset-0 -z-10 opacity-100"
                style={{
                    backgroundImage: "url('/exp.jpg')",
                    backgroundAttachment: "fixed",
                }}
                aria-hidden="true"
                role="presentation"
            ></div>

            <AnimatedOnScroll>
                <header className="mx-0 text-transparent bg-clip-text">
                   
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh]">
                        <article className="relative flex items-center justify-start h-full w-full overflow-hidden">
                            <div className="pb-10 bg-gradient-to-tr from-blue-950/60 via-black/40 to-blue-800/50
                                dark:from-blue-950/60 dark:via-black/40 dark:to-blue-800/50
                                backdrop-blur-lg
                                w-full 
                                h-full
                                min-h-[60vh]
                                text-center 
                                flex flex-col 
                                gap-8
                                justify-center
                                items-center
                                px-8 sm:px-12 lg:px-20
                                relative
                                before:content-['']
                                before:absolute
                                before:inset-0
                                before:border-t-2
                                before:border-b-2
                                before:border-blue-400/20
                                before:scale-x-0
                                before:animate-[border-width_1s_ease-in-out_forwards]
                                after:content-['']
                                after:absolute
                                after:inset-0
                                after:border-l-2
                                after:border-r-2
                                after:border-blue-400/20
                                after:scale-y-0
                                after:animate-[border-height_1s_ease-in-out_forwards]
                                group
                                hover:bg-gradient-to-tr
                                hover:from-blue-900/60
                                hover:via-black/40
                                hover:to-blue-800/50
                                transition-all
                                duration-500"
                            >
                                {/* Efecto de brillo en las esquinas */}
                                <div className="absolute top-0 left-0 w-20 h-20 
                                    bg-blue-400/20 dark:bg-blue-400/20 
                                    blur-[100px] 
                                    group-hover:blur-[120px] 
                                    transition-all duration-500"
                                    aria-hidden="true"
                                >
                                </div>
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-400/20 blur-[100px] group-hover:blur-[120px] transition-all duration-500" aria-hidden="true"></div>

                                <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                                    text-white dark:text-white
                                    drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                                    group-hover:scale-105 
                                    transition-transform duration-500"
                                >
                                    Innovación inmobiliaria digital
                                </h2>

                                <p className="text-white/90 dark:text-white/90 
                                    text-sm sm:text-base md:text-lg px-6 max-w-4xl
                                    leading-relaxed
                                    tracking-wide
                                    drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]"
                                >
                                    En eXp Realty transformamos el mercado inmobiliario a través de la innovación tecnológica y el marketing digital. 
                                    Somos la agencia inmobiliaria digital más grande del mundo, con presencia en más de 25 países, conectando 
                                    compradores y vendedores de propiedades a nivel global mediante plataformas virtuales avanzadas.
                                    <br /><br />
                                    <span className="font-semibold text-blue-200 dark:text-blue-200">
                                        100% Digital, 100% Global, 100% Efectivo
                                    </span>
                                    <br />
                                    Nuestro sistema inmobiliario opera completamente en la nube, permitiéndonos ofrecer máxima visibilidad internacional 
                                    y alcance global para cada propiedad, apartamento, casa o inversión inmobiliaria que gestionamos.
                                </p>

                                {/* Línea decorativa */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 h-[1px] 
                                    bg-gradient-to-r from-transparent via-blue-400/30 to-transparent
                                    group-hover:w-1/2 transition-all duration-500"
                                    aria-hidden="true"
                                ></div>
                            </div>
                        </article>
                        <div className="relative w-full h-auto min-h-[35vh]">
                            <video
                                className="w-full h-full object-cover absolute inset-0"
                                controls
                                preload="auto"
                                playsInline
                                aria-label="Video promocional de eXp Realty - La inmobiliaria digital líder mundial"
                                title="eXp Realty - Inmobiliaria Digital Internacional"
                            >
                                <source src="/videoExpIngles.mp4" type="video/mp4" />
                                Tu navegador no soporta la reproducción de videos. Visita nuestra página de YouTube para ver nuestro contenido inmobiliario.
                            </video>
                        </div>
                    </div>
                </header>
            </AnimatedOnScroll>
            
            <AnimatedOnScroll>
                <section 
                    className="hidden md:grid grid-cols-7 w-full overflow-hidden items-center relative z-10"
                    style={{ backgroundImage: "url('/fondoblue.jpg')" }}
                    aria-labelledby="webinar-section-title"
                >
                    {/* Primer h2 en la columna 2 */}
                    <div className="col-start-1 col-end-4 flex items-center justify-end p-8">
                        <h2
                            id="webinar-section-title"
                            className="text-center text-4xl font-bold text-white italic"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            Todos los jueves a las 18:00
                        </h2>
                    </div>

                    {/* GIF en la columna 3 */}
                    <div className="col-start-4 col-end-4 flex items-center justify-center">
                        <div
                            className="w-[15vw] h-[25vh] bg-cover min-w-[200px] bg-center"
                            style={{ backgroundImage: "url('/circle-unscreen.gif')" }}
                            aria-hidden="true"
                            role="presentation"
                        ></div>
                    </div>

                    {/* Segundo h2 en la columna 4 */}
                    <div className="col-start-5 col-end-8 flex items-center justify-start p-8">
                        <h3
                            className="text-center text-4xl font-bold text-white italic"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            Webinars sobre el modelo de negocio inmobiliario de eXp
                        </h3>
                    </div>

                    {/* Enlace: Ocupa toda la fila */}
                    <div className="col-span-7 flex justify-center py-8">
                        <Link
                            className="group/link relative inline-flex items-center gap-2 overflow-hidden 
                                rounded-full bg-white/20 px-8 py-3 
                                transition-all duration-300 
                                hover:bg-white/30 
                                backdrop-blur-sm"
                            href="https://landing.expglobalspain.com/modelo-de-negocio-exp-spain"
                            target="_blank"
                            rel="noopener noreferrer"
                            aria-label="Apúntate a nuestro webinar sobre el modelo de negocio inmobiliario de eXp Realty"
                        >
                            <span className="relative text-lg font-semibold text-white">
                                Apúntate al webinar inmobiliario
                            </span>
                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                transition-transform duration-300 
                                group-hover/link:translate-x-full"
                                aria-hidden="true"
                            >
                            </span>
                        </Link>
                    </div>
                </section>

                {/* Versión Mobile/Tablet: Visible para pantallas menores a md */}
                <section 
                    className="md:hidden w-full py-8"
                    style={{ backgroundImage: "url('/fondoblue.jpg')" }}
                    aria-labelledby="mobile-webinar-title"
                >
                    <div className="flex flex-col items-center justify-center space-y-4 
                        relative overflow-hidden 
                        bg-gradient-to-tr from-blue-950/60 via-black/40 to-blue-900/50
                        backdrop-blur-lg
                        p-8 rounded-2xl
                        group
                        hover:from-blue-900/60 hover:via-black/40 hover:to-blue-800/50
                        transition-all duration-500"
                    >
                        <h2 
                            id="mobile-webinar-title"
                            className="text-center text-xl sm:text-2xl font-bold italic
                                bg-clip-text text-transparent 
                                bg-gradient-to-r from-white via-blue-100 to-white
                                drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                                group-hover:scale-105 
                                transition-all duration-500
                                px-4"
                        >
                            Webinars inmobiliarios todos los jueves a las 18:00 - Descubre el modelo de negocio de eXp Realty
                        </h2>
                        
                        <div className="w-[40vw] h-[25vh] bg-cover min-w-[150px] bg-center
                            transform group-hover:scale-105 transition-transform duration-500"
                            style={{ backgroundImage: "url('/circle-unscreen.gif')" }}
                            aria-hidden="true"
                            role="presentation"
                        ></div>
                        
                        <div className="flex justify-center py-8">
                            <Link
                                className="group/link relative inline-flex items-center gap-2 overflow-hidden 
                                    rounded-full bg-white/20 px-8 py-3 
                                    transition-all duration-300 
                                    hover:bg-white/30 
                                    backdrop-blur-sm"
                                href="https://landing.expglobalspain.com/modelo-de-negocio-exp-spain"
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label="Apúntate a nuestro webinar sobre el modelo de negocio inmobiliario de eXp Realty"
                            >
                                <span className="relative text-lg font-semibold text-white">
                                    Apúntate al webinar inmobiliario
                                </span>
                                <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                    bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                    transition-transform duration-300 
                                    group-hover/link:translate-x-full"
                                    aria-hidden="true"
                                >
                                </span>
                            </Link>
                        </div>
                    </div>
                </section>
            </AnimatedOnScroll>
            
            <AnimatedOnScroll>
                <section className="mx-0 text-transparent bg-clip-text" aria-labelledby="propiedades-sin-fronteras">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh]">
                        <div className="relative w-full h-auto min-h-[35vh]">
                            <iframe
                                ref={iframeRef}
                                src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}`}
                                title={title || "eXp Realty - Venta de propiedades internacionales y marketing inmobiliario global"}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onClick={handlePlay}
                                aria-label="Video sobre el alcance internacional de eXp Realty en el mercado inmobiliario global"
                            />
                        </div>
                        <article
                            className="bg-gradient-to-bl from-blue-950/70 via-black/60 to-blue-900/40 
                                backdrop-blur-lg 
                                text-white 
                                p-8 sm:p-12 
                                text-base sm:text-xl 
                                font-bold 
                                z-20 
                                grid grid-cols-1 
                                relative
                                overflow-hidden
                                group
                                hover:from-blue-900/70 hover:via-black/60 hover:to-blue-950/40
                                transition-all duration-500
                                before:content-['']
                                before:absolute
                                before:inset-0
                                before:border-r-2
                                before:border-l-2
                                before:border-blue-300/20
                                before:scale-y-0
                                before:animate-[border-height_1s_ease-in-out_forwards]
                                after:content-['']
                                after:absolute
                                after:inset-0
                                after:border-t-2
                                after:border-b-2
                                after:border-blue-300/20
                                after:scale-x-0
                                after:animate-[border-width_1s_ease-in-out_forwards]"
                        >
                            {/* Efectos de luz */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-400/30 transition-all duration-500" aria-hidden="true"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-all duration-500" aria-hidden="true"></div>

                            <h2 
                                id="propiedades-sin-fronteras"
                                className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                                bg-clip-text text-transparent 
                                bg-gradient-to-br from-blue-100 via-white to-blue-200
                                drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]
                                group-hover:scale-105 
                                transition-transform duration-500
                                relative z-10"
                            >
                                Propiedades Sin Fronteras
                            </h2>

                            <div className="flex flex-col justify-center m-0 text-blue-50/95
                                style={{ fontSize: 'clamp(0.8rem, 2vw, 1.2rem)' }}
                                leading-relaxed
                                tracking-wide
                                mt-8
                                relative z-10
                                group-hover:translate-y-[-3px]
                                transition-all duration-500"
                            >
                                <p className="mb-6">
                                    Gracias a nuestra plataforma tecnológica inmobiliaria, sus propiedades, casas y apartamentos no solo se promocionan
                                    localmente, sino que traspasan fronteras internacionales, llegando a compradores potenciales en mercados clave
                                    como México, Estados Unidos, Portugal, Dubái y más de 20 países donde operamos con agentes inmobiliarios especializados.
                                </p>

                                <p className="text-blue-200 font-semibold text-lg sm:text-xl mb-4">
                                    Red global de más de 90.000 agentes inmobiliarios especializados
                                </p>

                                <p>
                                    Nuestra red internacional de agentes inmobiliarios trabaja de forma colaborativa,
                                    utilizando herramientas digitales avanzadas como el metaverso inmobiliario, donde podemos mostrar
                                    propiedades virtuales, realizar visitas inmobiliarias online, reunirnos con clientes y cerrar operaciones de compraventa 
                                    de forma ágil, segura y efectiva desde cualquier parte del mundo.
                                </p>
                            </div>

                            {/* Línea decorativa inferior */}
                            <div 
                                className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1/4 h-[2px]
                                bg-gradient-to-r from-transparent via-blue-300/40 to-transparent
                                group-hover:w-1/3 transition-all duration-500"
                                aria-hidden="true"
                            ></div>
                        </article>
                    </div>
                </section>
            </AnimatedOnScroll>
        </section>
    );
}
