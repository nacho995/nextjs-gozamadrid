"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const images = [
  "/inicio.jpg", // Ruta de la imagen de fondo 1
  "/Madrid.jpeg", // Ruta de la imagen de fondo 2
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0); // Índice de la imagen actual
  const [visible, setVisible] = useState(false); // Controla la opacidad del texto

  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);

    return () => clearTimeout(timer);
  }, [currentIndex]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 12000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden parallax">
      {/* Contenedor para las imágenes */}
      <div className="absolute w-full h-[60vh]">
        {images.map((image, index) => (
          <div
            key={index}
            className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            {/* Texto superpuesto a la imagen */}
            <div
              className={`absolute top-[30%] left-[10%] text-white text-3xl font-bold z-10 transition-opacity duration-500 ${
                index === 1 ? "flex opacity-100 bg-black/70 p-3 rounded-xl" : "hidden opacity-0"
              }`}
            >
              ¿Quieres saber <br />
              el valor de tu vivienda?
            </div>

            {/* Gradiente superpuesto */}
            <div
              className={`absolute top-0 left-0 w-full h-full ${
                index === 1 ? "flex" : "hidden"
              } z-5`}
            >
              <div className="bg-gradient-to-r from-black/60 via-black/30 to-black/0 w-full h-full"></div>
            </div>

            {/* Imagen de fondo */}
            <div className="w-full h-full">
              <Image
                className="object-cover w-full h-full"
                src={image}
                alt={`Slide ${index}`}
                layout="fill"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botón centrado en la imagen */}
      <div className="p-3 bg-white/40 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <Link
          className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-black text-white gap-2 hover:bg-amarillo hover:text-black text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-bold"
          href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
          target="_blank"
          rel="noopener noreferrer"
        >
          Valora tu propiedad
        </Link>
      </div>
    </div>
  );
}