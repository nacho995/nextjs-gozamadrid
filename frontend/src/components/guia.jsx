"use client";
import { useEffect, useState } from 'react';
import Link from 'next/link';
import Head from 'next/head';
import React from 'react';
import AnimatedOnScroll from './AnimatedScroll';

// Configuración SEO y Schema.org
const SCHEMA_DATA = {
  "@context": "https://schema.org",
  "@type": "Article",
  "headline": "Guía Completa para Vender tu Propiedad en España - Goza Madrid",
  "description": "Descubre los aspectos clave para vender tu propiedad en España. Guía profesional con consejos de expertos, proceso paso a paso y estrategias de venta efectivas.",
  "image": "/guia.jpg",
  "author": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "url": "https://gozamadrid.com"
  },
  "publisher": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "logo": {
      "@type": "ImageObject",
      "url": "/logo.png"
    }
  },
  "datePublished": new Date().toISOString(),
  "mainEntityOfPage": {
    "@type": "WebPage",
    "@id": "https://gozamadrid.com/guia-venta-propiedad"
  }
};

export default function Guide() {
    return (
        <>
            <Head>
                <title>Guía Definitiva para Vender tu Propiedad en España | Goza Madrid</title>
                <meta name="description" content="Descubre cómo vender tu propiedad en España de manera efectiva. Guía completa con consejos de expertos, proceso paso a paso y estrategias de venta." />
                <meta name="keywords" content="guía venta propiedades, vender casa España, proceso venta inmuebles, asesoramiento inmobiliario Madrid" />
                <meta property="og:title" content="Guía Definitiva para Vender tu Propiedad en España" />
                <meta property="og:description" content="Aprende a vender tu propiedad en España con nuestra guía completa. Consejos expertos y proceso detallado." />
                <meta property="og:image" content="/guia.jpg" />
                <meta property="og:type" content="article" />
                <link rel="canonical" href="https://gozamadrid.com/guia-venta-propiedad" />
                <script type="application/ld+json">
                    {JSON.stringify(SCHEMA_DATA)}
                </script>
            </Head>

            <AnimatedOnScroll>
                <div className="relative h-[60vh] overflow-hidden">
                    {/* Capa de fondo con parallax */}
                    <div
                        className="absolute inset-0 w-full h-full bg-center"
                        style={{
                            backgroundImage: "url('/guia.jpg')",
                            backgroundRepeat: "repeat",
                            backgroundAttachment: "fixed",
                            backgroundPosition: "center"
                        }}
                    />

                    {/* Capa de overlay más transparente */}
                    <div className="absolute inset-0 bg-gradient-to-r from-black/60 to-black/30 
                        dark:from-black/60 dark:to-black/30" />

                    {/* Contenedor del contenido centrado */}
                    <div className="relative h-full flex flex-col justify-center items-center text-center px-4 z-10">
                        <h2 
                            className="text-xl sm:text-xl lg:text-6xl font-bold text-amarillo dark:text-amarillo mb-8" 
                            style={{ textShadow: "2px 2px 5px rgba(128, 128, 128, 0.8)" }}
                        >
                            Guía para vender una propiedad
                        </h2>

                        <p className="text-sm sm:text-md lg:text-3xl text-white dark:text-white max-w-4xl mb-12">
                            Aquí te presentamos un resumen conciso de los aspectos clave que debes considerar al comprar una propiedad.
                            Al final, tendrás la oportunidad de descargar nuestra guía completa «Cómo Comprar una Vivienda en España»,
                            que te llevará paso a paso a través de todo el proceso. ¡Descúbrelo ahora!
                        </p>

                        <Link
                            href="/servicios/residentes-espana/guia-compra"
                            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full 
                                bg-white/20 dark:bg-white/20 px-8 py-3 
                                transition-all duration-300 
                                hover:bg-white/30 dark:hover:bg-white/30 
                                backdrop-blur-sm"
                        >
                            <span className="relative text-sm sm:text-base lg:text-lg font-semibold 
                                text-white dark:text-white"
                            >
                                Ver guía
                            </span>
                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                bg-gradient-to-r from-amarillo via-black to-amarillo 
                                dark:from-amarillo dark:via-black dark:to-amarillo 
                                transition-transform duration-300 
                                group-hover:translate-x-full"
                            ></span>
                        </Link>
                    </div>
                </div>
            </AnimatedOnScroll>
        </>
    );
}
