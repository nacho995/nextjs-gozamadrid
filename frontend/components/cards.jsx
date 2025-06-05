"use client";
import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/legacy/image";
import Head from "next/head";
import Link from "next/link";
import { getCleanJsonLd } from "../utils/structuredDataHelper";
import { 
  FaChartLine, 
  FaHome, 
  FaHandshake, 
  FaUsers, 
  FaHeart,
  FaArrowRight,
  FaClock,
  FaEye,
  FaCheckCircle,
  FaCalculator
} from 'react-icons/fa';
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCalculator, FaDiamond, FaCrown, FaGem } from 'react-icons/fa';

const cardData = [
    {
        id: 'venta-agil',
        title: "Ventas ágiles y seguras",
        subtitle: "En un máximo de 70 días",
        icon: <FaClock className="text-3xl" />,
        points: [
            "Vender un piso no es jugar a la lotería",
            "Sabemos que el mercado inmobiliario ha subido de precio",
            "Algunos propietarios están inflando los precios",
            "El precio fuera de mercado aleja a compradores"
        ],
        image: "/analisis.png",
        alt: "Análisis de ventas inmobiliarias"
    },
    {
        id: 'razon-no-venta',
        title: "¿Por qué no se vende",
        subtitle: "tu inmueble?",
        icon: <FaEye className="text-3xl" />,
        points: [
            "Precio correcto = venta rápida y efectiva",
            "Precio inflado = meses sin vender",
            "Vende con estrategia, no con especulación",
            "Te ayudamos a definir el precio real"
        ],
        image: "/agenteinmo.png",
        alt: "Estrategias de venta inmobiliaria"
    },
    {
        id: 'valor-mercado',
        title: "El valor está",
        subtitle: "en el mercado",
        icon: <FaChartLine className="text-3xl" />,
        points: [
            "Los recuerdos van contigo, el valor lo pone el mercado",
            "Compradores buscan: ubicación, precio, potencial",
            "Acepta el cambio y vende con decisión"
        ],
        image: "/analisisdemercado.jpeg",
        alt: "Análisis de mercado inmobiliario"
    },
    {
        id: 'agentes-confianza',
        title: "Agentes Inmobiliarios",
        subtitle: "de Confianza",
        icon: <FaUsers className="text-3xl" />,
        points: [
            "Somos vendedores y negociadores",
            "Acompañamos, asesoramos y logramos acuerdos",
            "Dedicación, negociación efectiva y confianza",
            "Vendemos entendiendo y ayudando"
        ],
        image: "/agentesinmobiliarios.jpeg",
        alt: "Equipo de agentes inmobiliarios"
    },
    {
        id: 'conexion-cliente',
        title: "Conexión genuina",
        subtitle: "con el cliente",
        icon: <FaHeart className="text-3xl" />,
        points: [
            "Escuchamos y asesoramos honestamente",
            "Nos enfocamos en la persona, no solo en la transacción",
            "Creamos confianza para que nos elijan siempre",
            "Marta López: Tu vendedora de confianza"
        ],
        image: "/formFoto.jpeg",
        alt: "Atención personalizada al cliente"
    },
];

