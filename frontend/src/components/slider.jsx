"use client";
import { useState, useEffect } from "react";
import Image from "next/image";
import AnimatedOnScroll from "./AnimatedScroll";

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
    <AnimatedOnScroll>
    <div className="relative w-full h-[60vh] overflow-hidden parallax">
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
              className={`absolute 
                top-[15%] md:top-[20%] lg:top-[15%] xl:top-[30%]
                left-[10%] 
                text-base sm:text-xl md:text-2xl lg:text-3xl 
                font-bold z-10 
                transition-opacity duration-500
                ${index === 1
                  ? "flex opacity-100 bg-black/40 sm:bg-black/50 md:bg-black/60 lg:bg-black/70 p-2 sm:p-3 rounded-lg sm:rounded-xl text-white"
                  : "flex opacity-100 bg-white/40 sm:bg-white/50 md:bg-white/60 lg:bg-white/70 p-2 sm:p-3 rounded-lg sm:rounded-xl text-black"
                }
                max-w-[80%] sm:max-w-[70%] md:max-w-[45%] lg:max-w-[35%] xl:max-w-[40%]
              `}
            >
              <span className="leading-tight">
                ¿Quieres saber <br />
                el valor de tu vivienda?
              </span>
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
      <div className="absolute top-[60%] md:top-[65%] lg:top-[60%] xl:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
        <a
          href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
          className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
            px-4 sm:px-6 lg:px-8 
            py-2 sm:py-2.5 lg:py-3 
            transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
            max-w-[90%] sm:max-w-[80%] lg:max-w-none"
        >
          <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
            Valora el precio de tu propiedad
          </span>
          <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
        </a>
      </div>
    </div>
    </AnimatedOnScroll>
  );
}
