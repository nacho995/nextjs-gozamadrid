/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.NEXT_PUBLIC_SITE_URL || 'https://www.realestategozamadrid.com',
  generateRobotsTxt: true,
  sitemapSize: 7000,
  exclude: [
    '/api/*',
    '/admin/*',
    '/test/*',
    '/debug/*',
    '/diagnostic/*',
    '/_app',
    '/_document',
    '/_error',
    '/404',
    '/500',
    '/server-sitemap.xml',
    '/sitemap.xml',
    '/sitemap-*.xml'
  ],
  additionalPaths: async (config) => {
    const result = [];
    
    // Páginas principales estáticas con prioridades estratégicas para SEO
    const staticPages = [
      {
        loc: '/',
        changefreq: 'daily',
        priority: 1.0,
        lastmod: new Date().toISOString(),
      },
      // Páginas de lujo con alta prioridad para SEO
      {
        loc: '/propiedades-lujo',
        changefreq: 'daily',
        priority: 0.95,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/pisos-lujo-madrid',
        changefreq: 'daily',
        priority: 0.95,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/inmobiliaria-lujo-madrid',
        changefreq: 'daily',
        priority: 0.95,
        lastmod: new Date().toISOString(),
      },
      // Páginas comerciales importantes
      {
        loc: '/vender/comprar',
        changefreq: 'weekly',
        priority: 0.9,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/vender',
        changefreq: 'weekly',
        priority: 0.85,
        lastmod: new Date().toISOString(),
      },
      // Páginas de servicios
      {
        loc: '/servicios',
        changefreq: 'weekly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/alquiler',
        changefreq: 'weekly',
        priority: 0.75,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/residentes-espana',
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/residentes-espana/alquiler',
        changefreq: 'monthly',
        priority: 0.65,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/residentes-espana/guia-compra',
        changefreq: 'monthly',
        priority: 0.65,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/residentes-extranjero',
        changefreq: 'monthly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/residentes-extranjero/guia-compra',
        changefreq: 'monthly',
        priority: 0.65,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/servicios/residentes-extranjero/impuesto-renta',
        changefreq: 'monthly',
        priority: 0.65,
        lastmod: new Date().toISOString(),
      },
      // Blog y contenido
      {
        loc: '/blog',
        changefreq: 'daily',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      // Otros servicios
      {
        loc: '/reformas',
        changefreq: 'weekly',
        priority: 0.7,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/exp-realty',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/contacto',
        changefreq: 'monthly',
        priority: 0.8,
        lastmod: new Date().toISOString(),
      },
      // Páginas legales
      {
        loc: '/aviso-legal',
        changefreq: 'yearly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/privacidad',
        changefreq: 'yearly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/politica-cookies',
        changefreq: 'yearly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      },
      {
        loc: '/terminos',
        changefreq: 'yearly',
        priority: 0.3,
        lastmod: new Date().toISOString(),
      }
    ];
    
    result.push(...staticPages);
    
    try {
      // Intentar obtener propiedades para generar URLs dinámicas
      const fetch = (await import('node-fetch')).default;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
      
      // Obtener propiedades de MongoDB con prioridad alta para propiedades de lujo
      try {
        const mongoResponse = await fetch(`${apiUrl}/api/properties/sources/mongodb`, {
          timeout: 15000
        });
        
        if (mongoResponse.ok) {
          const mongoProperties = await mongoResponse.json();
          if (Array.isArray(mongoProperties)) {
            mongoProperties.forEach(property => {
              if (property._id) {
                // Determinar prioridad basada en el precio (propiedades de lujo tienen mayor prioridad)
                let priority = 0.7;
                if (property.price && typeof property.price === 'number') {
                  if (property.price > 2000000) priority = 0.9; // Propiedades de lujo premium
                  else if (property.price > 1000000) priority = 0.85; // Propiedades de lujo
                  else if (property.price > 500000) priority = 0.8; // Propiedades premium
                }
                
                result.push({
                  loc: `/property/${property._id}`,
                  changefreq: 'weekly',
                  priority: priority,
                  lastmod: property.updatedAt || new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('[Sitemap] Error obteniendo propiedades MongoDB:', error.message);
      }
      
      // Obtener propiedades de WooCommerce
      try {
        const wooResponse = await fetch(`${apiUrl}/api/properties/sources/woocommerce`, {
          timeout: 15000
        });
        
        if (wooResponse.ok) {
          const wooProperties = await wooResponse.json();
          if (Array.isArray(wooProperties)) {
            wooProperties.forEach(property => {
              if (property.id) {
                // Determinar prioridad basada en el precio
                let priority = 0.7;
                const price = parseFloat(property.price);
                if (!isNaN(price)) {
                  if (price > 2000000) priority = 0.9;
                  else if (price > 1000000) priority = 0.85;
                  else if (price > 500000) priority = 0.8;
                }
                
                result.push({
                  loc: `/property/${property.id}`,
                  changefreq: 'weekly',
                  priority: priority,
                  lastmod: property.updatedAt || property.date_modified || new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('[Sitemap] Error obteniendo propiedades WooCommerce:', error.message);
      }
      
      // Obtener posts del blog
      try {
        const blogResponse = await fetch(`${apiUrl}/api/blogs`, {
          timeout: 15000
        });
        
        if (blogResponse.ok) {
          const blogPosts = await blogResponse.json();
          if (Array.isArray(blogPosts)) {
            blogPosts.forEach(post => {
              if (post.id) {
                // Mayor prioridad para posts relacionados con lujo
                let priority = 0.6;
                const title = (post.title?.rendered || post.title || '').toLowerCase();
                if (title.includes('lujo') || title.includes('exclusiv') || title.includes('premium')) {
                  priority = 0.75;
                }
                
                result.push({
                  loc: `/blog/${post.id}`,
                  changefreq: 'monthly',
                  priority: priority,
                  lastmod: post.modified || post.date || new Date().toISOString(),
                });
              }
            });
          }
        }
      } catch (error) {
        console.warn('[Sitemap] Error obteniendo posts del blog:', error.message);
      }
      
    } catch (error) {
      console.error('[Sitemap] Error general obteniendo contenido dinámico:', error.message);
    }
    
    console.log(`[Sitemap] Generadas ${result.length} URLs para el sitemap con prioridades optimizadas para SEO de lujo`);
    return result;
  },
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/test/',
          '/debug/',
          '/diagnostic/',
          '/_app',
          '/_document', 
          '/_error',
          '/404',
          '/500'
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/'
        ],
        crawlDelay: 1
      },
      {
        userAgent: 'Bingbot',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/'
        ],
        crawlDelay: 1
      }
    ],
    additionalSitemaps: [
      `${process.env.NEXT_PUBLIC_SITE_URL || 'https://www.realestategozamadrid.com'}/server-sitemap.xml`,
    ],
  },
  transform: async (config, path) => {
    // Personalizar la prioridad y frecuencia de cambio según el tipo de página
    let priority = 0.7;
    let changefreq = 'weekly';
    
    // Página principal
    if (path === '/') {
      priority = 1.0;
      changefreq = 'daily';
    }
    // Páginas de lujo (máxima prioridad)
    else if (path === '/propiedades-lujo' || path === '/pisos-lujo-madrid' || path === '/inmobiliaria-lujo-madrid') {
      priority = 0.95;
      changefreq = 'daily';
    }
    // Páginas comerciales principales
    else if (path === '/vender/comprar') {
      priority = 0.9;
      changefreq = 'daily';
    }
    else if (path === '/vender') {
      priority = 0.85;
      changefreq = 'weekly';
    }
    // Propiedades individuales
    else if (path.startsWith('/property/')) {
      priority = 0.8; // Se ajustará dinámicamente en additionalPaths
      changefreq = 'weekly';
    }
    // Blog
    else if (path === '/blog') {
      priority = 0.8;
      changefreq = 'daily';
    }
    else if (path.startsWith('/blog/')) {
      priority = 0.6; // Se ajustará dinámicamente en additionalPaths
      changefreq = 'monthly';
    }
    // Servicios
    else if (path.startsWith('/servicios')) {
      priority = 0.7;
      changefreq = 'weekly';
    }
    // Contacto
    else if (path === '/contacto') {
      priority = 0.8;
      changefreq = 'monthly';
    }
    // Páginas legales
    else if (path.includes('legal') || path.includes('privacidad') || path.includes('terminos') || path.includes('cookies')) {
      priority = 0.3;
      changefreq = 'yearly';
    }
    // Otras páginas
    else {
      priority = 0.6;
      changefreq = 'weekly';
    }
    
    return {
      loc: path,
      changefreq,
      priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
      // Agregar metadatos adicionales para páginas de lujo
      ...(path.includes('lujo') && {
        images: [
          {
            loc: `${config.siteUrl}/images/lujo-madrid-hero.jpg`,
            caption: 'Propiedades de Lujo Madrid'
          }
        ]
      })
    };
  },
  autoLastmod: true,
}; 