import GuiaCompraInmuebles from "@/components/Servicios/guiaCompraInmuebles";

export default function GuiaCompra() {
    return (
        <>
            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <GuiaCompraInmuebles />
        </>
    );
}