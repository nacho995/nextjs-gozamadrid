"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import React from 'react';
import AnimatedOnScroll from './AnimatedScroll';

export default function Guide() {
   

    return (
        <AnimatedOnScroll>
            <div className="relative h-[60vh] overflow-hidden">
                {/* Capa de fondo con parallax */}
                <div
                    className="absolute inset-0 w-full h-full bg-center bg-fixed"
                    style={{
                        backgroundImage: "url('/guia.jpg')",
                    }}
                />

                {/* Capa de overlay más transparente */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30" />

                {/* Contenedor del contenido centrado */}
                <div className="relative h-full flex flex-col justify-center items-center text-center px-4 z-10">
                    
                    <h2 
                        className="text-xl sm:text-xl lg:text-6xl font-bold text-amarillo mb-8" 
                        style={{ textShadow: "2px 2px 5px gray" }}
                    >
                        Guía para vender una propiedad
                    </h2>

                    <p className="text-sm sm:text-md lg:text-3xl text-white max-w-4xl mb-12">
                        Aquí te presentamos un resumen conciso de los aspectos clave que debes considerar al comprar una propiedad.
                        Al final, tendrás la oportunidad de descargar nuestra guía completa «Cómo Comprar una Vivienda en España»,
                        que te llevará paso a paso a través de todo el proceso. ¡Descúbrelo ahora!
                    </p>

                    <Link
                        href="/servicios/residentes-espana/guia-compra"
                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full 
                            bg-white/20 px-8 py-3 
                            transition-all duration-300 
                            hover:bg-white/30 
                            backdrop-blur-sm"
                    >
                        <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white">
                            Ver guía
                        </span>
                        <span className="absolute bottom-0 left-0 h-1 w-full transform 
                            bg-gradient-to-r from-amarillo via-black to-amarillo 
                            transition-transform duration-300 
                            group-hover:translate-x-full"
                        >Ver guía</span>
                    </Link>
                </div>
            </div>
        </AnimatedOnScroll>
    );
};
