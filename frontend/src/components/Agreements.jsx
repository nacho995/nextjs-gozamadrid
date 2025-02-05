export default function Agreements() {
    return (
        <div className="relative w-full min-h-[80vh] pb-[10vh] overflow-hidden">
            {/* Fondo opaco */}
            <div className="absolute inset-0 z-0 opacity-10"
                style={{
                    background: `
         repeating-linear-gradient(
           40deg,
           #ffffff,
           #ffffff 10vh,
           #000000 50vh,
           #C7A336  80vh
         )`
                }}>
            </div>




            <div className="relative z-10 h-[40vh] flex flex-col bg-fixed bg-center justify-center items-center text-center px-4"
                style={{ backgroundImage: "url('/acuerdosyconvenios.jpg')" }}>
                <div className="absolute inset-0 bg-gradient-to-r from-black/50 to-black/20 z-10"></div>

                <h2 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-amarillo mb-4 relative z-20" style={{ textShadow: "2px 2px 5px gray" }}>
                    Acuerdos y Convenios
                </h2>
            </div>

            {/* Contenido */}
            <div className="relative z-20 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 gap-y-[25vh] mt-[5%] p-4">
                <div className="flex flex-col items-center">
                    <img src="/exprealty.png" alt="eXp" className="w-[50vh] h-[25vh] object-cover" />
                    <p className="m-[8%] text-center">Descripción de la foto 1</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/advan.png" alt="advancing" className="w-[50vh] h-[25vh] object-cover" />
                    <p className="m-[8%] text-center">Somos la principal opción de garantía de renta para propietarios de viviendas en alquiler. Te ofrecemos tranquilidad absoluta en el alquiler de tu inmueble, ya que te garantizamos el pago de tu renta el día 6 de cada mes pase lo que pase. Realizamos la gestión de cobro, retrasos e impagos hasta el desahucio.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/abarca.png" alt="abarca" className="w-[50vh] h-[25vh] object-cover" />
                    <p className="m-[8%] text-center">Empresa de gestoría especializada en ofrecer servicios integrales de administración tanto para empresas como para autónomos. Nos dedicamos a facilitar la gestión administrativa de tu negocio, brindando soluciones efectivas y personalizadas para satisfacer las necesidades específicas de cada cliente.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/arescapital.png" alt="ares capital" className="w-[50vh] h-[25vh] object-cover" />
                    <p className="m-[8%] text-center">El mercado de Inversión y  el sector de locales comerciales es nuestra especialidad a nivel nacional con un enfoque adaptado a perfiles institucionales y privados GozaMadrid va de la mano trabajando con Ares Capital desarrollando principalmente en dos líneas de negocio; dar servicio a Inversores, Family Office, Propietarios y Empresas en operaciones de compra-venta y representar a las firmas más exclusivas del sector Retail tanto españolas como internacionales en la búsqueda de nuevas ubicaciones en las principales calles comerciales.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/duplo.png" alt="duplo" className="w-[50vh] h-[45vh] mt-[-25%] object-cover" />
                    <p className="mr-[8%] ml-[8%] text-center mt-[8%]">En nuestra empresa, nos esforzamos por facilitar la obtención de tu hipoteca, comprendiendo que este proceso puede generar nerviosismo y tensión. Por ello, nuestro enfoque principal es garantizar tu tranquilidad en todo momento. Valoramos la transparencia y la empatía en nuestra labor, buscando siempre brindarte un servicio humano y cercano.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/electry.png" alt="electry" className="w-[50vh] h-[25vh] object-cover" />
                    <p className="m-[8%] text-center">Ofrecemos una amplia gama de servicios diseñados para analizar detalladamente los consumos energéticos de nuestros clientes, negociar con proveedores de energía para obtener tarifas más competitivas, asesorar en la selección de tecnologías y soluciones energéticas eficientes, llevar a cabo la implementación de medidas de ahorro energético y el trámite de certificados energéticos.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/mutua.png" alt="mutua" className="w-[50vh] h-[25vh] object-cover" />
                    <p className="m-[8%] text-center">Hemos establecido un acuerdo exclusivo para nuestros asociados, que les permite acceder a tarifas altamente competitivas para ofrecer servicios de gestión de impagos a los propietarios que alquilan sus viviendas.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/ordennails.png" alt="ordennails" className="w-[50vh] h-[25vh] " />
                    <p className="m-[8%] text-center">Nuestro servicio de Organización Profesional ofrece una amplia gama de soluciones para mejorar la funcionalidad y el orden en tu hogar o lugar de trabajo. Desde la organización general hasta la planificación de rutinas familiares, pasando por la preparación de espacios específicos como la habitación del bebé o el trastero, estamos aquí para ayudarte en cada paso del camino. También ofrecemos asistencia en el cambio de armario, la retirada de enseres de un ser querido fallecido, la gestión de archivos físicos o digitales, y la preparación y post-mudanza.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/reformatek.png" alt="reformatek" className="w-[50vh] h-[40vh] mt-[-20%]" />
                    <p className="mr-[8%] ml-[8%] text-center mt-[8%]">Nuestro equipo de expertos en arquitectura, diseño y construcción trabaja en estrecha colaboración con cada cliente para entender sus objetivos y convertir sus ideas en realidad. Ya sea una reforma completa de una vivienda, la renovación de un espacio comercial o la rehabilitación de un edificio histórico, en ReformaTek nos comprometemos a ofrecer resultados excepcionales que superen las expectativas.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/suelosyparedes.png" alt="suelosyparedes" className="w-[50vh] h-[25vh]" />
                    <p className="m-[8%] text-center">Nos especializamos en ofrecer soluciones integrales para la decoración y renovación de interiores. Desde suelos hasta paredes, contamos con una amplia gama de productos y servicios para satisfacer las necesidades de nuestros clientes. Nuestra tienda en línea ofrece una experiencia de compra conveniente y accesible, donde puedes explorar una variedad de opciones de diseño y encontrar inspiración para tu próximo proyecto de decoración.</p>
                </div>
                <div className="flex flex-col items-center">
                    <img src="/coocun.jpg" alt="suelosyparedes" className="w-[50vh] h-[25vh]" />
                    <p className="m-[8%] text-center">¿Necesitas vender tu casa pero te preocupa la complejidad del proceso, especialmente si eres una persona de la tercera edad? ¡No te preocupes! En nuestra empresa, ofrecemos un servicio especializado de apoyo para la tercera edad. Nuestro equipo está aquí para brindarte la asistencia y orientación que necesitas en cada paso del camino. Desde la evaluación inicial de tu propiedad hasta la firma del contrato final.</p>
                </div>
            </div>
        </div>
    );
}
