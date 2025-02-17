"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
 // Ajusta la ruta según tu estructura
import { getPropertyPosts } from "@/pages/api"; // Asegúrate de que la ruta y función sean correctas
import AnimatedOnScroll from "../AnimatedScroll";

export default function PropertyPage() {
  const [properties, setProperties] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  // Obtener todas las propiedades desde la API
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const data = await getPropertyPosts();
        setProperties(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching properties:", error);
      }
    };
    fetchProperties();
  }, []);

  // Filtrar propiedades por dirección (buscador)
  const filteredProperties = properties.filter((property) =>
    property.address.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Fondo absoluto con gradiente */}
      <div
        className="fixed inset-0 z-0 opacity-10"
        style={{
          background: `repeating-linear-gradient(40deg, #000000, #000000 5vh, #ffffff 20vh, #C7A336 30vh)`,
          backgroundAttachment: "fixed",
        }}
      ></div>

      <div className="relative min-h-screen py-8">
        <AnimatedOnScroll>
          <div className="relative container mx-auto px-3">
            {/* Encabezado y Breadcrumbs */}
            <div className="layout-specing">
              <div className="md:flex justify-center items-center">
                <h5 className="text-3xl  font-semibold">Explora nuestras propiedades</h5>
              </div>

              {/* Buscador por dirección */}
              <div className="mb-8 flex justify-center">
                <input
                  type="text"
                  placeholder="Buscar por dirección..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full max-w-md p-3 border border-gray-300 rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Lista de propiedades en grid */}
              {filteredProperties && filteredProperties.length > 0 ? (
                <div className="grid xl:grid-cols-4 lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mt-6">
                  {filteredProperties.map((item, index) => {
                    // Suponiendo que item.images es un array de objetos { src, alt }
                    const imageUrl =
                      item.images && item.images.length > 0
                        ? item.images[0].src
                        : "/placeholder.png"; // Fallback a una imagen de placeholder

                    return (
                      <Link
                        key={index}
                        href={`/property/${item._id}`}
                        className="group block rounded-xl dark:text-white dark:hover:text-black bg-white dark:bg-slate-900 shadow hover:bg-amarillo dark:hover:shadow-xl dark:shadow-gray-700 dark:hover:shadow-gray-700 overflow-hidden ease-in-out duration-500"
                      >
                        <div className="relative">
                          <Image
                            src={imageUrl}
                            width={0}
                            height={0}
                            sizes="100vw"
                            style={{ width: "100%", height: "auto" }}
                            alt={
                              item.images &&
                              item.images[0] &&
                              item.images[0].alt
                                ? item.images[0].alt
                                : item.name
                            }
                          />

                          <div className="absolute top-4 end-4">
                            <Link
                              href="#"
                              onClick={(e) => {
                                e.preventDefault();
                                // Aquí la lógica para "like" si lo deseas
                              }}
                              className="btn btn-icon bg-white dark:bg-slate-900 shadow dark:shadow-gray-700 rounded-full text-slate-100 dark:text-slate-700 focus:text-red-600 dark:focus:text-red-600 hover:text-red-600 dark:hover:text-red-600"
                            >
                              <i className="mdi mdi-heart text-[20px]"></i>
                            </Link>
                          </div>
                        </div>

                        <div className="p-6">
                          <div className="pb-6">
                            <h3 className="text-lg hover:text-green-600 font-medium ease-in-out duration-500">
                              {item.typeProperty}
                            </h3>
                          </div>

                          <ul className="py-6 border-y border-slate-100 dark:border-gray-800 flex items-center list-none">
                            <li className="flex items-center me-4">
                              <i className="mdi mdi-arrow-expand-all text-2xl me-2 text-green-600"></i>
                              <span>{item.address}</span>
                            </li>
                            <li className="flex items-center me-4">
                              <i className="mdi mdi-bed text-2xl me-2 text-green-600"></i>
                              <span>{item.rooms} habitaciones</span>
                            </li>
                            <li className="flex items-center">
                              <i className="mdi mdi-shower text-2xl me-2 text-green-600"></i>
                              <span>{item.wc} baños</span>
                            </li>
                          </ul>

                          <ul className="pt-6 flex justify-between items-center list-none">
                            <li>
                              <span>Price</span>
                              <p className="text-lg font-medium">{item.price}€</p>
                            </li>

                            <li>
                              <span>Rating</span>
                              <ul className="text-lg font-medium list-none">
                                <li className="inline">
                                  <i className="mdi mdi-star"></i>
                                </li>
                                <li className="inline">
                                  <i className="mdi mdi-star"></i>
                                </li>
                                <li className="inline">
                                  <i className="mdi mdi-star"></i>
                                </li>
                                <li className="inline">
                                  <i className="mdi mdi-star"></i>
                                </li>
                                <li className="inline">
                                  <i className="mdi mdi-star"></i>
                                </li>
                                <li className="inline">5.0(30)</li>
                              </ul>
                            </li>
                          </ul>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500">
                  No hay propiedades disponibles.
                </p>
              )}

              {/* Paginación (ejemplo estático) */}
              <div className="grid md:grid-cols-12 grid-cols-1 mt-6">
                <div className="md:col-span-12 text-center">
                  <nav>
                    <ul className="inline-flex items-center -space-x-px">
                      <li>
                        <Link
                          href="#"
                          className="w-10 h-10 inline-flex justify-center items-center mx-1 rounded-full text-slate-400 bg-white dark:bg-slate-900 hover:text-white shadow-sm dark:shadow-gray-700 hover:border-green-600 dark:hover:border-green-600 hover:bg-green-600 dark:hover:bg-green-600"
                        >
                          <i className="mdi mdi-chevron-left text-[20px]"></i>
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="w-10 h-10 inline-flex justify-center items-center mx-1 rounded-full text-slate-400 hover:text-white bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 hover:border-green-600 dark:hover:border-green-600 hover:bg-green-600 dark:hover:bg-green-600"
                        >
                          1
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="w-10 h-10 inline-flex justify-center items-center mx-1 rounded-full text-slate-400 hover:text-white bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 hover:border-green-600 dark:hover:border-green-600 hover:bg-green-600 dark:hover:bg-green-600"
                        >
                          2
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          aria-current="page"
                          className="z-10 w-10 h-10 inline-flex justify-center items-center mx-1 rounded-full text-white bg-green-600 shadow-sm dark:shadow-gray-700"
                        >
                          3
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="w-10 h-10 inline-flex justify-center items-center mx-1 rounded-full text-slate-400 hover:text-white bg-white dark:bg-slate-900 shadow-sm dark:shadow-gray-700 hover:border-green-600 dark:hover:border-green-600 hover:bg-green-600 dark:hover:bg-green-600"
                        >
                          4
                        </Link>
                      </li>
                      <li>
                        <Link
                          href="#"
                          className="w-10 h-10 inline-flex justify-center items-center mx-1 rounded-full text-slate-400 bg-white dark:bg-slate-900 hover:text-white shadow-sm dark:shadow-gray-700 hover:border-green-600 dark:hover:border-green-600 hover:bg-green-600 dark:hover:bg-green-600"
                        >
                          <i className="mdi mdi-chevron-right text-[20px]"></i>
                        </Link>
                      </li>
                    </ul>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        </AnimatedOnScroll>
      </div>
    </>
  );
}
