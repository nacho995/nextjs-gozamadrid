"use client";

import Services from "@/components/Servicios/servicios";
import AnimatedOnScroll from "@/components/AnimatedScroll";

export default function ServiciosPage() {
    return (
        <>
            {/* Fondo absoluto con gradiente y opacidad */}
            <div
                className="fixed inset-0 z-0 opacity-10"
                style={{
                    background:
                        "repeating-linear-gradient(40deg, #000000, #000000 5vh, #ffffff 20vh, #C7A336 30vh)",
                    backgroundAttachment: "fixed",
                }}
            ></div>

            <AnimatedOnScroll>
                <div className="text-center mx-0 text-transparent bg-clip-text">
                    <h2 className="mt-[10vh] italic text-3xl md:text-4xl lg:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-black via-amarillo to-black text-center p-4">
                        Nuestros Servicios
                    </h2>
                    <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
                        Descubre nuestras soluciones especializadas para inversores nacionales e internacionales
                    </p>
                </div>
            </AnimatedOnScroll>

            <AnimatedOnScroll>
                <Services />
            </AnimatedOnScroll>
        </>
    );
}
