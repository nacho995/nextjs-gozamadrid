"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import FadeInView from './animations/FadeInView';
import ScaleInView from './animations/ScaleInView';

const Eslogan = () => {
    return (
        <div className="relative w-full py-12">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center lg:items-start justify-between gap-16 lg:gap-32 xl:gap-40">
                    <FadeInView direction="left" className="w-full lg:w-[55%] lg:pl-0 lg:-ml-8">
                        <div 
                            className="text-center lg:text-left p-8 rounded-lg border-b-2 border-r-4 border-black dark:border-black relative"
                            style={{
                                background: "linear-gradient(to right, transparent -8%, #D5AB6F 10%, #C7A336 80%, transparent 100%)",
                            }}
                        >
                            <div className="relative text-black dark:text-black z-20">
                                <h2 className="text-4xl font-bold mt-4 mb-8">
                                    Cada propiedad, cada historia, <br /> un método único.
                                </h2>
                                <p className="leading-relaxed font-bold">
                                    Si estás heredando una vivienda, un local o cualquier activo inmobiliario, cada operación requiere un enfoque diferente. No trabajamos captando propiedades sin más; de hecho, muchas veces es mejor decir NO. ¿Por qué? Porque cuando aceptamos una propiedad, tenemos claro que la vamos a vender.
                                </p>

                                <p className="leading-relaxed font-bold mt-4">
                                    Los motivos para vender son diversos:
                                </p>
                                <ul className="leading-relaxed text-left font-bold list-disc pl-6 mt-4">
                                    <li>Un divorcio o un cambio de ciudad</li>
                                    <li>Una casa demasiado grande que ya no se ajusta a tu estilo de vida</li>
                                    <li>Necesidad de liquidez urgente</li>
                                </ul>

                                <p className="leading-relaxed mt-8 font-bold">
                                    Cada situación es única y debe tratarse con el método adecuado.

                                    Y si buscas comprar o alquilar, trabajamos bajo un principio clave: confianza. No trabajamos gratis ni al azar, sino con una estrategia clara para encontrar la propiedad que realmente encaje contigo.

                                    Quizás buscas una casa para recibir amigos y familia. O un hogar donde crecer con tus hijos. Tal vez eres soltero/a y quieres un espacio especial para ti. O estás pensando en invertir: comprar para alquilar, reformar y vender, o asegurar un patrimonio para tus hijos.

                                    La vivienda es más que un bien, es un pilar en la vida de cada persona. Y estamos aquí para entender tu situación y crear el plan perfecto para ti.

                                    Hablemos y encontremos juntos la mejor solución para tu caso.
                                </p>
                            </div>
                        </div>
                    </FadeInView>

                    <ScaleInView delay={0.2} className="w-full lg:w-[40%] flex flex-col items-center lg:items-end">
                        <div className="relative h-[300px] md:h-[400px] lg:h-[500px] w-full lg:w-[90%]">
                            <Image
                                src="/gzmdinero.png"
                                alt="Inversiones Inmobiliarias"
                                fill
                                className="object-contain"
                            />
                        </div>
                        <Link
                            href="/contacto"
                            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full 
                                bg-black/50 dark:bg-white/50
                                px-4 sm:px-6 lg:px-8 
                                py-2 sm:py-2.5 lg:py-3 
                                transition-all duration-300 
                                hover:bg-black/70 dark:hover:bg-white/70 
                                backdrop-blur-sm
                                max-w-[90%] sm:max-w-[80%] lg:max-w-none"
                        >
                            <span className="relative text-sm sm:text-base lg:text-lg font-semibold 
                                text-white dark:text-black whitespace-normal text-center"
                            >
                                Contáctenos
                            </span>
                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                bg-gradient-to-r from-amarillo via-black to-amarillo 
                                dark:from-amarillo dark:via-white dark:to-amarillo 
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
