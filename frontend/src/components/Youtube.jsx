"use client";
import React, { useRef, useState } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Head from 'next/head';
import PropTypes from 'prop-types';

// Schema.org para el video de YouTube
const getYouTubeSchema = (videoId, title) => ({
  "@context": "https://schema.org",
  "@type": "VideoObject",
  "name": title || "¿Por qué unirte a eXp España?",
  "description": "Descubre las ventajas de unirte a eXp España, una de las agencias inmobiliarias de mayor crecimiento mundial. Aprende sobre nuevas formas de facturación y desarrollo profesional.",
  "uploadDate": "2024-01-01",
  "thumbnailUrl": `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
  "embedUrl": `https://www.youtube.com/embed/${videoId}`,
  "publisher": {
    "@type": "Organization",
    "name": "Goza Madrid",
    "logo": {
      "@type": "ImageObject",
      "url": "https://www.gozamadrid.com/logo.png"
    }
  },
  "potentialAction": {
    "@type": "WatchAction",
    "target": `https://www.youtube.com/watch?v=${videoId}`
  }
});

const YoutubeVideo = ({ videoId, title = "¿Por qué unirte a eXp España?" }) => {
  const iframeRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`;

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const handleIframeLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      <Head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(getYouTubeSchema(videoId, title)) }}
        />
      </Head>

      <AnimatedOnScroll>
        <section 
          className="relative w-full flex flex-col md:flex-row h-[50vh]"
          aria-label="Sección informativa sobre eXp España"
        >
          {/* Contenedor de texto */}
          <div
            className="w-full md:w-1/2 flex items-center justify-center p-4"
            style={{
              backgroundImage:
                "linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url('/exp-gold.gif')",
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
            role="complementary"
          >
            <div className="relative z-10 p-4 flex flex-col justify-center items-center">
              <h2 className="text-white text-sm sm:text-xl lg:text-4xl font-extrabold text-center">
                ¿Por qué unirte a eXp España?
              </h2>
              <p className="text-white text-sm sm:text-md lg:text-3xl font-bold text-center mx-20 mt-1">
                Rompe barreras con una de las agencias inmobiliarias de mayor crecimiento del mundo y descubre nuevas formas de facturar, aprender y hacer crecer tu negocio.
              </p>
            </div>
          </div>

          {/* Contenedor del video */}
          <div
            className="w-full md:w-1/2 flex items-center justify-center mt-4 md:mt-0 relative"
            style={{ aspectRatio: "16 / 9" }}
            role="region"
            aria-label="Video explicativo"
          >
            {/* Overlay de carga */}
            {!isLoaded && (
              <div 
                className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg"
                aria-label="Cargando video"
              >
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amarillo"></div>
              </div>
            )}

            <iframe
              ref={iframeRef}
              src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}?rel=0&modestbranding=1`}
              title={title}
              className="rounded-lg w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              onClick={handlePlay}
              onLoad={handleIframeLoad}
              loading="lazy"
              aria-label={`Video de YouTube: ${title}`}
            />

            {/* Texto alternativo para SEO */}
            <div className="sr-only">
              <h3>Beneficios de unirte a eXp España</h3>
              <ul>
                <li>Crecimiento profesional continuo</li>
                <li>Nuevas oportunidades de facturación</li>
                <li>Formación especializada</li>
                <li>Red internacional de contactos</li>
              </ul>
            </div>
          </div>
        </section>
      </AnimatedOnScroll>
    </>
  );
};

YoutubeVideo.propTypes = {
  videoId: PropTypes.string.isRequired,
  title: PropTypes.string
};

export default YoutubeVideo;
