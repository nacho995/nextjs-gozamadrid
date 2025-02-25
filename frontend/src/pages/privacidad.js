import AnimatedOnScroll from "@/components/AnimatedScroll";

export default function Privacidad() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8 text-black">Política de Privacidad</h1>
                        
                        <div className="space-y-6 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Información que Recopilamos</h2>
                                <p>En Goza Madrid recopilamos la siguiente información:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Información de contacto (nombre, email, teléfono)</li>
                                    <li>Información de la propiedad que te interesa</li>
                                    <li>Preferencias de búsqueda inmobiliaria</li>
                                    <li>Datos de navegación en nuestra web</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Uso de la Información</h2>
                                <p>Utilizamos tu información para:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Proporcionarte servicios inmobiliarios personalizados</li>
                                    <li>Responder a tus consultas y solicitudes</li>
                                    <li>Enviarte información relevante sobre propiedades</li>
                                    <li>Mejorar nuestros servicios</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Protección de Datos</h2>
                                <p>Tus datos están protegidos según el RGPD (Reglamento General de Protección de Datos). Tienes derecho a:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Acceder a tus datos personales</li>
                                    <li>Rectificar datos inexactos</li>
                                    <li>Solicitar la eliminación de tus datos</li>
                                    <li>Oponerte al procesamiento de tus datos</li>
                                    <li>Solicitar la portabilidad de tus datos</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Cookies</h2>
                                <p>Utilizamos cookies para:</p>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Mejorar la navegación en nuestra web</li>
                                    <li>Analizar el uso de nuestro sitio</li>
                                    <li>Personalizar tu experiencia</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Contacto</h2>
                                <p>Para cualquier consulta sobre tu privacidad, puedes contactarnos en:</p>
                                <ul className="list-none mt-2">
                                    <li>Email: marta@gozamadrid.com</li>
                                    <li>Teléfono: +34 919 012 103</li>
                                    <li>Dirección: Calle de Alcalá, 96, 28009 Madrid</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Actualizaciones</h2>
                                <p>Esta política de privacidad fue actualizada por última vez el 1 de marzo de 2024. Nos reservamos el derecho de modificar esta política en cualquier momento.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
        </>
    );
} 