/**
 * Endpoint de diagnóstico para la API de WordPress
 */
export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  const WORDPRESS_API_URL = process.env.NEXT_PUBLIC_WP_API_URL || 'https://wordpress.realestategozamadrid.com/wp-json/wp/v2';
  
  const diagnosticResults = {
    timestamp: new Date().toISOString(),
    wordpress_url: WORDPRESS_API_URL,
    tests: {}
  };

  // Test 1: Verificar conectividad básica
  try {
    console.log(`[WordPress Diagnostic] Probando conectividad a: ${WORDPRESS_API_URL}`);
    
    const response = await fetch(WORDPRESS_API_URL, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Diagnostic/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });

    diagnosticResults.tests.connectivity = {
      status: response.ok ? 'success' : 'error',
      http_status: response.status,
      response_time: Date.now(),
      url_tested: WORDPRESS_API_URL
    };

    if (response.ok) {
      const data = await response.json();
      diagnosticResults.tests.connectivity.api_info = {
        name: data.name,
        description: data.description,
        url: data.url,
        home: data.home,
        gmt_offset: data.gmt_offset,
        timezone_string: data.timezone_string
      };
    }
  } catch (error) {
    diagnosticResults.tests.connectivity = {
      status: 'error',
      error: error.message,
      url_tested: WORDPRESS_API_URL
    };
  }

  // Test 2: Verificar endpoint de posts
  try {
    const postsUrl = `${WORDPRESS_API_URL}/posts?per_page=1`;
    console.log(`[WordPress Diagnostic] Probando endpoint de posts: ${postsUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(postsUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Diagnostic/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    diagnosticResults.tests.posts_endpoint = {
      status: response.ok ? 'success' : 'error',
      http_status: response.status,
      response_time_ms: responseTime,
      url_tested: postsUrl
    };

    if (response.ok) {
      const posts = await response.json();
      diagnosticResults.tests.posts_endpoint.posts_found = Array.isArray(posts) ? posts.length : 0;
      diagnosticResults.tests.posts_endpoint.sample_post = posts[0] ? {
        id: posts[0].id,
        title: posts[0].title?.rendered || 'Sin título',
        date: posts[0].date,
        slug: posts[0].slug,
        has_featured_media: !!posts[0].featured_media
      } : null;
    }
  } catch (error) {
    diagnosticResults.tests.posts_endpoint = {
      status: 'error',
      error: error.message,
      url_tested: `${WORDPRESS_API_URL}/posts?per_page=1`
    };
  }

  // Test 3: Verificar endpoint con _embed
  try {
    const embedUrl = `${WORDPRESS_API_URL}/posts?per_page=1&_embed=true`;
    console.log(`[WordPress Diagnostic] Probando endpoint con _embed: ${embedUrl}`);
    
    const startTime = Date.now();
    const response = await fetch(embedUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'GozaMadrid-Diagnostic/1.0'
      },
      signal: AbortSignal.timeout(10000)
    });
    const endTime = Date.now();

    const responseTime = endTime - startTime;

    diagnosticResults.tests.embed_endpoint = {
      status: response.ok ? 'success' : 'error',
      http_status: response.status,
      response_time_ms: responseTime,
      url_tested: embedUrl
    };

    if (response.ok) {
      const posts = await response.json();
      diagnosticResults.tests.embed_endpoint.posts_found = Array.isArray(posts) ? posts.length : 0;
      diagnosticResults.tests.embed_endpoint.sample_embedded = posts[0] ? {
        has_embedded: !!posts[0]._embedded,
        has_featured_media: !!(posts[0]._embedded && posts[0]._embedded['wp:featuredmedia']),
        featured_media_url: posts[0]._embedded && posts[0]._embedded['wp:featuredmedia'] && posts[0]._embedded['wp:featuredmedia'][0] 
          ? posts[0]._embedded['wp:featuredmedia'][0].source_url 
          : null
      } : null;
    }
  } catch (error) {
    diagnosticResults.tests.embed_endpoint = {
      status: 'error',
      error: error.message,
      url_tested: `${WORDPRESS_API_URL}/posts?per_page=1&_embed=true`
    };
  }

  // Calcular estado general
  const allTests = Object.values(diagnosticResults.tests);
  const successfulTests = allTests.filter(test => test.status === 'success').length;
  const totalTests = allTests.length;

  diagnosticResults.summary = {
    overall_status: successfulTests === totalTests ? 'healthy' : successfulTests > 0 ? 'partial' : 'failed',
    successful_tests: successfulTests,
    total_tests: totalTests,
    health_percentage: Math.round((successfulTests / totalTests) * 100)
  };

  // Configurar headers de respuesta
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  return res.status(200).json(diagnosticResults);
} 