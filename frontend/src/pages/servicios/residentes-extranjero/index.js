import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";
import ServiciosExtranjero from "@/components/Servicios/fueraDeEspaña";

export default function ResidentesExtranjero() {
    const pageTitle = "Servicios Inmobiliarios para Extranjeros en Madrid | Goza Madrid";
    const pageDescription = "Servicios inmobiliarios especializados para inversores extranjeros en Madrid. Asesoramiento integral en compra, Golden Visa, fiscalidad y gestión de propiedades. Expertos en inversión internacional.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://gozamadrid.com/servicios/residentes-extranjero" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://gozamadrid.com/img/servicios-extranjeros.jpg" />
                <meta property="og:url" content="https://gozamadrid.com/servicios/residentes-extranjero" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://gozamadrid.com/img/servicios-extranjeros.jpg" />

                {/* Schema.org Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Goza Madrid Inmobiliaria",
                        "description": pageDescription,
                        "url": "https://gozamadrid.com/servicios/residentes-extranjero",
                        "logo": "https://gozamadrid.com/logo.png",
                        "image": "https://gozamadrid.com/img/servicios-extranjeros.jpg",
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
                            "name": "Servicios para Inversores Extranjeros",
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Golden Visa España",
                                        "description": "Asesoramiento completo para obtener la residencia por inversión"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Inversión Inmobiliaria Internacional",
                                        "description": "Gestión de inversiones inmobiliarias para extranjeros"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Asesoría Fiscal Internacional",
                                        "description": "Consultoría especializada en fiscalidad para no residentes"
                                    }
                                }
                            ]
                        },
                        "sameAs": [
                            "https://www.facebook.com/gozamadrid",
                            "https://www.instagram.com/gozamadrid",
                            "https://www.linkedin.com/company/gozamadrid"
                        ]
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
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="servicios inmobiliarios extranjeros madrid, golden visa españa, inversión extranjera madrid, asesoría fiscal internacional, compra inmuebles extranjeros" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />

                {/* Metadatos multilenguaje */}
                <link rel="alternate" hreflang="es" href="https://gozamadrid.com/servicios/residentes-extranjero" />
                <link rel="alternate" hreflang="en" href="https://gozamadrid.com/en/services/foreign-residents" />
                <link rel="alternate" hreflang="x-default" href="https://gozamadrid.com/servicios/residentes-extranjero" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp2.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="min-h-screen relative">
                    <div className="text-center py-12">
                        <h1 className="mt-[10vh] text-4xl font-bold mb-4 text-black">
                            Servicios Inmobiliarios para Inversores Extranjeros
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Asesoramiento especializado en inversión inmobiliaria internacional, Golden Visa y gestión integral de propiedades en Madrid
                        </p>
                    </div>
                    <ServiciosExtranjero />
                </div>
            </AnimatedOnScroll>
        </>
    );
}
