"use client";

import React from "react";
import AnimatedOnScroll from "../AnimatedScroll";
import Image from "next/image";
import Link from "next/link";

export default function ExpCountries() {
    const countries = [
        {
            name: "México",
            image: "/mexico.jpg",
            link: "https://gozamerida.com/", // URL para México
            description: "Descubre las oportunidades..."
        },
        {
            name: "Portugal",
            image: "/portugal.jpg",
            link: "https://search.app/m1UY4QxWgqK1grma6", // URL para Portugal
            description: "Explora el encanto..."
        },
        {
            name: "Miami",
            image: "/miami.jpg",
            link: "https://search.app/w2k6WEabMDTpiNdM9", // URL para Miami
            description: "Vive el sueño..."
        },
        {
            name: "Dubai",
            image: "/dubai.jpg",
            link: "https://www.propertyfinder.ae/en/broker/exp-real-estate-br-of-exp-international-holdings-inc-dubai-branch-6166", // URL para Dubai
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

                {/* Tarjetas internacionales */}
                {countries.map((country, index) => (
                    <div key={index} 
                        className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50"
                    >
                        <img
                            src={country.image}
                            alt={country.name}
                            className="w-full h-[40vh] object-cover rounded-s"
                            
                        />
                        <div className="absolute inset-0 bg-black/50 rounded-s">
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <h3 className="text-2xl font-bold text-white italic mb-4"
                                    style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                                >
                                    {country.name}
                                </h3>
                                <p className="text-white text-sm font-bold">{country.description}</p>
                                <a 
                                    href={country.link}
                                    className="group/link relative inline-flex items-center gap-2 overflow-hidden 
                                        rounded-full bg-white/20 px-8 py-3 
                                        transition-all duration-300 
                                        hover:bg-white/30 
                                        backdrop-blur-sm"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    <span className="relative text-lg font-semibold text-white">
                                        Pincha aquí
                                    </span>
                                    <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                        bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                        transition-transform duration-300 
                                        group-hover/link:translate-x-full">
                                    </span>
                                </a>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </AnimatedOnScroll>
    );
}
