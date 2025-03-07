import Head from "next/head";
import GuiaCompraInmuebles from "@/components/Servicios/guiaCompraInmuebles";

export default function GuiaCompra() {
    const pageTitle = "Guía de Compra de Inmuebles para Extranjeros en Madrid | Goza Madrid";
    const pageDescription = "Guía completa para inversores extranjeros que desean comprar propiedades en Madrid. Información detallada sobre el proceso, requisitos legales, financiación, Golden Visa y trámites específicos para no residentes.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://gozamadrid.com/servicios/residentes-extranjero/guia-compra" />

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://gozamadrid.com/img/guia-compra-extranjeros.jpg" />
                <meta property="og:url" content="https://gozamadrid.com/servicios/residentes-extranjero/guia-compra" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://gozamadrid.com/img/guia-compra-extranjeros.jpg" />

                {/* Schema.org Article */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": "https://gozamadrid.com/servicios/residentes-extranjero/guia-compra"
                        },
                        "headline": "Guía Completa para Comprar Inmuebles en Madrid siendo Extranjero",
                        "description": pageDescription,
                        "image": "https://gozamadrid.com/img/guia-compra-extranjeros.jpg",
                        "author": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria"
                        },
                        "publisher": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria",
                            "logo": {
                                "@type": "ImageObject",
                                "url": "https://gozamadrid.com/logo.png"
                            }
                        },
                        "datePublished": "2024-01-01",
                        "dateModified": "2024-01-01",
                        "about": {
                            "@type": "Thing",
                            "name": "Inversión Inmobiliaria Internacional",
                            "description": "Proceso de compra de propiedades en Madrid para extranjeros"
                        },
                        "articleSection": "Guías Inmobiliarias Internacional",
                        "keywords": "compra inmuebles madrid extranjeros, golden visa españa, inversión extranjera madrid"
                    })}
                </script>

                {/* Schema.org HowTo */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": "Cómo Comprar una Propiedad en Madrid siendo Extranjero",
                        "description": "Guía paso a paso para inversores extranjeros interesados en comprar propiedades en Madrid",
                        "step": [
                            {
                                "@type": "HowToStep",
                                "name": "Requisitos Legales",
                                "text": "Documentación necesaria y requisitos para extranjeros"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "NIE y Cuenta Bancaria",
                                "text": "Obtención del NIE y apertura de cuenta bancaria en España"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Búsqueda de Propiedad",
                                "text": "Identificación y visita de propiedades adecuadas"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Due Diligence Internacional",
                                "text": "Verificación legal y técnica adaptada a compradores extranjeros"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Golden Visa",
                                "text": "Información sobre el proceso de Golden Visa para inversiones superiores a 500.000€"
                            }
                        ],
                        "totalTime": "P120D"
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
                                "item": "https://gozamadrid.com"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Servicios",
                                "item": "https://gozamadrid.com/servicios"
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Residentes Extranjero",
                                "item": "https://gozamadrid.com/servicios/residentes-extranjero"
                            },
                            {
                                "@type": "ListItem",
                                "position": 4,
                                "name": "Guía de Compra",
                                "item": "https://gozamadrid.com/servicios/residentes-extranjero/guia-compra"
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="guía compra inmuebles madrid extranjeros, golden visa españa, inversión extranjera madrid, comprar casa españa no residente, nie compra inmueble" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />
                <meta name="article:published_time" content="2024-01-01" />
                <meta name="article:modified_time" content="2024-01-01" />
                <meta name="article:section" content="Guías Inmobiliarias Internacional" />
                <meta name="article:tag" content="Inversión Extranjera" />

                {/* Metadatos multilenguaje */}
                <link rel="alternate" hreflang="es" href="https://gozamadrid.com/servicios/residentes-extranjero/guia-compra" />
                <link rel="alternate" hreflang="en" href="https://gozamadrid.com/en/services/foreign-residents/buying-guide" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <GuiaCompraInmuebles />
        </>
    );
}