#!/bin/bash
cd "$(dirname "$0")"

echo "🔄 Agregando solo archivos modificados específicos..."
git add .gitignore frontend/next.config.js frontend/eslint.config.mjs

echo "💾 Haciendo commit..."
git commit -m "Preparar para producción: gitignore y configuraciones optimizadas" --no-verify

echo "🚀 Haciendo push..."
git push

echo "✅ Listo!"

