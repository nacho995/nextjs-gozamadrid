import React from "react";

const cardData = [
    {
        front: "Ventas ágiles y seguras en un máximo de 70 días",
        back: (
            <ol>
                <li>Vender un piso no es jugar a la lotería.</li>
                <li>Sabemos que el mercado inmobiliario a subido de precio.</li>
                <li>¡Ojo! Algunos propietarios estan inflando los precios, pensando que así sacaran más beneficio</li>
                <li>El precio fuera de mercado aleja a compradores</li>
            </ol>
        ),
    },
    {
        front: "¿Por qué no se vende tu inmueble?",
        back: (
            <ol>
                <li>Precio correcto = venta rápida y efectiva. </li>
                <li>Precio inflado = meses (o años) sin vender, y posibles bajadas obligadas.</li>
                <li>Si de verdad quieres vender, hazlo con estrategia y no con especulación.</li>
                <li>Te ayudamos a definir el precio real de tu vivienda para que no pierdas el tiempo</li>
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

export default function Cards() {
    return (
        <div className="flex justify-center items-center w-full p-10 h-[100vh]"
        style={{
            background: "linear-gradient(to top, transparent 0%, #C7A336 50%, transparent 100%)"
        }}>
            <div className="grid grid-cols-4 grid-rows-4 z-20 gap-8 h-[70vh]">
                {cardData.map((card, index) => (
                    <div
                        key={index}
                        className="relative w-[40vh] h-40 group [perspective:1000px]"
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
                                src="/formFoto.jpeg"
                                alt="Image above Card 4"
                                className="absolute top-[-30vh] left-1/2 rounded-full h-[25vh] w-[25vh] transform -translate-x-1/2"
                            />
                        )}
                        <div className="h-[40vh] relative w-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
                           {/* Cara frontal */}
                            <div
                                className="absolute w-full h-full bg-amarillo text-black shadow-lg hover:shadow-xl rounded-lg p-2 flex items-center justify-center [backface-visibility:hidden]"
                                aria-hidden="true"
                            >
                                <div className="absolute inset-0 bg-cover bg-center rounded-lg" style={{ backgroundImage: "url('/fondoamarillo.jpg')" }}>
                                    <div className="absolute inset-0 bg-white opacity-15 rounded-lg"></div>
                                </div>
                                <h2 className="text-3xl font-bold text-center text-black z-20">{card.front}</h2>
                            </div>

                            {/* Cara trasera */}
                            <div
                                className="absolute w-full h-full font-bold text-black shadow-lg hover:shadow-xl rounded-lg p-2 flex items-center justify-center text-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                                aria-hidden="true"
                            >
                                {/* Nuevo div para la imagen de fondo */}
                                <div className="absolute inset-0 bg-cover bg-center  rounded-lg" style={{ backgroundImage: "url('/fondonegro.jpg')" }}></div>

                                {/* Contenido de la tarjeta */}
                                <div className="relative z-10 text-center text-lg">
                                    <ol className="list-decimal list-inside text-left text-white">
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
