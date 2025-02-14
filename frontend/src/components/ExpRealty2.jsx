"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import AnimatedOnScroll from "./AnimatedScroll";

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
                        <div
                            className="bg-gradient-to-tl dark:text-white from-blue-950/90 via-black/90 to-amarillo/90 p-6 sm:p-10 text-base sm:text-xl font-bold z-20 grid grid-cols-1 border border-black  gap-0"
                            style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                        >
                            <h2 className="text-4xl sm:text-6xl flex justify-center italic pt-10">
                                ¿Por qué elegir eXp Realty?
                            </h2>
                            <p
                                className="flex justify-center m-0"
                                style={{ fontSize: "clamp(0.8rem, 2vw, 1.2rem)" }}
                            >
                                Exposición internacional para cada propiedad.
                                Plataforma digital avanzada sin límites geográficos.
                                Red de más de 90.000 agentes que trabajan en equipo para maximizar las oportunidades de venta.
                                Enfoque estratégico para seleccionar las mejores propiedades y garantizar ventas exitosas.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
                <div
                    className="hidden md:grid grid-cols-7 w-full overflow-hidden items-center "
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
                            desde nuestra remuneración competitiva y nuestro modelo de negocio basado en la nube
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
                <div className="md:hidden w-full py-8"
                    style={{ backgroundImage: "url('/fondoblue.jpg')" }}>
                    <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Texto combinado en un solo párrafo */}
                        <p
                            className="text-center text-xl sm:text-2xl font-bold text-white italic px-4"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            Únete a nuestra comunidad de más de 85K mil agentes, eXp Realty: Desde nuestra remuneración competitiva y nuestro modelo de negocio basado en la nube
                        </p>
                        {/* GIF centrado */}
                        <div
                            className="w-[40vw] h-[25vh] bg-cover min-w-[150px] bg-center"
                            style={{ backgroundImage: "url('/circle-unscreen.gif')" }}
                        ></div>
                        {/* Enlace */}
                        <div className="flex justify-center py-8">
                            <Link
                                className="bg-white rounded-xl p-5 text-2xl font-bold hover:bg-black hover:text-white"
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh] ">
                        <div
                            className="bg-gradient-to-tr dark:text-white from-blue-950/90 via-black/90 to-amarillo/90 p-6 sm:p-10 text-base sm:text-xl font-bold z-20 grid grid-cols-1 border border-black  gap-0"
                            style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                        >
                            <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic">
                                Vende Sin Fronteras
                            </h2>
                            <p
                                className="flex justify-center m-0"
                                style={{ fontSize: "clamp(0.8rem, 2vw, 1.2rem)" }}
                            >
                                Si buscas vender tu propiedad con la máxima visibilidad y sin fronteras, o quieres formar parte de una inmobiliaria digital líder en el mundo, contáctanos y descubre cómo podemos ayudarte.Únete a la nueva era del sector inmobiliario con eXp Realty.
                            </p>
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
            <div className="object-cover w-full h-full bg-cover bg-center"
                style={{ backgroundImage: "url('/agenteinmobiliario.jpg')" }}>
                <div className="bg-gradient-to-t from-black/80 to-black/30">
                    <h3 className="text-4xl sm:text-6xl font-bold text-white text-center pt-10">
                    Derriba barreras en una de las inmobiliarias digitales de mayor crecimiento del mundo y descubre nuevas maneras de facturar, aprender y hacer crecer tu negocio
                    </h3>
                    <Link className="bg-white rounded-xl p-5 text-2xl font-bold hover:bg-black hover:text-white"
                        href="https://join.expglobal.partners/index.html">
                        Conviértete en agente
                    </Link>
                </div>
            </div>
        </>
    );
}
