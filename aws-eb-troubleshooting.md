# Solución de problemas con AWS Elastic Beanstalk

## Problema: Entorno atascado en estado "Updating"

Si tu entorno de Elastic Beanstalk está atascado en estado "Updating" durante mucho tiempo, puedes intentar las siguientes soluciones:

### Solución 1: Esperar y verificar los logs
1. Espera al menos 30-60 minutos para ver si el despliegue se completa.
2. Verifica los logs con `eb logs` para entender qué está sucediendo.

### Solución 2: Usar la consola web de AWS
1. Inicia sesión en la [consola de AWS](https://console.aws.amazon.com/).
2. Ve a Elastic Beanstalk > Entornos > tu-entorno.
3. Haz clic en "Abort current operation" (Abortar operación actual) si está disponible.
4. Si no está disponible, intenta reiniciar el entorno desde la consola.

### Solución 3: Recrear el entorno
Si nada más funciona, puedes recrear el entorno:

1. Desde la consola de AWS, crea un nuevo entorno con la misma configuración.
2. Una vez que el nuevo entorno esté listo, puedes terminar el entorno problemático.
3. Actualiza tus archivos de configuración locales con `eb init` para apuntar al nuevo entorno.

## Problema: Errores de despliegue por timeout

Si el despliegue falla por timeout, puedes intentar las siguientes soluciones:

### Solución 1: Aumentar el timeout
1. Modifica el archivo `.ebextensions/03_nodeserver.config` para aumentar el timeout:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:command:
       Timeout: 1800
   ```

### Solución 2: Optimizar el proceso de despliegue
1. Reduce el tamaño del paquete de despliegue excluyendo archivos innecesarios.
2. Usa `--no-optional` al instalar dependencias para reducir el tiempo de instalación.
3. Considera usar una instancia más potente (t2.medium o superior).

## Problema: Errores de instalación de dependencias

Si hay errores al instalar dependencias, puedes intentar las siguientes soluciones:

### Solución 1: Verificar la versión de Node.js
1. Asegúrate de que la versión de Node.js en tu `package.json` coincida con la plataforma de Elastic Beanstalk.
2. Actualiza la plataforma de Elastic Beanstalk si es necesario.

### Solución 2: Limpiar el caché de npm
1. Agrega un comando para limpiar el caché de npm antes de instalar dependencias:
   ```yaml
   container_commands:
     01_clean_npm_cache:
       command: "npm cache clean --force"
     02_install_dependencies:
       command: "npm install --no-optional"
   ```

## Problema: Errores de memoria durante el despliegue

Si hay errores de memoria durante el despliegue, puedes intentar las siguientes soluciones:

### Solución 1: Aumentar la memoria disponible para Node.js
1. Modifica el archivo `.ebextensions/03_nodeserver.config` para aumentar la memoria:
   ```yaml
   option_settings:
     aws:elasticbeanstalk:application:environment:
       NODE_OPTIONS: "--max-old-space-size=4096"
   ```

### Solución 2: Usar una instancia más potente
1. Modifica el archivo `.ebextensions/04_resources.config` para usar una instancia más potente:
   ```yaml
   option_settings:
     aws:autoscaling:launchconfiguration:
       InstanceType: t2.large
   ```

## Problema: Errores de permisos

Si hay errores de permisos durante el despliegue, puedes intentar las siguientes soluciones:

### Solución 1: Verificar los permisos de los archivos
1. Asegúrate de que los archivos tengan los permisos correctos antes de desplegarlos.
2. Agrega comandos para establecer permisos en el servidor:
   ```yaml
   container_commands:
     01_set_permissions:
       command: "chmod -R 755 /var/app/staging"
   ```

## Recursos adicionales
- [Documentación oficial de AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/Welcome.html)
- [Guía de solución de problemas de AWS Elastic Beanstalk](https://docs.aws.amazon.com/elasticbeanstalk/latest/dg/troubleshooting.html)
- [Foro de AWS Elastic Beanstalk](https://forums.aws.amazon.com/forum.jspa?forumID=86) 