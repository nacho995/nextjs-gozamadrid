#!/bin/bash

# Script para crear un despliegue completo para Cloudflare Pages
# Este script incluye todos los archivos necesarios para que funcione correctamente tu aplicación Next.js

# Colores para una mejor visualización
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función para mostrar mensajes
function show_message() {
  echo -e "${BLUE}[INFO]${NC} $1"
}

# Función para mostrar éxito
function show_success() {
  echo -e "${GREEN}[ÉXITO]${NC} $1"
}

# Función para mostrar advertencia
function show_warning() {
  echo -e "${YELLOW}[ADVERTENCIA]${NC} $1"
}

# Función para mostrar error
function show_error() {
  echo -e "${RED}[ERROR]${NC} $1"
}

show_message "Preparando un despliegue completo para tu aplicación Next.js..."

# Verificar que existe el directorio out
if [ ! -d "out" ]; then
  show_error "El directorio 'out' no existe. Ejecuta 'npm run build && npm run export' primero."
  exit 1
fi

# Crear directorio temporal
show_message "Creando directorio temporal..."
TEMP_DIR="cloudflare_deploy_$(date +%Y%m%d%H%M%S)"
mkdir -p "$TEMP_DIR"

# Copiar todos los archivos del directorio out
show_message "Copiando todos los archivos de la carpeta 'out'..."
cp -r out/* "$TEMP_DIR/"

# Verificar la existencia de archivos críticos
if [ ! -f "$TEMP_DIR/index.html" ]; then
  show_error "No se encontró el archivo index.html en el directorio 'out'."
  exit 1
fi

# Verificar y optimizar _worker.js 
if [ -f "$TEMP_DIR/_worker.js" ]; then
  show_message "Optimizando _worker.js..."
  # Asegurar que tenga el content-type correcto
  if ! grep -q "Content-Type: application/javascript" "$TEMP_DIR/_worker.js"; then
    sed -i '1i/* Content-Type: application/javascript */' "$TEMP_DIR/_worker.js"
  fi
fi

# Verificar y optimizar archivos JS para el MIME type correcto
show_message "Optimizando archivos JavaScript..."
find "$TEMP_DIR" -name "*.js" -not -path "*/_worker.js" | while read -r file; do
  if ! grep -q "Content-Type: application/javascript" "$file"; then
    sed -i '1i/* Content-Type: application/javascript */' "$file"
  fi
done

# Asegurar que _routes.json esté correctamente configurado
if [ -f "$TEMP_DIR/_routes.json" ]; then
  show_message "Verificando _routes.json..."
else
  show_message "Creando _routes.json básico..."
  cat > "$TEMP_DIR/_routes.json" << EOL
{
  "version": 1,
  "include": ["/*"],
  "exclude": [],
  "routes": [
    {
      "src": "/",
      "dest": "/index.html"
    },
    {
      "src": "/vender-comprar",
      "dest": "/vender-comprar.html"
    },
    {
      "src": "/api/:path*",
      "dest": "/api/:path*"
    },
    {
      "src": ".*",
      "dest": "/index.html"
    }
  ]
}
EOL
fi

# Asegurar que _redirects esté configurado para SPA
if [ -f "$TEMP_DIR/_redirects" ]; then
  show_message "Verificando _redirects..."
  if ! grep -q "/*    /index.html   200" "$TEMP_DIR/_redirects"; then
    echo "/*    /index.html   200" >> "$TEMP_DIR/_redirects"
  fi
else
  show_message "Creando _redirects para SPA..."
  echo "/*    /index.html   200" > "$TEMP_DIR/_redirects"
fi

# Crear ZIP
show_message "Creando archivo ZIP..."
ZIP_NAME="nextjs-gozamadrid-$(date +%Y%m%d%H%M%S).zip"
(cd "$TEMP_DIR" && zip -r "../$ZIP_NAME" *)

if [ $? -ne 0 ]; then
  show_error "Error al crear el archivo ZIP."
  rm -rf "$TEMP_DIR"
  exit 1
fi

# Limpiar
show_message "Limpiando archivos temporales..."
rm -rf "$TEMP_DIR"

show_success "¡Archivo ZIP creado con éxito!"
show_message "El archivo '$ZIP_NAME' está listo para subir a Cloudflare Pages."
show_message "Este ZIP contiene todos los archivos necesarios para que tu aplicación Next.js"
show_message "funcione correctamente, incluyendo _worker.js, _routes.json y las redirecciones adecuadas."

show_message "Pasos para desplegar manualmente:"
echo "1. Accede a https://dash.cloudflare.com/"
echo "2. Navega a Pages en el menú lateral"
echo "3. Selecciona tu proyecto 'gozamadrid-frontend-new'"
echo "4. Haz clic en 'Deploy' y luego 'Upload Assets'"
echo "5. Sube el archivo '$ZIP_NAME'"
echo "6. Una vez completado el despliegue, accede a tu sitio en:"
echo "   - https://gozamadrid-frontend-new.pages.dev/"
echo "   - O en tu dominio personalizado si lo tienes configurado"

exit 0 