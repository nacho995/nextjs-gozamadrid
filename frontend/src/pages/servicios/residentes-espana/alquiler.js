import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";
import AlquilerTuristico from "@/components/Servicios/alquilerTuristico";

export default function AlquilerPage() {
    const pageTitle = "Alquiler Turístico en Madrid | Goza Madrid Inmobiliaria";
    const pageDescription = "Gestión profesional de alquiler turístico en Madrid. Maximiza la rentabilidad de tu propiedad con nuestro servicio integral de alquiler vacacional. Asesoramiento experto, gestión completa y marketing especializado.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/servicios/residentes-espana/alquiler" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://realestategozamadrid.com/img/alquiler-turistico.jpg" />
                <meta property="og:url" content="https://realestategozamadrid.com/servicios/residentes-espana/alquiler" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://realestategozamadrid.com/img/alquiler-turistico.jpg" />

                {/* Schema.org Service */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Service",
                        "name": "Alquiler Turístico en Madrid",
                        "serviceType": "Real Estate Rental Service",
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
                            "name": "Servicios de Alquiler Turístico",
                            "itemListElement": [
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Gestión Integral de Alquiler Vacacional"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Marketing y Promoción de Propiedades"
                                    }
                                },
                                {
                                    "@type": "Offer",
                                    "itemOffered": {
                                        "@type": "Service",
                                        "name": "Asesoramiento Legal y Fiscal"
                                    }
                                }
                            ]
                        }
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="alquiler turístico madrid, alquiler vacacional, gestión alquiler, propiedades madrid, airbnb madrid, rentabilidad alquiler" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <AlquilerTuristico />
            </AnimatedOnScroll>
        </>
    );
} 