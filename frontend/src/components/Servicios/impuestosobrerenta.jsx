"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalculator, FaFileAlt, FaHandshake, FaGlobe, FaPercent, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import FadeInView from '../animations/FadeInView';

const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };

export default function ImpuestoSobreRenta() {
    return (
        <div className="container mx-auto py-8">
            {/* Hero Section */}
            <FadeInView direction="down" className="mb-16">
                <div className="relative h-[60vh] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                    <Image
                        src="/impuesto.jpg"
                        alt="Impuestos No Residentes"
                        fill
                        priority
                        className="object-cover"
                    />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent flex items-center"
                    >
                        <div className="text-white ml-12 max-w-2xl">
                            <h1 
                                className="text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                                style={textShadowStyle}
                            >
                                Impuesto sobre la Renta para No Residentes
                            </h1>
                            <p className="text-xl">
                                Gestión integral del Modelo 210 y asesoramiento fiscal especializado
                            </p>
                        </div>
                    </motion.div>
                </div>
            </FadeInView>

            {/* Información Principal */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                <motion.div 
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                >
                    <h2 className="text-2xl font-bold mb-4 text-amarillo">¿Qué es el Modelo 210?</h2>
                    <p className="text-gray-700">
                        El Modelo 210 es el formulario oficial para la declaración de rentas obtenidas 
                        en España por no residentes sin establecimiento permanente. Es obligatorio 
                        desde 2011 para garantizar la correcta tributación de las rentas.
                    </p>
                </motion.div>

                <motion.div 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                >
                    <h2 className="text-2xl font-bold mb-4 text-amarillo">Tipos de Gravamen</h2>
                    <ul className="space-y-2 text-gray-700">
                        <li className="flex items-center">
                            <FaPercent className="text-amarillo mr-2" />
                            19% para residentes en UE, Noruega e Islandia
                        </li>
                        <li className="flex items-center">
                            <FaPercent className="text-amarillo mr-2" />
                            24% para residentes fuera de la UE
                        </li>
                    </ul>
                </motion.div>
            </div>

            {/* Servicios Específicos */}
            <div className="mb-16">
                <h2 className="text-3xl font-bold text-center mb-12 hover:scale-105 transition-all duration-300">
                    Nuestros Servicios de Asesoramiento Fiscal
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <FaCalculator className="text-4xl text-amarillo" />,
                            title: "Cálculo de Impuestos",
                            desc: "Determinación precisa de la base imponible y cuota tributaria."
                        },
                        {
                            icon: <FaFileAlt className="text-4xl text-amarillo" />,
                            title: "Gestión Documental",
                            desc: "Tramitación completa del Modelo 210 y documentación relacionada."
                        },
                        {
                            icon: <FaGlobe className="text-4xl text-amarillo" />,
                            title: "Convenios Internacionales",
                            desc: "Aplicación de convenios de doble imposición internacional."
                        }
                    ].map((service, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:scale-105 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4">{service.icon}</div>
                                <h3 className="text-xl font-bold mb-3">{service.title}</h3>
                                <p className="text-gray-600">{service.desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* CTA Final */}
            <FadeInView direction="up">
                <div className="text-center max-w-3xl mx-auto mb-[10vh]">
                    <h2 className="text-3xl font-bold mb-6 hover:scale-105 transition-all duration-300">
                        Optimiza tu Tributación
                    </h2>
                    <p className="text-xl mb-8 hover:scale-105 transition-all duration-300">
                        Nuestro equipo de expertos fiscales te ayudará a gestionar tus obligaciones 
                        tributarias de manera eficiente y segura.
                    </p>
                    <motion.div
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                    >
                        <Link 
                            href="/contacto" 
                            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full 
                                bg-black/10 px-8 py-3 transition-all duration-300 hover:bg-black/20 backdrop-blur-sm"
                        >
                            <span className="relative text-lg font-semibold text-black">
                                Solicitar Asesoramiento Fiscal
                            </span>
                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                bg-gradient-to-r from-amarillo via-black to-amarillo 
                                transition-transform duration-300 group-hover:translate-x-full">
                            </span>
                        </Link>
                    </motion.div>
                </div>
            </FadeInView>
        </div>
    );
}
