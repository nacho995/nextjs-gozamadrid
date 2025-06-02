import React from 'react';
import Link from 'next/link';
import { FaCrown, FaHome, FaBuilding, FaMapMarkerAlt, FaChevronRight } from 'react-icons/fa';
import { motion } from 'framer-motion';

const LuxuryNavigation = ({ currentPage = '', showBreadcrumb = true }) => {
  const luxuryPages = [
    {
      name: 'Propiedades de Lujo',
      href: '/propiedades-lujo',
      description: 'Descubra nuestra selección exclusiva',
      icon: <FaCrown className="text-lg" />
    },
    {
      name: 'Pisos de Lujo Madrid',
      href: '/pisos-lujo-madrid', 
      description: 'Apartamentos premium en las mejores zonas',
      icon: <FaBuilding className="text-lg" />
    },
    {
      name: 'Inmobiliaria de Lujo',
      href: '/inmobiliaria-lujo-madrid',
      description: 'La #1 en real estate premium',
      icon: <FaMapMarkerAlt className="text-lg" />
    }
  ];

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": [
      {
        "@type": "ListItem",
        "position": 1,
        "name": "Inicio",
        "item": "https://www.realestategozamadrid.com"
      },
      ...(currentPage ? [{
        "@type": "ListItem",
        "position": 2, 
        "name": currentPage,
        "item": `https://www.realestategozamadrid.com${getCurrentPageHref(currentPage)}`
      }] : [])
    ]
  };

  function getCurrentPageHref(pageName) {
    const pageMap = {
      'Propiedades de Lujo': '/propiedades-lujo',
      'Pisos de Lujo Madrid': '/pisos-lujo-madrid',
      'Inmobiliaria de Lujo Madrid': '/inmobiliaria-lujo-madrid'
    };
    return pageMap[pageName] || '/';
  }

  return (
    <>
      {/* Schema.org para breadcrumb */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema)
        }}
      />

      {/* Breadcrumb Navigation */}
      {showBreadcrumb && currentPage && (
        <nav className="bg-gray-50 py-4 px-4" aria-label="Breadcrumb">
          <div className="container mx-auto max-w-6xl">
            <ol className="flex items-center space-x-2 text-sm">
              <li>
                <Link href="/" className="text-gray-500 hover:text-yellow-600 transition-colors">
                  <FaHome className="inline mr-1" />
                  Inicio
                </Link>
              </li>
              <li>
                <FaChevronRight className="text-gray-400 text-xs" />
              </li>
              <li>
                <span className="text-gray-900 font-medium">{currentPage}</span>
              </li>
            </ol>
          </div>
        </nav>
      )}

      {/* Navegación de Lujo Estratégica */}
      <section className="bg-gradient-to-r from-yellow-50 to-yellow-100 py-8 px-4 border-b border-yellow-200">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              Navegue por Nuestro Portfolio de Lujo
            </h2>
            <p className="text-gray-600">
              Acceso directo a las propiedades más exclusivas de Madrid
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {luxuryPages.map((page, index) => (
              <motion.div
                key={page.href}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`
                  bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-300 group
                  ${currentPage === page.name ? 'ring-2 ring-yellow-500 bg-yellow-50' : ''}
                `}
              >
                <Link href={page.href}>
                  <div className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <div className={`
                        p-3 rounded-full transition-colors duration-300
                        ${currentPage === page.name 
                          ? 'bg-yellow-500 text-black' 
                          : 'bg-yellow-100 text-yellow-600 group-hover:bg-yellow-500 group-hover:text-black'
                        }
                      `}>
                        {page.icon}
                      </div>
                    </div>
                    
                    <h3 className={`
                      text-lg font-bold mb-2 transition-colors duration-300
                      ${currentPage === page.name 
                        ? 'text-yellow-700' 
                        : 'text-gray-900 group-hover:text-yellow-700'
                      }
                    `}>
                      {page.name}
                    </h3>
                    
                    <p className="text-gray-600 text-sm leading-relaxed">
                      {page.description}
                    </p>

                    {currentPage !== page.name && (
                      <div className="mt-4">
                        <span className="inline-flex items-center text-yellow-600 text-sm font-medium group-hover:text-yellow-700 transition-colors">
                          Explorar
                          <FaChevronRight className="ml-1 text-xs group-hover:translate-x-1 transition-transform" />
                        </span>
                      </div>
                    )}
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Enlaces adicionales para SEO */}
          <div className="mt-8 text-center">
            <div className="inline-flex flex-wrap gap-4 text-sm">
              <Link 
                href="/vender" 
                className="text-gray-600 hover:text-yellow-600 transition-colors font-medium"
              >
                Vender Propiedad de Lujo
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/servicios" 
                className="text-gray-600 hover:text-yellow-600 transition-colors font-medium"
              >
                Servicios Premium
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/contacto" 
                className="text-gray-600 hover:text-yellow-600 transition-colors font-medium"
              >
                Consulta VIP
              </Link>
              <span className="text-gray-300">|</span>
              <Link 
                href="/blog" 
                className="text-gray-600 hover:text-yellow-600 transition-colors font-medium"
              >
                Blog Inmobiliario
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Enlaces internos adicionales ocultos para SEO */}
      <div className="sr-only">
        <nav aria-label="Enlaces SEO Internos">
          <h2>Navegación Inmobiliaria de Lujo Madrid</h2>
          <ul>
            <li><Link href="/propiedades-lujo">Propiedades de Lujo Madrid</Link></li>
            <li><Link href="/pisos-lujo-madrid">Pisos de Lujo Madrid Salamanca Chamberí</Link></li>
            <li><Link href="/inmobiliaria-lujo-madrid">Inmobiliaria de Lujo Madrid #1</Link></li>
            <li><Link href="/vender">Vender Propiedades de Lujo Madrid</Link></li>
            <li><Link href="/servicios">Servicios Inmobiliarios Premium</Link></li>
            <li><Link href="/blog">Blog Inmobiliario Madrid</Link></li>
            <li><Link href="/contacto">Contacto Inmobiliaria de Lujo</Link></li>
          </ul>
        </nav>
      </div>
    </>
  );
};

export default LuxuryNavigation; 