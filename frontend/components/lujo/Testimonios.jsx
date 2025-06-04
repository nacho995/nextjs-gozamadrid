import React from 'react';
// import Image from "next/legacy/image";
import { motion } from 'framer-motion';

function Testimonios() {
  const testimonios = [
    {
      nombre: "Carlos Martínez",
      cargo: "Propietario en Salamanca",
      texto: "Vendí mi ático en el barrio de Salamanca en tan solo 3 semanas y por encima del precio de tasación inicial. El equipo de realestategozamadrid.com supo posicionar perfectamente mi propiedad en el mercado de lujo.",
      resultado: "Vendido en 21 días por un 8% sobre el precio de salida"
    },
    {
      nombre: "Elena Sánchez",
      cargo: "Propietaria en La Moraleja",
      texto: "La estrategia de marketing que diseñaron para mi villa fue excepcional. Lograron atraer a compradores internacionales y conseguir un precio que superó todas mis expectativas. Profesionalidad y exclusividad en cada detalle.",
      resultado: "Vendido a un comprador internacional en 45 días"
    },
    {
      nombre: "Javier Rodríguez",
      cargo: "Propietario en El Viso",
      texto: "Después de intentar vender mi propiedad con otras agencias durante meses, realestategozamadrid.com consiguió venderla en cuestión de semanas. Su red de contactos y su conocimiento del mercado premium marcan la diferencia.",
      resultado: "Vendido tras 6 semanas de colaboración exclusiva"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-black md:text-4xl">
            Lo que dicen nuestros clientes
          </h2>
          <div className="mx-auto h-1 w-24 bg-yellow-500"></div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {testimonios.map((testimonio, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
              className="overflow-hidden rounded-lg bg-white p-6 shadow-lg transition-shadow duration-300 hover:shadow-xl border border-yellow-200"
            >
              <div className="mb-6">
                <h3 className="text-xl font-bold text-black">{testimonio.nombre}</h3>
                <p className="text-sm text-gray-800 mb-2">{testimonio.cargo}</p>
              </div>
              
              <p className="mb-4 italic text-gray-900">"{testimonio.texto}"</p>
              
              <div className="mt-4 rounded-md bg-yellow-100 p-3 text-sm text-yellow-900 border border-yellow-300">
                <strong>Resultado:</strong> {testimonio.resultado}
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Testimonios;
