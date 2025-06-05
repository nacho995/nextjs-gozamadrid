import React, { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Link from "next/link";
import Footer3 from '@/components/footer';
import CookieConsent from '@/components/CookieConsent';
import { FloatingValoradorButton } from '@/components/cards';
import { useNavbar } from '@/components/context/navBarContext';

const BlogDetail = () => {
  const router = useRouter();
  const { id } = router.query;
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedBlogs, setRelatedBlogs] = useState([]);
  const [error, setError] = useState(false);

  // Blogs de muestra con contenido SEO completo
  const sampleBlogs = [
    {
      _id: 'sample1',
      title: 'Viviendas de Lujo en Madrid: Las Mejores Zonas para Invertir en 2024',
      excerpt: 'Descubre las mejores zonas para invertir en viviendas de lujo en Madrid en 2024, con análisis detallado de precios y tendencias del mercado.',
      description: 'Madrid se consolida como uno de los mercados de vivienda de lujo más atractivos de Europa. Conoce las zonas más exclusivas y las mejores oportunidades de inversión.',
      content: `
        <div class="luxury-blog-content">
            <h2>El Mercado Inmobiliario de Lujo en Madrid: Una Oportunidad Única</h2>
            <p class="lead">Madrid continúa consolidándose como uno de los destinos más atractivos para la inversión en propiedades de lujo en Europa, con un crecimiento sostenido que supera las expectativas del mercado internacional.</p>
            
            <h3>Las Zonas Más Exclusivas de Madrid</h3>
            <p>El distrito de <strong>Salamanca</strong> mantiene su posición como la zona premium por excelencia, con propiedades que alcanzan los 12.000 €/m² en las calles más cotizadas como Serrano y Velázquez.</p>
            
            <div class="highlight-box">
                <h4>Datos del Mercado 2024</h4>
                <ul>
                    <li>Crecimiento del 8.5% en propiedades de lujo</li>
                    <li>Precio medio: 8.500 €/m² en zonas premium</li>
                    <li>Tiempo de venta: 45 días promedio</li>
                    <li>ROI promedio: 6.2% anual</li>
                </ul>
            </div>
            
            <h3>Chamberí: La Nueva Joya de la Corona</h3>
            <p>El barrio de Chamberí ha experimentado una revalorización del 15% en el último año, posicionándose como una alternativa atractiva al tradicional distrito de Salamanca.</p>
            
            <h3>Inversión y Rentabilidad</h3>
            <p>Las propiedades de lujo en Madrid ofrecen una rentabilidad media del 6.2% anual, significativamente superior a otros mercados europeos. La demanda internacional, especialmente de compradores latinoamericanos y del Golfo Pérsico, mantiene el mercado dinámico.</p>
            
            <h3>Perspectivas para 2024</h3>
            <p>Los expertos prevén un crecimiento moderado pero sostenido, con especial atención a las propiedades con certificación energética y tecnología domótica integrada.</p>
        </div>
      `,
      date: '2024-01-15',
      dateFormatted: '15 de enero de 2024',
      author: 'Equipo Goza Madrid',
      readTime: '8 min lectura',
      category: 'Inversión Inmobiliaria',
      tags: ['vivienda lujo Madrid', 'inversión inmobiliaria', 'Salamanca', 'Chamberí'],
      image: {
        src: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=1200&h=800&fit=crop&q=80',
        alt: 'Viviendas de lujo en Madrid'
      }
    },
    {
      _id: 'sample2',
      title: 'Comprar Casa de Lujo Madrid: Mercado Inmobiliario Premium 2024',
      excerpt: 'Guía completa para comprar casas de lujo en Madrid: mercado actual, precios, zonas premium y proceso de compra especializado.',
      description: 'El sector de casas de lujo Madrid experimenta un crecimiento excepcional. Conoce el proceso especializado para adquirir propiedades premium.',
      content: `
        <div class="luxury-blog-content">
            <h2>Guía Completa para Comprar Casas de Lujo en Madrid</h2>
            <p class="lead">El mercado de casas de lujo en Madrid ha experimentado una transformación radical en los últimos años, ofreciendo oportunidades únicas para inversores y compradores exigentes.</p>
            
            <h3>El Mercado Actual de Casas de Lujo</h3>
            <p>En 2024, el mercado premium madrileño se caracteriza por una oferta limitada y una demanda creciente, especialmente en zonas como La Moraleja, Puerta de Hierro y el centro histórico rehabilitado.</p>
            
            <div class="price-table">
                <h4>Precios por Zonas (€/m²)</h4>
                <table>
                    <tr><td>La Moraleja</td><td>4.500 - 6.000 €</td></tr>
                    <tr><td>Puerta de Hierro</td><td>5.000 - 7.500 €</td></tr>
                    <tr><td>Centro Histórico</td><td>8.000 - 12.000 €</td></tr>
                    <tr><td>Salamanca</td><td>9.000 - 15.000 €</td></tr>
                </table>
            </div>
            
            <h3>Proceso de Compra Especializado</h3>
            <p>La adquisición de propiedades de lujo requiere un enfoque especializado que incluye due diligence exhaustiva, negociación profesional y servicios post-venta premium.</p>
            
            <h3>Servicios Exclusivos Incluidos</h3>
            <ul>
                <li>Asesoramiento jurídico especializado</li>
                <li>Gestión integral de documentación</li>
                <li>Servicio de mudanza premium</li>
                <li>Conexión con servicios de lujo locales</li>
            </ul>
        </div>
      `,
      date: '2024-01-20',
      dateFormatted: '20 de enero de 2024',
      author: 'Equipo Goza Madrid',
      readTime: '10 min lectura',
      category: 'Compra de Lujo',
      tags: ['casas de lujo Madrid', 'comprar propiedad premium', 'mercado inmobiliario'],
      image: {
        src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=1200&h=800&fit=crop&q=80',
        alt: 'Casa de lujo en Madrid'
      }
    },
    {
      _id: 'sample3',
      title: 'Apartamentos de Lujo Madrid: Guía para Elegir el Barrio Perfecto',
      excerpt: 'Guía completa para elegir el barrio perfecto para tu apartamento de lujo en Madrid, con análisis de las mejores zonas y rentabilidad.',
      description: 'Seleccionar el barrio ideal para tu apartamento de lujo Madrid es una decisión crucial. Cada zona ofrece características únicas para diferentes perfiles.',
      content: `
        <div class="luxury-blog-content">
            <h2>Cómo Elegir el Barrio Perfecto para tu Apartamento de Lujo</h2>
            <p class="lead">Madrid ofrece una diversidad única de barrios de lujo, cada uno con características distintivas que se adaptan a diferentes estilos de vida y preferencias.</p>
            
            <h3>Análisis por Perfiles de Compradores</h3>
            
            <h4>Para Profesionales Ejecutivos</h4>
            <p><strong>Recomendación: Salamanca y Retiro</strong><br>
            Proximidad a centros financieros, excelente conectividad y servicios premium. Precio promedio: 10.500 €/m²</p>
            
            <h4>Para Familias Internacionales</h4>
            <p><strong>Recomendación: Chamberí y Chamartín</strong><br>
            Colegios internacionales, parques, ambiente familiar seguro. Precio promedio: 7.800 €/m²</p>
            
            <h4>Para Inversores</h4>
            <p><strong>Recomendación: Centro y Malasaña</strong><br>
            Alta rentabilidad turística, revalorización constante. ROI: 7.5% anual</p>
            
            <div class="neighborhood-comparison">
                <h4>Comparativa de Servicios</h4>
                <ul>
                    <li><strong>Salamanca:</strong> Shopping de lujo, gastronomía michelin, arte</li>
                    <li><strong>Chamberí:</strong> Vida de barrio premium, mercados gourmet</li>
                    <li><strong>Retiro:</strong> Espacios verdes, tranquilidad urbana</li>
                    <li><strong>Centro:</strong> Cultura, historia, vida nocturna</li>
                </ul>
            </div>
        </div>
      `,
      date: '2024-01-25',
      dateFormatted: '25 de enero de 2024',
      author: 'Expertos Goza Madrid',
      readTime: '12 min lectura',
      category: 'Guías de Barrios',
      tags: ['apartamentos de lujo Madrid', 'mejores barrios Madrid', 'inversión inmobiliaria'],
      image: {
        src: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=1200&h=800&fit=crop&q=80',
        alt: 'Apartamentos de lujo en Madrid'
      }
    },
    {
      _id: 'sample4',
      title: 'Diseño Interior Lujo Madrid: Tendencias Premium 2024',
      excerpt: 'Descubre las 10 tendencias más exclusivas en diseño interior para viviendas de lujo en Madrid: minimalismo maximalista, tecnología invisible y sostenibilidad premium.',
      description: 'El diseño interior de viviendas de lujo Madrid evoluciona hacia conceptos que combinan elegancia atemporal con innovación tecnológica.',
      content: `
        <div class="luxury-blog-content">
            <h2>Las 10 Tendencias de Diseño Interior de Lujo para 2024</h2>
            <p class="lead">El diseño interior de lujo en Madrid evoluciona hacia una sofisticación que combina la elegancia atemporal con las últimas innovaciones tecnológicas y sostenibles.</p>
            
            <h3>1. Minimalismo Maximalista</h3>
            <p>La tendencia que define 2024: espacios minimalistas en estructura pero maximalistas en calidad y detalles exclusivos.</p>
            
            <h3>2. Tecnología Invisible</h3>
            <p>Domótica integrada de forma imperceptible: climatización inteligente, iluminación adaptativa y seguridad invisible.</p>
            
            <h3>3. Materiales Nobles Sostenibles</h3>
            <p>Mármol reciclado, maderas certificadas y metales con origen ético se posicionan como must-have.</p>
            
            <div class="trend-highlight">
                <h4>Paletas de Color 2024</h4>
                <ul>
                    <li><strong>Oro Antiguo:</strong> El nuevo dorado para acentos</li>
                    <li><strong>Verde Sage:</strong> Tranquilidad premium</li>
                    <li><strong>Azul Medianoche:</strong> Profundidad y elegancia</li>
                    <li><strong>Beige Cálido:</strong> La base perfecta</li>
                </ul>
            </div>
            
            <h3>4. Espacios Wellness Integrados</h3>
            <p>Gimnasios privados, spas domésticos y espacios de meditación se convierten en elementos esenciales.</p>
            
            <h3>5. Arte como Inversión</h3>
            <p>Galerías privadas y colecciones curadas profesionalmente transforman los espacios residenciales en verdaderos museos privados.</p>
        </div>
      `,
      date: '2024-01-30',
      dateFormatted: '30 de enero de 2024',
      author: 'Diseñadores Goza Madrid',
      readTime: '13 min lectura',
      category: 'Diseño Interior',
      tags: ['diseño interior lujo', 'tendencias 2024', 'viviendas de lujo Madrid'],
      image: {
        src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=1200&h=800&fit=crop&q=80',
        alt: 'Diseño interior de lujo en Madrid'
      }
    }
  ];

  useEffect(() => {
    if (id) {
      setLoading(true);
      
      // Buscar el blog en los blogs de muestra
      const foundBlog = sampleBlogs.find(blog => blog._id === id);
      
      if (foundBlog) {
        setBlog(foundBlog);
        // Set related blogs (exclude current blog)
        const related = sampleBlogs.filter(b => b._id !== id).slice(0, 3);
        setRelatedBlogs(related);
      } else {
        setError('Blog no encontrado');
      }
      
      setLoading(false);
    }
  }, [id]);

  // Variables para reutilizar en la página

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900">
        {/* Header de navegación destacado */}
        <div className="sticky top-0 z-50 bg-black shadow-lg shadow-amber-400/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                GOZA MADRID
              </Link>
              <Link href="/blog" className="text-amber-400 hover:text-yellow-500 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver al Blog
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="text-center">
            <div className="relative">
              <div className="w-16 h-16 border-4 border-transparent border-t-amber-400 border-r-amber-400 rounded-full animate-spin mb-4"></div>
              <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-b-yellow-600 border-l-yellow-600 rounded-full animate-spin animation-delay-150"></div>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
              Cargando Artículo...
            </h2>
          </div>
        </div>
      </div>
    );
  }

  if (error || !blog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900">
        {/* Header de navegación destacado */}
        <div className="sticky top-0 z-50 bg-black shadow-lg shadow-amber-400/10">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
                GOZA MADRID
              </Link>
              <Link href="/blog" className="text-amber-400 hover:text-yellow-500 transition-colors flex items-center">
                <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
                Volver al Blog
              </Link>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center h-[calc(100vh-72px)]">
          <div className="text-center text-white">
            <h1 className="text-4xl font-bold mb-4">Artículo no encontrado</h1>
            <p className="text-gray-400 mb-8">El artículo que buscas no existe o ha sido movido.</p>
            <Link href="/blog" className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-6 py-3 rounded-lg font-bold hover:from-yellow-500 hover:to-amber-500 transition-all">
              Volver al Blog
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const title = blog.title || 'Sin título';
  const content = blog.content || '<p>Sin contenido</p>';
  const author = blog.author || 'Equipo Goza Madrid';
  const date = blog.date || new Date().toISOString();
  const excerpt = blog.excerpt || '';
  const readTime = blog.readTime || '5 min lectura';
  const category = blog.category || 'General';
  const tags = blog.tags || [];

  return (
    <>
      <Head>
        <title>{title} | Goza Madrid</title>
        <meta name="description" content={excerpt} />
        <meta property="og:title" content={title} />
        <meta property="og:description" content={excerpt} />
        <meta property="og:type" content="article" />
        <meta name="keywords" content={tags.join(', ')} />
      </Head>

      {/* Navigation - Fixed positioning */}
      <nav className="fixed top-0 left-0 right-0 bg-black/95 backdrop-blur-sm border-b border-amber-400/20 z-[9999]">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="text-2xl font-bold bg-gradient-to-r from-amber-400 to-yellow-600 bg-clip-text text-transparent">
              GOZA MADRID
            </Link>
            <Link href="/blog" className="text-amber-400 hover:text-yellow-500 transition-colors flex items-center">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
              </svg>
              Volver al Blog
            </Link>
          </div>
        </div>
      </nav>

             {/* Content with top padding to account for fixed nav */}
       <div className="min-h-screen bg-gradient-to-br from-black via-blue-950/90 via-slate-800/70 to-amber-950/20 pt-11">
        {/* Hero Image */}
        <div className="relative h-[350px] md:h-[450px] overflow-hidden mt-8">
          <img
            src={blog.image.src}
            alt={blog.image.alt}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent"></div>
          
          {/* Article Header */}
          <div className="absolute bottom-0 left-0 right-0 p-8">
            <div className="container mx-auto">
              <div className="max-w-4xl">
                <span className="inline-block bg-gradient-to-r from-amber-400/20 to-yellow-600/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium border border-amber-400/30 mb-4">
                  {category}
                </span>
                
                <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
                  {title}
                </h1>
                
                <p className="text-xl text-gray-300 mb-6 leading-relaxed">
                  {excerpt}
                </p>
                
                <div className="flex items-center space-x-6 text-sm text-gray-400">
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                    </svg>
                    {author}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                    </svg>
                    {new Date(date).toLocaleDateString('es-ES')}
                  </div>
                  <div className="flex items-center">
                    <svg className="w-5 h-5 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {readTime}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Article Content */}
        <div className="container mx-auto px-6 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="bg-black/30 backdrop-blur-sm rounded-2xl p-8 md:p-12 border border-amber-400/20">
              <div 
                className="prose prose-lg prose-invert max-w-none"
                dangerouslySetInnerHTML={{ __html: content }}
              />
            </div>

            {/* Tags */}
            {tags && tags.length > 0 && (
              <div className="mt-12">
                <h3 className="text-xl font-bold text-white mb-4">Etiquetas</h3>
                <div className="flex flex-wrap gap-3">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="bg-gradient-to-r from-amber-400/20 to-yellow-600/20 text-amber-400 px-4 py-2 rounded-full text-sm font-medium border border-amber-400/30"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Related Articles */}
            {relatedBlogs.length > 0 && (
              <div className="mt-20">
                <h3 className="text-3xl font-bold text-white mb-8 text-center">
                  Artículos Relacionados
                </h3>
                <div className="grid md:grid-cols-3 gap-8">
                  {relatedBlogs.map((relatedBlog) => (
                    <Link key={relatedBlog._id} href={`/blog/${relatedBlog._id}`}>
                      <div className="group cursor-pointer">
                        <div className="relative overflow-hidden rounded-xl bg-gradient-to-r from-amber-400/20 to-yellow-600/20 p-0.5">
                          <div className="bg-black rounded-xl overflow-hidden">
                            <div className="relative h-48 overflow-hidden">
                              <img
                                src={relatedBlog.image.src}
                                alt={relatedBlog.image.alt}
                                className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                            </div>
                            <div className="p-6">
                              <h4 className="text-lg font-bold text-white mb-2 group-hover:text-amber-400 transition-colors line-clamp-2">
                                {relatedBlog.title}
                              </h4>
                              <p className="text-gray-400 text-sm line-clamp-3">
                                {relatedBlog.excerpt}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        .luxury-blog-content {
          color: #e5e7eb;
          line-height: 1.8;
        }
        
        .luxury-blog-content h2 {
          color: #fbbf24;
          font-size: 2rem;
          font-weight: bold;
          margin: 2rem 0 1rem 0;
          background: linear-gradient(to right, #fbbf24, #f59e0b);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .luxury-blog-content h3 {
          color: #fcd34d;
          font-size: 1.5rem;
          font-weight: 600;
          margin: 1.5rem 0 0.75rem 0;
        }
        
        .luxury-blog-content h4 {
          color: #fed7aa;
          font-size: 1.25rem;
          font-weight: 600;
          margin: 1rem 0 0.5rem 0;
        }
        
        .luxury-blog-content p {
          margin-bottom: 1rem;
        }
        
        .luxury-blog-content .lead {
          font-size: 1.25rem;
          color: #d1d5db;
          font-weight: 300;
          margin-bottom: 2rem;
          padding: 1rem;
          border-left: 4px solid #fbbf24;
          background: rgba(251, 191, 36, 0.1);
          border-radius: 0 8px 8px 0;
        }
        
        .luxury-blog-content .highlight-box {
          background: linear-gradient(135deg, rgba(251, 191, 36, 0.1), rgba(245, 158, 11, 0.1));
          border: 1px solid rgba(251, 191, 36, 0.3);
          border-radius: 12px;
          padding: 1.5rem;
          margin: 2rem 0;
        }
        
        .luxury-blog-content .price-table table {
          width: 100%;
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .luxury-blog-content .price-table td {
          padding: 0.75rem;
          border-bottom: 1px solid rgba(251, 191, 36, 0.2);
          color: #e5e7eb;
        }
        
        .luxury-blog-content .price-table td:first-child {
          font-weight: 600;
          color: #fbbf24;
        }
        
        .luxury-blog-content ul {
          list-style: none;
          padding-left: 0;
        }
        
        .luxury-blog-content li {
          padding: 0.5rem 0;
          position: relative;
          padding-left: 1.5rem;
        }
        
        .luxury-blog-content li:before {
          content: "→";
          color: #fbbf24;
          font-weight: bold;
          position: absolute;
          left: 0;
        }
        
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .line-clamp-3 {
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        
        .animation-delay-150 {
          animation-delay: 150ms;
        }
      `}</style>
    </>
  );
};

// Componente FloatingValoradorButton inteligente que reacciona al menú
function SmartFloatingValoradorButton() {
  const { menuVisible } = useNavbar();
  const [isHovered, setIsHovered] = useState(false);
  const [isPulsing, setIsPulsing] = useState(true);

  // Efecto de pulsación sutil cada 5 segundos para llamar la atención
  useEffect(() => {
    const interval = setInterval(() => {
      setIsPulsing(true);
      setTimeout(() => setIsPulsing(false), 2000);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // Posición dinámica basada en el estado del menú
  const getPosition = () => {
    if (menuVisible) {
      return {
        right: 'calc(100vw - 80px)', // Se mueve fuera del menú
        bottom: '32px',
        transform: 'translateX(-100%)'
      };
    }
    return {
      right: '32px',
      bottom: '32px',
      transform: 'translateX(0)'
    };
  };

  const position = getPosition();

  return (
    <>
      {/* Aura de resplandor ambiental */}
      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ 
          opacity: isPulsing ? [0, 0.6, 0] : 0, 
          scale: isPulsing ? [0.8, 1.4, 0.8] : 0.8 
        }}
        transition={{ 
          duration: 2,
          ease: "easeInOut",
          repeat: isPulsing ? 2 : 0
        }}
        className="fixed z-40 pointer-events-none transition-all duration-300 ease-in-out"
        style={{
          right: position.right,
          bottom: position.bottom,
          transform: position.transform
        }}
      >
        <div className="w-32 h-32 rounded-full bg-gradient-radial from-yellow-400/30 via-amber-500/20 to-transparent blur-xl"></div>
      </motion.div>

      {/* Botón principal ultra-premium */}
      <motion.div
        initial={{ opacity: 0, scale: 0.3, y: 100 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ 
          duration: 1.2, 
          delay: 2.5,
          type: "spring",
          stiffness: 200,
          damping: 20
        }}
        className="fixed z-50 transition-all duration-300 ease-in-out"
        style={{
          right: position.right,
          bottom: position.bottom,
          transform: position.transform
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          animate={{ 
            y: isPulsing ? [0, -8, 0] : 0,
            scale: isHovered ? 1.05 : 1
          }}
          transition={{ 
            duration: 0.3,
            ease: "easeOut"
          }}
          className="relative group"
        >
          {/* Marco exterior dorado con brillo */}
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-amber-500 to-yellow-600 rounded-full blur-sm opacity-75 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          {/* Botón base con gradientes complejos */}
          <motion.a
            href="https://valuation.lystos.com?clientId=cd55b10c-5ba6-4f65-854e-5c8adaf88a34"
            target="_blank"
            rel="noopener noreferrer"
            className="relative flex items-center gap-3 px-6 py-4 rounded-full overflow-hidden shadow-2xl transform transition-all duration-500 group"
            style={{
              background: `linear-gradient(135deg, 
                #FFD700 0%, 
                #FFA500 15%,
                #FFD700 30%, 
                #B8860B 45%,
                #DAA520 60%,
                #FFD700 75%,
                #FFA500 90%,
                #FFD700 100%)`,
              boxShadow: `
                0 25px 50px -12px rgba(255, 215, 0, 0.5),
                0 0 30px rgba(255, 215, 0, 0.3),
                inset 0 1px 0 rgba(255, 255, 255, 0.4),
                inset 0 -1px 0 rgba(0, 0, 0, 0.2)
              `
            }}
            whileHover={{
              boxShadow: `
                0 35px 70px -12px rgba(255, 215, 0, 0.6),
                0 0 50px rgba(255, 215, 0, 0.4),
                inset 0 1px 0 rgba(255, 255, 255, 0.6),
                inset 0 -1px 0 rgba(0, 0, 0, 0.1)
              `
            }}
            whileTap={{ scale: 0.98 }}
            aria-label="Obtener valoración gratuita de propiedad de lujo"
            title="Valoración profesional gratuita"
          >
            {/* Contenido del botón */}
            <div className="relative z-10 flex items-center gap-2">
              {/* Icono premium */}
              <motion.div
                animate={{ 
                  rotate: isHovered ? 360 : 0,
                  scale: isHovered ? 1.1 : 1
                }}
                transition={{ 
                  duration: 0.8,
                  ease: "easeInOut"
                }}
                className="relative"
              >
                <div className="relative bg-black/10 p-2 rounded-full backdrop-blur-sm">
                  <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              </motion.div>

              {/* Texto */}
              <span className="font-serif text-white font-bold text-sm tracking-wide drop-shadow-lg">
                Valorar
              </span>
            </div>
          </motion.a>
        </motion.div>
      </motion.div>
    </>
  );
}

// Función getLayout personalizada que incluye footer pero no header
BlogDetail.getLayout = function getLayout(page) {
  return (
    <div className="flex flex-col min-h-screen bg-transparent">
      <main className="flex-grow" role="main" id="main-content">
        {page}
      </main>
      
      <footer className="relative z-40">
        <Footer3 />
      </footer>
      
      <CookieConsent />
      
      {/* Botón flotante del valorador con reacción al menú */}
      <FloatingValoradorButtonWrapper />
    </div>
  );
};

export default BlogDetail;

