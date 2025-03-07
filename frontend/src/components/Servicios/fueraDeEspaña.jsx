"use client";

import Link from 'next/link';
import { FaHome, FaHandshake, FaChartLine } from 'react-icons/fa';
import AnimatedOnScroll from '../AnimatedScroll';
import Head from 'next/head';

export default function ServiciosExtranjero() {
    return (
        <section 
            className="servicios-extranjero py-4 mt-[5vh] mb-[20vh]"
            aria-label="Servicios para extranjeros en España"
        >
            <Head>
                <title>Servicios para Extranjeros | Asesoría Fiscal e Inmobiliaria en España</title>
                <meta 
                    name="description" 
                    content="Servicios especializados para extranjeros en España: Gestión del Impuesto sobre la Renta de No Residentes (IRNR) y guía completa para comprar propiedades en España. Asesoramiento legal y fiscal." 
                />
                <meta 
                    name="keywords" 
                    content="IRNR España, comprar propiedad España, impuestos no residentes, inversión inmobiliaria España, asesoría fiscal extranjeros, guía compra inmuebles España" 
                />
            </Head>

            <div className="container mx-auto">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold mb-4 text-gray-800">
                        Servicios Especializados para Extranjeros en España
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Asesoramiento integral para inversores y propietarios extranjeros en España: 
                        gestión fiscal y compra de propiedades.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Servicio 1: Impuesto de la Renta */}
                    <article className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                        <Link 
                            href="/servicios/residentes-extranjero/impuesto-renta" 
                            className="flex flex-col items-center p-4 group h-full justify-between"
                            title="Gestión del Impuesto sobre la Renta de No Residentes (IRNR)"
                        >
                            <FaChartLine 
                                className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" 
                                aria-hidden="true"
                            />
                            <h2 className="text-xl font-semibold mb-3">
                                Impuesto de la Renta para No Residentes (IRNR)
                            </h2>
                            <div className="text-base md:text-lg max-w-sm">
                                <p>
                                    Ofrecemos asesoramiento especializado en la gestión y optimización del 
                                    Impuesto sobre la Renta de No Residentes (IRNR). Nuestros expertos fiscales te ayudan a:
                                </p>
                                <ul className="text-left mt-3 space-y-2">
                                    <li>• Cumplir con tus obligaciones fiscales en España</li>
                                    <li>• Optimizar tu carga impositiva legalmente</li>
                                    <li>• Gestionar declaraciones y documentación</li>
                                    <li>• Mantenerte actualizado sobre cambios normativos</li>
                                </ul>
                            </div>
                        </Link>
                    </article>

                    {/* Servicio 2: Guía de Compra */}
                    <article className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                        <Link 
                            href="/servicios/residentes-extranjero/guia-compra" 
                            className="flex flex-col items-center p-4 group h-full justify-between"
                            title="Guía Completa para Comprar Propiedades en España"
                        >
                            <FaHome 
                                className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" 
                                aria-hidden="true"
                            />
                            <h2 className="text-xl font-semibold mb-3">
                                Guía Completa de Compra de Propiedades en España
                            </h2>
                            <div className="text-base md:text-lg max-w-sm">
                                <p>
                                    Asesoramiento integral para inversores extranjeros que desean comprar 
                                    propiedades en España. Nuestros servicios incluyen:
                                </p>
                                <ul className="text-left mt-3 space-y-2">
                                    <li>• Análisis de requisitos legales y fiscales</li>
                                    <li>• Acompañamiento en el proceso de compra</li>
                                    <li>• Gestión de documentación necesaria</li>
                                    <li>• Asesoría sobre financiación y hipotecas</li>
                                </ul>
                            </div>
                        </Link>
                    </article>
                </div>
            </div>

            {/* Schema.org structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": "Servicios para Extranjeros en España",
                    "description": "Servicios especializados de asesoría fiscal e inmobiliaria para extranjeros en España, incluyendo gestión del IRNR y guía de compra de propiedades.",
                    "provider": {
                        "@type": "Organization",
                        "name": "Goza Madrid"
                    },
                    "areaServed": {
                        "@type": "Country",
                        "name": "España"
                    },
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Servicios para Extranjeros",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Gestión del Impuesto sobre la Renta de No Residentes (IRNR)",
                                    "description": "Asesoramiento especializado en la gestión y optimización del Impuesto sobre la Renta de No Residentes (IRNR)"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Guía de Compra de Propiedades",
                                    "description": "Asesoramiento integral para la compra de propiedades en España para extranjeros"
                                }
                            }
                        ]
                    }
                })
            }} />
        </section>
    );
}
