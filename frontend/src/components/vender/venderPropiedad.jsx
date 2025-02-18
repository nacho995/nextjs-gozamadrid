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
                className="relative w-full h-[40vh] sm:h-[80vh] bg-cover bg-center"
                style={{ backgroundImage: "url('/casaVender.jpg')" }}
            >             
                {/* Contenedor principal centrado */}
                <div className="relative flex items-center justify-end h-full px-4 mr-[5%]">
                    {/* Card de contenido */}
                    <div className="bg-white/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6">
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
                                className="block w-full sm:w-3/4 md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-4 py-2 text-sm font-bold hover:bg-black hover:text-white transition-colors"
                            >
                                Valora el precio de tu propiedad
                            </a>
                        </div>
                    </div>
                </div>
            </div>
            </AnimatedOnScroll>
        </>
    );
}
