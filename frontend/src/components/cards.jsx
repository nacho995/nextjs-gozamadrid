"use client";
import React, { useState, useEffect, useRef } from "react";
import AnimatedOnScroll from "./AnimatedScroll";
import Image from "next/image";

const cardData = [
    {
        front: "Ventas ágiles y seguras en un máximo de 70 días",
        back: (
            <ol>
                <li>Vender un piso no es jugar a la lotería.</li>
                <li>Sabemos que el mercado inmobiliario ha subido de precio.</li>
                <li>¡Ojo! Algunos propietarios están inflando los precios, pensando que así sacarán más beneficio.</li>
                <li>El precio fuera de mercado aleja a compradores.</li>
            </ol>
        ),
    },
    {
        front: "¿Por qué no se vende tu inmueble?",
        back: (
            <ol>
                <li>Precio correcto = venta rápida y efectiva.</li>
                <li>Precio inflado = meses (o años) sin vender, y posibles bajadas obligadas.</li>
                <li>Si de verdad quieres vender, hazlo con estrategia y no con especulación.</li>
                <li>Te ayudamos a definir el precio real de tu vivienda para que no pierdas el tiempo.</li>
            </ol>
        ),
    },
    {
        front: "Vender tu casa: El valor está en el mercado",
        back: (
            <ol>
                <li>Los recuerdos van contigo, el valor lo pone el mercado.</li>
                <li>Compradores buscan: ubicación, precio, potencial.</li>
                <li>Acepta el cambio y vende con decisión.</li>
            </ol>
        ),
    },
    {
        front: "Agentes Inmobiliarios de Confianza",
        back: (
            <ol>
                <li>Somos vendedores y negociadores.</li>
                <li>Acompañamos, asesoramos y logramos acuerdos.</li>
                <li>Dedicación, negociación efectiva y confianza.</li>
                <li>Vendemos entendiendo y ayudando.</li>
            </ol>
        ),
    },
    {
        front: "Conexión genuina con el cliente",
        back: (
            <ol>
                <li>Escuchamos y asesoramos honestamente.</li>
                <li>Nos enfocamos en la persona, no solo en la transacción.</li>
                <li>Creamos confianza para que nos elijan siempre.</li>
                <li>Marta López: Tu vendedora de confianza.</li>
            </ol>
        ),
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
            {/* Contenedor principal fijo */}
            <div
                className="relative w-[40vw] h-[40vh] group [perspective:1000px] transform transition duration-300 hover:scale-105"
            >
                <div className="h-full w-[19vw] transition-all duration-700 [transform-style:preserve-3d] [-webkit-transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                    {/* Cara frontal */}
                    <div
                        className="absolute inset-0 bg-yellow-300 text-black shadow-lg rounded-lg p-6 flex flex-col items-center justify-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] overflow-hidden"
                        aria-hidden="true"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: "url('/fondoamarillo.jpg')" }}
                        >
                            <div className="absolute inset-0 bg-white opacity-15 rounded-lg"></div>
                        </div>
                        
                        {/* Imagen correspondiente según el índice */}
                        {index === 0 && (
                            <img
                                src="/analisis.png"
                                alt="Análisis"
                                className="mb-4 rounded-full h-[12vh] w-[12vh] object-cover border-2 border-black/20 shadow-xl transform transition-transform duration-300 group-hover:scale-110"
                            />
                        )}
                        {index === 1 && (
                            <img
                                src="/agenteinmo.png"
                                alt="Agente Inmobiliario"
                                className="mb-4 rounded-full h-[12vh] w-[12vh] object-cover border-2 border-black/20 shadow-xl transform transition-transform duration-300 group-hover:scale-110"
                            />
                        )}
                        {index === 2 && (
                            <img
                                src="/analisisdemercado.jpeg"
                                alt="Análisis de Mercado"
                                className="mb-4 rounded-full h-[12vh] w-[12vh] object-cover border-2 border-black/20 shadow-xl transform transition-transform duration-300 group-hover:scale-110"
                            />
                        )}
                        {index === 3 && (
                            <img
                                src="/agentesinmobiliarios.jpeg"
                                alt="Agentes Inmobiliarios"
                                className="mb-4 rounded-full h-[12vh] w-[12vh] object-cover border-2 border-black/20 shadow-xl transform transition-transform duration-300 group-hover:scale-110"
                            />
                        )}
                        {index === 4 && (
                            <img
                                src="/formFoto.jpeg"
                                alt="Formulario"
                                className="mb-4 rounded-full h-[12vh] w-[12vh] object-cover border-2 border-black/20 shadow-xl transform transition-transform duration-300 group-hover:scale-110"
                            />
                        )}
                        
                        <h2 className="text-3xl font-bold text-center text-black z-20 mt-2"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,225,1)" }}>
                            {card.front}
                        </h2>
                    </div>
                    {/* Cara trasera */}
                    <div
                        className="absolute inset-0 font-bold text-black shadow-lg rounded-lg p-2 flex items-center justify-center text-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
                        aria-hidden="true"
                    >
                        <div
                            className="absolute inset-0 bg-cover bg-center rounded-lg"
                            style={{ backgroundImage: "url('/fondonegro.jpg')" }}
                        ></div>
                        <div className="relative z-10 text-center overflow-hidden whitespace-normal break-words text-sm sm:text-base md:text-lg lg:text-base">
                            <ol className="list-decimal list-inside text-left text-white">
                                {card.back.props.children}
                            </ol>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedOnScroll >
    );
}

