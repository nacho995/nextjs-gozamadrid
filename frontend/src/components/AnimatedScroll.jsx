// components/AnimatedOnScroll.js
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

export default function AnimatedOnScroll({ 
    children,
    className = "",
    duration = 0.5,
    distance = 20,
    threshold = 0.1,
    delay = 0,
    reducedMotion = false
}) {
    const [shouldAnimate, setShouldAnimate] = useState(true);

    useEffect(() => {
        // Comprobar preferencias de reducción de movimiento
        const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        setShouldAnimate(!mediaQuery.matches);

        const handleMotionPreference = (e) => {
            setShouldAnimate(!e.matches);
        };

        mediaQuery.addEventListener('change', handleMotionPreference);
        return () => mediaQuery.removeEventListener('change', handleMotionPreference);
    }, []);

    // Si el usuario prefiere movimiento reducido o se especifica explícitamente
    if (reducedMotion || !shouldAnimate) {
        return (
            <div 
                className={className}
                role="region"
                aria-label="Contenido animado"
            >
                {children}
            </div>
        );
    }

    return (
        <motion.div
            className={className}
            initial={{ opacity: 0, y: distance }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: threshold }}
            transition={{ 
                duration: duration,
                delay: delay,
                ease: "easeOut"
            }}
            role="region"
            aria-label="Contenido con animación al scroll"
            // Mejorar accesibilidad para lectores de pantalla
            aria-live="polite"
            // Asegurar que el contenido sea accesible incluso antes de la animación
            style={{
                willChange: 'opacity, transform'
            }}
        >
            {children}
        </motion.div>
    );
}

// Documentación de PropTypes para mejor desarrollo
AnimatedOnScroll.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    duration: PropTypes.number,
    distance: PropTypes.number,
    threshold: PropTypes.number,
    delay: PropTypes.number,
    reducedMotion: PropTypes.bool
};

// Valores por defecto documentados
AnimatedOnScroll.defaultProps = {
    className: "",
    duration: 0.5,
    distance: 20,
    threshold: 0.1,
    delay: 0,
    reducedMotion: false
};
