import Head from "next/head";
import Reforms from "@/components/reformas/reforms";

export default function ReformsPage() {
    const pageTitle = "Reformas Integrales en Madrid | Servicios de Reforma | Goza Madrid";
    const pageDescription = "Servicios profesionales de reformas integrales en Madrid. Especialistas en renovación de viviendas, reformas de lujo, diseño de interiores y proyectos personalizados para tu hogar.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://gozamadrid.com/reformas" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://gozamadrid.com/img/reformas-hero.jpg" />
                <meta property="og:url" content="https://gozamadrid.com/reformas" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://gozamadrid.com/img/reformas-hero.jpg" />

                {/* Schema.org Service */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": "Servicios de Reformas Goza Madrid",
                        "description": pageDescription,
                        "provider": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria",
                            "url": "https://gozamadrid.com"
                        },
                        "areaServed": {
                            "@type": "City",
                            "name": "Madrid"
                        },
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": "Servicios de Reformas",
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Reformas Integrales",
                                        "description": "Renovación completa de viviendas y espacios"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Diseño de Interiores",
                                        "description": "Diseño personalizado y decoración de espacios"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Reformas de Lujo",
                                        "description": "Acabados premium y materiales de alta calidad"
                                    }
                                }
                            ]
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
                                "name": "Reformas",
                                "item": "https://gozamadrid.com/reformas"
                            }
                        ]
                    })}
                </script>

                {/* Schema.org LocalBusiness */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "LocalBusiness",
                        "name": "Goza Madrid Reformas",
                        "image": "https://gozamadrid.com/img/reformas-hero.jpg",
                        "description": pageDescription,
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Calle de Alcalá, 96",
                            "addressLocality": "Madrid",
                            "postalCode": "28009",
                            "addressCountry": "ES"
                        },
                        "geo": {
                            "@type": "GeoCoordinates",
                            "latitude": "40.423697",
                            "longitude": "-3.676181"
                        },
                        "url": "https://gozamadrid.com/reformas",
                        "telephone": "+34 919 012 103",
                        "priceRange": "€€€",
                        "areaServed": "Madrid"
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="reformas madrid, reformas integrales, reformas lujo madrid, diseño interiores, renovación viviendas, reformas hogar madrid" />
                <meta name="author" content="Goza Madrid Inmobiliaria" />
                <meta property="og:locale" content="es_ES" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
            </Head>

            <div>
                <div
                    className="fixed inset-0 z-0 opacity-100"
                    style={{
                        backgroundImage: "url('/gozamadridwp.jpg')",
                        backgroundAttachment: "fixed",
                    }}
                ></div>
                <Reforms/>
            </div>
        </>
    );
}