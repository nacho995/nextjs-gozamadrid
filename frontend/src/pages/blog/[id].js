import React from 'react';
import { getBlogById } from '@/pages/api'; // Asegúrate de que la ruta sea correcta


// Importa las diferentes plantillas

import DefaultBlogContent from '@/components/defaultBlogContent';
import EstiloABlogContent from '@/components/ABlogContent';

const BlogDetail = ({ blog }) => {
  if (!blog) {
    return (
      
        <div className="container mx-auto p-4">
          <h1 className="text-4xl font-bold text-center">Blog no encontrado</h1>
        </div>
     
    );
  }

  // Aquí se selecciona la plantilla en función del campo `template` del blog
  // Por defecto se usa "default" si no se especifica
  let BlogContentComponent;
  switch (blog.template) {
    case "estiloA":
      BlogContentComponent = EstiloABlogContent;
      break;
    // Puedes agregar más casos para otras plantillas
    case "default":
    default:
      BlogContentComponent = DefaultBlogContent;
  }

  return (
    
      <div className="container mx-auto p-4">
        <BlogContentComponent blog={blog} />
      </div>
   
  );
};

BlogDetail.getInitialProps = async ({ query }) => {
  const { id } = query;
  console.log("Parámetro id recibido:", id);
  try {
    const blog = await getBlogById(id);
    console.log("Datos del blog:", blog);
    return { blog };
  } catch (error) {
    console.error("Error fetching blog content:", error);
    return { blog: null };
  }
};

export default BlogDetail;
