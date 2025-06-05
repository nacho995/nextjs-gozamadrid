import axios from 'axios';

/**
 * Proxy para obtener blogs del backend en AWS Elastic Beanstalk
 * Este endpoint se conecta a la API de blogs de Elastic Beanstalk
 */
export default async function handler(req, res) {
  // Permitir solicitudes CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // URL base de la API en AWS Elastic Beanstalk
  const baseUrl = process.env.NEXT_PUBLIC_API_MONGODB_URL || 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
  const limit = req.query.limit || 100;

  console.log(`[proxy/backend/blogs] Intentando conectar a: ${baseUrl}/api/blogs`);

  // Blogs de muestra como respaldo con contenido SEO optimizado
  const sampleBlogs = [
    {
      _id: 'sample-aws-1',
      title: 'Comprar Casa de Lujo Madrid: Mercado Inmobiliario Premium 2024',
      description: 'Análisis completo del mercado de casas de lujo en Madrid 2024. Tendencias, precios y mejores oportunidades de inversión inmobiliaria premium.',
      content: `
      <div class="luxury-market-analysis-2024">
        <h2>El Mercado de Casas de Lujo Madrid en 2024</h2>
        <p>El mercado para <strong>comprar casa de lujo Madrid</strong> experimenta un momento único en 2024. La demanda de propiedades premium ha crecido un 35% respecto al año anterior, consolidando Madrid como el epicentro del lujo inmobiliario español.</p>
        
        <h3>Tendencias Destacadas del Mercado Premium</h3>
        <h4>1. Crecimiento Sostenido de Precios</h4>
        <p>Las <strong>casas de lujo Madrid</strong> han experimentado una revalorización media del 12%:</p>
        <ul>
          <li><strong>Salamanca:</strong> 18.000-35.000€/m² (+8%)</li>
          <li><strong>Chamberí:</strong> 12.000-22.000€/m² (+15%)</li>
          <li><strong>Centro:</strong> 15.000-28.000€/m² (+10%)</li>
          <li><strong>Pozuelo:</strong> 8.000-15.000€/m² (+18%)</li>
        </ul>
        
        <h4>2. Perfil del Comprador de Lujo</h4>
        <p>Los compradores de <strong>inmuebles de lujo Madrid</strong> en 2024 se caracterizan por:</p>
        <ul>
          <li>Inversores internacionales (45%)</li>
          <li>Empresarios españoles (30%)</li>
          <li>Profesionales de alto nivel (15%)</li>
          <li>Familias de segunda generación (10%)</li>
        </ul>
        
        <h3>Zonas Premium más Demandadas</h3>
        <h4>Barrio de Salamanca - El Rey del Lujo</h4>
        <p>Para <strong>comprar vivienda de lujo Madrid</strong>, Salamanca sigue siendo la referencia:</p>
        <ul>
          <li>Palacetes históricos restaurados</li>
          <li>Áticos con terrazas panorámicas</li>
          <li>Apartamentos de 200-500m²</li>
          <li>Servicios de conserjería premium</li>
        </ul>
        
        <h4>La Moraleja - Exclusividad Residencial</h4>
        <p>Las <strong>mansiones de lujo Madrid</strong> en La Moraleja ofrecen:</p>
        <ul>
          <li>Parcelas de 2.000-5.000m²</li>
          <li>Casas de 400-1.200m²</li>
          <li>Piscinas climatizadas y spas</li>
          <li>Seguridad 24h y máxima privacidad</li>
        </ul>
        
        <h3>Características de las Propiedades Premium</h3>
        <p>Las <strong>propiedades de lujo Madrid</strong> que más se demandan incluyen:</p>
        <ul>
          <li><strong>Domótica avanzada:</strong> Control total del hogar</li>
          <li><strong>Sostenibilidad:</strong> Certificación BREEAM o LEED</li>
          <li><strong>Espacios wellness:</strong> Gimnasio, spa, sauna</li>
          <li><strong>Garajes amplios:</strong> Para 3+ vehículos</li>
          <li><strong>Oficinas privadas:</strong> Espacios de trabajo en casa</li>
        </ul>
        
        <h3>Análisis de Rentabilidad</h3>
        <p>Invertir en <strong>casas lujo Madrid</strong> proporciona:</p>
        <ul>
          <li><strong>Rentabilidad por alquiler:</strong> 3-5% anual</li>
          <li><strong>Revalorización:</strong> 8-12% anual histórico</li>
          <li><strong>Liquidez alta:</strong> Venta en 3-6 meses</li>
          <li><strong>Diversificación:</strong> Activo refugio anti-inflación</li>
        </ul>
        
        <p>En <strong>Goza Madrid</strong> te ayudamos a encontrar la casa de lujo perfecta en Madrid. Nuestro portfolio exclusivo incluye las propiedades más codiciadas de la capital.</p>
      </div>`,
      slug: 'comprar-casa-lujo-madrid-mercado-premium-2024',
      date: new Date().toISOString(),
      dateFormatted: new Date().toLocaleDateString('es-ES'),
      image: {
        src: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&h=600&fit=crop&q=80',
        alt: 'Casa de lujo en Madrid - Mercado inmobiliario premium'
      },
      source: 'aws-beanstalk-sample',
      author: 'Analistas Inmobiliarios Goza Madrid',
      readTime: '9 min',
      category: 'Mercado de Lujo',
      tags: ['casa lujo madrid', 'comprar vivienda lujo', 'mercado inmobiliario premium', 'inversión lujo']
    },
    {
      _id: 'sample-aws-2',
      title: 'Apartamentos de Lujo Madrid: Guía para Elegir el Barrio Perfecto',
      description: 'Descubre los mejores barrios de Madrid para comprar apartamentos de lujo. Análisis detallado de zonas premium y oportunidades de inversión.',
      content: `
      <div class="luxury-neighborhoods-guide">
        <h2>Cómo Elegir el Mejor Barrio para Apartamentos de Lujo Madrid</h2>
        <p>Seleccionar el barrio perfecto para <strong>apartamentos de lujo Madrid</strong> requiere análisis experto. Cada distrito premium ofrece características únicas que se adaptan a diferentes perfiles de inversores y estilos de vida.</p>
        
        <h3>Factores Clave en la Selección</h3>
        <h4>1. Ubicación Estratégica</h4>
        <p>Los mejores <strong>pisos de lujo Madrid</strong> se caracterizan por:</p>
        <ul>
          <li><strong>Conectividad premium:</strong> Metro, bus, cercanías</li>
          <li><strong>Servicios exclusivos:</strong> Colegios internacionales, hospitales privados</li>
          <li><strong>Cultura y ocio:</strong> Museos, teatros, restaurantes michelin</li>
          <li><strong>Zonas verdes:</strong> Parques y espacios de calidad</li>
        </ul>
        
        <h4>2. Potencial de Revalorización</h4>
        <p>Para <strong>comprar apartamento lujo Madrid</strong>, evalúa:</p>
        <ul>
          <li>Desarrollos urbanísticos planificados</li>
          <li>Inversión pública en infraestructura</li>
          <li>Llegada de empresas internacionales</li>
          <li>Gentrificación controlada</li>
        </ul>
        
        <h3>Top 5 Barrios para Apartamentos de Lujo</h3>
        <h4>1. Salamanca - La Elite Tradicional</h4>
        <p>El distrito de referencia para <strong>inmuebles de lujo Madrid</strong>:</p>
        <ul>
          <li><strong>Perfil:</strong> Lujo tradicional y elegancia</li>
          <li><strong>Precio medio:</strong> 12.000-25.000€/m²</li>
          <li><strong>Ventajas:</strong> Máximo prestigio, servicios premium</li>
          <li><strong>Ideal para:</strong> Inversores conservadores, familias tradicionales</li>
        </ul>
        
        <h4>2. Malasaña Premium - El Lujo Bohemio</h4>
        <p>La evolución moderna de <strong>apartamentos lujo Madrid</strong>:</p>
        <ul>
          <li><strong>Perfil:</strong> Modernidad y carácter</li>
          <li><strong>Precio medio:</strong> 8.000-15.000€/m²</li>
          <li><strong>Ventajas:</strong> Crecimiento exponencial, ambiente único</li>
          <li><strong>Ideal para:</strong> Jóvenes profesionales, artistas exitosos</li>
        </ul>
        
        <h4>3. Chueca Exclusivo - Sofisticación Central</h4>
        <p>El corazón cosmopolita para <strong>propiedades de lujo Madrid</strong>:</p>
        <ul>
          <li><strong>Perfil:</strong> Diversidad y sofisticación</li>
          <li><strong>Precio medio:</strong> 9.000-18.000€/m²</li>
          <li><strong>Ventajas:</strong> Ubicación central, vida nocturna</li>
          <li><strong>Ideal para:</strong> Profesionales internacionales</li>
        </ul>
        
        <h4>4. Chamberí Alto - Elegancia Residencial</h4>
        <p>La alternativa sofisticada en <strong>viviendas de lujo Madrid</strong>:</p>
        <ul>
          <li><strong>Perfil:</strong> Tranquilidad y distinción</li>
          <li><strong>Precio medio:</strong> 7.500-14.000€/m²</li>
          <li><strong>Ventajas:</strong> Ambiente familiar, excelente conectividad</li>
          <li><strong>Ideal para:</strong> Familias con niños, profesionales maduros</li>
        </ul>
        
        <h4>5. Nuevos Ministerios - El Distrito Financiero de Lujo</h4>
        <p>La modernidad empresarial en <strong>pisos lujo Madrid</strong>:</p>
        <ul>
          <li><strong>Perfil:</strong> Modernidad y funcionalidad</li>
          <li><strong>Precio medio:</strong> 8.500-16.000€/m²</li>
          <li><strong>Ventajas:</strong> Edificios inteligentes, servicios corporativos</li>
          <li><strong>Ideal para:</strong> Ejecutivos, empresarios</li>
        </ul>
        
        <h3>Análisis de Rentabilidad por Barrio</h3>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <thead>
            <tr style="background-color: #f8f9fa;">
              <th style="padding: 12px; border: 1px solid #ddd;">Barrio</th>
              <th style="padding: 12px; border: 1px solid #ddd;">ROI Alquiler</th>
              <th style="padding: 12px; border: 1px solid #ddd;">Revalorización Anual</th>
              <th style="padding: 12px; border: 1px solid #ddd;">Liquidez</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;"><strong>Salamanca</strong></td>
              <td style="padding: 12px; border: 1px solid #ddd;">3.8%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">6-8%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">Alta</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;"><strong>Malasaña</strong></td>
              <td style="padding: 12px; border: 1px solid #ddd;">5.2%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">10-15%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">Media-Alta</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;"><strong>Chueca</strong></td>
              <td style="padding: 12px; border: 1px solid #ddd;">4.5%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">7-10%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">Alta</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;"><strong>Chamberí</strong></td>
              <td style="padding: 12px; border: 1px solid #ddd;">4.8%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">8-12%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">Media-Alta</td>
            </tr>
            <tr>
              <td style="padding: 12px; border: 1px solid #ddd;"><strong>N. Ministerios</strong></td>
              <td style="padding: 12px; border: 1px solid #ddd;">4.2%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">6-9%</td>
              <td style="padding: 12px; border: 1px solid #ddd;">Media</td>
            </tr>
          </tbody>
        </table>
        
        <h3>Consejos de Experto para la Selección</h3>
        <p>Para elegir el barrio perfecto para tu <strong>apartamento de lujo Madrid</strong>:</p>
        <ol>
          <li><strong>Define tu perfil:</strong> Inversor, residente, segunda vivienda</li>
          <li><strong>Evalúa el timing:</strong> Mercado actual vs. proyecciones</li>
          <li><strong>Considera la liquidez:</strong> Facilidad futura de venta</li>
          <li><strong>Analiza la competencia:</strong> Oferta actual en la zona</li>
          <li><strong>Asesoría profesional:</strong> Expertos locales especializados</li>
        </ol>
        
        <p>En <strong>Goza Madrid</strong> conocemos cada barrio de lujo en profundidad. Te ayudamos a encontrar el <strong>apartamento de lujo Madrid</strong> perfecto según tus necesidades específicas.</p>
      </div>`,
      slug: 'apartamentos-lujo-madrid-mejores-barrios-inversion',
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      image: {
        src: 'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&h=600&fit=crop&q=80',
        alt: 'Apartamentos de lujo en los mejores barrios de Madrid'
      },
      source: 'aws-beanstalk-sample',
      author: 'Especialistas en Barrios Premium',
      readTime: '11 min',
      category: 'Guías de Compra',
      tags: ['apartamentos lujo madrid', 'barrios premium', 'guía inversión', 'comprar piso lujo']
    },
    {
      _id: 'sample-aws-3',
      title: 'Diseño Interior Lujo Madrid: Tendencias Premium 2024 para Viviendas Exclusivas',
      description: 'Descubre las últimas tendencias en diseño interior de lujo para viviendas premium en Madrid. Inspiración y consejos de decoradores expertos.',
      content: `
      <div class="luxury-interior-trends-2024">
        <h2>Tendencias de Diseño Interior de Lujo Madrid 2024</h2>
        <p>El <strong>diseño interior de lujo Madrid</strong> en 2024 se caracteriza por la fusión entre sostenibilidad, tecnología y elegancia atemporal. Las <strong>viviendas de lujo Madrid</strong> adoptan nuevos conceptos que priorizan el bienestar y la exclusividad.</p>
        
        <h3>Las 10 Tendencias Clave en Decoración de Lujo</h3>
        <h4>1. Minimalismo Caliente (Warm Minimalism)</h4>
        <p>Los <strong>apartamentos de lujo Madrid</strong> abrazan un minimalismo más acogedor:</p>
        <ul>
          <li><strong>Paleta de colores:</strong> Beiges, terracottas, ocres</li>
          <li><strong>Materiales:</strong> Maderas nobles, piedras naturales</li>
          <li><strong>Texturas:</strong> Linos, algodones orgánicos, lanas</li>
          <li><strong>Mobiliario:</strong> Líneas limpias con toques acogedores</li>
        </ul>
        
        <h4>2. Biofilia de Lujo</h4>
        <p>La integración de naturaleza en <strong>casas de lujo Madrid</strong>:</p>
        <ul>
          <li>Jardines verticales interiores</li>
          <li>Materiales naturales sin procesar</li>
          <li>Sistemas de purificación de aire natural</li>
          <li>Iluminación que simula ciclos solares</li>
        </ul>
        
        <h4>3. Tecnología Invisible</h4>
        <p>Los <strong>pisos de lujo Madrid</strong> integran tecnología discretamente:</p>
        <ul>
          <li><strong>Domótica oculta:</strong> Controles integrados en superficies</li>
          <li><strong>Iluminación adaptativa:</strong> Sistemas que aprenden rutinas</li>
          <li><strong>Climatización inteligente:</strong> Zonas personalizadas</li>
          <li><strong>Audio distribuido:</strong> Sonido ambiental invisible</li>
        </ul>
        
        <h3>Espacios Clave en el Diseño de Lujo</h3>
        <h4>Salones de Representación</h4>
        <p>Los salones en <strong>propiedades de lujo Madrid</strong> destacan por:</p>
        <ul>
          <li><strong>Alturas generosas:</strong> Techos de 3.5m+ con molduras</li>
          <li><strong>Chimeneas de diseño:</strong> Bioetanol o gas de líneas contemporáneas</li>
          <li><strong>Arte prominente:</strong> Muros galería con iluminación museística</li>
          <li><strong>Mobiliario statement:</strong> Piezas únicas de diseñadores reconocidos</li>
        </ul>
        
        <h4>Cocinas Gourmet</h4>
        <p>Las cocinas de <strong>inmuebles de lujo Madrid</strong> incorporan:</p>
        <ul>
          <li><strong>Electrodomésticos premium:</strong> Gaggenau, Miele, Sub-Zero</li>
          <li><strong>Encimeras espectaculares:</strong> Cuarzo Calacatta, granito exótico</li>
          <li><strong>Islas multifuncionales:</strong> Cocción, almacenaje, socialización</li>
          <li><strong>Bodegas climatizadas:</strong> Conservación perfecta de vinos</li>
        </ul>
        
        <h4>Suites Master de Ensueño</h4>
        <p>Los dormitorios principales en <strong>viviendas lujo Madrid</strong>:</p>
        <ul>
          <li><strong>Vestidores de lujo:</strong> Sistemas modulares premium</li>
          <li><strong>Baños spa:</strong> Duchas de lluvia, bañeras exentas</li>
          <li><strong>Zonas de descanso:</strong> Áreas de lectura o meditación</li>
          <li><strong>Vistas privilegiadas:</strong> Orientación hacia parques o monumentos</li>
        </ul>
        
        <h3>Materiales Premium de 2024</h3>
        <h4>Piedras Naturales Exclusivas</h4>
        <p>Las <strong>mansiones de lujo Madrid</strong> utilizan:</p>
        <ul>
          <li><strong>Mármol Emperador:</strong> De canteras españolas selectas</li>
          <li><strong>Travertino Navona:</strong> Acabados únicos y elegantes</li>
          <li><strong>Granito Azul Platino:</strong> Para zonas de alto tráfico</li>
          <li><strong>Onix retroiluminado:</strong> Efectos lumínicos espectaculares</li>
        </ul>
        
        <h4>Maderas Nobles Sostenibles</h4>
        <p>Los suelos de <strong>apartamentos lujo Madrid</strong> prefieren:</p>
        <ul>
          <li><strong>Roble francés:</strong> Tablones anchos con certificación FSC</li>
          <li><strong>Nogal americano:</strong> Vetas pronunciadas y durabilidad</li>
          <li><strong>Castaño español:</strong> Tradición local con carácter</li>
          <li><strong>Bambú premium:</strong> Sostenibilidad y resistencia</li>
        </ul>
        
        <h3>Colores de Lujo 2024</h3>
        <p>La paleta de colores para <strong>casas lujo Madrid</strong> incluye:</p>
        <ul>
          <li><strong>Sage Green:</strong> Tranquilidad y sofisticación</li>
          <li><strong>Warm Terracotta:</strong> Elegancia mediterránea</li>
          <li><strong>Deep Navy:</strong> Profundidad y distinción</li>
          <li><strong>Champagne Gold:</strong> Toques de lujo discretos</li>
        </ul>
        
        <h3>Iluminación de Autor</h3>
        <p>Los sistemas de iluminación en <strong>propiedades premium Madrid</strong>:</p>
        <ul>
          <li><strong>Lámparas de diseñador:</strong> Piezas únicas como esculturas</li>
          <li><strong>LED circadiano:</strong> Que respeta los ritmos naturales</li>
          <li><strong>Iluminación artística:</strong> Para resaltar obras y arquitectura</li>
          <li><strong>Control inteligente:</strong> Escenas programadas y personalizadas</li>
        </ul>
        
        <h3>Espacios Wellness en Casa</h3>
        <p>Las <strong>viviendas de lujo Madrid</strong> integran bienestar:</p>
        <ul>
          <li><strong>Gimnasios privados:</strong> Equipamiento profesional</li>
          <li><strong>Spas domésticos:</strong> Saunas, jacuzzis, salas de masaje</li>
          <li><strong>Salas de yoga:</strong> Espacios dedicados a la meditación</li>
          <li><strong>Zonas de relajación:</strong> Con vistas y elementos naturales</li>
        </ul>
        
        <h3>Sostenibilidad y Lujo</h3>
        <p>El futuro del <strong>diseño interior lujo Madrid</strong> es sostenible:</p>
        <ul>
          <li>Materiales reciclados de alta calidad</li>
          <li>Sistemas de gestión energética inteligente</li>
          <li>Mobiliario vintage y antigüedades restauradas</li>
          <li>Plantas purificadoras de aire interior</li>
        </ul>
        
        <p>En <strong>Goza Madrid</strong> trabajamos con los mejores interioristas de la ciudad para crear espacios únicos en nuestras <strong>propiedades de lujo Madrid</strong>. Cada vivienda es una obra de arte habitable.</p>
      </div>`,
      slug: 'diseno-interior-lujo-madrid-tendencias-premium-2024',
      date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
      dateFormatted: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toLocaleDateString('es-ES'),
      image: {
        src: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=800&h=600&fit=crop&q=80',
        alt: 'Diseño interior de lujo en vivienda exclusiva Madrid'
      },
      source: 'aws-beanstalk-sample',
      author: 'Interioristas de Lujo Madrid',
      readTime: '13 min',
      category: 'Diseño y Decoración',
      tags: ['diseño interior lujo', 'decoración premium madrid', 'tendencias lujo 2024', 'viviendas exclusivas']
    }
  ];

  try {
    // Comprobar si el servicio está disponible (ping rápido)
    let serverAvailable = false;
    try {
      console.log(`[proxy/backend/blogs] Comprobando disponibilidad de ${baseUrl}`);
      
      // En lugar de hacer un ping directamente, que puede fallar por contenido mixto,
      // intentaremos usar nuestro propio proxy para verificar el estado
      const proxyPingUrl = '/api/proxy-raw';
      const pingResponse = await axios({
        method: 'POST',
        url: proxyPingUrl,
        timeout: 5000,
        data: {
          url: `${baseUrl}`,
          method: 'HEAD',
          headers: {
            'User-Agent': 'GozaMadrid-Frontend/1.0',
            'Accept': 'application/json'
          }
        }
      }).catch(err => {
        console.error(`[proxy/backend/blogs] Error en ping proxy: ${err.message}`);
        return { status: 0 };
      });
      
      if (pingResponse.status >= 200 && pingResponse.status < 300) {
        console.log(`[proxy/backend/blogs] Servidor disponible a través de proxy (status: ${pingResponse.status})`);
        serverAvailable = true;
      } else {
        console.log(`[proxy/backend/blogs] Servidor respondió con estado no óptimo a través de proxy: ${pingResponse.status}`);
      }
    } catch (pingError) {
      console.error(`[proxy/backend/blogs] Error de conexión en el ping: ${pingError.message}`);
      // No interrumpimos, intentaremos de todas formas la solicitud principal
    }
    
    // Si el servidor no está disponible según el ping, retornamos inmediatamente los datos de muestra
    if (!serverAvailable) {
      console.log('[proxy/backend/blogs] Servidor no disponible, devolviendo datos de muestra');
      return res.status(200).json(sampleBlogs);
    }
    
    // Intentar obtener los blogs del backend real
    try {
      console.log(`[proxy/backend/blogs] Obteniendo blogs desde ${baseUrl}/api/blogs`);
      
      // Usar nuestro propio proxy para evitar problemas de contenido mixto
      const apiProxyUrl = '/api/proxy-raw';
      const response = await axios({
        method: 'POST',
        url: apiProxyUrl,
        timeout: 10000, // 10 segundos de timeout
        data: {
          url: `${baseUrl}/api/blogs`,
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Cache-Control': 'no-cache',
            'User-Agent': 'GozaMadrid-Frontend/1.0',
            'Origin': 'https://www.realestategozamadrid.com'
          }
        },
        validateStatus: function (status) {
          return status < 500; // Aceptar cualquier respuesta que no sea un 5xx
        }
      }).catch(err => {
        console.error(`[proxy/backend/blogs] Error en solicitud proxy: ${err.message}`);
        return { status: 0, data: null };
      });

      // Verificar si la respuesta contiene datos
      if (response.status >= 200 && response.status < 300 && response.data && Array.isArray(response.data)) {
        console.log(`[proxy/backend/blogs] Blogs obtenidos: ${response.data.length}`);
        
        // Procesar cada blog
        const blogs = response.data.map(blog => {
          // Asegurar valores mínimos para todas las propiedades
          const processedBlog = {
            _id: blog._id || blog.id || `aws-${Math.random().toString(36).substring(2, 11)}`,
            id: blog.id || blog._id || `id-${Math.random().toString(36).substring(2, 9)}`,
            title: blog.title || 'Sin título',
            content: blog.content || blog.description || '',
            description: blog.description || blog.excerpt || '',
            slug: blog.slug || `blog-${Math.random().toString(36).substring(2, 7)}`,
            date: blog.date || blog.createdAt || new Date().toISOString(),
            dateFormatted: new Date(blog.date || blog.createdAt || new Date()).toLocaleDateString('es-ES'),
            source: 'aws-beanstalk',
            ...blog
          };
          
          // Procesar la imagen
          if (!processedBlog.image && processedBlog.images && processedBlog.images.length > 0) {
            const firstImage = processedBlog.images[0];
            processedBlog.image = {
              src: typeof firstImage === 'string' 
                ? `/api/proxy-image?url=${encodeURIComponent(firstImage)}`
                : `/api/proxy-image?url=${encodeURIComponent(firstImage.src || firstImage.url || '')}`,
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (!processedBlog.image) {
            processedBlog.image = {
              src: '/img/default-blog-image.jpg',
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (typeof processedBlog.image === 'string') {
            processedBlog.image = {
              src: `/api/proxy-image?url=${encodeURIComponent(processedBlog.image)}`,
              alt: processedBlog.title || 'Imagen del blog'
            };
          } else if (processedBlog.image.src) {
            if (!processedBlog.image.src.startsWith('/api/proxy-image')) {
              processedBlog.image.src = `/api/proxy-image?url=${encodeURIComponent(processedBlog.image.src)}`;
            }
          }
          
          return processedBlog;
        });
        
        return res.status(200).json(blogs);
      } else {
        console.log(`[proxy/backend/blogs] Respuesta no válida: Status ${response.status}`);
        
        if (response.data && typeof response.data === 'object') {
          console.log('[proxy/backend/blogs] Datos de respuesta:', JSON.stringify(response.data).substring(0, 200) + '...');
        }
        
        // Devolver datos de muestra si no hay respuesta válida
        return res.status(200).json(sampleBlogs);
      }
    } catch (apiError) {
      console.error(`[proxy/backend/blogs] Error en la solicitud a la API: ${apiError.message}`);
      
      if (apiError.response) {
        console.error(`[proxy/backend/blogs] Status: ${apiError.response.status}, Datos:`, 
          typeof apiError.response.data === 'object' ? JSON.stringify(apiError.response.data).substring(0, 200) : apiError.response.data);
      }
      
      // Enviar datos de muestra en caso de error
      return res.status(200).json(sampleBlogs);
    }
  } catch (generalError) {
    console.error(`[proxy/backend/blogs] Error general: ${generalError.message}`);
    
    // Siempre devolver una respuesta válida
    return res.status(200).json(sampleBlogs);
  }
} 