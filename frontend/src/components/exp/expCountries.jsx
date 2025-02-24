"use client";

import React from "react";
import AnimatedOnScroll from "../AnimatedScroll";


export default function ExpCountries() {
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

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/mexico.jpg"
                        alt="México"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        México
                    </h3>
                </div>

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/portugal.jpg"
                        alt="Portugal"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Portugal
                    </h3>
                </div>

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/miami.jpg"
                        alt="Miami"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Miami
                    </h3>
                </div>

                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/dubai.jpg"
                        alt="Dubai"
                        className="w-full h-[40vh] object-cover rounded-s"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Dubai
                    </h3>
                </div>
            </div>
        </AnimatedOnScroll>
    );
}
