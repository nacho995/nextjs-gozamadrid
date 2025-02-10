// components/AnimatedOnScroll.js
import React from 'react';
import { useSpring, animated } from 'react-spring';
import { useInView } from 'react-intersection-observer';

export default function AnimatedOnScroll({ children }) {
  const [ref, inView] = useInView({
    threshold: 0,         // Detecta cualquier parte visible
    triggerOnce: true,    // Se dispara solo una vez
  });

  const animation = useSpring({
    opacity: inView ? 1 : 0,
    transform: inView ? 'translateX(0px)' : 'translateX(-100px)',
    config: { duration: 800 },
  });

  return (
    <animated.div ref={ref} style={animation}>
      {children}
    </animated.div>
  );
}
