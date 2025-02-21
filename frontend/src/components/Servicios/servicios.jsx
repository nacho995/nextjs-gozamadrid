"use client";

import Link from 'next/link';
import { FaHome, FaHandshake, FaChartLine } from 'react-icons/fa';
import FadeInView from '../animations/FadeInView';
import ScaleInView from '../animations/ScaleInView';

export default function Services() {
    return (
        <div className="container mx-auto py-4 mt-[5vh] mb-[20vh]">
            <FadeInView>
                <h2 className="text-4xl font-bold text-center">
                    Nuestros Servicios
                </h2>
            </FadeInView>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
                {/* Servicio 1 */}
                <div className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                    <Link href="/servicios/residentes-espana" className="flex flex-col items-center p-4 group h-full justify-between">
                        <FaHandshake className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" />
                        <h3 className="text-xl font-semibold mb-3">Inversores residentes en España</h3>
                        <p className="text-base md:text-lg max-w-sm">
                            Maximiza tu inversión inmobiliaria en España. Ofrecemos análisis 
                            de rentabilidad, gestión de propiedades y asesoramiento fiscal 
                            para inversores locales.
                        </p>
                    </Link>
                </div>

                {/* Servicio 2 */}
                <div className="flex flex-col items-center text-center p-4 hover:transform hover:scale-105 transition-transform duration-300 rounded-lg h-full">
                    <Link href="/servicios/residentes-extranjero" className="flex flex-col items-center p-4 group h-full justify-between">
                        <FaChartLine className="text-4xl md:text-5xl lg:text-6xl mb-4 text-black group-hover:text-amarillo transition-colors duration-300" />
                        <h3 className="text-xl font-semibold mb-3">Inversores residentes en el extranjero</h3>
                        <p className="text-base md:text-lg max-w-sm">
                            Facilitamos tu inversión desde el extranjero. Gestionamos todos los 
                            trámites legales, fiscales y administrativos para que puedas 
                            invertir en España con total tranquilidad.
                        </p>
                    </Link>
                </div>
            </div>
        </div>
    );
}
