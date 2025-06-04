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
echo ""
echo "🌐 La aplicación estará disponible en:"
echo "   - Local: http://localhost:3000"
echo "   - Red: http://192.168.1.18:3000"
echo ""
echo "⚠️  Si ves errores de webpack en el navegador, recarga la página."
echo "💡 Para detener: Ctrl+C"
echo ""

# Ejecutar Next.js
exec ./node_modules/.bin/next dev 