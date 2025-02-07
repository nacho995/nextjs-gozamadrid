"use client";
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { AiOutlineMenuUnfold, AiOutlineMenuFold } from "react-icons/ai";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import ReactDOM from "react-dom";

export default function ControlMenu() {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  // Referencia para medir el ancho natural de los links adicionales
  const extraLinksRef = useRef(null);
  const [extraWidth, setExtraWidth] = useState(0);

  // Referencia para el enlace "Vende tu propiedad"
  const venderRef = useRef(null);
  const [venderRect, setVenderRect] = useState({
    top: 1,
    left: 0,
    width: 0,
    height: 0,
    bottom: 0,
  });

  // Usamos ResizeObserver para recalcular el ancho cuando cambie el tamaño del contenedor extra
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

  // Cada vez que se muestre el dropdown, calculamos la posición del enlace "Vende tu propiedad"
  useEffect(() => {
    if (venderRef.current && isDropdownVisible) {
      const rect = venderRef.current.getBoundingClientRect();
      setVenderRect(rect);
    }
  }, [isDropdownVisible]);

  const handleMouseEnter = () => setDropdownVisible(true);
  const handleMouseLeave = () => setDropdownVisible(false);

  return (
    <div className="relative w-full">
      {/* Menú Principal */}
      <header className="relative z-10 flex flex-col items-center px-24 p-4 bg-white bg-opacity-40 w-max mx-auto rounded-full shadow-2xl">
        {/* Íconos sociales y botón de menú */}
        <div className="absolute left-1/4 top-1/2 flex space-x-4 mt-4 ml-4">
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
        </div>

        <div className="absolute top-5 right-10 flex space-x-4 mt-4 mr-4">
          <Link
            href="https://www.facebook.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaFacebook size={25} className="hover:text-gray-700 text-blue-600" />
          </Link>
          <Link
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            <FaInstagram size={25} className="hover:text-gray-700 text-pink-600" />
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
          {/* Envolvemos "Vende tu propiedad" en un contenedor al que asignamos venderRef */}
          <div
            ref={venderRef}
            className="relative whitespace-nowrap"
            onMouseEnter={handleMouseEnter}
            // También podemos dejar onMouseLeave en el dropdown o en este contenedor
          >
            <Link href="/vender" className="text-black hover:text-gray-700">
              Vende tu propiedad
            </Link>
            {isDropdownVisible &&
              ReactDOM.createPortal(
                <div
                  className="absolute bg-black bg-opacity-50 rounded shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold"
                  style={{
                    // Posicionamos el dropdown justo debajo del enlace, con un pequeño margen (por ejemplo, 4px)
                    top: venderRect.bottom + window.scrollY + 18,
                    left: venderRect.left + window.scrollX,
                    minWidth: venderRect.width,
                  }}
                  onMouseLeave={handleMouseLeave}
                >
                  <Link
                    href="/vender/comprar"
                    className="block px-4 py-2 text-white"
                  >
                    Compra tu propiedad
                  </Link>
                </div>,
                document.body
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
              marginLeft: menuVisible ? "3rem" : "0rem",
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
