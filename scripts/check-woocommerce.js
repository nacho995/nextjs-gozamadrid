#!/usr/bin/env node

/**
 * Script de diagnóstico para WooCommerce
 * 
 * Este script verifica si las credenciales de WooCommerce están configuradas correctamente
 * y si los endpoints están disponibles.
 * 
 * Uso:
 * 1. Con npm: npm run check-woocommerce
 * 2. Directamente: node scripts/check-woocommerce.js
 */

require('dotenv').config();
const fetch = require('node-fetch');
const { URL } = require('url');

// Constantes
const WC_API_URL = process.env.NEXT_PUBLIC_WC_API_URL || 'https://wordpress-1430059-5339263.cloudwaysapps.com/wp-json/wc/v3';
const WOO_COMMERCE_KEY = process.env.NEXT_PUBLIC_WOO_COMMERCE_KEY || process.env.WOO_COMMERCE_KEY;
const WOO_COMMERCE_SECRET = process.env.NEXT_PUBLIC_WOO_COMMERCE_SECRET || process.env.WOO_COMMERCE_SECRET;

// Función para construir una URL con autenticación
const buildUrl = (endpoint, params = {}) => {
  const url = new URL(`${WC_API_URL}${endpoint}`);
  
  // Añadir credenciales
  url.searchParams.append('consumer_key', WOO_COMMERCE_KEY);
  url.searchParams.append('consumer_secret', WOO_COMMERCE_SECRET);
  
  // Añadir parámetros adicionales
  Object.entries(params).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });
  
  return url.toString();
};

// Función para verificar un endpoint
async function checkEndpoint(name, url) {
  console.log(`\n🔍 Verificando endpoint: ${name}`);
  console.log(`URL: ${url.replace(/consumer_key=([^&]+)/, 'consumer_key=HIDDEN')
                      .replace(/consumer_secret=([^&]+)/, 'consumer_secret=HIDDEN')}`);
  
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`Estado: ${response.status} ${response.statusText}`);
    
    if (response.ok) {
      const data = await response.json();
      console.log(`✅ Endpoint disponible`);
      
      if (Array.isArray(data)) {
        console.log(`📊 Encontrados ${data.length} elementos`);
        if (data.length > 0) {
          console.log(`🔎 Primer elemento: id=${data[0].id}, name=${data[0].name || 'N/A'}`);
        }
      } else if (data && typeof data === 'object') {
        console.log(`📊 Datos recibidos: id=${data.id || 'N/A'}, name=${data.name || 'N/A'}`);
      }
      
      return true;
    } else {
      const errorText = await response.text();
      console.error(`❌ Error: ${response.status} ${response.statusText}`);
      console.error(`Detalles: ${errorText.substring(0, 150)}...`);
      return false;
    }
  } catch (error) {
    console.error(`❌ Error de conexión: ${error.message}`);
    return false;
  }
}

// Función principal
async function main() {
  console.log('🔐 Verificación de Credenciales de WooCommerce');
  console.log('===========================================');
  
  // Verificar credenciales
  if (!WOO_COMMERCE_KEY || !WOO_COMMERCE_SECRET) {
    console.error('❌ ERROR: Faltan credenciales de WooCommerce');
    console.log(`Key: ${WOO_COMMERCE_KEY ? 'Configurada' : 'NO CONFIGURADA'}`);
    console.log(`Secret: ${WOO_COMMERCE_SECRET ? 'Configurada' : 'NO CONFIGURADA'}`);
    process.exit(1);
  }
  
  console.log(`✅ Credenciales: Configuradas`);
  console.log(`🌐 API URL: ${WC_API_URL}`);
  
  // Verificar conexión a la API
  console.log('\n🌐 Verificando conexión a la API de WooCommerce');
  
  // 1. Probar endpoint de productos
  await checkEndpoint('Productos', buildUrl('/products', { per_page: 2 }));
  
  // 2. Probar endpoint de producto específico (ID 3945)
  await checkEndpoint('Producto Específico (ID 3945)', buildUrl('/products/3945'));
  
  // 3. Probar endpoint de categorías
  await checkEndpoint('Categorías', buildUrl('/products/categories', { per_page: 5 }));
  
  console.log('\n✅ Verificación completada');
}

// Ejecutar el script
main().catch(error => {
  console.error(`\n❌ Error general: ${error.message}`);
  process.exit(1);
}); 