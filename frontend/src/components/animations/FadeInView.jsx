"use client";

import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function FadeInView({ 
    children, 
    className = "", 
    delay = 0, 
    direction = "up",
    duration = 0.8,
    margin = "-100px",
    reducedMotion = false,
    ariaLabel = "Contenido con animación al scroll"
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
            whileInView={{ 
                opacity: 1,
                x: 0,
                y: 0
            }}
            viewport={{ 
                once: true, 
                margin: margin,
                amount: 0.1 // Umbral de visibilidad
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
            onViewportEnter={() => {
                // Anunciar para lectores de pantalla cuando el elemento entra en vista
                const announcement = document.createElement('div');
                announcement.setAttribute('role', 'status');
                announcement.setAttribute('aria-live', 'polite');
                announcement.className = 'sr-only';
                announcement.textContent = `${ariaLabel} visible`;
                document.body.appendChild(announcement);
                
                setTimeout(() => {
                    document.body.removeChild(announcement);
                }, 1000);
            }}
        >
            {children}
        </motion.div>
    );
}

// Validación de PropTypes
FadeInView.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    delay: PropTypes.number,
    direction: PropTypes.oneOf(['up', 'down', 'left', 'right', 'none']),
    duration: PropTypes.number,
    margin: PropTypes.string,
    reducedMotion: PropTypes.bool,
    ariaLabel: PropTypes.string
};

// Valores por defecto
FadeInView.defaultProps = {
    className: "",
    delay: 0,
    direction: "up",
    duration: 0.8,
    margin: "-100px",
    reducedMotion: false,
    ariaLabel: "Contenido con animación al scroll"
};

// Documentación del componente para mejor desarrollo
/**
 * Componente FadeInView - Añade animaciones de aparición con fade a los elementos cuando entran en el viewport
 * 
 * @component
 * @param {Object} props
 * @param {React.ReactNode} props.children - Contenido a animar
 * @param {string} [props.className=""] - Clases CSS adicionales
 * @param {number} [props.delay=0] - Retraso antes de iniciar la animación
 * @param {('up'|'down'|'left'|'right'|'none')} [props.direction="up"] - Dirección de la animación
 * @param {number} [props.duration=0.8] - Duración de la animación
 * @param {string} [props.margin="-100px"] - Margen de activación de la animación
 * @param {boolean} [props.reducedMotion=false] - Forzar modo sin animaciones
 * @param {string} [props.ariaLabel="Contenido con animación al scroll"] - Etiqueta ARIA para accesibilidad
 */ 