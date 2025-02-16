"use client";
import { usePathname } from 'next/navigation';
import Image from "next/image";
import { FaFacebook, FaInstagram, FaPhone } from "react-icons/fa";
import { AiOutlineMenuUnfold, AiOutlineMenuFold } from "react-icons/ai";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import AnimatedOnScroll from './AnimatedScroll';

export default function ControlMenu() {
  // Usamos usePathname para obtener la ruta actual (compatible con la carpeta app)
  const pathname = usePathname();
  // Verifica si la ruta actual es /exp-realty
  const isExpRealty = pathname === '/exp-realty';

  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [menuVisible, setMenuVisible] = useState(false);

  const extraLinksRef = useRef(null);
  const [extraWidth, setExtraWidth] = useState(0);

  const venderRef = useRef(null);
  const [venderRect, setVenderRect] = useState({
    top: 1,
    left: 0,
    width: 0,
    height: 0,
    bottom: 0,
  });

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

  useEffect(() => {
    if (venderRef.current && isDropdownVisible) {
      const rect = venderRef.current.getBoundingClientRect();
      setVenderRect(rect);
    }
  }, [isDropdownVisible]);

  const handleMouseEnter = () => setDropdownVisible(true);
  const handleMouseLeave = () => setDropdownVisible(false);

  const toggleMenu = () => {
    setMenuVisible(!menuVisible);
    setDropdownVisible(false);
  };

  const toggleDropdown = () => {
    setDropdownVisible(!isDropdownVisible);
  };

  return (
    <div className="relative w-full">
      {/* Botón de menú para móviles */}
      {!menuVisible && (
        <div className="lg:hidden fixed left-4 top-4 z-50 text-amarillo bg-gray-600 p-2 rounded">
          <button
            onClick={toggleMenu}
            className="text-amarillo hover:text-gray-700 flex items-center space-x-2"
          >
            {menuVisible ? (
              <AiOutlineMenuFold size={30} />
            ) : (
              <AiOutlineMenuUnfold size={30} />
            )}
          </button>
        </div>
      )}

      {/* Menú Principal */}

      <header
        className={`relative z-10 flex-col items-center px-24 p-4 ${isExpRealty ? 'bg-gradient-to-r from-blue-900/40 via-amarillo/40 to-blue-900/40' : 'bg-white bg-opacity-40'
          } w-max mx-auto rounded-full shadow-2xl hidden lg:flex`}
      >
        {/* Íconos sociales y botón de menú */}
        <div className="absolute left-1/4 top-1/2 flex space-x-4 mt-4 ml-4">
          <button
            onClick={toggleMenu}
            className="text-black hover:text-gray-700 flex items-center space-x-2"
          >
            <span className="hidden lg:block">{menuVisible ? "Ver menos" : "Ver más"}</span>
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

        <Image src="/logo.png" alt="Logo" width={150} height={30} className="m-0" />

        <nav className="text-black flex items-center space-x-14 mt-4 text-2xl font-bold">
          <Link href="/" className="text-black hover:text-gray-700">
            Inicio
          </Link>
          <div
            ref={venderRef}
            className="relative whitespace-nowrap"
            onMouseEnter={handleMouseEnter}

          >
            <Link href="/vender" className="text-black hover:text-gray-700">
              Vende tu propiedad
            </Link>
            {isDropdownVisible && (
              <div
                className="absolute bg-black bg-opacity-50 rounded shadow-lg flex flex-col transition-all duration-300 ease-in-out text-2xl font-bold"
                style={{
                  top: "calc(100% + 18px)",
                  left: "0",
                  minWidth: venderRef.current ? venderRef.current.offsetWidth : "auto",
                }}
                onMouseLeave={handleMouseLeave}
              >
                <Link href="/vender/comprar" className="block px-4 py-2 text-white">
                  Compra tu propiedad
                </Link>
              </div>
            )}
          </div>
          <Link href="/exp-realty" className="text-black hover:text-gray-700">
            eXp Realty
          </Link>
          <div
            className="inline-block overflow-hidden transition-all duration-500 ease-in-out"
            style={{
              width: menuVisible ? `${extraLinksRef.current ? extraLinksRef.current.scrollWidth : 0}px` : "0px",
              marginLeft: menuVisible ? "3rem" : "0rem",
            }}
          >
            <div ref={extraLinksRef} className="inline-flex gap-11">
              <Link href="/reformas" className="text-black hover:text-gray-700 whitespace-nowrap">
                Reformas
              </Link>
              <Link href="/inversores" className="text-black hover:text-gray-700 whitespace-nowrap">
                Inversores
              </Link>
              <Link href="/blog" className="text-black hover:text-gray-700">
                Blog
              </Link>
            </div>
          </div>
          <Link href="/servicios" className="text-black hover:text-gray-700 whitespace-nowrap">
            Servicios
          </Link>
          <Link href="/contacto" className="text-black hover:text-gray-700">
            Contacto
          </Link>
        </nav>
      </header>

      {/* Menú Lateral para dispositivos móviles */}
      {menuVisible && (
        <div className="fixed top-0 left-0 w-full h-full bg-black bg-opacity-50 z-20 lg:hidden">
          <div className="bg-white bg-opacity-50 w-64 max-h-screen shadow-lg flex flex-col p-4">
            <div className="flex justify-between items-center">
              <Image src="/logo.png" alt="Logo" width={100} height={20} />
              <button onClick={toggleMenu} className="text-black hover:text-gray-700">
                <AiOutlineMenuFold size={30} />
              </button>
            </div>
            <nav className="mt-8 flex flex-col space-y-4 text-xl font-bold">
              <Link href="/" className="text-black hover:text-gray-700">
                Inicio
              </Link>
              <div className="relative whitespace-nowrap">
                <button onClick={toggleDropdown} className="text-black hover:text-gray-700">
                  Vende tu propiedad
                </button>
                <div
                  className={`transition-all duration-300 ease-in-out ${isDropdownVisible ? "max-h-40 opacity-100" : "max-h-0 opacity-0"
                    } overflow-hidden`}
                >
                  <Link
                    href="/vender/comprar"
                    className="block px-4 py-2 text-white bg-black bg-opacity-50 rounded shadow-lg"
                  >
                    Compra tu propiedad
                  </Link>
                </div>
              </div>
              <Link href="/exp-realty" className="text-black hover:text-gray-700">
                eXp Realty
              </Link>
              <Link href="/reformas" className="text-black hover:text-gray-700">
                Reformas
              </Link>
              <Link href="/inversores" className="text-black hover:text-gray-700">
                Inversores
              </Link>
              <Link href="/servicios" className="text-black hover:text-gray-700">
                Servicios
              </Link>
              <Link href="/blog" className="text-black hover:text-gray-700">
                Blog
              </Link>
              <Link href="/contacto" className="text-black hover:text-gray-700">
                Contacto
              </Link>
            </nav>
          </div>
        </div>
      )}
    </div>
  );
}
