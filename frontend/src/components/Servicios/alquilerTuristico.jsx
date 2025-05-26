"use client";

import Image from "next/legacy/image";
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaEuroSign, FaChartLine, FaHandshake, FaMapMarkerAlt, FaUsers, FaCamera } from 'react-icons/fa';
import { useState } from 'react';
import Head from 'next/head';

const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' };

export default function AlquilerTuristico() {
    const [flippedCards, setFlippedCards] = useState({});

    const handleCardClick = (index) => {
        setFlippedCards(prev => ({
            ...prev,
            [index]: !prev[index]
        }));
    };

    // Schema.org structured data for vacation rental service
    const jsonLd = {
        "@context": "https://schema.org",
        "@type": "LodgingBusiness",
        "name": "Servicio de Alquiler Turístico en España",
        "description": "Gestión integral de propiedades para alquiler vacacional en España. Maximiza la rentabilidad de tu propiedad con nuestra gestión profesional.",
        "areaServed": {
            "@type": "Country",
            "name": "España"
        },
        "makesOffer": [
            {
                "@type": "Offer",
                "itemOffered": {
                    "@type": "Service",
                    "name": "Gestión de alquileres vacacionales",
                    "description": "Servicio completo de gestión de alquileres turísticos"
                }
            }
        ]
    };

    const benefitsData = [
        {
            icon: <FaCalendarAlt className="text-4xl text-amarillo" />,
            title: "Flexibilidad Total",
            desc: "Gestiona tus reservas según tus necesidades y disponibilidad"
        },
        {
            icon: <FaEuroSign className="text-4xl text-amarillo" />,
            title: "Mayor Rentabilidad",
            desc: "Obtén mejores ingresos que con el alquiler tradicional"
        },
        {
            icon: <FaChartLine className="text-4xl text-amarillo" />,
            title: "Gestión Profesional",
            desc: "Optimización continua de precios y ocupación"
        },
        {
            icon: <FaHandshake className="text-4xl text-amarillo" />,
            title: "Servicio Completo",
            desc: "Nos encargamos de todo el proceso"
        }
    ];

    const advantagesData = [
        {
            title: "Rentabilidad Superior",
            text: "Los alquileres vacacionales pueden generar hasta un 30% más de ingresos que los alquileres tradicionales, especialmente en ubicaciones turísticas premium."
        },
        {
            title: "Flexibilidad Total",
            text: "Decide cuándo quieres alquilar tu propiedad y cuándo usarla tú mismo. Mantén el control total sobre tu calendario y disponibilidad."
        },
        {
            title: "Gestión Profesional",
            text: "Nuestro equipo se encarga de todo: desde la limpieza y mantenimiento hasta la atención 24/7 a los huéspedes."
        },
        {
            title: "Marketing Digital",
            text: "Promocionamos tu propiedad en las principales plataformas de alquiler vacacional, optimizando su visibilidad y ocupación."
        },
        {
            title: "Precio Dinámico",
            text: "Ajustamos los precios según la temporada, eventos especiales y demanda del mercado para maximizar tus beneficios."
        },
        {
            title: "Seguridad Garantizada",
            text: "Verificamos cuidadosamente a todos los huéspedes y contamos con seguros específicos para alquiler vacacional."
        }
    ];

    return (
        <>
            <Head>
                <title>Alquiler Turístico en España | Gestión Integral de Alquileres Vacacionales</title>
                <meta name="description" content="Servicio profesional de gestión de alquiler turístico en España. Maximiza la rentabilidad de tu propiedad con nuestra gestión integral, marketing digital y atención personalizada." />
                <meta name="keywords" content="alquiler turístico, alquileres vacacionales España, gestión Airbnb, apartamentos turísticos, rentabilidad alquiler vacacional" />
                <link rel="canonical" href="https://www.realestategozamadrid.com/servicios/alquiler-turistico" />
                <meta property="og:title" content="Alquiler Turístico en España - Gestión Integral de Propiedades" />
                <meta property="og:description" content="Maximiza la rentabilidad de tu propiedad con nuestra gestión integral de alquileres vacacionales en España. Servicio completo para propietarios." />
                <meta property="og:url" content="https://www.realestategozamadrid.com/servicios/alquiler-turistico" />
                <meta property="og:type" content="website" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
                />
            </Head>

            <main className="container mx-auto py-8">
                {/* Hero Section */}
                <section aria-label="Introducción al alquiler turístico" className="hero-section">
                    <div className="relative h-[60vh] mb-16 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                        <Image
                            src="/real-estate.jpg"
                            alt="Alquiler turístico en España - apartamento vacacional con vistas"
                            fill
                            className="object-cover"
                            priority
                        />
                        <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center">
                            <div className="text-white ml-4 sm:ml-8 md:ml-12 max-w-2xl">
                                <h1 
                                    className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                                    style={textShadowStyle}
                                >
                                    Alquiler Turístico en España
                                </h1>
                                <p 
                                    className="text-sm sm:text-base md:text-lg lg:text-xl"
                                    style={textShadowLightStyle}
                                >
                                    Maximiza el potencial de tu propiedad con nuestra gestión integral de alquileres vacacionales en las principales ciudades turísticas
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Beneficios Grid */}
                <section aria-label="Beneficios de nuestro servicio" className="benefits-section">
                    <h2 className="sr-only">Beneficios de nuestro servicio de alquiler turístico</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                        {benefitsData.map((item, index) => (
                            <motion.article
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                                className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                            >
                                <div className="mb-4 hover:scale-110 transition-transform duration-300" aria-hidden="true">
                                    {item.icon}
                                </div>
                                <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2" style={textShadowStyle}>
                                    {item.title}
                                </h3>
                                <p className="text-xs sm:text-sm md:text-base" style={textShadowLightStyle}>
                                    {item.desc}
                                </p>
                            </motion.article>
                        ))}
                    </div>
                </section>

                {/* Sección de Imágenes con Texto */}
                <section aria-label="Plataformas y servicios" className="platforms-section">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                        <motion.article
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.3 }}
                            className="relative h-[400px] rounded-2xl overflow-hidden"
                        >
                            <Image
                                src="/AirbnbEspaña.jpg"
                                alt="Gestión de Airbnb en España - Maximiza tus reservas"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 
                                        className="text-2xl font-bold mb-2 hover:scale-105 transition-transform duration-300 inline-block"
                                        style={textShadowStyle}
                                    >
                                        Presencia en Airbnb y Booking
                                    </h3>
                                    <p style={textShadowLightStyle}>
                                        Maximiza tu visibilidad en las principales plataformas de alquileres vacacionales con anuncios optimizados y fotografías profesionales
                                    </p>
                                </div>
                            </div>
                        </motion.article>

                        <motion.article
                            initial={{ opacity: 0, x: 50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            whileHover={{ scale: 1.03 }}
                            transition={{ duration: 0.3 }}
                            className="relative h-[400px] rounded-2xl overflow-hidden"
                        >
                            <Image
                                src="/alquileresEspaña.jpg"
                                alt="Gestión profesional de alquileres turísticos en España"
                                fill
                                className="object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                                <div className="text-white">
                                    <h3 
                                        className="text-2xl font-bold mb-2 hover:scale-105 transition-transform duration-300 inline-block"
                                        style={textShadowStyle}
                                    >
                                        Gestión Profesional 360°
                                    </h3>
                                    <p style={textShadowLightStyle}>
                                        Servicio integral que incluye limpieza, mantenimiento, check-in digital y atención permanente al huésped
                                    </p>
                                </div>
                            </div>
                        </motion.article>
                    </div>
                </section>

                {/* Sección Informativa Principal */}
                <section aria-label="Información sobre nuestro servicio" className="main-info-section">
                    <div className="relative h-[80vh] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                        <Image
                            src="/AlquilerTuristicoEspaña.jpg"
                            alt="Gestión de alquiler turístico en España - Apartamentos vacacionales"
                            fill
                            className="object-cover"
                        />
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center text-center p-8">
                            <div className="max-w-3xl">
                                <h2 
                                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2 sm:mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                                    style={textShadowStyle}
                                >
                                    Maximiza el Potencial de tu Propiedad
                                </h2>
                                <div className="space-y-4">
                                    <p 
                                        className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90"
                                        style={textShadowLightStyle}
                                    >
                                        Nuestro equipo de expertos se encarga de todo el proceso, desde la 
                                        promoción y gestión de reservas hasta la atención al huésped y 
                                        mantenimiento de la propiedad.
                                    </p>
                                    <p 
                                        className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90"
                                        style={textShadowLightStyle}
                                    >
                                        Optimizamos los precios según la temporada y la demanda para maximizar tu rentabilidad, 
                                        aplicando estrategias dinámicas de precios basadas en datos del mercado turístico.
                                    </p>
                                </div>
                                <div className="flex justify-center space-x-6 mt-8">
                                    <div className="flex flex-col items-center text-white">
                                        <FaCamera className="text-3xl text-amarillo mb-2" aria-hidden="true" />
                                        <span className="text-sm sm:text-base">Fotografía profesional</span>
                                    </div>
                                    <div className="flex flex-col items-center text-white">
                                        <FaUsers className="text-3xl text-amarillo mb-2" aria-hidden="true" />
                                        <span className="text-sm sm:text-base">Atención 24/7</span>
                                    </div>
                                    <div className="flex flex-col items-center text-white">
                                        <FaMapMarkerAlt className="text-3xl text-amarillo mb-2" aria-hidden="true" />
                                        <span className="text-sm sm:text-base">Ubicaciones premium</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Sección de Tarjetas Giratorias de Ventajas */}
                <section aria-label="Ventajas del alquiler turístico" className="advantages-cards-section">
                    <div className="relative mt-20 mb-16 z-[9997]">
                        <div className="relative z-[9998] bg-gradient-to-b from-transparent via-white/5 to-transparent py-8">
                            <h2 
                                className="relative text-3xl sm:text-4xl md:text-5xl font-bold text-center mb-6 sm:mb-8 md:mb-12 z-[9999]"
                                style={{
                                    ...textShadowStyle,
                                    position: 'relative',
                                }}
                            >
                                Ventajas del Alquiler Turístico
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                                {advantagesData.map((card, index) => (
                                    <div 
                                        key={index}
                                        className="relative h-[400px] group [perspective:1000px]"
                                        onClick={() => handleCardClick(index)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' || e.key === ' ') {
                                                handleCardClick(index);
                                            }
                                        }}
                                        tabIndex={0}
                                        role="button"
                                        aria-label={`Ver información sobre ${card.title}`}
                                    >
                                        <div 
                                            className={`absolute inset-0 w-full h-full transition-all duration-500 [transform-style:preserve-3d] 
                                                ${flippedCards[index] ? '[transform:rotateY(180deg)]' : ''} 
                                                lg:group-hover:[transform:rotateY(180deg)]`}
                                            aria-hidden={flippedCards[index]}
                                        >
                                            {/* Cara Frontal */}
                                            <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                                                    <Image
                                                        src="/fondoamarillo.jpg"
                                                        alt="Servicio integral y personalizado para alquileres turísticos"
                                                        layout="fill"
                                                        className="object-cover rounded-xl"
                                                    />
                                                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                                                        <h3 
                                                            className="text-xl sm:text-2xl font-bold text-white text-center px-4 sm:px-6"
                                                            style={textShadowStyle}
                                                        >
                                                            {card.title}
                                                        </h3>
                                                    </div>
                                                    <div 
                                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-white text-xs sm:text-sm lg:hidden"
                                                        style={textShadowLightStyle}
                                                    >
                                                        Toca para más información
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Cara Trasera */}
                                            <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                                                <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                                                    <Image
                                                        src="/fondonegro.jpg"
                                                        alt="Fondo informativo"
                                                        layout="fill"
                                                        objectFit="cover"
                                                        quality={100}
                                                    />
                                                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-8">
                                                        <p 
                                                            className="text-white text-sm sm:text-base md:text-lg lg:text-xl text-center font-medium"
                                                            style={textShadowStyle}
                                                        >
                                                            {card.text}
                                                        </p>
                                                        <span 
                                                            className="mt-2 sm:mt-4 text-white/80 text-xs sm:text-sm lg:hidden"
                                                            style={textShadowLightStyle}
                                                        >
                                                            Toca para volver
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* CTA Section */}
                <section aria-label="Contacto" className="cta-section mt-16">
                    <div className="bg-white/5 backdrop-blur-sm rounded-xl p-8 text-center shadow-lg">
                        <h2 className="text-2xl sm:text-3xl font-bold mb-4" style={textShadowStyle}>
                            ¿Quieres maximizar los ingresos de tu propiedad?
                        </h2>
                        <p className="mb-8 max-w-3xl mx-auto" style={textShadowLightStyle}>
                            Contacta con nuestro equipo de expertos en alquileres turísticos y descubre cómo podemos ayudarte a optimizar la rentabilidad de tu propiedad.
                        </p>
                        <a 
                            href="/contacto" 
                            className="inline-block bg-gradient-to-r from-black via-amarillo to-black 
                            text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl 
                            transition-all duration-700 ease-in-out hover:scale-105"
                            aria-label="Contactar con nuestros especialistas en alquiler turístico"
                        >
                            Solicitar información
                        </a>
                    </div>
                </section>
            </main>
        </>
    );
}
