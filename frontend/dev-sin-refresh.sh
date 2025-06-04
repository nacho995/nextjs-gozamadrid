#!/bin/bash

# Script para ejecutar Next.js FRONTEND sin Fast Refresh
# Deshabilita todas las características que pueden causar loops infinitos

echo "🚀 Iniciando Frontend SIN Fast Refresh..."
echo "📁 Directorio: $(pwd)"
echo "📝 Configuraciones aplicadas:"
echo "   - FAST_REFRESH=false"
echo "   - DISABLE_ESLINT_PLUGIN=true" 
echo "   - NEXT_DISABLE_HMR=true"
echo "   - Sin Turbopack"
echo "   - Sin watchOptions"
echo ""

# Limpiar cache si existe
if [ -d ".next" ]; then
    echo "🧹 Limpiando cache de .next del frontend..."
    rm -rf .next
fi

# Configurar variables de entorno y ejecutar
export FAST_REFRESH=false
export DISABLE_ESLINT_PLUGIN=true
export NEXT_DISABLE_HMR=true
export NODE_ENV=development

# Ejecutar Next.js sin las configuraciones problemáticas
echo "▶️  Ejecutando: next dev"
echo "🌐 El servidor estará disponible en: http://localhost:3000"
echo ""
npx next dev 