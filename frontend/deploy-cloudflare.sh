#!/bin/bash

# Script para desplegar en Cloudflare Pages
set -e

echo "🚀 Preparando el despliegue en Cloudflare Pages..."

# Verificar que Wrangler está instalado
if ! command -v wrangler &> /dev/null
then
    echo "❌ Wrangler no está instalado. Instalando..."
    npm install -g wrangler
fi

# Verificar login en Cloudflare
echo "🔑 Verificando credenciales de Cloudflare..."
wrangler whoami || wrangler login

# Nombre del proyecto en Cloudflare Pages
PROJECT_NAME="gozamadrid-frontend-new"

# Copiar archivos necesarios
echo "📁 Copiando archivos de configuración..."
mkdir -p .cloudflare
cp -f public/.well-known/cloudflare-pages.json .cloudflare/
cp -rf functions/ .cloudflare/

# Construir el proyecto si no se ha hecho ya
if [ ! -d "out" ]; then
    echo "🔨 Construyendo el proyecto..."
    npm run build
fi

# Desplegar en Cloudflare Pages
echo "☁️ Desplegando en Cloudflare Pages..."
wrangler pages deploy out --project-name=$PROJECT_NAME --commit-dirty=true

# Copiar las funciones a Cloudflare Pages
echo "⚙️ Configurando funciones en Cloudflare Pages..."
wrangler pages deployment tail --project-name=$PROJECT_NAME

echo "✅ Despliegue completado. Visita https://$PROJECT_NAME.pages.dev para ver tu aplicación." 