import AnimatedOnScroll from "@/components/AnimatedScroll";
import ServiciosExtranjero from "@/components/Servicios/fueraDeEspaña";

export default function ResidentesExtranjero() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp2.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="min-h-screen relative">
                    <div className="text-center py-12">
                        <h2 className="mt-[10vh] text-4xl font-bold mb-4 text-black">
                            Servicios para inversores internacionales
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Facilitamos tu inversión inmobiliaria en España desde el extranjero.
                            Gestión fiscal y asesoramiento completo para no residentes.
                        </p>
                    </div>
                    <ServiciosExtranjero />
                </div>
            </AnimatedOnScroll>
        </>
    );
}
