// components/AnimatedOnScroll.js
import React from 'react';
import { motion } from 'framer-motion';

export default function AnimatedOnScroll({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.1 }}
      transition={{ duration: 0.5 }}
    >
      {children}
    </motion.div>
  );
}
