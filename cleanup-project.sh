#!/bin/bash

echo "🧹 LIMPIEZA MASIVA DEL PROYECTO NEXTJS-GOZAMADRID"
echo "================================================="

# Crear directorio temporal para respaldo
mkdir -p ./ARCHIVOS_ANTIGUOS_BACKUP

echo "📁 Moviendo archivos duplicados a respaldo..."

# Mover archivos de configuración duplicados
mv package.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv next.config.js ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null  
mv next.config.js.backup ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv package.json.backup ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv package-frontend-backup.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv tailwind.config.js ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv postcss.config.js ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv jsconfig.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv .npmrc ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

# Mover directorios duplicados
mv hooks/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv components/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv lib/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv public/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv data/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv models/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv utils/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv context/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv styles/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv config/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv services/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv pages/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv src_backup/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv img/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv icons/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv functions/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv fixes/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv servidor/ ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

# Mover archivos de imagen duplicados
mv *.jpg ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv *.png ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv *.jpeg ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv *.gif ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv *.svg ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv *.ico ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

# Mover archivos de video duplicados
mv video.mp4 ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

# Mover archivos de configuración web duplicados
mv vercel.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv manifest.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv site.webmanifest ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv robots.txt ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv sitemap*.xml ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv routes-manifest.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv nginx.conf ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv web.config ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

# Mover scripts duplicados
mv run-frontend-sin-refresh.sh ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv dev-sin-refresh.sh ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

# Mover archivos varios duplicados
mv video-diagnostic.js ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv video-fallback.html ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv coordinates-data.json ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null
mv next-sitemap.config.js ./ARCHIVOS_ANTIGUOS_BACKUP/ 2>/dev/null

echo "✅ Limpieza completada!"
echo ""
echo "📋 ESTRUCTURA LIMPIA:"
echo "├── frontend/           ✅ (proyecto principal)"
echo "├── .git/              ✅ (control de versiones)" 
echo "├── ARCHIVOS_ANTIGUOS_BACKUP/  📦 (respaldo de archivos movidos)"
echo "└── cleanup-project.sh  🧹 (este script)"
echo ""
echo "🎯 SIGUIENTE PASO: Verificar que el frontend funciona correctamente"
echo "   cd frontend && ./dev-safe.sh"
echo ""
echo "⚠️  IMPORTANTE: Los archivos están en ARCHIVOS_ANTIGUOS_BACKUP por seguridad"
echo "   Puedes eliminar esa carpeta cuando confirmes que todo funciona" 