# 🚀 Configuración de Brevo para Recuperación de Contraseñas

## ⚠️ ¿Por qué Brevo y no Gmail?

**Render bloquea TODOS los puertos SMTP** (587 y 465) en su plan gratuito para prevenir spam.

**Solución:** Usar **Brevo API REST** (HTTP) que NO está bloqueado.

## ✅ Ventajas de Brevo

- ✅ **100% GRATIS:** 300 emails/día para siempre
- ✅ **NO requiere tarjeta de crédito**
- ✅ **Funciona en Render:** Usa API HTTP, no SMTP
- ✅ **Mejor deliverability:** Los emails no van a spam tan fácilmente
- ✅ **Panel de estadísticas:** Ves cuántos emails se enviaron, abrieron, etc.

---

## 📋 Paso 1: Crear Cuenta en Brevo (2 minutos)

1. **Ve a:** https://www.brevo.com/
2. Click en **"Sign Up Free"** (arriba a la derecha)
3. **Completa el formulario:**
   - First name: Tu nombre
   - Last name: Tu apellido
   - Email: `ignaciodalesiolopez@gmail.com` (o el que prefieras)
   - Password: Crea una contraseña segura
4. Click en **"Create my account"**
5. **Verifica tu email:**
   - Revisa tu bandeja de entrada
   - Click en el enlace de verificación

---

## 🔑 Paso 2: Obtener API Key (1 minuto)

1. **Login en Brevo:** https://app.brevo.com/
2. Click en tu **nombre** (arriba a la derecha)
3. Click en **"SMTP & API"**
4. Ve a la pestaña **"API Keys"**
5. Click en **"Generate a new API key"**
6. **Nombre:** Escribe "GozaMadrid Backend"
7. Click en **"Generate"**
8. **IMPORTANTE:** Copia la API Key completa (empieza con `xkeysib-...`)
   - La verás solo UNA VEZ
   - Si la pierdes, deberás generar una nueva

---

## ✉️ Paso 3: Verificar Email Remitente (1 minuto)

Brevo requiere que verifiques el email que usarás como remitente.

1. En Brevo, ve a **"Senders"** (menú lateral)
2. Click en **"Add a sender"**
3. **Email:** `ignaciodalesiolopez@gmail.com`
4. **Name:** "GozaMadrid"
5. Click en **"Add"**
6. **Verifica tu email:**
   - Revisa tu bandeja de entrada de `ignaciodalesiolopez@gmail.com`
   - Click en el enlace de verificación de Brevo
7. **Listo:** El email quedará verificado y podrás usarlo

---

## ⚙️ Paso 4: Configurar Variables en Render (2 minutos)

1. **Ve a Render:** https://dashboard.render.com/
2. Click en tu servicio **"nextjs-gozamadrid-qrfk"**
3. Click en **"Environment"** (menú lateral izquierdo)
4. **Agrega estas variables** (una por una):

### Variables Obligatorias

```
BREVO_API_KEY = [pega aquí la API Key que copiaste]
```

**Ejemplo:** `BREVO_API_KEY = xkeysib-1234567890abcdef...`

```
EMAIL_FROM = ignaciodalesiolopez@gmail.com
```

```
EMAIL_FROM_NAME = GozaMadrid
```

```
FRONTEND_URL = https://blogs.realestategozamadrid.com
```

### Variables Opcionales

```
EMAIL_RECIPIENT = ignaciodalesio1995@gmail.com,marta@gozamadrid.com
```
*(Para copias de emails al admin)*

5. **Click en "Save Changes"**
6. Render hará **redeploy automático** (espera 2-3 minutos)

---

## 🚀 Paso 5: Deploy del Código (3 minutos)

Necesitas hacer push del código actualizado:

```bash
cd /Users/nachodalesio/Documents/Programación/nextjs-gozamadrid/servidor

# Ver cambios
git status

# Agregar cambios
git add utils/email.js render.env.example test-password-recovery.js

# Commit
git commit -m "feat: migrar de Gmail SMTP a Brevo API para Render"

# Push
git push
```

Render hará el deploy automáticamente.

---

## 🧪 Paso 6: Probar (1 minuto)

### Opción A: Desde el Frontend

