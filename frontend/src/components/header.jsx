"use client";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { AiOutlineMenuUnfold, AiOutlineMenuFold } from "react-icons/ai";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";

export default function ControlMenu() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Referencia para medir el ancho natural de los links adicionales
  const extraLinksRef = useRef(null);
  const [extraWidth, setExtraWidth] = useState(0);

  // Usamos ResizeObserver para recalcular el ancho cuando cambie el tamaño del contenedor
  useEffect(() => {
    if (extraLinksRef.current) {
      const resizeObserver = new ResizeObserver((entries) => {
        for (let entry of entries) {
          setExtraWidth(entry.target.scrollWidth);
        }
      });
      resizeObserver.observe(extraLinksRef.current);
      return () => resizeObserver.disconnect();
    }
  }, []);

  const handleMouseEnter = () => setDropdownVisible(true);
  const handleMouseLeave = () => setDropdownVisible(false);

  return (
    <div className="relative w-full">
      {/* Menú Principal */}
      <header className="relative z-10 flex flex-col items-center px-24 p-4 bg-white bg-opacity-40 w-max mx-auto rounded-full shadow-2xl">
        {/* Íconos sociales y botón de menú */}
        <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
          <button
            onClick={() => setMenuVisible(!menuVisible)}
            className="text-black hover:text-gray-700 flex items-center space-x-2"
          >
            <span>{menuVisible ? "Ver menos" : "Ver más"}</span>
            {menuVisible ? (
              <AiOutlineMenuFold size={30} />
            ) : (
              <AiOutlineMenuUnfold size={30} />
            )}
          </button>

          {/* Redes sociales */}
          <Link
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook
              size={25}
              className="hover:text-gray-700 text-blue-600"
            />
          </Link>
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram
              size={25}
              className="hover:text-gray-700 text-pink-600"
            />
          </Link>
          <Link href="tel:+34919012103">
            <FaPhone size={25} className="hover:text-gray-700" />
          </Link>
          <span className="hover:text-gray-700 text-black text-2xl">
            +34 919 012 103
          </span>
        </div>

        {/* Logo */}
        <Image src="/logo.png" alt="Logo" width={150} height={30} className="m-0" />

        {/* Navegación principal */}
        <nav className="text-black flex items-center space-x-14 mt-4 text-2xl font-bold">
          <Link href="/" className="text-black hover:text-gray-700">
            Inicio
          </Link>
          {/* Link con dropdown para "Vende tu propiedad" */}
          <div
            className="relative whitespace-nowrap"
            onMouseEnter={handleMouseEnter}
            
          >
            <Link href="/vender" className="text-black hover:text-gray-700">
              Vende tu propiedad
            </Link>
            {isDropdownVisible && (
              <div
                className="absolute bg-black bg-opacity-50 mt-2 rounded shadow-lg flex flex-col transition-all duration-300 ease-in-out"
                onMouseLeave={handleMouseLeave}
              >
                <Link
                  href="/vender/comprar"
                  className="block px-4 py-2 text-white"
                >
                  Compra tu propiedad
                </Link>
              </div>
            )}
          </div>
          <Link href="/exp-realty" className="text-black hover:text-gray-700">
            eXp Realty
          </Link>

          {/* Contenedor de links adicionales animado colocado antes de Blog y Contacto */}
          <div
            className="inline-block overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              width: menuVisible ? `${extraWidth}px` : "0px",
              // Cuando el menú está oculto, cancelamos el espacio reservado; al expandirse, dejamos un margen de 1rem.
              marginLeft: menuVisible ? "3rem" : "-1rem",
              marginRight: menuVisible ? "0px" : "0px",
            }}
          >
            <div ref={extraLinksRef} className="inline-flex gap-11">
              <Link
                href="/reformas"
                className="text-black hover:text-gray-700 whitespace-nowrap"
              >
                Reformas
              </Link>
              <Link
                href="/inversores"
                className="text-black hover:text-gray-700 whitespace-nowrap"
              >
                Inversores
              </Link>
              <Link
                href="/servicios"
                className="text-black hover:text-gray-700 whitespace-nowrap"
              >
                Servicios
              </Link>
            </div>
          </div>

          <Link href="/blog" className="text-black hover:text-gray-700">
            Blog
          </Link>
          <Link href="/contacto" className="text-black hover:text-gray-700">
            Contacto
          </Link>
        </nav>
      </header>
    </div>
  );
}