/* ============================
   Mobile/Tablet Version (2 columns)
   ============================ */
function MobileCard({ card, index }) {
    const [flipped, setFlipped] = useState(false);
    return (
        <div className="flex flex-col items-center p-2">
            {/* Imagen sobre la card */}
            {index === 0 && (
                <img
                    src="/analisis.png"
                    alt="Image for Card 1"
                    className="mt-4 rounded-full h-[15vh] w-[15vh] object-cover"
                />
            )}
            {index === 1 && (
                <img
                    src="/agenteinmo.png"
                    alt="Image for Card 2"
                    className="mt-4 rounded-full h-[15vh] w-[15vh] object-cover"
                />
            )}
            {index === 2 && (
                <img
                    src="/analisisdemercado.jpeg"
                    alt="Image for Card 3"
                    className="mt-4 rounded-full h-[15vh] w-[15vh] object-cover"
                />
            )}
            {index === 3 && (
                <img
                    src="/agentesinmobiliarios.jpeg"
                    alt="Image for Card 4"
                    className="mt-4 rounded-full h-[15vh] w-[15vh] object-cover"
                />
            )}
            {index === 4 && (
                <img
                    src="/formFoto.jpeg"
                    alt="Image for Card 5"
                    className="mt-4 rounded-full h-[15vh] w-[15vh] object-cover"
                />
            )}

            {/* Card */}
            <div
                className="w-[45vw] h-[45vh] relative transition-transform duration-700 [transform-style:preserve-3d]"
                onClick={() => setFlipped(!flipped)}
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
            >
                {/* Cara frontal */}
                <div
                    className="absolute w-full h-full bg-amarillo text-black shadow-lg rounded-lg p-2 flex items-center justify-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: "url('/fondoamarillo.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-white opacity-15 rounded-lg"></div>
                    </div>
                    <h2 className="text-lg font-bold text-center text-black z-20 px-1 break-words">
                        {card.front}
                    </h2>
                    {/* Texto informativo frontal */}
                    <div 
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-black/70 text-xs lg:hidden"
                        style={{ textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)' }}
                    >
                        Toca para más info
                    </div>
                </div>
                {/* Cara trasera */}
                <div
                    className="absolute w-full h-full font-bold text-black shadow-lg rounded-lg p-2 flex items-center justify-center text-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: "url('/fondonegro.jpg')" }}
                    ></div>
                    <div className="relative z-10 text-center whitespace-normal break-words overflow-hidden text-xs sm:text-xs md:text-base lg:text-lg">
                        <ol className="list-decimal list-inside text-left text-white">
                            {card.back.props.children}
                        </ol>
                        {/* Texto informativo trasero */}
                        <span 
                            className="block mt-4 text-white/80 text-xs lg:hidden"
                            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                        >
                            Toca para volver
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

function TabletCard({ card, index }) {
    const [flipped, setFlipped] = useState(false);

    return (
        <div className="flex flex-col items-center p-2">
            <div
                className="w-[30vw] h-[55vh] relative transition-transform duration-700 [transform-style:preserve-3d] [-webkit-transform-style:preserve-3d]"
                onClick={() => setFlipped(!flipped)}
                style={{ transform: flipped ? "rotateY(180deg)" : "rotateY(0)" }}
            >
                {/* Cara frontal */}
                <div
                    className="absolute w-full h-full bg-amarillo text-black shadow-lg rounded-lg p-2 flex items-center justify-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: "url('/fondoamarillo.jpg')" }}
                    >
                        <div className="absolute inset-0 bg-white opacity-15 rounded-lg"></div>
                    </div>
                    <h2 className="text-lg font-bold text-center text-black z-20 px-1 break-words">
                        {card.front}
                    </h2>
                    {/* Texto informativo frontal */}
                    <div 
                        className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-black/70 text-xs lg:hidden"
                        style={{ textShadow: '1px 1px 2px rgba(255, 255, 255, 0.8)' }}
                    >
                        Toca para más info
                    </div>
                </div>
                {/* Cara trasera */}
                <div
                    className="absolute w-full h-full font-bold text-black shadow-lg rounded-lg p-2 flex items-center justify-center text-center [backface-visibility:hidden] [-webkit-backface-visibility:hidden] [transform:rotateY(180deg)] overflow-hidden"
                    aria-hidden="true"
                >
                    <div
                        className="absolute inset-0 bg-cover bg-center rounded-lg"
                        style={{ backgroundImage: "url('/fondonegro.jpg')" }}
                    ></div>
                    <div className="relative z-10 text-center whitespace-normal break-words overflow-hidden text-xs sm:text-sm md:text-base lg:text-lg">
                        <ol className="list-decimal list-inside text-left text-white">
                            {card.back.props.children}
                        </ol>
                        {/* Texto informativo trasero */}
                        <span 
                            className="block mt-4 text-white/80 text-xs lg:hidden"
                            style={{ textShadow: '1px 1px 2px rgba(0, 0, 0, 0.8)' }}
                        >
                            Toca para volver
                        </span>
                    </div>
                </div>
            </div>
            {/* Imágenes debajo de la tarjeta según el índice */}
            {index === 0 && (
                <img
                    src="/analisis.png"
                    alt="Image for Card 1"
                    className="mt-4 rounded-full h-[20vh] w-[20vh] object-cover"
                />
            )}
            {index === 1 && (
                <img
                    src="/agenteinmo.png"
                    alt="Image for Card 2"
                    className="mt-4 rounded-full h-[20vh] w-[20vh] object-cover"
                />
            )}
            {index === 2 && (
                <img
                    src="/analisisdemercado.jpeg"
                    alt="Image for Card 3"
                    className="mt-4 rounded-full h-[20vh] w-[20vh] object-cover"
                />
            )}
            {index === 3 && (
                <img
                    src="/agentesinmobiliarios.jpeg"
                    alt="Image for Card 4"
                    className="mt-4 rounded-full h-[20vh] w-[20vh] object-cover"
                />
            )}
            {index === 4 && (
                <img
                    src="/formFoto.jpeg"
                    alt="Image for Card 5"
                    className="mt-4 rounded-full h-[20vh] w-[20vh] object-cover"
                />
            )}
        </div>
    );
}

export default function Cards() {
    return (
        <AnimatedOnScroll>
            {/* Desktop Version (visible en lg: ≥1024px) */}
            <div
                className="hidden lg:flex justify-center items-center w-full p-10 mt-[-60vh] h-[100vh]"
                style={{
                    background:
                        "linear-gradient(to top, transparent 0%, gray 50%, transparent 100%)",
                }}
            >
                <div
                    className="grid grid-cols-5 grid-rows-5 gap-4 w-full h-[70vh]"
                >
                    {cardData.map((card, index) => (
                        <div key={index} style={{ 
                            gridColumnStart: (() => {
                                switch(index) {
                                    case 0: return 1; // Primera columna
                                    case 1: return 2; // Segunda columna
                                    case 2: return 3; // Tercera columna
                                    case 3: return 4; // Cuarta columna
                                    case 4: return 5; // Quinta columna
                                    default: return index + 1;
                                }
                            })(),
                            gridRowStart: (() => {
                                switch(index) {
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

            {/* Mobile Version (visible para pantallas <768px) */}
           
            <div className="md:hidden flex justify-center items-start w-full p-5">
                <div className="grid grid-cols-2 gap-4 w-full max-w-xl">
                    {cardData.map((card, index) => (
                        <MobileCard key={index} card={card} index={index} />
                    ))}
                </div>
            </div>


        </AnimatedOnScroll>
    );
}
