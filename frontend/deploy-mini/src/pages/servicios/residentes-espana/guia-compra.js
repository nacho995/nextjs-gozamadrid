import Head from "next/head";
import GuiaCompraInmuebles from "@/components/Servicios/guiaCompraInmuebles";

export default function GuiaCompra() {
    const pageTitle = "Guía de Compra de Inmuebles en Madrid | Goza Madrid";
    const pageDescription = "Guía completa para comprar tu propiedad en Madrid. Descubre el proceso paso a paso, consejos de expertos, trámites legales y financiación. Todo lo que necesitas saber para una compra segura y exitosa.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://gozamadrid.com/servicios/residentes-espana/guia-compra" />

                {/* Open Graph */}
                <meta property="og:type" content="article" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:image" content="https://gozamadrid.com/img/guia-compra.jpg" />
                <meta property="og:url" content="https://gozamadrid.com/servicios/residentes-espana/guia-compra" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />
                <meta name="twitter:image" content="https://gozamadrid.com/img/guia-compra.jpg" />

                {/* Schema.org Guide */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "Article",
                        "mainEntityOfPage": {
                            "@type": "WebPage",
                            "@id": "https://gozamadrid.com/servicios/residentes-espana/guia-compra"
                        },
                        "headline": "Guía Completa para Comprar Inmuebles en Madrid",
                        "description": pageDescription,
                        "image": "https://gozamadrid.com/img/guia-compra.jpg",
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
                            "name": "Compra de Inmuebles",
                            "description": "Proceso de compra de propiedades inmobiliarias en Madrid"
                        },
                        "articleSection": "Guías Inmobiliarias",
                        "keywords": "compra inmuebles madrid, guía compra casa, proceso compra vivienda, asesoría inmobiliaria madrid"
                    })}
                </script>

                {/* Schema.org HowTo */}
                <script type="application/ld+json">
                    {JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "HowTo",
                        "name": "Cómo Comprar una Propiedad en Madrid",
                        "description": "Guía paso a paso para comprar tu propiedad en Madrid de manera segura y eficiente",
                        "step": [
                            {
                                "@type": "HowToStep",
                                "name": "Evaluación Financiera",
                                "text": "Determinar presupuesto y opciones de financiación"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Búsqueda de Propiedad",
                                "text": "Identificar y visitar propiedades que cumplan con tus requisitos"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Due Diligence",
                                "text": "Verificación legal y técnica de la propiedad"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Negociación",
                                "text": "Acuerdo de términos y precio con el vendedor"
                            },
                            {
                                "@type": "HowToStep",
                                "name": "Cierre",
                                "text": "Firma de escrituras y registro de la propiedad"
                            }
                        ],
                        "totalTime": "P90D"
                    })}
                </script>

                {/* Metadatos adicionales */}
                <meta name="keywords" content="guía compra inmuebles madrid, comprar casa madrid, proceso compra vivienda, asesoría inmobiliaria, trámites compra inmueble" />
                <meta name="geo.region" content="ES-M" />
                <meta name="geo.placename" content="Madrid" />
                <meta name="geo.position" content="40.4168;-3.7038" />
                <meta name="ICBM" content="40.4168, -3.7038" />
                <meta name="article:published_time" content="2024-01-01" />
                <meta name="article:modified_time" content="2024-01-01" />
                <meta name="article:section" content="Guías Inmobiliarias" />
                <meta name="article:tag" content="Compra Inmuebles" />
            </Head>

            <div className="relative min-h-screen">
                {/* Fondo fijo */}
                <div
                    className="fixed inset-0 z-0"
                    style={{
                        backgroundImage: "url('/gozamadridwp.jpg')",
                        backgroundAttachment: "fixed",
                        backgroundSize: "cover",
                        backgroundPosition: "center",
                    }}
                />
                
                {/* Contenedor principal con z-index superior */}
                <div className="relative z-10">
                    <div className="container mx-auto px-4 py-16">
                        <GuiaCompraInmuebles />
                    </div>
                </div>
            </div>
        </>
    );
}