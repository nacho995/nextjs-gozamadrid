"use client";
import React, { useState, useEffect } from "react";
import Image from "next/legacy/image";
import AnimatedOnScroll from "./AnimatedScroll";
import PropTypes from 'prop-types';

// Datos estructurados para las imágenes
const sliderData = [
  {
    src: "/inicio.jpg",
    alt: "Valoración de propiedades en Madrid",
    title: "¿Quieres saber\nel valor de tu vivienda?",
    description: "Descubre el valor real de tu propiedad en Madrid con nuestra herramienta de valoración profesional"
  },
  {
    src: "/casas.jpg",
    alt: "Propiedades exclusivas en Madrid",
    title: "¿Quieres saber\nel valor de tu vivienda?",
    description: "Obtén una valoración precisa de tu propiedad basada en datos del mercado inmobiliario actual"
  }
];

// Schema.org para el carrusel de imágenes
const getSliderSchema = () => ({
  "@context": "https://schema.org",
  "@type": "ItemList",
  "itemListElement": sliderData.map((slide, index) => ({
    "@type": "ImageObject",
    "position": index + 1,
    "contentUrl": `https://www.realestategozamadrid.com${slide.src}`,
    "name": slide.title.replace('\\n', ' '),
    "description": slide.description,
    "caption": slide.alt
  }))
});

const ImageSlider = ({ autoPlayInterval = 8000 }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);

  // Efecto para la transición de opacidad
  useEffect(() => {
    setVisible(false);
    const timer = setTimeout(() => {
      setVisible(true);
    }, 300);
    return () => clearTimeout(timer);
  }, [currentIndex]);

  // Efecto para el autoplay
  useEffect(() => {
    if (!isPlaying) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderData.length);
    }, autoPlayInterval);

    return () => clearInterval(interval);
  }, [isPlaying, autoPlayInterval]);

  // Manejadores de navegación
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + sliderData.length) % sliderData.length);
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % sliderData.length);
  };

  return (
    <AnimatedOnScroll>
      <section 
        className="relative w-full h-[60vh] overflow-hidden parallax"
        role="region"
        aria-label="Carrusel de imágenes de propiedades"
      >
        {/* Schema.org structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getSliderSchema()) }}
        />

        <div className="absolute w-full h-[60vh]">
          {sliderData.map((slide, index) => (
            <div
              key={index}
              className={`absolute top-0 left-0 w-full h-full transition-opacity duration-1000 ease-in-out ${
                index === currentIndex ? "opacity-100" : "opacity-0"
              }`}
              role="group"
              aria-label={`Slide ${index + 1} de ${sliderData.length}`}
              aria-hidden={index !== currentIndex}
            >
              {/* Texto superpuesto */}
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
                  {slide.title.split('\\n').map((line, i) => (
                    <React.Fragment key={i}>
                      {line}
                      {i < slide.title.split('\\n').length - 1 && <br />}
                    </React.Fragment>
                  ))}
                </span>
              </div>

              {/* Gradiente */}
              {index === 1 && (
                <div className="absolute top-0 left-0 w-full h-full z-[5]">
                  <div className="bg-gradient-to-r from-black/60 via-black/30 to-black/0 w-full h-full"></div>
                </div>
              )}

              {/* Imagen */}
              <div className="relative w-full h-full">
                <Image
                  src={slide.src}
                  alt={slide.alt}
                  layout="fill"
                  className="object-cover"
                  priority={index === 0}
                  sizes="100vw"
                  quality={90}
                />
              </div>
            </div>
          ))}
        </div>

        {/* Botón de valoración */}
        <div className="absolute top-[60%] md:top-[65%] lg:top-[60%] xl:top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10">
          <a
            href="https://es.statefox.com/mites/v/68a5a4c5e10bc5704c05f3f6"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
              px-4 sm:px-6 lg:px-8 
              py-2 sm:py-2.5 lg:py-3 
              transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
              max-w-[90%] sm:max-w-[80%] lg:max-w-none"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Valora el precio de tu propiedad - Abre en una nueva ventana"
          >
            <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
              Valora el precio de tu propiedad
            </span>
            <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
          </a>
        </div>

        {/* Controles de navegación ocultos para accesibilidad */}
        <div className="sr-only">
          <button onClick={handlePrevious} aria-label="Imagen anterior">
            Anterior
          </button>
          <button onClick={handleNext} aria-label="Siguiente imagen">
            Siguiente
          </button>
          <button 
            onClick={() => setIsPlaying(!isPlaying)} 
            aria-label={isPlaying ? "Pausar presentación" : "Reproducir presentación"}
          >
            {isPlaying ? "Pausar" : "Reproducir"}
          </button>
        </div>
      </section>
    </AnimatedOnScroll>
  );
};

ImageSlider.propTypes = {
  autoPlayInterval: PropTypes.number
};

export default ImageSlider;
