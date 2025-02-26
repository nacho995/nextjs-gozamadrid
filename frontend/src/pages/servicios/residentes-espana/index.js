import AnimatedOnScroll from "@/components/AnimatedScroll";
import ServiciosEspaña from "@/components/Servicios/españa";

export default function ResidentesEspaña() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-100"
                style={{
                    backgroundImage: "url('/gozamadridwp2.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="min-h-screen relative">
                    <div className="text-center py-12">
                        <h2 className="mt-[10vh] text-4xl font-bold mb-4 text-black">
                            Servicios para inversores inmobiliarios en España
                        </h2>
                        <p className="text-lg text-gray-600 max-w-2xl mx-auto px-4">
                            Maximiza tus inversiones con nuestro asesoramiento especializado para residentes locales
                        </p>
                    </div>
                    <ServiciosEspaña />
                </div>
            </AnimatedOnScroll>
        </>
    );
} 