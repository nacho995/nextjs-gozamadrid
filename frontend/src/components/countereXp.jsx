"use client";
import { useState, useEffect, useRef } from "react";

const CounterExp = () => {
    const [count, setCount] = useState(0);
    const [countCountry, setCountCountry] = useState(0);
    const targetCount = 95000;
    const incrementTime = 15;
    const targetCountCountry = 25;
    const incrementTimeCountry = 100; // Incrementar cada 200ms en lugar de 5ms
    const observerRef = useRef(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                }
            },
            { threshold: 0.5 }
        );

        if (observerRef.current) {
            observer.observe(observerRef.current);
        }

        return () => {
            if (observerRef.current) {
                observer.unobserve(observerRef.current);
            }
        };
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        // Intervalo para contar los agentes
        const intervalAgents = setInterval(() => {
            setCount(prevCount => {
                if (prevCount < targetCount) {
                    return Math.min(prevCount + 1000, targetCount);
                }
                clearInterval(intervalAgents);
                return prevCount;
            });
        }, incrementTime);

        // Intervalo para contar los países
        const intervalCountries = setInterval(() => {
            setCountCountry(prevCountCountry => {
                if (prevCountCountry < targetCountCountry) {
                    return Math.min(prevCountCountry + 1, targetCountCountry);
                }
                clearInterval(intervalCountries);
                return prevCountCountry;
            });
        }, incrementTimeCountry);

        // Limpiar ambos intervalos cuando el componente se desmonte
        return () => {
            clearInterval(intervalAgents);
            clearInterval(intervalCountries);
        };
    }, [isVisible]);

    return (
        <div ref={observerRef} className="relative bottom-0 left-0 w-full flex justify-center items-center z-10">
            <div className="relative w-full h-40 flex items-center justify-center">
                <div
                    className="absolute w-full h-full bg-gradient-to-t"
                    style={{
                        background: "linear-gradient(to top, transparent 5%, #C7A336 20%, #C7A336 80%, transparent 95%)",
                    }}
                ></div>
                <div className="absolute text-shadow-xl text-white px-2 text-6xl font-bold z-20">
                   Más de <span className="text-black">{count.toLocaleString()}</span> agentes trabajando en <span className="text-black" style={{ textShadow: "4px 4px 5px white"}}>eXp</span> alrededor de <span className="text-black">{countCountry.toLocaleString()}</span> países
                </div>
            </div>
        </div>
    );
};

export default CounterExp;
