"use client";

import Link from "next/link";
import React, { useEffect, useState } from "react";
import AnimatedOnScroll from "../AnimatedScroll";
import Head from 'next/head';

// Helper functions simplificadas
const stripHtml = (htmlString) => {
  if (!htmlString) return '';
  try {
    return htmlString.replace(/<[^>]*>?/gm, '');
  } catch (error) {
    return String(htmlString);
  }
};

const truncateText = (text, length = 150) => {
  if (!text) return 'Visita nuestro blog para leer este artículo completo.';
  
  const cleanText = typeof text === 'string' ? stripHtml(text) : String(text);
  
  if (cleanText.length <= length) return cleanText;
  
  return cleanText.substring(0, length).trim() + '...';
};

export default function BlogPage() {
    const [blogs, setBlogs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);
    const [hoveredCard, setHoveredCard] = useState(null);
    
    // Blogs de muestra con contenido SEO completo
    const sampleBlogs = [
        {
            _id: 'sample1',
            title: 'Viviendas de Lujo en Madrid: Las Mejores Zonas para Invertir en 2024',
            excerpt: 'Descubre las mejores zonas para invertir en viviendas de lujo en Madrid en 2024, con análisis detallado de precios y tendencias del mercado.',
            description: 'Madrid se consolida como uno de los mercados de vivienda de lujo más atractivos de Europa. Conoce las zonas más exclusivas y las mejores oportunidades de inversión.',
            date: '2024-01-15',
            dateFormatted: '15 de enero de 2024',
            author: 'Equipo Goza Madrid',
            readTime: '8 min lectura',
            category: 'Inversión Inmobiliaria',
            tags: ['vivienda lujo Madrid', 'inversión inmobiliaria', 'Salamanca', 'Chamberí'],
            image: {
                src: 'https://images.unsplash.com/photo-1464207687429-7505649dae38?w=800&h=600&fit=crop&q=80',
                alt: 'Viviendas de lujo en Madrid'
            },
            featured: true
        },
        {
            _id: 'sample2',
            title: 'Comprar Casa de Lujo Madrid: Mercado Inmobiliario Premium 2024',
            excerpt: 'Guía completa para comprar casas de lujo en Madrid: mercado actual, precios, zonas premium y proceso de compra especializado.',
            description: 'El sector de casas de lujo Madrid experimenta un crecimiento excepcional. Conoce el proceso especializado para adquirir propiedades premium.',
            date: '2024-01-20',
            dateFormatted: '20 de enero de 2024',
            author: 'Equipo Goza Madrid',
            readTime: '10 min lectura',
            category: 'Compra de Lujo',
            tags: ['casas de lujo Madrid', 'comprar propiedad premium', 'mercado inmobiliario'],
            image: {
                src: 'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&h=600&fit=crop&q=80',
                alt: 'Casa de lujo en Madrid'
            }
        },
        {
            _id: 'sample3',
            title: 'Apartamentos de Lujo Madrid: Guía para Elegir el Barrio Perfecto',
            excerpt: 'Guía completa para elegir el barrio perfecto para tu apartamento de lujo en Madrid, con análisis de las mejores zonas y rentabilidad.',
            description: 'Seleccionar el barrio ideal para tu apartamento de lujo Madrid es una decisión crucial. Cada zona ofrece características únicas para diferentes perfiles.',
            date: '2024-01-25',
            dateFormatted: '25 de enero de 2024',
            author: 'Expertos Goza Madrid',
            readTime: '12 min lectura',
            category: 'Guías de Barrios',
            tags: ['apartamentos de lujo Madrid', 'mejores barrios Madrid', 'inversión inmobiliaria'],
            image: {
                src: 'https://images.unsplash.com/photo-1460317442991-0ec209397118?w=800&h=600&fit=crop&q=80',
                alt: 'Apartamentos de lujo en Madrid'
            }
        },
        {
            _id: 'sample4',
            title: 'Diseño Interior Lujo Madrid: Tendencias Premium 2024',
            excerpt: 'Descubre las 10 tendencias más exclusivas en diseño interior para viviendas de lujo en Madrid: minimalismo maximalista, tecnología invisible y sostenibilidad premium.',
            description: 'El diseño interior de viviendas de lujo Madrid evoluciona hacia conceptos que combinan elegancia atemporal con innovación tecnológica.',
            date: '2024-01-30',
            dateFormatted: '30 de enero de 2024',
            author: 'Diseñadores Goza Madrid',
            readTime: '13 min lectura',
            category: 'Diseño Interior',
            tags: ['diseño interior lujo', 'tendencias 2024', 'viviendas de lujo Madrid'],
            image: {
                src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
                alt: 'Diseño interior de lujo en Madrid'
            }
        }
    ];
    
    // Schema.org structured data for the blog listing
    const blogListingSchema = {
      "@context": "https://schema.org",
      "@type": "Blog",
      "name": "Blog de Goza Madrid",
      "description": "Artículos y noticias sobre el sector inmobiliario, inversión y estilo de vida en Madrid",
      "url": typeof window !== 'undefined' ? window.location.origin + '/blog' : 'https://www.realestategozamadrid.com/blog',
      "publisher": {
        "@type": "Organization",
        "name": "Goza Madrid",
        "logo": {
          "@type": "ImageObject",
          "url": typeof window !== 'undefined' ? window.location.origin + '/logo.png' : 'https://www.realestategozamadrid.com/logo.png'
        }
      },
      "blogPosts": blogs.map(blog => ({
        "@type": "BlogPosting",
        "headline": blog.title,
        "description": blog.description,
        "datePublished": blog.date,
        "author": {
          "@type": "Person",
          "name": blog.author
        },
        "image": blog.image?.src,
        "url": typeof window !== 'undefined' 
          ? `${window.location.origin}/blog/${blog._id}`
          : `https://www.realestategozamadrid.com/blog/${blog._id}`
      }))
    };

    // Component mount effect
    useEffect(() => {
        setIsClient(true);
    }, []);

    // Load sample blogs
    useEffect(() => {
        setLoading(true);
        setTimeout(() => {
            setBlogs(sampleBlogs);
            setLoading(false);
        }, 500);
    }, []);

    const handleReadMore = (blog) => {
        if (typeof window !== 'undefined') {
            window.location.href = `/blog/${blog._id}`;
        }
    };

    const featuredBlog = blogs.find(blog => blog.featured) || blogs[0];
    const regularBlogs = blogs.filter(blog => !blog.featured);

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="relative">
                        <div className="w-20 h-20 border-4 border-transparent border-t-amber-400 border-r-amber-400 rounded-full animate-spin mb-6"></div>
                        <div className="absolute inset-0 w-20 h-20 border-4 border-transparent border-b-yellow-600 border-l-yellow-600 rounded-full animate-spin animation-delay-150"></div>
                    </div>
                    <h2 className="text-2xl font-bold bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                        Cargando Artículos Exclusivos...
                    </h2>
                    <p className="text-gray-300 mt-2">Preparando el contenido premium</p>
                </div>
            </div>
        );
    }

    return (
        <>
            <Head>
                <title>Blog - Goza Madrid | Propiedades de Lujo y Mercado Inmobiliario</title>
                <meta name="description" content="Descubre las últimas tendencias del mercado inmobiliario de lujo en Madrid. Guías, análisis y consejos para inversores y compradores de propiedades premium." />
                <meta name="keywords" content="blog inmobiliario Madrid, propiedades de lujo, inversión inmobiliaria, apartamentos de lujo Madrid, casas de lujo Madrid" />
                <meta property="og:title" content="Blog - Goza Madrid | Propiedades de Lujo" />
                <meta property="og:description" content="Artículos especializados sobre el mercado inmobiliario de lujo en Madrid" />
                <meta property="og:type" content="website" />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(blogListingSchema) }}
                />
            </Head>

            <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-amber-900">
                <div className="relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-amber-400/10 via-yellow-500/5 to-amber-600/10"></div>
                    
                    <div className="relative container mx-auto px-6 py-20">
                        <AnimatedOnScroll>
                            <div className="text-center mb-16">
                                <div className="flex items-center justify-center mb-6">
                                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1 max-w-xs"></div>
                                    <div className="mx-6">
                                        <svg className="w-8 h-8 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div className="h-px bg-gradient-to-r from-transparent via-amber-400 to-transparent flex-1 max-w-xs"></div>
                                </div>
                                
                                <h1 className="text-5xl md:text-7xl font-bold mb-8">
                                    <span className="bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 bg-clip-text text-transparent">
                                        GOZA MADRID
                                    </span>
                                    <br />
                                    <span className="text-white text-3xl md:text-4xl font-light tracking-wider">
                                        LUXURY INSIGHTS
                                    </span>
                                </h1>
                                
                                <p className="text-xl md:text-2xl text-black max-w-4xl mx-auto leading-relaxed font-light">
                                    Artículos exclusivos sobre el mercado inmobiliario de lujo en Madrid. 
                                    <span className="text-black font-medium"> Análisis experto</span>, 
                                    <span className="text-black font-medium"> guías de inversión</span> y 
                                    <span className="text-black font-medium"> tendencias premium</span>.
                                </p>
                                
                                <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-black">
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                                        Contenido Exclusivo
                                    </span>
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-2"></div>
                                        Análisis Profesional
                                    </span>
                                    <span className="flex items-center">
                                        <div className="w-2 h-2 bg-amber-600 rounded-full mr-2"></div>
                                        Mercado Premium
                                    </span>
                                </div>
                            </div>
                        </AnimatedOnScroll>

                        {featuredBlog && (
                            <AnimatedOnScroll delay={0.2}>
                                <div className="mb-20">
                                    <div className="relative group cursor-pointer" onClick={() => handleReadMore(featuredBlog)}>
                                        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-amber-400/20 to-yellow-600/20 p-1">
                                            <div className="bg-black rounded-xl overflow-hidden">
                                                <div className="grid md:grid-cols-2 gap-0">
                                                    <div className="relative h-64 md:h-96 overflow-hidden">
                                                        <img
                                                            src={featuredBlog.image.src}
                                                            alt={featuredBlog.image.alt}
                                                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                        />
                                                        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent md:hidden"></div>
                                                        <div className="absolute top-6 left-6">
                                                            <span className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-4 py-2 rounded-full text-sm font-bold uppercase tracking-wider">
                                                                ⭐ Destacado
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="p-8 md:p-12 flex flex-col justify-center">
                                                        <div className="mb-4">
                                                            <span className="inline-block bg-gradient-to-r from-amber-400/20 to-yellow-600/20 text-amber-400 px-3 py-1 rounded-full text-sm font-medium border border-amber-400/30">
                                                                {featuredBlog.category}
                                                            </span>
                                                        </div>
                                                        
                                                        <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 leading-tight group-hover:text-amber-400 transition-colors duration-300">
                                                            {featuredBlog.title}
                                                        </h2>
                                                        
                                                        <p className="text-gray-300 text-lg mb-6 leading-relaxed">
                                                            {featuredBlog.description}
                                                        </p>
                                                        
                                                        <div className="flex items-center justify-between text-sm text-gray-400 mb-6">
                                                            <div className="flex items-center space-x-4">
                                                                <span className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                                    </svg>
                                                                    {featuredBlog.author}
                                                                </span>
                                                                <span className="flex items-center">
                                                                    <svg className="w-4 h-4 mr-2 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                    </svg>
                                                                    {featuredBlog.readTime}
                                                                </span>
                                                            </div>
                                                            <span className="text-amber-400">{featuredBlog.dateFormatted}</span>
                                                        </div>
                                                        
                                                        <button className="bg-gradient-to-r from-amber-400 to-yellow-600 text-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 hover:from-yellow-500 hover:to-amber-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-400/25">
                                                            <span className="flex items-center justify-center">
                                                                Leer Artículo Completo
                                                                <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                                </svg>
                                                            </span>
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </AnimatedOnScroll>
                        )}

                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                            {regularBlogs.map((blog, index) => (
                                <AnimatedOnScroll key={blog._id} delay={index * 0.1}>
                                    <article 
                                        className="group cursor-pointer"
                                        onClick={() => handleReadMore(blog)}
                                        onMouseEnter={() => setHoveredCard(blog._id)}
                                        onMouseLeave={() => setHoveredCard(null)}
                                    >
                                        <div className={`relative overflow-hidden rounded-2xl transition-all duration-500 ${
                                            hoveredCard === blog._id 
                                                ? 'transform scale-105 shadow-2xl shadow-amber-400/20' 
                                                : 'shadow-xl shadow-black/50'
                                        }`}>
                                            <div className="absolute inset-0 bg-gradient-to-r from-amber-400 via-yellow-500 to-amber-600 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                            <div className="relative bg-black m-0.5 rounded-2xl overflow-hidden">
                                                
                                                <div className="relative h-48 overflow-hidden">
                                                    <img
                                                        src={blog.image.src}
                                                        alt={blog.image.alt}
                                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                                    />
                                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                                                    
                                                    <div className="absolute top-4 left-4">
                                                        <span className="bg-black/80 backdrop-blur-sm text-amber-400 px-3 py-1 rounded-full text-xs font-medium border border-amber-400/30">
                                                            {blog.category}
                                                        </span>
                                                    </div>
                                                    
                                                    <div className="absolute inset-0 bg-gradient-to-t from-amber-400/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                </div>
                                                
                                                <div className="p-6">
                                                    <h3 className="text-xl font-bold text-white mb-3 leading-tight group-hover:text-amber-400 transition-colors duration-300 line-clamp-2">
                                                        {blog.title}
                                                    </h3>
                                                    
                                                    <p className="text-gray-400 mb-4 line-clamp-3 leading-relaxed">
                                                        {blog.description || truncateText(blog.excerpt, 120)}
                                                    </p>
                                                    
                                                    {blog.tags && blog.tags.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-4">
                                                            {blog.tags.slice(0, 2).map((tag, tagIndex) => (
                                                                <span 
                                                                    key={tagIndex}
                                                                    className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs border border-gray-700"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    
                                                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                                                        <div className="flex items-center space-x-3">
                                                            <span className="flex items-center">
                                                                <div className="w-2 h-2 bg-amber-400 rounded-full mr-2"></div>
                                                                {blog.author}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <svg className="w-3 h-3 mr-1 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                                                                </svg>
                                                                {blog.readTime}
                                                            </span>
                                                        </div>
                                                        <span className="text-amber-400 text-xs">{blog.dateFormatted}</span>
                                                    </div>
                                                    
                                                    <button className="w-full bg-gradient-to-r from-gray-800 to-gray-700 hover:from-amber-400 hover:to-yellow-600 text-white hover:text-black py-3 px-4 rounded-lg font-medium transition-all duration-300 group-hover:shadow-lg border border-gray-700 hover:border-amber-400">
                                                        <span className="flex items-center justify-center">
                                                            Leer más
                                                            <svg className="w-4 h-4 ml-2 transition-transform duration-300 group-hover:translate-x-1" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                                                            </svg>
                                                        </span>
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </article>
                                </AnimatedOnScroll>
                            ))}
                        </div>

                        
                    </div>
                </div>
            </div>

            <style jsx>{`
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
}