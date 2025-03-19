# Despliegue en Vercel

Este documento contiene instrucciones para desplegar la aplicación Next.js en Vercel y configurarla con un dominio personalizado.

## Preparación para el despliegue

1. Se han realizado las siguientes modificaciones para preparar el proyecto para Vercel:
   - Eliminado opciones no reconocidas en `next.config.js`: `memoryLimit` y `staticPageGenerationTimeout`
   - Creado archivo `.env.production` con las variables de entorno necesarias
   - Creado archivo `vercel.json` con configuraciones optimizadas para Vercel

## Pasos para desplegar en Vercel

1. **Crear una cuenta en Vercel**:
   - Regístrate en [vercel.com](https://vercel.com) (puedes usar tu cuenta de GitHub)

2. **Conectar tu repositorio**:
   - Haz clic en "Import Project"
   - Selecciona "Import Git Repository"
   - Conecta tu cuenta de GitHub/GitLab/Bitbucket
   - Selecciona el repositorio de tu proyecto

3. **Configurar el proyecto**:
   - Framework Preset: Selecciona "Next.js"
   - Root Directory: Especifica `frontend`
   - Build Command: Deja el valor por defecto (`next build`)
   - Output Directory: Deja el valor por defecto (`dist`)

4. **Configurar las variables de entorno**:
   - En la sección "Environment Variables", añade todas las variables de tu archivo `.env.production`
   - Asegúrate de incluir todas las claves de API y URLs necesarias

5. **Despliega el proyecto**:
   - Haz clic en "Deploy"
   - Espera a que se complete el proceso de construcción y despliegue

## Configurar dominio personalizado

1. **Accede a la configuración de dominios**:
   - En el dashboard de tu proyecto en Vercel, ve a "Settings" > "Domains"

2. **Añade tu dominio**:
   - Haz clic en "Add Domain"
   - Introduce el dominio o subdominio que quieres usar (ej. `app.gozamadrid.com`)

3. **Configura los registros DNS**:
   - Vercel te proporcionará instrucciones específicas para configurar los registros DNS
   - Típicamente necesitarás añadir un registro CNAME que apunte a `cname.vercel-dns.com`

4. **Para un subdominio de tu WordPress**:
   - Accede al panel de control de DNS de tu proveedor de hosting de WordPress
   - Añade un registro CNAME para el subdominio (ej. `app`) que apunte a `cname.vercel-dns.com`

5. **Para usar el dominio raíz**:
   - Si quieres usar el dominio raíz (sin www), necesitarás configurar registros A que apunten a las IPs de Vercel
   - Vercel te proporcionará las IPs exactas en las instrucciones

## Configurar CORS en WordPress

1. **Añade los encabezados CORS en WordPress**:
   - Edita el archivo `.htaccess` en la raíz de tu instalación de WordPress:
     ```
     <IfModule mod_headers.c>
       Header set Access-Control-Allow-Origin "https://tu-dominio-vercel.vercel.app, https://app.tu-dominio-wordpress.com"
       Header set Access-Control-Allow-Methods "GET, POST, OPTIONS, PUT, DELETE"
       Header set Access-Control-Allow-Headers "Content-Type, Authorization"
       Header set Access-Control-Allow-Credentials "true"
     </IfModule>
     ```

2. **Configura el plugin de WooCommerce**:
   - Asegúrate de que las claves API de WooCommerce tengan los permisos correctos
   - Verifica que las URLs de redirección estén configuradas correctamente

## Solución de problemas comunes

1. **Errores 502 o 504**:
   - Verifica las variables de entorno y las URLs
   - Comprueba que los timeouts estén configurados correctamente
   - Asegúrate de que las claves de API sean válidas

2. **Problemas con las imágenes**:
   - Verifica que los dominios estén correctamente configurados en `next.config.js`
   - Comprueba que las rutas de las imágenes sean correctas

3. **Errores CORS**:
   - Verifica la configuración de encabezados en WordPress
   - Comprueba que las URLs de origen permitidas incluyan tu dominio de Vercel

4. **Errores de JavaScript**:
   - Revisa los logs de construcción en Vercel
   - Comprueba que no haya errores de sintaxis en el código

## Recursos adicionales

- [Documentación de Vercel](https://vercel.com/docs)
- [Documentación de Next.js](https://nextjs.org/docs)
- [Guía de despliegue de Next.js en Vercel](https://nextjs.org/docs/deployment) 