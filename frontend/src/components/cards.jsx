"use client";
import React, { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/image";
import Head from "next/head";
import Link from "next/link";
import { getCleanJsonLd } from "../utils/structuredDataHelper";

const cardData = [
    {
        id: 'venta-agil',
        front: "Ventas ágiles y seguras en un máximo de 70 días",
        back: (
            <ol>
                <li>Vender un piso no es jugar a la lotería.</li>
                <li>Sabemos que el mercado inmobiliario ha subido de precio.</li>
                <li>¡Ojo! Algunos propietarios están inflando los precios, pensando que así sacarán más beneficio.</li>
                <li>El precio fuera de mercado aleja a compradores.</li>
            </ol>
        ),
        alt: "Análisis de ventas inmobiliarias",
        image: "/analisis.png"
    },
    {
        id: 'razon-no-venta',
        front: "¿Por qué no se vende tu inmueble?",
        back: (
            <ol>
                <li>Precio correcto = venta rápida y efectiva.</li>
                <li>Precio inflado = meses (o años) sin vender, y posibles bajadas obligadas.</li>
                <li>Si de verdad quieres vender, hazlo con estrategia y no con especulación.</li>
                <li>Te ayudamos a definir el precio real de tu vivienda para que no pierdas el tiempo.</li>
            </ol>
        ),
        alt: "Estrategias de venta inmobiliaria",
        image: "/agenteinmo.png"
    },
    {
        id: 'valor-mercado',
        front: "Vender tu casa: El valor está en el mercado",
        back: (
            <ol>
                <li>Los recuerdos van contigo, el valor lo pone el mercado.</li>
                <li>Compradores buscan: ubicación, precio, potencial.</li>
                <li>Acepta el cambio y vende con decisión.</li>
            </ol>
        ),
        alt: "Análisis de mercado inmobiliario",
        image: "/analisisdemercado.jpeg"
    },
    {
        id: 'agentes-confianza',
        front: "Agentes Inmobiliarios de Confianza",
        back: (
            <ol>
                <li>Somos vendedores y negociadores.</li>
                <li>Acompañamos, asesoramos y logramos acuerdos.</li>
                <li>Dedicación, negociación efectiva y confianza.</li>
                <li>Vendemos entendiendo y ayudando.</li>
            </ol>
        ),
        alt: "Equipo de agentes inmobiliarios",
        image: "/agentesinmobiliarios.jpeg"
    },
    {
        id: 'conexion-cliente',
        front: "Conexión genuina con el cliente",
        back: (
            <ol>
                <li>Escuchamos y asesoramos honestamente.</li>
                <li>Nos enfocamos en la persona, no solo en la transacción.</li>
                <li>Creamos confianza para que nos elijan siempre.</li>
                <li>Marta López: Tu vendedora de confianza.</li>
            </ol>
        ),
        alt: "Atención personalizada al cliente",
        image: "/formFoto.jpeg"
    },
];

/* ============================
   Desktop Version (PC) - visible en lg (≥1024px)
   ============================ */
function DesktopCards({ card, index }) {
    // Mantenemos los refs y estados originales para el efecto de flip en desktop
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
        if (venderRef.current) {
            const rect = venderRef.current.getBoundingClientRect();
            setVenderRect(rect);
        }
    }, [venderRect, venderRef]);

    return (
        <AnimatedOnScroll>
            <div 
                className="relative w-[40vw] h-[50vh] group [perspective:1000px] transform transition duration-300 hover:scale-105"
                role="article"
                aria-label={card.front}
            >
                <div 
                    className="h-full w-[19vw] transition-all duration-500 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]"
                    tabIndex={0}
                    onKeyPress={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            e.currentTarget.classList.toggle('rotate-y-180');
                        }
                    }}
                >
                    {/* Cara Frontal */}
                    <div 
                        className="absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]"
                        role="region"
                        aria-label="Frente de la tarjeta"
                    >
                        <div className="absolute inset-0 rounded-2xl shadow-lg overflow-hidden">
                            <div className="absolute inset-0 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                                <div className="relative w-full h-full">
                                    <Image
                                        src="/fondoamarillo.jpg" 
                                        alt="Fondo decorativo"
                                        fill
                                        className="object-cover"
                                        style={{ objectPosition: 'center' }}
                                        priority={index < 2}
                                    />
                                    <div className="absolute inset-0 rounded-xl"></div>
                                </div>
                            </div>

                            <div className="relative z-10 flex flex-col justify-center items-center p-6 text-center h-full">
                                <Image
                                    src={card.image}
                                    alt={card.alt}
                                    width={150}
                                    height={150}
                                    className="mb-4 rounded-full h-[12vh] w-[12vh] object-cover border-2 border-white/20 shadow-xl transform transition-transform duration-300 group-hover:scale-110"
                                    priority={index < 2}
                                />

                                <h2 
                                    className="text-2xl font-bold text-center z-20 mt-2 text-white"
                                    style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                                >
                                    {card.front}
                                </h2>
                            </div>
                        </div>
                    </div>

                    {/* Cara Trasera */}
                    <div 
                        className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] z-10"
                        role="region"
                        aria-label="Reverso de la tarjeta"
                    >
                        <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                            <Image
                                src="/fondonegro.jpg"
                                alt="Background"
                                fill
                                className="object-cover"
                                quality={100}
                            />
                            <div className="absolute inset-0 flex flex-col items-center justify-center p-4 sm:p-6">
                                <div className="text-center overflow-hidden whitespace-normal break-words max-h-full overflow-y-auto">
                                    <ol className="list-decimal list-inside text-left text-white text-xs sm:text-sm">
                                        {card.back.props.children}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedOnScroll>
    );
}

