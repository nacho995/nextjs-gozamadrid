"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeInView from './animations/FadeInView';
import ScaleInView from './animations/ScaleInView';
import { FaHome, FaExchangeAlt, FaCity, FaMoneyBillWave, FaQuoteLeft, FaArrowRight } from "react-icons/fa";

const Eslogan = () => {
    return (
        <div className="relative w-full py-16 overflow-hidden">
            {/* Fondo con patrón sutil */}
            <div className="absolute inset-0 bg-neutral-100 dark:bg-gray-950 opacity-50 z-0">
                <div className="absolute inset-0" style={{ 
                    backgroundImage: 'radial-gradient(#D5AB6F 1px, transparent 1px)', 
                    backgroundSize: '30px 30px',
                    opacity: 0.2 
                }}></div>
            </div>
            
            <div className="container mx-auto px-4 relative z-10">
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-10 lg:gap-16 xl:gap-24">
                    <FadeInView direction="left" className="w-full lg:w-[60%]">
                        <div 
                            className="text-left p-6 sm:p-8 rounded-2xl shadow-xl relative overflow-hidden backdrop-blur-sm"
                            style={{
                                background: "linear-gradient(135deg, rgba(213,171,111,0.97) 0%, rgba(199,163,54,0.95) 100%)",
                                borderBottom: '3px solid rgba(0,0,0,0.15)',
                                borderRight: '3px solid rgba(0,0,0,0.15)',
                            }}
                        >
                            {/* Elementos decorativos */}
                            <div className="absolute -top-24 -right-24 w-48 h-48 bg-white/20 rounded-full blur-3xl"></div>
                            <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-black/10 rounded-full blur-3xl"></div>
                            
                            <div className="relative text-black z-20">
                                <div className="mb-8 inline-block opacity-90">
                                    <FaQuoteLeft className="text-4xl text-black/40" />
                                </div>
                                
                                <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-8 leading-tight">
                                    Cada propiedad, cada historia, <br className="hidden md:block" /> un método único.
                                </h2>
                                
                                <div className="space-y-6 text-black/90">
                                    <p className="text-lg leading-relaxed">
                                        Si estás heredando una vivienda, un local o cualquier activo inmobiliario, cada operación requiere un enfoque diferente. No trabajamos captando propiedades sin más; de hecho, muchas veces es mejor decir <span className="font-bold">NO</span>. ¿Por qué? Porque cuando aceptamos una propiedad, tenemos claro que la vamos a vender.
                                    </p>

                                    <div className="bg-black/10 rounded-xl p-6 my-6">
                                        <h3 className="text-xl font-bold mb-4 flex items-center">
                                            <FaExchangeAlt className="mr-3 text-black/70" /> 
                                            Los motivos para vender son diversos:
                                        </h3>
                                        <ul className="space-y-3 pl-6">
                                            <li className="flex items-start">
                                                <span className="bg-black/20 rounded-full p-1 mr-3 mt-1 flex-shrink-0">
                                                    <FaHome className="text-xs" />
                                                </span>
                                                <span>Un divorcio o un cambio de ciudad</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="bg-black/20 rounded-full p-1 mr-3 mt-1 flex-shrink-0">
                                                    <FaCity className="text-xs" />
                                                </span>
                                                <span>Una casa demasiado grande que ya no se ajusta a tu estilo de vida</span>
                                            </li>
                                            <li className="flex items-start">
                                                <span className="bg-black/20 rounded-full p-1 mr-3 mt-1 flex-shrink-0">
                                                    <FaMoneyBillWave className="text-xs" />
                                                </span>
                                                <span>Necesidad de liquidez urgente</span>
                                            </li>
                                        </ul>
                                    </div>

                                    <div className="space-y-4">
                                        <p className="leading-relaxed">
                                            Cada situación es única y debe tratarse con el método adecuado.
                                        </p>
                                        
                                        <p className="leading-relaxed">
                                            Y si buscas comprar o alquilar, trabajamos bajo un principio clave: <span className="font-bold">confianza</span>. No trabajamos gratis ni al azar, sino con una estrategia clara para encontrar la propiedad que realmente encaje contigo.
                                        </p>
                                        
                                        <p className="leading-relaxed">
                                            Quizás buscas una casa para recibir amigos y familia. O un hogar donde crecer con tus hijos. Tal vez eres soltero/a y quieres un espacio especial para ti. O estás pensando en invertir: comprar para alquilar, reformar y vender, o asegurar un patrimonio para tus hijos.
                                        </p>
                                        
                                        <p className="leading-relaxed">
                                            La vivienda es más que un bien, es un pilar en la vida de cada persona. Y estamos aquí para entender tu situación y crear el plan perfecto para ti.
                                        </p>
                                        
                                        <p className="leading-relaxed font-medium mt-4">
                                            Hablemos y encontremos juntos la mejor solución para tu caso.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </FadeInView>

                    <ScaleInView delay={0.2} className="w-full lg:w-[40%] flex flex-col items-center lg:items-end justify-center">
                        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full max-w-md mx-auto lg:max-w-none lg:w-[95%] shadow-2xl rounded-2xl overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent z-10"></div>
                            <Image
                                src="/gzmdinero.png"
                                alt="Inversiones Inmobiliarias"
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        </div>
                        
                        <Link
                            href="/contacto"
                            className="group relative inline-flex items-center gap-3 overflow-hidden rounded-full 
                                bg-gradient-to-r from-black/80 to-black/70 dark:from-white/80 dark:to-white/70
                                px-6 sm:px-8 lg:px-10
                                py-3 sm:py-3.5 lg:py-4
                                transition-all duration-300 
                                hover:shadow-lg
                                backdrop-blur-sm
                                mt-8 transform hover:translate-y-[-2px]
                                max-w-[90%] sm:max-w-[80%] lg:max-w-none"
                        >
                            <span className="relative text-base sm:text-lg font-semibold 
                                text-white dark:text-black whitespace-normal text-center flex items-center"
                            >
                                Contáctenos 
                                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                bg-gradient-to-r from-amarillo via-[#D5AB6F] to-amarillo 
                                transition-transform duration-300 group-hover:translate-x-full">
                            </span>
                        </Link>
                    </ScaleInView>
                </div>
            </div>
        </div>
    );
};

export default Eslogan;
