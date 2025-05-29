import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";

export default function Terminos() {
    const pageTitle = "Términos y Condiciones | Goza Madrid Inmobiliaria";
    const pageDescription = "Términos y condiciones de uso de los servicios inmobiliarios de Goza Madrid. Información sobre honorarios, responsabilidades, y normativa aplicable a nuestros servicios de compraventa y alquiler.";
    const lastUpdated = "2024-03-01";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/terminos" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content="https://realestategozamadrid.com/terminos" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />
                <meta property="article:modified_time" content={lastUpdated} />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {/* Schema.org TermsAndConditions */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebPage",
                        "name": "Términos y Condiciones de Goza Madrid",
                        "description": pageDescription,
                        "dateModified": lastUpdated,
                        "publisher": {
                            "@type": "Organization",
                            "name": "Goza Madrid Inmobiliaria",
                            "url": "https://realestategozamadrid.com"
                        },
                        "mainEntity": {
                            "@type": "TermsAndConditions",
                            "name": "Términos y Condiciones de Servicios Inmobiliarios",
                            "text": "Términos y condiciones completos para los servicios inmobiliarios de Goza Madrid",
                            "datePublished": "2024-01-01",
                            "dateModified": lastUpdated,
                            "publisher": {
                                "@type": "Organization",
                                "name": "Goza Madrid Inmobiliaria"
                            }
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
                                "name": "Términos y Condiciones",
                                "item": "https://realestategozamadrid.com/terminos"
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
                        "url": "https://realestategozamadrid.com",
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
                        },
                        "sameAs": [
                            "https://www.facebook.com/gozamadrid",
                            "https://www.instagram.com/gozamadrid",
                            "https://www.linkedin.com/company/gozamadrid"
                        ]
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="términos y condiciones goza madrid, condiciones servicio inmobiliario, normativa inmobiliaria madrid, honorarios inmobiliarios, servicios inmobiliarios madrid" />
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
                        <h1 className="text-4xl font-bold mb-8 text-black">Términos y Condiciones</h1>
                        
                        <div className="space-y-6 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Aceptación de los Términos</h2>
                                <p>Al acceder y utilizar los servicios de Goza Madrid, aceptas estos términos y condiciones en su totalidad. Si no estás de acuerdo con alguna parte de estos términos, te rogamos que no utilices nuestros servicios.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Servicios Inmobiliarios</h2>
                                <p>Nuestros servicios incluyen:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Intermediación en la compraventa de inmuebles</li>
                                    <li>Asesoramiento inmobiliario</li>
                                    <li>Gestión de alquileres</li>
                                    <li>Valoración de propiedades</li>
                                    <li>Servicios de reforma y rehabilitación</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Honorarios y Comisiones</h2>
                                <p>Los honorarios por nuestros servicios serán acordados previamente y por escrito. Las comisiones varían según el tipo de servicio:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Las comisiones se establecerán mediante acuerdo específico para cada operación</li>
                                    <li>Los honorarios se devengarán en el momento de la firma del contrato correspondiente</li>
                                    <li>Los gastos adicionales (notaría, registro, etc.) no están incluidos en nuestros honorarios</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Responsabilidades</h2>
                                <p>Goza Madrid se compromete a:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Actuar con profesionalidad y diligencia en todos nuestros servicios</li>
                                    <li>Proporcionar información veraz y actualizada sobre las propiedades</li>
                                    <li>Mantener la confidencialidad de la información del cliente</li>
                                    <li>Cumplir con todas las normativas aplicables del sector inmobiliario</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Propiedad Intelectual</h2>
                                <p>Todo el contenido de nuestra web (textos, imágenes, logos, etc.) está protegido por derechos de propiedad intelectual. No está permitida su reproducción sin autorización expresa.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Limitación de Responsabilidad</h2>
                                <p>Goza Madrid no será responsable de:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Inexactitudes en la información proporcionada por terceros</li>
                                    <li>Daños indirectos o consecuentes</li>
                                    <li>Interrupciones en el servicio web por causas técnicas</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">7. Legislación Aplicable</h2>
                                <p>Estos términos se rigen por la legislación española. Cualquier disputa será resuelta en los tribunales de Madrid.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">8. Modificaciones</h2>
                                <p>Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios entrarán en vigor desde su publicación en la web.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">9. Contacto</h2>
                                <p>Para cualquier consulta sobre estos términos, puedes contactarnos en:</p>
                                <ul className="list-none mt-2">
                                    <li>Email: marta@gozamadrid.com</li>
                                    <li>Teléfono: +34 919 012 103</li>
                                    <li>Dirección: Calle de Alcalá, 96, 28009 Madrid</li>
                                </ul>
                            </section>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
        </>
    );
} 