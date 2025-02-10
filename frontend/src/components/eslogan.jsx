"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import AnimatedOnScroll from "./AnimatedScroll";

const Eslogan = () => {
    return (
        <AnimatedOnScroll>
        <div className="mt-4 grid grid-cols-2 place-items-center relative bg-cover bg-center z-40 rounded-3xl" style={{ minHeight: "100vh" }}>
            {/* Capa de color negro transparente */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent  z-30 rounded-3xl"></div>

            {/* Contenedor con fondo oscuro transparente */}
            <div
                className="max-w-md text-center mb-[15%] mt-[5%] z-40 relative p-8 rounded-lg border-b-2  border-r-4 border-black"
                style={{
                    background: "linear-gradient(to right, transparent -8%, #C7A336 10%, white 90%, transparent 100%)",
                }}
            >
                <div className="relative text-black z-20 ">
                    <h2 className="text-4xl font-bold mt-4 mb-8">
                        Cada propiedad, cada historia, <br /> un método único.
                    </h2>
                    <p className="leading-relaxed font-bold">
                        Si estás heredando una vivienda, un local o cualquier activo inmobiliario, cada operación requiere un enfoque diferente. No trabajamos captando propiedades sin más; de hecho, muchas veces es mejor decir NO. ¿Por qué? Porque cuando aceptamos una propiedad, tenemos claro que la vamos a vender.
                    </p>

                    <p className="leading-relaxed font-bold">
                        Los motivos para vender son diversos:
                    </p>
                    <br />
                    <ul className="leading-relaxed text-left font-bold list-disc pl-6">
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

            {/* Imagen */}
            <div className="z-40 flex flex-col place-items-center">
                <Image
                    src="/gzmdinero.png"
                    alt="Dinero"
                    width={700}
                    height={700}
                    className="object-cover"
                />
                <Link href="/contacto" className="hover:text-white hover:bg-black bg-amarillo text-black px-4 py-2 rounded mt-8">
                    Contáctenos
                </Link>
            </div>
        </div>
        </AnimatedOnScroll>
    );
};

export default Eslogan;
