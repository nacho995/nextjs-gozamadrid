"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaSearch, FaFileContract, FaHandshake, FaEuroSign, FaCalculator, FaShieldAlt } from 'react-icons/fa';
import Link from 'next/link';
import FadeInView from '../animations/FadeInView';


const textShadowStyle = { textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' };
const textShadowLightStyle = { textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' };

export default function GuiaCompraInmuebles() {
    return (
        <div className="container mx-auto py-8">
            {/* Hero Section con animación */}
            <FadeInView direction="down" className="mb-16">
                <div className="relative h-[60vh] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                    <Image
                        src="/guiacompra.png"
                        alt="Guía de Compra"
                        fill
                        className="object-cover"
                    />
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 bg-gradient-to-r from-black/70 to-transparent flex items-center"
                    >
                        <div className="text-white ml-12 max-w-2xl">
                            <h1 
                                className="text-5xl font-bold mb-4 hover:scale-105 transition-transform duration-300 inline-block"
                                style={textShadowStyle}
                            >
                                Guía Completa para Comprar tu Inmueble
                            </h1>
                            <p 
                                className="text-xl"
                                style={textShadowLightStyle}
                            >
                                Te acompañamos en cada paso del proceso de compra con asesoramiento experto y personalizado
                            </p>
                        </div>
                    </motion.div>
                </div>
            </FadeInView>

            {/* Pasos del Proceso */}
            <div className="mb-20">
                <h2 
                    className="text-3xl font-bold text-center mb-12 hover:scale-105 transition-all duration-300"
                    style={textShadowStyle}
                >
                    Proceso de Compra Paso a Paso
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <FaSearch className="text-4xl text-amarillo" />,
                            title: "Búsqueda y Selección",
                            desc: "Analizamos tus necesidades y presupuesto para encontrar las propiedades que mejor se ajusten a tus criterios."
                        },
                        {
                            icon: <FaCalculator className="text-4xl text-amarillo" />,
                            title: "Análisis Financiero",
                            desc: "Evaluamos la viabilidad económica, calculamos gastos asociados y te asesoramos sobre las mejores opciones de financiación."
                        },
                        {
                            icon: <FaFileContract className="text-4xl text-amarillo" />,
                            title: "Gestión Legal",
                            desc: "Revisamos toda la documentación y garantizamos que la propiedad cumple con todos los requisitos legales."
                        },
                        {
                            icon: <FaHandshake className="text-4xl text-amarillo" />,
                            title: "Negociación",
                            desc: "Negociamos en tu nombre para conseguir las mejores condiciones y precio para tu inversión."
                        },
                        {
                            icon: <FaEuroSign className="text-4xl text-amarillo" />,
                            title: "Fiscalidad",
                            desc: "Te asesoramos sobre impuestos, deducciones y la mejor estructura para optimizar tu inversión."
                        },
                        {
                            icon: <FaShieldAlt className="text-4xl text-amarillo" />,
                            title: "Protección",
                            desc: "Aseguramos que todos tus intereses estén protegidos durante todo el proceso de compra."
                        }
                    ].map((step, index) => (
                        <motion.div
                            key={index}
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition-all duration-300"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="mb-4 transform hover:scale-110 transition-transform duration-300">
                                    {step.icon}
                                </div>
                                <h3 
                                    className="text-xl font-bold mb-3"
                                    style={textShadowStyle}
                                >
                                    {step.title}
                                </h3>
                                <p 
                                    className="text-gray-600"
                                    style={textShadowLightStyle}
                                >
                                    {step.desc}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>

            {/* Sección de Beneficios con animación */}
            <motion.div 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                className="relative rounded-2xl overflow-hidden mb-20 hover:scale-105 transition-all duration-300"
            >
                <Image
                    src="/beneficioscompra.png"
                    alt="Beneficios"
                    width={1200}
                    height={400}
                    className="object-cover w-full h-[400px]"
                />
                <motion.div 
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                >
                    <div className="max-w-4xl text-center p-8">
                        <h2 
                            className="text-4xl font-bold text-white mb-6"
                            style={textShadowStyle}
                        >
                            ¿Por qué elegirnos como tu asesor inmobiliario?
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-white">
                            <FadeInView direction="left" delay={0.4}>
                                <div className="hover:scale-105 transition-all duration-300">
                                    <h3 className="text-xl font-bold mb-3" style={textShadowStyle}>
                                        Experiencia Comprobada
                                    </h3>
                                    <p style={textShadowLightStyle}>
                                        Más de 10 años en el mercado inmobiliario español nos avalan. 
                                        Conocemos cada detalle del proceso y anticipamos cualquier obstáculo.
                                    </p>
                                </div>
                            </FadeInView>
                            <FadeInView direction="right" delay={0.6}>
                                <div className="hover:scale-105 transition-all duration-300">
                                    <h3 className="text-xl font-bold mb-3" style={textShadowStyle}>
                                        Servicio Integral
                                    </h3>
                                    <p style={textShadowLightStyle}>
                                        Desde la búsqueda inicial hasta la entrega de llaves, 
                                        nos encargamos de todo para que tu única preocupación sea elegir tu nueva propiedad.
                                    </p>
                                </div>
                            </FadeInView>
                        </div>
                    </div>
                </motion.div>
            </motion.div>

            {/* Sección Final CTA con animación */}
            <FadeInView direction="up" className="text-center max-w-3xl mx-auto">
                <h2 
                    className="text-3xl font-bold mb-6 hover:scale-105 transition-all duration-300"
                    style={textShadowStyle}
                >
                    Comienza tu Proceso de Compra
                </h2>
                <motion.p 
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 }}
                    className="text-xl mb-8 hover:scale-105 transition-all duration-300"
                    style={textShadowLightStyle}
                >
                    Nuestro equipo de expertos está listo para ayudarte a encontrar 
                    y adquirir la propiedad perfecta. Contacta con nosotros para una 
                    consulta personalizada y descubre cómo podemos hacer tu proceso 
                    de compra más fácil y seguro.
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
                        >
                            <span className="relative text-lg font-semibold text-black">
                                Solicitar Asesoramiento
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
                    >
                        <span className="relative text-lg font-semibold text-black">
                            Ver Guía Completa
                        </span>
                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                    </motion.a>
                </motion.div>
            </FadeInView>
        </div>
    );
}
