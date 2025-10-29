# Servicios SMTP Gratuitos para Producción

## 🏆 Opción Recomendada: Brevo (ex-Sendinblue)

### ✨ Ventajas
- 300 emails/día **GRATIS** para siempre
- No requiere tarjeta de crédito
- Mejor deliverability que Gmail
- Panel de control con estadísticas
- API SMTP estándar (funciona con Nodemailer)

### 📝 Configuración en Brevo

#### Paso 1: Crear Cuenta
1. Ve a: https://www.brevo.com/
2. Click en "Sign Up Free"
3. Completa el registro (email + contraseña)
4. Verifica tu email

#### Paso 2: Obtener Credenciales SMTP
1. Login en Brevo
2. Ve a: **Settings → SMTP & API**
3. En la sección "SMTP", verás:
   - **SMTP Server:** `smtp-relay.brevo.com`
   - **Port:** `587`
   - **Login:** Tu email de Brevo
   - **SMTP Key:** Click en "Create a new SMTP key"

#### Paso 3: Configurar en Render

Variables de entorno para Brevo:

```env
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email_de_brevo@gmail.com
EMAIL_PASSWORD=tu_smtp_key_generada
EMAIL_FROM=tu_email_de_brevo@gmail.com
EMAIL_RECIPIENT=admin@tudominio.com
FRONTEND_URL=https://realestategozamadrid.com
```

**IMPORTANTE:** 
- `EMAIL_PASSWORD` debe ser la **SMTP Key** generada en Brevo, NO tu contraseña de cuenta
- `EMAIL_FROM` debe ser un email verificado en Brevo

#### Paso 4: Verificar un Remitente
1. En Brevo: **Senders → Add a Sender**
2. Ingresa el email que usarás como remitente
3. Verifica el email (recibirás un link de confirmación)
4. Usa ese email verificado en `EMAIL_FROM`

---

## 🔥 Comparativa de Servicios Gratuitos

| Servicio | Emails Gratis | Tarjeta Requerida | Deliverability | Facilidad |
|----------|---------------|-------------------|----------------|-----------|
| **Brevo** | 300/día | ❌ NO | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Gmail** | 500/día | ❌ NO | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **Mailgun** | 5,000/mes | ✅ SÍ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐ |
| **Elastic Email** | 100/día | ❌ NO | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| **Postmark** | 100/mes | ✅ SÍ | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 📧 Opción 2: Mailgun

### Características
- **5,000 emails/mes** gratis (aprox. 166/día)
- Requiere tarjeta de crédito (pero NO te cobran si no pasas el límite)
- Excelente para producción

### Configuración
```env
EMAIL_HOST=smtp.mailgun.org
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=postmaster@tu-dominio.mailgun.org
EMAIL_PASSWORD=tu_password_de_mailgun
```

1. Registro: https://www.mailgun.com/
2. Verifica tu dominio (o usa el sandbox)
3. SMTP Credentials → Obtén user y password

---

## 📨 Opción 3: Elastic Email

### Características
- **100 emails/día** gratis (3,000/mes)
- NO requiere tarjeta de crédito
- Buena deliverability

### Configuración
```env
EMAIL_HOST=smtp.elasticemail.com
EMAIL_PORT=2525
EMAIL_SECURE=false
EMAIL_USER=tu_email@ejemplo.com
EMAIL_PASSWORD=tu_api_key
```

1. Registro: https://elasticemail.com/
2. Settings → Create SMTP Credentials
3. Copia las credenciales

---

## 💰 Opción 4: Gmail (Ya configurado)

### Características
- **500 emails/día** gratis
- NO requiere tarjeta de crédito
- Fácil de configurar
- ⚠️ Puede ir a spam más fácilmente

### Configuración (Ya la tienes)
```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password
```

---

## 🎯 Recomendación Final

### Para Desarrollo/Testing
✅ **Usa Gmail** (ya configurado)
- Es lo más simple
- No requiere verificación de dominio
- Suficiente para testing

### Para Producción
✅ **Usa Brevo**
- Mejor deliverability
- Panel de estadísticas
- Profesional
- 300 emails/día es suficiente para recuperación de contraseñas

---

## 🔄 Cómo Cambiar de Gmail a Brevo

Si decides migrar a Brevo, solo necesitas cambiar las variables de entorno en Render:

1. **Crear cuenta en Brevo** (5 minutos)
2. **Generar SMTP Key**
3. **Verificar remitente**
4. **Actualizar variables en Render:**

```env
# Cambiar estas 3 líneas:
EMAIL_HOST=smtp-relay.brevo.com
EMAIL_USER=tu_email_brevo@gmail.com
EMAIL_PASSWORD=tu_brevo_smtp_key
```

5. **Guardar cambios** → Render redeploy automático
6. **Listo!** Todo funciona igual

---

## 🧪 Probar Cualquier Servicio

El script de prueba funciona con cualquier servicio:

```bash
# Configurar variables en .env
npm run test:email
```

---

## ❓ FAQ

### ¿Cuál es el más confiable?
**Brevo** o **Mailgun** tienen la mejor deliverability.

### ¿Cuál no requiere tarjeta?
**Brevo**, **Gmail**, y **Elastic Email**.

### ¿Cuál tiene más límite gratuito?
**Gmail** (500/día) o **Mailgun** (5,000/mes).

### ¿Cuál es más fácil de configurar?
**Gmail** (ya lo tienes configurado).

### ¿Cuál recomiendas para producción?
**Brevo** - Balance perfecto entre facilidad, límites y deliverability.

---

## 💡 Resumen Ejecutivo

**Ahora (Desarrollo):**
- ✅ Gmail está bien (ya configurado, gratis, 500/día)

**Antes de Lanzar (Producción):**
- ✅ Migra a Brevo (15 minutos, gratis, mejor deliverability)

**Si tienes presupuesto:**
- ✅ Mailgun o SendGrid (desde $15/mes)

---

## 🚀 Estado Actual

Tu configuración actual con **Gmail + Nodemailer es 100% GRATUITA** y funciona perfecto para:
- ✅ Desarrollo
- ✅ Testing
- ✅ Proyectos pequeños
- ✅ Hasta 500 usuarios/día solicitando recuperación

Para producción con más volumen, considera Brevo (también gratis hasta 300/día).
