import AnimatedOnScroll from "@/components/AnimatedScroll";
import AlquilerTuristico from "@/components/Servicios/alquilerTuristico";

export default function AlquilerPage() {
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
                <AlquilerTuristico />
            </AnimatedOnScroll>
        </>
    );
} 