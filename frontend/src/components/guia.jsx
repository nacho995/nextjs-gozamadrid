import Link from 'next/link';
import React from 'react';
import AnimatedOnScroll from './AnimatedScroll';

export default function Guide() {
    return (
        <AnimatedOnScroll>
        <div className="relative w-full h-screen ">

            <div className="h-[60vh] flex flex-col bg-fixed bg-center fixed justify-center items-center text-center  px-4 z-10" 
                style={{ backgroundImage: "url('/guia.jpg')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30"></div>

                <h2 className="text-xl sm:text-xl lg:text-6xl font-bold text-amarillo mb-4 relative z-10 mt-[-8%]" style={{ textShadow: "2px 2px 5px gray" }}>
                    Guía para vender una propiedad
                </h2>

                <p className="text-sm sm:text-md lg:text-3xl text-white  text-center z-10 mt-[3%] ml-[10%] mr-[10%] px-4">
                    Aquí te presentamos un resumen conciso de los aspectos clave que debes considerar al comprar una propiedad. 
                    Al final, tendrás la oportunidad de descargar nuestra guía completa «Cómo Comprar una Vivienda en España», 
                    que te llevará paso a paso a través de todo el proceso. ¡Descúbrelo ahora!
                </p>
            </div>

            <div className="absolute flex items-end top-2/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 w-full px-4">
                <Link
                    href="/guia"
                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-white/20 
                        px-6 sm:px-8 lg:px-10 
                        py-2 sm:py-2.5 lg:py-3 
                        transition-all duration-300 hover:bg-white/30 backdrop-blur-sm
                        w-[200px] sm:w-[250px] md:w-[20vw] lg:w-[15vw]
                        mx-auto
                        justify-center"
                >
                    <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                        Ver guía
                    </span>
                    <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                </Link>
            </div>
        </div>
        </AnimatedOnScroll>
    );
};
