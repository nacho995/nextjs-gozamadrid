#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

// Ruta al archivo que necesitamos modificar
const filePath = path.resolve('./node_modules/next/dist/build/handle-externals.js');

// Leer el archivo
let content = fs.readFileSync(filePath, 'utf8');

// Buscar la línea que queremos reemplazar
const lineToReplace = 'return `commonjs ${localRes.replace(/.*?next[\\/\\\\]dist/, "next/dist")}`;';

// Nueva línea que arregla el problema de rutas
const newLine = 'return `commonjs ${localRes.replace(/.*?next[\\/\\\\]dist/, "next/dist").replace(/\\\\/g, "/")}`; // Fixed for cross-platform compatibility';

// Reemplazar la línea en el contenido
content = content.replace(lineToReplace, newLine);

// Escribir el contenido modificado de vuelta al archivo
fs.writeFileSync(filePath, content, 'utf8');

console.log('✅ Archivo handle-externals.js modificado correctamente.'); 