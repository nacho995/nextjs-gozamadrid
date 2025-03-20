const fs = require('fs');
const path = require('path');

// Rutas de archivo
const outDir = path.join(__dirname, '..', 'out');
const indexPath = path.join(outDir, 'index.html');

// Verificar si existe el directorio out
if (!fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

// Contenido HTML básico de la página principal
const htmlContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Goza Madrid - Propiedades Inmobiliarias</title>
  <meta name="description" content="Goza Madrid - Tu agencia inmobiliaria de confianza en Madrid. Especialistas en compra, venta y alquiler de propiedades." />
  <link rel="icon" href="/favicon.ico" />
  <script>
    window.location.href = "/index/";
  </script>
</head>
<body>
  <div style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
    <h1>Cargando Goza Madrid...</h1>
    <p>Por favor espera mientras cargamos el contenido.</p>
  </div>
</body>
</html>`;

// Escribir el archivo index.html
fs.writeFileSync(indexPath, htmlContent);

console.log('Se ha creado el archivo index.html correctamente.'); 