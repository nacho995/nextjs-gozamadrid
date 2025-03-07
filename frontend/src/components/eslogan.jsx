"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import Head from "next/head";
import FadeInView from './animations/FadeInView';
import ScaleInView from './animations/ScaleInView';
import { FaHome, FaExchangeAlt, FaCity, FaMoneyBillWave, FaQuoteLeft, FaArrowRight } from "react-icons/fa";

// Constantes y configuración
const SCHEMA_DATA = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Goza Madrid Inmobiliaria",
    "description": "Servicios inmobiliarios personalizados para compra, venta y alquiler de propiedades en Madrid",
    "image": "/gzmdinero.png",
    "areaServed": {
        "@type": "City",
        "name": "Madrid"
    },
    "priceRange": "€€€",
    "serviceType": [
        "Venta de propiedades",
        "Compra de propiedades",
        "Alquiler de propiedades",
        "Asesoramiento inmobiliario"
    ]
};

const MOTIVOS_VENTA = [
    {
        icon: <FaHome className="text-xs" />,
        text: "Un divorcio o un cambio de ciudad"
    },
    {
        icon: <FaCity className="text-xs" />,
        text: "Una casa demasiado grande que ya no se ajusta a tu estilo de vida"
    },
    {
        icon: <FaMoneyBillWave className="text-xs" />,
        text: "Necesidad de liquidez urgente"
    }
];

