#!/bin/bash

# Script para crear un despliegue extremadamente simplificado para Cloudflare Pages
# Este script genera un ZIP con lo mínimo necesario para hacer funcionar el sitio

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

show_message "Preparando un despliegue simplificado para resolver el error 404..."

# Crear directorio temporal
show_message "Creando directorio temporal..."
mkdir -p cloudflare_fix

# Crear un archivo index.html básico garantizado para funcionar
show_message "Creando archivo index.html básico..."
echo '<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Goza Madrid - Portal Inmobiliario</title>
  <style>
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
      margin: 0;
      padding: 0;
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 100vh;
      background: linear-gradient(rgba(0,0,0,0.7), rgba(0,0,0,0.4)), url("/gozamadridwp2.jpg");
      background-size: cover;
      background-attachment: fixed;
      color: white;
      text-align: center;
    }
    
    .content {
      max-width: 800px;
      padding: 2rem;
      background-color: rgba(0, 0, 0, 0.7);
      border-radius: 10px;
      backdrop-filter: blur(10px);
    }
    
    h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      color: #FFC107;
    }
    
    p {
      font-size: 1.2rem;
      margin-bottom: 1.5rem;
    }
    
    .buttons {
      display: flex;
      justify-content: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    
    .button {
      display: inline-block;
      padding: 0.8rem 1.5rem;
      background-color: #FFC107;
      color: black;
      text-decoration: none;
      border-radius: 5px;
      font-weight: bold;
      transition: background-color 0.3s;
    }
    
    .button:hover {
      background-color: #FFD54F;
    }
  </style>
</head>
<body>
  <div class="content">
    <h1>Goza Madrid - Portal Inmobiliario</h1>
    <p>Bienvenido a nuestro portal de propiedades exclusivas en Madrid.</p>
    <div class="buttons">
      <a href="/vender-comprar.html" class="button">Ver Propiedades</a>
      <a href="/api-test.html" class="button">Test API</a>
    </div>
  </div>
</body>
</html>' > cloudflare_fix/index.html

# Copiar archivos básicos desde el directorio 'out'
show_message "Copiando archivos esenciales..."

# Copiar vender-comprar.html
if [ -f "out/vender-comprar.html" ]; then
  cp out/vender-comprar.html cloudflare_fix/
else
  show_warning "No se encontró vender-comprar.html"
fi

# Copiar imágenes y recursos básicos
cp out/*.jpg cloudflare_fix/ 2>/dev/null || show_warning "No se encontraron imágenes .jpg"
cp out/*.png cloudflare_fix/ 2>/dev/null || show_warning "No se encontraron imágenes .png"
cp out/*.ico cloudflare_fix/ 2>/dev/null || show_warning "No se encontró favicon.ico"

# Copiar JavaScript esenciales
cp out/script-loader.js cloudflare_fix/ 2>/dev/null || show_warning "No se encontró script-loader.js"
cp out/mongodb-handler.js cloudflare_fix/ 2>/dev/null || show_warning "No se encontró mongodb-handler.js"
cp out/property-handler.js cloudflare_fix/ 2>/dev/null || show_warning "No se encontró property-handler.js"

# Crear _redirects simplificado
show_message "Creando archivo _redirects simplificado..."
echo "/*    /index.html   200" > cloudflare_fix/_redirects

# Crear ZIP
show_message "Creando archivo ZIP..."
ZIP_NAME="cloudflare-fix.zip"
cd cloudflare_fix && zip -r "../$ZIP_NAME" * && cd ..

if [ $? -ne 0 ]; then
  show_error "Error al crear el archivo ZIP."
  exit 1
fi

# Limpiar
show_message "Limpiando archivos temporales..."
rm -rf cloudflare_fix

show_success "¡Archivo ZIP creado con éxito!"
show_message "El archivo '$ZIP_NAME' está listo para subir a Cloudflare Pages."
show_message "Este es un despliegue simplificado para solucionar el error 404. Una vez que funcione,"
show_message "puedes continuar con un despliegue completo usando el script prepare-upload.sh."
show_message "Pasos para desplegar manualmente:"
echo "1. Accede a https://dash.cloudflare.com/"
echo "2. Navega a Pages en el menú lateral"
echo "3. Selecciona tu proyecto 'gozamadrid-frontend-new'"
echo "4. Haz clic en 'Deploy' y luego 'Upload Assets'"
echo "5. Sube el archivo '$ZIP_NAME'"

exit 0 