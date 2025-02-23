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
                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                                    <div className="lg:col-span-8">
                                        <div className="bg-white rounded-2xl shadow-lg p-8 transition-all duration-300 hover:shadow-xl">
                                            <h4 className="text-3xl font-semibold text-gray-800 mb-6">{property.address}</h4>
                                            
                                            <div className="grid grid-cols-3 gap-6 py-8 border-t border-b border-gray-100">
                                                <div className="flex items-center justify-center">
                                                    <HiMiniSquare3Stack3D className="w-8 h-8 text-amarillo" />
                                                    <div className="ml-4">
                                                        <p className="text-sm text-gray-500">Superficie</p>
                                                        <p className="text-lg font-semibold">{property.m2} m²</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <MdMeetingRoom className="w-8 h-8 text-amarillo" />
                                                    <div className="ml-4">
                                                        <p className="text-sm text-gray-500">Habitaciones</p>
                                                        <p className="text-lg font-semibold">{property.rooms}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-center">
                                                    <FaRestroom className="w-8 h-8 text-amarillo" />
                                                    <div className="ml-4">
                                                        <p className="text-sm text-gray-500">Baños</p>
                                                        <p className="text-lg font-semibold">{property.wc}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8">
                                                <h5 className="text-xl font-semibold mb-4">Descripción</h5>
                                                <p className="text-gray-600 leading-relaxed">{property.description}</p>
                                            </div>

                                            <div className="mt-8 rounded-xl overflow-hidden shadow-lg">
                                                <iframe
                                                    width="100%"
                                                    height="400"
                                                    loading="lazy"
                                                    allowFullScreen
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAZAI0_oecmQkuzwZ4IM2H_NLynxD2Lkxo&q=${encodeURIComponent(property.address)}`}
                                                    title="Mapa de ubicación"
                                                    className="rounded-xl"
                                                ></iframe>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="lg:col-span-4 space-y-8">
                                        <div className="bg-white rounded-2xl shadow-lg p-8">
                                            <div className="flex justify-between items-center mb-6">
                                                <h5 className="text-2xl font-semibold text-gray-800">Precio</h5>
                                                <span className="bg-amarillo/20 text-black font-semibold px-4 py-2 rounded-full text-sm">
                                                    En venta
                                                </span>
                                            </div>

                                            <div className="text-3xl font-bold text-gray-800 mb-6">
                                                {property.price.toLocaleString()}€
                                            </div>

                                            <div className="p-4 bg-gray-50 rounded-xl mb-6">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-600">Precio/m²</span>
                                                    <span className="font-semibold">{property.priceM2 || "N/A"}€</span>
                                                </div>
                                            </div>

                                            <div className="space-y-4">
                                                <Link href="/booking" className="block">
                                                    <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/20 w-full
                                                        px-4 sm:px-6 lg:px-8 
                                                        py-2 sm:py-2.5 lg:py-3 
                                                        transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                                    >
                                                        <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-black whitespace-normal text-center w-full">
                                                            Agendar Visita
                                                        </span>
                                                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                                    </button>
                                                </Link>
                                                
                                                <Link href="/offer" className="block">
                                                    <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/20 w-full
                                                        px-4 sm:px-6 lg:px-8 
                                                        py-2 sm:py-2.5 lg:py-3 
                                                        transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                                    >
                                                        <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-black whitespace-normal text-center w-full">
                                                            Hacer Oferta
                                                        </span>
                                                        <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                                    </button>
                                                </Link>
                                            </div>
                                        </div>

                                        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl shadow-lg p-8 text-center">
                                            <h3 className="text-2xl font-semibold text-gray-800 mb-6">
                                                ¿Tienes preguntas sobre esta propiedad?
                                            </h3>
                                            <Link href="/contact">
                                                <button className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/20
                                                    px-4 sm:px-6 lg:px-8 
                                                    py-2 sm:py-2.5 lg:py-3 
                                                    transition-all duration-300 hover:bg-black/40 backdrop-blur-sm"
                                                >
                                                    <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-black whitespace-normal text-center">
                                                        Contáctanos
                                                    </span>
                                                    <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
                                                </button>
                                            </Link>
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
