"use client";
import { motion } from 'framer-motion';

export default function FadeInView({ children, className, delay = 0, direction = "up" }) {
    const directions = {
        up: { y: 30 },
        down: { y: -30 },
        left: { x: -30 },
        right: { x: 30 },
        none: {}
    };

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
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
                duration: 0.8,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
} 