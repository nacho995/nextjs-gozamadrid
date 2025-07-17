# Instrucciones de Deploy para Render

## 1. Configurar Variables de Entorno en Render

Ve a tu panel de Render y configura las siguientes variables de entorno:

### Variables Críticas para CORS:
```
CORS_ORIGIN=https://blogs.realestategozamadrid.com,https://realestategozamadrid.com,https://www.realestategozamadrid.com,https://nextjs-gozamadrid-qrfk.onrender.com,https://api.realestategozamadrid.com
```

### Variables de Base de Datos:
```
MONGODB_URI=mongodb+srv://nacho995:eminem50cent@cluster0.o6i9n.mongodb.net/GozaMadrid?retryWrites=true&w=majority&socketTimeoutMS=30000&connectTimeoutMS=30000&appName=Cluster0
```

### Variables de Configuración:
```
NODE_ENV=production
PORT=8081
JWT_SECRET=GozaMadrid
```

### Variables de Cloudinary:
```
CLOUDINARY_CLOUD_NAME=dv31mt6pd
API_KEY=915443216824292
API_SECRET=FMDbe6eOaHnlPHQnrn-qbd6EqW4
```

### Variables de Email:
```
SENDGRID_API_KEY=tu_sendgrid_api_key_aqui
SENDGRID_VERIFIED_SENDER=ignaciodalesiolopez@gmail.com
EMAIL_RECIPIENT=ignaciodalesio1995@gmail.com,marta@gozamadrid.com
```

## 2. Comandos de Deploy

### Configuración de Build:
- **Build Command**: `npm install`
- **Start Command**: `npm start`

### Configuración de Salud:
- **Health Check Path**: `/api/health`

## 3. Verificar Deploy

Después del deploy, verifica que:

1. **Servidor responde**: `curl https://nextjs-gozamadrid-qrfk.onrender.com/api/health`
2. **CORS funciona**: Probar login desde https://blogs.realestategozamadrid.com
3. **Logs muestran**: Mensajes de CORS con emojis 🔍 ✅

## 4. Troubleshooting

Si persisten problemas de CORS:

1. Verificar que la variable `CORS_ORIGIN` esté configurada correctamente
2. Revisar logs del servidor en Render
3. Verificar que el dominio frontend esté exactamente como está configurado

## 5. Logs a Monitorear

Busca estos mensajes en los logs:
- `🔍 CORS Check: Origin recibido: "https://blogs.realestategozamadrid.com"`
- `✅ CORS: Origin https://blogs.realestategozamadrid.com permitido`
- `🔐 User API: POST /login from origin: https://blogs.realestategozamadrid.com` 