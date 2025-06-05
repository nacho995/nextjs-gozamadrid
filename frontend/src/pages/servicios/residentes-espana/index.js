import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";
import ServiciosEspaña from "@/components/Servicios/españa";

export default function ResidentesEspaña() {
    const pageTitle = "Servicios Inmobiliarios para Residentes en España | Goza Madrid";
    const pageDescription = "Servicios especializados para inversores inmobiliarios residentes en España. Asesoramiento experto en compra, venta, alquiler y gestión de propiedades en Madrid. Maximiza el rendimiento de tus inversiones inmobiliarias.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/servicios/residentes-espana" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://realestategozamadrid.com/img/servicios-residentes.jpg" />
                <meta property="og:url" content="https://realestategozamadrid.com/servicios/residentes-espana" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://realestategozamadrid.com/img/servicios-residentes.jpg" />

                {/* Schema.org Service */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Goza Madrid Inmobiliaria",
                        "description": pageDescription,
                        "url": "https://realestategozamadrid.com/servicios/residentes-espana",
                        "logo": "https://realestategozamadrid.com/logo.png",
                        "image": "https://realestategozamadrid.com/img/servicios-residentes.jpg",
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
                            "name": "Servicios para Residentes en España",
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Asesoramiento en Compra de Propiedades",
                                        "description": "Guía experta para la adquisición de inmuebles en Madrid"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Gestión de Alquiler",
                                        "description": "Administración profesional de propiedades en alquiler"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Inversión Inmobiliaria",
                                        "description": "Estrategias de inversión y optimización de rentabilidad"
                                    }
                                }
                            ]
                        },
                        "sameAs": [
                            "https://www.facebook.com/MBLP66/",
                            "https://www.instagram.com/gozamadrid54/",
                            "https://www.linkedin.com/in/marta-l%C3%B3pez-55516099/"
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
                                "name": "Residentes en España",
                                "item": "https://realestategozamadrid.com/servicios/residentes-espana"
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="servicios inmobiliarios madrid, inversión inmobiliaria españa, compra venta propiedades madrid, gestión alquiler madrid, asesoría inmobiliaria residentes" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />
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
                    <div className="text-center py-12">
                        <h1 className="mt-[10vh] text-4xl font-bold mb-4 text-black">
                            Servicios para inversores inmobiliarios en España
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Maximiza tus inversiones con nuestro asesoramiento especializado para residentes locales
                        </p>
                    </div>
                    <ServiciosEspaña />
                </div>
            </AnimatedOnScroll>
        </>
    );
} 