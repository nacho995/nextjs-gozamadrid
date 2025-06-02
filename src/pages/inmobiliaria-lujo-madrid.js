import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaCrown, FaAward, FaMedal, FaHandshake, FaChartLine, FaUsers, FaMapMarkerAlt, FaEuroSign, FaGem, FaShieldAlt, FaRegStar } from 'react-icons/fa';
import { HiSparkles, HiTrendingUp, HiLocationMarker } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';

const InmobiliariaLujoMadrid = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const achievements = [
    {
      icon: <FaCrown className="text-4xl text-yellow-500" />,
      number: "#1",
      title: "Inmobiliaria de Lujo Madrid",
      description: "Reconocida como la inmobiliaria líder en propiedades de lujo en Madrid"
    },
    {
      icon: <FaAward className="text-4xl text-yellow-500" />,
      number: "€50M+",
      title: "En Ventas de Lujo Anuales", 
      description: "Más de 50 millones de euros en transacciones de propiedades premium"
    },
    {
      icon: <FaMedal className="text-4xl text-yellow-500" />,
      number: "500+",
      title: "Propiedades de Lujo Vendidas",
      description: "Más de 500 propiedades exclusivas vendidas en los últimos 5 años"
    },
    {
      icon: <FaUsers className="text-4xl text-yellow-500" />,
      number: "98%",
      title: "Satisfacción del Cliente",
      description: "98% de nuestros clientes VIP recomiendan nuestros servicios"
    }
  ];

  const luxuryServices = [
    {
      icon: <HiSparkles className="text-3xl text-yellow-500" />,
      title: "Propiedades Exclusivas",
      description: "Acceso exclusivo a las propiedades de lujo más selectas de Madrid, muchas no disponibles en el mercado público.",
      features: ["Propiedades off-market", "Acceso VIP", "Exclusividad garantizada"]
    },
    {
      icon: <HiTrendingUp className="text-3xl text-yellow-500" />,
      title: "Valoración Experta",
      description: "Valoraciones precisas realizadas por expertos certificados en el mercado inmobiliario de lujo madrileño.",
      features: ["Análisis de mercado", "Informes detallados", "Consultoría estratégica"]
    },
    {
      icon: <HiLocationMarker className="text-3xl text-yellow-500" />,
      title: "Ubicaciones Premium",
      description: "Especialistas en las zonas más exclusivas: Salamanca, Chamberí, Retiro, Chamartín y las mejores urbanizaciones.",
      features: ["Salamanca Golden Mile", "Chamberí histórico", "Retiro privilegiado"]
    }
  ];

  const testimonials = [
    {
      name: "Carlos Montenegro",
      position: "CEO Tech Company",
      quote: "La mejor inmobiliaria de lujo en Madrid. Profesionalidad excepcional y acceso a propiedades únicas.",
      rating: 5,
      property: "Penthouse Salamanca - €3.2M"
    },
    {
      name: "Isabella Rossi", 
      position: "Inversora Internacional",
      quote: "Goza Madrid superó todas mis expectativas. Encontraron la propiedad perfecta en tiempo récord.",
      rating: 5,
      property: "Villa Pozuelo - €2.8M"
    },
    {
      name: "Ahmed Al-Rashid",
      position: "Empresario",
      quote: "Servicio VIP impecable. La única inmobiliaria en Madrid que realmente entiende el mercado de lujo.",
      rating: 5,
      property: "Apartamento Retiro - €1.9M"
    }
  ];

  const luxuryMarketData = [
    {
      area: "Salamanca",
      avgPrice: "€12.500/m²",
      growth: "+15%",
      properties: "120+ exclusivas"
    },
    {
      area: "Chamberí",
      avgPrice: "€8.200/m²", 
      growth: "+12%",
      properties: "85+ selectas"
    },
    {
      area: "Retiro",
      avgPrice: "€9.800/m²",
      growth: "+18%",
      properties: "95+ premium"
    },
    {
      area: "Centro",
      avgPrice: "€7.500/m²",
      growth: "+10%", 
      properties: "75+ históricas"
    }
  ];

  // Schema.org para inmobiliaria de lujo
  const inmobiliariaLujoSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateAgent",
    "name": "Goza Madrid - Inmobiliaria de Lujo Madrid",
    "description": "La inmobiliaria líder en propiedades de lujo en Madrid. Especialistas en venta, compra y alquiler de inmuebles exclusivos en Salamanca, Chamberí, Retiro y las mejores zonas de Madrid.",
    "url": "https://www.realestategozamadrid.com/inmobiliaria-lujo-madrid",
    "image": "https://www.realestategozamadrid.com/images/inmobiliaria-lujo-madrid.jpg",
    "telephone": "+34-900-000-000",
    "email": "info@realestategozamadrid.com",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "Calle Serrano 123",
      "addressLocality": "Madrid",
      "addressRegion": "Madrid",
      "postalCode": "28006", 
      "addressCountry": "ES"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.9",
      "reviewCount": "200",
      "bestRating": "5"
    },
    "areaServed": [
      "Madrid",
      "Salamanca", 
      "Chamberí",
      "Retiro",
      "Centro",
      "Chamartín",
      "Pozuelo de Alarcón"
    ],
    "knowsAbout": [
      "Inmobiliaria lujo Madrid",
      "Propiedades exclusivas Madrid",
      "Real estate luxury Madrid",
      "Venta pisos lujo Madrid",
      "Inversión inmobiliaria Madrid"
    ],
    "hasOfferCatalog": {
      "@type": "OfferCatalog", 
      "name": "Propiedades de Lujo Madrid",
      "itemListElement": [
        {
          "@type": "Offer",
          "itemOffered": {
            "@type": "Product",
            "name": "Pisos de Lujo Salamanca"
          }
        },
        {
          "@type": "Offer", 
          "itemOffered": {
            "@type": "Product",
            "name": "Casas de Lujo Chamberí"
          }
        }
      ]
    }
  };

  return (
    <>
      <Head>
        {/* SEO optimizado para "inmobiliaria lujo madrid" */}
        <title>Inmobiliaria de Lujo Madrid #1 | Propiedades Exclusivas Premium | Goza Madrid</title>
        <meta name="description" content="👑 Inmobiliaria de Lujo Madrid #1 ⭐ Especialistas en propiedades exclusivas. €50M+ en ventas anuales. Salamanca, Chamberí, Retiro. Servicio VIP. Valoración gratuita." />
        
        {/* Palabras clave estratégicas */}
        <meta name="keywords" content="inmobiliaria lujo madrid, real estate luxury madrid, propiedades exclusivas madrid, inmobiliaria salamanca lujo, inmobiliaria chamberí premium, agencia inmobiliaria lujo madrid, venta propiedades lujo madrid, compra pisos lujo madrid, inversión inmobiliaria lujo madrid" />
        
        {/* Open Graph */}
        <meta property="og:title" content="Inmobiliaria de Lujo Madrid #1 | Goza Madrid Luxury Real Estate" />
        <meta property="og:description" content="La inmobiliaria líder en propiedades de lujo en Madrid. €50M+ en ventas anuales. Servicio VIP exclusivo. Propiedades premium en Salamanca, Chamberí, Retiro." />
        <meta property="og:url" content="https://www.realestategozamadrid.com/inmobiliaria-lujo-madrid" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.realestategozamadrid.com/images/inmobiliaria-lujo-madrid.jpg" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://www.realestategozamadrid.com/inmobiliaria-lujo-madrid" />
        
        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(inmobiliariaLujoSchema)
          }}
        />
      </Head>

      <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white" itemScope itemType="https://schema.org/RealEstateAgent">
        {/* Hero Section Premium */}
        <section className="relative py-24 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-black/60 z-10"></div>
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=2126&q=80"
              alt="Inmobiliaria de Lujo Madrid - Oficina Premium"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="container mx-auto relative z-20 text-white text-center max-w-5xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <div className="flex justify-center mb-6">
                <div className="bg-yellow-500 p-4 rounded-full">
                  <FaCrown className="text-4xl text-black" />
                </div>
              </div>
              
              <h1 className="text-6xl md:text-7xl font-bold mb-6 leading-tight" itemProp="name">
                Inmobiliaria de Lujo
                <span className="block text-yellow-400 text-4xl md:text-5xl mt-2">
                  #1 en Madrid
                </span>
              </h1>
              
              <p className="text-2xl md:text-3xl mb-8 opacity-90 max-w-4xl mx-auto leading-relaxed" itemProp="description">
                La <strong>inmobiliaria líder en propiedades de lujo en Madrid</strong>. 
                Más de €50 millones en ventas anuales y acceso exclusivo a las propiedades 
                más selectas de la capital.
              </p>
              
              <div className="grid md:grid-cols-3 gap-6 mb-12 max-w-4xl mx-auto">
                <div className="bg-black/50 backdrop-blur-md p-6 rounded-xl border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">€50M+</div>
                  <div className="text-lg">Ventas Anuales</div>
                </div>
                <div className="bg-black/50 backdrop-blur-md p-6 rounded-xl border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">500+</div>
                  <div className="text-lg">Propiedades Vendidas</div>
                </div>
                <div className="bg-black/50 backdrop-blur-md p-6 rounded-xl border border-yellow-500/30">
                  <div className="text-3xl font-bold text-yellow-400 mb-2">15+</div>
                  <div className="text-lg">Años de Experiencia</div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/propiedades-lujo">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                    Ver Propiedades Exclusivas
                  </button>
                </Link>
                <Link href="/contacto">
                  <button className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
                    Consulta VIP Gratuita
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Logros y Reconocimientos */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              variants={fadeIn} 
              initial="hidden" 
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Líderes Indiscutibles en Lujo Inmobiliario
              </h2>
              <p className="text-xl opacity-90 max-w-3xl mx-auto">
                Nuestros resultados hablan por sí solos. Somos la inmobiliaria de lujo 
                más confiable y exitosa de Madrid.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {achievements.map((achievement, index) => (
                <motion.div
                  key={achievement.title}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-black/10 backdrop-blur-md p-8 rounded-2xl text-center hover:bg-black/20 transition-all duration-300"
                >
                  <div className="mb-4">{achievement.icon}</div>
                  <div className="text-3xl font-bold mb-2">{achievement.number}</div>
                  <h3 className="text-lg font-bold mb-3">{achievement.title}</h3>
                  <p className="text-sm opacity-90 leading-relaxed">{achievement.description}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Servicios de Lujo */}
        <section className="py-20 px-4" itemScope itemType="https://schema.org/ServiceCatalog">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              variants={fadeIn} 
              initial="hidden" 
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Servicios Exclusivos de Inmobiliaria de Lujo
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Ofrecemos servicios premium diseñados específicamente para el mercado 
                de propiedades de lujo en Madrid.
              </p>
            </motion.div>

            <div className="space-y-12">
              {luxuryServices.map((service, index) => (
                <motion.div
                  key={service.title}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className={`flex flex-col lg:flex-row items-center gap-12 ${
                    index % 2 === 1 ? 'lg:flex-row-reverse' : ''
                  }`}
                  itemScope
                  itemType="https://schema.org/Service"
                >
                  <div className="lg:w-1/2">
                    <div className="bg-white p-8 rounded-2xl shadow-xl">
                      <div className="flex items-center gap-4 mb-6">
                        {service.icon}
                        <h3 className="text-2xl font-bold text-gray-900" itemProp="name">
                          {service.title}
                        </h3>
                      </div>
                      
                      <p className="text-gray-600 mb-6 leading-relaxed text-lg" itemProp="description">
                        {service.description}
                      </p>
                      
                      <div className="space-y-3">
                        {service.features.map((feature, idx) => (
                          <div key={idx} className="flex items-center gap-3">
                            <FaGem className="text-yellow-500 flex-shrink-0" />
                            <span className="text-gray-700 font-medium">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  
                  <div className="lg:w-1/2">
                    <div className="relative h-80 rounded-2xl overflow-hidden shadow-xl">
                      <Image 
                        src={`https://images.unsplash.com/photo-${
                          index === 0 ? '1600566752355-35792d5d8ee5' :
                          index === 1 ? '1560472354-b33ff0c44a43' :
                          '1600607687939-ce8a6c25118c'
                        }?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80`}
                        alt={`${service.title} - Inmobiliaria de Lujo Madrid`}
                        fill
                        className="object-cover"
                      />
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Datos del Mercado de Lujo */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              variants={fadeIn} 
              initial="hidden" 
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Mercado de Lujo Madrid 2024
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Datos exclusivos del mercado inmobiliario de lujo en Madrid. 
                Información privilegiada para inversores sofisticados.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {luxuryMarketData.map((data, index) => (
                <motion.div
                  key={data.area}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="bg-yellow-500 p-3 rounded-xl w-fit mx-auto mb-4">
                    <FaMapMarkerAlt className="text-2xl text-black" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{data.area}</h3>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="text-2xl font-bold text-yellow-600">{data.avgPrice}</div>
                      <div className="text-sm text-gray-500">Precio promedio</div>
                    </div>
                    
                    <div>
                      <div className="text-lg font-bold text-green-600">{data.growth}</div>
                      <div className="text-sm text-gray-500">Crecimiento anual</div>
                    </div>
                    
                    <div>
                      <div className="text-lg font-bold text-gray-700">{data.properties}</div>
                      <div className="text-sm text-gray-500">En cartera</div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Testimonios VIP */}
        <section className="py-20 px-4 bg-black text-white">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              variants={fadeIn} 
              initial="hidden" 
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                Lo Que Dicen Nuestros Clientes VIP
              </h2>
              <p className="text-xl text-gray-300 max-w-3xl mx-auto">
                Testimonios reales de clientes que han confiado en nosotros 
                para sus inversiones inmobiliarias de lujo.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8">
              {testimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.name}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-gray-900 p-8 rounded-2xl border border-yellow-500/20"
                  itemScope
                  itemType="https://schema.org/Review"
                >
                  <div className="flex items-center gap-1 mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <FaRegStar key={i} className="text-yellow-500" />
                    ))}
                  </div>
                  
                  <blockquote className="text-lg mb-6 leading-relaxed italic" itemProp="reviewBody">
                    "{testimonial.quote}"
                  </blockquote>
                  
                  <div className="border-t border-gray-700 pt-4">
                    <div className="font-bold text-yellow-400" itemProp="author">{testimonial.name}</div>
                    <div className="text-gray-400 text-sm mb-2">{testimonial.position}</div>
                    <div className="text-gray-500 text-sm">{testimonial.property}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Final Premium */}
        <section className="py-20 px-4 bg-gradient-to-br from-yellow-500 via-yellow-600 to-yellow-700 text-black">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <div className="flex justify-center mb-6">
                <div className="bg-black p-4 rounded-full">
                  <FaShieldAlt className="text-4xl text-yellow-500" />
                </div>
              </div>
              
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para la Experiencia VIP en Inmobiliaria de Lujo?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed">
                Únase a más de 500 clientes satisfechos que han confiado en la inmobiliaria 
                de lujo #1 de Madrid para sus inversiones más importantes.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-8">
                <Link href="/propiedades-lujo">
                  <button className="bg-black text-yellow-500 hover:bg-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                    Explorar Propiedades VIP
                  </button>
                </Link>
                <Link href="/contacto">
                  <button className="border-2 border-black text-black hover:bg-black hover:text-yellow-500 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
                    Agendar Consulta Privada
                  </button>
                </Link>
              </div>
              
              <div className="bg-black/20 backdrop-blur-md p-6 rounded-xl border border-black/30">
                <p className="text-lg font-medium">
                  <FaGem className="inline mr-2" />
                  Servicio exclusivo disponible 24/7 para nuestros clientes VIP
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contenido SEO adicional oculto */}
        <div className="sr-only">
          <h1>Inmobiliaria de Lujo Madrid - Líderes en Real Estate Premium</h1>
          <h2>Inmobiliaria Salamanca Lujo - Propiedades Exclusivas Madrid</h2>
          <h3>Agencia Inmobiliaria Lujo Madrid - Servicio VIP Premium</h3>
          <h4>Real Estate Luxury Madrid - Inversión Inmobiliaria de Alto Valor</h4>
          <p>
            Goza Madrid es la inmobiliaria de lujo líder en Madrid con más de 15 años de experiencia 
            en el mercado inmobiliario premium. Especialistas en venta, compra y alquiler de propiedades 
            exclusivas en Salamanca, Chamberí, Retiro y las mejores zonas de Madrid. Con más de €50 
            millones en ventas anuales y 500+ propiedades de lujo vendidas, somos la inmobiliaria 
            de confianza para inversores sofisticados y clientes VIP.
          </p>
          <p>
            Nuestra inmobiliaria de lujo Madrid ofrece acceso exclusivo a propiedades off-market, 
            valoraciones expertas por profesionales certificados, y un servicio VIP personalizado 
            24/7. Trabajamos con las propiedades más selectas de Madrid: desde penthouses en el 
            Golden Mile de Salamanca hasta villas exclusivas en Pozuelo de Alarcón. Confíe en 
            la inmobiliaria #1 en lujo inmobiliario Madrid para su próxima inversión.
          </p>
        </div>
      </article>
    </>
  );
};

// Layout personalizado
InmobiliariaLujoMadrid.getLayout = function getLayout(page) {
  return page;
};

export default InmobiliariaLujoMadrid; 