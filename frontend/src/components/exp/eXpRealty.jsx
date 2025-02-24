"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import AnimatedOnScroll from "../AnimatedScroll";

export default function ExpRealty({ videoId, title }) {
    const iframeRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    const handlePlay = () => {
        setIsPlaying(true);
    };

    return (
        <>
            {/* Fondo absoluto con gradiente y opacidad */}
            <div
                className="fixed inset-0 z-0 opacity-10"
                style={{
                    background:
                        "repeating-linear-gradient(40deg, #000000, #000000 5vh, #ffffff 20vh, #C7A336 30vh)",
                    backgroundAttachment: "fixed",
                }}
            ></div>

            <AnimatedOnScroll>
                <div className="mx-0 text-transparent bg-clip-text">
                    <h2 className="italic text-6xl md:text-7xl lg:text-8xl font-bold 
                        bg-clip-text text-transparent 
                        bg-gradient-to-r from-black via-blue-900 to-blue-800
                        text-center p-18
                        hover:scale-105 
                        transition-all duration-500
                        drop-shadow-[0_2px_2px_rgba(0,0,0,0.3)]
                        relative
                        group
                        before:content-['']
                        before:absolute
                        before:inset-x-0
                        before:bottom-0
                        before:h-1
                        before:bg-gradient-to-r
                        before:from-transparent
                        before:via-blue-600/30
                        before:to-transparent
                        before:transform
                        before:scale-x-0
                        before:origin-center
                        before:transition-transform
                        before:duration-500
                        hover:before:scale-x-100
                        after:content-['']
                        after:absolute
                        after:-inset-1
                        after:bg-gradient-to-r
                        after:from-blue-900/0
                        after:via-blue-900/5
                        after:to-blue-900/0
                        after:blur-lg
                        after:opacity-0
                        after:transition-opacity
                        after:duration-500
                        hover:after:opacity-100
                        tracking-tight
                        leading-tight
                        max-w-7xl
                        mx-auto"
                    >
                        <span className="bg-clip-text text-transparent 
                            bg-gradient-to-r from-amarillo via-blue-900 to-amarillo
                            hover:from-blue-900 hover:via-black hover:to-blue-900
                            transition-all duration-500"
                        >
                            La Inmobiliaria Digital
                        </span>
                        <br />
                        <span className="bg-clip-text text-transparent 
                            bg-gradient-to-r from-blue-900 via-amarillo to-blue-900
                            hover:from-black hover:via-amarillo hover:to-black
                            transition-all duration-500"
                        >
                            Nº1 en el Mundo
                        </span>
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh]">
                        <div className="relative flex items-center justify-start h-full w-full overflow-hidden">
                            <div className="bg-gradient-to-tr from-blue-950/60 via-black/40 to-blue-800/50
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
                                <div className="absolute top-0 left-0 w-20 h-20 bg-blue-400/20 blur-[100px] group-hover:blur-[120px] transition-all duration-500"></div>
                                <div className="absolute bottom-0 right-0 w-20 h-20 bg-blue-400/20 blur-[100px] group-hover:blur-[120px] transition-all duration-500"></div>

                                <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                                    bg-clip-text text-transparent 
                                    bg-gradient-to-r from-white via-blue-100 to-white
                                    drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                                    group-hover:scale-105 
                                    transition-transform duration-500"
                                >
                                    Innovación inmobiliaria
                                </h2>

                                <p className="text-white/90 text-sm sm:text-base md:text-lg px-6 max-w-4xl
                                    leading-relaxed
                                    tracking-wide
                                    drop-shadow-[0_1px_1px_rgba(0,0,0,0.4)]
                                    transform
                                    group-hover:translate-y-[-5px]
                                    transition-transform duration-500"
                                >
                                    En eXp Realty transformamos la manera de vender propiedades a través de la innovación y la tecnología. 
                                    Somos la inmobiliaria digital más grande del mundo, operando en más de 25 países y conectando 
                                    compradores y vendedores a nivel global.
                                    <br /><br />
                                    <span className="font-semibold text-blue-200">100% Digital, 100% Global</span>
                                    <br />
                                    Todo nuestro sistema está en la nube, lo que nos permite ofrecer máxima visibilidad y 
                                    alcance internacional para cada propiedad.
                                </p>

                                {/* Línea decorativa */}
                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 w-1/3 h-[1px] 
                                    bg-gradient-to-r from-transparent via-blue-400/30 to-transparent
                                    group-hover:w-1/2 transition-all duration-500"
                                ></div>
                            </div>
                        </div>
                        <div className="relative w-full h-auto min-h-[35vh]">
                            <iframe
                                ref={iframeRef}
                                src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}`}
                                title={title}
                                className=" w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onClick={handlePlay}
                            />
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
                <div
                    className="hidden md:grid grid-cols-7 w-full overflow-hidden items-center relative z-10"
                    style={{ backgroundImage: "url('/fondoblue.jpg')" }}
                >
                    {/* Primer h2 en la columna 2 */}
                    <div className="col-start-1 col-end-4 flex items-center justify-end p-8">
                        <h2
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
                        ></div>
                    </div>

                    {/* Segundo h2 en la columna 4 */}
                    <div className="col-start-5 col-end-8 flex items-center justify-start p-8">
                        <h2
                            className="text-center text-4xl font-bold text-white italic"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            hablamos del modelo de negocio de eXp
                        </h2>
                    </div>



                    {/* Enlace: Ocupa toda la fila */}
                    <div className="col-span-7 flex justify-center py-8">
                        <Link
                            className="bg-white rounded-xl p-5 text-3xl font-bold hover:bg-black hover:text-white"
                            href="https://landing.expglobalspain.com/modelo-de-negocio-exp-spain"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Apúntate
                        </Link>
                    </div>
                </div>

                {/* Versión Mobile/Tablet: Visible para pantallas menores a md */}
                <div className="md:hidden w-full py-8"
                    style={{ backgroundImage: "url('/fondoblue.jpg')" }}>
                    <div className="flex flex-col items-center justify-center space-y-4 
                        relative overflow-hidden 
                        bg-gradient-to-tr from-blue-950/60 via-black/40 to-blue-900/50
                        backdrop-blur-lg
                        p-8 rounded-2xl
                        group
                        hover:from-blue-900/60 hover:via-black/40 hover:to-blue-800/50
                        transition-all duration-500"
                    >
                        <p className="text-center text-xl sm:text-2xl font-bold italic
                            bg-clip-text text-transparent 
                            bg-gradient-to-r from-white via-blue-100 to-white
                            drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                            group-hover:scale-105 
                            transition-all duration-500
                            px-4"
                        >
                            Todos los jueves a las 18:00 y hablamos del modelo de negocio de eXp.
                        </p>
                        
                        <div className="w-[40vw] h-[25vh] bg-cover min-w-[150px] bg-center
                            transform group-hover:scale-105 transition-transform duration-500"
                            style={{ backgroundImage: "url('/circle-unscreen.gif')" }}
                        ></div>
                        
                        <div className="flex justify-center py-8">
                            <Link
                                className="bg-gradient-to-r from-white to-blue-50
                                    hover:from-blue-100 hover:to-white
                                    rounded-xl p-5 text-2xl font-bold
                                    text-blue-900
                                    transform hover:-translate-y-1
                                    transition-all duration-300
                                    shadow-lg hover:shadow-xl"
                                href="https://landing.expglobalspain.com/modelo-de-negocio-exp-spain"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Apúntate
                            </Link>
                        </div>
                    </div>
                </div>

            </AnimatedOnScroll >
            <AnimatedOnScroll>
                <div className="mx-0 text-transparent bg-clip-text ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh]">
                        <div className="relative w-full h-auto min-h-[35vh]">
                            <iframe
                                ref={iframeRef}
                                src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}`}
                                title={title}
                                className=" w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onClick={handlePlay}
                            />
                        </div>
                        <div
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
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[100px] group-hover:bg-blue-400/30 transition-all duration-500"></div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/20 rounded-full blur-[100px] group-hover:bg-blue-500/30 transition-all duration-500"></div>

                            <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                                bg-clip-text text-transparent 
                                bg-gradient-to-br from-blue-100 via-white to-blue-200
                                drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]
                                group-hover:scale-105 
                                transition-transform duration-500
                                relative z-10"
                            >
                                Propiedades Sin Fronteras
                            </h2>

                            <p className="flex flex-col justify-center m-0 text-blue-50/95
                                style={{ fontSize: 'clamp(0.8rem, 2vw, 1.2rem)' }}
                                leading-relaxed
                                tracking-wide
                                mt-8
                                relative z-10
                                group-hover:translate-y-[-3px]
                                transition-all duration-500"
                            >
                                <span className="mb-6">
                                    Gracias a nuestra plataforma tecnológica, los inmuebles no solo se promocionan
                                    localmente, sino que traspasan fronteras, llegando a clientes en mercados clave
                                    como México, Estados Unidos, Portugal, Dubái y muchos más.
                                </span>

                                <span className="text-blue-200 font-semibold text-lg sm:text-xl mb-4">
                                    Más de 90.000 agentes en el mundo
                                </span>

                                <span>
                                    Nuestra red global de agentes inmobiliarios trabaja de forma colaborativa,
                                    utilizando herramientas avanzadas como el metaverso, donde podemos mostrar
                                    propiedades, reunirnos con clientes y cerrar operaciones de forma ágil y efectiva.
                                </span>
                            </p>

                            {/* Línea decorativa inferior */}
                            <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1/4 h-[2px]
                                bg-gradient-to-r from-transparent via-blue-300/40 to-transparent
                                group-hover:w-1/3 transition-all duration-500"
                            ></div>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            
        </>
    );
}
