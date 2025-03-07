import React from 'react';
import Link from 'next/link';
import AnimatedOnScroll from '../AnimatedScroll';
import Head from 'next/head';
import Image from 'next/image';

export default function VenderPropiedad() {
    return (
        <main 
            className="vender-propiedad-page"
            itemScope 
            itemType="https://schema.org/RealEstateAgent"
        >
            <Head>
                <title>Vender tu Propiedad en Madrid | Asesoramiento Inmobiliario Profesional</title>
                <meta 
                    name="description" 
                    content="Servicio profesional de venta de propiedades en Madrid. Valoración gratuita, asesoramiento experto y acompañamiento en todo el proceso de venta. Maximiza el valor de tu propiedad." 
                />
                <meta 
                    name="keywords" 
                    content="vender casa Madrid, valoración inmobiliaria, venta propiedades, asesor inmobiliario Madrid, vender piso, tasación vivienda" 
                />
                <meta property="og:title" content="Vende tu Propiedad en Madrid con Expertos Inmobiliarios" />
                <meta property="og:description" content="Servicio integral de venta de propiedades. Valoración gratuita y asesoramiento profesional para maximizar el valor de tu inmueble." />
                <meta property="og:image" content="/casaVender.jpg" />
                <link rel="canonical" href="https://gozamadrid.com/vender" />
            </Head>

            {/* Fondo fijo */}
            <div
                className="fixed inset-0 z-0 opacity-100"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
                aria-hidden="true"
                role="presentation"
            ></div>

            {/* Sección 1: Vender Propiedad */}
            <AnimatedOnScroll>
                <section 
                    className="relative w-full h-[40vh] sm:h-[80vh] bg-cover bg-center border-y-amarillo/20 border-y-8"
                    style={{ backgroundImage: "url('/casaVender.jpg')" }}
                    aria-label="Venta de propiedades"
                >             
                    <div className="relative flex items-center justify-end h-full px-4 bg-gradient-to-l from-white/30 to-transparent">
                        <article className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6 mr-[5%]">
                            <h1 
                                className="text-white font-bold text-2xl sm:text-4xl md:text-5xl"
                                style={{ textShadow: "4px 4px 5px black"}}
                                itemProp="name"
                            >
                                Vende tu Propiedad con Expertos
                            </h1>
                            <p 
                                className="text-white text-sm sm:text-base md:text-lg"
                                style={{ textShadow: "4px 4px 5px black"}}
                                itemProp="description"
                            >
                                Simplificamos el proceso de venta de tu propiedad. Nuestros expertos inmobiliarios 
                                te acompañan en cada etapa, desde la valoración hasta el cierre, garantizando una 
                                experiencia profesional y sin complicaciones.
                            </p>
                            <div>
                                <a
                                    href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-sm sm:w-3/4 md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
                                    title="Obtén una valoración profesional gratuita de tu propiedad"
                                >
                                    Valoración Gratuita de tu Propiedad
                                </a>
                            </div>
                        </article>
                    </div>
                </section>
            </AnimatedOnScroll>

            {/* Sección 2: Encontrar Hogar */}
            <AnimatedOnScroll>
                <section
                    className="relative w-full mt-0 h-[40vh] sm:h-[80vh] border-y-white/50 border-y-8 bg-center"
                    style={{ 
                        backgroundImage: "url('/casaVender2.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    aria-label="Búsqueda de propiedades"
                >             
                    <div className="relative flex items-center justify-start h-full px-4 bg-gradient-to-r from-white/20 to-transparent w-full">
                        <article className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6 ml-[5%]">
                            <h2 
                                className="text-white font-bold text-2xl sm:text-4xl md:text-5xl"
                                style={{ textShadow: "4px 4px 5px black"}}
                                itemProp="name"
                            >
                                Encuentra tu Hogar Ideal en Madrid
                            </h2>
                            <p 
                                className="text-white text-sm sm:text-base md:text-lg"
                                style={{ textShadow: "4px 4px 5px black"}}
                                itemProp="description"
                            >
                                Explora nuestra selección exclusiva de propiedades en Madrid. Contamos con 
                                una amplia cartera de inmuebles y un equipo especializado que te ayudará a 
                                encontrar la casa que mejor se adapte a tus necesidades y preferencias.
                            </p>
                            <div>
                                <Link
                                    href="/vender/comprar"
                                    className="block w-full text-sm sm:w-3/4 md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-4 py-2 font-bold hover:bg-black hover:text-white transition-colors"
                                    title="Explora nuestro catálogo de propiedades disponibles"
                                >
                                    Explorar Propiedades Disponibles
                                </Link>
                            </div>
                        </article>
                    </div>
                </section>
            </AnimatedOnScroll>

            {/* Sección 3: Acompañamiento */}
            <AnimatedOnScroll>
                <section
                    className="relative w-full mt-0 h-[40vh] sm:h-[80vh] bg-center border-y-amarillo/20 border-y-8"
                    style={{ 
                        backgroundImage: "url('/casaVender3.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    aria-label="Servicios de asesoramiento"
                >             
                    <div className="relative flex items-center justify-start h-full px-4 ml-[5%] bg-gradient-to-l from-white/50 to-transparent">
                        <article className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-12 w-11/12 sm:w-2/5 text-center flex flex-col gap-6 ml-auto mr-[5%]">
                            <h2 
                                className="text-white font-bold text-2xl sm:text-4xl md:text-5xl"
                                style={{ textShadow: "4px 4px 5px black"}}
                                itemProp="name"
                            >
                                Asesoramiento Inmobiliario Integral
                            </h2>
                            <div 
                                className="text-white text-sm sm:text-base md:text-lg"
                                style={{ textShadow: "4px 4px 5px black"}}
                                itemProp="description"
                            >
                                <p className="mb-4">
                                    Nuestro equipo de asesores inmobiliarios te acompaña en cada fase del proceso:
                                </p>
                                <ul className="text-left space-y-2 px-4">
                                    <li>• Valoración profesional de mercado</li>
                                    <li>• Estrategia de marketing personalizada</li>
                                    <li>• Gestión de visitas y negociaciones</li>
                                    <li>• Asesoramiento legal y fiscal</li>
                                    <li>• Acompañamiento hasta la escrituración</li>
                                </ul>
                            </div>
                        </article>
                    </div>
                </section>
            </AnimatedOnScroll>

            {/* Schema.org structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "RealEstateAgent",
                    "name": "Servicios de Venta de Propiedades",
                    "description": "Servicio profesional de venta de propiedades en Madrid, incluyendo valoración, asesoramiento y gestión integral del proceso de venta.",
                    "image": "/casaVender.jpg",
                    "areaServed": {
                        "@type": "City",
                        "name": "Madrid"
                    },
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Servicios Inmobiliarios",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Valoración de Propiedades",
                                    "description": "Valoración profesional gratuita de tu propiedad"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Asesoramiento en Venta",
                                    "description": "Servicio integral de asesoramiento para la venta de tu propiedad"
                                }
                            }
                        ]
                    },
                    "knowsAbout": [
                        "Mercado inmobiliario Madrid",
                        "Valoración de propiedades",
                        "Venta de inmuebles",
                        "Asesoramiento inmobiliario",
                        "Gestión de propiedades"
                    ]
                })
            }} />
        </main>
    );
}
