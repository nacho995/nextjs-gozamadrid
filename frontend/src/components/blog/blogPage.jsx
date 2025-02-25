"use client";
import { getBlogById, getBlogPosts } from "@/pages/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AnimatedOnScroll from "../AnimatedScroll";

export default function BlogPage() {
    // Estado para indicar que el componente se montó (solo en cliente)
    const [hasMounted, setHasMounted] = useState(false);
    // Estado para almacenar la lista de blogs (inicialmente un array vacío)
    const [blogs, setBlogs] = useState([]);
    // Estado para almacenar el contenido del blog seleccionado
    const [selectedBlog, setSelectedBlog] = useState(null);

    // Establece hasMounted en true una vez que el componente se monta en el cliente
    useEffect(() => {
        setHasMounted(true);
    }, []);

    // Primer efecto: obtener la lista de blogs
    useEffect(() => {
        const fetchBlogs = async () => {
            try {
                const data = await getBlogPosts();
                // Si data no es un array, asignamos un array vacío
                setBlogs(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error("Error fetching blog data:", error);
            }
        };
        fetchBlogs();
    }, []);

    // Segundo efecto: obtener el contenido del primer blog de la lista (puedes ajustar esto según tus necesidades)
    useEffect(() => {
        const fetchBlogContent = async (id) => {
            try {
                const data = await getBlogById(id);
                setSelectedBlog(data);
            } catch (error) {
                console.error("Error fetching blog content:", error);
            }
        };

        if (blogs && Array.isArray(blogs) && blogs.length > 0) {
            // Usamos _id porque es el identificador que devuelve MongoDB
            fetchBlogContent(blogs[0]._id);
        }
    }, [blogs]);

    if (!hasMounted) {
        return <div>Loading...</div>;
    }

    return (

        <>
            <div className="relative min-h-screen py-8">
                <AnimatedOnScroll>

                    {/* Contenedor de contenido con posición relativa para que no herede la opacidad del fondo */}
                    <div className="relative container mx-auto px-4">
                        {/* Encabezado */}
                        <header className="mb-8 text-center">
                            <div className="relative inline-block">
                                {/* Texto: este elemento se posiciona relativo para estar sobre el fondo */}
                                <h1 className="relative text-gray-700 inline-block text-lg font-bold px-4 py-2">
                                    Lee e infórmate con nuestros blogs
                                </h1>

                            </div>

                            <p className="text-4xl font-bold mb-2 text-black ">
                                Descubre nuestros artículos y últimas noticias.
                            </p>


                        </header>

                        {/* Lista de blogs */}
                        {blogs && Array.isArray(blogs) && blogs.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {blogs.map((blog) => (
                                    <div
                                        key={blog._id}
                                        className="bg-white border border-black border-b-4 border-r-4 p-6 hover:bg-amarillo rounded-lg shadow-md hover:shadow-xl transition-shadow"
                                    >
                                        {/* Si el blog tiene imagen, la renderizamos */}
                                        {blog.image && blog.image.src && (
                                            <div className="relative w-full overflow-hidden pb-[56.25%] mb-4">
                                                <img
                                                    src={blog.image.src}
                                                    alt={blog.image.alt || "Imagen del blog"}
                                                    className="absolute inset-0 w-full h-full object-cover"
                                                />
                                            </div>
                                        )}
                                        <h2 className="text-2xl font-semibold mb-2">{blog.title}</h2>
                                        <p className="text-black mb-4">
                                            {blog.description
                                                ? blog.description.slice(0, 100) + "..."
                                                : ""}
                                        </p>
                                        <Link href={`/blog/${blog._id}`}>
                                            <span className="text-black hover:bg-gray-800 hover:rounded-xl hover:p-2 hover:text-white font-bold">
                                                Leer más &rarr;
                                            </span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-center text-gray-500">No hay blogs disponibles.</p>
                        )}

                        {/* Contenido del blog seleccionado */}

                    </div>
                </AnimatedOnScroll >
            </div>
        </>
    );
}