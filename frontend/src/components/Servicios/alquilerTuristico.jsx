"use client";

import Image from 'next/image';
import { motion } from 'framer-motion';
import { FaCalendarAlt, FaEuroSign, FaChartLine, FaHandshake } from 'react-icons/fa';
import { useState } from 'react';

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

    return (
        <div className="container mx-auto py-8">
            {/* Hero Section */}
            <div className="relative h-[60vh] mb-16 rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <Image
                    src="/real-estate.jpg"
                    alt="Alquiler Turístico"
                    fill
                    className="object-cover"
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
                            Maximiza el potencial de tu propiedad con nuestra gestión integral de alquileres vacacionales
                        </p>
                    </div>
                </div>
            </div>

            {/* Beneficios Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                {[
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
                ].map((item, index) => (
                    <motion.div
                        key={index}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        whileHover={{ scale: 1.05 }}
                        transition={{ duration: 0.3 }}
                        className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer"
                    >
                        <div className="mb-4 hover:scale-110 transition-transform duration-300">{item.icon}</div>
                        <h3 className="text-lg sm:text-xl md:text-2xl font-bold mb-1 sm:mb-2" style={textShadowStyle}>{item.title}</h3>
                        <p className="text-xs sm:text-sm md:text-base" style={textShadowLightStyle}>{item.desc}</p>
                    </motion.div>
                ))}
            </div>

            {/* Sección de Imágenes con Texto */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                >
                    <Image
                        src="/AirbnbEspaña.jpg"
                        alt="Airbnb en España"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <div className="text-white">
                            <h3 
                                className="text-2xl font-bold mb-2 hover:scale-105 transition-transform duration-300 inline-block"
                                style={textShadowStyle}
                            >
                                Presencia en Airbnb
                            </h3>
                            <p style={textShadowLightStyle}>
                                Maximiza tu visibilidad en la plataforma líder de alquileres vacacionales
                            </p>
                        </div>
                    </div>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.3 }}
                    className="relative h-[400px] rounded-2xl overflow-hidden cursor-pointer"
                >
                    <Image
                        src="/alquileresEspaña.jpg"
                        alt="Alquileres en España"
                        fill
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-6">
                        <div className="text-white">
                            <h3 
                                className="text-2xl font-bold mb-2 hover:scale-105 transition-transform duration-300 inline-block"
                                style={textShadowStyle}
                            >
                                Gestión Profesional
                            </h3>
                            <p style={textShadowLightStyle}>
                                Servicio integral que incluye limpieza, mantenimiento y atención al huésped
                            </p>
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Sección Final */}
            <div className="relative h-[80vh] rounded-2xl overflow-hidden hover:scale-[1.02] transition-all duration-300">
                <Image
                    src="/AlquilerTuristicoEspaña.jpg"
                    alt="Alquiler Turístico en España"
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
                        <p 
                            className="text-sm sm:text-base md:text-lg lg:text-xl text-white/90"
                            style={textShadowLightStyle}
                        >
                            Nuestro equipo de expertos se encarga de todo el proceso, desde la 
                            promoción y gestión de reservas hasta la atención al huésped y 
                            mantenimiento de la propiedad. Optimizamos los precios según la 
                            temporada y la demanda para maximizar tu rentabilidad.
                        </p>
                    </div>
                </div>
            </div>

            {/* Nueva Sección de Tarjetas Giratorias */}
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
                        {[
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
                        ].map((card, index) => (
                            <div 
                                key={index}
                                className="relative h-[400px] group [perspective:1000px]"
                                onClick={() => handleCardClick(index)}
                            >
                                <div className={`absolute inset-0 w-full h-full transition-all duration-500 [transform-style:preserve-3d] 
                                    ${flippedCards[index] ? '[transform:rotateY(180deg)]' : ''} 
                                    lg:group-hover:[transform:rotateY(180deg)]`}
                                >
                                    {/* Cara Frontal */}
                                    <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                                            <Image
                                                src="/fondoamarillo.jpg"
                                                alt={card.title}
                                                fill
                                                className="object-cover"
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
                                                Toca para más info
                                            </div>
                                        </div>
                                    </div>

                                    {/* Cara Trasera */}
                                    <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                                            <Image
                                                src="/fondonegro.jpg"
                                                alt="Background"
                                                fill
                                                className="object-cover"
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
        </div>
    );
}
