import AnimatedOnScroll from "@/components/AnimatedScroll";
import AlquilerTuristico from "@/components/Servicios/alquilerTuristico";

export default function AlquilerPage() {
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
                <AlquilerTuristico />
            </AnimatedOnScroll>
        </>
    );
} 