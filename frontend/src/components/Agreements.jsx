import AnimatedOnScroll from "./AnimatedScroll";
import Head from 'next/head';
import Image from 'next/image';

export default function Agreements() {
    const partners = [
        {
            name: "eXp Realty",
            logo: "/exprealty.png",
            description: "eXp Realty es una innovadora inmobiliaria internacional que revoluciona el sector inmobiliario. Como parte de esta red global, ofrecemos servicios integrales de compra, venta y alquiler de propiedades, respaldados por tecnología de vanguardia y un equipo de más de 89.000 agentes en todo el mundo. Nuestra plataforma virtual única permite brindar un servicio personalizado y eficiente, garantizando las mejores oportunidades inmobiliarias para nuestros clientes.",
            alt: "Logo de eXp Realty - Inmobiliaria Internacional"
        },
        {
            name: "Advancing",
            logo: "/advan.png",
            description: "Somos la principal opción de garantía de renta para propietarios de viviendas en alquiler. Te ofrecemos tranquilidad absoluta en el alquiler de tu inmueble, ya que te garantizamos el pago de tu renta el día 6 de cada mes pase lo que pase. Realizamos la gestión de cobro, retrasos e impagos hasta el desahucio.",
            alt: "Logo de Advancing - Garantía de Alquiler"
        },
        {
            name: "Abarca",
            logo: "/abarca.png",
            description: "Empresa de gestoría especializada en ofrecer servicios integrales de administración tanto para empresas como para autónomos. Nos dedicamos a facilitar la gestión administrativa de tu negocio, brindando soluciones efectivas y personalizadas para satisfacer las necesidades específicas de cada cliente.",
            alt: "Logo de Abarca - Gestoría Integral"
        },
        {
            name: "Ares Capital",
            logo: "/arescapital.png",
            description: "El mercado de Inversión y el sector de locales comerciales es nuestra especialidad a nivel nacional con un enfoque adaptado a perfiles institucionales y privados. GozaMadrid va de la mano trabajando con Ares Capital desarrollando principalmente en dos líneas de negocio; dar servicio a Inversores, Family Office, Propietarios y Empresas en operaciones de compra-venta y representar a las firmas más exclusivas del sector Retail.",
            alt: "Logo de Ares Capital - Inversión Inmobiliaria"
        },
        {
            name: "Duplo",
            logo: "/duplo.png",
            description: "En nuestra empresa, nos esforzamos por facilitar la obtención de tu hipoteca, comprendiendo que este proceso puede generar nerviosismo y tensión. Por ello, nuestro enfoque principal es garantizar tu tranquilidad en todo momento. Valoramos la transparencia y la empatía en nuestra labor, buscando siempre brindarte un servicio humano y cercano.",
            alt: "Logo de Duplo - Servicios Hipotecarios"
        },
        {
            name: "Electry",
            logo: "/electry.png",
            description: "Ofrecemos una amplia gama de servicios diseñados para analizar detalladamente los consumos energéticos de nuestros clientes, negociar con proveedores de energía para obtener tarifas más competitivas, asesorar en la selección de tecnologías y soluciones energéticas eficientes, llevar a cabo la implementación de medidas de ahorro energético y el trámite de certificados energéticos.",
            alt: "Logo de Electry - Eficiencia Energética"
        },
        {
            name: "Mutua",
            logo: "/mutua.png",
            description: "Hemos establecido un acuerdo exclusivo para nuestros asociados, que les permite acceder a tarifas altamente competitivas para ofrecer servicios de gestión de impagos a los propietarios que alquilan sus viviendas.",
            alt: "Logo de Mutua - Servicios de Seguros"
        },
        {
            name: "Orden Nails",
            logo: "/ordennails.png",
            description: "Nuestro servicio de Organización Profesional ofrece una amplia gama de soluciones para mejorar la funcionalidad y el orden en tu hogar o lugar de trabajo. Desde la organización general hasta la planificación de rutinas familiares, pasando por la preparación de espacios específicos como la habitación del bebé o el trastero.",
            alt: "Logo de Orden Nails - Organización Profesional"
        },
        {
            name: "ReformaTek",
            logo: "/reformatek.png",
            description: "Nuestro equipo de expertos en arquitectura, diseño y construcción trabaja en estrecha colaboración con cada cliente para entender sus objetivos y convertir sus ideas en realidad. Ya sea una reforma completa de una vivienda, la renovación de un espacio comercial o la rehabilitación de un edificio histórico.",
            alt: "Logo de ReformaTek - Reformas y Construcción"
        },
        {
            name: "Suelos y Paredes",
            logo: "/suelosyparedes.png",
            description: "Nos especializamos en ofrecer soluciones integrales para la decoración y renovación de interiores. Desde suelos hasta paredes, contamos con una amplia gama de productos y servicios para satisfacer las necesidades de nuestros clientes.",
            alt: "Logo de Suelos y Paredes - Decoración Interior"
        },
        {
            name: "Coocun",
            logo: "/coocun.jpg",
            description: "¿Necesitas vender tu casa pero te preocupa la complejidad del proceso, especialmente si eres una persona de la tercera edad? Ofrecemos un servicio especializado de apoyo para la tercera edad, brindando asistencia y orientación en cada paso del proceso de venta.",
            alt: "Logo de Coocun - Servicios para la Tercera Edad"
        }
    ];

    return (
        <main 
            className="acuerdos-page w-full min-h-screen bg-white relative"
            itemScope 
            itemType="https://schema.org/Organization"
        >
            <Head>
                <title>Acuerdos y Convenios | Red de Colaboradores Inmobiliarios y Servicios</title>
                <meta 
                    name="description" 
                    content="Descubre nuestra red de colaboradores estratégicos en el sector inmobiliario. Servicios integrales desde hipotecas hasta reformas, garantías de alquiler y asesoramiento energético." 
                />
                <meta 
                    name="keywords" 
                    content="acuerdos inmobiliarios, convenios empresariales, servicios inmobiliarios, reformas Madrid, hipotecas, eficiencia energética, garantía alquiler" 
                />
                <meta property="og:title" content="Red de Colaboradores y Servicios Inmobiliarios" />
                <meta property="og:description" content="Alianzas estratégicas con las mejores empresas del sector inmobiliario y servicios relacionados." />
                <meta property="og:image" content="/acuerdosyconvenios.jpg" />
                <link rel="canonical" href="https://realestategozamadrid.com/acuerdos" />
            </Head>

            <AnimatedOnScroll>
                <div className="relative w-full min-h-screen pb-12 overflow-x-hidden">
                    {/* Fondo opaco */}
                    <div 
                        className="absolute inset-0 opacity-10"
                        style={{
                            background: `
                                repeating-linear-gradient(
                                    40deg,
                                    #ffffff,
                                    #ffffff 10px,
                                    #000000 50px,
                                    #C7A336 80px
                                )
                            `,
                            backgroundAttachment: "fixed"
                        }}
                        aria-hidden="true"
                    ></div>

                    {/* Hero section */}
                    <header 
                        className="relative h-[300px] sm:h-[40vh] flex flex-col bg-center bg-cover 
                            justify-center items-center text-center px-4"
                        style={{ 
                            backgroundImage: "url('/acuerdosyconvenios.jpg')",
                            backgroundSize: 'cover'
                        }}
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20"></div>

                        <h1 
                            className="relative text-3xl sm:text-4xl lg:text-6xl font-bold text-amarillo mb-4" 
                            style={{ textShadow: "2px 2px 5px gray" }}
                            itemProp="name"
                        >
                            Acuerdos y Convenios Estratégicos
                        </h1>
                    </header>

                    {/* Grid de contenido */}
                    <section 
                        className="relative grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12 p-4 sm:p-8 mt-8"
                        aria-label="Colaboradores y servicios"
                    >
                        {partners.map((partner, index) => (
                            <article 
                                key={index}
                                className="flex flex-col items-center bg-white/50 p-4 rounded-lg"
                                itemScope
                                itemType="https://schema.org/Organization"
                            >
                                <Image
                                    src={partner.logo}
                                    alt={partner.alt}
                                    width={200}
                                    height={200}
                                    className="w-[200px] sm:w-[20vw] h-[200px] sm:h-[25vh] object-contain"
                                    itemProp="logo"
                                />
                                <div 
                                    className="mt-4 text-center text-sm sm:text-base lg:text-lg"
                                    itemProp="description"
                                >
                                    {partner.description}
                                </div>
                            </article>
                        ))}
                    </section>
                </div>
            </AnimatedOnScroll>

            {/* Schema.org structured data */}
            <script type="application/ld+json" dangerouslySetInnerHTML={{
                __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "Organization",
                    "name": "GozaMadrid - Acuerdos y Convenios",
                    "description": "Red de colaboradores estratégicos en el sector inmobiliario y servicios relacionados",
                    "image": "/acuerdosyconvenios.jpg",
                    "member": partners.map(partner => ({
                        "@type": "Organization",
                        "name": partner.name,
                        "image": partner.logo,
                        "description": partner.description
                    })),
                    "areaServed": {
                        "@type": "City",
                        "name": "Madrid"
                    },
                    "knowsAbout": [
                        "Servicios inmobiliarios",
                        "Hipotecas",
                        "Reformas",
                        "Eficiencia energética",
                        "Garantía de alquiler",
                        "Gestión administrativa",
                        "Organización profesional"
                    ]
                })
            }} />
        </main>
    );
}
