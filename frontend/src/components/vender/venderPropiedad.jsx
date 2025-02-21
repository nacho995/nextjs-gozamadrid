import React from 'react';
import Link from 'next/link';
import AnimatedOnScroll from '../AnimatedScroll';

export default function VenderPropiedad() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-10"
                style={{
                    background: `repeating-linear-gradient(40deg, #000000, #000000 5vh, #ffffff 20vh, #C7A336 30vh)`,
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
            <div
                className="relative w-full h-[40vh] sm:h-[80vh] bg-cover bg-center border-y-amarillo/20 border-y-8"
                style={{ backgroundImage: "url('/casaVender.jpg')" }}
            >             
                {/* Contenedor principal centrado */}
                <div className="relative flex items-center justify-end h-full px-4 bg-gradient-to-l from-white/30 to-transparent">
                    {/* Card de contenido */}
                    <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6 mr-[5%]">
                        <h3 className="text-white font-bold text-2xl sm:text-4xl md:text-5xl"
                        style={{ textShadow: "4px 4px 5px black"}}>
                            Vende tu propiedad
                        </h3>
                        <p className="text-white text-sm sm:text-base md:text-lg"
                        style={{ textShadow: "4px 4px 5px black"}}>
                            Vender tu casa puede parecer complicado, pero nuestros expertos te acompañan en cada etapa, haciendo el proceso sencillo y sin estrés.
                        </p>
                        {/* Botón con ancho responsive */}
                        <div>
                            <a
                                href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="block w-full text-sm sm:w-3/4 md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-4 py-2  font-bold hover:bg-black hover:text-white transition-colors"
                            >
                                Valora el precio de tu propiedad
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
            <div
                className="relative w-full mt-0 h-[40vh] sm:h-[80vh] border-y-white/50 border-y-8 bg-center"
                style={{ 
                    backgroundImage: "url('/casaVender2.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                    
                }}
            >             
                {/* Contenedor principal alineado a la izquierda */}
                <div className="relative flex items-center justify-start h-full px-4  bg-gradient-to-r from-white/20 to-transparent w-full">
                    {/* Card de contenido */}
                    <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6 ml-[5%]">
                        <h3 className="text-white font-bold text-2xl sm:text-4xl md:text-5xl"
                        style={{ textShadow: "4px 4px 5px black"}}>
                            Encuentra tu hogar ideal
                        </h3>
                        <p className="text-white text-sm sm:text-base md:text-lg"
                        style={{ textShadow: "4px 4px 5px black"}}>
                            Descubre las mejores propiedades disponibles en el mercado. Nuestro equipo te ayudará a encontrar la casa perfecta para ti.
                        </p>
                        {/* Botón con ancho responsive */}
                        <div>
                            <Link
                                href="/vender/comprar"
                                className="block w-full text-sm sm:w-3/4 md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
                            >
                                Ver propiedades disponibles
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
            <div
                className="relative w-full mt-0 h-[40vh] sm:h-[80vh] bg-center border-y-amarillo/20 border-y-8"
                style={{ 
                    backgroundImage: "url('/casaVender3.jpg')",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    backgroundRepeat: "no-repeat",
                }}
            >             
                <div className="relative flex items-center justify-start h-full px-4 ml-[5%] bg-gradient-to-l from-white/50 to-transparent">
                    <div className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6 ml-auto mr-[5%]">
                        <h3 className="text-white font-bold text-2xl sm:text-4xl md:text-5xl"
                        style={{ textShadow: "4px 4px 5px black"}}>
                            Te acompañamos en cada paso
                        </h3>
                        <p className="text-white text-sm sm:text-base md:text-lg"
                        style={{ textShadow: "4px 4px 5px black"}}>
                            Nuestro equipo de expertos te guiará durante todo el proceso de venta, desde la valoración inicial hasta el cierre de la operación, garantizando una experiencia sin complicaciones.
                        </p>
                    </div>
                </div>
            </div>
            </AnimatedOnScroll>
        </>
    );
}
