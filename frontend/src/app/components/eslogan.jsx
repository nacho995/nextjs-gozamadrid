"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
// import "../../globals.css";
import Link from "next/link";

const Eslogan = () => {
<<<<<<< HEAD
    return (
        <div className="mt-18 grid grid-cols-2 place-items-center relative bg-cover bg-center z-40 rounded-3xl" style={{ height: "100vh" }}>
            {/* Capa de color negro transparente */}
            <div className="absolute inset-0 bg-black opacity-10 z-30 rounded-3xl"></div>

            {/* Contenedor con fondo oscuro transparente */}
            <div
                className="max-w-md text-center mb-[15%] mt-[5%] z-40 relative p-8 rounded-lg"
                style={{
                    background: "linear-gradient(to right, transparent 5%, #C7A336 20%, white 80%, transparent 100%)",
                }}
            >

                <div className="relative z-20">
                    <h2 className="text-4xl font-bold mt-[6%] mb-8">
                        Cada propiedad, cada historia,  <br /> un método único.
                    </h2>
                    <p className="leading-relaxed font-bold">
                        Si estás heredando una vivienda, un local o cualquier activo inmobiliario, cada operación requiere un enfoque diferente. No trabajamos captando propiedades sin más; de hecho, muchas veces es mejor decir NO. ¿Por qué? Porque cuando aceptamos una propiedad, tenemos claro que la vamos a vender.

                        Los motivos para vender son diversos:
                        Un divorcio o un cambio de ciudad
                        Una casa demasiado grande que ya no se ajusta a tu estilo de vida
                        Necesidad de liquidez urgente
                    </p>
                    <p className="leading-relaxed mt-8 font-bold">

                        Cada situación es única y debe tratarse con el método adecuado.

                        Y si buscas comprar o alquilar, trabajamos bajo un principio clave: confianza. No trabajamos gratis ni al azar, sino con una estrategia clara para encontrar la propiedad que realmente encaje contigo.

                        Quizás buscas una casa para recibir amigos y familia
                        O un hogar donde crecer con tus hijos
                        Tal vez eres soltero/a y quieres un espacio especial para ti
                        O estás pensando en invertir: comprar para alquilar, reformar y vender, o asegurar un patrimonio para tus hijos.

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
                <Link href="/contacto" className="hover:text-white hover:bg-black bg-amarillo text-black px-4 py-2 rounded mt-[15%]">
=======

    return (
        <div className="mt-24 flex flex-col items-center relative">
            <div className="max-w-md text-left mb-[15%] ml-[-50%] mt-[5%]">
                <h2 className="text-4xl font-bold mt-[6%] mb-8">
                    Somos tu asesor <br /> inmobiliario.
                </h2>
                <p className="leading-relaxed">
                    ¡Aspiramos a generar una nueva cultura financiera en España a través de la
                    inversión en bienes inmuebles, básicamente, queremos que generes riqueza!
                </p>
                <p className="leading-relaxed mt-8">
                    Buscamos revolucionar la forma en como invertir en inmuebles,
                    con una visión centrada en ti como inversionista
                    y una gama de soluciones que busca hacerte la vida fácil,
                    queremos ayudarte a desarrollar una estrategia de
                    inversión inmobiliaria y ayudarte a ejecutarla, para
                    que alcances tus objetivos financieros.
                </p>
            </div>
            <div className="absolute mt-[5%] ml-[30%]">
                <Image
                    src="/gzmdinero.png"
                    alt="Dinero"
                    width={600}
                    height={600}
                    className="object-cover"
                />
            </div>
            <div className="mt-[-10%] ml-[30%] mb-[10%]">
                <Link href="/contacto" className="hover:text-white hover:bg-black bg-amber-300 text-black px-4 py-2 rounded">
>>>>>>> 33e1efe (guardando antes del pull locales)
                    Contáctenos
                </Link>
            </div>
        </div>
    );
};

export default Eslogan;
