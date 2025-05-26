import React from 'react';
// import Image from "next/legacy/image";
import { motion } from 'framer-motion';
import { FaCertificate, FaAward, FaHandshake } from 'react-icons/fa';

function SobreNosotros() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="grid items-center gap-12 md:grid-cols-2">
          {/* Columna de imagen */}
          <div className="relative h-[500px] overflow-hidden rounded-lg shadow-xl">
            <img
              src="https://images.unsplash.com/photo-1600880292203-757bb62b4baf?ixlib=rb-4.0.3&auto=format&fit=crop&w=900&q=80"
              alt="Equipo de realestategozamadrid.com"
              layout="fill"
              objectFit="cover"
              className="transition-transform duration-500 hover:scale-105"
            />
          </div>
          
          {/* Columna de texto */}
          <div>
            <h2 className="mb-6 font-serif text-3xl font-bold text-black md:text-4xl">
              Sobre Nosotros
            </h2>
            
            <div className="mb-6 h-1 w-24 bg-yellow-500"></div>
            
            <p className="mb-6 text-lg text-gray-900">
              En realestategozamadrid.com somos especialistas en la comercialización de propiedades exclusivas en Madrid. Con más de 10 años de experiencia en el mercado inmobiliario de lujo, ofrecemos un servicio personalizado y discreto adaptado a las necesidades de cada cliente.
            </p>
            
            <p className="mb-8 text-lg text-gray-900">
              Nuestro equipo está formado por profesionales con amplia trayectoria en el sector inmobiliario premium y un profundo conocimiento del mercado madrileño. Contamos con el respaldo internacional de EXPRealty, lo que nos permite ofrecer una exposición global a nuestras propiedades.
            </p>
            
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="mr-4 rounded-full bg-amber-100 p-3 text-amber-600">
                  <FaCertificate size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Profesionales certificados</h3>
                  <p className="text-gray-800">Agentes con las más altas acreditaciones del sector</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.1 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="mr-4 rounded-full bg-amber-100 p-3 text-amber-600">
                  <FaAward size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Reconocimiento en el sector</h3>
                  <p className="text-gray-800">Premiados por excelencia en el servicio inmobiliario de lujo</p>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                viewport={{ once: true }}
                className="flex items-center"
              >
                <div className="mr-4 rounded-full bg-amber-100 p-3 text-amber-600">
                  <FaHandshake size={24} />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-black">Compromiso con la excelencia</h3>
                  <p className="text-gray-800">Más de 200 propiedades de lujo vendidas con éxito</p>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default SobreNosotros;
