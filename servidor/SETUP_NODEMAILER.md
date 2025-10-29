# Configuración de Nodemailer para Recuperación de Contraseñas

## 📋 Pasos de Configuración

### 1. Generar App Password de Gmail

**IMPORTANTE:** No uses tu contraseña normal de Gmail. Debes generar una "App Password".

1. **Ir a tu cuenta de Google:**
   - Visita: https://myaccount.google.com/

2. **Habilitar verificación en dos pasos (si no la tienes):**
   - Menú izquierdo: "Seguridad"
   - Busca "Verificación en dos pasos"
   - Sigue los pasos para habilitarla

3. **Generar App Password:**
   - Una vez habilitada la verificación en dos pasos
   - Busca "Contraseñas de aplicaciones" en la misma página de Seguridad
   - Selecciona "Correo" como la app
   - Selecciona "Otro (nombre personalizado)" como dispositivo
   - Escribe "GozaMadrid Server" o cualquier nombre
   - Click en "Generar"
   - **Copia la contraseña de 16 caracteres que aparece** (sin espacios)

### 2. Configurar Variables de Entorno en Render

1. **Ve a tu dashboard de Render:**
   - https://dashboard.render.com/

2. **Selecciona tu servicio backend**

3. **Ve a "Environment" en el menú lateral**

4. **Agrega las siguientes variables:**

```env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=la_app_password_de_16_caracteres
EMAIL_FROM=tu_email@gmail.com
EMAIL_RECIPIENT=tu_email@gmail.com
FRONTEND_URL=https://realestategozamadrid.com
```

5. **Reemplaza los valores:**
   - `EMAIL_USER`: Tu email de Gmail completo
   - `EMAIL_PASSWORD`: La App Password de 16 caracteres (SIN espacios)
   - `EMAIL_FROM`: El mismo email o uno personalizado
   - `EMAIL_RECIPIENT`: Email del admin que recibirá copias
   - `FRONTEND_URL`: URL de tu frontend en producción

6. **Click en "Save Changes"**

### 3. Probar Localmente (Opcional)

Antes de hacer deploy a Render, prueba localmente:

1. **Crea un archivo `.env` en `/servidor`:**
   ```bash
   cd servidor
   cp render.env.example .env
   ```

2. **Edita `.env` con tus credenciales reales**

3. **Ejecuta el script de prueba:**
   ```bash
   npm run test:email
   ```

4. **Si funciona, verás:**
   ```
   ✅ Email de prueba enviado correctamente!
   ```

5. **Revisa tu bandeja de entrada** (o spam)

### 4. Deploy a Render

1. **Hacer commit de los cambios:**
   ```bash
   git add .
   git commit -m "feat: configurar Nodemailer para recuperación de contraseñas"
   git push
   ```

2. **Render hará el deploy automáticamente**

3. **Verificar logs en Render:**
   - Ve a tu servicio en Render
   - Click en "Logs"
   - Busca mensajes como:
     - `[utils/email.js] Configurado con Nodemailer.`
     - `[authController] forgotPassword`

### 5. Probar los Endpoints

**Solicitar recuperación:**
```bash
curl -X POST https://tu-app.onrender.com/api/auth/recover-password \
  -H "Content-Type: application/json" \
  -d '{"email":"usuario@ejemplo.com"}'
```

**Respuesta esperada:**
```json
{
  "status": "success",
  "message": "Token enviado al email"
}
```

## 🔧 Troubleshooting

### Error: "Invalid login"
- ❌ Estás usando tu contraseña normal de Gmail
- ✅ Usa la App Password de 16 caracteres

### Error: "Connection timeout"
Render puede estar bloqueando el puerto 587. Prueba con:
```env
EMAIL_PORT=465
EMAIL_SECURE=true
```

### Error: "Authentication failed"
- Verifica que `EMAIL_USER` sea correcto
- Verifica que `EMAIL_PASSWORD` no tenga espacios
- Verifica que la App Password no haya expirado

### Los emails van a spam
- Normal en fase de desarrollo
- Considera usar un dominio personalizado
- Configura SPF, DKIM y DMARC records

## 🌐 Alternativas a Gmail

Si Gmail no funciona o prefieres otra opción:

### Outlook/Hotmail
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Yahoo
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

### Servicios SMTP Gratuitos

1. **Brevo (ex-Sendinblue)** - 300 emails/día gratis
   - https://www.brevo.com/
   - Más confiable que Gmail en servidores

2. **Mailgun** - 5,000 emails/mes gratis
   - https://www.mailgun.com/
   - Muy usado en producción

3. **Elastic Email** - Plan gratuito disponible
   - https://elasticemail.com/

## 📝 Estructura de Archivos Modificados

```
servidor/
├── models/
│   └── userSchema.js          # ✅ Método createPasswordResetToken agregado
├── controller/
│   └── authController.js      # ✅ Ya existía con forgotPassword y resetPassword
├── routes/
│   └── authRoutes.js          # ✅ Ya existía con las rutas
├── utils/
│   └── email.js               # ✅ Migrado de SendGrid a Nodemailer
├── server.js                  # ✅ Rutas montadas en /api/auth
├── test-password-recovery.js  # ✅ Script de prueba nuevo
├── package.json               # ✅ Script npm run test:email agregado
├── render.env.example         # ✅ Actualizado con variables Nodemailer
├── ENDPOINTS_PASSWORD_RECOVERY.md  # 📚 Documentación completa
└── SETUP_NODEMAILER.md        # 📚 Esta guía
```

## ✅ Checklist Final

Antes de considerar terminado:

- [ ] App Password de Gmail generada
- [ ] Variables de entorno configuradas en Render
- [ ] Probado localmente con `npm run test:email`
- [ ] Deploy realizado en Render
- [ ] Logs verificados en Render (sin errores)
- [ ] Endpoint probado con curl o Postman
- [ ] Email recibido en la bandeja de entrada
- [ ] Link de recuperación funcional desde el email

## 🆘 Soporte

Si sigues teniendo problemas:

1. Revisa los logs completos en Render
2. Busca el error específico en Google
3. Verifica que todas las variables estén correctamente escritas (sin espacios extra)
4. Prueba con puerto 465 si 587 no funciona
5. Considera usar Brevo en lugar de Gmail para producción
