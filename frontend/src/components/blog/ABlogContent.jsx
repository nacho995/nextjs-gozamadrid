// components/EstiloABlogContent.jsx
import React from 'react';

export default function EstiloABlogContent({ blog }) {
  return (
    <article className="max-w-3xl mx-auto">
      <h1 className="text-6xl font-extrabold text-center mb-8">{blog.title}</h1>
      {blog.image && blog.image.src && (
        <div className="relative w-full h-80 overflow-hidden mb-8">
          <img
            src={blog.image.src}
            alt={blog.image.alt || blog.title}
            className="w-full h-full object-cover rounded-lg"
          />
        </div>
      )}
      <div className="text-lg leading-relaxed" dangerouslySetInnerHTML={{ __html: blog.content }} />
      <div className="mt-6">
        <p className="text-sm text-gray-500">Autor: {blog.author} | Categoría: {blog.category}</p>
        <p className="text-sm text-gray-500">Tiempo de lectura: {blog.readTime}</p>
      </div>
      {blog.tags && blog.tags.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-semibold mb-2">Etiquetas</h3>
          <div className="flex flex-wrap gap-2">
            {blog.tags.map((tag, index) => (
              <span key={index} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </article>
  );
}
