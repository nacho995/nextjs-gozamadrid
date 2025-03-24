import Head from "next/head";
import ImpuestoSobreRenta from "@/components/Servicios/impuestosobrerenta";

export default function ImpuestoRenta() {
    const pageTitle = "Impuesto sobre la Renta para Extranjeros en España | Goza Madrid";
    const pageDescription = "Información completa sobre el Impuesto sobre la Renta de No Residentes (IRNR) en España. Asesoramiento experto en obligaciones fiscales, deducciones y declaraciones para propietarios extranjeros de inmuebles en Madrid.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/servicios/residentes-extranjero/impuesto-renta" />

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://realestategozamadrid.com/img/impuestos-extranjeros.jpg" />
                <meta property="og:url" content="https://realestategozamadrid.com/servicios/residentes-extranjero/impuesto-renta" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://realestategozamadrid.com/img/impuestos-extranjeros.jpg" />

                {/* Schema.org Article */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": "https://realestategozamadrid.com/servicios/residentes-extranjero/impuesto-renta"
                        },
                        "headline": "Guía del Impuesto sobre la Renta para Extranjeros en España",
                        "description": pageDescription,
                        "image": "https://realestategozamadrid.com/img/impuestos-extranjeros.jpg",
                        "author": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://realestategozamadrid.com/logo.png"
                            }
                        },
                        "datePublished": "2024-01-01",
                        "dateModified": "2024-01-01",
                        "about": {
                            "@type": "Thing",
                            "name": "Fiscalidad Inmobiliaria Internacional",
                            "description": "Impuestos para propietarios extranjeros de inmuebles en España"
                        },
                        "articleSection": "Fiscalidad Internacional",
                        "keywords": "IRNR españa, impuestos extranjeros españa, fiscalidad no residentes"
                    })}
                </script>

                {/* Schema.org Service */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": "Asesoramiento Fiscal para Extranjeros",
                        "serviceType": "Tax Consulting",
                        "description": pageDescription,
                        "provider": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria",
                            "image": "https://realestategozamadrid.com/logo.png"
                        },
                        "areaServed": {
                            "@type": "Country",
                            "name": "España"
                        },
                        "audience": {
                            "@type": "Audience",
                            "audienceType": "Propietarios extranjeros de inmuebles"
                        }
                    })}
                </script>

                {/* Schema.org BreadcrumbList */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Inicio",
                                "item": "https://realestategozamadrid.com"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Servicios",
                                "item": "https://realestategozamadrid.com/servicios"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Residentes Extranjero",
                                "item": "https://realestategozamadrid.com/servicios/residentes-extranjero"
                            },
                            {
                                "@type": "ListItem",
                                "position": 4,
                                "name": "Impuesto sobre la Renta",
                                "item": "https://realestategozamadrid.com/servicios/residentes-extranjero/impuesto-renta"
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="impuesto renta no residentes españa, IRNR, fiscalidad inmobiliaria extranjeros, impuestos propiedades españa, declaración renta extranjeros" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="article:published_time" content="2024-01-01" />
                <meta name="article:modified_time" content="2024-01-01" />
                <meta name="article:section" content="Fiscalidad Internacional" />
                <meta name="article:tag" content="Impuestos Extranjeros" />

                {/* Metadatos multilenguaje */}
                <link rel="alternate" hreflang="es" href="https://realestategozamadrid.com/servicios/residentes-extranjero/impuesto-renta" />
                <link rel="alternate" hreflang="en" href="https://realestategozamadrid.com/en/services/foreign-residents/income-tax" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <ImpuestoSobreRenta />
        </>
    );
}
