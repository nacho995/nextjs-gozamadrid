import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";
import Services from "@/components/Servicios/servicios";

export default function ServiciosPage() {
    const pageTitle = "Servicios Inmobiliarios en Madrid | Goza Madrid";
    const pageDescription = "Descubre nuestra gama completa de servicios inmobiliarios en Madrid: compra, venta, alquiler, gestión de propiedades y asesoramiento especializado para residentes nacionales y extranjeros.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/servicios" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://realestategozamadrid.com/img/servicios-inmobiliarios.jpg" />
                <meta property="og:url" content="https://realestategozamadrid.com/servicios" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://realestategozamadrid.com/img/servicios-inmobiliarios.jpg" />

                {/* Schema.org Organization y Services */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Goza Madrid Inmobiliaria",
                        "description": pageDescription,
                        "url": "https://realestategozamadrid.com/servicios",
                        "logo": "https://realestategozamadrid.com/logo.png",
                        "image": "https://realestategozamadrid.com/img/servicios-inmobiliarios.jpg",
                        "address": {
                            "@type": "PostalAddress",
                            "addressLocality": "Madrid",
                            "addressRegion": "Madrid",
                            "addressCountry": "ES"
                        },
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
                                        "name": "Servicios para Residentes en España",
                                        "description": "Servicios especializados para residentes locales"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Servicios para Extranjeros",
                                        "description": "Asesoramiento integral para inversores internacionales"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Gestión de Alquiler",
                                        "description": "Servicios completos de gestión de alquiler"
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
                                "item": "https://realestategozamadrid.com"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": "Servicios",
                                "item": "https://realestategozamadrid.com/servicios"
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="servicios inmobiliarios madrid, compra venta inmuebles, alquiler madrid, gestión propiedades, asesoría inmobiliaria, inversión inmobiliaria" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />

                {/* Metadatos multilenguaje */}
                <link rel="alternate" hrefLang="es" href="https://realestategozamadrid.com/servicios" />
                <link rel="alternate" hrefLang="en" href="https://realestategozamadrid.com/en/services" />
                <link rel="alternate" hrefLang="x-default" href="https://realestategozamadrid.com/servicios" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100"
                style={{
                    backgroundImage: "url('/gozamadridwp2.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="min-h-screen relative">
                    <Services />
                </div>
            </AnimatedOnScroll>
        </>
    );
}