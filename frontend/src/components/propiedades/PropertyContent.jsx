"use client";
import React from 'react';
import AnimatedOnScroll from '../AnimatedScroll';
import Link from 'next/link';


export default function DefaultPropertyContent({ property }) {
  return (
    <AnimatedOnScroll>
      <article className="prose max-w-none">
        <div className="container-fluid relative px-3">
          <div className="layout-specing">
            {/* Encabezado y Breadcrumbs */}
            <div className="md:flex justify-between items-center">
              <h5 className="text-lg font-semibold">Detalles de la propiedad</h5>
              <ul className="tracking-[0.5px] inline-block sm:mt-0 mt-3">
                
                <li className="inline-block text-base dark:text-white/70 mx-0.5">
                  <i className="mdi mdi-chevron-right"></i>
                </li>
                <li className="inline-block capitalize text-[16px] font-medium text-amarillo dark:text-white" aria-current="page">
                  Detalles de la propiedad
                </li>
              </ul>
            </div>

            {/* Imagen de la propiedad */}
            {property.images && property.images.length > 0 && property.images[0].src && (
              <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md mb-6">
                <img
                  src={property.images[0].src}
                  alt={property.images[0].alt || property.typeProperty}
                  className="w-full h-full object-cover"
                />
              </div>
            )}

            {/* Layout en dos columnas */}
            <div className="grid lg:grid-cols-12 md:grid-cols-2 gap-6 mt-6">
              {/* Columna Izquierda: Detalles */}
              <div className="lg:col-span-8">
                <div className="bg-white dark:bg-gray-100 p-6 rounded-md shadow dark:shadow-gray-700">
                  <h4 className="text-2xl font-medium">{property.address}</h4>

                  <ul className="py-6 flex items-center list-none">
                    <li className="flex items-center lg:me-6 me-4">
                      <i className="mdi mdi-arrow-expand-all lg:text-3xl text-2xl me-2 text-amarillo"></i>
                      <span className="lg:text-xl">{property.m2} m2</span>
                    </li>
                    <li className="flex items-center lg:me-6 me-4">
                      <i className="mdi mdi-bed lg:text-3xl text-2xl me-2 text-amarillo"></i>
                      <span className="lg:text-xl">{property.rooms} Habitaciones</span>
                    </li>
                    <li className="flex items-center">
                      <i className="mdi mdi-shower lg:text-3xl text-2xl me-2 text-amarillo"></i>
                      <span className="lg:text-xl">{property.wc} Baños</span>
                    </li>
                  </ul>

                  <p className="text-slate-400">{property.description}</p>

                  {/* Mapa embebido si existe */}
                  {property.mapEmbed && (
                    <div className="w-full leading-[0] border-0 mt-6">
                      <iframe
                        src={property.mapEmbed}
                        style={{ border: "0" }}
                        title="Property Map"
                        className="w-full h-[500px]"
                        allowFullScreen
                      ></iframe>
                    </div>
                  )}
                </div>
              </div>

              {/* Columna Derecha: Resumen */}
              <div className="lg:col-span-4">
                <div className="rounded-md bg-white dark:bg-amarillo/10 py-10 px-2 dark:shadow-gray-700 ">
                  <h5 className="text-2xl font-medium">Price:</h5>
                  <div className="flex justify-between items-center mt-6">
                    <span className="text-xl font-medium">{property.price}€</span>
                    <span className="bg-black text-amarillo text-sm px-2.5 py-0.75 rounded h-6">
                      En venta
                    </span>
                  </div>
                  <ul className="list-none mt-4">
                    <li className="flex justify-between items-center mt-2">
                      <span className="text-slate-400 text-sm">Precio por metro cuadrado</span>
                      <span className="font-medium text-sm">{property.priceM2 || "N/A"}</span>
                    </li>
                
                  </ul>
                  <div className="flex mt-4">
                    <div className="p-1 w-1/2">
                      <Link href="/booking" className="  text-white rounded-md w-full">
                      <span className="bg-black text-white hover:text-amarillo  text-lg px-2.5 py-0.75 rounded h-6 p-2">
                      Agenda una visita
                    </span>
                      </Link>
                    </div>
                    <div className="p-1 w-1/2">
                      <Link href="/offer" className="  text-white rounded-md w-full">
                      <span className="bg-black text-white hover:text-amarillo text-lg px-2.5 py-0.75 p-2  rounded h-6">
                      Haz una oferta
                    </span>
                      </Link>
                    </div>
                  </div>
                </div>

                <div className="mt-12 text-center py-14">
                  <h3 className="mb-6 text-xl leading-normal font-medium text-black dark:text-black">
                    ¿Tienes preguntas sobre esta propiedad?
                  </h3>
                  <div className="mt-6">
                    <Link
                      href="/contact"
                      className=" border-amarillo text-amarillo hover:text-amarillo rounded-md"
                    >
                      <span className="bg-black text-white  hover:text-amarillo border text-xl px-2.5 py-0.75 p-2 rounded ">
                      Contáctanos
                    </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </AnimatedOnScroll>
  );
}
