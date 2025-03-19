#!/bin/bash

# Script para exportar y desplegar correctamente el proyecto Next.js desde el código fuente
# Este script corrije el problema específico de este proyecto con Cloudflare Pages

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

show_message "Preparando el despliegue de tu aplicación Next.js desde el código fuente..."

# Verificar que estamos en el directorio raíz del proyecto
if [ ! -d "frontend" ]; then
  show_error "Este script debe ejecutarse desde el directorio raíz del proyecto donde está la carpeta 'frontend'."
  exit 1
fi

# Crear directorio temporal para el despliegue
show_message "Creando directorio temporal para el despliegue..."
DEPLOY_DIR="cloudflare_deploy_$(date +%Y%m%d%H%M%S)"
mkdir -p "$DEPLOY_DIR"

# Paso 1: Entrar al directorio frontend y construir el proyecto
show_message "Construyendo el proyecto Next.js..."
cd frontend

# Verificar que existe el script de exportación en package.json
if ! grep -q '"export"' package.json; then
  show_error "No se encontró el script 'export' en package.json. Verifica la configuración."
  exit 1
fi

# Construir el proyecto y recopilar errores
BUILD_OUTPUT=$(npm run build 2>&1)
BUILD_RESULT=$?

if [ $BUILD_RESULT -ne 0 ]; then
  show_error "Error al construir el proyecto:"
  echo "$BUILD_OUTPUT"
  exit 1
fi

show_success "Proyecto construido exitosamente."

# Paso 2: Exportar el proyecto a modo estático
show_message "Exportando el proyecto a archivos estáticos..."

# Crear directorio cloudflare-deploy en el directorio principal
mkdir -p "../cloudflare-deploy"

# Modificar temporalmente el script copy-to-cloudflare.js para evitar errores
if [ -f "scripts/copy-to-cloudflare.js" ]; then
  show_message "Ajustando script de copia para el despliegue..."
  cp scripts/copy-to-cloudflare.js scripts/copy-to-cloudflare.js.backup
  
  # Explicación: Aseguramos que el directorio de destino existe y es accesible
  sed -i 's|const targetDir = path.resolve(__dirname, .*/cloudflare-deploy.*);|const targetDir = path.resolve(__dirname, "../../'"$DEPLOY_DIR"'");|' scripts/copy-to-cloudflare.js
fi

# Ejecutar el comando de exportación
EXPORT_OUTPUT=$(NEXT_EXPORT=true next build 2>&1)
EXPORT_RESULT=$?

# Restaurar el script original
if [ -f "scripts/copy-to-cloudflare.js.backup" ]; then
  mv scripts/copy-to-cloudflare.js.backup scripts/copy-to-cloudflare.js
fi

if [ $EXPORT_RESULT -ne 0 ]; then
  show_error "Error al exportar el proyecto:"
  echo "$EXPORT_OUTPUT"
  exit 1
fi

cd ..

# Paso 3: Copiar los archivos necesarios de out a nuestro directorio de despliegue
show_message "Copiando archivos de exportación a directorio de despliegue..."

# Copiar contenido del directorio out
if [ -d "frontend/out" ]; then
  cp -r frontend/out/* "$DEPLOY_DIR/"
else
  show_error "No se encontró el directorio 'out' después de la exportación."
  exit 1
fi

# Verificar que hay archivos en nuestro directorio de despliegue
if [ ! "$(ls -A "$DEPLOY_DIR")" ]; then
  show_error "El directorio de despliegue está vacío. La exportación no generó archivos."
  exit 1
fi

# Crear index.html si no existe
if [ ! -f "$DEPLOY_DIR/index.html" ]; then
  show_warning "No se encontró index.html - Creando uno basado en vender-comprar.html"
  if [ -f "$DEPLOY_DIR/vender-comprar.html" ]; then
    cp "$DEPLOY_DIR/vender-comprar.html" "$DEPLOY_DIR/index.html"
  else
    show_error "No se encontró vender-comprar.html para usar como base."
    exit 1
  fi
fi

# Paso 4: Asegurar que están todos los archivos y configuraciones necesarias
show_message "Verificando archivos y configuraciones críticas..."

# Asegurar que _routes.json está correctamente configurado
if [ ! -f "$DEPLOY_DIR/_routes.json" ]; then
  show_message "Creando _routes.json básico..."
  cat > "$DEPLOY_DIR/_routes.json" << EOL
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
      "src": "/property/:id",
      "dest": "/index.html"
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

# Asegurar que _redirects está configurado para SPA
if [ ! -f "$DEPLOY_DIR/_redirects" ]; then
  show_message "Creando _redirects para SPA..."
  echo "/*    /index.html   200" > "$DEPLOY_DIR/_redirects"
else
  # Verificar que tiene la regla para SPA
  if ! grep -q "/*    /index.html   200" "$DEPLOY_DIR/_redirects"; then
    echo "/*    /index.html   200" >> "$DEPLOY_DIR/_redirects"
  fi
fi

# Paso 5: Crear archivo ZIP para despliegue
show_message "Creando archivo ZIP para despliegue..."
ZIP_NAME="nextjs-gozamadrid-complete-$(date +%Y%m%d%H%M%S).zip"
(cd "$DEPLOY_DIR" && zip -r "../$ZIP_NAME" *)

if [ $? -ne 0 ]; then
  show_error "Error al crear el archivo ZIP."
  rm -rf "$DEPLOY_DIR"
  exit 1
fi

# Limpiar
show_message "Limpiando archivos temporales..."
rm -rf "$DEPLOY_DIR"
rm -rf "cloudflare-deploy" 2>/dev/null

show_success "¡Archivo ZIP creado con éxito!"
show_message "El archivo '$ZIP_NAME' está listo para subir a Cloudflare Pages."
show_message "Este archivo contiene una versión optimizada de tu aplicación Next.js"
show_message "con todos los archivos necesarios para funcionar correctamente en Cloudflare Pages."

show_message "Pasos para desplegar manualmente:"
echo "1. Accede a https://dash.cloudflare.com/"
echo "2. Navega a Pages en el menú lateral"
echo "3. Selecciona tu proyecto 'gozamadrid-frontend-new'"
echo "4. Haz clic en 'Deploy' y luego 'Upload Assets'"
echo "5. Sube el archivo '$ZIP_NAME'"
echo "6. Una vez completado el despliegue, accede a tu sitio en:"
echo "   - https://gozamadrid-frontend-new.pages.dev/"

exit 0 