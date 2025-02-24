import ImpuestoSobreRenta from "@/components/Servicios/impuestosobrerenta";

export default function ImpuestoRenta() {
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
            <ImpuestoSobreRenta />
        </>
    );
}
