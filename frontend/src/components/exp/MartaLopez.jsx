"use client";
import React from 'react';
import Image from "next/legacy/image";
import Head from 'next/head';

export default function MartaLopez() {
    return (
        <>
            <Head>
                <title>Marta López - Fundadora de Goza Madrid | Agente Inmobiliario de Éxito</title>
                
                {/* Meta tags básicos */}
                <meta 
                    name="description" 
                    content="Marta López, fundadora de Goza Madrid, es una agente inmobiliaria de éxito con más de 15 años de experiencia. Líder en el sector inmobiliario de Madrid, especializada en ventas premium y asesoramiento personalizado."
                />
                <meta 
                    name="keywords" 
                    content="Marta López, Goza Madrid, agente inmobiliario Madrid, fundadora Goza Madrid, inmobiliaria de éxito, ventas premium Madrid"
                />

                {/* Open Graph / Facebook */}
                <meta property="og:type" content="website" />
                <meta property="og:url" content="https://realestategozamadrid.com/exp" />
                <meta property="og:title" content="Marta López - Fundadora de Goza Madrid | La Inmobiliaria Digital" />
                <meta property="og:description" content="Descubre la revolución inmobiliaria con Marta López, fundadora de Goza Madrid. Más de 15 años de experiencia en el sector inmobiliario premium de Madrid." />
                <meta property="og:image" content="https://realestategozamadrid.com/logo-social.png" />
                <meta property="og:image:width" content="1200" />
                <meta property="og:image:height" content="630" />
                <meta property="og:image:alt" content="Logo de Goza Madrid eXp Realty" />
                <meta property="og:locale" content="es_ES" />
                <meta property="og:site_name" content="Goza Madrid eXp" />
                <meta property="fb:app_id" content="966242223397117" />
                <meta property="article:publisher" content="https://www.facebook.com/GozaMadrid" />

                {/* Twitter */}
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:url" content="https://realestategozamadrid.com/exp" />
                <meta name="twitter:title" content="Marta López - Fundadora de Goza Madrid | La Inmobiliaria Digital" />
                <meta name="twitter:description" content="Descubre la revolución inmobiliaria con Marta López, fundadora de Goza Madrid. Más de 15 años de experiencia en el sector inmobiliario premium de Madrid." />
                <meta name="twitter:image" content="https://realestategozamadrid.com/logo-social.png" />

                {/* LinkedIn */}
                <meta property="linkedin:card" content="summary_large_image" />
                <meta property="linkedin:title" content="Marta López - Fundadora de Goza Madrid | La Inmobiliaria Digital" />
                <meta property="linkedin:description" content="Descubre la revolución inmobiliaria con Marta López, fundadora de Goza Madrid. Más de 15 años de experiencia en el sector inmobiliario premium de Madrid." />
                <meta property="linkedin:image" content="https://realestategozamadrid.com/logo-social.png" />

                {/* WhatsApp */}
                <meta property="og:image:alt" content="Logo de Goza Madrid eXp" />
                <meta property="og:image:type" content="image/png" />

                {/* Favicon y Apple Touch Icon */}
                <link rel="icon" type="image/png" href="/favicon.png" />
                <link rel="apple-touch-icon" href="/apple-touch-icon.png" />

                <script 
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{
                        __html: JSON.stringify({
                            "@context": "https://schema.org",
                            "@type": "Person",
                            "name": "Marta López",
                            "jobTitle": "Fundadora y CEO de Goza Madrid",
                            "description": "Fundadora y líder de Goza Madrid, una de las agencias inmobiliarias más prestigiosas de Madrid",
                            "url": "https://realestategozamadrid.com/exp",
                            "image": "https://realestategozamadrid.com/logo-social.png",
                            "sameAs": [
                                "https://www.youtube.com/watch?v=tVSUtafYU8M"
                            ],
                            "worksFor": {
                                "@type": "Organization",
                                "name": "Goza Madrid",
                                "url": "https://realestategozamadrid.com",
                                "logo": "https://realestategozamadrid.com/logo-social.png"
                            }
                        })
                    }}
                />
            </Head>

            <section className="relative w-full min-h-screen bg-gradient-to-br from-blue-950/10 via-blue-900/15 to-blue-800/10 z-10">
                {/* Efectos de fondo */}
                <div className="absolute inset-0 overflow-hidden">
                    {/* Efectos de luz suaves */}
                    <div className="absolute top-0 left-0 w-full h-1/2 bg-blue-500/5 blur-[200px] animate-pulse"></div>
                    <div className="absolute bottom-0 right-0 w-full h-1/2 bg-indigo-500/5 blur-[200px] animate-pulse delay-700"></div>
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-2/3 bg-purple-500/5 blur-[250px] animate-pulse delay-500"></div>
                    
                    {/* Capas de gradiente suaves */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-black/10 to-transparent"></div>
                    <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/20"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-900/5 via-transparent to-blue-900/5"></div>
                    
                    {/* Capa superior extra suave */}
                    <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-blue-950/15 via-blue-900/10 to-transparent"></div>
                    
                    {/* Velo general muy sutil */}
                    <div className="absolute inset-0 bg-blue-950/5 mix-blend-overlay"></div>
                </div>

                {/* Contenido principal */}
                <div className="relative container mx-auto px-4 py-16 lg:py-24 z-20">
                    {/* Título principal con efecto de gradiente */}
                    <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-white to-blue-400 relative z-30">
                        La <span className="bg-gradient-to-r from-amarillo via-white to-amarillo text-transparent bg-clip-text">Inmobiliaria Digital</span> Nº1 en el Mundo
                    </h1>

                    {/* Grid principal */}
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-30">
                        {/* Columna izquierda - Foto */}
                        <div className="lg:col-span-3 flex flex-col items-center">
                            <div className="relative w-64 h-64 lg:w-full lg:h-auto aspect-square rounded-2xl overflow-hidden shadow-2xl transform hover:scale-105 transition-transform duration-500">
                                <Image
                                    src="/formFoto.jpeg"
                                    alt="Marta López - Experta Inmobiliaria"
                                    fill
                                    className="object-cover"
                                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                                    priority
                                />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                <div className="absolute bottom-0 left-0 right-0 p-4 text-white text-center">
                                    <h3 className="text-lg font-semibold">Marta López</h3>
                                    <p className="text-sm text-blue-200">Experta Inmobiliaria</p>
                                </div>
                            </div>
                        </div>

                        {/* Columna central - Video */}
                        <div className="lg:col-span-6">
                            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl">
                                <iframe
                                    src="https://www.youtube.com/embed/tVSUtafYU8M"
                                    title="Únete a la revolución inmobiliaria"
                                    className="absolute inset-0 w-full h-full rounded-2xl"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                ></iframe>
                            </div>
                        </div>

                        {/* Columna derecha - Información */}
                        <div className="lg:col-span-3 space-y-6">
                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-colors duration-300">
                                <h2 className="text-2xl font-bold text-blue-300 mb-4">Su Visión</h2>
                                <p className="text-white/90 leading-relaxed">
                                    "Creemos en un <span className="font-semibold text-amarillo">servicio inmobiliario</span> que va más allá de la simple transacción. 
                                    Nuestro objetivo es crear <span className="font-semibold text-blue-300">experiencias memorables</span> y <span className="font-semibold text-blue-300">relaciones duraderas</span> con 
                                    nuestros clientes."
                                </p>
                            </div>

                            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-6 shadow-xl hover:bg-white/15 transition-colors duration-300">
                                <h2 className="text-2xl font-bold text-blue-300 mb-4">Su Impacto</h2>
                                <ul className="space-y-3 text-white/90">
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-300 mt-1">•</span>
                                        <span><span className="font-semibold text-amarillo">Líder</span> en ventas premium en Madrid</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-300 mt-1">•</span>
                                        <span><span className="font-semibold text-amarillo">Pionera</span> en la <span className="font-semibold text-blue-300">digitalización</span> del sector</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-300 mt-1">•</span>
                                        <span><span className="font-semibold text-amarillo">Mentora</span> de nuevos agentes inmobiliarios</span>
                                    </li>
                                    <li className="flex items-start gap-2">
                                        <span className="text-blue-300 mt-1">•</span>
                                        <span>Comprometida con la <span className="font-semibold text-blue-300">excelencia</span> e <span className="font-semibold text-blue-300">innovación</span></span>
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>

                    {/* Sección de experiencia */}
                    <div className="mt-16 bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-xl relative z-30">
                        <p className="text-white/90 text-lg leading-relaxed text-center max-w-4xl mx-auto">
                            Con más de <span className="font-semibold text-amarillo">15 años de experiencia</span> en el sector, Marta ha construido una 
                            reputación sólida basada en la <span className="font-semibold text-blue-300">transparencia</span>, la <span className="font-semibold text-blue-300">profesionalidad</span> y <span className="font-semibold text-blue-300">resultados excepcionales</span>. 
                            Su compromiso con la excelencia y la innovación la ha convertido en una <span className="font-semibold text-amarillo">referente</span> en el sector inmobiliario de Madrid.
                        </p>
                    </div>
                </div>
            </section>
        </>
    );
} 