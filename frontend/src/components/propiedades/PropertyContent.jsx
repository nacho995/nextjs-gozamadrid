"use client";
import React, { useState, useRef, useEffect } from "react";
import { HiMiniSquare3Stack3D } from "react-icons/hi2";
import { MdMeetingRoom } from "react-icons/md";
import { FaRestroom, FaBuilding, FaEuroSign, FaCalendarAlt, FaClock, FaHandshake, FaEnvelope, FaUser, FaTimes, FaMapMarkerAlt, FaChevronLeft, FaChevronRight } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import AnimatedOnScroll from "../AnimatedScroll";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, setHours, setMinutes } from "date-fns";
import es from "date-fns/locale/es";
import { toast } from "react-hot-toast";
import { sendPropertyEmail } from "@/pages/api";

export default function DefaultPropertyContent({ property }) {
  const [current, setCurrent] = useState(0);
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const calendarRef = useRef(null);
  const [showOfferPanel, setShowOfferPanel] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState(null);
  const offerPanelRef = useRef(null);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");

  // Adaptación para manejar los datos de WordPress
  const [propertyImages, setPropertyImages] = useState([]);

  // Extracción y procesamiento de datos de la propiedad de WordPress
  useEffect(() => {
    if (!property) return;
    
    setPropertyImages([]);
    setCurrent(0);
    
    let images = [];
    
    if (property.images && Array.isArray(property.images) && property.images.length > 0) {
      console.log("Procesando imágenes de la API:", property.images.length);
      
      // Prevenir doble proxying
      images = property.images.map(img => {
        let imageSrc = img.src;
        
        // IMPORTANTE: Verificar que no estamos haciendo proxy de un proxy
        // Solo aplicar proxy a URLs directas de realestategozamadrid.com
        if (imageSrc && 
            imageSrc.includes('realestategozamadrid.com') && 
            !imageSrc.includes('/api/image-proxy')) {
          imageSrc = `/api/image-proxy?url=${encodeURIComponent(imageSrc)}`;
        }
        
        return {
          src: imageSrc,
          alt: img.name || property.title || "Imagen de propiedad",
          originalSrc: img.src,
          isProxied: imageSrc !== img.src // Marcar si ya está proxificada
        };
      });
    } else {
      images = [{ 
        src: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&auto=format", 
        alt: "Imagen no disponible para " + (property.title || "esta propiedad"),
        isProxied: false
      }];
    }
    
    console.log(`Total de imágenes a mostrar: ${images.length}`);
    setPropertyImages(images);
  }, [property?.id]);

  useEffect(() => {
    if (propertyImages.length > 0) {
      console.log(`Preparando ${propertyImages.length} imágenes para mostrar en el carrusel`);
    }
  }, [propertyImages]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (calendarRef.current && !calendarRef.current.contains(event.target)) {
        setShowCalendar(false);
      }
    }

    if (showCalendar) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showCalendar]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (offerPanelRef.current && !offerPanelRef.current.contains(event.target)) {
        setShowOfferPanel(false);
      }
    }

    if (showOfferPanel) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showOfferPanel]);

  useEffect(() => {
    if (propertyImages.length > 0 && current >= propertyImages.length) {
      setCurrent(0);
    }
  }, [propertyImages, current]);

  if (!property) {
    return (
      <div className="container mx-auto py-8 text-center">
        <p className="text-lg text-white/80">No se encontró información de la propiedad</p>
      </div>
    );
  }

  const title = property.title || property.name || "Propiedad sin título";
  const content = property.description || property.content?.rendered || "";
  const excerpt = property.address || "Ubicación no disponible";
  const price = property.price || "Consultar precio";
  const bedrooms = property.bedrooms || "2";
  const bathrooms = property.bathrooms || "1";
  const area = property.area || "80";
  const location = property.address || "Madrid, España";
  const propertyType = property.typeProperty || "Propiedad";

  const filterAvailableDates = (date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date >= today && date.getDay() !== 0 && date.getDay() !== 6;
  };

  const availableTimes = Array.from({ length: 10 }, (_, i) => {
    return setHours(setMinutes(new Date(), 0), i + 9);
  });

  const handleSubmit = async () => {
    try {
      if (!property || !property.id) {
        toast.error("Error: Datos de propiedad incompletos");
        return;
      }

      const formData = {
        date: selectedDate,
        time: selectedTime,
        email,
        name,
        phone,
        property: property.id,
        propertyAddress: location,
      };

      console.log("Enviando datos:", formData);

      const response = await sendPropertyEmail(formData);

      if (response.success) {
        toast.success("Visita programada con éxito");
        setShowCalendar(false);
        setSelectedDate(null);
        setSelectedTime(null);
        setEmail("");
        setName("");
        setPhone("");
      } else {
        toast.error("Error al programar la visita");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al procesar la solicitud");
    }
  };

  const generateOfferRanges = (price) => {
    const numericPrice =
      typeof price === "string" ? parseInt(price.replace(/[^\d]/g, "")) : price;
    const basePrice = isNaN(numericPrice) ? 250000 : numericPrice;
    const ranges = [
      { percentage: 95, label: "5% menos", value: basePrice * 0.95 },
      { percentage: 90, label: "10% menos", value: basePrice * 0.90 },
      { percentage: 85, label: "15% menos", value: basePrice * 0.85 },
      { percentage: 80, label: "20% menos", value: basePrice * 0.80 },
      { percentage: 75, label: "25% menos", value: basePrice * 0.75 },
    ];
    return ranges;
  };

  const handleOfferSubmit = async () => {
    try {
      if (!property || !property.id || !selectedOffer) {
        toast.error("Error: Datos incompletos");
        return;
      }

      const formData = {
        property: property.id,
        propertyAddress: location,
        offerPrice: Math.round(selectedOffer.value),
        offerPercentage: selectedOffer.percentage,
        email,
        name,
        phone,
      };

      console.log("Enviando oferta:", formData);

      const response = { success: true, message: "Oferta enviada (simulada)" };

      if (response.success) {
        toast.success("Oferta enviada con éxito");
        setShowOfferPanel(false);
        setSelectedOffer(null);
        setEmail("");
        setName("");
        setPhone("");
      } else {
        toast.error(response.message || "Error al enviar la oferta");
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error(error.message || "Error al procesar la solicitud");
    }
  };

  // Manejador de errores mejorado para evitar proxies en cascada
  const handleImageError = (e) => {
    if (e.target.hasAttribute('data-error-handled')) {
      return;
    }
    
    const originalSrc = e.target.getAttribute('data-original-src') || e.target.src;
    console.log("Error al cargar imagen:", e.target.src);
    e.target.setAttribute('data-error-handled', 'true');
    
    // Comprobar si la imagen ya está siendo procesada por el proxy
    const isAlreadyProxied = e.target.src.includes('/api/image-proxy');
    
    // Si ya estamos usando el proxy y sigue fallando, ir directamente al respaldo
    if (isAlreadyProxied) {
      console.log("La imagen ya estaba en proxy y falló, usando respaldo final");
      e.target.src = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&auto=format";
      return;
    }
    
    // Si es del dominio problemático y no estamos usando el proxy, usar el proxy
    if (originalSrc.includes('realestategozamadrid.com') && !isAlreadyProxied) {
      console.log("Usando proxy para imagen de realestategozamadrid.com");
      e.target.src = `/api/image-proxy?url=${encodeURIComponent(originalSrc)}`;
    } else {
      // Si no podemos usar el proxy o ya falló con él, usar respaldo final
      e.target.src = "https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=400&auto=format";
    }
  };

  const nextImage = () => {
    setCurrent(current === propertyImages.length - 1 ? 0 : current + 1);
  };

  const prevImage = () => {
    setCurrent(current === 0 ? propertyImages.length - 1 : current - 1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <AnimatedOnScroll>
        <article className="relative">
          {/* Contenedor principal de imágenes */}
          <div className="flex flex-col mb-8">
            {/* Imagen principal arriba */}
            <div className="w-full mb-4">
              <div className="relative aspect-[4/3] md:aspect-[16/9] rounded-xl overflow-hidden shadow-lg">
                {propertyImages.length > 0 && propertyImages[current]?.src && (
                  <>
                    <img 
                      src={propertyImages[current].src}
                      alt={propertyImages[current].alt || "Imagen de propiedad"}
                      className="h-full w-full object-cover"
                      data-original-src={propertyImages[current].originalSrc || ""}
                      data-is-proxied={propertyImages[current].isProxied ? "true" : "false"}
                      onError={handleImageError}
                    />
                    
                    {/* Botones de navegación mejorados */}
                    <div className="absolute inset-0 flex items-center justify-between p-3">
                      <button
                        onClick={() => setCurrent((prev) => (prev === 0 ? propertyImages.length - 1 : prev - 1))}
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300"
                        aria-label="Imagen anterior"
                      >
                        <FaChevronLeft className="text-xl" />
                      </button>
                      
                      <button
                        onClick={() => setCurrent((prev) => (prev === propertyImages.length - 1 ? 0 : prev + 1))}
                        className="bg-black/50 hover:bg-black/70 text-white rounded-full p-3 backdrop-blur-sm transition-all duration-300"
                        aria-label="Imagen siguiente"
                      >
                        <FaChevronRight className="text-xl" />
                      </button>
                    </div>
                    
                    {/* Indicador de posición para todos los tamaños de pantalla */}
                    <div className="absolute bottom-3 right-3 bg-black/50 text-white text-sm px-3 py-1 rounded-full backdrop-blur-sm">
                      {current + 1} / {propertyImages.length}
                    </div>
                  </>
                )}
              </div>
            </div>
            
            {/* Miniaturas horizontales debajo - ocultas en móvil */}
            <div className="bg-gray-50 dark:bg-gray-900 p-2 rounded-lg hidden sm:block">
              <div className="flex flex-wrap justify-center gap-2">
                {propertyImages.map((image, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrent(index)}
                    className={`relative w-[80px] h-[60px] md:w-[100px] md:h-[75px] rounded-lg overflow-hidden border-2 transition-all duration-300 ${
                      index === current
                        ? "border-amarillo shadow-md scale-105"
                        : "border-gray-200 hover:border-amarillo/50 hover:shadow-sm hover:scale-105"
                    }`}
                  >
                    <img
                      src={image.src}
                      alt={image.alt}
                      className="h-full w-full object-cover"
                      data-original-src={image.originalSrc || ""}
                      data-is-proxied={image.isProxied ? "true" : "false"}
                      onError={handleImageError}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Información principal */}
          <div className="mt-8 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <div className="bg-black/50 backdrop-blur-sm rounded-xl p-4 md:p-6 mt-4">
              {/* Título de la propiedad con responsive */}
              <h1 className="text-3xl font-bold mb-2 text-black dark:text-white">{title}</h1>
              
              {/* Ubicación con responsive */}
              <div className="flex items-center gap-2 text-amber-400 mb-3">
                <FaMapMarkerAlt className="text-sm sm:text-base" />
                <p className="text-lg text-gray-700 dark:text-white mb-4">{location}</p>
              </div>
              
              {/* Detalles de la propiedad con responsive */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                  <MdMeetingRoom className="text-amarillo text-xl" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-amarillo">Habitaciones</p>
                    <p className="font-medium text-black dark:text-white">{bedrooms}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                  <FaRestroom className="text-amarillo text-xl" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-amarillo">Baños</p>
                    <p className="font-medium text-black dark:text-white">{bathrooms}</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                  <HiMiniSquare3Stack3D className="text-amarillo text-xl" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-amarillo">Área</p>
                    <p className="font-medium text-black dark:text-white">{area} m²</p>
                  </div>
                </div>
                <div className="bg-white dark:bg-gray-900 p-4 rounded-lg flex items-center gap-3">
                  <FaBuilding className="text-amarillo text-xl" />
                  <div>
                    <p className="text-sm text-gray-600 dark:text-amarillo">Tipo</p>
                    <p className="font-medium text-black dark:text-white">{propertyType}</p>
                  </div>
                </div>
              </div>
              
              {/* Precio con responsive */}
              <div className="flex items-center gap-2">
                <FaEuroSign className="text-amber-400 text-lg sm:text-xl" />
                <p className="text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">{price}</p>
              </div>
            </div>

            {/* Descripción con responsive */}
            <div 
              className="prose prose-lg max-w-none text-black dark:text-white 
                prose-p:dark:text-white prose-headings:dark:text-white 
                prose-li:dark:text-white prose-strong:dark:text-white" 
              dangerouslySetInnerHTML={{ __html: content }} 
            />

            {/* Botones de acción con responsive */}
            <div className="flex flex-col sm:flex-row justify-center gap-3 md:gap-4 mb-6 md:mb-8">
              <button
                onClick={() => setShowCalendar(true)}
                className="group relative inline-flex items-center gap-1 sm:gap-2 overflow-hidden rounded-full bg-white/20 dark:bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-sm"
              >
                <FaCalendarAlt className="text-base sm:text-lg text-black dark:text-white" />
                <span className="relative text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">
                  Agendar una visita
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-white via-amarillo to-white transition-transform duration-300 group-hover:translate-x-full"></span>
              </button>

              <button
                onClick={() => setShowOfferPanel(true)}
                className="group relative inline-flex items-center gap-1 sm:gap-2 overflow-hidden rounded-full bg-white/20 dark:bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-sm"
              >
                <FaHandshake className="text-base sm:text-lg text-black dark:text-white" />
                <span className="relative text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">
                  Hacer Oferta
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-white via-amarillo to-white transition-transform duration-300 group-hover:translate-x-full"></span>
              </button>
            </div>
          </div>

          {/* Calendario de visitas */}
          {showCalendar && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div ref={calendarRef} className="bg-white dark:bg-gray-900 rounded-xl p-8 max-w-md w-full mx-4 shadow-lg">
                <button
                  onClick={() => setShowCalendar(false)}
                  className="absolute top-4 right-4 text-black dark:text-white hover:text-amarillo dark:hover:text-amarillo transition-colors duration-300"
                >
                  <FaTimes className="text-xl" />
                </button>
                <h3 className="text-2xl font-bold mb-4 text-black dark:text-white">Agenda una visita</h3>
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Selecciona un día</label>
                    <DatePicker
                      selected={selectedDate}
                      onChange={(date) => setSelectedDate(date)}
                      filterDate={filterAvailableDates}
                      minDate={new Date()}
                      maxDate={addDays(new Date(), 30)}
                      locale={es}
                      placeholderText="Selecciona una fecha"
                      className="w-full p-2 border rounded-lg text-black bg-white dark:text-white dark:bg-gray-800"
                      dateFormat="dd/MM/yyyy"
                      required
                    />
                  </div>

                  {selectedDate && (
                    <div>
                      <label className="block text-sm font-medium text-black dark:text-white mb-2">Selecciona una hora</label>
                      <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map((time, index) => (
                          <button
                            key={index}
                            onClick={() => setSelectedTime(time)}
                            className={`p-2 rounded-lg transition-colors ${
                              selectedTime && time.getHours() === selectedTime.getHours()
                                ? "bg-amarillo text-white"
                                : "bg-gray-100 hover:bg-gray-200 text-black"
                            }`}
                          >
                            {time.getHours()}:00
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && (
                    <div>
                      <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-amarillo">
                        <FaUser className="mr-2 text-amarillo" />
                        Datos de contacto
                      </h3>
                      <div className="space-y-3">
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="Email de contacto"
                          className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-amarillo/70"
                        />
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          placeholder="Nombre completo"
                          className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-amarillo/70"
                        />
                        <input
                          type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="Teléfono"
                          className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-amarillo/70"
                        />
                      </div>
                    </div>
                  )}

                  {selectedDate && selectedTime && email && name && phone && (
                    <div className="flex flex-col sm:flex-row justify-end gap-2 mt-4">
                      <button
                        onClick={() => setShowCalendar(false)}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300 hover:scale-105"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleSubmit}
                        className="w-full sm:w-auto px-4 py-2 rounded-lg bg-amarillo text-black font-medium hover:bg-amarillo/90 transition-all duration-300 hover:scale-105"
                      >
                        Confirmar Visita
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Mapa de Google */}
          <div className="mt-8 bg-white dark:bg-gray-900 backdrop-blur-sm rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4 text-black dark:text-amarillo">Ubicación</h2>
            <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
              <iframe
                src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyAZAI0_oecmQkuzwZ4IM2H_NLynxD2Lkxo&q=${encodeURIComponent(
                  title + ', ' + location
                )}&zoom=15`}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                className="rounded-lg shadow-md"
              ></iframe>
            </div>
          </div>

          {/* Sección de preguntas */}
          <div className="bg-gradient-to-br from-amber-100 to-amber-200 dark:from-gray-900 dark:to-gray-800 rounded-2xl shadow-lg p-8 text-center mt-8">
            <h3 className="text-2xl font-semibold text-black dark:text-amarillo mb-6">¿Tienes preguntas sobre esta propiedad?</h3>
            <Link href="/contacto">
              <button className="group relative inline-flex items-center gap-1 sm:gap-2 overflow-hidden rounded-full bg-white/20 dark:bg-white/20 px-4 sm:px-6 md:px-8 py-2 sm:py-3 transition-all duration-300 hover:bg-white/30 dark:hover:bg-white/30 backdrop-blur-sm">
                <FaEnvelope className="text-base sm:text-lg text-black dark:text-white" />
                <span className="relative text-sm sm:text-base md:text-lg font-semibold text-black dark:text-white">
                  Contáctanos
                </span>
                <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-white via-amarillo to-white transition-transform duration-300 group-hover:translate-x-full"></span>
              </button>
            </Link>
          </div>

          {/* Panel de ofertas */}
          {showOfferPanel && (
            <div className="fixed inset-0 bg-black/50 dark:bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
              <div ref={offerPanelRef} className="bg-white dark:bg-black rounded-xl p-8 max-w-md w-full mx-4 relative">
                <button
                  onClick={() => setShowOfferPanel(false)}
                  className="absolute top-4 right-4 text-black dark:text-white hover:text-amarillo dark:hover:text-amarillo transition-colors duration-300"
                >
                  <FaTimes className="text-xl" />
                </button>
                <h3 className="text-2xl font-bold mb-6 text-black dark:text-white">Hacer una oferta</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Selecciona tu oferta</label>
                    <div className="space-y-2">
                      {generateOfferRanges(price).map((range, index) => (
                        <button
                          key={index}
                          onClick={() => setSelectedOffer(range)}
                          className={`w-full p-3 rounded-lg transition-all duration-300 flex justify-between items-center ${
                            selectedOffer?.percentage === range.percentage 
                              ? "bg-amarillo text-black font-semibold"
                              : "bg-gray-100 hover:bg-gray-200 text-black dark:bg-gray-900 dark:text-white dark:hover:bg-gray-800"
                          }`}
                        >
                          <span>{range.label}</span>
                          <span className="font-semibold">{Math.round(range.value).toLocaleString()}€</span>
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-black dark:text-white mb-2">Introduce tu oferta</label>
                    <input
                      type="number"
                      placeholder="Introduce tu oferta"
                      className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                      onChange={(e) =>
                        setSelectedOffer({
                          value: parseInt(e.target.value),
                          label: "Oferta personalizada",
                        })
                      }
                    />
                  </div>
                </div>
                {selectedOffer && (
                  <div className="mt-6 space-y-4 border-t pt-4">
                    <h3 className="text-lg font-semibold mb-2 flex items-center text-black dark:text-amarillo">
                      <FaUser className="mr-2 text-amarillo" />
                      Datos de contacto
                    </h3>
                    <div className="space-y-3">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="Email de contacto"
                        className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                      />
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Nombre completo"
                        className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                      />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Teléfono"
                        className="w-full p-2 border rounded-lg text-black dark:text-white bg-white dark:bg-gray-800 placeholder-gray-500 dark:placeholder-white/70"
                      />
                    </div>
                  </div>
                )}
                {selectedOffer && email && name && phone && (
                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={() => setShowOfferPanel(false)}
                      className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition-all duration-300"
                    >
                      Cancelar
                    </button>
                    <button
                      onClick={handleOfferSubmit}
                      className="px-4 py-2 rounded-lg bg-amarillo text-black font-medium hover:bg-amarillo/90 transition-all duration-300"
                    >
                      Enviar Oferta
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </article>
      </AnimatedOnScroll>
    </div>
  );
}
