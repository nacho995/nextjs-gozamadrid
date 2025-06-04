#!/bin/bash
echo "🚀 Iniciando Next.js en modo desarrollo seguro..."

# Limpiar procesos previos
pkill -f next 2>/dev/null || true

# Variables de entorno para estabilidad
export NODE_ENV=development
export NODE_PATH=./node_modules
export FAST_REFRESH=false
export DISABLE_ESLINT_PLUGIN=true
export NEXT_DISABLE_HMR=true
export CHOKIDAR_USEPOLLING=false
export WATCHPACK_POLLING=false
export NEXT_TELEMETRY_DISABLED=1
# Limitar generación de páginas en desarrollo
export NEXT_BUILD_EXPERIMENTAL_PAGE_MEMORY_LIMIT=50
export NEXT_BUILD_EXPERIMENTAL_INCREMENTAL_CACHE_LIMIT=10

# Verificar que estamos en el directorio correcto
if [ ! -f "package.json" ]; then
    echo "❌ Error: No se encuentra package.json. Ejecuta desde el directorio frontend/"
    exit 1
fi

# Verificar que Next.js está instalado
if [ ! -f "node_modules/.bin/next" ]; then
    echo "❌ Error: Next.js no encontrado. Ejecutando npm install..."
    npm install
fi

echo "✅ Configuración aplicada:"
echo "   - Fast Refresh: DESACTIVADO"
echo "   - HMR: DESACTIVADO"
echo "   - ESLint Plugin: DESACTIVADO"
echo "   - Polling: DESACTIVADO"
echo "   - Generación de páginas: LIMITADA"
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   - Local: http://localhost:3000"
echo "   - Red: http://192.168.1.18:3000"
echo ""
echo "⚠️  Si ves errores de webpack en el navegador, recarga la página."
echo "💡 Para detener: Ctrl+C"
echo ""

# Usar configuración de desarrollo específica
export NEXT_CONFIG_FILE="./next.config.dev.js"

# Ejecutar Next.js
exec npx next dev 