import AnimatedOnScroll from "@/components/AnimatedScroll";

import Services from "@/components/Servicios/servicios";

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
                    Servicios Integrales para Inversión Inmobiliaria
                </h2>
                <p className="text-lg text-gray-600 max-w-3xl mx-auto px-4">
                    Potencia tu inversión inmobiliaria con nuestro servicio integral 360°. 
                    Desde análisis de mercado hasta gestión de propiedades, nuestro equipo 
                    de expertos te acompaña para maximizar la rentabilidad de tu inversión.
                </p>
            </div>
            <Services />
        </div>
    </AnimatedOnScroll>
        </>
    );
}