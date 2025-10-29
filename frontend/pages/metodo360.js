import { motion } from "framer-motion";
import { FaCheckCircle, FaCamera, FaChartLine, FaHandshake, FaShieldAlt, FaGift, FaMapMarkerAlt, FaStar, FaCrown } from "react-icons/fa";
import Image from "next/legacy/image";
import Link from "next/link";
import Head from "next/head";

export default function Metodo360Page() {
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.8, ease: [0.6, -0.05, 0.01, 0.99] }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  return (
    <>
      <Head>
        <title>Método 360° - Vende tu Inmueble con Solo 1% de Comisión | Goza Madrid</title>
        <meta name="description" content="La solución más exclusiva y transparente del mercado inmobiliario español. Vende tu propiedad de lujo con solo 1% de comisión en notaría." />
        <link rel="canonical" href="https://realestategozamadrid.com/metodo360" />
      </Head>

      <div className="min-h-screen bg-black">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1.2 }}
          className="relative pt-32 pb-24 px-4 overflow-hidden bg-gradient-to-b from-neutral-900 via-black to-black"
        >
          {/* Elegant Gold Accent Lines */}
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent"></div>
          
          {/* Subtle Gold Glow */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl"></div>

          <div className="max-w-7xl mx-auto relative z-10">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 1, ease: [0.6, -0.05, 0.01, 0.99] }}
              className="text-center mb-20"
            >
              <motion.div
                className="inline-block mb-8"
              >
                <FaCrown className="text-7xl text-yellow-600 drop-shadow-2xl mx-auto mb-4" style={{ filter: 'drop-shadow(0 0 20px rgba(202, 138, 4, 0.4))' }} />
              </motion.div>
              
              <h1 className="text-5xl md:text-7xl lg:text-8xl font-light text-white mb-8 leading-tight tracking-tight">
                Vende tu inmueble con el{" "}
                <span className="font-black bg-gradient-to-r from-yellow-600 via-yellow-500 to-yellow-600 bg-clip-text text-transparent">
                  Modelo 360°
                </span>
              </h1>
              
              <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-8"></div>
              
              <p className="text-xl md:text-2xl text-gray-400 font-light max-w-3xl mx-auto leading-relaxed">
                La solución más <span className="text-yellow-600 font-normal">exclusiva</span> y{" "}
                <span className="text-yellow-600 font-normal">transparente</span> del mercado inmobiliario español
              </p>
            </motion.div>

            {/* Elegant Value Cards */}
            <motion.div
              variants={staggerContainer}
              initial="initial"
              animate="animate"
              className="grid md:grid-cols-3 gap-6 mb-16"
            >
              {[
                {
                  icon: <FaHandshake className="text-4xl text-yellow-600" />,
                  title: "¿Cansado de comisiones abusivas?",
                  subtitle: "Solo 1% en notaría",
                  description: "Pagas únicamente si vendemos tu propiedad"
                },
                {
                  icon: <FaShieldAlt className="text-4xl text-yellow-600" />,
                  title: "Contrato de 3 meses",
                  description: "Compromiso claro y definido sin permanencias eternas"
                },
                {
                  icon: <FaChartLine className="text-4xl text-yellow-600" />,
                  title: "Precio real",
                  description: "Trabajamos con valoraciones honestas del mercado"
                }
              ].map((card, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="bg-gradient-to-b from-neutral-900 to-black rounded-lg p-8 border border-yellow-600/20 shadow-xl hover:border-yellow-600/40 transition-all duration-500 hover:shadow-yellow-600/10"
                >
                  <div className="mb-6">{card.icon}</div>
                  <h3 className="text-xl font-normal text-white mb-3 tracking-wide">{card.title}</h3>
                  {card.subtitle && (
                    <p className="text-3xl font-light text-yellow-600 mb-3 tracking-tight">{card.subtitle}</p>
                  )}
                  <p className="text-gray-400 text-base font-light leading-relaxed">{card.description}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Investment Section */}
        <motion.section
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="py-24 px-4 bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
          
          <div className="max-w-6xl mx-auto text-center relative z-10">
            <h2 className="text-4xl md:text-5xl font-light text-white mb-4 tracking-tight">
              Inversión inicial: <span className="font-black text-6xl">2.000€</span>
            </h2>
            <p className="text-xl md:text-2xl text-white/90 font-light tracking-wide">
              Campaña profesional durante tres meses
            </p>
          </div>
        </motion.section>

        {/* What's Included Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 px-4 bg-black"
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-light text-center text-white mb-4 tracking-tight"
            >
              ¿Qué incluye?
            </motion.h2>
            
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-16"></div>

            <motion.div
              variants={staggerContainer}
              initial="initial"
              whileInView="animate"
              viewport={{ once: true }}
              className="grid md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[
                { icon: <FaCamera />, text: "Fotografía profesional de alta calidad" },
                { icon: <FaCamera />, text: "Tour virtual 360° inmersivo" },
                { icon: <FaChartLine />, text: "Publicidad en portales inmobiliarios premium" },
                { icon: <FaHandshake />, text: "Promoción en redes sociales segmentada" },
                { icon: <FaShieldAlt />, text: "Home staging digital personalizado" },
                { icon: <FaCheckCircle />, text: "Asesoramiento legal completo" },
                { icon: <FaGift />, text: "Marketing sin portales automatizado" }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ x: 8, transition: { duration: 0.3 } }}
                  className="flex items-start gap-4 bg-neutral-900/50 p-6 rounded-lg border border-yellow-600/10 hover:border-yellow-600/30 transition-all duration-500 backdrop-blur-sm"
                >
                  <div className="text-2xl text-yellow-600 mt-1">{item.icon}</div>
                  <p className="text-lg text-gray-300 font-light leading-relaxed">{item.text}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </motion.section>

        {/* Payment Transparency Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 px-4 bg-gradient-to-b from-black to-neutral-900"
        >
          <div className="max-w-7xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-light text-center text-white mb-4 tracking-tight"
            >
              Transparencia total
            </motion.h2>
            
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-4"></div>
            
            <p className="text-xl text-gray-400 text-center mb-16 font-light">Así funciona el pago</p>

            <div className="grid md:grid-cols-3 gap-8">
              {[
                {
                  number: "01",
                  title: "Campaña de 3 meses",
                  description: "Inversión inicial de 2.000€ en marketing y promoción profesional"
                },
                {
                  number: "02",
                  title: "Si vendemos",
                  description: "Comisión del 1% que se abona en notaría al cerrar la venta"
                },
                {
                  number: "03",
                  title: "Si no vendemos",
                  description: "Mes extra gratis de campaña o te entregamos todo el material"
                }
              ].map((step, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.15, duration: 0.8 }}
                  whileHover={{ y: -8, transition: { duration: 0.3 } }}
                  className="relative bg-gradient-to-br from-neutral-900 to-black rounded-lg p-8 shadow-xl border border-yellow-600/20 hover:border-yellow-600/40 transition-all duration-500"
                >
                  <div className="absolute -top-4 -left-4 w-12 h-12 bg-gradient-to-br from-yellow-600 to-yellow-700 rounded-full flex items-center justify-center shadow-lg shadow-yellow-600/20">
                    <span className="text-xl font-light text-white">{step.number}</span>
                  </div>
                  <h3 className="text-2xl font-normal text-white mb-4 mt-4 tracking-wide">{step.title}</h3>
                  <p className="text-lg text-gray-400 font-light leading-relaxed">{step.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>

        {/* Price Comparison Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 px-4 bg-neutral-900"
        >
          <div className="max-w-6xl mx-auto">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-4xl md:text-6xl font-light text-center text-white mb-4 tracking-tight"
            >
              La opción más exclusiva
            </motion.h2>
            
            <div className="w-24 h-px bg-gradient-to-r from-transparent via-yellow-600 to-transparent mx-auto mb-16"></div>

            <div className="grid md:grid-cols-3 gap-8 mb-12">
              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-gradient-to-br from-black to-neutral-900 rounded-lg p-10 text-center shadow-xl border border-yellow-600/20"
              >
                <div className="text-7xl font-light text-yellow-600 mb-4">1%</div>
                <p className="text-xl text-white font-light mb-2 tracking-wide">Comisión</p>
                <p className="text-base text-gray-400 font-light">Versus 3-5% de agencias tradicionales</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-gradient-to-br from-black to-neutral-900 rounded-lg p-10 text-center shadow-xl border border-yellow-600/30 relative overflow-hidden"
              >
                <div className="absolute top-2 right-2">
                  <FaCrown className="text-yellow-600/20 text-4xl" />
                </div>
                <div className="text-7xl font-light text-yellow-600 mb-4">2.000€</div>
                <p className="text-xl text-white font-light mb-2 tracking-wide">Inversión</p>
                <p className="text-base text-gray-400 font-light">Campaña profesional completa</p>
              </motion.div>

              <motion.div
                whileHover={{ y: -8, transition: { duration: 0.3 } }}
                className="bg-gradient-to-br from-black to-neutral-900 rounded-lg p-10 text-center shadow-xl border border-yellow-600/20"
              >
                <div className="text-7xl font-light text-yellow-600 mb-4">3</div>
                <p className="text-xl text-white font-light mb-2 tracking-wide">Meses</p>
                <p className="text-base text-gray-400 font-light">Contrato claro sin letra pequeña</p>
              </motion.div>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-600 rounded-lg p-8 text-center shadow-2xl"
            >
              <FaGift className="text-5xl text-white mx-auto mb-4" />
              <h3 className="text-2xl font-normal text-white mb-4 tracking-wide">Garantía de satisfacción</h3>
              <p className="text-lg text-white/90 max-w-3xl mx-auto font-light leading-relaxed">
                Si no vendes y no estás satisfecho, regalamos un mes adicional de campaña o te entregamos todo el material generado.
              </p>
            </motion.div>
          </div>
        </motion.section>

        {/* Outside Madrid Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 px-4 bg-black"
        >
          <div className="max-w-6xl mx-auto">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-neutral-900 to-black rounded-lg p-12 border border-yellow-600/20 shadow-2xl"
            >
              <div className="flex items-center justify-center mb-8">
                <FaMapMarkerAlt className="text-5xl text-yellow-600" />
              </div>
              
              <h2 className="text-3xl md:text-5xl font-light text-center text-white mb-8 tracking-tight">
                ¿Vives fuera de Madrid?
              </h2>
              
              <div className="space-y-6 text-lg text-gray-400 max-w-4xl mx-auto font-light">
                <p className="text-center text-xl leading-relaxed">
                  Si vives en cualquier ciudad o provincia de Madrid, desde Madrid te llevamos al comprador ideal.
                </p>
                
                <div className="bg-gradient-to-r from-yellow-600 to-yellow-700 rounded-lg p-8 text-center">
                  <p className="text-3xl font-normal text-white mb-4 tracking-tight">
                    Precio para fuera de Madrid: 2.500€
                  </p>
                  <p className="text-xl text-white/90 font-light">
                    Sin honorarios de agencia. Solo una tarifa.
                  </p>
                </div>
                
                <p className="text-center text-xl leading-relaxed">
                  Tú solo tienes que encargarte de enseñarlo y si necesitas materias jurídicas te lo proporcionamos para la firma.
                </p>
                
                <div className="bg-neutral-900/50 rounded-lg p-6 border border-yellow-600/10">
                  <p className="text-center text-base leading-relaxed">
                    En cuanto a la fotografía, te iremos asesorando para que nos envíes fotos y nosotros las mejoramos.
                    <span className="block mt-2 text-yellow-600 font-normal">
                      Todo listo para recibir clientes de cualquier lugar de España o del extranjero.
                    </span>
                  </p>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Marta Lopez Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 px-4 bg-gradient-to-b from-black to-neutral-900"
        >
          <div className="max-w-5xl mx-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className="bg-gradient-to-br from-yellow-600 via-yellow-700 to-yellow-800 rounded-lg p-12 shadow-2xl relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMtOS45NDEgMC0xOCA4LjA1OS0xOCAxOHM4LjA1OSAxOCAxOCAxOCAxOC04LjA1OSAxOC0xOC04LjA1OS0xOC0xOC0xOHoiIHN0cm9rZT0iIzAwMCIgc3Ryb2tlLW9wYWNpdHk9Ii4wNSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-10"></div>
              
              <div className="relative z-10 flex flex-col md:flex-row items-center gap-12">
                <motion.div
                  whileHover={{ scale: 1.02, transition: { duration: 0.3 } }}
                  className="flex-shrink-0"
                >
                  <div className="relative">
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-2xl"></div>
                    <div className="relative w-48 h-48 md:w-64 md:h-64 rounded-full overflow-hidden border-4 border-white/90 shadow-2xl">
                      <Image
                        src="/marta.jpeg"
                        alt="Marta López - Asesora Real Estate"
                        layout="fill"
                        objectFit="cover"
                      />
                    </div>
                  </div>
                </motion.div>
                
                <div className="text-center md:text-left">
                  <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 }}
                  >
                    <h3 className="text-4xl md:text-6xl font-light text-white mb-3 tracking-tight">
                      Marta López
                    </h3>
                    <p className="text-2xl md:text-3xl text-white/90 font-light mb-6 tracking-wide">
                      Tu asesora Real Estate
                    </p>
                    <div className="flex flex-wrap gap-3 justify-center md:justify-start">
                      <span className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-light text-lg flex items-center gap-2 border border-white/20">
                        <FaStar className="text-white" />
                        Experta en Ventas
                      </span>
                      <span className="bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full text-white font-light text-lg border border-white/20">
                        15+ Años Experiencia
                      </span>
                    </div>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>

        {/* Final CTA Section */}
        <motion.section
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="py-24 px-4 bg-black"
        >
          <div className="max-w-4xl mx-auto text-center">
            <motion.h2
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-5xl font-light text-white mb-8 tracking-tight"
            >
              Nunca encontrarás una opción más exclusiva
            </motion.h2>
            
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-xl md:text-2xl text-gray-400 mb-12 font-light"
            >
              Para vender tu piso o chalet con servicios profesionales completos
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Link
                href="/contacto"
                className="inline-block bg-gradient-to-r from-yellow-600 via-yellow-700 to-yellow-600 text-white font-normal text-xl md:text-2xl px-12 md:px-16 py-5 md:py-6 rounded-full shadow-2xl hover:shadow-yellow-600/30 transition-all duration-500 tracking-wide border border-yellow-500/20"
              >
                Quiero vender con el Método 360°
              </Link>
            </motion.div>
          </div>
        </motion.section>

        {/* Elegant Footer Accent */}
        <div className="h-px bg-gradient-to-r from-transparent via-yellow-600/40 to-transparent"></div>
      </div>
    </>
  );
}
