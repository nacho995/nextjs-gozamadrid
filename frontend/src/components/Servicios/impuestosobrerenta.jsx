"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalculator, FaFileAlt, FaHandshake, FaGlobe, FaPercent, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import FadeInView from '../animations/FadeInView';
import Head from 'next/head';

const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };

export default function ImpuestoSobreRenta() {
    return (
        <main className="impuesto-renta-page relative z-[1]" itemScope itemType="https://schema.org/Service">
            <Head>
                <title>Impuesto sobre la Renta No Residentes (IRNR) | Asesoría Fiscal España</title>
                <meta 
                    name="description" 
                    content="Gestión integral del Modelo 210 para no residentes en España. Asesoramiento fiscal especializado, cálculo de impuestos y tramitación completa del IRNR. Expertos en fiscalidad internacional." 
                />
                <meta 
                    name="keywords" 
                    content="IRNR España, Modelo 210, impuestos no residentes, asesoría fiscal España, tributación no residentes, declaración renta extranjeros" 
                />
                <meta property="og:title" content="Gestión del Impuesto sobre la Renta para No Residentes en España" />
                <meta property="og:description" content="Asesoramiento especializado en la gestión del IRNR y Modelo 210 para no residentes en España. Optimización fiscal y gestión completa." />
                <meta property="og:image" content="/impuesto.jpg" />
                <link rel="canonical" href="https://gozamadrid.com/servicios/impuesto-sobre-renta" />
            </Head>

            <div className="container mx-auto py-8">
                {/* Hero Section */}
                <FadeInView direction="down" className="mb-16 relative z-[2]">
                    <section className="relative h-[60vh] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300" aria-label="Introducción al IRNR">
                        <div className="absolute inset-0">
                            <Image
                                src="/impuesto.jpg"
                                alt="Asesoramiento fiscal para el Impuesto sobre la Renta de No Residentes en España"
                                fill
                                priority
                                className="object-cover"
                                itemProp="image"
                            />
                        </div>
                        <motion.div 
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1 }}
                            className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center z-[2]"
                        >
                            <div className="text-white ml-12 max-w-2xl">
                                <h1 
                                    className="text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                                    style={textShadowStyle}
                                    itemProp="name"
                                >
                                    Impuesto sobre la Renta para No Residentes (IRNR)
                                </h1>
                                <p 
                                    className="text-xl"
                                    itemProp="description"
                                >
                                    Gestión integral del Modelo 210 y asesoramiento fiscal especializado para no residentes en España
                                </p>
                            </div>
                        </motion.div>
                    </section>
                </FadeInView>

                {/* Información Principal */}
                <section className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16 relative z-[2]" aria-label="Información esencial sobre el IRNR">
                    <motion.article 
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                        itemScope
                        itemType="https://schema.org/Article"
                    >
                        <h2 
                            className="text-2xl font-bold mb-4 text-amarillo"
                            itemProp="headline"
                        >
                            ¿Qué es el Modelo 210 del IRNR?
                        </h2>
                        <div 
                            className="text-gray-700"
                            itemProp="articleBody"
                        >
                            <p>
                                El Modelo 210 es la declaración oficial obligatoria para la tributación de rentas 
                                obtenidas en España por contribuyentes no residentes sin establecimiento permanente. 
                                Implementado desde 2011, este formulario garantiza:
                            </p>
                            <ul className="mt-4 space-y-2">
                                <li>• Correcta tributación de rentas inmobiliarias</li>
                                <li>• Declaración de alquileres y ganancias patrimoniales</li>
                                <li>• Cumplimiento de obligaciones fiscales internacionales</li>
                            </ul>
                        </div>
                    </motion.article>

                    <motion.article 
                        initial={{ opacity: 0, x: 50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                        itemScope
                        itemType="https://schema.org/Article"
                    >
                        <h2 
                            className="text-2xl font-bold mb-4 text-amarillo"
                            itemProp="headline"
                        >
                            Tipos de Gravamen del IRNR
                        </h2>
                        <div 
                            className="space-y-4 text-gray-700"
                            itemProp="articleBody"
                        >
                            <ul className="space-y-2">
                                <li className="flex items-center">
                                    <FaPercent className="text-amarillo mr-2" aria-hidden="true" />
                                    <strong>19% - Residentes UE/EEE:</strong> Aplicable a residentes en la Unión Europea, 
                                    Noruega e Islandia
                                </li>
                                <li className="flex items-center">
                                    <FaPercent className="text-amarillo mr-2" aria-hidden="true" />
                                    <strong>24% - Resto de países:</strong> Aplicable a residentes fuera del espacio 
                                    económico europeo
                                </li>
                            </ul>
                            <p className="mt-4">
                                Los tipos pueden variar según convenios de doble imposición y naturaleza de las rentas.
                            </p>
                        </div>
                    </motion.article>
                </section>

                {/* Servicios Específicos */}
                <section 
                    className="mb-16 relative z-[2]"
                    aria-label="Servicios de asesoramiento fiscal"
                    itemScope
                    itemType="https://schema.org/Service"
                >
                    <h2 
                        className="text-3xl font-bold text-center mb-12 hover:scale-105 transition-all duration-300"
                        itemProp="name"
                    >
                        Servicios Especializados de Asesoramiento Fiscal Internacional
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            {
                                icon: <FaCalculator className="text-4xl text-amarillo" />,
                                title: "Cálculo y Optimización de Impuestos",
                                desc: "Determinación precisa de la base imponible y cuota tributaria. Análisis de deducciones y beneficios fiscales aplicables."
                            },
                            {
                                icon: <FaFileAlt className="text-4xl text-amarillo" />,
                                title: "Gestión Documental del IRNR",
                                desc: "Tramitación completa del Modelo 210, certificados de residencia fiscal y toda la documentación relacionada con el IRNR."
                            },
                            {
                                icon: <FaGlobe className="text-4xl text-amarillo" />,
                                title: "Convenios de Doble Imposición",
                                desc: "Aplicación de convenios internacionales para evitar la doble imposición y optimizar la carga fiscal global."
                            }
                        ].map((service, index) => (
                            <motion.article
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                                itemScope
                                itemType="https://schema.org/Service"
                            >
                                <div className="flex flex-col items-center text-center">
                                    <div className="mb-4" aria-hidden="true">{service.icon}</div>
                                    <h3 
                                        className="text-xl font-bold mb-3"
                                        itemProp="name"
                                    >
                                        {service.title}
                                    </h3>
                                    <p 
                                        className="text-gray-600"
                                        itemProp="description"
                                    >
                                        {service.desc}
                                    </p>
                                </div>
                            </motion.article>
                        ))}
                    </div>
                </section>

                {/* CTA Final */}
                <section 
                    className="relative z-[2]"
                    aria-label="Contacto para asesoramiento fiscal"
                >
                    <FadeInView direction="up">
                        <div className="text-center max-w-3xl mx-auto mb-[10vh]">
                            <h2 className="text-3xl font-bold mb-6 hover:scale-105 transition-all duration-300">
                                Optimiza tu Tributación Internacional
                            </h2>
                            <p className="text-xl mb-8 hover:scale-105 transition-all duration-300">
                                Nuestro equipo de expertos en fiscalidad internacional te ayudará a gestionar 
                                tus obligaciones tributarias en España de manera eficiente y segura, garantizando 
                                el cumplimiento normativo y la optimización fiscal.
                            </p>
                            <motion.div
                                whileHover={{ scale: 1.05 }}
                                transition={{ duration: 0.3 }}
                            >
                                <Link 
                                    href="/contacto" 
                                    className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full 
                                        bg-black/10 px-8 py-3 transition-all duration-300 hover:bg-black/20 backdrop-blur-sm"
                                    title="Solicitar asesoramiento fiscal especializado para no residentes"
                                >
                                    <span className="relative text-lg font-semibold text-black">
                                        Solicitar Asesoramiento Fiscal Especializado
                                    </span>
                                    <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                        bg-gradient-to-r from-amarillo via-black to-amarillo 
                                        transition-transform duration-300 group-hover:translate-x-full"
                                        aria-hidden="true"
                                    >
                                    </span>
                                </Link>
                            </motion.div>
                        </div>
                    </FadeInView>
                </section>
            </div>

            {/* Schema.org structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Service",
                    "name": "Asesoramiento Fiscal IRNR",
                    "description": "Servicio especializado de gestión y asesoramiento para el Impuesto sobre la Renta de No Residentes (IRNR) en España",
                    "provider": {
                        "@type": "Organization",
                        "name": "Goza Madrid",
                        "areaServed": {
                            "@type": "Country",
                            "name": "España"
                        }
                    },
                    "serviceType": "Asesoría Fiscal Internacional",
                    "offers": {
                        "@type": "Offer",
                        "itemOffered": [
                            {
                                "@type": "Service",
                                "name": "Gestión Modelo 210",
                                "description": "Tramitación completa del Modelo 210 para no residentes"
                            },
                            {
                                "@type": "Service",
                                "name": "Optimización Fiscal",
                                "description": "Asesoramiento para la optimización de la carga tributaria"
                            },
                            {
                                "@type": "Service",
                                "name": "Convenios Internacionales",
                                "description": "Aplicación de convenios de doble imposición"
                            }
                        ]
                    },
                    "knowsAbout": [
                        "Fiscalidad internacional",
                        "IRNR España",
                        "Modelo 210",
                        "Convenios doble imposición",
                        "Tributación no residentes"
                    ]
                })
            }} />
        </main>
    );
}
