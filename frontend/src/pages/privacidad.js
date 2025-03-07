import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";

export default function Privacidad() {
    const pageTitle = "Política de Privacidad | Goza Madrid Inmobiliaria";
    const pageDescription = "Conoce nuestra política de privacidad y protección de datos. Información sobre el tratamiento de datos personales, cookies y tus derechos RGPD en Goza Madrid Inmobiliaria.";
    const lastUpdated = "2024-03-01";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://gozamadrid.com/privacidad" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content="https://gozamadrid.com/privacidad" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />
                <meta property="article:modified_time" content={lastUpdated} />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {/* Schema.org PrivacyPolicy */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "PrivacyPolicy",
                        "name": "Política de Privacidad de Goza Madrid",
                        "version": "1.0",
                        "dateModified": lastUpdated,
                        "publisher": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria",
                            "url": "https://gozamadrid.com"
                        },
                        "keywords": "privacidad, RGPD, protección datos, cookies, derechos usuario",
                        "inLanguage": "es",
                        "about": {
                            "@type": "Thing",
                            "name": "Protección de datos personales y privacidad",
                            "description": "Política de privacidad y tratamiento de datos personales en servicios inmobiliarios"
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
                                "name": "Política de Privacidad",
                                "item": "https://gozamadrid.com/privacidad"
                            }
                        ]
                    })}
                </script>

                {/* Schema.org Organization */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Organization",
                        "name": "Goza Madrid Inmobiliaria",
                        "url": "https://gozamadrid.com",
                        "contactPoint": {
                            "@type": "ContactPoint",
                            "telephone": "+34 919 012 103",
                            "email": "marta@gozamadrid.com",
                            "contactType": "customer service",
                            "areaServed": "ES",
                            "availableLanguage": ["Spanish", "English"]
                        },
                        "address": {
                            "@type": "PostalAddress",
                            "streetAddress": "Calle de Alcalá, 96",
                            "addressLocality": "Madrid",
                            "postalCode": "28009",
                            "addressCountry": "ES"
                        }
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="política privacidad goza madrid, protección datos inmobiliaria, RGPD madrid, cookies inmobiliaria, derechos datos personales" />
                <meta name="author" content="Goza Madrid Inmobiliaria" />
                <meta property="og:locale" content="es_ES" />
                <meta name="format-detection" content="telephone=no" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8 text-black">Política de Privacidad</h1>
                        
                        <div className="space-y-6 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
                                <p>En Goza Madrid recopilamos la siguiente información:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Información de contacto (nombre, email, teléfono)</li>
                                    <li>Información de la propiedad que te interesa</li>
                                    <li>Preferencias de búsqueda inmobiliaria</li>
                                    <li>Datos de navegación en nuestra web</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
                                <p>Utilizamos tu información para:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Proporcionarte servicios inmobiliarios personalizados</li>
                                    <li>Responder a tus consultas y solicitudes</li>
                                    <li>Enviarte información relevante sobre propiedades</li>
                                    <li>Mejorar nuestros servicios</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
                                <p>Tus datos están protegidos según el RGPD (Reglamento General de Protección de Datos). Tienes derecho a:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Acceder a tus datos personales</li>
                                    <li>Rectificar datos inexactos</li>
                                    <li>Solicitar la eliminación de tus datos</li>
                                    <li>Oponerte al procesamiento de tus datos</li>
                                    <li>Solicitar la portabilidad de tus datos</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
                                <p>Utilizamos cookies para:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Mejorar la navegación en nuestra web</li>
                                    <li>Analizar el uso de nuestro sitio</li>
                                    <li>Personalizar tu experiencia</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Contacto</h2>
                                <p>Para cualquier consulta sobre tu privacidad, puedes contactarnos en:</p>
                                <ul className="list-none mt-2">
                                    <li>Email: marta@gozamadrid.com</li>
                                    <li>Teléfono: +34 919 012 103</li>
                                    <li>Dirección: Calle de Alcalá, 96, 28009 Madrid</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Actualizaciones</h2>
                                <p>Esta política de privacidad fue actualizada por última vez el 1 de marzo de 2024. Nos reservamos el derecho de modificar esta política en cualquier momento.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
        </>
    );
} 