// Componente de tarjeta con colores corporativos
function CorporateCard({ card, index, cardId, onExpandChange }) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isHovered, setIsHovered] = useState(false);

    // Función para manejar el cambio de expansión
    const handleExpandToggle = () => {
        const newExpandedState = !isExpanded;
        setIsExpanded(newExpandedState);
        
        // Actualizar el set de cards expandidas
        if (onExpandChange) {
            onExpandChange(prev => {
                const newSet = new Set(prev);
                if (newExpandedState) {
                    newSet.add(cardId);
                } else {
                    newSet.delete(cardId);
                }
                console.log('Cards expandidas:', newSet.size); // Debug
                return newSet;
            });
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true }}
            className="group relative"
        >
            <div
                className="relative overflow-hidden rounded-2xl shadow-xl bg-white border-2 border-gray-100 hover:border-amarillo transition-all duration-300"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                data-expanded={isExpanded}
            >
                {/* Imagen de fondo con overlay corporativo */}
                <div className="relative h-64 lg:h-80 overflow-hidden">
                    <Image
                        src={card.image}
                        alt={card.alt}
                        layout="fill"
                        objectFit="cover"
                        className="transition-transform duration-700 group-hover:scale-110"
                        priority={index < 3}
                    />
                    {/* Overlay con colores corporativos */}
                    <div className={`absolute inset-0 transition-all duration-500 ${
                        isHovered 
                            ? 'bg-gradient-to-t from-black via-black/80 to-black/60' 
                            : 'bg-gradient-to-t from-black/90 via-black/70 to-black/50'
                    }`} />
                    
                    {/* Contenido principal */}
                    <div className="absolute inset-0 p-6 flex flex-col justify-between text-white">
                        {/* Header con icono dorado */}
                        <div className="flex items-start justify-between">
                            <motion.div
                                className="bg-amarillo/20 backdrop-blur-sm p-3 rounded-full border border-amarillo/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                                transition={{ type: "spring", stiffness: 300 }}
                            >
                                <div className="text-amarillo">
                                    {card.icon}
                                </div>
                            </motion.div>
                            <div className="text-right">
                                <div className="text-xs font-medium bg-amarillo/20 backdrop-blur-sm px-3 py-1 rounded-full border border-amarillo/30 text-amarillo">
                                    Servicio #{index + 1}
                                </div>
                            </div>
                        </div>

                        {/* Título principal */}
                        <div className="space-y-2">
                            <h3 className="text-2xl lg:text-3xl font-bold leading-tight text-white">
                                {card.title}
                            </h3>
                            <p className="text-lg lg:text-xl font-medium text-amarillo">
                                {card.subtitle}
                            </p>
                        </div>

                        {/* Botón de expansión con colores corporativos */}
                        <motion.button
                            onClick={handleExpandToggle}
                            className="self-start bg-amarillo/20 backdrop-blur-sm hover:bg-amarillo hover:text-black px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 flex items-center space-x-2 border border-amarillo/30 text-white hover:border-amarillo"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <span>{isExpanded ? 'Ver menos' : 'Ver detalles'}</span>
                            <motion.div
                                animate={{ rotate: isExpanded ? 180 : 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <FaArrowRight className="text-xs" />
                            </motion.div>
                        </motion.button>
                    </div>
                </div>

                {/* Panel expandible con detalles */}
                <AnimatePresence>
                    {isExpanded && (
                        <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.4, ease: "easeInOut" }}
                            className="bg-white overflow-hidden border-t border-gray-100"
                        >
                            <div className="p-6 space-y-4">
                                <h4 className="text-lg font-bold text-black flex items-center">
                                    <FaCheckCircle className="text-amarillo mr-2" />
                                    Puntos clave:
                                </h4>
                                <div className="space-y-3">
                                    {card.points.map((point, pointIndex) => (
                                        <motion.div
                                            key={pointIndex}
                                            initial={{ opacity: 0, x: -20 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            transition={{ delay: pointIndex * 0.1 }}
                                            className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg hover:bg-amarillo/10 transition-colors duration-200 border border-gray-100 hover:border-amarillo/30"
                                        >
                                            <div className="w-2 h-2 rounded-full bg-amarillo mt-2 flex-shrink-0" />
                                            <p className="text-gray-700 text-sm leading-relaxed">{point}</p>
                                        </motion.div>
                                    ))}
                                </div>
                                
                                {/* CTA Button con colores corporativos */}
                                <motion.div
                                    className="pt-4 border-t border-gray-100"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.3 }}
                                >
                                    <a
                                        href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center space-x-2 bg-amarillo hover:bg-yellow-600 text-black px-6 py-3 rounded-full font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 border border-amarillo"
                                    >
                                        <span>🏠 Valorador Gratuito</span>
                                        <FaArrowRight className="text-sm" />
                                    </a>
                                </motion.div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </motion.div>
    );
}

