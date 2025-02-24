"use client";

import React from "react";
import AnimatedOnScroll from "../AnimatedScroll";
import Image from "next/image";

export default function ExpCountries() {
    const countries = [
        {
            name: "México",
            image: "/mexico.jpg",
            link: "https://www.gob.mx/", // URL para México
            description: "Descubre las oportunidades..."
        },
        {
            name: "Portugal",
            image: "/portugal.jpg",
            link: "https://www.portugal.gov.pt/", // URL para Portugal
            description: "Explora el encanto..."
        },
        {
            name: "Miami",
            image: "/miami.jpg",
            link: "https://www.miamigov.com/", // URL para Miami
            description: "Vive el sueño..."
        },
        {
            name: "Dubai",
            image: "/dubai.jpg",
            link: "https://www.dubai.ae/", // URL para Dubai
            description: "Experimenta el lujo..."
        }
    ];

    return (
        <AnimatedOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 w-full overflow-hidden">
                {/* Todas las tarjetas con la misma altura */}
                <div className="relative transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/spain.jpg"
                        alt="Andalucía"
                        className="w-full h-[40vh] object-cover rounded-sm"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-sm"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Andalucía
                    </h3>
                </div>

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/madrid.jpg"
                        alt="Madrid"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Madrid
                    </h3>
                </div>

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/cataluña.jpg"
                        alt="Cataluña"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Cataluña
                    </h3>
                </div>

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/valencia.jpg"
                        alt="Valencia"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Valencia
                    </h3>
                </div>

                {countries.map((country, index) => (
                    <div key={index} className="relative group overflow-hidden rounded-xl">
                        <div className="relative h-[400px]">
                            <Image
                                src={country.image}
                                alt={country.name}
                                fill
                                className="object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
                            
                            {/* Título y descripción */}
                            <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                                <h3 className="text-2xl font-bold mb-2">{country.name}</h3>
                                <p className="text-sm opacity-90">{country.description}</p>
                                
                                {/* Enlace "Pincha aquí" */}
                                {country.link && (
                                    <a
                                        href={country.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block mt-3 px-4 py-2 bg-amarillo text-black rounded-full 
                                            text-sm font-semibold transition-all duration-300 
                                            hover:bg-white hover:scale-105"
                                    >
                                        Pincha aquí
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AnimatedOnScroll>
    );
}
