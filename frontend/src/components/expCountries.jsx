"use client";

import React from "react";
import AnimatedOnScroll from "./AnimatedScroll";

export default function ExpCountries() {
    return (
        <AnimatedOnScroll>
            <div className="grid grid-cols-2 md:grid-cols-4 w-full overflow-hidden">
                {/* Tarjeta 1 */}
                <div className="relative  transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className="w-full h-full rounded-lg object-cover" />
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 2 */}
                <div className="relative transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover" />
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 3 */}
                <div className="relative rounded-lg transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover" />
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 4 */}
                <div className="relative rounded-lg transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover"/>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 5 */}
                <div className="relative rounded-lg transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover" />
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 6 */}
                <div className="relative rounded-lg transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover" />
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 7 */}
                <div className="relative rounded-lg transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover" />
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
                {/* Tarjeta 8 */}
                <div className="relative rounded-lg transform transition duration-300 hover:scale-105">
                    <img src="/spain.jpg" alt="Spain" className=" rounded-lg w-full h-full object-cover"/>
                    <h3
                        className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-gray-950 italic"
                        style={{ textShadow: "2px 2px 3px rgba(65,105,225,0.7)" }}
                    >
                        Spain
                    </h3>
                </div>
            </div>
        </AnimatedOnScroll>
    );
}
