"use client";
import { useState, useEffect } from 'react';

const CounterExp = () => {
    const [count, setCount] = useState(0);
    const targetCount = 95000;
    const incrementTime = 10; // milliseconds

    useEffect(() => {
        // Función para incrementar el contador
        const incrementCounter = () => {
            setCount(prevCount => {
                if (prevCount < targetCount) {
                    return Math.min(prevCount + 1000, targetCount);
                }
                return prevCount; // No incrementa más si ya llegó al objetivo
            });
        };

        // Establecer el intervalo para incrementar el contador
        const interval = setInterval(incrementCounter, incrementTime);

        // Limpiar el intervalo cuando el componente se desmonta
        return () => clearInterval(interval);
    }, []); // Esta vez, el useEffect se ejecutará solo una vez al montar el componente

    return (
        <div className="relative bottom-0 left-0 w-full flex justify-center items-center z-10">
            <div className="relative w-full h-40 flex items-center justify-center">
                {/* Gradiente con bordes ligeramente transparentes */}
                <div
                    className="absolute w-full h-full bg-gradient-to-t"
                    style={{
                        background: "linear-gradient(to top, transparent 5%, #C7A336 20%, #C7A336 80%, transparent 95%)",
                    }}
                ></div>
                {/* Contador */}
                <div className="absolute text-shadow-xl text-black px-2 text-6xl font-bold z-20">
                   Más de {count.toLocaleString()} agentes trabajando en eXp alrededor de 25 países
                </div>
            </div>
        </div>
    );
};

export default CounterExp;
