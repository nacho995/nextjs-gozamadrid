/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/admin/*', 
    '/api/*', 
    '/404', 
    '/500', 
    '/test*', 
    '/diagnostic*', 
    '/diagnostico*'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/_next/',
          '/404',
          '/500',
          '/admin',
          '/test',
          '/diagnostico*',
          '/diagnostic*'
        ]
      },
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://realestategozamadrid.com'}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Personalizar prioridad según la ruta
    let priority = 0.7;
    
    if (path === '/') {
      // Página principal
      priority = 1.0;
    } else if (path.startsWith('/property/')) {
      // Páginas de propiedades individuales
      priority = 0.8;
    } else if (path.startsWith('/blog/')) {
      // Entradas de blog
      priority = 0.6;
    }
    
    // Configurar la frecuencia de cambio según el tipo de página
    let changefreq = 'weekly';
    
    if (path === '/' || path === '/property') {
      // Páginas que cambian frecuentemente
      changefreq = 'daily';
    } else if (path.includes('/blog/')) {
      // Contenido de blog
      changefreq = 'monthly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      alternateRefs: config.alternateRefs || [],
    };
  },
}; 