// Componente de botón flotante del valorador
export function FloatingValoradorButton() {
    const { menuVisible } = useNavbar(); // Detectar estado del menú global
    const [isHovered, setIsHovered] = useState(false);
    const [isPulsing, setIsPulsing] = useState(true);
  
    // Efecto de pulsación sutil cada 5 segundos para llamar la atención
    useEffect(() => {
      const interval = setInterval(() => {
        setIsPulsing(true);
        setTimeout(() => setIsPulsing(false), 2000);
      }, 8000);
      return () => clearInterval(interval);
    }, []);

    // Posición dinámica basada en el estado del menú global
    const getPositionStyle = () => {
      if (menuVisible) {
        return {
          right: '420px', // Se mueve fuera del área del menú hacia la izquierda
          bottom: '32px'
        };
      }
      return {
        right: '32px', // Posición normal
        bottom: '32px'
      };
    };

    const positionStyle = getPositionStyle();
  
    return (
      <>
        {/* Aura de resplandor ambiental */}
        <motion.div
          initial={{ opacity: 0, scale: 0 }}
          animate={{ 
            opacity: isPulsing ? [0, 0.6, 0] : 0, 
            scale: isPulsing ? [0.8, 1.4, 0.8] : 0.8 
          }}
          transition={{ 
            duration: 2,
            ease: "easeInOut",
            repeat: isPulsing ? 2 : 0
          }}
          className="fixed z-40 pointer-events-none transition-all duration-300 ease-in-out"
          style={positionStyle}
        >
          <div className="w-32 h-32 rounded-full bg-gradient-radial from-yellow-400/30 via-amber-500/20 to-transparent blur-xl"></div>
        </motion.div>
  
        {/* Botón principal ultra-premium */}
        <motion.div
          initial={{ opacity: 0, scale: 0.3, y: 100 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ 
            duration: 1.2, 
            delay: 2.5,
            type: "spring",
            stiffness: 200,
            damping: 20
          }}
          className="fixed z-50 transition-all duration-300 ease-in-out"
          style={positionStyle}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <motion.div
            animate={{ 
              y: isPulsing ? [0, -8, 0] : 0,
              scale: isHovered ? 1.05 : 1
            }}
            transition={{ 
              duration: 0.3,
              ease: "easeOut"
            }}
            className="relative group"
          >
            {/* Marco exterior dorado con brillo */}
            <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Botón base con gradientes complejos */}
            <motion.a
              href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
              target="_blank"
              rel="noopener noreferrer"
              className="relative flex items-center gap-4 px-8 py-5 rounded-full overflow-hidden shadow-2xl transform transition-all duration-500 group"
              style={{
                background: `linear-gradient(135deg, 
                  #FFD700 0%, 
                  #FFA500 15%,
                  #FFD700 30%, 
                  #B8860B 45%,
                  #DAA520 60%,
                  #FFD700 75%,
                  #FFA500 90%,
                  #FFD700 100%)`,
                boxShadow: `
                  0 25px 50px -12px rgba(255, 215, 0, 0.5),
                  0 0 30px rgba(255, 215, 0, 0.3),
                  inset 0 1px 0 rgba(255, 255, 255, 0.4),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.2)
                `
              }}
              whileHover={{
                boxShadow: `
                  0 35px 70px -12px rgba(255, 215, 0, 0.6),
                  0 0 50px rgba(255, 215, 0, 0.4),
                  inset 0 1px 0 rgba(255, 255, 255, 0.6),
                  inset 0 -1px 0 rgba(0, 0, 0, 0.1)
                `
              }}
              whileTap={{ scale: 0.98 }}
              aria-label="Obtener valoración gratuita de propiedad de lujo"
              title="Valoración profesional gratuita • Propiedades exclusivas"
            >
              {/* Efecto de brillo animado */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12"
                animate={{
                  x: isHovered ? "200%" : "-200%"
                }}
                transition={{
                  duration: 0.8,
                  ease: "easeInOut"
                }}
              />
  
              {/* Patrón de textura sutil */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                  backgroundSize: '20px 20px'
                }}
              />
  
              {/* Contenido del botón */}
              <div className="relative z-10 flex items-center gap-4">
                {/* Icono premium con animación */}
                <motion.div
                  animate={{ 
                    rotate: isHovered ? 360 : 0,
                    scale: isHovered ? 1.1 : 1
                  }}
                  transition={{ 
                    duration: 0.8,
                    ease: "easeInOut"
                  }}
                  className="relative"
                >
                  <div className="absolute inset-0 bg-black/20 rounded-full blur-sm"></div>
                  <div className="relative bg-black/10 p-2 rounded-full backdrop-blur-sm">
                    <FaGem className="text-2xl text-white drop-shadow-lg" />
                  </div>
                </motion.div>
  
                {/* Texto premium responsive */}
                <div className="flex flex-col items-start">
                  <motion.span 
                    className="font-serif text-white font-bold text-lg tracking-wide leading-tight drop-shadow-lg hidden lg:block"
                    animate={{ 
                      textShadow: isHovered 
                        ? "0 0 20px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.5)"
                        : "0 2px 4px rgba(0,0,0,0.3)"
                    }}
                    transition={{ duration: 0.3 }}
                  >
                    Valoración
                  </motion.span>
                  <motion.span 
                    className="font-serif text-white/90 font-semibold text-sm tracking-widest uppercase hidden lg:block"
                    animate={{ 
                      textShadow: isHovered 
                        ? "0 0 15px rgba(255,255,255,0.6), 0 1px 2px rgba(0,0,0,0.5)"
                        : "0 1px 2px rgba(0,0,0,0.3)"
                    }}
                  >
                    Premium
                  </motion.span>
                  
                  {/* Versión móvil */}
                  <motion.span 
                    className="font-serif text-white font-bold text-base tracking-wide drop-shadow-lg lg:hidden"
                    animate={{ 
                      textShadow: isHovered 
                        ? "0 0 15px rgba(255,255,255,0.8), 0 2px 4px rgba(0,0,0,0.5)"
                        : "0 2px 4px rgba(0,0,0,0.3)"
                    }}
                  >
                    Valorar
                  </motion.span>
                </div>
  
                {/* Indicador de "Gratuito" */}
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ 
                    scale: isHovered ? 1 : 0, 
                    opacity: isHovered ? 1 : 0 
                  }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  className="absolute -top-3 -right-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg hidden lg:block"
                >
                  GRATIS
                </motion.div>
              </div>
  
              {/* Partículas flotantes decorativas */}
              <AnimatePresence>
                {isHovered && (
                  <>
                    {[...Array(8)].map((_, i) => (
                      <motion.div
                        key={i}
                        className="absolute w-1 h-1 bg-white rounded-full"
                        initial={{ 
                          opacity: 0, 
                          scale: 0,
                          x: 40,
                          y: 20
                        }}
                        animate={{ 
                          opacity: [0, 1, 0], 
                          scale: [0, 1, 0],
                          x: [40, 40 + (Math.random() - 0.5) * 80],
                          y: [20, 20 + (Math.random() - 0.5) * 60]
                        }}
                        exit={{ opacity: 0, scale: 0 }}
                        transition={{ 
                          duration: 1.5,
                          delay: i * 0.1,
                          ease: "easeOut"
                        }}
                      />
                    ))}
                  </>
                )}
              </AnimatePresence>
            </motion.a>
  
            {/* Tooltip premium al hacer hover */}
            <AnimatePresence>
              {isHovered && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.9 }}
                  transition={{ duration: 0.3 }}
                  className="absolute bottom-full right-0 mb-4 bg-black/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-2xl border border-yellow-400/30 hidden lg:block"
                  style={{ minWidth: '280px' }}
                >
                  <div className="text-center">
                    <div className="flex items-center justify-center gap-2 mb-1">
                      <FaCrown className="text-yellow-400 text-sm" />
                      <span className="font-serif font-semibold text-sm">Valoración Profesional</span>
                      <FaCrown className="text-yellow-400 text-sm" />
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed">
                      Análisis completo del mercado inmobiliario de lujo
                    </p>
                    <div className="flex items-center justify-center gap-4 mt-2 text-xs text-yellow-400">
                      <span>✓ Inmediato</span>
                      <span>✓ Sin compromiso</span>
                      <span>✓ Confidencial</span>
                    </div>
                  </div>
                  
                  {/* Flecha del tooltip */}
                  <div className="absolute top-full right-8 w-0 h-0 border-l-8 border-r-8 border-t-8 border-l-transparent border-r-transparent border-t-black/90"></div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </>
    );
  };
  

