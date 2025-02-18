"use client";
import React from 'react';
import AnimatedOnScroll from '../AnimatedScroll';
import Image from 'next/image';

export default function DefaultBlogContent({ blog }) {
  return (
    <AnimatedOnScroll>
      <article className="max-w-3xl mx-auto bg-white shadow rounded-xl overflow-hidden">
        {/* Encabezado */}
        <div className="p-6 border-b border-gray-200 text-center">
          <h1 className="text-5xl font-bold">{blog.title}</h1>
        </div>

        {/* Imagen principal o primera de las imágenes adicionales */}
        { (blog.image && blog.image.src) || (blog.images && blog.images.length > 0) ? (
          <figure className="relative w-full h-96">
            <Image
              src={
                blog.image && blog.image.src
                  ? blog.image.src
                  : blog.images[0].src
              }
              alt={
                blog.image && blog.image.src
                  ? blog.image.alt || blog.title
                  : blog.images[0].alt || blog.title
              }
              fill
              className="object-cover transition-transform duration-300 hover:scale-105"
            />
          </figure>
        ) : null}

        {/* Contenido principal del blog */}
        <section className="p-6">
          <div dangerouslySetInnerHTML={{ __html: blog.content }} />
        </section>

        {/* Opcional: imágenes adicionales en bloques separados */}
        {blog.images && blog.images.length > 1 && (
          <section className="p-6 grid gap-6">
            {blog.images.slice(1).map((img, index) => (
              <figure key={index} className="relative w-full h-64 rounded-lg shadow-md overflow-hidden">
                <Image
                  src={img.src}
                  alt={img.alt || blog.title}
                  fill
                  className="object-cover transition-transform duration-300 hover:scale-105"
                />
              </figure>
            ))}
          </section>
        )}

        {/* Etiquetas o tags */}
        {blog.tags && (
          <footer className="p-6 border-t border-gray-200">
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <span
                  key={index}
                  className="bg-gray-200 text-gray-700 px-4 py-1 rounded-full text-sm"
                >
                  {tag}
                </span>
              ))}
            </div>
          </footer>
        )}
      </article>
    </AnimatedOnScroll>
  );
}
