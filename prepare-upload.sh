#!/bin/bash

# Script para preparar un archivo ZIP optimizado para subir a Cloudflare Pages
# Este script genera un ZIP con los archivos del sitio, listo para subir manualmente

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

show_message "Preparando paquete para subir a Cloudflare Pages..."

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
if [ ! -f "out/index.html" ]; then
  show_warning "No se encontró index.html en la carpeta 'out'. Se copiará vender-comprar.html como index.html."
  cp out/vender-comprar.html out/index.html
fi

# Optimizar archivos estáticos
show_message "Optimizando archivos para la subida..."

# Asegurarnos de que los archivos JS tengan el tipo MIME correcto
find out -name "*.js" -type f -exec sh -c 'echo "/* Content-Type: application/javascript */" > "$1.tmp" && cat "$1" >> "$1.tmp" && mv "$1.tmp" "$1"' _ {} \;

# Preguntar sobre _routes.json
echo ""
echo -e "${YELLOW}NOTA:${NC} Cloudflare marca _routes.json como una característica experimental."
echo "¿Deseas incluir _routes.json en tu despliegue?"
echo "1) Sí, incluir _routes.json (recomendado pero aparecerá la advertencia)"
echo "2) No, usar solo _redirects (sin advertencia pero menos flexible)"

USE_ROUTES_JSON=1
read -p "Selecciona una opción [1/2] (default: 1): " choice
choice=${choice:-1}

if [ "$choice" == "1" ]; then
  show_message "Configurando _routes.json..."
  # Simplificar el archivo _routes.json para evitar problemas
  echo '{
  "version": 1,
  "include": ["/*"],
  "exclude": ["/fixes/*", "/functions/*", "/img/*", "/icons/*"],
  "routes": [
    { "src": "/", "dest": "/index.html" },
    { "src": "/vender-comprar", "dest": "/vender-comprar.html" },
    { "src": "/property/:id", "dest": "/index.html" },
    { "src": "/api/:path*", "dest": "/api/:path*" },
    { "src": ".*", "dest": "/index.html" }
  ]
}' > out/_routes.json
else
  # Si existe _routes.json, lo eliminamos
  if [ -f "out/_routes.json" ]; then
    show_message "Eliminando _routes.json existente..."
    rm out/_routes.json
  fi
  USE_ROUTES_JSON=0
fi

# Configurar _redirects para ambos casos
show_message "Configurando _redirects..."
echo "# IMPORTANTE: Redirecciones para rutas de aplicación

# Asegurar que las rutas de Next.js funcionen correctamente
/*    /index.html   200
/api/* /api/:splat 200
/*.js /index.html 200
/*.png /index.html 200
/*.jpg /index.html 200
/*.html /index.html 200
/vender-comprar/* /vender-comprar.html 200
/property/* /index.html 200" > out/_redirects

show_success "Archivos optimizados correctamente."

# Crear el archivo ZIP
TIMESTAMP=$(date +"%Y%m%d%H%M%S")
if [ $USE_ROUTES_JSON -eq 1 ]; then
  ZIP_NAME="gozamadrid-frontend-routes-$TIMESTAMP.zip"
else
  ZIP_NAME="gozamadrid-frontend-$TIMESTAMP.zip"
fi

show_message "Creando archivo ZIP: $ZIP_NAME..."
cd out && zip -r "../$ZIP_NAME" * && cd ..

if [ $? -ne 0 ]; then
  show_error "Error al crear el archivo ZIP."
  exit 1
fi

show_success "¡Archivo ZIP creado con éxito!"
show_message "El archivo está listo para subir manualmente a Cloudflare Pages."
if [ $USE_ROUTES_JSON -eq 1 ]; then
  show_warning "Recuerda que verás una advertencia sobre '_routes.json' siendo experimental al desplegar."
  show_warning "Esta advertencia es normal y no afecta la funcionalidad del sitio."
fi
show_message "Pasos para desplegar manualmente:"
echo "1. Accede a https://dash.cloudflare.com/"
echo "2. Navega a Pages en el menú lateral"
echo "3. Selecciona tu proyecto 'gozamadrid-frontend-new'"
echo "4. Haz clic en 'Deploy' y luego 'Upload Assets'"
echo "5. Sube el archivo '$ZIP_NAME'"

exit 0 