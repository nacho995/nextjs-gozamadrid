"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSearch, FaFileContract, FaHandshake, FaEuroSign, FaCalculator, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import FadeInView from '../animations/FadeInView';
import Head from 'next/head';

const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)' };

export default function GuiaCompraInmuebles() {
    return (
        <main className="guia-compra-inmuebles relative w-full" itemScope itemType="https://schema.org/RealEstateAgent">
            <Head>
                <title>Guía Completa para Comprar Inmuebles en España | Asesoramiento Experto</title>
                <meta 
                    name="description" 
                    content="Guía definitiva para comprar propiedades en España. Asesoramiento experto en cada paso: búsqueda, financiación, legal, fiscal. Más de 10 años de experiencia en el mercado inmobiliario español." 
                />
                <meta 
                    name="keywords" 
                    content="comprar inmueble España, guía compra vivienda, asesoramiento inmobiliario, proceso compra casa, inversión inmobiliaria, propiedades España" 
                />
                <meta property="og:title" content="Guía Completa para Comprar Inmuebles en España" />
                <meta property="og:description" content="Asesoramiento experto para comprar propiedades en España. Proceso paso a paso con profesionales inmobiliarios." />
                <meta property="og:image" content="/guiacompra.png" />
                <link rel="canonical" href="https://gozamadrid.com/servicios/guia-compra-inmuebles" />
            </Head>

            <div className="min-h-screen py-16">
                {/* Hero Section con animación */}
                <FadeInView direction="down" className="mb-16">
                    <section className="relative h-[60vh] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300" aria-label="Introducción a la guía de compra">
                        <div className="absolute inset-0 z-[1]">
                            <Image
                                src="/guiacompra.png"
                                alt="Guía completa para comprar inmuebles en España - Imagen representativa del proceso de compra"
                                fill
                                className="object-cover"
                                priority
                                itemProp="image"
                            />
                        </div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center z-[2]"
                        >
                            <div className="text-white ml-12 max-w-2xl relative z-[3]">
                                <h1 
                                    className="text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                                    style={textShadowStyle}
                                    itemProp="name"
                                >
                                    Guía Completa para Comprar tu Inmueble en España
                                </h1>
                                <p 
                                    className="text-xl" 
                                    style={textShadowLightStyle}
                                    itemProp="description"
                                >
                                    Asesoramiento experto y personalizado en cada etapa del proceso de compra inmobiliaria. 
                                    Más de 10 años de experiencia en el mercado español.
                                </p>
                            </div>
                        </motion.div>
                    </section>
                </FadeInView>

                {/* Pasos del Proceso */}
                <section 
                    className="mb-20"
                    aria-label="Proceso de compra paso a paso"
                    itemScope 
                    itemType="https://schema.org/HowTo"
                >
                    <h2 
                        className="text-3xl font-bold text-center mb-12 hover:scale-105 transition-all duration-300"
                        style={textShadowStyle}
                        itemProp="name"
                    >
                        Proceso de Compra Inmobiliaria Paso a Paso
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FaSearch className="text-4xl text-amarillo" />,
                                title: "Búsqueda y Selección de Propiedades",
                                desc: "Análisis personalizado de tus necesidades y presupuesto para encontrar las propiedades ideales que cumplan tus criterios de inversión."
                            },
                            {
                                icon: <FaCalculator className="text-4xl text-amarillo" />,
                                title: "Análisis Financiero y Viabilidad",
                                desc: "Evaluación detallada de la viabilidad económica, cálculo de gastos asociados y asesoramiento sobre las mejores opciones de financiación hipotecaria."
                            },
                            {
                                icon: <FaFileContract className="text-4xl text-amarillo" />,
                                title: "Gestión Legal y Documentación",
                                desc: "Revisión exhaustiva de toda la documentación legal, verificación de cargas y garantía del cumplimiento normativo de la propiedad."
                            },
                            {
                                icon: <FaHandshake className="text-4xl text-amarillo" />,
                                title: "Negociación Profesional",
                                desc: "Negociación experta para conseguir las mejores condiciones y precio para tu inversión inmobiliaria, protegiendo tus intereses."
                            },
                            {
                                icon: <FaEuroSign className="text-4xl text-amarillo" />,
                                title: "Asesoramiento Fiscal",
                                desc: "Orientación especializada sobre impuestos, deducciones fiscales y estructuración óptima de tu inversión inmobiliaria."
                            },
                            {
                                icon: <FaShieldAlt className="text-4xl text-amarillo" />,
                                title: "Protección del Comprador",
                                desc: "Garantizamos la protección de tus intereses durante todo el proceso de compra, desde la reserva hasta la escrituración."
                            }
                        ].map((step, index) => (
                            <motion.article
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                                itemProp="step"
                                itemScope
                                itemType="https://schema.org/HowToStep"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4 transform hover:scale-110 transition-transform duration-300" aria-hidden="true">
                                        {step.icon}
                                    </div>
                                    <h3 
                                        className="text-xl font-bold mb-3"
                                        style={textShadowStyle}
                                        itemProp="name"
                                    >
                                        {step.title}
                                    </h3>
                                    <p 
                                        className="text-gray-600"
                                        style={textShadowLightStyle}
                                        itemProp="text"
                                    >
                                        {step.desc}
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>

                {/* Sección de Beneficios */}
                <section 
                    className="w-full relative mb-20 flex justify-center px-4 sm:px-6 lg:px-8"
                    aria-label="Beneficios de nuestro servicio"
                    itemScope
                    itemType="https://schema.org/Service"
                >
                    <motion.div 
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.8 }}
                        className="relative rounded-2xl overflow-hidden hover:scale-105 transition-all duration-300 
                            w-full sm:w-[80vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] 
                            bg-gradient-to-br from-black/80 to-black/40 backdrop-blur-md shadow-2xl"
                    >
                        <div className="relative h-[90vh] sm:h-[75vh] md:h-[60vh] lg:h-[55vh] xl:h-[50vh] w-full">
                            <Image
                                src="/beneficioscompra.png"
                                alt="Beneficios de nuestro servicio de asesoramiento inmobiliario"
                                fill
                                className="object-cover mix-blend-overlay"
                                priority
                                itemProp="image"
                            />
                            <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-white/10 to-transparent" />
                        </div>

                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-full max-w-4xl text-center p-4 sm:p-6 md:p-8 lg:p-12">
                                <h2 
                                    className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-4 sm:mb-6 md:mb-8 tracking-tight"
                                    style={{ 
                                        textShadow: "2px 2px 4px rgba(0,0,0,0.5)",
                                        letterSpacing: "-0.02em"
                                    }}
                                    itemProp="name"
                                >
                                    ¿Por qué Elegirnos como tu Asesor Inmobiliario en España?
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 md:gap-8 lg:gap-12 text-white">
                                    <FadeInView direction="left" delay={0.4}>
                                        <article className="hover:scale-105 transition-all duration-300 bg-white/5 p-4 sm:p-5 md:p-6 rounded-xl backdrop-blur-sm">
                                            <h3 
                                                className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 md:mb-4" 
                                                style={textShadowStyle}
                                                itemProp="serviceType"
                                            >
                                                Experiencia Comprobada en el Mercado Español
                                            </h3>
                                            <p 
                                                className="text-white/90 text-sm sm:text-base" 
                                                style={textShadowLightStyle}
                                                itemProp="description"
                                            >
                                                Más de una década de experiencia en el mercado inmobiliario español nos respalda. 
                                                Conocemos en profundidad cada aspecto del proceso y anticipamos cualquier posible obstáculo.
                                            </p>
                                        </article>
                                    </FadeInView>
                                    <FadeInView direction="right" delay={0.6}>
                                        <article className="hover:scale-105 transition-all duration-300 bg-white/5 p-4 sm:p-5 md:p-6 rounded-xl backdrop-blur-sm">
                                            <h3 
                                                className="text-xl sm:text-2xl font-bold mb-2 sm:mb-3 md:mb-4" 
                                                style={textShadowStyle}
                                                itemProp="serviceType"
                                            >
                                                Servicio Integral Inmobiliario
                                            </h3>
                                            <p 
                                                className="text-white/90 text-sm sm:text-base" 
                                                style={textShadowLightStyle}
                                                itemProp="description"
                                            >
                                                Gestionamos todo el proceso: desde la búsqueda inicial hasta la entrega de llaves. 
                                                Nos encargamos de cada detalle para que tu única preocupación sea elegir tu nueva propiedad en España.
                                            </p>
                                        </article>
                                    </FadeInView>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </section>

                {/* Sección Final CTA */}
                <section 
                    className="text-center max-w-3xl mx-auto relative z-[2]"
                    aria-label="Contacto y recursos adicionales"
                >
                    <FadeInView direction="up">
                        <div className="relative z-[3] bg-white/5 backdrop-blur-sm p-8 rounded-xl">
                            <h2 
                                className="text-3xl font-bold mb-6 hover:scale-105 transition-all duration-300"
                                style={textShadowStyle}
                            >
                                Inicia tu Proceso de Compra Inmobiliaria en España
                            </h2>
                            <motion.p 
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.2 }}
                                className="text-xl mb-8 hover:scale-105 transition-all duration-300"
                                style={textShadowLightStyle}
                            >
                                Nuestro equipo de asesores inmobiliarios especializados está preparado para 
                                ayudarte a encontrar y adquirir la propiedad perfecta en España. Solicita una 
                                consulta personalizada y descubre cómo podemos hacer tu proceso de compra 
                                más seguro y eficiente.
                            </motion.p>
                            <motion.div 
                                className="flex flex-col items-center gap-6"
                                initial={{ opacity: 0, scale: 0.9 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ delay: 0.4 }}
                            >
                                <motion.div
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <Link 
                                        href="/contacto" 
                                        className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/10 px-8 py-3 transition-all duration-300 hover:bg-black/20 backdrop-blur-sm"
                                        title="Solicitar asesoramiento inmobiliario personalizado"
                                    >
                                        <span className="relative text-lg font-semibold text-black">
                                            Solicitar Asesoramiento Inmobiliario
                                        </span>
                                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                    </Link>
                                </motion.div>

                                <motion.a 
                                    href="https://martalopezpedroza.exp-spain.com/1/descarga-de-guia-de-venta?t=20230526084141"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="mb-[10vh] group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/10 px-8 py-3 transition-all duration-300 hover:bg-black/20 backdrop-blur-sm"
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.3 }}
                                    title="Descargar guía completa de compra de inmuebles en España"
                                >
                                    <span className="relative text-lg font-semibold text-black">
                                        Descargar Guía Completa de Compra
                                    </span>
                                    <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                </motion.a>
                            </motion.div>
                        </div>
                    </FadeInView>
                </section>
            </div>

            {/* Schema.org structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "RealEstateAgent",
                    "name": "Guía de Compra Inmobiliaria en España",
                    "description": "Servicio integral de asesoramiento para la compra de propiedades en España, incluyendo búsqueda, análisis financiero, gestión legal y fiscal.",
                    "image": "/guiacompra.png",
                    "areaServed": {
                        "@type": "Country",
                        "name": "España"
                    },
                    "hasOfferCatalog": {
                        "@type": "OfferCatalog",
                        "name": "Servicios de Asesoramiento Inmobiliario",
                        "itemListElement": [
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Búsqueda y Selección de Propiedades",
                                    "description": "Análisis personalizado y búsqueda de propiedades según criterios específicos"
                                }
                            },
                            {
                                "@type": "Offer",
                                "itemOffered": {
                                    "@type": "Service",
                                    "name": "Asesoramiento Legal y Fiscal",
                                    "description": "Gestión completa de documentación legal y optimización fiscal en la compra de inmuebles"
                                }
                            }
                        ]
                    },
                    "knowsAbout": [
                        "Mercado inmobiliario español",
                        "Proceso de compra de propiedades",
                        "Legislación inmobiliaria española",
                        "Fiscalidad inmobiliaria"
                    ]
                })
            }} />
        </main>
    );
}
