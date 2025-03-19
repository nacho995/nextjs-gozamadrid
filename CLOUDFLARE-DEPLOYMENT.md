# Despliegue del Frontend en Cloudflare Pages

Esta guía detalla los pasos para desplegar el frontend de la aplicación GozaMadrid en Cloudflare Pages mientras se mantiene el backend en AWS Elastic Beanstalk.

## Requisitos previos

- Cuenta en Cloudflare
- Node.js 18.x o superior
- CLI de Cloudflare (Wrangler) instalado: `npm install -g wrangler`

## Estructura del proyecto

El proyecto está configurado para una implementación separada:
- **Backend**: API alojada en AWS Elastic Beanstalk
- **Frontend**: Aplicación Next.js a desplegar en Cloudflare Pages

## Preparación para el despliegue

### 1. Configuración del proyecto

El proyecto ya incluye todos los archivos necesarios para Cloudflare Pages:
- **Funciones API**: En `frontend/functions/api/`
- **Configuración Cloudflare**: En `frontend/public/.well-known/cloudflare-pages.json`
- **Scripts de despliegue**: `frontend/cloudflare-export.js` y `frontend/deploy-cloudflare.sh`

### 2. Configuración de Next.js

El archivo `frontend/next.config.js` ya está configurado para exportación estática:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'export',
  distDir: 'out',
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
}

module.exports = nextConfig;
```

### 3. Variables de entorno

Las variables de entorno necesarias ya están configuradas en:
- `.env.local` (desarrollo)
- `.env.production` (producción)

Las principales variables a tener en cuenta son:
- `NEXT_PUBLIC_API_URL`: URL de la API del backend
- `NEXT_PUBLIC_API_BASE_URL`: URL base del backend

## Proceso de despliegue

### Opción 1: Usar el script automatizado (recomendado)

1. Cambiar al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Ejecutar el script de despliegue:
   ```bash
   ./deploy-cloudflare.sh
   ```

   Este script:
   - Verifica las credenciales de Cloudflare
   - Construye el proyecto
   - Despliega a Cloudflare Pages

### Opción 2: Preparación manual para Cloudflare Pages

1. Cambiar al directorio del frontend:
   ```bash
   cd frontend
   ```

2. Ejecutar el script de exportación:
   ```bash
   ./cloudflare-export.js
   ```

3. Desplegar usando Wrangler:
   ```bash
   wrangler pages deploy out --project-name=gozamadrid-frontend-new --commit-dirty=true
   ```

### Opción 3: Despliegue desde la interfaz de Cloudflare

1. Construir el proyecto:
   ```bash
   cd frontend
   npm run build
   ```

2. En el [Panel de Cloudflare Pages](https://dash.cloudflare.com/):
   - Ir a "Pages" y crear un nuevo proyecto
   - Elegir "Direct Upload"
   - Subir el contenido del directorio `frontend/out`
   - Configurar las variables de entorno según `.env.production`

## Configuración de Cloudflare Pages

### Integración con el backend AWS

La configuración en `cloudflare-pages.json` ya incluye la redirección de las llamadas API al backend:

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

### Funciones API en Cloudflare

Las funciones API en `frontend/functions/api/` se activarán automáticamente y permiten:
- Funcionalidades de proxy para API externas
- Manejo de CORS
- Endpoints para pruebas y funcionalidades específicas

## Solución de problemas

### Error: "Failed to compile"

Si hay errores de compilación:
1. Revisa la sintaxis JSX en componentes específicos
2. Verifica que las dependencias estén actualizadas
3. Confirma que la configuración Next.js sea compatible con exportación estática

### Error: "Cannot find module 'next/...'"

Este error puede ocurrir por incompatibilidades entre versiones:
1. Asegúrate de usar `output: 'export'` en next.config.js
2. Si persiste, prueba diferentes versiones de Next.js (13.x o 14.x)
3. Si compilas en Windows y despliegas en Linux, considera compilar en un entorno Linux

### Error: CORS

Si hay problemas de CORS:
1. Verifica los encabezados en las funciones API
2. Asegúrate de que el backend acepte solicitudes desde el dominio de Cloudflare

## Recursos adicionales

- [Documentación de Cloudflare Pages](https://developers.cloudflare.com/pages/)
- [Next.js en Cloudflare Pages](https://developers.cloudflare.com/pages/framework-guides/nextjs/)
- [Configuración de Wrangler](https://developers.cloudflare.com/workers/wrangler/) 