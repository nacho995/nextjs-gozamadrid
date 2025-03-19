import { NextResponse } from 'next/server';

export async function GET(req) {
  // Información diagnóstica
  const timestamp = new Date().toISOString();
  
  const diagnosticInfo = {
    timestamp,
    message: 'API de prueba para diagnóstico de rutas y configuración',
    requestInfo: {
      url: req.url,
      method: req.method,
      headers: Object.fromEntries(req.headers)
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      WC_API_URL: process.env.WC_API_URL ? 'Configurado' : 'No configurado',
      WOO_COMMERCE_KEY: process.env.WOO_COMMERCE_KEY ? 'Configurado' : 'No configurado',
      WOO_COMMERCE_SECRET: process.env.WOO_COMMERCE_SECRET ? 'Configurado' : 'No configurado'
    },
    routes: {
      proxy: {
        path: '/api/proxy',
        description: 'Proxy genérico para servicios externos'
      },
      woocommerceProxy: {
        path: '/api/woocommerce-proxy',
        description: 'Proxy específico para WooCommerce'
      }
    },
    status: 'OK'
  };
  
  return new Response(JSON.stringify(diagnosticInfo, null, 2), {
    status: 200,
    headers: {
      'Content-Type': 'application/json'
    }
  });
}

export default function handler(req, res) {
  // Información diagnóstica
  const timestamp = new Date().toISOString();
  
  const diagnosticInfo = {
    timestamp,
    message: 'API de prueba para diagnóstico de rutas y configuración',
    requestInfo: {
      url: req.url,
      method: req.method,
      headers: req.headers
    },
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      WC_API_URL: process.env.WC_API_URL ? 'Configurado' : 'No configurado',
      WOO_COMMERCE_KEY: process.env.WOO_COMMERCE_KEY ? 'Configurado' : 'No configurado',
      WOO_COMMERCE_SECRET: process.env.WOO_COMMERCE_SECRET ? 'Configurado' : 'No configurado'
    },
    routes: {
      proxy: {
        path: '/api/proxy',
        description: 'Proxy genérico para servicios externos'
      },
      woocommerceProxy: {
        path: '/api/woocommerce-proxy',
        description: 'Proxy específico para WooCommerce'
      }
    },
    status: 'OK'
  };
  
  res.status(200).json(diagnosticInfo);
} 