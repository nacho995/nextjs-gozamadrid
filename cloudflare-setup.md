# Configuración de Cloudflare para GozaMadrid

## Paso 1: Crear una cuenta en Cloudflare
1. Ve a [Cloudflare](https://www.cloudflare.com/) y regístrate si aún no tienes una cuenta.
2. Inicia sesión en tu cuenta de Cloudflare.

## Paso 2: Agregar tu dominio a Cloudflare
1. En el panel de control de Cloudflare, haz clic en "Agregar un sitio".
2. Ingresa tu dominio (realestategozamadrid.com) y haz clic en "Agregar sitio".
3. Selecciona el plan gratuito (o el que prefieras) y haz clic en "Continuar".
4. Cloudflare escaneará tus registros DNS existentes. Verifica que todos los registros importantes estén incluidos.
5. Cambia los servidores de nombres de tu dominio a los proporcionados por Cloudflare. Esto se hace en tu proveedor de dominio (como GoDaddy, Namecheap, etc.).
6. Espera a que se complete la propagación de DNS (puede tomar hasta 24 horas).

## Paso 3: Configurar los registros DNS
1. En el panel de control de Cloudflare, ve a la sección "DNS".
2. Asegúrate de tener los siguientes registros:

   - Registro A para el dominio principal que apunte a la IP de tu servidor de AWS Elastic Beanstalk:
     - Nombre: @
     - Contenido: [IP de tu entorno de Elastic Beanstalk]
     - TTL: Auto
     - Proxy: Activado (nube naranja)

   - Registro CNAME para el subdominio "www" que apunte al dominio principal:
     - Nombre: www
     - Contenido: realestategozamadrid.com
     - TTL: Auto
     - Proxy: Activado (nube naranja)

   - Si tienes otros subdominios, agrégalos de manera similar.

## Paso 4: Configurar SSL/TLS
1. Ve a la sección "SSL/TLS" en el panel de control de Cloudflare.
2. Establece el modo de cifrado en "Full" o "Full (strict)" para mayor seguridad.
3. Activa "Always Use HTTPS" para redirigir todo el tráfico HTTP a HTTPS.
4. Activa "Automatic HTTPS Rewrites" para evitar contenido mixto.

## Paso 5: Configurar reglas de caché
1. Ve a la sección "Caching" en el panel de control de Cloudflare.
2. Configura las siguientes opciones:
   - Browser Cache TTL: 4 horas (o el valor que prefieras)
   - Always Online: Activado
   - Development Mode: Desactivado (actívalo solo cuando estés haciendo cambios)

3. En "Page Rules", crea las siguientes reglas:
   - Para cachear archivos estáticos:
     - URL: realestategozamadrid.com/static/*
     - Configuración: Cache Level: Cache Everything, Edge Cache TTL: 1 week

   - Para no cachear rutas de API:
     - URL: realestategozamadrid.com/api/*
     - Configuración: Cache Level: Bypass

## Paso 6: Configurar Firewall y seguridad
1. Ve a la sección "Security" en el panel de control de Cloudflare.
2. Configura el nivel de seguridad según tus necesidades (Medium es un buen punto de partida).
3. Activa "Bot Fight Mode" para proteger contra bots maliciosos.
4. Activa "Challenge Passage" para permitir que los usuarios legítimos pasen las verificaciones de seguridad.

## Paso 7: Optimización de rendimiento
1. Ve a la sección "Speed" en el panel de control de Cloudflare.
2. Activa "Auto Minify" para HTML, CSS y JavaScript.
3. Activa "Brotli" para compresión mejorada.
4. Activa "Rocket Loader" para cargar JavaScript de forma asíncrona.
5. Activa "Early Hints" para mejorar los tiempos de carga.

## Paso 8: Verificar la configuración
1. Usa herramientas como [Cloudflare Radar](https://radar.cloudflare.com/) para verificar que tu dominio esté correctamente configurado.
2. Verifica que tu sitio sea accesible a través de HTTPS.
3. Comprueba que los archivos estáticos se estén cacheando correctamente.

## Paso 9: Monitoreo continuo
1. Revisa regularmente las analíticas en el panel de control de Cloudflare.
2. Ajusta la configuración según sea necesario basándote en el tráfico y las necesidades de tu sitio.
3. Mantente al día con las nuevas características y mejoras de Cloudflare.

## Recursos adicionales
- [Documentación oficial de Cloudflare](https://developers.cloudflare.com/fundamentals/)
- [Guía de optimización de Cloudflare](https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/improve-web-performance/)
- [Mejores prácticas de seguridad de Cloudflare](https://developers.cloudflare.com/fundamentals/get-started/basic-tasks/secure-your-site/) 