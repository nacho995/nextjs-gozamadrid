import { getServerSideSitemap } from 'next-sitemap';
import { getAllPropertyIds } from '@/services/propertyService';
import { getAllBlogSlugs } from '@/services/blogService';

/**
 * Genera un sitemap dinámico del servidor para propiedades y blogs
 * Este sitemap complementa al sitemap estático generado por next-sitemap
 */
export const getServerSideProps = async (ctx) => {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com';
    const currentDate = new Date().toISOString();
    
    // Arrays para almacenar las entradas del sitemap
    let sitemapFields = [];
    
    // Intentar obtener todos los IDs de propiedades
    try {
      const propertyIds = await getAllPropertyIds();
      
      // Crear entradas de sitemap para cada propiedad
      const propertyFields = propertyIds.map(id => ({
        loc: `${baseUrl}/property/${id}`,
        lastmod: currentDate,
        changefreq: 'weekly',
        priority: 0.8,
      }));
      
      sitemapFields = [...sitemapFields, ...propertyFields];
      console.log(`[server-sitemap] Añadidas ${propertyFields.length} propiedades al sitemap`);
    } catch (error) {
      console.error('[server-sitemap] Error obteniendo IDs de propiedades:', error);
    }
    
    // Intentar obtener todos los slugs de blogs
    try {
      const blogSlugs = await getAllBlogSlugs();
      
      // Crear entradas de sitemap para cada blog
      const blogFields = blogSlugs.map(slug => ({
        loc: `${baseUrl}/blog/${slug}`,
        lastmod: currentDate,
        changefreq: 'monthly',
        priority: 0.6,
      }));
      
      sitemapFields = [...sitemapFields, ...blogFields];
      console.log(`[server-sitemap] Añadidos ${blogFields.length} blogs al sitemap`);
    } catch (error) {
      console.error('[server-sitemap] Error obteniendo slugs de blogs:', error);
    }
    
    // Retornar el sitemap generado
    return getServerSideSitemap(ctx, sitemapFields);
  } catch (error) {
    console.error('[server-sitemap] Error generando sitemap del servidor:', error);
    return getServerSideSitemap(ctx, []);
  }
};

// Esta página no necesita renderizar nada, sólo generar el sitemap XML
export default function Sitemap() {} 