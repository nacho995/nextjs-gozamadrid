"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import AnimatedOnScroll from "../AnimatedScroll";

export default function ExpRealtyMore({ videoId, title }) {
    const iframeRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;

    const handlePlay = () => {
        setIsPlaying(true);
    };

    return (
        <>
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
                        <div className="relative flex items-center justify-start h-full w-full overflow-hidden">
                            <div className="bg-gradient-to-tr from-blue-900/70 via-black/50 to-blue-950/60 
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
                                group
                                hover:from-blue-800/70 hover:via-black/50 hover:to-blue-900/60
                                transition-all duration-500
                                before:content-['']
                                before:absolute
                                before:inset-0
                                before:border-2
                                before:border-blue-400/20
                                before:scale-95
                                before:opacity-0
                                before:group-hover:scale-100
                                before:group-hover:opacity-100
                                before:transition-all
                                before:duration-500
                                after:content-['']
                                after:absolute
                                after:inset-0
                                after:bg-gradient-to-b
                                after:from-transparent
                                after:via-blue-500/5
                                after:to-transparent
                                after:opacity-0
                                after:group-hover:opacity-100
                                after:transition-opacity
                                after:duration-500"
                            >
                                {/* Efectos de luz con posición diferente */}
                                <div className="absolute top-1/4 -right-20 w-40 h-40 bg-blue-400/20 rounded-full blur-[120px] group-hover:bg-blue-300/30 transition-all duration-500"></div>
                                <div className="absolute bottom-1/4 -left-20 w-40 h-40 bg-blue-500/20 rounded-full blur-[120px] group-hover:bg-blue-400/30 transition-all duration-500"></div>

                                <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                                    bg-clip-text text-transparent 
                                    bg-gradient-to-r from-white via-blue-100 to-white
                                    drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                                    group-hover:scale-105 
                                    transition-transform duration-500
                                    relative z-10"
                                >
                                    ¿Por qué elegir eXp Realty?
                                </h2>

                                <p className="flex flex-col justify-center items-center gap-6 text-blue-50/95
                                    style={{ fontSize: 'clamp(0.8rem, 2vw, 1.2rem)' }}
                                    leading-relaxed
                                    tracking-wide
                                    mt-8
                                    relative z-10
                                    group-hover:translate-y-[-3px]
                                    transition-all duration-500
                                    max-w-3xl"
                                >
                                    <span className="text-xl text-blue-200 font-semibold">
                                        Exposición internacional para cada propiedad
                                    </span>

                                    <span className="text-lg">
                                        Plataforma digital avanzada sin límites geográficos
                                    </span>

                                    <span className="text-blue-200 font-semibold text-lg">
                                        Red de más de 90.000 agentes que trabajan en equipo
                                    </span>

                                    <span className="text-lg">
                                        Enfoque estratégico para seleccionar las mejores propiedades y garantizar ventas exitosas
                                    </span>
                                </p>

                                {/* Decoración circular */}
                                <div className="absolute inset-0 border-4 border-blue-400/10 rounded-full scale-0 
                                    group-hover:scale-100 transition-transform duration-700 ease-out"
                                ></div>

                                {/* Línea decorativa con estilo diferente */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                                    w-16 h-1 bg-blue-400/20 rounded-full
                                    group-hover:w-32 transition-all duration-500"
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
                <div
                    className="z-20 relative hidden md:grid grid-cols-7 w-full overflow-hidden items-center"
                    style={{ backgroundImage: "url('/fondoblanco.jpg')" }}
                >
                    {/* Primer h2 en la columna 2 */}
                    <div className="col-start-1 col-end-4 flex items-center justify-end p-8">
                        <h2
                            className="text-center text-4xl font-bold text-black"
                            style={{ textShadow: "2px 2px 3px rgba(0, 0, 0,  0.5)" }}
                        >
                            Únete a nuestra comunidad de más de 85K mil agentes
                        </h2>
                    </div>

                    {/* GIF en la columna 3 */}
                    <div className="col-start-4 col-end-4 flex items-center justify-center mt-20">
                        <div
                            className="w-[15vw] h-[25vh] bg-cover min-w-[200px] min-h-[200px] bg-center"
                            style={{ backgroundImage: "url('/BlueCircle.gif')" }}
                        ></div>
                    </div>

                    {/* Segundo h2 en la columna 4 */}
                    <div className="col-start-5 col-end-8 flex items-center justify-start p-8">
                        <h2
                            className="text-center text-4xl font-bold text-black"
                            style={{ textShadow: "2px 2px 3px rgba(0, 0, 0,  0.5)" }}

                        >
                            Trabaja con lo último de nuestras tecnologías y nuestro modelo de negocio basado en la nube
                        </h2>
                    </div>



                    {/* Enlace: Ocupa toda la fila */}
                    <div className="col-span-7 flex justify-center py-18">
                        <Link
                            className="bg-black text-white rounded-xl p-5 text-3xl font-bold hover:bg-bluecolor hover:text-gray-300"
                            href="https://docs.google.com/presentation/d/e/2PACX-1vTiStw1c6obJyNIIDP1W03vm6xg_34FPlvYSaletdiIOhKvWK7aDHKdVvM8McZWxQ/pub?start=false&loop=false&delayms=3000&slide=id.p1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Presentación de eXp Realty
                        </Link>
                    </div>
                </div>

                {/* Versión Mobile/Tablet: Visible para pantallas menores a md */}
                <div 
                    className="z-20 relative md:hidden w-full py-8"
                    style={{ backgroundImage: "url('/fondoblanco.jpg')" }}
                >
                    <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Texto combinado en un solo párrafo */}
                        <p
                            className="text-center text-xl sm:text-2xl font-bold text-black italic px-4"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            Únete a nuestra comunidad de más de 85K mil agentes. Trabaja con lo último de nuestras tecnologías y nuestro modelo de negocio basado en la nube
                        </p>
                        {/* GIF centrado */}
                        <div
                            className="w-[40vw] h-[25vh] bg-cover min-w-[150px] bg-center"
                            style={{ backgroundImage: "url('/BlueCircle.gif')" }}
                        ></div>
                        {/* Enlace */}
                        <div className="flex justify-center py-8">
                            <Link
                                className="bg-white rounded-xl p-5 text-2xl font-bold hover:bg-black hover:text-white"
                                href="https://landing.expglobalspain.com/modelo-de-negocio-exp-spain"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                Presentación de eXp Realty
                            </Link>
                        </div>
                    </div>
                </div>

            </AnimatedOnScroll >
            <AnimatedOnScroll>
                <div className="mx-0 text-transparent bg-clip-text ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh] ">
                        <div className="relative flex items-center justify-start h-full w-full overflow-hidden">
                            <div className="bg-gradient-to-tr from-blue-950/80 via-black/60 to-blue-800/70
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
                        group
                        hover:from-blue-800/80 hover:via-black/60 hover:to-blue-950/70
                        transition-all duration-700
                        before:content-['']
                        before:absolute
                        before:inset-0
                        before:bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),transparent_60%)]
                        before:opacity-0
                        before:group-hover:opacity-100
                        before:transition-opacity
                        before:duration-700"
                            >
                                {/* Efectos de luz */}
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-400/5 via-transparent to-blue-400/5 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-700"></div>

                                {/* Círculos decorativos animados */}
                                <div className="absolute -right-20 top-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-[80px]
                            group-hover:bg-blue-400/20 group-hover:scale-150 transition-all duration-1000"></div>
                                <div className="absolute -left-20 bottom-1/3 w-40 h-40 rounded-full bg-blue-600/10 blur-[80px]
                            group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-1000"></div>

                                <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                            bg-clip-text text-transparent 
                            bg-gradient-to-r from-white via-blue-100 to-white
                            drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                            group-hover:scale-105 
                            transition-transform duration-500
                            relative z-10"
                                >
                                    Vende Sin Fronteras
                                </h2>

                                <div className="flex flex-col gap-6 max-w-3xl relative z-10">
                                    <p className="text-white/90 text-lg leading-relaxed tracking-wide
                                group-hover:translate-y-[-3px] transition-transform duration-500"
                                    >
                                        Si buscas vender tu propiedad con la máxima visibilidad y sin fronteras,
                                        o quieres formar parte de una inmobiliaria digital líder en el mundo,
                                        contáctanos y descubre cómo podemos ayudarte.
                                    </p>

                                    <p className="text-blue-200 font-semibold text-xl italic
                                group-hover:text-blue-100 transition-colors duration-500"
                                    >
                                        Únete a la nueva era del sector inmobiliario con eXp Realty.
                                    </p>
                                </div>

                                {/* Bordes animados */}
                                <div className="absolute inset-[2px] border border-blue-400/20 rounded-sm scale-[0.99] opacity-0
                            group-hover:scale-100 group-hover:opacity-100 transition-all duration-700"></div>

                                {/* Línea decorativa */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                            w-32 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent
                            group-hover:w-48 transition-all duration-700"></div>
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
                    className="relative w-full bg-cover bg-center pb-10 h-[80vh] md:h-[80vh]"
                    style={{ backgroundImage: "url('/agenteinmobiliario.jpg')" }}
                >
                    <div
                        className="absolute left-0 top-0 p-4 bg-black bg-opacity-50 border-2 border-white flex flex-row md:flex-col w-full md:w-1/3 h-auto md:h-[80vh]"
                    >
                        {/* Contenedor del título: en mobile ocupa la mitad, en md ocupa el 100% */}
                        <div className="flex border-2 border-white items-center mt-[5vh] justify-center w-1/2 md:w-full">
                            <h3
                                className="text-center font-bold text-white"
                                style={{
                                    textShadow: "2px 2px 3px rgba(65,105,225,0.7)",
                                    fontSize: "clamp(1.5rem, 3vw, 3rem)"
                                }}
                            >
                                Rompe Barreras. Crece de manera digital.
                            </h3>
                        </div>

                        <div className="flex flex-col items-center justify-center pt-[10vh] w-1/2 md:w-full">
                            <p
                                className="text-center font-bold text-white mb-4"
                                style={{
                                    textShadow: "2px 2px 3px rgba(65,105,225,0.7)",
                                    fontSize: "clamp(1rem, 2vw, 1.5rem)",
                                    margin: 0,
                                    padding: "0.5rem"
                                }}
                            >
                                Derriba barreras en una de las inmobiliarias digitales de mayor crecimiento del mundo y descubre nuevas maneras de facturar, aprender y hacer crecer tu negocio
                            </p>
                            <Link
                                className="mt-[5vh] bg-transparent border-2 border-white hover:bg-bluecolor inline-block rounded-xl font-bold"
                                href="https://join.expglobal.partners/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "white",
                                    fontSize: "clamp(1rem, 2vw, 1.5rem)",
                                    padding: "0.5rem 1rem"
                                }}
                            >
                                Conviértete en agente
                            </Link>
                        </div>
                        º                </div>
                </div>
            </AnimatedOnScroll>

        </>
    );
}
