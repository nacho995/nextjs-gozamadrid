# Configuración de Cloudflare para GozaMadrid

Este documento detalla cómo configurar Cloudflare como proxy HTTPS para el backend de GozaMadrid que está alojado en AWS Elastic Beanstalk.

## Estado Actual

- **Backend (API)**: Desplegado en AWS Elastic Beanstalk en `gozamadrid-api-env.eba-w9miqyax.eu-west-3.elasticbeanstalk.com`
- **Proxy HTTPS**: Configurado a través de Cloudflare para `realestatgozamadrid.com`
- **Frontend**: Pendiente de desplegar, configurado para comunicarse con la API a través de Cloudflare

## Pasos Completados

1. ✅ Despliegue del backend en AWS Elastic Beanstalk
2. ✅ Configuración de registros DNS en Cloudflare apuntando a AWS
3. ✅ Activación del proxy de Cloudflare (nube naranja) para los registros

## Pasos Pendientes

### 1. Verificar la Propagación DNS

Los cambios DNS pueden tardar hasta 24-48 horas en propagarse completamente. Para verificar si están activos:

```bash
curl -I https://realestatgozamadrid.com
```

Deberías recibir una respuesta `HTTP/2 200` si todo está configurado correctamente.

### 2. Configuración SSL/TLS en Cloudflare

1. En el panel de Cloudflare, ve a **SSL/TLS**
2. Establece el modo SSL a **Flexible** (Cloudflare → HTTPS, Cloudflare → Origen HTTP)
3. En **Edge Certificates**, asegúrate de que "Always Use HTTPS" está activado

### 3. Reglas de Page Rules (opcional)

Para forzar HTTPS en todas las peticiones:

1. Ve a **Rules** > **Page Rules**
2. Añade una nueva regla con el patrón: `http://*realestatgozamadrid.com/*`
3. Selecciona la configuración: "Always Use HTTPS"
4. Guarda y despliega la regla

### 4. Despliegue del Frontend

El frontend ya está configurado para comunicarse con la API a través de Cloudflare. Las variables de entorno necesarias están en `.env`:

```
NEXT_PUBLIC_API_URL=https://realestatgozamadrid.com/api
NEXT_PUBLIC_API_BASE_URL=https://realestatgozamadrid.com
```

Para desplegar el frontend, puedes usar:
- Cloudflare Pages (recomendado para integración con Cloudflare)
- Vercel
- Netlify

#### Despliegue en Cloudflare Pages

1. Instala Wrangler: `npm install -g wrangler`
2. Inicia sesión: `wrangler login`
3. Publica tu sitio: `wrangler pages deploy frontend/.next/static --project-name gozamadrid`

## Solución de Problemas

### CORS

Si experimentas problemas de CORS, verifica que el backend esté configurado para aceptar peticiones desde el origen del frontend.

En Nginx (ya configurado en el backend):
```
add_header 'Access-Control-Allow-Origin' '*' always;
```

### Errores de Certificado

En modo SSL Flexible, Cloudflare gestiona el certificado SSL. No es necesario un certificado en el servidor backend.

### Conectividad

Si el backend no responde, verifica:
1. Estado de Elastic Beanstalk: `eb status gozamadrid-api-env`
2. Reglas de seguridad: Los puertos 80 y 443 deben estar abiertos
3. Logs de Elastic Beanstalk: `eb logs gozamadrid-api-env`

## Contacto

Si tienes alguna pregunta o problema, contacta con el equipo de desarrollo. 