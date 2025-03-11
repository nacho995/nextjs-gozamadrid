import Head from "next/head";
import FormContact from "@/components/FormContact";

export default function Contact() {
    const pageTitle = "Contacto | Goza Madrid Inmobiliaria";
    const pageDescription = "Contacta con Goza Madrid Inmobiliaria. Estamos aquí para ayudarte con tus necesidades inmobiliarias en Madrid. Consulta gratuita y atención personalizada.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://gozamadrid.com/contacto" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://gozamadrid.com/img/oficina-gozamadrid.jpg" />
                <meta property="og:url" content="https://gozamadrid.com/contacto" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://gozamadrid.com/img/oficina-gozamadrid.jpg" />

                {/* Schema.org RealEstateAgent */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "RealEstateAgent",
                        "name": "Goza Madrid Inmobiliaria",
                        "image": "https://gozamadrid.com/logo.png",
                        "description": pageDescription,
                        "url": "https://gozamadrid.com",
                        "telephone": "+34 919 012 103",
                        "email": "marta@gozamadrid.com",
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
                        "openingHoursSpecification": {
                            "@type": "OpeningHoursSpecification",
                            "dayOfWeek": [
                                "Monday",
                                "Tuesday",
                                "Wednesday",
                                "Thursday",
                                "Friday"
                            ],
                            "opens": "09:00",
                            "closes": "20:00"
                        },
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+34 919 012 103",
                            "contactType": "customer service",
                            "availableLanguage": ["Spanish", "English"]
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
                                "name": "Contacto",
                                "item": "https://gozamadrid.com/contacto"
                            }
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="contacto inmobiliaria madrid, agencia inmobiliaria madrid, asesoramiento inmobiliario, consulta inmobiliaria gratuita" />
                <meta name="author" content="Goza Madrid Inmobiliaria" />
                <meta property="og:locale" content="es_ES" />
                <meta name="format-detection" content="telephone=no" />
            </Head>

            <div className="relative w-full min-h-[80vh] pb-[10vh] overflow-hidden">
                <div className="fixed inset-0 z-0 w-full h-full opacity-100 bg-cover bg-center"
                    style={{
                        backgroundImage: "url('/gozamadridwp.jpg')",
                    }}>
                </div>
                <FormContact />
            </div>
        </>
    );
}




