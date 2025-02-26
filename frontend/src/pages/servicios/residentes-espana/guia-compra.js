import GuiaCompraInmuebles from "@/components/Servicios/guiaCompraInmuebles";

export default function GuiaCompra() {
    return (
        <div className="relative min-h-screen">
            {/* Fondo fijo */}
            <div
                className="fixed inset-0 z-0"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                }}
            />
            
            {/* Contenedor principal con z-index superior */}
            <div className="relative z-10">
                <div className="container mx-auto px-4 py-16">
                    <GuiaCompraInmuebles />
                </div>
            </div>
        </div>
    );
}