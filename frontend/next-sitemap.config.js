/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://gozamadrid.com',
  generateRobotsTxt: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 5000,
  exclude: [
    '/admin/*',
    '/api/*',
    '/private/*',
    '/sitemap.xml',
    '/sitemap-*.xml',
    '/robots.txt'
  ],
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/', '/private/']
      }
    ],
    additionalSitemaps: [
      'https://gozamadrid.com/sitemap.xml',
    ]
  },
  // Añadir URLs específicas importantes
  additionalPaths: async () => {
    return [
      {
        loc: '/propiedades',
        changefreq: 'daily',
        priority: 0.9,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/blog',
        changefreq: 'weekly', 
        priority: 0.8,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/contacto',
        changefreq: 'monthly',
        priority: 0.6,
        lastmod: new Date().toISOString()
      },
      {
        loc: '/sobre-nosotros',
        changefreq: 'monthly',
        priority: 0.5,
        lastmod: new Date().toISOString()
      }
    ]
  }
} 