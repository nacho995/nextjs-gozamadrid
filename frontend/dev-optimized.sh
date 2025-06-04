#!/bin/bash

# Script optimizado para ejecutar la aplicación Next.js de manera estable
# Asegurar que estamos usando Node.js v20
source ~/.nvm/nvm.sh
nvm use

# Ejecutar con configuración optimizada para evitar errores
NODE_PATH=./node_modules \
FAST_REFRESH=false \
DISABLE_ESLINT_PLUGIN=true \
NEXT_DISABLE_HMR=true \
./node_modules/.bin/next dev

echo "Aplicación ejecutándose en http://localhost:3000" 