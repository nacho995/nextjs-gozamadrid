"use client";

import React from 'react';
import Head from "next/head";
import ExpRealty from "./eXpRealty";
import ExpCountries from "./expCountries";
import RegisterForm from "../FormContact";
import ExpRealtyMore from "./ExpRealty2";

export default function ExpPage() {
    return (
        <>
            <Head>
                <title>eXp Realty España | Únete a la Inmobiliaria del Futuro</title>
                <meta 
                    name="description" 
                    content="Descubre las oportunidades que ofrece eXp Realty en España. Únete a la red inmobiliaria más innovadora con presencia internacional y tecnología de vanguardia." 
                />
                <meta 
                    name="keywords" 
                    content="eXp Realty España, agente inmobiliario, carrera inmobiliaria, inmobiliaria internacional, tecnología inmobiliaria, oportunidades inmobiliarias" 
                />
                <meta property="og:title" content="eXp Realty España - Innovación Inmobiliaria" />
                <meta property="og:description" content="Forma parte de la revolución inmobiliaria con eXp Realty. Tecnología de vanguardia y presencia internacional." />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="/exp-realty-banner.jpg" />
                <meta name="twitter:card" content="summary_large_image" />
                <link rel="canonical" href="https://gozamadrid.com/exp" />
            </Head>

            <main 
                className="m-0 p-0"
                itemScope 
                itemType="https://schema.org/RealEstateAgent"
            >
                <section 
                    aria-label="Presentación eXp Realty"
                    itemProp="mainContentOfPage"
                >
                    <ExpRealty videoId="4NDjtS50SC4" title="eXp Realty Internacional" />
                </section>

                <section 
                    aria-label="Presencia Internacional"
                    itemProp="areaServed"
                >
                    <ExpCountries />
                </section>

                <section 
                    aria-label="Formulario de Contacto"
                    itemProp="hasOfferCatalog"
                >
                    <RegisterForm />
                </section>

                <section 
                    aria-label="Más Información eXp Realty"
                    itemProp="description"
                >
                    <ExpRealtyMore 
                        videoId2="X-fZBk5sDGQ" 
                        videoId="PYFThiRO9v8" 
                        title="Descubre eXp Realty" 
                    />
                </section>

                {/* Schema.org structured data */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "eXp Realty España",
                        "description": "eXp Realty es una innovadora inmobiliaria internacional que revoluciona el sector inmobiliario con tecnología de vanguardia y un modelo de negocio único.",
                        "image": "/exp-realty-banner.jpg",
                        "url": "https://gozamadrid.com/exp",
                        "areaServed": {
                            "@type": "Country",
                            "name": "España"
                        },
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": "Oportunidades Profesionales",
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Carrera Inmobiliaria",
                                        "description": "Desarrollo profesional en el sector inmobiliario con tecnología innovadora"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Formación Continua",
                                        "description": "Acceso a programas de formación y desarrollo profesional"
                                    }
                                }
                            ]
                        },
                        "sameAs": [
                            "https://www.facebook.com/eXpRealtySpain",
                            "https://www.linkedin.com/company/exp-realty-spain",
                            "https://www.instagram.com/exprealty_spain"
                        ]
                    })
                }} />
            </main>
        </>
    );
}
