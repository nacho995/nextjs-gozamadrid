import ImpuestoSobreRenta from "@/components/Servicios/impuestosobrerenta";

export default function ImpuestoRenta() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <ImpuestoSobreRenta />
        </>
    );
}