/* ============================
   Mobile Version (Smartphones) - visible en <768px
   ============================ */
function MobileCard({ card, index }) {
    const [isFlipped, setIsFlipped] = useState(false);
    
    const handleCardClick = () => {
        setIsFlipped(!isFlipped);
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
            setIsFlipped(!isFlipped);
        }
    };
    
    // Función para determinar qué imagen mostrar según el índice
    const getCardImage = () => {
        switch(index) {
            case 0: return "/analisis.png";
            case 1: return "/agenteinmo.png";
            case 2: return "/analisisdemercado.jpeg";
            case 3: return "/agentesinmobiliarios.jpeg";
            case 4: return "/formFoto.jpeg";
            default: return "/analisis.png";
        }
    };
    
    return (
        <div 
            className="relative w-[90vw] h-[50vh] group [perspective:1000px] transform transition duration-300 hover:scale-105"
            onClick={handleCardClick}
            onKeyPress={handleKeyPress}
            role="article"
            aria-label={card.front}
            tabIndex={0}
        >
            <div className={`h-full w-full transition-all duration-500 [transform-style:preserve-3d] ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                {/* Cara Frontal */}
                <div className="absolute inset-0 w-full h-full [backface-visibility:hidden] [-webkit-backface-visibility:hidden]">
                    <div className="absolute inset-0 rounded-2xl shadow-lg overflow-hidden">
                        {/* Modificación para solucionar el problema en Safari */}
                        <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden">
                            <div className="relative w-full h-full">
                                <Image
                                    src="/fondoamarillo.jpg" 
                                    alt="Fondo"
                                    fill
                                    className="object-cover"
                                    style={{ objectPosition: 'center' }}
                                />
                                <div className="absolute inset-0 bg-black/30 rounded-xl"></div>
                            </div>
                        </div>
                        
                        <div className="relative z-10 flex flex-col justify-center items-center p-6 text-center h-full">
                            {/* Imagen en el centro como en alquilerTuristico */}
                            <div className="mb-4 hover:scale-110 transition-transform duration-300">
                                <img
                                    src={getCardImage()}
                                    alt={`Imagen para ${card.front}`}
                                    className="rounded-full h-[12vh] w-[12vh] sm:h-[15vh] sm:w-[15vh] object-cover border-2 border-white/20 shadow-md"
                                />
                            </div>
                            
                            <h2 
                                className="text-lg sm:text-lg md:text-xl font-bold mb-2 text-white"
                                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                            >
                                {card.front}
                            </h2>
                            
                            <div 
                                className="mt-2 text-white/80 text-[10px] sm:text-sm"
                                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                            >
                                Toca para más info
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cara Trasera */}
                <div className="absolute inset-0 w-full h-full [transform:rotateY(180deg)] [backface-visibility:hidden] [-webkit-backface-visibility:hidden] z-10">
                    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-xl">
                        {/* Fondo con estilo alquilerTuristico */}
                        <Image
                            src="/fondonegro.jpg"
                            alt="Background"
                            fill
                            className="object-cover"
                            quality={100}
                        />
                        <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-8">
                            <div className="text-center overflow-hidden whitespace-normal break-words">
                                <ol className="list-decimal list-inside text-left text-white text-xs sm:text-sm md:text-base">
                                    {card.back.props.children}
                                </ol>
                                <span 
                                    className="mt-4 text-white/80 text-[10px] sm:text-xs block"
                                    style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                                >
                                    Toca para volver
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabletCard({ card, index }) {
    const [flipped, setFlipped] = useState(false);

    const getCardImage = () => {
        switch (index) {
            case 0: return "/analisis.png";
            case 1: return "/agenteinmo.png";
            case 2: return "/analisisdemercado.jpeg";
            case 3: return "/agentesinmobiliarios.jpeg";
            case 4: return "/formFoto.jpeg";
            default: return "/analisis.png";
        }
    };

    return (
        <div className="flex flex-col items-center p-2">
            <div
                className="w-[30vw] h-[55vh] relative transition-transform duration-700 [transform-style:preserve-3d] [-webkit-transform-style:preserve-3d]"
                onClick={() => setFlipped(!flipped)}
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
            >
                {/* Cara frontal */}
                <div
                    className="absolute w-full h-full shadow-lg rounded-2xl p-2 flex items-center justify-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] overflow-hidden"
                    aria-hidden={flipped}
                >
                    {/* Modificación para solucionar el problema en Safari */}
                    <div className="absolute inset-0 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden">
                        <div className="relative w-full h-full">
                            <Image
                                src="/fondoamarillo.jpg" 
                                alt="Fondo"
                                fill
                                className="object-cover"
                                style={{ objectPosition: 'center' }}
                            />
                            <div className="absolute inset-0 bg-black/30 rounded-xl"></div>
                        </div>
                    </div>
                    
                    <div className="relative z-10 flex flex-col items-center w-full h-full">
                        {/* Imagen dentro de la tarjeta */}
                        <div className="mt-2">
                            <img
                                src={getCardImage()}
                                alt={`Imagen para ${card.front}`}
                                className="rounded-full h-[15vh] w-[15vh] object-cover border-2 border-white/20 shadow-md"
                            />
                        </div>

                        {/* Contenido de texto */}
                        <div className="mt-4 flex-1 flex flex-col justify-center items-center text-center">
                            <h2 
                                className="text-lg font-bold mb-2 text-white"
                                style={{ textShadow: '2px 2px 4px rgba(0, 0, 0, 0.8)' }}
                            >
                                {card.front}
                            </h2>
                            <div 
                                className="mt-2 text-white/80 text-xs"
                                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                            >
                                Toca para más info
                            </div>
                        </div>
                    </div>
                </div>
                
                {/* Cara trasera */}
                <div
                    className="absolute w-full h-full shadow-lg rounded-2xl p-2 flex items-center justify-center text-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden z-20"
                    aria-hidden={!flipped}
                >
                    <Image
                        src="/fondonegro.jpg"
                        alt="Background"
                        fill
                        className="object-cover"
                        quality={100}
                    />
                    <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center p-6">
                        <div className="relative z-10 text-center whitespace-normal break-words overflow-hidden">
                            <ol className="list-decimal list-inside text-left text-white text-xs sm:text-sm md:text-base">
                                {card.back.props.children}
                            </ol>
                            {/* Texto informativo trasero */}
                            <span
                                className="block mt-4 text-white/80 text-xs"
                                style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                            >
                                Toca para volver
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
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
    // Extraer descripciones de texto para los datos estructurados
    const cardDescriptions = cardData.map(card => {
        let description = "Servicios inmobiliarios profesionales en Madrid";
        if (typeof card.back === 'object' && card.back.props && card.back.props.children) {
            const textItems = card.back.props.children
                .filter(li => typeof li === 'object' && li.props && li.props.children)
                .map(li => li.props.children);
            if (textItems.length > 0) {
                description = textItems.join(" ");
            }
        }
        return { id: card.id, description };
    });
    
    // Crear objeto de datos estructurados
    const itemListData = {
        "@context": "https://schema.org",
        "@type": "ItemList",
        "itemListElement": cardData.map((card, index) => {
            // Buscar la descripción correspondiente
            const descriptionObj = cardDescriptions.find(item => item.id === card.id);
            const description = descriptionObj ? descriptionObj.description : "Servicios inmobiliarios profesionales en Madrid";
            
            return {
                "@type": "ListItem",
                "position": index + 1,
                "item": {
                    "@type": "Service",
                    "serviceType": "RealEstateService",
                    "name": card.front || "Servicio Inmobiliario",
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
            className="cards-section"
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
            
            <AnimatedOnScroll>
                {/* Desktop Version (visible en lg: ≥1024px) */}
                <div
                    className="hidden lg:flex justify-center items-center w-full p-10 mt-[-60vh] h-[100vh]"
                    style={{
                        background:
                            "linear-gradient(to top, transparent 0%, gray 50%, transparent 100%)",
                    }}
                    role="region"
                    aria-label="Servicios inmobiliarios - Vista escritorio"
                >
                    <div
                        className="grid grid-cols-5 grid-rows-5 gap-4 w-full h-[70vh]"
                    >
                        {cardData.map((card, index) => (
                            <div key={index} style={{
                                gridColumnStart: (() => {
                                    switch (index) {
                                        case 0: return 1; // Primera columna
                                        case 1: return 2; // Segunda columna
                                        case 2: return 3; // Tercera columna
                                        case 3: return 4; // Cuarta columna
                                        case 4: return 5; // Quinta columna
                                        default: return index + 1;
                                    }
                                })(),
                                gridRowStart: (() => {
                                    switch (index) {
                                        case 0: return 4; // Última fila
                                        case 1: return 1; // Primera fila
                                        case 2: return 4; // Última fila
                                        case 3: return 1; // Primera fila
                                        case 4: return 3; // Fila del medio
                                        default: return index + 1;
                                    }
                                })()
                            }}>
                                <DesktopCards key={index} card={card} index={index} />
                            </div>
                        ))}
                    </div>
                </div>
                {/* Tablet Version (visible en md: 768px a lg: 1023px) */}
                <div className="hidden md:flex lg:hidden justify-center items-center w-full p-5 ">
                    <div className="grid grid-cols-3 gap-4 w-full max-w-3xl">
                        {cardData.map((card, index) => (
                            <TabletCard key={index} card={card} index={index} />
                        ))}
                    </div>
                </div>

                {/* Mobile Version (visible para pantallas <768px) - Modificada para una columna */}
                <div className="mt-[50vh] sm:mt-[80vh]  md:hidden flex justify-center items-start w-full p-5">
                    <div className=" grid grid-cols-1 gap-6 w-full max-w-md">
                        {cardData.map((card, index) => (
                            <MobileCard key={index} card={card} index={index} />
                        ))}
                    </div>
                </div>
            </AnimatedOnScroll>
        </section>
    );
}
