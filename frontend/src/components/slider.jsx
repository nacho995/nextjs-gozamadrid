"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const images = [
  "/inicio.jpg", // Ruta de la imagen de fondo 1 (debe estar en la carpeta public)
  "/casas.jpg",  // Ruta de la imagen de fondo 2 (debe estar en la carpeta public)
];

export default function ImageSlider() {
  const [currentIndex, setCurrentIndex] = useState(0); // Índice de la imagen actual
  const [visible, setVisible] = useState(false); // Controla la opacidad del texto (si lo deseas)

  // Efecto para controlar la transición de opacidad del texto cada vez que cambia la imagen
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Efecto para cambiar de imagen automáticamente cada 8 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-screen overflow-hidden parallax">
      {/* Contenedor para las imágenes (60vh de altura) */}
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
              className={`absolute top-[30%] left-[10%] text-3xl font-bold z-10 transition-opacity duration-500 ${
                index === 1
                  ? "flex opacity-100 bg-black/70 p-3 rounded-xl text-white"
                  : "flex opacity-100 bg-white/70 p-3 rounded-xl text-black"
              }`}
            >
              ¿Quieres saber <br />
              el valor de tu vivienda?
            </div>

            {/* Gradiente superpuesto (solo para la imagen en el índice 1) */}
            <div
              className={`absolute top-0 left-0 w-full h-full ${
                index === 1 ? "block" : "hidden"
              } z-[5]`}
            >
              <div className="bg-gradient-to-r from-black/60 via-black/30 to-black/0 w-full h-full"></div>
            </div>

            {/* Imagen de fondo */}
            {/* El contenedor debe tener position: relative para que la imagen con fill funcione */}
            <div className="relative w-full h-full">
              <Image
                src={image}
                alt={`Slide ${index}`}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))}
      </div>

      {/* Botón centrado en la imagen */}
      <div className="p-3 bg-white/40 rounded-full absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <Link
          href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-transparent transition-colors flex items-center justify-center bg-amarillo text-black gap-2 hover:bg-black hover:text-white text-sm sm:text-base h-10 sm:h-12 px-4 sm:px-5 font-bold"
        >
          Valora el precio de tu propiedad
        </Link>
      </div>
    </div>
  );
}
