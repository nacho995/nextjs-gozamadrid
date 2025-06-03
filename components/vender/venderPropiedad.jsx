import React from 'react';
import Link from 'next/link';
import AnimatedOnScroll from '../AnimatedScroll';
import Head from 'next/head';
import Image from "next/legacy/image";

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
                <link rel="canonical" href="https://realestategozamadrid.com/vender" />
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
                    className="relative w-full h-[50vh] xs:h-[90vh] sm:h-[80vh] md:h-[80vh] bg-cover bg-center border-y-amarillo/20 border-y-8"
                    style={{ backgroundImage: "url('/casaVender.jpg')" }}
                    aria-label="Venta de propiedades"
                >             
                    <div className="relative flex items-start sm:items-center justify-center sm:justify-end h-full px-2 sm:px-4 bg-gradient-to-l from-white/30 to-transparent pt-8 sm:pt-0">
                        <article className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-3 sm:py-6 md:py-8 lg:py-12 w-[85%] sm:w-3/4 md:w-2/5 text-center flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6 mx-auto sm:mr-[5%] max-h-[105%] xs:max-h-[80%] sm:max-h-[75%] md:max-h-[70%] overflow-y-auto">
                            <h1 
                                className="text-white font-bold text-lg sm:text-xl md:text-3xl lg:text-5xl px-2"
                                style={{ textShadow: "2px 2px 3px black"}}
                                itemProp="name"
                            >
                                Vende tu Propiedad en Madrid
                            </h1>
                            <p 
                                className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-2"
                                style={{ textShadow: "2px 2px 3px black"}}
                                itemProp="description"
                            >
                                Maximiza el valor de tu inmueble con nuestra tasación gratuita y asesoramiento inmobiliario profesional. Vende tu piso o casa en Madrid con expertos del sector.
                            </p>
                            <div className="mb-2">
                                <a
                                    href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-[80%] text-xs sm:text-sm md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 font-bold hover:bg-black hover:text-white transition-colors"
                                    title="Obtén una valoración profesional gratuita de tu propiedad"
                                >
                                    Valoración Inmobiliaria Gratuita
                                </a>
                            </div>
                        </article>
                    </div>
                </section>
            </AnimatedOnScroll>

            {/* Sección 2: Encontrar Hogar */}
            <AnimatedOnScroll>
                <section
                    className="relative w-full mt-0 h-[50vh] xs:h-[90vh] sm:h-[80vh] md:h-[80vh] border-y-white/50 border-y-8 bg-center"
                    style={{ 
                        backgroundImage: "url('/casaVender2.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    aria-label="Búsqueda de propiedades"
                >             
                    <div className="relative flex items-start sm:items-center justify-center sm:justify-start h-full px-2 sm:px-4 bg-gradient-to-r from-white/20 to-transparent w-full pt-8 sm:pt-0">
                        <article className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-3 sm:py-6 md:py-8 lg:py-12 w-[85%] sm:w-3/4 md:w-2/5 text-center flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6 mx-auto sm:ml-[5%] max-h-[105%] xs:max-h-[80%] sm:max-h-[75%] md:max-h-[70%] overflow-y-auto">
                            <h2 
                                className="text-white font-bold text-lg sm:text-xl md:text-3xl lg:text-5xl px-2"
                                style={{ textShadow: "2px 2px 3px black"}}
                                itemProp="name"
                            >
                                Encuentra tu Hogar Ideal en Madrid
                            </h2>
                            <p 
                                className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-2"
                                style={{ textShadow: "2px 2px 3px black"}}
                                itemProp="description"
                            >
                                Pisos y casas en venta en las mejores zonas de Madrid. Propiedades exclusivas, áticos, chalets y apartamentos con las mejores condiciones del mercado inmobiliario.
                            </p>
                            <div className="mb-2">
                                <Link
                                    href="/vender/comprar"
                                    className="block w-[80%] text-xs sm:text-sm md:w-1/2 lg:w-[15vw] mx-auto rounded-full bg-white text-black px-2 py-1 sm:px-3 sm:py-1.5 md:px-4 md:py-2 font-bold hover:bg-black hover:text-white transition-colors"
                                    title="Explora nuestro catálogo de propiedades disponibles"
                                >
                                    Buscar Propiedades en Madrid
                                </Link>
                            </div>
                        </article>
                    </div>
                </section>
            </AnimatedOnScroll>

            {/* Sección 3: Acompañamiento */}
            <AnimatedOnScroll>
                <section
                    className="relative w-full mt-0 h-[50vh] xs:h-[90vh] sm:h-[80vh] md:h-[80vh] bg-center border-y-amarillo/20 border-y-8"
                    style={{ 
                        backgroundImage: "url('/casaVender3.jpg')",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                        backgroundRepeat: "no-repeat",
                    }}
                    aria-label="Servicios de asesoramiento"
                >             
                    <div className="relative flex items-start sm:items-center justify-center sm:justify-end h-full px-2 sm:px-4 bg-gradient-to-l from-white/50 to-transparent pt-8 sm:pt-0">
                        <article className="bg-black/20 backdrop-blur-md rounded-lg border border-white py-3 sm:py-6 md:py-8 lg:py-12 w-[85%] sm:w-3/4 md:w-2/5 text-center flex flex-col gap-2 sm:gap-3 md:gap-4 lg:gap-6 mx-auto sm:mr-[5%] max-h-[105%] sm:max-h-[75%] md:max-h-[70%] overflow-y-auto">
                            <h2 
                                className="text-white font-bold text-lg sm:text-xl md:text-3xl lg:text-5xl px-2"
                                style={{ textShadow: "2px 2px 3px black"}}
                                itemProp="name"
                            >
                                Asesoramiento Inmobiliario Integral
                            </h2>
                            <div 
                                className="text-white text-xs sm:text-sm md:text-base lg:text-lg px-2"
                                style={{ textShadow: "2px 2px 3px black"}}
                                itemProp="description"
                            >
                                <p className="mb-1 sm:mb-2 md:mb-4">
                                    Servicios inmobiliarios premium en Madrid:
                                </p>
                                <ul className="text-left space-y-0.5 sm:space-y-1 md:space-y-2 px-2 sm:px-4 lg:text-lg text-xs sm:text-sm">
                                    <li>• Tasación y valoración de mercado</li>
                                    <li>• Marketing inmobiliario digital</li>
                                    <li>• Gestión de visitas y ofertas</li>
                                    <li>• Asesoramiento legal y fiscal</li>
                                    <li>• Acompañamiento hasta escrituración</li>
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
