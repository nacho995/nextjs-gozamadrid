# Despliegue en Cloudflare Pages para GozaMadrid

Este documento detalla los pasos para desplegar el frontend de GozaMadrid en Cloudflare Pages, manteniendo el backend alojado en AWS Elastic Beanstalk.

## Requisitos previos

- Cuenta en Cloudflare
- Node.js 18.x o superior
- CLI de Cloudflare (Wrangler) instalado globalmente

## Configuración

### 1. Preparación del proyecto

El proyecto ya está configurado para Cloudflare Pages con:

- Funciones API en `frontend/functions/api/`
- Archivos de configuración en `frontend/public/.well-known/cloudflare-pages.json`
- Script de despliegue en `frontend/deploy-cloudflare.sh`

### 2. Variables de entorno

No es necesario modificar los archivos `.env` existentes. Las siguientes variables son importantes para la conexión con el backend:

- `NEXT_PUBLIC_API_URL`: URL de la API del backend
- `NEXT_PUBLIC_API_BASE_URL`: URL base del backend

### 3. Arreglos para la construcción

Debido a problemas con la versión de Next.js, se recomienda usar el modo estático para la construcción:

```javascript
// next.config.js
module.exports = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}
```

## Despliegue

### 1. Método con CLI (recomendado)

Ejecutar el script de despliegue proporcionado:

```bash
cd frontend
chmod +x deploy-cloudflare.sh
./deploy-cloudflare.sh
```

El script automatiza los siguientes pasos:
- Verifica la instalación de Wrangler
- Inicia sesión en Cloudflare
- Construye el proyecto
- Despliega en Cloudflare Pages

### 2. Despliegue manual con Cloudflare Dashboard

1. Iniciar sesión en [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. Ir a "Pages" y crear un nuevo proyecto
3. Conectar el repositorio de GitHub o subir manualmente los archivos
4. Configurar:
   - Framework preset: Next.js
   - Build command: `npm run build`
   - Build output directory: `out`
   - Node version: 18.x

## Solución de problemas

### Error: "Failed to compile"

Si hay errores de compilación, verificar:
1. La sintaxis en componentes JSX
2. Dependencias faltantes en package.json
3. Compatibilidad con modo estático de exportación

### Error: "Cannot find module..."

Este error suele ocurrir por incompatibilidades entre versiones de Next.js. Soluciones:
1. Usar `output: 'export'` en next.config.js
2. Verificar que todas las APIs usan rutas relativas 
3. Revisar importaciones de módulos

### Error: CORS

1. Verificar encabezados CORS en las funciones API de Cloudflare
2. Asegurar que el backend en AWS acepta solicitudes desde el dominio de Cloudflare

## Integración con backend

La configuración actual redirige las llamadas API al backend en AWS:

```json
{
  "routes": [
    {
      "pattern": "/api/*",
      "forward": {
        "hostname": "realestatgozamadrid.com"
      }
    }
  ]
}
```

Esto permite mantener el backend en AWS mientras se sirve el frontend desde Cloudflare. 