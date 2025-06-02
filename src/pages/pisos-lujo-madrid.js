import React from 'react';
import Head from 'next/head';
import { motion } from 'framer-motion';
import { FaBuilding, FaMapMarkerAlt, FaEuroSign, FaStar, FaCheckCircle } from 'react-icons/fa';
import { HiHome, HiSparkles, HiCash } from 'react-icons/hi';
import Link from 'next/link';
import Image from 'next/image';
import LuxuryNavigation from '../components/seo/LuxuryNavigation';

const PisosLujoMadrid = () => {
  const fadeIn = {
    hidden: { opacity: 0, y: 20 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.6 }
    }
  };

  const luxuryNeighborhoods = [
    {
      name: "Salamanca",
      description: "El distrito más exclusivo de Madrid con pisos de lujo únicos",
      priceRange: "€800.000 - €5.000.000+",
      highlights: ["Calle Serrano", "Golden Mile", "Embassies Area"]
    },
    {
      name: "Chamberí", 
      description: "Elegancia clásica con pisos reformados de alta gama",
      priceRange: "€600.000 - €3.500.000",
      highlights: ["Almagro", "Trafalgar", "Ríos Rosas"]
    },
    {
      name: "Retiro",
      description: "Pisos de lujo frente al parque más prestigioso",
      priceRange: "€700.000 - €4.000.000",
      highlights: ["Jerónimos", "Ibiza", "Niño Jesús"]
    },
    {
      name: "Centro",
      description: "Pisos históricos de lujo completamente renovados", 
      priceRange: "€500.000 - €2.500.000",
      highlights: ["Sol", "Palacio", "Embajadores"]
    }
  ];

  const luxuryFeatures = [
    {
      icon: <HiHome className="text-4xl text-yellow-500" />,
      title: "Pisos Exclusivos",
      description: "Selección de los pisos de lujo más exclusivos en las mejores ubicaciones de Madrid"
    },
    {
      icon: <HiSparkles className="text-4xl text-yellow-500" />,
      title: "Reformas Premium",
      description: "Pisos completamente reformados con acabados de lujo y diseño interior exclusivo"
    },
    {
      icon: <HiCash className="text-4xl text-yellow-500" />,
      title: "Inversión Segura",
      description: "Pisos de lujo con alta revalorización y rentabilidad garantizada en Madrid"
    }
  ];

  const luxuryAmenities = [
    "Portero físico 24h",
    "Piscina comunitaria", 
    "Gimnasio privado",
    "Terraza con vistas",
    "Plaza de garaje doble",
    "Trastero incluido",
    "Aire acondicionado",
    "Calefacción central",
    "Suelos de mármol",
    "Cocina de diseño",
    "Baños en suite",
    "Vestidor principal"
  ];

  // Schema.org específico para pisos de lujo
  const pisosLujoSchema = {
    "@context": "https://schema.org",
    "@type": "RealEstateListing", 
    "name": "Pisos de Lujo Madrid - Goza Madrid",
    "description": "Los pisos de lujo más exclusivos de Madrid en Salamanca, Chamberí y Retiro. Propiedades premium con acabados de lujo, reformas completas y ubicaciones privilegiadas.",
    "url": "https://www.realestategozamadrid.com/pisos-lujo-madrid",
    "image": "https://www.realestategozamadrid.com/images/pisos-lujo-madrid.jpg",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Madrid",
      "addressRegion": "Madrid", 
      "addressCountry": "ES"
    },
    "offers": {
      "@type": "AggregateOffer",
      "priceCurrency": "EUR",
      "lowPrice": "500000",
      "highPrice": "5000000",
      "offerCount": "50+"
    },
    "category": "Pisos de Lujo",
    "knowsAbout": [
      "Pisos lujo Madrid",
      "Apartamentos exclusivos Madrid", 
      "Propiedades premium Salamanca",
      "Pisos reformados lujo Chamberí"
    ]
  };

  return (
    <>
      <Head>
        {/* SEO optimizado para "pisos lujo madrid" */}
        <title>Pisos de Lujo Madrid | Los Más Exclusivos en Salamanca, Chamberí y Retiro | Goza Madrid</title>
        <meta name="description" content="🏠 Pisos de Lujo Madrid 🌟 Exclusivos en Salamanca, Chamberí, Retiro. Apartamentos premium reformados con acabados de lujo. Valoración gratuita. Ver pisos disponibles." />
        
        {/* Palabras clave específicas */}
        <meta name="keywords" content="pisos lujo madrid, pisos salamanca lujo, apartamentos lujo madrid, pisos chamberí lujo, pisos retiro lujo, pisos exclusivos madrid, apartamentos premium madrid, pisos reformados lujo madrid, propiedades lujo centro madrid, pisos alquiler lujo madrid" />
        
        {/* Open Graph optimizado */}
        <meta property="og:title" content="Pisos de Lujo Madrid | Los Más Exclusivos | Goza Madrid" />
        <meta property="og:description" content="Descubra los pisos de lujo más exclusivos de Madrid. Salamanca, Chamberí, Retiro. Apartamentos premium con acabados de lujo. Valoración gratuita." />
        <meta property="og:url" content="https://www.realestategozamadrid.com/pisos-lujo-madrid" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://www.realestategozamadrid.com/images/pisos-lujo-madrid.jpg" />
        
        {/* Canonical */}
        <link rel="canonical" href="https://www.realestategozamadrid.com/pisos-lujo-madrid" />
        
        {/* Schema.org */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(pisosLujoSchema)
          }}
        />
      </Head>

      <article className="min-h-screen bg-gradient-to-b from-gray-50 to-white" itemScope itemType="https://schema.org/RealEstateListing">
        {/* Navegación de Lujo Estratégica */}
        <LuxuryNavigation currentPage="Pisos de Lujo Madrid" showBreadcrumb={true} />
        
        {/* Hero Section con SEO enriquecido */}
        <section className="relative py-20 px-4 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/50 z-10"></div>
          <div className="absolute inset-0 z-0">
            <Image 
              src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
              alt="Pisos de Lujo Madrid - Salón Exclusivo"
              fill
              className="object-cover"
              priority
            />
          </div>
          
          <div className="container mx-auto relative z-20 text-white text-center max-w-4xl">
            <motion.div
              initial="hidden"
              animate="visible"
              variants={fadeIn}
            >
              <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight" itemProp="name">
                Pisos de Lujo Madrid
                <span className="block text-yellow-400 text-3xl md:text-4xl mt-2">
                  Los Más Exclusivos de la Capital
                </span>
              </h1>
              
              <p className="text-xl md:text-2xl mb-8 opacity-90 max-w-3xl mx-auto leading-relaxed" itemProp="description">
                Descubra la selección más exclusiva de <strong>pisos de lujo en Madrid</strong>. 
                Apartamentos premium en Salamanca, Chamberí y Retiro con acabados excepcionales 
                y ubicaciones privilegiadas.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                <Link href="/contacto">
                  <button className="bg-yellow-500 hover:bg-yellow-600 text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                    Ver Pisos Disponibles
                  </button>
                </Link>
                <Link href="/vender">
                  <button className="border-2 border-yellow-500 text-yellow-500 hover:bg-yellow-500 hover:text-black px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
                    Valorar Mi Piso
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Estadísticas impresionantes */}
        <section className="py-16 bg-black text-white">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8 text-center">
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-4xl font-bold text-yellow-500 mb-2">200+</div>
                <div className="text-lg">Pisos de Lujo Vendidos</div>
              </motion.div>
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-4xl font-bold text-yellow-500 mb-2">€3.2M</div>
                <div className="text-lg">Precio Promedio Salamanca</div>
              </motion.div>
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-4xl font-bold text-yellow-500 mb-2">98%</div>
                <div className="text-lg">Clientes Satisfechos</div>
              </motion.div>
              <motion.div variants={fadeIn} initial="hidden" whileInView="visible" viewport={{ once: true }}>
                <div className="text-4xl font-bold text-yellow-500 mb-2">15+</div>
                <div className="text-lg">Años Especializados</div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* Barrios de Lujo */}
        <section className="py-20 px-4" itemScope itemType="https://schema.org/ItemList">
          <div className="container mx-auto max-w-6xl">
            <motion.div 
              className="text-center mb-16"
              variants={fadeIn} 
              initial="hidden" 
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
                Pisos de Lujo por Barrios Exclusivos
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cada barrio de Madrid tiene su encanto único. Descubra los pisos de lujo 
                más selectos en las zonas más prestigiosas de la capital.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 gap-8">
              {luxuryNeighborhoods.map((neighborhood, index) => (
                <motion.div
                  key={neighborhood.name}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-300 group"
                  itemScope
                  itemType="https://schema.org/Place"
                >
                  <div className="p-8">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="bg-yellow-500 p-3 rounded-xl">
                        <FaMapMarkerAlt className="text-2xl text-black" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900" itemProp="name">
                        Pisos de Lujo en {neighborhood.name}
                      </h3>
                    </div>
                    
                    <p className="text-gray-600 mb-4 leading-relaxed" itemProp="description">
                      {neighborhood.description}
                    </p>
                    
                    <div className="bg-gray-50 p-4 rounded-xl mb-4">
                      <div className="flex items-center gap-2 mb-2">
                        <FaEuroSign className="text-yellow-500" />
                        <span className="font-semibold text-gray-900">Rango de Precios:</span>
                      </div>
                      <div className="text-lg font-bold text-yellow-600">
                        {neighborhood.priceRange}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h4 className="font-semibold text-gray-900">Zonas Destacadas:</h4>
                      <div className="flex flex-wrap gap-2">
                        {neighborhood.highlights.map((highlight, idx) => (
                          <span 
                            key={idx}
                            className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium"
                          >
                            {highlight}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Características de Lujo */}
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
                ¿Qué Hace Únicos Nuestros Pisos de Lujo?
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Cada piso de lujo en nuestra cartera ha sido seleccionado por cumplir 
                los más altos estándares de calidad, ubicación y exclusividad.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-3 gap-8 mb-16">
              {luxuryFeatures.map((feature, index) => (
                <motion.div
                  key={feature.title}
                  variants={fadeIn}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-8 rounded-2xl shadow-lg text-center hover:shadow-xl transition-all duration-300"
                >
                  <div className="mb-4">{feature.icon}</div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Amenities Grid */}
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
              className="bg-white p-8 rounded-2xl shadow-lg"
            >
              <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
                Amenities Premium Incluidos
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {luxuryAmenities.map((amenity, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <FaCheckCircle className="text-yellow-500 flex-shrink-0" />
                    <span className="text-gray-700">{amenity}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-20 px-4 bg-gradient-to-r from-yellow-500 to-yellow-600 text-black">
          <div className="container mx-auto max-w-4xl text-center">
            <motion.div
              variants={fadeIn}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                ¿Listo para Encontrar su Piso de Lujo en Madrid?
              </h2>
              <p className="text-xl mb-8 opacity-90 max-w-2xl mx-auto leading-relaxed">
                Nuestros expertos en pisos de lujo le ayudarán a encontrar la propiedad 
                perfecta o a vender su piso al mejor precio del mercado.
              </p>
              
              <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/contacto">
                  <button className="bg-black text-white hover:bg-gray-900 px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-xl">
                    Ver Pisos Disponibles
                  </button>
                </Link>
                <Link href="/vender">
                  <button className="border-2 border-black text-black hover:bg-black hover:text-white px-8 py-4 rounded-full font-bold text-lg transition-all duration-300 transform hover:scale-105">
                    Valorar Mi Piso de Lujo
                  </button>
                </Link>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Contenido SEO adicional oculto */}
        <div className="sr-only">
          <h1>Pisos de Lujo Madrid - La Mayor Selección de Apartamentos Premium</h1>
          <h2>Pisos de Lujo en Salamanca Madrid - Los Más Exclusivos</h2>
          <h3>Apartamentos de Lujo Madrid Chamberí - Reformados y Premium</h3>
          <h4>Pisos Lujo Retiro Madrid - Frente al Parque</h4>
          <p>
            Goza Madrid es la inmobiliaria líder en pisos de lujo Madrid con la mayor selección 
            de apartamentos premium en Salamanca, Chamberí, Retiro y Centro. Nuestros pisos de lujo 
            destacan por sus acabados excepcionales, ubicaciones privilegiadas y servicios exclusivos. 
            Si busca pisos lujo Madrid, somos su mejor opción con más de 15 años especializados 
            en el mercado inmobiliario de lujo madrileño.
          </p>
          <p>
            Cada piso de lujo en nuestra cartera ha sido cuidadosamente seleccionado por nuestros 
            expertos. Ofrecemos pisos reformados con acabados de lujo, pisos históricos renovados, 
            apartamentos modernos con terraza y pisos exclusivos con servicios de portería. 
            Nuestros pisos de lujo Madrid incluyen las mejores amenities: piscina comunitaria, 
            gimnasio privado, plaza de garaje doble, trastero y las mejores vistas de la capital.
          </p>
        </div>
      </article>
    </>
  );
};

// Layout personalizado sin header/footer principales
PisosLujoMadrid.getLayout = function getLayout(page) {
  return page;
};

export default PisosLujoMadrid; 