"use client";

import Link from 'next/link';
import { FaHome, FaHandshake, FaChartLine } from 'react-icons/fa';
import Head from 'next/head';

export default function Services() {
    return (
        <main 
            className="servicios-page"
            itemScope 
            itemType="https://schema.org/Service"
        >
            <Head>
                <title>Servicios de Inversión Inmobiliaria | Asesoramiento para Residentes y No Residentes</title>
                <meta 
                    name="description" 
                    content="Servicios especializados de inversión inmobiliaria en España. Asesoramiento integral para inversores residentes y extranjeros. Gestión legal, fiscal y administrativa de propiedades." 
                />
                <meta 
                    name="keywords" 
                    content="inversión inmobiliaria España, asesoría inmobiliaria, gestión propiedades España, inversores extranjeros, inversores residentes, servicios inmobiliarios" 
                />
                <meta property="og:title" content="Servicios de Inversión Inmobiliaria en España" />
                <meta property="og:description" content="Asesoramiento integral inmobiliario para inversores residentes y extranjeros en España. Gestión completa de inversiones inmobiliarias." />
                <link rel="canonical" href="https://realestategozamadrid.com/servicios" />
            </Head>

            <div className="container mx-auto py-4 mt-[5vh] mb-[20vh]">
                <header className="text-center mb-12">
                    <h1 className="text-3xl md:text-4xl font-bold mb-4">
                        Servicios de Inversión Inmobiliaria en España
                    </h1>
                    <p className="text-lg text-gray-600 max-w-3xl mx-auto">
                        Soluciones integrales para la gestión y optimización de inversiones inmobiliarias, 
                        adaptadas a las necesidades específicas de inversores nacionales e internacionales.
                    </p>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Servicio 1: Residentes en España */}
                    <article 
                        className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full"
                        itemScope
                        itemType="https://schema.org/Service"
                    >
                        <Link 
                            href="/servicios/residentes-espana" 
                            className="flex flex-col items-center p-4 group h-full justify-between"
                            title="Servicios para inversores residentes en España"
                        >
                            <FaHandshake 
                                className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" 
                                aria-hidden="true"
                            />
                            <h2 
                                className="text-xl font-semibold mb-3"
                                itemProp="name"
                            >
                                Servicios para Inversores Residentes en España
                            </h2>
                            <div 
                                className="text-base md:text-lg max-w-sm"
                                itemProp="description"
                            >
                                <p>
                                    Maximiza el potencial de tu inversión inmobiliaria en España con nuestros 
                                    servicios especializados:
                                </p>
                                <ul className="mt-3 text-left space-y-2">
                                    <li>• Análisis detallado de rentabilidad inmobiliaria</li>
                                    <li>• Gestión integral de propiedades</li>
                                    <li>• Asesoramiento fiscal especializado</li>
                                    <li>• Optimización de inversiones inmobiliarias</li>
                                </ul>
                            </div>
                        </Link>
                    </article>

                    {/* Servicio 2: Residentes en el Extranjero */}
                    <article 
                        className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full"
                        itemScope
                        itemType="https://schema.org/Service"
                    >
                        <Link 
                            href="/servicios/residentes-extranjero" 
                            className="flex flex-col items-center p-4 group h-full justify-between"
                            title="Servicios para inversores extranjeros en España"
                        >
                            <FaChartLine 
                                className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" 
                                aria-hidden="true"
                            />
                            <h2 
                                className="text-xl font-semibold mb-3"
                                itemProp="name"
                            >
                                Servicios para Inversores Internacionales
                            </h2>
                            <div 
                                className="text-base md:text-lg max-w-sm"
                                itemProp="description"
                            >
                                <p>
                                    Simplificamos tu inversión inmobiliaria desde el extranjero con un 
                                    servicio integral que incluye:
                                </p>
                                <ul className="mt-3 text-left space-y-2">
                                    <li>• Gestión completa de trámites legales</li>
                                    <li>• Asesoramiento fiscal internacional</li>
                                    <li>• Gestión administrativa integral</li>
                                    <li>• Acompañamiento en todo el proceso</li>
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
                    "name": "Servicios de Inversión Inmobiliaria",
                    "description": "Servicios especializados de inversión y gestión inmobiliaria para residentes españoles e inversores internacionales",
                    "provider": {
                        "@type": "Organization",
                        "name": "Goza Madrid",
                        "areaServed": {
                            "@type": "Country",
                            "name": "España"
                        }
                    },
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Servicios Inmobiliarios",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Servicios para Residentes en España",
                                    "description": "Gestión integral de inversiones inmobiliarias para residentes españoles"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Servicios para Inversores Internacionales",
                                    "description": "Asesoramiento completo para inversores extranjeros en el mercado inmobiliario español"
                                }
                            }
                        ]
                    },
                    "serviceType": "Servicios Inmobiliarios",
                    "audience": {
                        "@type": "Audience",
                        "audienceType": ["Inversores Residentes", "Inversores Internacionales"]
                    },
                    "knowsAbout": [
                        "Inversión inmobiliaria",
                        "Gestión de propiedades",
                        "Fiscalidad inmobiliaria",
                        "Mercado inmobiliario español",
                        "Inversión internacional"
                    ]
                })
            }} />
        </main>
    );
}
