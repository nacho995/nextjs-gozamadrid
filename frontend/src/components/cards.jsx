import React from "react";

const cardData = [
    {
        front: "Ventas ágiles y seguras",
        back: (
            <ol>
                <li>Vendemos tu inmueble en menos de 70 días.</li>
                <li>Análisis de mercado preciso y estrategia de precio competitiva.</li>
                <li>Marketing inmobiliario de alto impacto y red de compradores.</li>
                <li>Máximo éxito para el vendedor.</li>
            </ol>
        ),
    },
    {
        front: "¿Por qué no se vende tu inmueble?",
        back: (
            <ol>
                <li>¿Muchas visitas y pocas ofertas? Algo falla.</li>
                <li>Causas comunes: precio, estrategia, comprador.</li>
                <li>Un experto inmobiliario marca la diferencia.</li>
                <li>Vende ágil y al mejor precio.</li>
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
                <li>Marta López: Tu agente de confianza.</li>
            </ol>
        ),
    },
];

export default function Cards() {
    return (
        <div className="flex justify-center items-center w-full p-10">
            <div className="grid grid-cols-4 grid-rows-4 gap-8 h-[50vh]">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className="relative w-[35vh] h-32 group [perspective:1000px]"
                        style={{ gridColumnStart: index + 1, gridRowStart: index + 1 }}
                    >
                        {/* Condicional para mostrar imágenes */}
                        {index === 0 && (
                            <img
                                src="/analisis.png"
                                alt="Image below Card 1"
                                className="absolute bottom-[-50vh] left-1/2 rounded-full h-[25vh] w-[25vh] transform -translate-x-1/2"
                            />
                        )}
                        {index === 1 && (
                            <img
                                src="/agenteinmo.png"
                                alt="Image below Card 2"
                                className="absolute bottom-[-50vh] left-1/2 rounded-full h-[25vh] w-[25vh] transform -translate-x-1/2"
                            />
                        )}
                        {index === 2 && (
                            <img
                                src="/analisisdemercado.jpeg"
                                alt="Image above Card 3"
                                className="absolute top-[-30vh] left-1/2 rounded-full h-[25vh] w-[25vh] transform -translate-x-1/2"
                            />
                        )}
                        {index === 3 && (
                            <img
                                src="/agentesinmobiliarios.jpeg"
                                alt="Image above Card 4"
                               className="absolute top-[-30vh] left-1/2 rounded-full h-[25vh] w-[25vh] transform -translate-x-1/2"
                            />
                        )}
                        {index === 4 && (
                            <img
                                src="/conexion.jpeg"
                                alt="Image above Card 4"
                                className="absolute top-[-30vh] left-1/2 rounded-full h-[25vh] w-[25vh] transform -translate-x-1/2"
                            />
                        )}
                        <div className="h-[30vh] relative w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                            {/* Cara frontal */}
                            <div
                                className="absolute w-full h-full bg-amarillo text-black shadow-lg hover:shadow-xl rounded-lg p-2 flex items-center justify-center [backface-visibility:hidden]"
                                aria-hidden="true"
                            >
                                <div className="absolute inset-0 bg-cover bg-center opacity-50 rounded-lg" style={{ backgroundImage: "url('/fondoamarillo.jpg')" }}></div>
                                <h2 className="text-xl font-bold text-center z-20">{card.front}</h2>
                            </div>

                            {/* Cara trasera */}
                            <div
                                className="absolute w-full h-full font-bold text-black shadow-lg hover:shadow-xl rounded-lg p-2 flex items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                                aria-hidden="true"
                            >
                                {/* Nuevo div para la imagen de fondo */}
                                <div className="absolute inset-0 bg-cover bg-center opacity-50 rounded-lg" style={{ backgroundImage: "url('/fondoazul.jpg')" }}></div>

                                {/* Contenido de la tarjeta */}
                                <div className="relative z-10 text-center text-lg">
                                    <ol className="list-decimal list-inside text-left">
                                        {card.back.props.children}
                                    </ol>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
