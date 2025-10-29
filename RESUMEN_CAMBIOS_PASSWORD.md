# ✅ Resumen: Configuración de Recuperación de Contraseñas

## 📋 Problema Detectado

Tenías **DOS implementaciones duplicadas** del sistema de recuperación de contraseña:

1. **Backend en Render** (servidor centralizado) - ✅ Completo con Nodemailer
2. **Serverless functions en BlogsyPropiedades** - ❌ NO enviaba emails reales

El frontend estaba llamando a los endpoints locales que **NO enviaban emails**.

## 🔧 Cambios Realizados

### 1. Backend en Render (`/servidor`) ✅

#### Archivos Modificados:
- **`models/userSchema.js`** - Agregado método `createPasswordResetToken()`
- **`utils/email.js`** - Migrado de SendGrid a Nodemailer (GRATIS)
- **`server.js`** - Montadas rutas de autenticación en `/api/auth`
- **`render.env.example`** - Actualizadas variables de entorno

#### Endpoints Disponibles:
```
POST  https://nextjs-gozamadrid-qrfk.onrender.com/api/auth/recover-password
PATCH https://nextjs-gozamadrid-qrfk.onrender.com/api/auth/:token
```

### 2. Frontend en BlogsyPropiedades ✅

#### Archivos Modificados:
- **`BlogPropiedades/src/services/api.js`**
  - Cambiado endpoint de `/user/request-password-reset` → `/auth/recover-password`
  - Cambiado endpoint de `/user/reset-password` → `/auth/:token`
  - Cambiado método de `POST` → `PATCH` para reset

#### Componente React:
- **`BlogPropiedades/src/components/ResetPassword.jsx`** - ✅ Ya existe y está bien

---

## 🚀 Pasos para Completar la Configuración

### Paso 1: Generar App Password de Gmail

1. Ve a: https://myaccount.google.com/
2. Menú "Seguridad"
3. Habilita "Verificación en dos pasos" (si no la tienes)
4. Ve a "Contraseñas de aplicaciones"
5. Genera una contraseña para "GozaMadrid Server"
6. **Copia la contraseña de 16 caracteres** (sin espacios)

### Paso 2: Configurar Variables en Render

Ve a tu dashboard de Render → Tu servicio backend → Environment:

```env
# Nodemailer con Gmail (GRATIS)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=ignaciodalesiolopez@gmail.com
EMAIL_PASSWORD=tu_app_password_de_16_caracteres

# Emails adicionales
EMAIL_FROM=ignaciodalesiolopez@gmail.com
EMAIL_RECIPIENT=ignaciodalesio1995@gmail.com,marta@gozamadrid.com

# URL del frontend (donde está la página de reset)
FRONTEND_URL=https://blogs.realestategozamadrid.com

# MongoDB (ya la tienes)
MONGODB_URI=tu_mongodb_uri_actual
```

**IMPORTANTE:** Reemplaza `tu_app_password_de_16_caracteres` con la App Password de Gmail.

### Paso 3: Deploy Backend a Render

```bash
cd servidor
git add .
git commit -m "feat: configurar Nodemailer para recuperación de contraseñas"
git push
```

Render hará el deploy automáticamente.

### Paso 4: Deploy Frontend

```bash
cd BlogsyPropiedades/BlogPropiedades
git add .
git commit -m "fix: usar backend centralizado para recuperación de contraseñas"
git push
```

---

## 🧪 Cómo Probar

### 1. Probar Solicitud de Recuperación

```bash
curl -X POST https://nextjs-gozamadrid-qrfk.onrender.com/api/auth/recover-password \
  -H "Content-Type: application/json" \
  -d '{"email":"tu_email@gmail.com"}'
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Token enviado al email"
}
```

### 2. Revisar Email

- Revisa tu bandeja de entrada (o spam)
- Deberías recibir un email con el enlace de recuperación
- El enlace será: `https://blogs.realestategozamadrid.com/reset-password/TOKEN`

### 3. Probar desde el Frontend

1. Ve a tu página de "Olvidé mi contraseña"
2. Ingresa tu email
3. Verifica que llegue el email
4. Click en el enlace del email
5. Ingresa nueva contraseña
6. Verifica que se actualice correctamente

---

## 📁 Archivos que Puedes Eliminar (Opcional)

