import React from 'react';
import { motion } from 'framer-motion';

function ProcesoVenta() {
  const pasos = [
    {
      numero: "01",
      titulo: "Valoración personalizada",
      descripcion: "Análisis detallado del valor de su propiedad basado en ubicación, características y tendencias del mercado de lujo."
    },
    {
      numero: "02",
      titulo: "Estrategia de marketing a medida",
      descripcion: "Creación de un plan exclusivo de promoción que destaque los atributos únicos de su propiedad premium."
    },
    {
      numero: "03",
      titulo: "Presentación a compradores seleccionados",
      descripcion: "Exposición de su inmueble a una red exclusiva de inversores y compradores con alto poder adquisitivo."
    },
    {
      numero: "04",
      titulo: "Negociación experta",
      descripcion: "Gestión profesional de ofertas para maximizar el valor y asegurar condiciones favorables."
    },
    {
      numero: "05",
      titulo: "Cierre exitoso",
      descripcion: "Acompañamiento integral durante todo el proceso legal y administrativo hasta la firma de escrituras."
    }
  ];

  return (
    <section className="bg-gray-100 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-black md:text-4xl">
            Proceso de Venta Exclusivo
          </h2>
          <div className="mx-auto h-1 w-24 bg-yellow-500"></div>
          <p className="mt-4 text-lg text-gray-800">
            Metodología diseñada para propiedades de alto standing
          </p>
        </div>
        
        <div className="relative mx-auto max-w-5xl">
          {/* Línea conectora */}
          <div className="absolute left-[25px] top-0 h-full w-0.5 bg-yellow-500 md:left-1/2 md:-ml-0.5"></div>
          
          {/* Pasos */}
          {pasos.map((paso, index) => (
            <div key={index} className="relative mb-16 md:mb-0">
              <div className={`mb-8 flex md:items-center ${index % 2 === 0 ? 'md:flex-row-reverse' : ''}`}>
                {/* Punto en la línea de tiempo */}
                <div className="absolute left-0 z-10 flex h-12 w-12 items-center justify-center rounded-full bg-yellow-600 text-black md:left-1/2 md:-ml-6">
                  <span className="font-bold">{paso.numero}</span>
                </div>
                
                {/* Contenido */}
                <motion.div 
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className={`ml-16 w-full rounded-lg border border-gray-300 bg-white p-6 shadow-lg md:ml-0 md:w-5/12 ${
                    index % 2 === 0 ? 'md:mr-auto' : 'md:ml-auto'
                  }`}
                >
                  <h3 className="mb-2 text-xl font-bold text-black">{paso.titulo}</h3>
                  <p className="text-gray-800">{paso.descripcion}</p>
                </motion.div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ProcesoVenta;
