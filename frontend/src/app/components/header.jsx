"use client";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import Link from "next/link";
import { useState } from "react";

export default function ControlMenu() {
  // Estado para controlar la visibilidad del dropdown
  const [isDropdownVisible, setDropdownVisible] = useState(false);

  // Maneja el evento de entrar al contenedor de Servicios
  const handleMouseEnter = () => {
    setDropdownVisible(true);
  };

  // Maneja el evento de salir del contenedor de Servicios o del submenú
  const handleMouseLeave = () => {
    setDropdownVisible(false);
  };

  return (
    <div className="relative w-full h-[80vh]">
      {/* Contenido del encabezado */}
<<<<<<< HEAD
        <header className="relative z-10 flex flex-col items-center pl-24 pr-24 p-4 bg-white bg-opacity-50 w-max mx-auto rounded-full shadow-2xl">
          {/* Íconos sociales */}
        <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
          <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={25} className="hover:text-gray-700 text-blue-600" />
          </Link>
          <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={25} className="hover:text-gray-700 text-pink-600" />
          </Link>
          <Link href="tel:+34919012103">
            <FaPhone size={25} className="hover:text-gray-700" />
          </Link>
          <span className="hover:text-gray-700 text-black text-2xl">+34919012103</span>
        </div>

        {/* Logo */}
        <Image src="/logo.png" alt="Logo" width={150} height={30} className="m-0"/>

        {/* Navegación */}
        <nav className="text-black flex space-x-14 mt-4 text-2xl font-bold">
          <Link href="#" className="text-black hover:text-gray-700">
=======
        <header className="relative z-10 flex flex-col items-center pl-24 pr-24 p-4 bg-black bg-opacity-50 w-max mx-auto rounded-full shadow-2xl">
          {/* Íconos sociales */}
        <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
          <Link href="https://www.facebook.com" target="_blank" rel="noopener noreferrer">
            <FaFacebook size={25} className="hover:text-amber-300 text-blue-600" />
          </Link>
          <Link href="https://www.instagram.com" target="_blank" rel="noopener noreferrer">
            <FaInstagram size={25} className="hover:text-amber-300 text-pink-600" />
          </Link>
          <Link href="tel:+34919012103">
            <FaPhone size={25} className="hover:text-amber-300" />
          </Link>
          <span className="hover:text-amber-300 text-white text-2xl">+34919012103</span>
        </div>

        {/* Logo */}
        <Image src="/logogzm.jpeg" alt="Logo" width={200} height={50} />

        {/* Navegación */}
        <nav className="text-white flex space-x-14 mt-4 text-2xl font-bold">
          <Link href="#" className="text-white hover:text-amber-300">
>>>>>>> 33e1efe (guardando antes del pull locales)
            Inicio
          </Link>
          {/* Dropdown para Servicios */}
          <div
            className="relative group"
            onMouseEnter={handleMouseEnter} // Entrada al área
            // onMouseLeave={handleMouseLeave} // Salida del área
<<<<<<< HEAD
            >
            <Link href="/servicios" className="text-black hover:text-gray-700">
                Servicios
=======
          >
            <Link href="#" className="text-white hover:text-amber-300">
              Servicios
>>>>>>> 33e1efe (guardando antes del pull locales)
            </Link>
            {/* Submenú */}
            {isDropdownVisible && (
              <div
<<<<<<< HEAD
                className="absolute bg-white bg-opacity-50 mt-2 rounded shadow-lg flex flex-col"
                onMouseEnter={handleMouseEnter} // Mantén el submenú abierto si el ratón está encima de él
                onMouseLeave={handleMouseLeave} // Cierra el submenú si el ratón sale de él
              >
                <Link href="#" className="block px-4 py-2 text-black hover:text-gray-700">
=======
                className="absolute bg-black bg-opacity-50 mt-2 rounded shadow-lg flex flex-col"
                onMouseEnter={handleMouseEnter} // Mantén el submenú abierto si el ratón está encima de él
                onMouseLeave={handleMouseLeave} // Cierra el submenú si el ratón sale de él
              >
                <Link href="#" className="block px-4 py-2 text-white hover:text-amber-300">
>>>>>>> 33e1efe (guardando antes del pull locales)
                  Vende tu propiedad
                </Link>
              </div>
            )}
          </div>

<<<<<<< HEAD
          <Link href="#" className="text-black hover:text-gray-700">
            Propiedades
          </Link>
          <Link href="#" className="text-black hover:text-gray-700">
            Reformas
          </Link>
          <Link href="#" className="text-black hover:text-gray-700">
            Inversores
          </Link>
          <Link href="#" className="text-black hover:text-gray-700">
            Blog
          </Link>
          <Link href="#" className="text-black hover:text-gray-700">
=======
          <Link href="#" className="text-white hover:text-amber-300">
            Propiedades
          </Link>
          <Link href="#" className="text-white hover:text-amber-300">
            Reformas
          </Link>
          <Link href="#" className="text-white hover:text-amber-300">
            Inversores
          </Link>
          <Link href="#" className="text-white hover:text-amber-300">
            Blog
          </Link>
          <Link href="#" className="text-white hover:text-amber-300">
>>>>>>> 33e1efe (guardando antes del pull locales)
            Contacto
          </Link>
        </nav>
      </header>
    </div>
  );
}