Estos endpoints locales ya no se usan y pueden eliminarse:

```bash
# Ya NO se usan (el frontend ahora usa el backend de Render)
BlogsyPropiedades/api/user/request-password-reset.js
BlogsyPropiedades/api/user/reset-password.js
```

**IMPORTANTE:** Elimínalos SOLO después de verificar que todo funciona con el backend de Render.

---

## 🔍 Verificación de Logs

### En Render (Backend)

Ve a tu servicio → Logs y busca:

```
[utils/email.js] Configurado con Nodemailer.
[authController] forgotPassword
[SendEmail] Enviando email a: usuario@ejemplo.com
[SendEmail] Email enviado exitosamente
```

### En el Navegador (Frontend)

Abre la consola del navegador y busca:

```
📧 Solicitando recuperación de contraseña para: usuario@ejemplo.com
✅ Solicitud de recuperación enviada
```

---

## 🌐 Arquitectura Final

```
Usuario en blogs.realestategozamadrid.com
    ↓
    ↓ [Click "Olvidé mi contraseña"]
    ↓
    ↓ POST /auth/recover-password
    ↓
Backend en Render (nextjs-gozamadrid-qrfk.onrender.com)
    ↓
    ↓ [Genera token + Envía email con Nodemailer]
    ↓
Gmail SMTP (GRATIS)
    ↓
    ↓ [Email llega al usuario]
    ↓
Usuario hace click en el enlace
    ↓
    ↓ [https://blogs.realestategozamadrid.com/reset-password/TOKEN]
    ↓
Página React de ResetPassword
    ↓
    ↓ PATCH /auth/:token con nueva contraseña
    ↓
Backend en Render actualiza la contraseña
    ↓
    ↓ [Usuario puede hacer login]
    ↓
✅ COMPLETADO
```

---

## ⚠️ Troubleshooting

### Email no llega

1. **Verifica logs en Render** - Busca errores de Nodemailer
2. **Verifica App Password** - Debe ser de 16 caracteres sin espacios
3. **Verifica verificación en dos pasos** - Debe estar habilitada en Google
4. **Revisa spam** - Los emails de Gmail pueden ir a spam

### Error "Invalid login" o "Authentication failed"

- Estás usando tu contraseña normal de Gmail en lugar de la App Password
- Genera una nueva App Password

### Error de timeout

- Render puede estar bloqueando el puerto 587
- Cambia a puerto 465 con SSL:
  ```env
  EMAIL_PORT=465
  EMAIL_SECURE=true
  ```

### Token inválido o expirado

- Los tokens expiran después de 10 minutos
- Solicita un nuevo enlace de recuperación

---

## 💰 Costos

**TODO ES GRATIS:**

- ✅ Gmail: 500 emails/día gratis
- ✅ Nodemailer: Librería open source gratuita
- ✅ MongoDB: Plan gratuito
- ✅ Render: Plan gratuito para backend

**Alternativas gratuitas si Gmail no funciona:**
- Brevo: 300 emails/día gratis (recomendado para producción)
- Elastic Email: 100 emails/día gratis

---

## 📚 Documentación Adicional

- **`ENDPOINTS_PASSWORD_RECOVERY.md`** - Documentación completa de los endpoints
- **`SETUP_NODEMAILER.md`** - Guía detallada de configuración de Nodemailer
- **`SMTP_GRATUITOS.md`** - Comparativa de servicios SMTP gratuitos

---

## ✅ Checklist Final

Antes de considerar terminado:

- [ ] App Password de Gmail generada
- [ ] Variables de entorno configuradas en Render
- [ ] Backend deployd en Render
- [ ] Frontend deployd
- [ ] Logs verificados en Render (sin errores)
- [ ] Probado endpoint con curl
- [ ] Email recibido en bandeja de entrada
- [ ] Link del email funciona correctamente
- [ ] Nueva contraseña se guarda correctamente
- [ ] Login funciona con la nueva contraseña

---

## 🎉 Estado Actual

✅ **Backend:** Configurado y listo en Render  
✅ **Frontend:** Actualizado para usar backend centralizado  
✅ **Email:** Configurado con Nodemailer + Gmail (gratis)  
✅ **Documentación:** Completa y detallada  

**Siguiente paso:** Configurar las credenciales de Gmail en Render y hacer deploy.
