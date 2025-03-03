"use client";

import { useRef, useState } from "react";

import Link from "next/link";
import AnimatedOnScroll from "../AnimatedScroll";

export default function ExpRealtyMore({ videoId, videoId2, title }) {
    const iframeRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const youtubeUrl = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
    const youtubeUrl2 = `https://www.youtube.com/embed/${videoId2}?autoplay=1`;
    const handlePlay = () => {
        setIsPlaying(true);
    };

    return (
        <>
            <AnimatedOnScroll>
                <div className="mx-0 text-transparent bg-clip-text">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh]">
                        {/* Contenedor del video */}
                        <div className="relative w-full h-auto min-h-[35vh]">
                            <iframe
                                ref={iframeRef}
                                src={isPlaying ? youtubeUrl : `https://www.youtube.com/embed/${videoId}`}
                                title={title}
                                className="w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onClick={handlePlay}
                            />
                        </div>

                        {/* Contenedor del texto */}
                        <div className="relative flex items-center justify-start h-full w-full overflow-hidden">
                            <div className="pb-10 bg-gradient-to-tr from-blue-950/60 via-black/40 to-blue-800/50 
                                dark:from-blue-950/60 dark:via-black/40 dark:to-blue-800/50
                                backdrop-blur-lg w-full h-full min-h-[60vh]
                                text-center flex flex-col gap-8 justify-center items-center
                                px-8 sm:px-12 lg:px-20 relative"
                            >
                                {/* Efectos de luz en las esquinas */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 
                                    bg-blue-500/20 dark:bg-blue-500/20 rounded-full blur-[100px] 
                                    group-hover:bg-blue-400/30 dark:group-hover:bg-blue-400/30 
                                    transition-all duration-500">
                                </div>
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 
                                    bg-blue-600/20 dark:bg-blue-600/20 rounded-full blur-[100px] 
                                    group-hover:bg-blue-500/30 dark:group-hover:bg-blue-500/30 
                                    transition-all duration-500">
                                </div>

                                <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                                    text-white dark:text-white
                                    drop-shadow-[0_2px_2px_rgba(0,0,0,0.5)]
                                    group-hover:scale-105 
                                    transition-transform duration-500
                                    relative z-10"
                                >
                                    Propiedades Sin Fronteras
                                </h2>

                                <p className="flex flex-col justify-center m-0 
                                    text-white/90 dark:text-white/90
                                    text-base leading-relaxed tracking-wide mt-8
                                    relative z-10"
                                >
                                    <span className="mb-6">
                                        Gracias a nuestra plataforma tecnológica, los inmuebles no solo se promocionan
                                        localmente, sino que traspasan fronteras, llegando a clientes en mercados clave
                                        como México, Estados Unidos, Portugal, Dubái y muchos más.
                                    </span>

                                    <span className="text-blue-200 dark:text-blue-200 font-semibold text-lg sm:text-xl mb-4">
                                        Más de 90.000 agentes en el mundo
                                    </span>

                                    <span className="text-white/90 dark:text-white/90">
                                        Nuestra red global de agentes inmobiliarios trabaja de forma colaborativa,
                                        utilizando herramientas avanzadas como el metaverso, donde podemos mostrar
                                        propiedades, reunirnos con clientes y cerrar operaciones de forma ágil y efectiva.
                                    </span>
                                </p>

                                {/* Línea decorativa inferior */}
                                <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 w-1/4 h-[2px]
                                    bg-gradient-to-r from-transparent via-blue-300/40 dark:via-blue-300/40 to-transparent
                                    group-hover:w-1/3 transition-all duration-500">
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
                <div
                    className="z-20 relative hidden md:grid grid-cols-7 w-full overflow-hidden items-center"
                    style={{ backgroundImage: "url('/fondoblanco.jpg')" }}
                >
                    {/* Primer h2 en la columna 2 */}
                    <div className="col-start-1 col-end-4 flex items-center justify-end p-8">
                        <h2
                            className="text-center text-4xl font-bold text-black"
                            style={{ textShadow: "2px 2px 3px rgba(0, 0, 0,  0.5)" }}
                        >
                            Únete a nuestra comunidad de más de 85K mil agentes
                        </h2>
                    </div>

                    {/* GIF en la columna 3 */}
                    <div className="col-start-4 col-end-4 flex items-center justify-center mt-20">
                        <div
                            className="w-[15vw] h-[25vh] bg-cover min-w-[200px] min-h-[200px] bg-center"
                            style={{ backgroundImage: "url('/BlueCircle.gif')" }}
                        ></div>
                    </div>

                    {/* Segundo h2 en la columna 4 */}
                    <div className="col-start-5 col-end-8 flex items-center justify-start p-8">
                        <h2
                            className="text-center text-4xl font-bold text-black"
                            style={{ textShadow: "2px 2px 3px rgba(0, 0, 0,  0.5)" }}

                        >
                            Trabaja con lo último de nuestras tecnologías y nuestro modelo de negocio basado en la nube
                        </h2>
                    </div>



                    {/* Enlace: Ocupa toda la fila */}
                    <div className="col-span-7 flex justify-center py-8">
                        <a
                            className="group/link relative inline-flex items-center gap-2 overflow-hidden 
                                rounded-full bg-black/20 px-8 py-3 
                                transition-all duration-300 
                                hover:bg-black/30 
                                backdrop-blur-sm"
                            href="https://docs.google.com/presentation/d/e/2PACX-1vTiStw1c6obJyNIIDP1W03vm6xg_34FPlvYSaletdiIOhKvWK7aDHKdVvM8McZWxQ/pub?start=false&loop=false&delayms=3000&slide=id.p1"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="relative text-lg font-semibold text-black">
                            Presentación de eXp Realty
                            </span>
                            <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                transition-transform duration-300 
                                group-hover/link:translate-x-full">
                            </span>
                        </a>
                    </div>
                </div>

                {/* Versión Mobile/Tablet: Visible para pantallas menores a md */}
                <div
                    className="z-20 relative md:hidden w-full py-8"
                    style={{ backgroundImage: "url('/fondoblanco.jpg')" }}
                >
                    <div className="flex flex-col items-center justify-center space-y-4">
                        {/* Texto combinado en un solo párrafo */}
                        <p
                            className="text-center text-xl sm:text-2xl font-bold text-black italic px-4"
                            style={{ textShadow: "2px 2px 3px rgba(255,255,255,0.7)" }}
                        >
                            Únete a nuestra comunidad de más de 85K mil agentes. Trabaja con lo último de nuestras tecnologías y nuestro modelo de negocio basado en la nube
                        </p>
                        {/* GIF centrado */}
                        <div
                            className="w-[40vw] h-[25vh] bg-cover min-w-[150px] bg-center"
                            style={{ backgroundImage: "url('/BlueCircle.gif')" }}
                        ></div>
                        {/* Enlace */}
                        <div className="flex justify-center py-8">
                            <a
                                className="group/link relative inline-flex items-center gap-2 overflow-hidden 
                                    rounded-full bg-black/20 px-8 py-3 
                                    transition-all duration-300 
                                    hover:bg-black/30 
                                    backdrop-blur-sm"
                                href="https://docs.google.com/presentation/d/e/2PACX-1vTiStw1c6obJyNIIDP1W03vm6xg_34FPlvYSaletdiIOhKvWK7aDHKdVvM8McZWxQ/pub?start=false&loop=false&delayms=3000&slide=id.p1"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                <span className="relative text-lg font-semibold text-black">
                                    Presentación de eXp Realty
                                </span>
                                <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                    bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                    transition-transform duration-300 
                                    group-hover/link:translate-x-full">
                                </span>
                            </a>
                        </div>
                    </div>
                </div>

            </AnimatedOnScroll >
            <AnimatedOnScroll>
                <div className="mx-0 text-transparent bg-clip-text ">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-0 mt-0 min-h-[40vh] md:min-h-[60vh] ">
                        <div className="relative flex items-center justify-start h-full w-full overflow-hidden">
                            <div className="bg-gradient-to-tr from-blue-950/80 via-black/60 to-blue-800/70
                        backdrop-blur-lg
                        w-full 
                        h-full
                        min-h-[60vh]
                        text-center 
                        flex flex-col 
                        gap-8
                        justify-center
                        items-center
                        px-8 sm:px-12 lg:px-20
                        relative
                        group
                        hover:from-blue-800/80 hover:via-black/60 hover:to-blue-950/70
                        transition-all duration-700
                        before:content-['']
                        before:absolute
                        before:inset-0
                        before:bg-[radial-gradient(circle_at_50%_120%,rgba(37,99,235,0.1),transparent_60%)]
                        before:opacity-0
                        before:group-hover:opacity-100
                        before:transition-opacity
                        before:duration-700"
                            >
                                {/* Efectos de luz */}
                                <div className="absolute inset-0 bg-gradient-to-b from-blue-400/5 via-transparent to-blue-400/5 opacity-0 
                            group-hover:opacity-100 transition-opacity duration-700"></div>

                                {/* Círculos decorativos animados */}
                                <div className="absolute -right-20 top-1/3 w-40 h-40 rounded-full bg-blue-500/10 blur-[80px]
                            group-hover:bg-blue-400/20 group-hover:scale-150 transition-all duration-1000"></div>
                                <div className="absolute -left-20 bottom-1/3 w-40 h-40 rounded-full bg-blue-600/10 blur-[80px]
                            group-hover:bg-blue-500/20 group-hover:scale-150 transition-all duration-1000"></div>

                                <h2 className="text-4xl sm:text-6xl flex pt-10 justify-center italic font-bold
                            bg-clip-text text-transparent 
                            bg-gradient-to-r from-white via-blue-100 to-white
                            drop-shadow-[0_2px_2px_rgba(0,0,0,0.4)]
                            group-hover:scale-105 
                            transition-transform duration-500
                            relative z-10"
                                >
                                    Vende Sin Fronteras
                                </h2>

                                <div className="flex flex-col gap-6 max-w-3xl relative z-10">
                                    <p className="text-white/90 text-lg leading-relaxed tracking-wide
                                group-hover:translate-y-[-3px] transition-transform duration-500"
                                    >
                                        Si buscas vender tu propiedad con la máxima visibilidad y sin fronteras,
                                        o quieres formar parte de una inmobiliaria digital líder en el mundo,
                                        contáctanos y descubre cómo podemos ayudarte.
                                    </p>

                                    <p className="text-blue-200 font-semibold text-xl italic
                                group-hover:text-blue-100 transition-colors duration-500"
                                    >
                                        Únete a la nueva era del sector inmobiliario con eXp Realty.
                                    </p>
                                </div>

                                {/* Bordes animados */}
                                <div className="absolute inset-[2px] border border-blue-400/20 rounded-sm scale-[0.99] opacity-0
                            group-hover:scale-100 group-hover:opacity-100 transition-all duration-700"></div>

                                {/* Línea decorativa */}
                                <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 
                            w-32 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent
                            group-hover:w-48 transition-all duration-700"></div>
                            </div>
                        </div>
                        <div className="relative w-full h-auto min-h-[35vh]">
                            <iframe
                                ref={iframeRef}
                                src={isPlaying ? youtubeUrl2 : `https://www.youtube.com/embed/${videoId2}`}
                                title={title}
                                className=" w-full h-full"
                                frameBorder="0"
                                allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                                onClick={handlePlay}
                            />
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            <div className="relative w-full bg-gradient-to-r from-blue-900/60 via-black/40 to-blue-800/50 
                            backdrop-blur-lg p-8 rounded-xl shadow-lg 
                            hover:from-blue-800/60 hover:via-black/40 hover:to-blue-900/50
                            transition-all duration-500 
                            group
                            overflow-hidden"
                        >
                            {/* Efectos de luz */}
                            <div className="absolute -top-20 -right-20 w-40 h-40 bg-blue-500/20 rounded-full 
                                group-hover:bg-blue-400/30 transition-all duration-500">
                            </div>
                            <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-600/20 rounded-full 
                                group-hover:bg-blue-500/30 transition-all duration-500">
                            </div>

                            <div className="relative z-10 flex flex-col items-center justify-center gap-6">
                                <img 
                                    src="/exprealty.png" 
                                    alt="eXp Realty"
                                    className="w-48 h-auto rounded-full object-contain mb-4 
                                        group-hover:scale-105 transition-transform duration-500"
                                />
                                
                                <a 
                                    href="/ModeloExpEspaña.pdf"
                                    target="_blank"
                                    rel="noopener noreferrer" 
                                    className="group/link relative inline-flex items-center gap-2 overflow-hidden 
                                        rounded-full bg-white/20 px-8 py-3 
                                        transition-all duration-300 
                                        hover:bg-white/30 
                                        backdrop-blur-sm"
                                >
                                    <span className="relative text-lg font-semibold text-white">
                                        Ver nuestro modelo de negocio
                                    </span>
                                    <span className="absolute bottom-0 left-0 h-1 w-full transform 
                                        bg-gradient-to-r from-blue-400 via-white to-blue-400 
                                        transition-transform duration-300 
                                        group-hover/link:translate-x-full">
                                    </span>
                                </a>
                            </div>

                            {/* Bordes animados */}
                            <div className="absolute inset-[2px] border border-blue-400/20 rounded-lg scale-[0.99] opacity-0
                                group-hover:scale-100 group-hover:opacity-100 transition-all duration-700">
                            </div>
                        </div>
            <AnimatedOnScroll>
                <div
                    className="relative w-full bg-cover bg-center pb-10 h-[80vh] md:h-[80vh] modal-preview-fix"
                    style={{ backgroundImage: "url('/agenteinmobiliario.jpg')" }}
                >
                    <div
                        className="absolute left-0 top-0 p-4 bg-black bg-opacity-50 border-2 border-white flex flex-row md:flex-col w-full md:w-1/3 h-auto md:h-[80vh] overflow-auto"
                    >
                        {/* Contenedor del título: en mobile ocupa la mitad, en md ocupa el 100% */}
                        <div className="flex border-2 border-white items-center mt-[5vh] justify-center w-1/2 md:w-full">
                            <h3
                                className="text-center font-bold text-white p-2 break-words"
                                style={{
                                    textShadow: "2px 2px 3px rgba(65,105,225,0.7)",
                                    fontSize: "clamp(1.25rem, 2vw, 2.5rem)"
                                }}
                            >
                                Rompe Barreras. Crece de manera digital.
                            </h3>
                        </div>

                        <div className="flex flex-col items-center justify-center pt-[5vh] w-1/2 md:w-full">
                            <p
                                className="text-center font-bold text-white mb-4 break-words"
                                style={{
                                    textShadow: "2px 2px 3px rgba(65,105,225,0.7)",
                                    fontSize: "clamp(0.875rem, 1.5vw, 1.25rem)",
                                    margin: 0,
                                    padding: "0.5rem"
                                }}
                            >
                                Derriba barreras en una de las inmobiliarias digitales de mayor crecimiento del mundo y descubre nuevas maneras de facturar, aprender y hacer crecer tu negocio
                            </p>
                            <Link
                                className="mt-[3vh] bg-transparent border-2 border-white hover:bg-bluecolor inline-block rounded-xl font-bold max-w-full"
                                href="https://join.expglobal.partners/index.html"
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{
                                    color: "white",
                                    fontSize: "clamp(0.875rem, 1.5vw, 1.25rem)",
                                    padding: "0.5rem 1rem",
                                    whiteSpace: "normal",
                                    wordBreak: "break-word"
                                }}
                            >
                                Conviértete en agente
                            </Link>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
            <AnimatedOnScroll>
                <div className="container mx-auto py-16 relative z-20">
                    <div className="text-center mb-12">
                        <h3 
                            className="text-4xl font-bold mb-4 
                                bg-clip-text text-white
                                drop-shadow-[0_2px_2px_rgba(255,255,255,0.3)]
                                hover:scale-105 transition-all duration-300"
                            style={{ textShadow: "2px 2px 4px rgba(0,0,0,0.3)" }}
                        >
                            Conoce a nuestro equipo de eXp Realty
                        </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            {
                                id: 1,
                                name: "Eduardo Sánchez",
                                role: "CEO & Headhunter inmobiliario",
                                description: "Líder y fundador del equipo eXp en Madrid. Especializado en el desarrollo de agentes inmobiliarios y expansión de equipos comerciales. Experto en el mercado de lujo.",
                                image: "/1.png"
                            },
                            {
                                id: 2,
                                name: "Masha Tyagunova",
                                role: "Headhunter inmobiliario",
                                description: "Especialista en reclutamiento y formación de agentes inmobiliarios. Experta en desarrollo de talento y creación de equipos de alto rendimiento en el sector inmobiliario.",
                                image: "/2.png"
                            },
                            {
                                id: 3,
                                name: "Rodrigo Pinto",
                                role: "Broker inmobiliario",
                                description: "Broker especializado en operaciones de alto valor. Experto en el mercado residencial premium y gestión de carteras exclusivas en Madrid.",
                                image: "/3.png"
                            },
                            {
                                id: 4,
                                name: "Marta López",
                                role: "Headhunter inmobiliario",
                                description: "Especialista en captación y desarrollo de talento inmobiliario. Enfocada en el crecimiento y formación de equipos comerciales de alto rendimiento.",
                                image: "/4.png"
                            }
                        ].map((member) => (
                            <div key={member.id} 
                                className="group relative overflow-hidden rounded-xl shadow-lg 
                                    hover:shadow-2xl transition-all duration-500 
                                    transform hover:-translate-y-2 mb-6
                                    flex flex-col h-full"
                            >
                                {/* Contenedor de la imagen */}
                                <div className="relative w-full">
                                    <div className="aspect-square w-full">
                                        <img
                                            src={member.image}
                                            alt={member.name}
                                            className="w-full h-full object-cover transform 
                                                group-hover:scale-105 transition-transform duration-500"
                                        />
                                    </div>
                                    {/* Overlay gradiente suave */}
                                    <div className="absolute inset-0 bg-gradient-to-b 
                                        from-transparent to-black/10 
                                        group-hover:to-black/20 
                                        transition-all duration-500">
                                    </div>
                                </div>

                                {/* Información del miembro */}
                                <div className="p-6 pb-8 bg-white/10 backdrop-blur-sm flex-grow flex flex-col">
                                    <h4 className="text-white text-xl font-bold mb-2 
                                        group-hover:text-blue-200 transition-colors duration-300">
                                        {member.name}
                                    </h4>
                                    <p className="text-white/90 text-sm font-medium mb-3">
                                        {member.role}
                                    </p>
                                    <p className="text-white/80 text-sm leading-relaxed 
                                        transform opacity-80 group-hover:opacity-100 
                                        transition-all duration-300">
                                        {member.description}
                                    </p>
                                </div>

                                {/* Bordes decorativos */}
                                <div className="absolute inset-[2px] border-2 border-white/0 rounded-lg 
                                    scale-90 opacity-0 group-hover:scale-100 group-hover:opacity-20 
                                    transition-all duration-700">
                                </div>

                                {/* Efectos de luz en las esquinas */}
                                <div className="absolute -top-20 -right-20 w-40 h-40 
                                    bg-blue-500/20 rounded-full blur-[100px] 
                                    group-hover:bg-blue-400/30 transition-all duration-500">
                                </div>
                                <div className="absolute -bottom-20 -left-20 w-40 h-40 
                                    bg-blue-600/20 rounded-full blur-[100px] 
                                    group-hover:bg-blue-500/30 transition-all duration-500">
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </AnimatedOnScroll>
        </>
    );
}
