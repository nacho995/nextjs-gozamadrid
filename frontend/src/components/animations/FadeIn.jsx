"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function FadeIn({ 
    children, 
    className = "", 
    delay = 0, 
    direction = "up",
    duration = 0.8,
    reducedMotion = false,
    ariaLabel = "Contenido con animación"
}) {
    const [shouldAnimate, setShouldAnimate] = useState(true);

    // Configuración de direcciones de animación
    const directions = {
        up: { y: 30 },
        down: { y: -30 },
        left: { x: -30 },
        right: { x: 30 },
        none: {}
    };

    useEffect(() => {
        // Detectar preferencias de reducción de movimiento
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setShouldAnimate(!mediaQuery.matches);

        const handleMotionPreference = (e) => {
            setShouldAnimate(!e.matches);
        };

        mediaQuery.addEventListener('change', handleMotionPreference);
        return () => mediaQuery.removeEventListener('change', handleMotionPreference);
    }, []);

    // Renderizar sin animación si se prefiere movimiento reducido
    if (reducedMotion || !shouldAnimate) {
        return (
            <div 
                className={className}
                role="region"
                aria-label={ariaLabel}
            >
                {children}
            </div>
        );
    }

    return (
        <motion.div
            initial={{ 
                opacity: 0,
                ...directions[direction]
            }}
            animate={{ 
                opacity: 1,
                x: 0,
                y: 0
            }}
            transition={{ 
                duration: duration,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className={className}
            role="region"
            aria-label={ariaLabel}
            aria-live="polite"
            style={{
                willChange: 'opacity, transform'
            }}
        >
            {children}
        </motion.div>
    );
}

// Validación de PropTypes
FadeIn.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    delay: PropTypes.number,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'none']),
    duration: PropTypes.number,
    reducedMotion: PropTypes.bool,
    ariaLabel: PropTypes.string
};

// Valores por defecto
FadeIn.defaultProps = {
    className: "",
    delay: 0,
    direction: "up",
    duration: 0.8,
    reducedMotion: false,
    ariaLabel: "Contenido con animación"
};

// Documentación del componente para mejor desarrollo
/**
 * Componente FadeIn - Añade animaciones de aparición con fade a los elementos
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a animar
 * @param {string} [props.className=""] - Clases CSS adicionales
 * @param {number} [props.delay=0] - Retraso antes de iniciar la animación
 * @param {('up'|'down'|'left'|'right'|'none')} [props.direction="up"] - Dirección de la animación
 * @param {number} [props.duration=0.8] - Duración de la animación
 * @param {boolean} [props.reducedMotion=false] - Forzar modo sin animaciones
 * @param {string} [props.ariaLabel="Contenido con animación"] - Etiqueta ARIA para accesibilidad
 */ 