"use client";
import React, { useState } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2"
import { MdMeetingRoom } from "react-icons/md";
import { FaRestroom } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AnimatedOnScroll from "../AnimatedScroll";

export default function DefaultPropertyContent({ property }) {
    const [current, setCurrent] = useState(0);

    if (!property.images || property.images.length === 0) {
        return (
            <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md mb-6">
                <Image
                    src="/placeholder.png"
                    alt="Placeholder"
                    fill
                    style={{ objectFit: "cover" }}
                />
            </div>
        );
    }

    return (
        <div className="relative w-full min-h-screen">
            <div
                className="fixed inset-0 z-0 opacity-10 h-full"
                style={{
                    background: `repeating-linear-gradient(40deg, #000000, #000000 5vh, #ffffff 20vh, #C7A336 30vh)`,
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <article className="prose max-w-none relative z-10">
                    <div className="container-fluid relative px-3">
                        <div className="layout-specing">
                            <div className="md:flex justify-center items-center">
                                <h5 className="text-3xl text-transparent bg-clip-text bg-gradient-to-b from-amarillo via-amarillo to-black  font-semibold">Detalles de la propiedad</h5>
                            </div>
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative w-full md:w-3/4 h-96 overflow-hidden rounded-lg shadow-md">
                                    <Image
                                        src={property.images[0].src}
                                        alt={property.images[0].alt || "Imagen principal"}
                                        fill
                                        style={{ objectFit: "cover" }}
                                    />
                                </div>
                                <div className="flex flex-row items-center gap-4">
                                    <div className="flex flex-row gap-2 overflow-x-auto mr-[5vw]">
                                        {property.images.map((img, idx) => (
                                            <button
                                                key={idx}
                                                onClick={() => setCurrent(idx)}
                                                className={`w-24 h-24 border-2 rounded overflow-hidden ${idx === current ? "border-green-600" : "border-transparent"}`}
                                            >
                                                <Image
                                                    src={img.src}
                                                    alt={img.alt || `Miniatura ${idx + 1}`}
                                                    width={96}
                                                    height={96}
                                                    objectFit="cover"
                                                />
                                            </button>
                                        ))}
                                    </div>
                                    <div className="relative w-[30vw] h-[40vh] ml-[5vw] overflow-hidden rounded-lg shadow-md">
                                        <Image
                                            src={property.images[current].src}
                                            alt={property.images[current].alt || "Imagen seleccionada"}
                                            fill
                                            style={{ objectFit: "cover" }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div className="mt-6 pb-20">
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                                    <div className="lg:col-span-8">
                                        <div className="bg-white dark:bg-gray-100 p-6 rounded-md shadow dark:shadow-gray-700">
                                            <h4 className="text-2xl font-medium">{property.address}</h4>
                                            <ul className="py-6 flex items-center list-none">
                                                <li className="flex items-center lg:me-6 me-4">
                                                    <HiMiniSquare3Stack3D className="w-10 h-10 mr-5 text-amarillo" />
                                                    <span className="lg:text-xl">{property.m2} m2</span>
                                                </li>

                                                <li className="flex items-center lg:me-6 me-4">
                                                    <MdMeetingRoom className="w-10 h-10 mr-5 text-amarillo" /> <span className="lg:text-xl">{property.rooms} Habitaciones</span>
                                                </li>
                                                <li className="flex items-center">
                                                    <FaRestroom className="w-10 h-10 mr-5 text-amarillo" />  <span className="lg:text-xl">{property.wc} Baños</span>
                                                </li>
                                            </ul>
                                            <p className="text-black text-md">{property.description}</p>
                                        </div>
                                        <div className="mt-6">
                                            <iframe
                                                width="100%"
                                                height="400"
                                                loading="lazy"
                                                allowFullScreen
                                                referrerPolicy="no-referrer-when-downgrade"
                                                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAZAI0_oecmQkuzwZ4IM2H_NLynxD2Lkxo&q=${encodeURIComponent(property.address)}`}
                                                title="Mapa de ubicación"
                                            ></iframe>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4">
                                        <div className="rounded-md bg-white dark:bg-amarillo/10 py-10 px-2 dark:shadow-gray-700">
                                            <h5 className="text-2xl font-medium">Price:</h5>
                                            <div className="flex justify-between items-center mt-6">
                                                <span className="text-xl font-medium">{property.price}€</span>
                                                <span className="bg-black text-amarillo text-sm px-2.5 py-0.75 rounded h-6">
                                                    En venta
                                                </span>
                                            </div>
                                            <ul className="list-none mt-4">
                                                <li className="flex justify-between items-center mt-2">
                                                    <span className="text-black text-md">Precio por metro cuadrado</span>
                                                    <span className="font-medium text-md">{property.priceM2 || "N/A"}€</span>
                                                </li>
                                            </ul>
                                            <div className="flex mt-4">
                                                <div className="p-1 w-1/2">
                                                    <Link href="/booking" className="block text-white rounded-md w-full no-underline">
                                                        <span className="bg-black text-white hover:text-amarillo text-lg px-2.5 py-0.75 rounded p-2">
                                                            Agenda una visita
                                                        </span>
                                                    </Link>
                                                </div>
                                                <div className="p-1 w-1/2">
                                                    <Link href="/offer" className="block text-white rounded-md w-full no-underline">
                                                        <span className="bg-black text-white hover:text-amarillo text-lg px-2.5 py-0.75 rounded p-2">
                                                            Haz una oferta
                                                        </span>
                                                    </Link>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="mt-12 text-center py-14">
                                            <h3 className="mb-6 text-xl leading-normal font-medium text-black dark:text-black">
                                                ¿Tienes preguntas sobre esta propiedad?
                                            </h3>
                                            <div className="mt-6">
                                                <Link
                                                    href="/contact"
                                                    className="border-amarillo text-amarillo hover:text-amarillo rounded-md no-underline"
                                                >
                                                    <span className="bg-black text-white hover:text-amarillo border text-xl px-2.5 py-0.75 rounded p-2">
                                                        Contáctanos
                                                    </span>
                                                </Link>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </article>
            </AnimatedOnScroll>
        </div >
    );
}
