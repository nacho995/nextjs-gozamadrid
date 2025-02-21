"use client";
import { motion } from 'framer-motion';

export default function ScaleInView({ children, className, delay = 0 }) {
    return (
        <motion.div
            initial={{ 
                opacity: 0,
                scale: 0.9
            }}
            whileInView={{ 
                opacity: 1,
                scale: 1
            }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ 
                duration: 0.6,
                delay: delay,
                ease: [0.25, 0.1, 0.25, 1]
            }}
            className={className}
        >
            {children}
        </motion.div>
    );
} 