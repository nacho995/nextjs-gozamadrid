# ✅ Fix del Formulario de Contacto - Error 500 "Unauthorized"

## 🔍 Problema Detectado

El formulario de contacto estaba devolviendo error **500 "Unauthorized"** porque:

1. **Backend configurado para SendGrid** pero sin API key válida
2. **Brevo API ya implementado** pero no se usaba en notificationController
3. **Rutas duplicadas** causando confusión en el enrutamiento
4. **Formato de datos inconsistente** entre frontend y backend

---

## ✅ Cambios Realizados

### 1. **Backend - notificationController.js**
- ✅ Migrado de SendGrid a Brevo API
- ✅ Usa `utils/email.js` que ya estaba configurado para Brevo
- ✅ Eliminada dependencia de `@sendgrid/mail`
- ✅ Mejora en el formato HTML de los emails
- ✅ Logging mejorado para diagnóstico

### 2. **Backend - server.js**
- ✅ Eliminadas rutas duplicadas de `/api/contact`
- ✅ Consolidado todo en `notificationRouter`
- ✅ Limpieza de imports innecesarios

### 3. **Frontend - FormContact.jsx**
- ✅ Actualizado formato de datos para coincidir con backend
- ✅ Cambio de `mensaje` a `message` en el payload
- ✅ Subject dinámico basado en el nombre del usuario

---

## 🔑 Variables de Entorno Requeridas en Render

**IMPORTANTE:** Verifica que estas variables estén configuradas en tu panel de Render:

```bash
# Obligatorias para Brevo
BREVO_API_KEY=xkeysib-tu_api_key_aqui
EMAIL_FROM=ignaciodalesiolopez@gmail.com
EMAIL_FROM_NAME=GozaMadrid

# Destinatarios admin
EMAIL_RECIPIENT=ignaciodalesio1995@gmail.com,marta@gozamadrid.com

# Frontend URL (para otras funciones)
FRONTEND_URL=https://blogs.realestategozamadrid.com
```

### ¿Cómo verificar en Render?

1. Ve a: https://dashboard.render.com/
2. Click en tu servicio **"nextjs-gozamadrid-qrfk"**
3. Click en **"Environment"** (menú lateral)
4. Verifica que existan las variables arriba mencionadas
5. Si falta alguna, agrégala y guarda cambios

---

## 🚀 Deploy

Los cambios fueron pusheados a GitHub:
```bash
git commit -m "fix: migrar formulario de contacto de SendGrid a Brevo API"
git push origin main
```

**Render detectará automáticamente el cambio y hará redeploy** (toma ~2-3 minutos).

---

## 🧪 Cómo Probar

### Opción 1: Desde el Frontend

1. Ve a: https://www.realestategozamadrid.com/contacto
2. Completa el formulario con datos de prueba
3. Click en "Enviar mensaje"
4. **Espera ~5-10 segundos** para recibir el email

### Opción 2: Con curl (diagnóstico)

```bash
curl -X POST https://nextjs-gozamadrid-qrfk.onrender.com/api/contact \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Test User",
    "email": "test@example.com",
    "prefix": "+34",
    "telefono": "666777888",
    "message": "Este es un mensaje de prueba",
    "subject": "Nuevo contacto de Test User"
  }'
```

**Respuesta esperada (éxito):**
```json
{
  "success": true,
  "message": "Notificación enviada correctamente."
}
```

---

## 📊 Verificar Logs en Render

1. Ve a Render → Tu servicio → **Logs**
2. Busca estas líneas después de enviar el formulario:

**✅ Si funciona correctamente:**
```
📧 [notificationController] Intentando enviar notificación Brevo a: ignaciodalesio1995@gmail.com, marta@gozamadrid.com
[SendEmail Brevo] Enviando email a: ignaciodalesio1995@gmail.com
[SendEmail Brevo] Email enviado exitosamente. MessageId: xxx
✅ [notificationController] Notificación Brevo enviada correctamente
```

**❌ Si hay error:**
```
❌ [notificationController] BREVO_API_KEY no configurada.
ℹ️  Obtén una API Key gratis en: https://www.brevo.com/
```
→ **Solución:** Agregar `BREVO_API_KEY` en Render Environment

```
❌ [notificationController] EMAIL_RECIPIENT no configurado o vacío.
```
→ **Solución:** Agregar `EMAIL_RECIPIENT` en Render Environment

```
Brevo API error: Invalid API key
```
→ **Solución:** La API Key es incorrecta, genera una nueva en Brevo

```
Brevo API error: Sender email not verified
```
→ **Solución:** Verifica el email remitente en Brevo → Senders

---

## 🔧 Si Brevo API Key No Está Configurada

Si no tienes una API Key de Brevo, sigue estos pasos:

### 1. Crear cuenta en Brevo (2 minutos)
1. Ve a: https://www.brevo.com/
2. Click en **"Sign Up Free"**
3. Completa el formulario de registro
4. Verifica tu email

### 2. Obtener API Key (1 minuto)
1. Login en: https://app.brevo.com/
2. Click en tu nombre → **"SMTP & API"**
3. Pestaña **"API Keys"**
4. Click **"Generate a new API key"**
5. Nombre: "GozaMadrid Backend"
6. **Copia la API Key** (empieza con `xkeysib-...`)

### 3. Verificar Email Remitente (1 minuto)
1. En Brevo, ve a **"Senders"**
2. Click **"Add a sender"**
3. Email: `ignaciodalesiolopez@gmail.com`
4. Name: "GozaMadrid"
5. **Verifica el email** (revisa tu bandeja)

### 4. Agregar en Render
1. Render → Environment → Add Environment Variable
2. Key: `BREVO_API_KEY`
3. Value: [tu API key de Brevo]
4. **Save Changes** → Espera redeploy

---

## 📝 Notas Adicionales

- **Límite Brevo gratuito:** 300 emails/día (suficiente para contacto)
- **Deliverability:** Brevo tiene mejor reputación que Gmail SMTP
- **Monitoreo:** Puedes ver estadísticas en https://app.brevo.com/
- **SMTP bloqueado:** Render bloquea puertos 587 y 465, por eso usamos API HTTP

---

## ✅ Checklist de Verificación

- [ ] Variables de entorno configuradas en Render
- [ ] Render hizo redeploy correctamente
- [ ] Logs de Render sin errores
- [ ] Formulario envía sin error 500
- [ ] Email recibido en bandeja de entrada (o spam)
- [ ] Contenido del email es correcto (nombre, email, teléfono, mensaje)

---

## 🆘 Troubleshooting

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Error 500 "Unauthorized" | BREVO_API_KEY no configurada | Agregar variable en Render |
| Email no llega | Email remitente no verificado | Verificar sender en Brevo |
| Error "Invalid API key" | API Key incorrecta | Generar nueva en Brevo |
| Email va a spam | Falta SPF/DKIM | Configurar en Brevo → Domains |

---

## 📚 Documentación de Referencia

- **Brevo API Docs:** https://developers.brevo.com/
- **Render Environment Variables:** https://render.com/docs/configure-environment-variables
- **Setup Brevo Detallado:** Ver `SETUP_BREVO.md`

---

**Última actualización:** 29 de octubre de 2024
**Commit:** `70d83b44` - fix: migrar formulario de contacto de SendGrid a Brevo API
