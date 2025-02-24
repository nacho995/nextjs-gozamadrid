"use client";

import Link from 'next/link';
import { FaHome, FaHandshake, FaChartLine } from 'react-icons/fa';
import AnimatedOnScroll from '../AnimatedScroll';

export default function ServiciosExtranjero() {
    return (
        <div className="container mx-auto py-4 mt-[5vh] mb-[20vh]">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Servicio 1: Impuesto de la Renta */}
                <div className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                    <Link href="/servicios/residentes-extranjero/impuesto-renta" className="flex flex-col items-center p-4 group h-full justify-between">
                        <FaChartLine className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" />
                        <h3 className="text-xl font-semibold mb-3">Impuesto de la Renta para No Residentes</h3>
                        <p className="text-base md:text-lg max-w-sm">
                            Asesoramiento especializado en la gestión y optimización del Impuesto sobre la 
                            Renta de No Residentes (IRNR). Gestionamos tus obligaciones fiscales en España 
                            y te ayudamos a cumplir con la normativa vigente.
                        </p>
                    </Link>
                </div>

                {/* Servicio 2: Guía de Compra */}
                <div className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                    <Link href="/servicios/residentes-extranjero/guia-compra" className="flex flex-col items-center p-4 group h-full justify-between">
                        <FaHome className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" />
                        <h3 className="text-xl font-semibold mb-3">Guía de Compra de Propiedades</h3>
                        <p className="text-base md:text-lg max-w-sm">
                            Todo lo que necesitas saber para comprar una propiedad en España siendo extranjero. 
                            Desde requisitos legales hasta el proceso completo de compra, te guiamos en cada paso 
                            para una inversión segura.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
