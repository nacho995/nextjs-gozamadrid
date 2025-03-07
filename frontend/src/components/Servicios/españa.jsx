"use client";

import Link from 'next/link';
import { FaHome, FaHandshake } from 'react-icons/fa';
import Head from 'next/head';

export default function ServiciosEspaña() {
    // Schema.org structured data for real estate services
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "RealEstateAgent",
        "name": "Goza Madrid - Servicios Inmobiliarios para Residentes en España",
        "description": "Servicios especializados para propietarios residentes en España: alquileres turísticos y guía de compra de propiedades con asesoramiento integral.",
        "url": "https://www.gozamadrid.com/servicios/residentes-espana",
        "knowsAbout": ["Alquiler turístico en España", "Compra de propiedades en Madrid", "Asesoramiento inmobiliario"],
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Alquiler temporal para turistas",
                    "description": "Maximiza la rentabilidad de tu propiedad con alquileres vacacionales. Gestionamos todo el proceso, desde la promoción hasta la atención al huésped."
                }
            },
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Guía de compra de propiedades",
                    "description": "Te acompañamos en todo el proceso de compra, desde la búsqueda hasta la firma. Asesoramiento legal, fiscal y financiero personalizado."
                }
            }
        ]
    };

    const services = [
        {
            id: 'alquiler-turistico',
            icon: <FaHome className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" aria-hidden="true" />,
            title: "Alquiler temporal para turistas",
            description: "Maximiza la rentabilidad de tu propiedad con alquileres vacacionales. Gestionamos todo el proceso, desde la promoción hasta la atención al huésped.",
            url: "/servicios/residentes-espana/alquiler"
        },
        {
            id: 'guia-compra',
            icon: <FaHandshake className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" aria-hidden="true" />,
            title: "Guía de compra de propiedades",
            description: "Te acompañamos en todo el proceso de compra, desde la búsqueda hasta la firma. Asesoramiento legal, fiscal y financiero personalizado.",
            url: "/servicios/residentes-espana/guia-compra"
        }
    ];

    return (
        <>
            <Head>
                <title>Servicios Inmobiliarios para Residentes en España | Goza Madrid</title>
                <meta name="description" content="Servicios especializados para propietarios en España: gestión de alquileres turísticos y asesoramiento completo para compra de propiedades en Madrid." />
                <meta name="keywords" content="alquiler turístico madrid, gestión apartamentos turísticos, compra viviendas madrid, asesoramiento inmobiliario españa, inversión inmobiliaria" />
                <link rel="canonical" href="https://www.gozamadrid.com/servicios/residentes-espana" />
                <meta property="og:title" content="Servicios Inmobiliarios para Residentes en España | Goza Madrid" />
                <meta property="og:description" content="Maximiza la rentabilidad de tu propiedad con alquileres vacacionales y recibe asesoramiento experto en compra de viviendas en Madrid." />
                <meta property="og:url" content="https://www.gozamadrid.com/servicios/residentes-espana" />
                <meta property="og:type" content="website" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </Head>

            <section itemScope itemType="https://schema.org/RealEstateAgent" className="container mx-auto py-4">
                <meta itemProp="name" content="Goza Madrid - Servicios Inmobiliarios para Residentes en España" />
                <meta itemProp="description" content="Servicios especializados para propietarios residentes en España: alquileres turísticos y guía de compra de propiedades con asesoramiento integral." />
                
                {/* Hidden h1 for SEO, but visually hidden */}
                <h1 className="sr-only">Servicios Inmobiliarios para Residentes en España</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {services.map(service => (
                        <article 
                            key={service.id} 
                            className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full"
                            itemProp="makesOffer" 
                            itemScope 
                            itemType="https://schema.org/Offer"
                        >
                            <Link 
                                href={service.url} 
                                className="flex flex-col items-center p-4 group h-full justify-between"
                                aria-label={`Ver detalles sobre ${service.title}`}
                            >
                                {service.icon}
                                <h3 className="text-xl font-semibold mb-3" itemProp="itemOffered" itemScope itemType="https://schema.org/Service">
                                    <span itemProp="name">{service.title}</span>
                                </h3>
                                <p className="text-base md:text-lg max-w-sm" itemProp="description">
                                    {service.description}
                                </p>
                            </Link>
                        </article>
                    ))}
                </div>
            </section>
        </>
    );
}
