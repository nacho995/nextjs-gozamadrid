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
  const [isVisible, setIsVisible] = useState(true);
  
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="fixed bottom-6 right-6"
          style={{ 
            zIndex: '2147483647',
            pointerEvents: 'auto',
            position: 'fixed',
            isolation: 'isolate'
          }}
        >
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            animate={{ 
              y: [0, -10, 0]
            }}
            transition={{ 
              y: { duration: 2, repeat: Infinity, ease: "easeInOut" }
            }}
            className="rounded-full"
            style={{
              zIndex: '2147483647',
              pointerEvents: 'auto',
              position: 'relative'
            }}
          >
            <a
              href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-gradient-to-r from-amarillo via-yellow-400 to-amarillo text-black font-bold px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 inline-flex items-center text-lg border-3 border-yellow-600 relative overflow-hidden group"
              style={{
                zIndex: '2147483647',
                pointerEvents: 'auto !important',
                position: 'relative',
                cursor: 'pointer'
              }}
              onMouseDown={(e) => e.stopPropagation()}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Efecto de brillo animado */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <FaCalculator className="mr-2 text-xl animate-pulse" />
              <span className="relative z-10">💰 Valorador Gratuito</span>
              
              {/* Botón de cerrar */}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setIsVisible(false);
                }}
                className="ml-3 text-black/60 hover:text-black text-sm"
              >
                ✕
              </button>
            </a>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

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