1. Ve a: https://blogs.realestategozamadrid.com/recover-password
2. Ingresa tu email: `mblp66@gmail.com`
3. Click en "Enviar"
4. **Revisa tu email** (puede tardar 1-2 minutos)

### Opción B: Con curl

```bash
curl -X POST https://nextjs-gozamadrid-qrfk.onrender.com/api/auth/recover-password \
  -H "Content-Type: application/json" \
  -d '{"email":"mblp66@gmail.com"}'
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Token enviado al email"
}
```

---

## 🔍 Verificar Logs en Render

1. Ve a Render → Tu servicio → **Logs**
2. Busca estas líneas:

**✅ Si funciona correctamente:**
```
[utils/email.js] Configurado con Brevo API (300 emails/día gratis).
[SendEmail Brevo] Enviando email a: mblp66@gmail.com
[SendEmail Brevo] Email enviado exitosamente. MessageId: xxx
```

**❌ Si hay error:**
```
Error: BREVO_API_KEY no está configurada
```
→ Verifica que agregaste la variable en Render

```
Brevo API error: Invalid API key
```
→ La API Key es incorrecta, genera una nueva

```
Brevo API error: Sender email not verified
```
→ Verifica el email remitente en Brevo (Paso 3)

---

## 📊 Ver Estadísticas en Brevo

1. **Login en Brevo:** https://app.brevo.com/
2. Ve a **"Statistics"** (menú lateral)
3. Verás:
   - Emails enviados
   - Emails entregados
   - Emails abiertos
   - Clicks en enlaces

---

## ⚠️ Troubleshooting

### Error: "BREVO_API_KEY no está configurada"

**Solución:** Agrega la variable en Render → Environment

### Error: "Invalid API key"

**Solución:** 
1. Ve a Brevo → SMTP & API → API Keys
2. Genera una nueva API Key
3. Actualiza la variable en Render

### Error: "Sender email not verified"

**Solución:**
1. Ve a Brevo → Senders
2. Verifica que `ignaciodalesiolopez@gmail.com` esté verificado
3. Si no lo está, click en "Add a sender" y verifica el email

### Email no llega

**Posibles causas:**
1. **Revisa spam** - Los primeros emails pueden ir a spam
2. **Email incorrecto** - Verifica que el email del usuario sea correcto
3. **Cuota excedida** - Revisa en Brevo si alcanzaste el límite de 300 emails/día

### Email va a spam

**Soluciones:**
1. En Brevo, configura **SPF y DKIM** (Settings → Domains)
2. Agrega un dominio personalizado en lugar de usar Gmail
3. Los emails transaccionales (como recuperación de contraseña) suelen tener mejor deliverability

---

## 📈 Límites de Brevo (Plan Gratuito)

- **300 emails/día** (9,000/mes)
- Ilimitados contactos
- Sin límite de tiempo
- Sin requerir tarjeta de crédito

**Si necesitas más:**
- Plan Starter: $25/mes - 10,000 emails/mes
- Pero 300/día es más que suficiente para recuperación de contraseñas

---

## 🎉 Resumen

**Antes (Gmail SMTP):**
```
❌ Puerto 587 bloqueado en Render
❌ Puerto 465 bloqueado en Render
❌ Timeout en todas las conexiones SMTP
```

**Ahora (Brevo API):**
```
✅ Usa API REST (puerto 443 - HTTPS)
✅ NO bloqueado por Render
✅ 300 emails/día gratis
✅ Mejor deliverability
✅ Panel de estadísticas
```

---

## 🔗 Enlaces Útiles

- **Brevo:** https://www.brevo.com/
- **Dashboard:** https://app.brevo.com/
- **Documentación API:** https://developers.brevo.com/
- **Soporte:** https://help.brevo.com/

---

## ✅ Checklist Final

- [ ] Cuenta de Brevo creada y verificada
- [ ] API Key generada y copiada
- [ ] Email remitente verificado en Brevo
- [ ] Variable `BREVO_API_KEY` agregada en Render
- [ ] Variable `EMAIL_FROM` agregada en Render
- [ ] Variable `FRONTEND_URL` agregada en Render
- [ ] Código actualizado y pusheado a Git
- [ ] Render hizo redeploy automático
- [ ] Logs de Render sin errores
- [ ] Email de prueba enviado y recibido
- [ ] Link de recuperación funciona correctamente

**¡Todo listo para producción!** 🚀
