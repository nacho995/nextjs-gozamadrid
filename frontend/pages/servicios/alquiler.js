import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";
import AlquilerTuristico from "@/components/Servicios/alquilerTuristico";

export default function Alquiler() {
    const pageTitle = "Servicios de Alquiler en Madrid | Gestión Integral | Goza Madrid";
    const pageDescription = "Servicios profesionales de gestión de alquiler en Madrid. Maximiza la rentabilidad de tu propiedad con nuestra gestión integral: marketing, selección de inquilinos, mantenimiento y asesoría legal.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/servicios/alquiler" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://realestategozamadrid.com/img/alquiler-servicios.jpg" />
                <meta property="og:url" content="https://realestategozamadrid.com/servicios/alquiler" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://realestategozamadrid.com/img/alquiler-servicios.jpg" />

                {/* Schema.org Service */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": "Servicios de Alquiler en Madrid",
                        "serviceType": "Property Management",
                        "description": pageDescription,
                        "provider": {
                            "@type": "RealEstateAgent",
                            "name": "Goza Madrid Inmobiliaria",
                            "image": "https://realestategozamadrid.com/logo.png",
                            "address": {
                                "@type": "PostalAddress",
                                "addressLocality": "Madrid",
                                "addressRegion": "Madrid",
                                "addressCountry": "ES"
                            }
                        },
                        "areaServed": {
                            "@type": "City",
                            "name": "Madrid"
                        },
                        "hasOfferCatalog": {
                            "@type": "OfferCatalog",
                            "name": "Servicios de Gestión de Alquiler",
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Gestión Integral de Alquiler",
                                        "description": "Administración completa de su propiedad en alquiler"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Marketing y Promoción",
                                        "description": "Estrategias de marketing para maximizar la ocupación"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Mantenimiento y Gestión",
                                        "description": "Servicio completo de mantenimiento y atención"
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
                            },
                            {
                                "@type": "ListItem",
                                "position": 3,
                                "name": "Alquiler",
                                "item": "https://realestategozamadrid.com/servicios/alquiler"
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="alquiler madrid, gestión alquiler, administración propiedades, alquiler turístico madrid, rentabilidad alquiler" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />
            </Head>

            <div className="relative min-h-screen">
                <div
                    className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/gozamadridwp.jpg')",
                        backgroundAttachment: "fixed",
                    }}
                ></div>
                <div className="relative z-10">
                    <div className="text-center py-12">
                        <h1 className="mt-[10vh] text-4xl font-bold mb-4 text-black">
                            Servicios de Alquiler en Madrid
                        </h1>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Gestión profesional y rentabilidad garantizada para tu propiedad en alquiler
                        </p>
                    </div>
                    <AnimatedOnScroll>
                        <AlquilerTuristico />
                    </AnimatedOnScroll>
                </div>
            </div>
        </>
    );
}