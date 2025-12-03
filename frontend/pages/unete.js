import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaUsers, FaRocket, FaHeart, FaChartLine, FaEnvelope, FaPhone } from 'react-icons/fa';

export default function UnetePage() {
  return (
    <>
      <Head>
        <title>Únete al Equipo | Goza Madrid - Trabaja con Nosotros</title>
        <meta 
          name="description" 
          content="Únete al equipo de Goza Madrid. Buscamos profesionales apasionados por el sector inmobiliario en Madrid. Descubre nuestras oportunidades de carrera." 
        />
        <meta name="keywords" content="trabajar en goza madrid, empleo inmobiliario madrid, carrera inmobiliaria, equipo goza madrid" />
      </Head>

      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-r from-amarillo via-yellow-500 to-amarillo py-20 px-4">
          <div className="max-w-6xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Únete a Goza Madrid
              </h1>
              <p className="text-xl md:text-2xl text-gray-800 max-w-3xl mx-auto">
                Forma parte del equipo inmobiliario líder en Madrid y construye una carrera extraordinaria
              </p>
            </motion.div>
          </div>
        </section>

        {/* Por qué unirte */}
        <section className="py-16 px-4">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
            >
              ¿Por qué Goza Madrid?
            </motion.h2>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                {
                  icon: FaRocket,
                  title: "Crecimiento Profesional",
                  description: "Desarrollo continuo con formación especializada y oportunidades de ascenso"
                },
                {
                  icon: FaChartLine,
                  title: "Comisiones Competitivas",
                  description: "Sistema de comisiones atractivo y transparente con bonus por objetivos"
                },
                {
                  icon: FaUsers,
                  title: "Equipo Excepcional",
                  description: "Trabaja con profesionales experimentados y apasionados del sector"
                },
                {
                  icon: FaHeart,
                  title: "Ambiente Positivo",
                  description: "Cultura empresarial basada en el respeto, la colaboración y el éxito compartido"
                }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow"
                >
                  <div className="flex justify-center mb-4">
                    <item.icon className="text-5xl text-amarillo" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3 text-center">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-center">
                    {item.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Perfiles que buscamos */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
            >
              Perfiles que Buscamos
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Agentes Inmobiliarios</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Experiencia en ventas (preferible en inmobiliario)
                  </li>
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Habilidades de comunicación excepcionales
                  </li>
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Orientación a resultados y ambición
                  </li>
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Conocimiento del mercado inmobiliario de Madrid
                  </li>
                </ul>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="bg-white p-8 rounded-xl shadow-lg"
              >
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Marketing y Administración</h3>
                <ul className="space-y-3 text-gray-600">
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Experiencia en marketing digital o administración
                  </li>
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Conocimientos de herramientas digitales
                  </li>
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Proactividad y capacidad organizativa
                  </li>
                  <li className="flex items-start">
                    <span className="text-amarillo mr-2">✓</span>
                    Pasión por el sector inmobiliario
                  </li>
                </ul>
              </motion.div>
            </div>
          </div>
        </section>

        {/* CTA Contacto */}
        <section className="py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-amarillo to-yellow-500 rounded-2xl p-8 md:p-12 text-center"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                ¿Listo para Dar el Siguiente Paso?
              </h2>
              <p className="text-lg text-gray-800 mb-8 max-w-2xl mx-auto">
                Envíanos tu CV y carta de presentación. Estamos deseando conocerte y explorar juntos las oportunidades.
              </p>
              
              <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                <a
                  href="mailto:info@realestategozamadrid.com?subject=Solicitud de Empleo - Únete a Goza Madrid"
                  className="inline-flex items-center gap-2 bg-gray-900 text-white px-8 py-4 rounded-xl font-semibold hover:bg-gray-800 transition-all hover:scale-105 shadow-lg"
                >
                  <FaEnvelope />
                  info@realestategozamadrid.com
                </a>
                <a
                  href="tel:+34608136529"
                  className="inline-flex items-center gap-2 bg-white text-gray-900 px-8 py-4 rounded-xl font-semibold hover:bg-gray-100 transition-all hover:scale-105 shadow-lg"
                >
                  <FaPhone />
                  +34 608 136 529
                </a>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Valores de la empresa */}
        <section className="py-16 px-4 bg-gray-50">
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0 }}
              whileInView={{ opacity: 1 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl font-bold text-center mb-12 text-gray-900"
            >
              Nuestros Valores
            </motion.h2>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  title: "Excelencia",
                  description: "Buscamos la perfección en cada detalle y transacción"
                },
                {
                  title: "Integridad",
                  description: "Transparencia y honestidad en todas nuestras relaciones"
                },
                {
                  title: "Innovación",
                  description: "Utilizamos tecnología de vanguardia para servir mejor a nuestros clientes"
                }
              ].map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-xl shadow-lg text-center"
                >
                  <h3 className="text-2xl font-bold text-amarillo mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-600">
                    {value.description}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </>
  );
}

