import dynamic from 'next/dynamic';
import Head from 'next/head';

// Importar PropertyPage de forma dinámica para evitar problemas de hidratación
const PropertyPage = dynamic(() => import('@/components/propiedades/PropertyPage'), {
  ssr: false,
  loading: () => (
    <div className="container mx-auto py-12 flex justify-center items-center min-h-[60vh]">
      <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-amber-400"></div>
    </div>
  )
});

export default function PropertyListing() {
  return (
    <>
      <Head>
        <title>Propiedades en Madrid | Goza Madrid</title>
        <meta name="description" content="Explora nuestra selección de propiedades en Madrid. Encuentra tu hogar ideal con Goza Madrid." />
      </Head>
      <PropertyPage />
    </>
  );
} 