"use client";

import React, { useEffect } from 'react';
import Head from "next/head";
import eXpRealty from "./eXpRealty.jsx";
import MartaLopez from "./MartaLopez.jsx";
import ExpCountries from "./expCountries.jsx";
import ExpRealty2 from "./ExpRealty2.jsx";
import FormContact from "../FormContact.jsx";
import { getCleanJsonLd } from "@/utils/structuredDataHelper";
import { agencyData } from "@/data/expRealtyStructuredData";

export default function ExpPage() {
    // Preparar datos estructurados limpios
    const cleanAgencyData = getCleanJsonLd(agencyData);
    
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
                <link rel="canonical" href="https://realestategozamadrid.com/exp" />
            </Head>

            {/* Añadimos el div de fondo aquí directamente */}
            <div
                className="fixed inset-0 z-0 opacity-100"
                style={{
                    backgroundImage: "url('/exp.jpg')",
                    backgroundAttachment: "fixed",
                }}
                aria-hidden="true"
                role="presentation"
            ></div>

            <div className="background-glow"></div>

            <main 
                className="m-0 p-0 bg-transparent relative z-10"
                itemScope 
                itemType="https://schema.org/RealEstateAgent"
            >
                <section 
                    aria-label="Presentación de Marta López"
                    itemProp="founder"
                >
                    <MartaLopez />
                </section>

                <section 
                    aria-label="Presentación eXp Realty"
                    itemProp="mainContentOfPage"
                >
                    <eXpRealty videoId="4NDjtS50SC4" title="eXp Realty Internacional" />
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
                    <FormContact />
                </section>

                <section 
                    aria-label="Más Información eXp Realty"
                    itemProp="description"
                >
                    <ExpRealty2 
                        videoId2="X-fZBk5sDGQ" 
                        videoId="PYFThiRO9v8" 
                        title="Descubre eXp Realty" 
                    />
                </section>

                {/* Schema.org structured data */}
                <script 
                    type="application/ld+json" 
                    dangerouslySetInnerHTML={{ __html: cleanAgencyData }}
                />
            </main>
        </>
    );
}
