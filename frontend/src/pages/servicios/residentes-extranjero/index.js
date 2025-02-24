import AnimatedOnScroll from "@/components/AnimatedScroll";
import ServiciosExtranjero from "@/components/Servicios/fueraDeEspaña";

export default function ResidentesExtranjero() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-10"
                style={{
                    background:
                        "repeating-linear-gradient(40deg, #000000, #000000 5vh, #ffffff 20vh, #C7A336 30vh)",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="min-h-screen relative">
                    <div className="text-center py-12">
                        <h2 className="mt-[10vh] text-4xl font-bold mb-4 text-transparent bg-clip-text bg-gradient-to-r from-black via-amarillo to-black">
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
