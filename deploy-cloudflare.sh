#!/bin/bash
# Script de despliegue para Cloudflare Pages
# Este script prepara y despliega el sitio estático de Next.js a Cloudflare Pages

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

# Verificar si Wrangler está instalado
if ! command -v wrangler &> /dev/null; then
  show_error "Wrangler no está instalado. Por favor, instálalo con: npm install -g wrangler"
  exit 1
fi

# Verificar que estamos en el directorio correcto
if [ ! -f "wrangler.toml" ]; then
  show_error "No se encontró el archivo wrangler.toml. Asegúrate de estar en el directorio raíz del proyecto."
  exit 1
fi

show_message "Iniciando despliegue a Cloudflare Pages..."

# Verificar si existe la carpeta out
if [ ! -d "out" ]; then
  show_warning "No se encontró la carpeta 'out'. Se compilará el proyecto..."
  
  show_message "Compilando proyecto Next.js..."
  npm run build
  
  if [ $? -ne 0 ]; then
    show_error "Error al compilar el proyecto."
    exit 1
  fi
  
  show_success "Proyecto compilado correctamente."
else
  show_message "Se utilizará la carpeta 'out' existente."
fi

# Verificar archivos clave
if [ ! -f "out/_worker.js" ]; then
  show_warning "No se encontró _worker.js en la carpeta 'out'. Asegúrate de que existe este archivo."
fi

if [ ! -f "out/_headers" ]; then
  show_warning "No se encontró _headers en la carpeta 'out'. Se creará uno básico."
  echo "/*
  Content-Type: text/html; charset=utf-8" > out/_headers
fi

if [ ! -f "out/_routes.json" ]; then
  show_warning "No se encontró _routes.json en la carpeta 'out'. Se creará uno básico."
  echo '{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}' > out/_routes.json
fi

# Verificar archivos de corrección
if [ ! -d "out/fixes" ]; then
  show_warning "No se encontró la carpeta 'fixes'. Creándola..."
  mkdir -p out/fixes
fi

# Verificar script de diagnóstico
if [ ! -f "out/diagnosis.js" ]; then
  show_warning "No se encontró el script de diagnóstico. Verifica manualmente su existencia."
fi

# Optimizar archivos estáticos
show_message "Optimizando archivos para el despliegue..."

# Asegurarnos de que los archivos JS tengan el tipo MIME correcto
find out -name "*.js" -type f -exec sh -c 'echo "/* Content-Type: application/javascript */" > "$1.tmp" && cat "$1" >> "$1.tmp" && mv "$1.tmp" "$1"' _ {} \;

show_success "Archivos optimizados correctamente."

# Mensaje para alertar al usuario
show_message "¡IMPORTANTE! Debido a limitaciones en Cloudflare, vamos a usar el comando de despliegue actualizado."
show_message "Si el comando falla, considera usar la opción de despliegue directo desde el dashboard de Cloudflare."

# Desplegar a Cloudflare Pages con el nuevo comando recomendado
show_message "Desplegando a Cloudflare Pages..."
wrangler pages deploy out --project-name=gozamadrid-frontend-new --branch=production --commit-dirty=true

if [ $? -ne 0 ]; then
  show_error "Error al desplegar a Cloudflare Pages usando Wrangler."
  show_warning "Recomendación: Usa el despliegue manual desde el panel de Cloudflare."
  show_message "Pasos para desplegar manualmente:"
  echo "1. Accede a https://dash.cloudflare.com/"
  echo "2. Navega a Pages en el menú lateral"
  echo "3. Selecciona tu proyecto 'gozamadrid-frontend-new'"
  echo "4. Haz clic en 'Upload' o 'Deploy'"
  echo "5. Sube todos los archivos de la carpeta 'out'"
  exit 1
fi

show_success "¡Despliegue completado con éxito!"
show_message "Puedes acceder a la configuración de tu sitio en: https://dash.cloudflare.com/"

# Verificar si hay variables de entorno que establecer
show_message "Recuerda configurar las siguientes variables de entorno en el panel de Cloudflare Pages si es necesario:"
echo "- MONGODB_URI"
echo "- WOO_COMMERCE_KEY"
echo "- WOO_COMMERCE_SECRET"

show_message "Para verificar que todo funciona correctamente, accede al sitio y mira el panel de diagnóstico que aparecerá en la esquina inferior derecha."

exit 0 