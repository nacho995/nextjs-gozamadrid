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
                    <h2 className="italic text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black via-blue-900 to-blue-800 text-center p-18">La Inmobiliaria Digital Nº1 en el Mundo</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh]">
                        <div
                            className="bg-gradient-to-tr dark:text-white backdrop-blur-md from-blue-950/90 to-black p-6 sm:p-10 text-base sm:text-xl font-bold z-20 grid grid-cols-1 border border-black  gap-0"
                            style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                        >
                            <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic">
                                Innovación inmobiliaria
                            </h2>
                            <p
                                className="flex justify-center m-0"
                                style={{ fontSize: "clamp(0.8rem, 2vw, 1.2rem)" }}
                            >
                                En eXp Realty transformamos la manera de vender propiedades a través de la innovación y la tecnología. Somos la inmobiliaria digital más grande del mundo, operando en más de 25 países y conectando compradores y vendedores a nivel global.

                                100% Digital, 100% Global
                                Todo nuestro sistema está en la nube, lo que nos permite ofrecer máxima visibilidad y alcance internacional para cada propiedad.
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
            <AnimatedOnScroll>
                <div
                    className="hidden md:grid grid-cols-7 w-full overflow-hidden items-center"
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
                    <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Texto combinado en un solo párrafo */}
                        <p
                            className="text-center text-xl sm:text-2xl font-bold text-white italic px-4"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            Todos los jueves a las 18:00 y hablamos del modelo de negocio de eXp.
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
                            className="bg-gradient-to-tl dark:text-white from-blue-950/90 to-black p-6 sm:p-10 text-base sm:text-xl font-bold z-20 grid grid-cols-1 border border-black  gap-0"
                            style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                        >
                            <h2 className="text-4xl sm:text-6xl flex justify-center italic pt-10">
                                Propiedades Sin Fronteras
                            </h2>
                            <p
                                className="flex justify-center m-0"
                                style={{ fontSize: "clamp(0.8rem, 2vw, 1.2rem)" }}
                            >
                                Gracias a nuestra plataforma tecnológica, los inmuebles no solo se promocionan
                                localmente, sino que traspasan fronteras, llegando a clientes en mercados clave
                                como México, Estados Unidos, Portugal, Dubái y muchos más.
                                <br />
                                Más de 90.000 agentes en el mundo
                                <br />
                                Nuestra red global de agentes inmobiliarios trabaja de forma colaborativa,
                                utilizando herramientas avanzadas como el metaverso, donde podemos mostrar
                                propiedades, reunirnos con clientes y cerrar operaciones de forma ágil y efectiva.
                            </p>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            
        </>
    );
}
