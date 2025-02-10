// components/DefaultBlogContent.jsx
import React from 'react';
import AnimatedOnScroll from './AnimatedScroll';

export default function DefaultBlogContent({ blog }) {
  return (
    <AnimatedOnScroll>
    <article className="prose max-w-none">
      <h1 className="text-5xl font-bold mb-4">{blog.title}</h1>
      {blog.image && blog.image.src && (
        <div className="relative w-full h-96 overflow-hidden rounded-lg shadow-md mb-6">
          <img
            src={blog.image.src}
            alt={blog.image.alt || blog.title}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div dangerouslySetInnerHTML={{ __html: blog.content }} />
      <div className="mt-4 flex flex-wrap gap-2">
        {blog.tags && blog.tags.map((tag, index) => (
          <span key={index} className="bg-gray-200 text-gray-700 px-3 py-1 rounded-full text-sm">
            {tag}
          </span>
        ))}
      </div>
    </article>
    </AnimatedOnScroll>
  );
}