// Función para generar datos estructurados de servicio
const createServiceStructuredData = (id, title, description, image, serviceUrl) => {
    const structuredData = {
        "@context": "https://schema.org",
        "@type": "Service",
        "serviceType": "RealEstateService",
        "name": title || "",
        "description": typeof description === 'string' ? description : "Servicio inmobiliario en Madrid",
        "provider": {
            "@type": "RealEstateAgent",
            "name": "Goza Madrid",
            "url": "https://realestategozamadrid.com"
        },
        "url": serviceUrl || "https://realestategozamadrid.com"
    };

    if (image) {
        structuredData.image = `https://realestategozamadrid.com${image}`;
    }

    return structuredData;
};

export default function Cards() {
    const [expandedCards, setExpandedCards] = useState(new Set());
    
    // Calcular espaciado dinámico basado en cards expandidas
    const getDynamicSpacing = () => {
        const hasExpandedCards = expandedCards.size > 0;
        return {
            marginBottom: hasExpandedCards ? '100px' : '50px'
        };
    };
    
    // Extraer descripciones de texto para los datos estructurados
    const cardDescriptions = cardData.map(card => {
        const description = card.points.join(" ");
        return { id: card.id, description };
    });
    
    // Crear objeto de datos estructurados
    const itemListData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": cardData.map((card, index) => {
            const descriptionObj = cardDescriptions.find(item => item.id === card.id);
            const description = descriptionObj ? descriptionObj.description : "Servicios inmobiliarios profesionales en Madrid";
            
            return {
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Service",
                    "serviceType": "RealEstateService",
                    "name": `${card.title} ${card.subtitle}` || "Servicio Inmobiliario",
                    "description": description,
                    "provider": {
                        "@type": "RealEstateAgent",
                        "name": "Goza Madrid",
                        "url": "https://realestategozamadrid.com",
                        "areaServed": {
                            "@type": "City",
                            "name": "Madrid"
                        }
                    },
                    "url": `https://realestategozamadrid.com/#${card.id}`,
                    "image": `https://realestategozamadrid.com${card.image}`
                }
            };
        })
    };
    
    // Convertir a JSON-LD limpio
    const cleanItemListData = getCleanJsonLd(itemListData);

    console.log('🔥 CARDS EXPANDIDAS:', expandedCards.size, 'Espaciado aplicado:', expandedCards.size > 0 ? '800px + 400px' : '0px'); // Debug
    
    return (
        <section 
            className="py-8 sm:py-12 lg:py-16 bg-transparent relative z-10"
            aria-label="Servicios inmobiliarios destacados"
        >
            <Head>
                <title>Servicios Inmobiliarios | Goza Madrid</title>
                <meta 
                    name="description" 
                    content="Descubre nuestros servicios inmobiliarios especializados: ventas ágiles, asesoramiento experto y gestión profesional de propiedades en Madrid."
                />
                <meta 
                    name="keywords" 
                    content="servicios inmobiliarios, venta de propiedades, asesoramiento inmobiliario, agentes inmobiliarios madrid, precio de mercado inmobiliario"
                />
                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: cleanItemListData }}
                />
            </Head>
            
            <div className="container mx-auto px-4">
                {/* Header de la sección con colores corporativos */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    viewport={{ once: true }}
                    className="text-center mb-16"
                >
                    <h2 className="text-4xl lg:text-5xl font-bold text-black mb-6">
                        Nuestros <span className="text-amarillo">Servicios</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
                        Cada propiedad es única, cada cliente tiene necesidades específicas. 
                        Descubre cómo podemos ayudarte con nuestros servicios especializados.
                    </p>
                </motion.div>

                {/* Grid de tarjetas con colores corporativos */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
                    {cardData.map((card, index) => (
                        <CorporateCard 
                            key={card.id} 
                            card={card} 
                            index={index} 
                            cardId={card.id}
                            onExpandChange={setExpandedCards}
                        />
                    ))}
                </div>

                {/* CTA final con colores corporativos */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, delay: 0.5 }}
                    viewport={{ once: true }}
                    className="text-center mt-16"
                    style={{
                        ...getDynamicSpacing(),
                        transition: 'margin-bottom 0.5s ease-in-out'
                    }}
                >
                    <div className="bg-gradient-to-r from-amarillo/10 to-amarillo/5 backdrop-blur-sm rounded-2xl p-8 border border-amarillo/20">
                        <h3 className="text-2xl font-bold text-black mb-4">
                            ¿Listo para comenzar?
                        </h3>
                        <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
                            Contacta con nosotros y descubre cómo podemos ayudarte a alcanzar tus objetivos inmobiliarios.
                        </p>
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <a
                                href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center space-x-2 bg-amarillo hover:bg-yellow-600 text-black font-bold px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 text-lg"
                            >
                                <span>🏠 Valorador Gratuito - ¡Descubre el valor real!</span>
                                <FaArrowRight />
                            </a>
                        </motion.div>
                    </div>
                </motion.div>
            </div>

        </section>
    );
}
