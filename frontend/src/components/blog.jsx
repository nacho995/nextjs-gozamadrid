"use client";
import { useState, useEffect } from "react";
import { Button } from "@relume_io/relume-ui";
import { RxChevronRight } from "react-icons/rx";
import { getBlogPosts } from "../pages/api";
import Link from "next/link";
import AnimatedOnScroll from "./AnimatedScroll";


// Componente BlogHome
const BlogHome = (props) => {
  const [blogs, setBlogs] = useState([]);
  const { tagline, heading, description, button } = {
    ...Blog44Defaults,
    ...props,
  };

  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        const data = await getBlogPosts();
        setBlogs(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Error fetching blog data:", error);
      }
    };
    fetchBlogs();
  }, []);

  return (
    <AnimatedOnScroll>
    <section id="relume" className="px-[5%] py-16 md:py-24 lg:py-28">
      <div className="container mx-auto">
        {/* Encabezado */}
        <div className="rb-12 mb-12 grid grid-cols-1 items-start justify-start gap-y-8 md:mb-18 md:grid-cols-[1fr_max-content] md:items-end md:justify-between md:gap-x-12 md:gap-y-4 lg:mb-20 lg:gap-x-20">
          <div className="w-full max-w-lg">
            <p className="mb-3 font-semibold md:mb-4">{tagline}</p>
            <h1 className="mb-3 text-5xl font-bold md:mb-4 md:text-7xl lg:text-8xl">
              {heading}
            </h1>
            <p className="md:text-md">{description}</p>
          </div>
          <div className="hidden flex-wrap items-center justify-end md:block">
           <Link
            href="/blog"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-black/50 
                px-4 sm:px-6 lg:px-8 
                py-2 sm:py-2.5 lg:py-3 
                transition-all duration-300 hover:bg-black/70 backdrop-blur-sm
                max-w-[90%] sm:max-w-[80%] lg:max-w-none"
          >
              <span className="relative text-sm sm:text-base lg:text-lg font-semibold text-white whitespace-normal text-center">
                  Ver todo
              </span>
              <span className="absolute bottom-0 left-0 h-1 w-full transform bg-gradient-to-r from-amarillo via-black to-amarillo transition-transform duration-300 group-hover:translate-x-full"></span>
          </Link>
          </div>
        </div>

        {/* Grilla de blogs */}
        <div className="grid grid-cols-1 gap-x-8 gap-y-12 md:grid-cols-2 md:gap-y-16 lg:grid-cols-3">
          {blogs.length > 0 ? (
            blogs.slice(0, 3).map((post) => (
              <Link
                key={post._id}
                href={`/blog/${post._id}`}
                className="flex w-full flex-col items-center justify-start border border-border-primary hover:border-amarillo hover:border-2 transition-colors"
              >
                {/* Contenedor de la imagen con relación de aspecto */}
                <div className="relative w-full overflow-hidden pt-[66%]">
                  {post.image && post.image.src && (
                    <img
                      src={post.image.src}
                      alt={post.image.alt || "Imagen del blog"}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  )}
                </div>
                {/* Contenido de la tarjeta */}
                <div className="flex w-full flex-1 flex-col justify-between px-5 py-6 md:p-6">
                  <div className="rb-4 mb-4 flex items-center">
                    <p className="mr-4 bg-background-secondary px-2 py-1 text-sm font-semibold">
                      {post.category}
                    </p>
                    <p className="inline text-sm font-semibold">
                      {post.readTime}
                    </p>
                  </div>
                  <div className="flex w-full flex-col items-start justify-start">
                    {post.title && (
                      <h2 className="mb-2 text-xl font-bold md:text-2xl">
                        {post.title}
                      </h2>
                    )}
                    {post.description && <p>{post.description}</p>}
                    {post.button && (
                      <Button
                        {...post.button}
                        className="mt-6 flex items-center justify-center gap-x-1 hover:bg-amarillo hover:font-bold"
                      >
                        {post.button.title}
                      </Button>
                    )}
                  </div>
                </div>
              </Link>
            ))
          ) : (
            <p className="text-center text-gray-500">No hay publicaciones disponibles.</p>
          )}
        </div>

        {/* Botón para ver todos (visible en móvil) */}
        
      </div>
    </section>
    </AnimatedOnScroll>
  );
};

// Valores predeterminados para el componente Blog44
const Blog44Defaults = {
  tagline: "Goza Madrid",
  heading: "Ver detalles inmobiliarios",
  description: "Blogs de Goza Madrid.",
  button: { title: "Ver todo", variant: "secondary" },
  blogPosts: [
    {
      url: "#",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image 1",
      },
      category: "Category",
      readTime: "5 min read",
      title: "Blog title heading will go here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
      button: {
        title: "Read more",
        variant: "link",
        size: "link",
        iconRight: <RxChevronRight />,
      },
    },
    {
      url: "#",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image 2",
      },
      category: "Category",
      readTime: "5 min read",
      title: "Blog title heading will go here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
      button: {
        title: "Read more",
        variant: "link",
        size: "link",
        iconRight: <RxChevronRight />,
      },
    },
    {
      url: "#",
      image: {
        src: "https://d22po4pjz3o32e.cloudfront.net/placeholder-image-landscape.svg",
        alt: "Relume placeholder image 3",
      },
      category: "Category",
      readTime: "5 min read",
      title: "Blog title heading will go here",
      description:
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Suspendisse varius enim in eros.",
      button: {
        title: "Read more",
        variant: "link",
        size: "link",
        iconRight: <RxChevronRight />,
      },
    },
  ],
};

export default BlogHome;
