import React from 'react';
import Head from 'next/head';
import BlogPage from "@/components/blog/blogPage";

export default function BlogPreview() {
  return (
    <>
      <Head>
        <title>Blog | Goza Madrid</title>
        <meta name="description" content="Explora nuestro blog con artículos sobre el mercado inmobiliario en Madrid" />
      </Head>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="relative bg-gradient-to-b from-black to-gray-900 text-white py-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Blog Inmobiliario
            </h1>
            <p className="text-lg md:text-xl opacity-80 max-w-3xl mx-auto">
              Descubre las últimas tendencias, consejos y noticias sobre el mercado inmobiliario en Madrid.
            </p>
          </div>
        </div>
        <div
        className="fixed inset-0 z-0 opacity-100"
        style={{
          backgroundImage: "url('/gozamadridwp2.jpg')",
          backgroundAttachment: "fixed",
        }}
      ></div>
      <BlogPage />
      </div>
    </>
  );
} 