"use client";

import { motion } from 'framer-motion';
import { 
    FaTools, FaHome, FaBed, FaShower, FaTree, FaPaintRoller, 
    FaRuler, FaHandshake, FaClipboardList, FaCouch, FaBath,
    FaWrench, FaTint, FaLeaf, FaDoorOpen, FaLightbulb,
    FaHammer, FaClock, FaCheck, FaPalette, FaWindowMaximize
} from 'react-icons/fa';
import Image from 'next/image';
import Link from 'next/link';
import FadeInView from '../animations/FadeInView';
import FadeIn from '../animations/FadeIn';

export default function Reforms() {
    const initialServices = [
        {
            icon: <FaTools className="text-4xl text-amarillo" />,
            title: "Reformas sin obra",
            description: "Rapidez y limpieza, evite solicitud de licencias y largos periodos."
        },
        {
            icon: <FaPaintRoller className="text-4xl text-amarillo" />,
            title: "Paredes",
            description: "Transformamos las paredes en horas y sin obras, sin necesidad de picar."
        },
        {
            icon: <FaHandshake className="text-4xl text-amarillo" />,
            title: "Le asesoramos",
            description: "Póngase en contacto con nosotros y déjese asesorar por nuestros especialistas."
        },
        {
            icon: <FaRuler className="text-4xl text-amarillo" />,
            title: "Suelos en múltiples acabados",
            description: "Acérquese a ver nuestro amplio catálogo."
        },
        {
            icon: <FaHome className="text-4xl text-amarillo" />,
            title: "25 años de experiencia",
            description: "Trabajamos proyectos especializados para cada caso."
        },
        {
            icon: <FaClipboardList className="text-4xl text-amarillo" />,
            title: "Le visitamos",
            description: "Estudiamos la mejor opción y presupuesto, ¡sin compromiso!"
        }
    ];

    const bathServices = [
        { icon: <FaPaintRoller />, name: "Paredes" },
        { icon: <FaHome />, name: "Mamparas" },
        { icon: <FaCouch />, name: "Armarios" },
        { icon: <FaRuler />, name: "Suelos" },
        { icon: <FaBath />, name: "Sanitarios" },
        { icon: <FaWrench />, name: "Fontanería y electricidad" },
        { icon: <FaShower />, name: "Platos de ducha" },
        { icon: <FaTint />, name: "Grifería" }
    ];

    const roomTypes = [
        {
            title: "Vestíbulos y salones",
            description: "Servicio integral de diseño de interiores que incluye revestimientos de paredes y suelos, mobiliario e iluminación.",
            features: [
                "Revestimientos modernos",
                "Iluminación personalizada",
                "Mobiliario a medida",
                "Optimización del espacio"
            ],
            image: "/salon.jpg",
            icon: <FaHome />
        },
        {
            title: "Dormitorios",
            description: "Transforme los dormitorios con revestimientos y entelados para paredes, creando ambientes acogedores.",
            features: [
                "Entelados exclusivos",
                "Armarios empotrados",
                "Pavimentos silenciosos",
                "Iluminación ambiental"
            ],
            image: "/dormitorios.jpg",
            icon: <FaBed />
        },
        {
            title: "Exteriores",
            description: "Innovaciones en pavimentos y cerramientos para terrazas, jardines y porches.",
            features: [
                "Tarimas naturales",
                "Bambú ecológico",
                "Cortinas de vidrio",
                "Moquetas vinílicas"
            ],
            image: "/exteriorReforma.jpg",
            icon: <FaTree />
        }
    ];

    const advantages = [
        {
            icon: <FaClock className="text-4xl text-amarillo" />,
            title: "Rapidez",
            description: "Minimizamos los tiempos de ejecución adaptándonos a sus horarios."
        },
        {
            icon: <FaCheck className="text-4xl text-amarillo" />,
            title: "Sin Licencias",
            description: "Evite trámites y solicitudes de licencias de obra."
        },
        {
            icon: <FaPalette className="text-4xl text-amarillo" />,
            title: "Personalización",
            description: "Amplia gama de acabados y materiales a elegir."
        }
    ];

    const exteriorServices = [
        {
            icon: <FaWindowMaximize />,
            title: "Cerramientos",
            description: "Cortinas de vidrio fijas y plegables con diseño vanguardista."
        },
        {
            icon: <FaTree />,
            title: "Pavimentos",
            description: "Tarimas naturales y tecnológicas para exteriores."
        },
        {
            icon: <FaLeaf />,
            title: "Jardines",
            description: "Soluciones sostenibles y de bajo mantenimiento."
        }
    ];

    return (
        <div className="relative z-50">
            <FadeIn>
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center mb-16">
                        <motion.h1
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className="text-4xl md:text-5xl font-bold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-black via-amarillo to-black"
                        >
                            Reformas Sin Obras
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                            className="text-xl max-w-4xl mx-auto text-gray-600"
                        >
                            Transformamos espacios sin las molestias de las obras tradicionales. 
                            Soluciones rápidas, limpias y profesionales para tu hogar.
                        </motion.p>
                    </div>
                </div>
            </FadeIn>

            <FadeInView>
                <div className="container mx-auto px-4">
                    {/* Servicios Iniciales */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
                        {initialServices.map((service, index) => (
                            <motion.div
                                key={index}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1 }}
                                className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg hover:shadow-xl 
                                    transition-all duration-300 hover:scale-105"
                            >
                                <div className="flex flex-col items-center text-center">
                                    {service.icon}
                                    <h3 className="text-xl font-bold mt-4 mb-2">{service.title}</h3>
                                    <p className="text-gray-600">{service.description}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    {/* Sección de Paredes y Suelos */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Renovación de Paredes</h2>
                            <p className="text-gray-600 mb-4">
                                ¿Estás pensando en eliminar el gotelé de tus paredes pero te preocupa el polvo? 
                                Ofrecemos un revestimiento exclusivo para tus paredes, sin necesidad de obras, 
                                de manera rápida y limpia. Disponemos de una amplia gama de colecciones con 
                                diversas tonalidades y texturas.
                            </p>
                            <div className="relative h-48 rounded-lg overflow-hidden">
                                <Image
                                    src="/paredes.jpg"
                                    alt="Renovación de paredes"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>

                        <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg">
                            <h2 className="text-2xl font-bold mb-4">Suelos Innovadores</h2>
                            <p className="text-gray-600 mb-4">
                                ¿Tu suelo está dañado y prefieres evitar las molestias de las obras tradicionales? 
                                Te invitamos a visitarnos y descubrir las últimas tendencias en pavimentos de alta 
                                resistencia que se instalan sin obras. Realizamos la instalación habitación por 
                                habitación, sin que tengas que desocupar tu hogar.
                            </p>
                            <div className="relative h-48 rounded-lg overflow-hidden">
                                <Image
                                    src="/suelos.jpg"
                                    alt="Suelos innovadores"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección de Exteriores */}
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-20">
                        <div className="flex items-center mb-6">
                            <FaLeaf className="text-4xl text-amarillo mr-4" />
                            <h2 className="text-3xl font-bold">Reformas en Exteriores</h2>
                        </div>
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            <div>
                                <p className="text-gray-600 mb-4">
                                    Tenemos a tu disposición las más recientes innovaciones en pavimentos para 
                                    áreas exteriores como terrazas, jardines y porches. Ofrecemos una amplia 
                                    gama que incluye desde tarimas naturales y de bambú, hasta opciones 
                                    tecnológicas y moquetas vinílicas.
                                </p>
                                <p className="text-gray-600">
                                    Adicionalmente, proporcionamos diversas alternativas constructivas para 
                                    cerramientos exteriores. Entre ellas, destacan las cortinas de vidrio, 
                                    tanto fijas como plegables, caracterizadas por su diseño vanguardista y 
                                    su mínima perfilería visible.
                                </p>
                            </div>
                            <div className="relative h-64 rounded-lg overflow-hidden">
                                <Image
                                    src="/exteriores.jpg"
                                    alt="Reformas en exteriores"
                                    fill
                                    className="object-cover"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Sección de Baños */}
                    <div className="bg-white/5 backdrop-blur-sm p-8 rounded-xl shadow-lg mb-20">
                        <h2 className="text-3xl font-bold mb-6 text-center">Renovación de Baños</h2>
                        <p className="text-gray-600 text-center mb-8 max-w-3xl mx-auto">
                            Si prefieres evitar las molestias asociadas con las reformas tradicionales, 
                            contamos con materiales exclusivos que te permitirán transformar tus baños de 
                            manera limpia, cómoda y sin necesidad de obras.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {bathServices.map((service, index) => (
                                <div
                                    key={index}
                                    className="flex flex-col items-center p-4 bg-white/5 rounded-lg 
                                        hover:bg-white/10 transition-all duration-300"
                                >
                                    <div className="text-2xl text-amarillo mb-2">
                                        {service.icon}
                                    </div>
                                    <span className="text-center">{service.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección de Ventajas */}
                    <div className="mb-20">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {advantages.map((advantage, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg 
                                        hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        {advantage.icon}
                                        <h3 className="text-xl font-bold mt-4 mb-2">{advantage.title}</h3>
                                        <p className="text-gray-600">{advantage.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Sección de Tipos de Habitaciones */}
                    {roomTypes.map((room, index) => (
                        <div
                            key={index}
                            className="mb-20 bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden shadow-lg"
                        >
                            <div className="grid grid-cols-1 lg:grid-cols-2">
                                <div className="p-8">
                                    <div className="flex items-center mb-4">
                                        <div className="text-4xl text-amarillo mr-4">
                                            {room.icon}
                                        </div>
                                        <h2 className="text-2xl font-bold">{room.title}</h2>
                                    </div>
                                    <p className="text-gray-600 mb-6">{room.description}</p>
                                    <ul className="space-y-3">
                                        {room.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center">
                                                <FaCheck className="text-amarillo mr-2" />
                                                <span>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="relative h-[400px]">
                                    <Image
                                        src={room.image}
                                        alt={room.title}
                                        fill
                                        className="object-cover"
                                    />
                                </div>
                            </div>
                        </div>
                    ))}

                    {/* Sección de Servicios Exteriores */}
                    <div className="mb-20">
                        <h2 className="text-3xl font-bold text-center mb-12">
                            Soluciones para Exteriores
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                            {exteriorServices.map((service, index) => (
                                <div
                                    key={index}
                                    className="bg-white/5 backdrop-blur-sm p-6 rounded-xl shadow-lg 
                                        hover:shadow-xl transition-all duration-300"
                                >
                                    <div className="flex flex-col items-center text-center">
                                        <div className="text-4xl text-amarillo mb-4">
                                            {service.icon}
                                        </div>
                                        <h3 className="text-xl font-bold mb-2">{service.title}</h3>
                                        <p className="text-gray-600">{service.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </FadeInView>

            <FadeInView>
                <div className="container mx-auto px-4 py-12">
                    <div className="text-center">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                        >
                            <Link 
                                href="/contacto"
                                className="inline-block bg-gradient-to-r from-black via-amarillo to-black 
                                    text-white px-8 py-4 rounded-full font-semibold shadow-lg hover:shadow-xl 
                                    transition-all duration-700 ease-in-out hover:from-amarillo hover:via-black 
                                    hover:to-amarillo bg-[size:100%] hover:bg-[size:200%] bg-left hover:bg-right"
                            >
                                Solicitar Presupuesto Sin Compromiso
                            </Link>
                        </motion.div>
                    </div>
                </div>
            </FadeInView>
        </div>
    );
}
