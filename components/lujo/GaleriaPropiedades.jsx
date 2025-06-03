import React from 'react';
import Image from "next/image";
import { motion } from 'framer-motion';

function GaleriaPropiedades() {
  const propiedades = [
    {
      id: 1,
      titulo: "Ático de lujo en Salamanca",
      descripcion: "Espectacular ático de 280m² con terraza panorámica y acabados de máxima calidad",
      imagen: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      resultado: "Vendido en 21 días",
      destacado: "8% sobre precio de salida"
    },
    {
      id: 2,
      titulo: "Villa exclusiva en La Moraleja",
      descripcion: "Impresionante villa de 650m² con jardín, piscina y zona de wellness en urbanización privada",
      imagen: "https://images.unsplash.com/photo-1613977257363-707ba9348227?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      resultado: "Vendido en 45 días",
      destacado: "Comprador internacional"
    },
    {
      id: 3,
      titulo: "Piso señorial en Jerónimos",
      descripcion: "Elegante piso de 320m² con vistas al Retiro, techos altos y elementos originales restaurados",
      imagen: "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      resultado: "Vendido en 38 días",
      destacado: "5% sobre precio de tasación"
    },
    {
      id: 4,
      titulo: "Chalet independiente en Puerta de Hierro",
      descripcion: "Magnífico chalet de 480m² en parcela de 1.200m² con diseño contemporáneo y máxima privacidad",
      imagen: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80",
      resultado: "Vendido en 60 días",
      destacado: "Operación confidencial"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-black md:text-4xl">
            Nuestros Casos de Éxito
          </h2>
          <div className="mx-auto h-1 w-24 bg-yellow-500"></div>
          <p className="mt-4 text-lg text-gray-800">
            Propiedades exclusivas vendidas recientemente
          </p>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {propiedades.map((propiedad) => (
            <motion.div
              key={propiedad.id}
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
              viewport={{ once: true }}
              className="group overflow-hidden rounded-lg bg-white shadow-lg transition-all duration-300 hover:shadow-xl border border-yellow-200"
            >
              <div className="relative h-64 w-full overflow-hidden">
                <Image
                  src={propiedad.imagen}
                  alt={propiedad.titulo}
                  fill
                  style={{ objectFit: "cover" }}
                  className="transition-transform duration-500 group-hover:scale-110"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4 text-white opacity-90">
                  <span className="inline-block rounded-md bg-yellow-500 px-3 py-1 text-sm font-semibold uppercase tracking-wide text-black">
                    {propiedad.resultado}
                  </span>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="mb-2 text-xl font-bold text-black">{propiedad.titulo}</h3>
                <p className="mb-4 text-gray-800">{propiedad.descripcion}</p>
                <div className="flex items-center justify-start">
                  <span className="font-medium text-yellow-700">{propiedad.destacado}</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        

      </div>
    </section>
  );
}

export default GaleriaPropiedades;
