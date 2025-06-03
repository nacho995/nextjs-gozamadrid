"use client";
import { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Head from "next/head";
import { getCleanJsonLd } from "@/utils/structuredDataHelper";

const CounterExp = () => {
    const [count, setCount] = useState(0);
    const [countCountry, setCountCountry] = useState(0);
    const targetCount = 95000;
    const incrementTime = 15;
    const targetCountCountry = 25;
    const incrementTimeCountry = 100;
    const observerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    // Datos organizacionales para eXp Realty
    const organizationData = {
        "@context": "https://schema.org",
        "@type": "Organization",
        "name": "eXp Realty",
        "description": "Red global de agentes inmobiliarios con presencia en 25 países",
        "url": "https://realestategozamadrid.com/exp-realty",
        "logo": {
            "@type": "ImageObject",
            "url": "https://realestategozamadrid.com/logo.png",
            "width": 180,
            "height": 60
        },
        "numberOfEmployees": {
            "@type": "QuantitativeValue",
            "value": 95000,
            "unitText": "agentes"
        },
        "address": {
            "@type": "PostalAddress",
            "addressCountry": "ES",
            "addressLocality": "Madrid"
        },
        "areaServed": [
            {
                "@type": "Country",
                "name": "España"
            },
            {
                "@type": "Country",
                "name": "Estados Unidos"
            },
            {
                "@type": "Country",
                "name": "Portugal"
            },
            {
                "@type": "Country",
                "name": "Francia"
            },
            {
                "@type": "Country",
                "name": "Italia"
            }
        ],
        "parentOrganization": {
            "@type": "Organization",
            "name": "eXp World Holdings",
            "url": "https://expworldholdings.com"
        },
        "subOrganization": {
            "@type": "Organization",
            "name": "Goza Madrid",
            "url": "https://realestategozamadrid.com"
        }
    };

    // Generar JSON-LD limpio
    const cleanOrgData = getCleanJsonLd(organizationData);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        const intervalAgents = setInterval(() => {
            setCount(prevCount => {
                if (prevCount < targetCount) {
                    return Math.min(prevCount + 1000, targetCount);
                }
                clearInterval(intervalAgents);
                return prevCount;
            });
        }, incrementTime);

        const intervalCountries = setInterval(() => {
            setCountCountry(prevCountCountry => {
                if (prevCountCountry < targetCountCountry) {
                    return Math.min(prevCountCountry + 1, targetCountCountry);
                }
                clearInterval(intervalCountries);
                return prevCountCountry;
            });
        }, incrementTimeCountry);

        return () => {
            clearInterval(intervalAgents);
            clearInterval(intervalCountries);
        };
    }, [isVisible]);

    return (
        <>
            <Head>
                <title>eXp Realty - Red Global de Agentes Inmobiliarios | Goza Madrid</title>
                <meta 
                    name="description" 
                    content="Descubre la red global de eXp Realty con más de 95,000 agentes en 25 países. Únete a la revolución inmobiliaria con tecnología de vanguardia y alcance internacional."
                />
                <meta 
                    name="keywords" 
                    content="eXp Realty, agentes inmobiliarios, red global inmobiliaria, expansión internacional, tecnología inmobiliaria, carrera inmobiliaria"
                />
                <meta property="og:type" content="website" />
                <meta property="og:title" content="eXp Realty - Red Global de Agentes Inmobiliarios" />
                <meta property="og:description" content="Red global de más de 95,000 agentes inmobiliarios en 25 países. Únete a la revolución del sector inmobiliario." />
                <link rel="canonical" href="https://realestategozamadrid.com/exp-realty" />

                {/* Schema.org markup para organización usando getCleanJsonLd */}
                <script 
                    type="application/ld+json" 
                    dangerouslySetInnerHTML={{ __html: cleanOrgData }} 
                />
            </Head>

            <AnimatedOnScroll>
                <section 
                    ref={observerRef} 
                    className="relative bottom-0 left-0 w-full flex justify-center items-center z-10"
                    aria-label="Estadísticas globales de eXp Realty"
                >
                    <div className="relative w-full h-40 flex items-center justify-center">
                        <div
                            className="absolute w-full h-full bg-gradient-to-t"
                            style={{
                                background: "linear-gradient(to top, transparent 5%, #C7A336 20%, #C7A336 80%, transparent 95%)",
                            }}
                            aria-hidden="true"
                        ></div>
                        <div 
                            className="absolute text-transparent bg-clip-text bg-gradient-to-r 
                                from-white via-black to-white 
                                dark:from-white dark:via-black dark:to-white 
                                px-2 text-md sm:text-xl lg:text-6xl font-bold z-20"
                            role="text"
                            aria-label={`Más de ${count.toLocaleString()} agentes trabajando en eXp alrededor de ${countCountry.toLocaleString()} países`}
                        >
                            Más de <span className="text-black dark:text-white" 
                            style={{ textShadow: "4px 4px 5px black"}}>{count.toLocaleString()}</span> agentes 
                            trabajando en <span className="text-black dark:text-white" 
                            style={{ textShadow: "4px 4px 5px black"}}>eXp</span> alrededor 
                            de <span className="text-black dark:text-white"
                            style={{ textShadow: "4px 4px 5px black"}}>{countCountry.toLocaleString()}</span> países
                        </div>
                    </div>
                </section>
            </AnimatedOnScroll>
        </>
    );
};

export default CounterExp;
