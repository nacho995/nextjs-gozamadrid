# Despliegue del Backend en AWS Elastic Beanstalk

Este documento contiene las instrucciones para desplegar solo el backend de la aplicación en AWS Elastic Beanstalk.

## Requisitos previos

- AWS CLI instalado y configurado
- EB CLI instalado (`pip install awsebcli`)
- Node.js y npm instalados

## Pasos para el despliegue

### 1. Preparar el paquete de despliegue

Ejecuta el script para crear el paquete de despliegue del backend:

```bash
bash create-deployment.sh
```

Esto creará un archivo `deployment-backend.zip` que contiene solo los archivos necesarios para el backend.

### 2. Desplegar en Elastic Beanstalk

Ejecuta el siguiente comando para desplegar:

```bash
eb deploy --timeout 30 -l backend-only
```

El parámetro `-l backend-only` agrega una etiqueta al despliegue para identificarlo fácilmente.

### 3. Verificar el despliegue

Puedes verificar el estado del despliegue con:

```bash
eb status
```

Y ver los eventos recientes con:

```bash
eb events
```

### 4. Acceder a los logs

Si necesitas revisar los logs:

```bash
eb logs
```

## Configuración de CORS

El backend está configurado para aceptar peticiones de los siguientes orígenes:

- realestategozamadrid.com (HTTP y HTTPS)
- www.realestategozamadrid.com (HTTP y HTTPS)
- blog.realestategozamadrid.com (HTTP y HTTPS)
- gozamadrid-env.eba-dwhnvgbt.eu-west-3.elasticbeanstalk.com (HTTP y HTTPS)
- gozamadrid.pages.dev (HTTPS)
- *.gozamadrid.pages.dev (HTTPS)
- gozamadrid-frontend.pages.dev (HTTPS)
- localhost:3000 (HTTP)

Si necesitas agregar más orígenes, modifica el archivo `servidor/server.js`.

## Estructura del despliegue

El despliegue incluye:

- Servidor Node.js (Express)
- Configuración de Elastic Beanstalk (.ebextensions)
- Archivos de configuración (Procfile, package.json, etc.)

## Solución de problemas

### Timeout durante el despliegue

Si el despliegue falla por timeout, puedes aumentar el valor de `DeploymentTimeout` en el archivo `.ebextensions/03_nodeserver.config`.

### Problemas con CORS

Si tienes problemas con CORS, verifica que el origen desde el que haces las peticiones esté incluido en la lista de `allowedOrigins` en `servidor/server.js`. 