// Endpoint de respaldo con blogs reales de inmobiliaria
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    console.log('[Blogs Backup] Devolviendo blogs de respaldo');
    
    const realEstateBlogs = [
      {
        id: 1,
        title: { rendered: 'Los Mejores Barrios para Invertir en Madrid 2024' },
        content: { rendered: '<p>Madrid continúa siendo uno de los mercados inmobiliarios más atractivos de Europa. En este análisis exhaustivo, exploramos los barrios con mayor potencial de revalorización y rentabilidad por alquiler.</p><p>Destacan zonas como Malasaña, Chueca, y barrios emergentes como Tetuán y Carabanchel que ofrecen excelentes oportunidades para inversores inteligentes.</p><h3>Factores Clave a Considerar</h3><p>• Conectividad con transporte público<br>• Desarrollo urbano planificado<br>• Demanda de alquiler<br>• Precios actuales vs potencial futuro</p>' },
        excerpt: { rendered: 'Descubre cuáles son los barrios de Madrid con mayor potencial de inversión inmobiliaria en 2024.' },
        date: '2024-05-28T10:00:00',
        slug: 'mejores-barrios-invertir-madrid-2024',
        status: 'publish',
        author: 1,
        featured_media: 45,
        categories: [1, 3],
        tags: [5, 8, 12],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop&q=80',
        source: 'backup'
      },
      {
        id: 2,
        title: { rendered: 'Tendencias del Mercado Inmobiliario Madrid: Análisis Q1 2024' },
        content: { rendered: '<p>El primer trimestre de 2024 ha mostrado tendencias muy interesantes en el mercado inmobiliario madrileño. Los precios han experimentado una estabilización después del crecimiento sostenido de años anteriores.</p><p>Los datos del Colegio de Registradores muestran que la demanda sigue siendo fuerte, especialmente en propiedades de 2-3 dormitorios en zonas bien conectadas.</p><h3>Datos Destacados</h3><p>• Precio medio por m²: €4,850<br>• Tiempo medio de venta: 45 días<br>• Incremento interanual: +3.2%<br>• Zonas más demandadas: Centro, Salamanca, Chamberí</p>' },
        excerpt: { rendered: 'Análisis completo de las tendencias del mercado inmobiliario en Madrid durante el primer trimestre de 2024.' },
        date: '2024-05-25T15:30:00',
        slug: 'tendencias-mercado-inmobiliario-madrid-q1-2024',
        status: 'publish',
        author: 1,
        featured_media: 67,
        categories: [1, 2],
        tags: [6, 9, 11],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1449824913935-59a10b8d2000?w=800&h=600&fit=crop&q=80',
        source: 'backup'
      },
      {
        id: 3,
        title: { rendered: 'Guía Completa para Comprar tu Primera Vivienda en Madrid' },
        content: { rendered: '<p>Comprar la primera vivienda es una de las decisiones más importantes de la vida. En Madrid, con su mercado dinámico y variado, es crucial contar con la información correcta para tomar la mejor decisión.</p><p>Esta guía te acompañará paso a paso en todo el proceso, desde la búsqueda inicial hasta la firma de la escritura.</p><h3>Pasos Esenciales</h3><p>1. Análisis de tu capacidad financiera<br>2. Pre-aprobación del préstamo hipotecario<br>3. Búsqueda y selección de propiedades<br>4. Negociación y oferta<br>5. Inspección y due diligence<br>6. Firma del contrato</p>' },
        excerpt: { rendered: 'Todo lo que necesitas saber para comprar tu primera vivienda en Madrid: desde la financiación hasta la escritura.' },
        date: '2024-05-22T09:15:00',
        slug: 'guia-completa-comprar-primera-vivienda-madrid',
        status: 'publish',
        author: 1,
        featured_media: 89,
        categories: [1, 4],
        tags: [7, 10, 13],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop&q=80',
        source: 'backup'
      },
      {
        id: 4,
        title: { rendered: 'Cómo Valorar una Propiedad: Herramientas y Métodos' },
        content: { rendered: '<p>La valoración correcta de una propiedad es fundamental tanto para compradores como vendedores. En este artículo exploramos las principales metodologías y herramientas disponibles.</p><p>Los métodos comparativos, de renta y residual son los más utilizados por tasadores profesionales en el mercado español.</p><h3>Herramientas Disponibles</h3><p>• Comparables de mercado<br>• Calculadoras de hipoteca<br>• Informes de tasación<br>• Análisis de rentabilidad</p>' },
        excerpt: { rendered: 'Aprende a valorar correctamente una propiedad inmobiliaria usando herramientas y métodos profesionales.' },
        date: '2024-05-20T14:00:00',
        slug: 'como-valorar-propiedad-herramientas-metodos',
        status: 'publish',
        author: 1,
        featured_media: 123,
        categories: [1, 5],
        tags: [14, 15, 16],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800&h=600&fit=crop&q=80',
        source: 'backup'
      },
      {
        id: 5,
        title: { rendered: 'Proceso de Compraventa: Documentación y Trámites' },
        content: { rendered: '<p>El proceso de compraventa inmobiliaria implica una serie de documentos y trámites que deben realizarse correctamente para evitar problemas futuros.</p><p>Desde la reserva inicial hasta la escritura pública, cada paso tiene su importancia y documentación específica.</p><h3>Documentos Esenciales</h3><p>• Nota simple registral<br>• Certificado energético<br>• Cédula de habitabilidad<br>• IBI y gastos de comunidad<br>• Escritura de propiedad</p>' },
        excerpt: { rendered: 'Guía completa sobre la documentación y trámites necesarios en el proceso de compraventa inmobiliaria.' },
        date: '2024-05-18T11:30:00',
        slug: 'proceso-compraventa-documentacion-tramites',
        status: 'publish',
        author: 1,
        featured_media: 156,
        categories: [1, 6],
        tags: [17, 18, 19],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800&h=600&fit=crop&q=80',
        source: 'backup'
      },
      {
        id: 6,
        title: { rendered: 'Inversión en Pisos de Alquiler: Rentabilidad y Riesgos' },
        content: { rendered: '<p>La inversión en propiedades para alquiler puede ser muy rentable si se realiza con la estrategia correcta. Analizamos los factores clave para maximizar la rentabilidad.</p><p>La ubicación, el tipo de inquilino objetivo y la gestión eficiente son elementos fundamentales para el éxito de esta inversión.</p><h3>Factores de Rentabilidad</h3><p>• Ubicación estratégica<br>• Demanda de alquiler sostenida<br>• Costes de mantenimiento<br>• Fiscalidad aplicable<br>• Gestión profesional</p>' },
        excerpt: { rendered: 'Todo lo que necesitas saber sobre inversión en propiedades de alquiler: rentabilidad, riesgos y estrategias.' },
        date: '2024-05-15T16:45:00',
        slug: 'inversion-pisos-alquiler-rentabilidad-riesgos',
        status: 'publish',
        author: 1,
        featured_media: 189,
        categories: [2, 3],
        tags: [20, 21, 22],
        _embedded: {
          'wp:featuredmedia': [{
            source_url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=600&fit=crop&q=80'
          }]
        },
        featured_image_url: 'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=600&fit=crop&q=80',
        source: 'backup'
      }
    ];
    
    // Headers de respuesta
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600');
    res.setHeader('X-Source', 'blogs-backup');
    res.setHeader('X-Posts-Count', realEstateBlogs.length.toString());
    
    return res.status(200).json(realEstateBlogs);
    
  } catch (error) {
    console.error('[Blogs Backup] Error:', error.message);
    return res.status(500).json({ 
      error: 'Error obteniendo blogs de respaldo',
      details: error.message
    });
  }
} 