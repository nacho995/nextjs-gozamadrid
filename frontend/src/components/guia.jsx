import Link from 'next/link';
import React from 'react';

export default function Guide() {
    return (
        <div className="relative w-full h-screen overflow-hidden">

            <div className="h-[60vh] flex flex-col bg-fixed bg-center  justify-center items-center text-center relative px-4 z-10" 
                style={{ backgroundImage: "url('/guia.jpg')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/30"></div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amarillo mb-4 relative z-10 mt-[-8%]" style={{ textShadow: "2px 2px 5px gray" }}>
                    Guía para vender una propiedad
                </h2>

                <p className="max-w-3xl text-white sm:text-2xl text-center z-10 mt-[3%] ml-[10%] mr-[10%] px-4">
                    Aquí te presentamos un resumen conciso de los aspectos clave que debes considerar al comprar una propiedad. 
                    Al final, tendrás la oportunidad de descargar nuestra guía completa «Cómo Comprar una Vivienda en España», 
                    que te llevará paso a paso a través de todo el proceso. ¡Descúbrelo ahora!
                </p>
            </div>

            <div className="p-3 bg-white/40 rounded-full absolute flex items-end top-2/4 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20">
                <Link
                    className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-amarillo text-black gap-2 hover:bg-black hover:text-white text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-bold"
                    href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Ver guía
                </Link>
            </div>
        </div>
    );
};
