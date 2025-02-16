"use client";

import React from "react";
import AnimatedOnScroll from "../AnimatedScroll";


export default function ExpCountries() {
    return (
        <AnimatedOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 w-full overflow-hidden">
                {/* Tarjeta 1 */}
                <div className="relative rounded-s transform transition h-[40vh] duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/spain.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    {/* Overlay negro */}
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white "
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Andalucía
                    </h3>
                </div>
                {/* Tarjeta 2 */}
                <div className="relative rounded-s transform transition duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/madrid.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Madrid
                    </h3>
                </div>
                {/* Tarjeta 3 */}
                <div className="relative rounded-s transform transition duration-700 z-10 hover:scale-105 hover:z-50 h-[40vh]">
                    <img
                        src="/cataluña.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Cataluña
                    </h3>
                </div>
                {/* Tarjeta 4 */}
                <div className="relative rounded-s transform transition duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/valencia.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Valencia
                    </h3>
                </div>
                {/* Tarjeta 5 */}
                <div className="relative rounded-s transform transition duration-700 z-10 h-[40vh] hover:scale-105 hover:z-50">
                    <img
                        src="/mexico.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        México
                    </h3>
                </div>
                {/* Tarjeta 6 */}
                <div className="relative rounded-s transform transition duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/spain.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 7 */}
                <div className="relative rounded-s h-[40vh] transform transition duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/spain.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 8 */}
                <div className="relative rounded-s transform transition duration-700 z-10 hover:scale-105 hover:z-50">
                    <img
                        src="/spain.jpg"
                        alt="Spain"
                        className="w-full h-full rounded-s object-cover"
                    />
                    <div className="absolute inset-0 bg-black/50 rounded-s"></div>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-white italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
            </div>
        </AnimatedOnScroll>
    );
}
