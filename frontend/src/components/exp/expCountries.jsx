"use client";

import React from "react";
import AnimatedOnScroll from "../AnimatedScroll";
import Image from "next/legacy/image";
import Link from "next/link";
import Head from "next/head";

export default function ExpCountries() {
    // Schema.org structured data for international real estate presence
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgency",
        "name": "eXp Realty Internacional",
        "description": "eXp Realty con presencia en España (Madrid, Andalucía, Cataluña, Valencia) y otros mercados internacionales como México, Portugal, Miami y Dubai.",
        "url": "https://www.gozamadrid.com/exp-international",
        "areaServed": [
            { "@type": "Country", "name": "España" },
            { "@type": "City", "name": "Madrid", "addressCountry": "ES" },
            { "@type": "AdministrativeArea", "name": "Andalucía", "addressCountry": "ES" },
            { "@type": "AdministrativeArea", "name": "Cataluña", "addressCountry": "ES" },
            { "@type": "AdministrativeArea", "name": "Valencia", "addressCountry": "ES" },
            { "@type": "Country", "name": "México" },
            { "@type": "Country", "name": "Portugal" },
            { "@type": "City", "name": "Miami", "addressCountry": "US" },
            { "@type": "City", "name": "Dubai", "addressCountry": "AE" }
        ],
        "makesOffer": {
            "@type": "Offer",
            "itemOffered": {
                "@type": "Service",
                "name": "Servicios inmobiliarios internacionales",
                "description": "Compra, venta y alquiler de propiedades en mercados internacionales"
            }
        }
    };

    const countries = [
        {
            name: "México",
            image: "/mexico.jpg",
            link: "https://gozamerida.com/",
            description: "Descubre las oportunidades inmobiliarias en el mercado mexicano con nuestros agentes especializados.",
            alt: "Propiedades en México gestionadas por eXp Realty - Riviera Maya y Mérida"
        },
        {
            name: "Portugal",
            image: "/portugal.jpg",
            link: "https://search.app/m1UY4QxWgqK1grma6",
            description: "Explora el encanto del mercado inmobiliario portugués con las mejores opciones de inversión.",
            alt: "Inmuebles en Portugal - Lisboa, Porto y Algarve con eXp Realty"
        },
        {
            name: "Miami",
            image: "/miami.jpg",
            link: "https://search.app/w2k6WEabMDTpiNdM9",
            description: "Vive el sueño americano con propiedades exclusivas en Miami y sus alrededores.",
            alt: "Propiedades de lujo en Miami, Florida - Condominios y casas con eXp Realty"
        },
        {
            name: "Dubai",
            image: "/dubai.jpg",
            link: "https://www.propertyfinder.ae/en/broker/exp-real-estate-br-of-exp-international-holdings-inc-dubai-branch-6166",
            description: "Experimenta el lujo inmobiliario en Dubai con oportunidades únicas de inversión global.",
            alt: "Inversiones inmobiliarias en Dubai - Propiedades de lujo con eXp Realty"
        }
    ];

    // Spanish regions data with improved descriptions
    const spanishRegions = [
        {
            name: "Andalucía",
            image: "/spain.jpg",
            alt: "Propiedades en Andalucía - Costa del Sol, Málaga y Sevilla con eXp Realty"
        },
        {
            name: "Madrid",
            image: "/madrid.jpg",
            alt: "Inmuebles en Madrid capital y alrededores - Mercado inmobiliario exclusivo con eXp Realty"
        },
        {
            name: "Cataluña",
            image: "/cataluña.jpg",
            alt: "Propiedades en Barcelona y resto de Cataluña gestionadas por eXp Realty"
        },
        {
            name: "Valencia",
            image: "/valencia.jpg",
            alt: "Oportunidades inmobiliarias en Valencia y Costa Blanca con eXp Realty"
        }
    ];

    const commonCardStyles = `
        relative rounded-sm transform transition h-[40vh] duration-700 z-10 
        hover:scale-105 hover:z-50
    `;

    const commonImageStyles = `
        w-full h-[40vh] object-cover rounded-sm
    `;

    const commonOverlayStyles = `
        absolute inset-0 bg-black/50 rounded-sm
    `;

    const commonTitleStyles = `
        text-2xl font-bold text-white italic mb-4
        [text-shadow:2px_2px_3px_rgba(65,105,225,0.7)]
    `;

    const spainTitleStyles = `
        absolute inset-0 flex items-center justify-center 
        text-2xl font-bold text-white italic
        [text-shadow:2px_2px_3px_rgba(65,105,225,0.7)]
    `;

    const commonButtonStyles = `
        group/link relative inline-flex items-center gap-2 overflow-hidden 
        rounded-full bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 
        transition-all duration-300 
        hover:bg-white/30 
        backdrop-blur-sm
        w-full max-w-[180px] justify-center
    `;

    return (
        <>
            <Head>
                <title>Propiedades Internacionales eXp Realty | España, México, Portugal, Miami, Dubai</title>
                <meta name="description" content="Descubre nuestras propiedades inmobiliarias internacionales en España (Madrid, Andalucía, Cataluña, Valencia), México, Portugal, Miami y Dubai. Inversión global con eXp Realty." />
                <meta name="keywords" content="propiedades internacionales, eXp Realty global, inmobiliaria españa internacional, propiedades méxico, propiedades portugal, propiedades miami, propiedades dubai" />
                <link rel="canonical" href="https://www.gozamadrid.com/exp-international" />
                <meta property="og:title" content="Propiedades Internacionales eXp Realty | Inversión Global" />
                <meta property="og:description" content="Explore nuestro portafolio internacional de propiedades en España, México, Portugal, Miami y Dubai. Servicios inmobiliarios globales con eXp Realty." />
                <meta property="og:url" content="https://www.gozamadrid.com/exp-international" />
                <meta property="og:type" content="website" />
                <meta property="og:image" content="https://www.gozamadrid.com/exp-global.jpg" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ 
                        __html: (() => {
                            try {
                                return JSON.stringify(jsonLd);
                            } catch (e) {
                                console.error("Error serializando jsonLd:", e);
                                return JSON.stringify({
                                    "@context": "https://schema.org",
                                    "@type": "RealEstateAgency",
                                    "name": "eXp Realty Internacional"
                                });
                            }
                        })()
                    }}
                />
            </Head>
            
            <AnimatedOnScroll>
                <section aria-label="Presencia inmobiliaria internacional de eXp Realty">
                    <div className="grid grid-cols-2 md:grid-cols-4 w-full overflow-hidden">
                        {/* Regiones de España */}
                        {spanishRegions.map((region, index) => (
                            <article 
                                key={`region-${index}`} 
                                className={commonCardStyles}
                                itemScope 
                                itemType="https://schema.org/Place"
                            >
                                {/* Hidden metadata for SEO */}
                                <meta itemProp="name" content={`${region.name}, España`} />
                                <meta itemProp="description" content={`Propiedades inmobiliarias en ${region.name}, España gestionadas por eXp Realty`} />
                                
                                <Image
                                    src={region.image}
                                    alt={region.alt}
                                    layout="fill"
                                    objectFit="cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    itemProp="image"
                                    priority={index < 2} // Prioritize loading for first two images
                                />
                                <div className={commonOverlayStyles}></div>
                                <h3 className={spainTitleStyles} itemProp="name">
                                    {region.name}
                                </h3>
                            </article>
                        ))}

                        {/* Países internacionales */}
                        {countries.map((country, index) => (
                            <article 
                                key={`country-${index}`} 
                                className={commonCardStyles}
                                itemScope
                                itemType="https://schema.org/Place"
                            >
                                {/* Hidden metadata for SEO */}
                                <meta itemProp="name" content={country.name} />
                                <meta itemProp="description" content={country.description} />
                                
                                <Image
                                    src={country.image}
                                    alt={country.alt}
                                    layout="fill"
                                    objectFit="cover"
                                    sizes="(max-width: 768px) 50vw, 25vw"
                                    itemProp="image"
                                />
                                <div className={commonOverlayStyles}>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center p-2 sm:p-4 space-y-2 sm:space-y-4">
                                        <h3 className={commonTitleStyles} itemProp="name">
                                            {country.name}
                                        </h3>
                                        <p className="text-white text-xs sm:text-sm font-bold text-center line-clamp-3 sm:line-clamp-none" itemProp="description">
                                            {country.description}
                                        </p>
                                        <a 
                                            href={country.link}
                                            className={commonButtonStyles}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Ver propiedades en ${country.name}`}
                                            itemProp="url"
                                        >
                                            <span className="relative text-sm sm:text-base md:text-lg font-semibold text-white whitespace-nowrap">
                                                Ver propiedades
                                            </span>
                                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                                bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                                transition-transform duration-300 
                                                group-hover/link:translate-x-full">
                                            </span>
                                        </a>
                                    </div>
                                </div>
                            </article>
                        ))}
                    </div>
                </section>
            </AnimatedOnScroll>
        </>
    );
}
