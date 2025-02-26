import AnimatedOnScroll from "./AnimatedScroll";

export default function Agreements() {
    return (
        <AnimatedOnScroll>
            {/* Agregar clases responsive para el contenedor principal */}
            <div className="w-full min-h-screen px-4 py-8 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    {/* Ajustar el tamaño del texto para móviles */}
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-center mb-8">
                        Acuerdos y Colaboraciones
                    </h1>

                    {/* Grid responsive para las tarjetas */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {/* Tarjeta 1 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 
                            hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                                Colaboración con eXp Realty
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                Formamos parte de la red internacional de eXp Realty, lo que nos permite
                                ofrecer servicios inmobiliarios globales y acceso a tecnología de vanguardia.
                            </p>
                        </div>

                        {/* Tarjeta 2 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 
                            hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                                Servicios Legales
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                Colaboramos con despachos de abogados especializados para garantizar
                                la seguridad jurídica en todas las transacciones inmobiliarias.
                            </p>
                        </div>

                        {/* Tarjeta 3 */}
                        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 
                            hover:shadow-xl transition-shadow duration-300">
                            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
                                Servicios Financieros
                            </h2>
                            <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
                                Trabajamos con entidades financieras de primer nivel para ofrecer
                                las mejores condiciones de financiación a nuestros clientes.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedOnScroll>
    );
}
