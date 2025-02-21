"use client";

import Link from 'next/link';
import { FaHome, FaHandshake } from 'react-icons/fa';

export default function ServiciosEspaña() {
    return (
        <div className="container mx-auto py-4 ">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Servicio 1 */}
                <div className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                    <Link href="/servicios/residentes-espana/alquiler" className="flex flex-col items-center p-4 group h-full justify-between">
                        <FaHome className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" />
                        <h3 className="text-xl font-semibold mb-3">Alquiler temporal para turistas</h3>
                        <p className="text-base md:text-lg max-w-sm">
                            Maximiza la rentabilidad de tu propiedad con alquileres 
                            vacacionales. Gestionamos todo el proceso, desde la 
                            promoción hasta la atención al huésped.
                        </p>
                    </Link>
                </div>

                {/* Servicio 2 */}
                <div className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                    <Link href="/servicios/residentes-espana/guia-compra" className="flex flex-col items-center p-4 group h-full justify-between">
                        <FaHandshake className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" />
                        <h3 className="text-xl font-semibold mb-3">Guía de compra de propiedades</h3>
                        <p className="text-base md:text-lg max-w-sm">
                            Te acompañamos en todo el proceso de compra, desde la 
                            búsqueda hasta la firma. Asesoramiento legal, fiscal y 
                            financiero personalizado.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
