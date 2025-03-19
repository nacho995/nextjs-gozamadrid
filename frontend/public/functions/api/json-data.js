// Cloudflare Function para manejar solicitudes de archivos JSON estáticos
import { handleCors, applyCorsHeaders } from './cors-middleware';

export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);
  const path = url.pathname;
  const searchParams = url.searchParams;
  
  // Manejar CORS preflight
  const corsResponse = handleCors(request);
  if (corsResponse) return corsResponse;
  
  console.log(`Solicitud de JSON recibida para: ${path}`);
  
  // Extraer el nombre de la página solicitada
  let pageName = '';
  
  // Si recibimos page como parámetro de consulta, usarlo
  if (searchParams.has('page')) {
    pageName = `/${searchParams.get('page')}`;
  } else {
    // Si es una solicitud tipo _next/data
    if (path.includes('/_next/data/')) {
      // Extraer el nombre de la página desde la URL
      const matches = path.match(/\/_next\/data\/[^\/]+\/([^\/]+)\.json$/);
      if (matches && matches[1]) {
        pageName = `/${matches[1]}`;
      }
      
      // Verificar si hay una subcarpeta
      const subfolderMatches = path.match(/\/_next\/data\/[^\/]+\/([^\/]+)\/([^\/]+)\.json$/);
      if (subfolderMatches && subfolderMatches[1] && subfolderMatches[2]) {
        pageName = `/${subfolderMatches[1]}/${subfolderMatches[2]}`;
      }
    }
    
    // Si es una solicitud directa de JSON
    if (path.endsWith('.json') && !path.includes('/_next/data/')) {
      pageName = path.replace(/\.json$/, '');
    }
  }
  
  console.log(`Página solicitada: ${pageName}`);
  
  // Crear un objeto de datos según la página solicitada
  let responseData = {
    pageProps: {
      __N_SSG: true
    }
  };
  
  // Extraer id si existe como parámetro de consulta
  const pageId = searchParams.get('id') || '';
  if (pageId) {
    console.log(`ID de página: ${pageId}`);
    responseData.pageProps.pageId = pageId;
  }
  
  // Configurar datos específicos según la página
  switch (pageName) {
    case '/vender':
      responseData.pageProps.pageData = {
        title: "Vender Propiedad",
        description: "Información para vender su propiedad"
      };
      break;
    case '/servicios':
      responseData.pageProps.pageData = {
        title: "Servicios Inmobiliarios",
        description: "Nuestros servicios inmobiliarios"
      };
      break;
    case '/reformas':
      responseData.pageProps.pageData = {
        title: "Reformas",
        description: "Servicios de reformas"
      };
      break;
    case '/contacto':
      responseData.pageProps.pageData = {
        title: "Contacto",
        description: "Contacta con nosotros"
      };
      break;
    case '/blog':
      responseData.pageProps.pageData = {
        title: "Blog",
        description: "Artículos del blog",
        blogId: pageId
      };
      break;
    case '/exp-realty':
      responseData.pageProps.pageData = {
        title: "EXP Realty",
        description: "Información sobre EXP Realty"
      };
      break;
    case '/vender/comprar':
      responseData.pageProps.pageData = {
        title: "Comprar Propiedad",
        description: "Información para comprar su propiedad"
      };
      break;
    case '/comprar':
      responseData.pageProps.pageData = {
        title: "Comprar Propiedad",
        description: "Información para comprar su propiedad"
      };
      break;
    case '/property':
      responseData.pageProps.pageData = {
        title: "Detalles de Propiedad",
        description: "Información detallada de la propiedad",
        propertyId: pageId
      };
      break;
    default:
      // Extraer nombre simple de la URL para páginas genéricas
      const simpleName = pageName.replace(/^\//, '').replace(/\//g, '-');
      responseData.pageProps.pageData = {
        title: simpleName.charAt(0).toUpperCase() + simpleName.slice(1),
        description: `Contenido de la página ${simpleName}`
      };
  }
  
  // Crear la respuesta JSON
  const jsonResponse = JSON.stringify(responseData);
  
  // Crear los headers con los encabezados CORS
  const headers = applyCorsHeaders({
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=300'
  }, request);
  
  // Devolver la respuesta
  return new Response(jsonResponse, {
    headers: headers
  });
} 