const Eslogan = () => {
    // Estilos reutilizables
    const styles = {
        mainGradient: {
            background: "linear-gradient(135deg, rgba(213,171,111,0.97) 0%, rgba(199,163,54,0.95) 100%)",
            borderBottom: '3px solid rgba(0,0,0,0.15)',
            borderRight: '3px solid rgba(0,0,0,0.15)',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)'
        },
        imageOverlay: {
            boxShadow: 'inset 0 -20px 60px -12px rgba(0, 0, 0, 0.25)'
        },
        buttonShadow: {
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
        }
    };

    // Componente de Motivo de Venta
    const MotivoVenta = ({ icon, text }) => (
        <li className="flex items-start">
            <span className="bg-black/20 rounded-full p-1 mr-3 mt-1 flex-shrink-0" aria-hidden="true">
                {icon}
            </span>
            <span>{text}</span>
        </li>
    );

    // Componente de Botón de Contacto
    const ContactButton = () => (
        <Link
            href="/contacto"
            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full 
                bg-gradient-to-r from-black/90 to-black/80 dark:from-white/90 dark:to-white/80
                px-8 sm:px-10 lg:px-12
                py-4 sm:py-4.5 lg:py-5
                transition-all duration-300 
                hover:shadow-lg hover:shadow-black/10
                backdrop-blur-sm
                transform hover:translate-y-[-2px]"
            aria-label="Contactar con nuestro equipo inmobiliario"
            style={styles.buttonShadow}
        >
            <span className="relative text-lg sm:text-xl font-semibold 
                text-white dark:text-black whitespace-normal text-center flex items-center"
            >
                Contáctenos 
                <FaArrowRight 
                    className="ml-3 group-hover:translate-x-1 transition-transform" 
                    aria-hidden="true"
                />
            </span>
            <span 
                className="absolute bottom-0 left-0 h-1 w-full transform 
                bg-gradient-to-r from-amarillo via-[#D5AB6F] to-amarillo 
                transition-transform duration-300 group-hover:translate-x-full"
                aria-hidden="true"
            />
        </Link>
    );

    return (
        <>
            <Head>
                <script type="application/ld+json">
                    {JSON.stringify(SCHEMA_DATA)}
                </script>
            </Head>

            <section 
                className="relative w-full py-24 lg:py-32 overflow-hidden"
                aria-label="Servicios inmobiliarios personalizados"
            >
                {/* Fondo con gradiente y patrón sutil */}
                <div 
                    className="absolute inset-0 bg-gradient-to-t from-neutral-100/90 via-neutral-100/50 to-transparent dark:from-gray-950/90 dark:via-gray-950/50 dark:to-transparent z-0"
                    aria-hidden="true"
                >
                    <div 
                        className="absolute inset-0" 
                        style={{ 
                            backgroundImage: 'radial-gradient(#D5AB6F 1px, transparent 1px)', 
                            backgroundSize: '40px 40px',
                            opacity: 0.15 
                        }}
                    />
                </div>
                
                <div className="w-full pl-4 sm:pl-8 lg:pl-12 relative z-10">
                    <div className="flex flex-col lg:flex-row items-start gap-16 lg:gap-8 max-w-[2000px]">
                        {/* Contenido Principal - Posicionado a la izquierda */}
                        <FadeInView direction="left" className="w-full lg:w-[45%] xl:w-[50%]">
                            <article 
                                className="text-left p-8 sm:p-10 rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-sm"
                                style={styles.mainGradient}
                            >
                                {/* Elementos decorativos */}
                                <div 
                                    className="absolute -top-32 -right-32 w-64 h-64 bg-white/20 rounded-full blur-3xl"
                                    aria-hidden="true"
                                />
                                <div 
                                    className="absolute -bottom-32 -left-32 w-64 h-64 bg-black/10 rounded-full blur-3xl"
                                    aria-hidden="true"
                                />
                                
                                <div className="relative text-black z-20">
                                    {/* Encabezado */}
                                    <div 
                                        className="mb-10 inline-block opacity-90"
                                        aria-hidden="true"
                                    >
                                        <FaQuoteLeft className="text-5xl text-black/30" />
                                    </div>
                                    
                                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-10 leading-tight">
                                        Cada propiedad, cada historia, <br className="hidden md:block" /> un método único.
                                    </h1>
                                    
                                    {/* Contenido Principal */}
                                    <div className="space-y-8 text-black/90">
                                        <p className="text-lg leading-relaxed">
                                            Si estás heredando una vivienda, un local o cualquier activo inmobiliario, cada operación requiere un enfoque diferente. No trabajamos captando propiedades sin más; de hecho, muchas veces es mejor decir <strong>NO</strong>. ¿Por qué? Porque cuando aceptamos una propiedad, tenemos claro que la vamos a vender.
                                        </p>

                                        {/* Sección de Motivos */}
                                        <section 
                                            className="bg-black/10 rounded-xl p-6 my-6"
                                            aria-labelledby="motivos-venta"
                                        >
                                            <h2 id="motivos-venta" className="text-xl font-bold mb-4 flex items-center">
                                                <FaExchangeAlt className="mr-3 text-black/70" aria-hidden="true" /> 
                                                Los motivos para vender son diversos:
                                            </h2>
                                            <ul className="space-y-3 pl-6" role="list">
                                                {MOTIVOS_VENTA.map((motivo, index) => (
                                                    <MotivoVenta key={index} {...motivo} />
                                                ))}
                                            </ul>
                                        </section>

                                        {/* Texto Adicional */}
                                        <div className="space-y-6">
                                            <p className="leading-relaxed">
                                                Cada situación es única y debe tratarse con el método adecuado.
                                            </p>
                                            
                                            <p className="leading-relaxed">
                                                Y si buscas comprar o alquilar, trabajamos bajo un principio clave: <strong>confianza</strong>. No trabajamos gratis ni al azar, sino con una estrategia clara para encontrar la propiedad que realmente encaje contigo.
                                            </p>
                                            
                                            <p className="leading-relaxed">
                                                Quizás buscas una casa para recibir amigos y familia. O un hogar donde crecer con tus hijos. Tal vez eres soltero/a y quieres un espacio especial para ti. O estás pensando en invertir: comprar para alquilar, reformar y vender, o asegurar un patrimonio para tus hijos.
                                            </p>
                                            
                                            <p className="leading-relaxed">
                                                La vivienda es más que un bien, es un pilar en la vida de cada persona. Y estamos aquí para entender tu situación y crear el plan perfecto para ti.
                                            </p>
                                            
                                            <p className="leading-relaxed font-medium">
                                                Hablemos y encontremos juntos la mejor solución para tu caso.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </article>
                        </FadeInView>

                        {/* Imagen y Botón */}
                        <ScaleInView delay={0.2} className="w-full lg:w-[55%] xl:w-[50%] flex flex-col items-center lg:items-start justify-center pr-4 sm:pr-8 lg:pr-12">
                            <figure className="relative h-[300px] md:h-[400px] lg:h-[580px] w-full max-w-md mx-auto lg:max-w-none shadow-2xl rounded-2xl overflow-hidden">
                                <div 
                                    className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent z-10"
                                    aria-hidden="true"
                                    style={styles.imageOverlay}
                                />
                                <Image
                                    src="/gzmdinero.png"
                                    alt="Inversiones inmobiliarias en Madrid - Imagen representativa de nuestros servicios"
                                    fill
                                    className="object-contain lg:object-cover object-center scale-100 lg:scale-100 transition-transform duration-700 hover:scale-[1.01]"
                                    priority
                                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 65vw"
                                    style={{ 
                                        objectPosition: '50% 50%',
                                        objectFit: 'cover'
                                    }}
                                    quality={100}
                                />
                            </figure>
                            
                            <div className="w-full mt-12 flex justify-center">
                                <ContactButton />
                            </div>
                        </ScaleInView>
                    </div>
                </div>
            </section>
        </>
    );
};

export default Eslogan;
