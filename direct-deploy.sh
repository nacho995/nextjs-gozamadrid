#!/bin/bash

# Script de despliegue directo para Cloudflare Pages sin Worker
# Este script intenta un enfoque minimalista para el despliegue

echo "📦 Iniciando despliegue directo a Cloudflare Pages..."

# Verificar si Wrangler está instalado
if ! command -v wrangler &> /dev/null; then
  echo "❌ Wrangler no está instalado. Por favor, instálalo con: npm install -g wrangler"
  exit 1
fi

# Verificar si existe la carpeta out
if [ ! -d "out" ]; then
  echo "⚠️ No se encontró la carpeta 'out'. Por favor, ejecuta 'npm run build' primero."
  exit 1
fi

# Crear una copia temporal sin el worker
echo "🔄 Creando una copia temporal para el despliegue..."
mkdir -p temp_deploy
cp -r out/* temp_deploy/

# Eliminar el worker de la copia temporal
if [ -f "temp_deploy/_worker.js" ]; then
  echo "🔄 Eliminando _worker.js para un despliegue simplificado..."
  rm temp_deploy/_worker.js
fi

# Asegurarnos de que los archivos JS tengan el tipo MIME correcto
echo "🔧 Optimizando archivos JavaScript..."
find temp_deploy -name "*.js" -type f -exec sh -c 'echo "/* Content-Type: application/javascript */" > "$1.tmp" && cat "$1" >> "$1.tmp" && mv "$1.tmp" "$1"' _ {} \;

# Intenta el despliegue con la opción más simple
echo "🚀 Intentando despliegue directo..."
wrangler pages deploy temp_deploy --project-name=gozamadrid-frontend-new --branch=production --commit-dirty=true

RESULT=$?

# Limpiar la carpeta temporal
echo "🧹 Limpiando archivos temporales..."
rm -rf temp_deploy

if [ $RESULT -ne 0 ]; then
  echo "❌ Error al desplegar a Cloudflare Pages."
  echo "⚠️ Recomendación: Usa el despliegue manual desde el panel de Cloudflare:"
  echo "1. Accede a https://dash.cloudflare.com/"
  echo "2. Navega a Pages en el menú lateral"
  echo "3. Selecciona tu proyecto 'gozamadrid-frontend-new'"
  echo "4. Haz clic en 'Deploy' y luego 'Upload assets'"
  echo "5. Sube todos los archivos de la carpeta 'out'"
  exit 1
fi

echo "✅ ¡Despliegue completado con éxito!"
echo "🔗 Puedes acceder a tu sitio en: https://gozamadrid-frontend-new.pages.dev"

exit 0 