# Endpoints de Recuperación de Contraseña

## Configuración Necesaria

### Variables de Entorno Requeridas

Asegúrate de tener estas variables configuradas en Render:

```env
# Nodemailer - Configuración SMTP
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=tu_email@gmail.com
EMAIL_PASSWORD=tu_app_password_de_gmail

# Email remitente (opcional, usa EMAIL_USER si no se especifica)
EMAIL_FROM=noreply@tudominio.com

# Email del administrador (opcional, para copias)
EMAIL_RECIPIENT=admin@tudominio.com

# URL del frontend (para el link de reset)
FRONTEND_URL=https://tudominio.com

# MongoDB (debe estar configurada)
MONGODB_URI=tu_mongodb_uri
```

### Cómo obtener una App Password de Gmail

1. Ve a tu cuenta de Google: https://myaccount.google.com/
2. Seguridad → Verificación en dos pasos (debes habilitarla primero)
3. Contraseñas de aplicaciones
4. Selecciona "Correo" y "Otro (nombre personalizado)"
5. Genera la contraseña de 16 caracteres
6. Usa esa contraseña en `EMAIL_PASSWORD`

### Alternativas a Gmail

Si prefieres otro proveedor SMTP:

**Outlook/Hotmail:**
```env
EMAIL_HOST=smtp-mail.outlook.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Yahoo:**
```env
EMAIL_HOST=smtp.mail.yahoo.com
EMAIL_PORT=587
EMAIL_SECURE=false
```

**Otros proveedores SMTP:** Consulta la documentación de tu proveedor.

## Endpoints Implementados

### 1. Solicitar Recuperación de Contraseña

**Endpoint:** `POST /api/auth/recover-password`

**Descripción:** Envía un email con un token de recuperación al usuario.

**Request Body:**
```json
{
  "email": "usuario@ejemplo.com"
}
```

**Respuestas:**

**Éxito (200):**
```json
{
  "status": "success",
  "message": "Token enviado al email"
}
```

**Error - Email no proporcionado (400):**
```json
{
  "status": "error",
  "message": "Por favor proporcione un email"
}
```

**Error - Usuario no existe (404):**
```json
{
  "status": "error",
  "message": "No existe un usuario con ese email"
}
```

**Error - Envío de email falló (500):**
```json
{
  "status": "error",
  "message": "Error al enviar el email. Inténtelo más tarde."
}
```

### 2. Restablecer Contraseña

**Endpoint:** `PATCH /api/auth/:token`

**Descripción:** Restablece la contraseña del usuario usando el token recibido por email.

**Parámetros de URL:**
- `token`: Token de recuperación recibido por email

**Request Body:**
```json
{
  "password": "nuevaContraseña123"
}
```

**Respuestas:**

**Éxito (200):**
```json
{
  "status": "success",
  "message": "Contraseña actualizada correctamente"
}
```

**Error - Token inválido o expirado (400):**
```json
{
  "status": "error",
  "message": "El token es inválido o ha expirado"
}
```

**Error del servidor (500):**
```json
{
  "status": "error",
  "message": "Ocurrió un error al procesar su solicitud"
}
```

## Flujo de Uso

1. **Usuario olvida su contraseña:**
   - El frontend hace POST a `/api/auth/recover-password` con el email
   - El backend genera un token y lo envía por email
   - El token es válido por 10 minutos

2. **Usuario recibe el email:**
   - El email contiene un enlace: `{FRONTEND_URL}/reset-password/{token}`
   - El usuario hace click en el enlace

3. **Usuario establece nueva contraseña:**
   - El frontend presenta un formulario para la nueva contraseña
   - El frontend hace PATCH a `/api/auth/{token}` con la nueva contraseña
   - El backend valida el token y actualiza la contraseña

## Ejemplo de Implementación en Frontend

```javascript
// 1. Solicitar recuperación
const requestPasswordReset = async (email) => {
  const response = await fetch('https://api.tudominio.com/api/auth/recover-password', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email })
  });
  return await response.json();
};

// 2. Restablecer contraseña
const resetPassword = async (token, newPassword) => {
  const response = await fetch(`https://api.tudominio.com/api/auth/${token}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ password: newPassword })
  });
  return await response.json();
};
```

## Seguridad

- Los tokens se almacenan hasheados (SHA256) en la base de datos
- Los tokens expiran después de 10 minutos
- Si el envío del email falla, el token se elimina de la base de datos
- Se envía una copia del email al administrador (opcional)

## Testing

Para probar los endpoints en Render:

1. **Verificar que el servidor esté corriendo:**
   ```bash
   curl https://tu-app.onrender.com/api/health
   ```

2. **Probar solicitud de recuperación:**
   ```bash
   curl -X POST https://tu-app.onrender.com/api/auth/recover-password \
     -H "Content-Type: application/json" \
     -d '{"email":"test@ejemplo.com"}'
   ```

3. **Verificar logs en Render:**
   - Ve al dashboard de Render
   - Abre los logs de tu servicio
   - Busca mensajes de `[SendEmail]` o `[authController]`

## Troubleshooting

### El email no llega

1. **Verifica las credenciales SMTP:**
   - `EMAIL_USER` y `EMAIL_PASSWORD` deben estar configuradas
   - Si usas Gmail, verifica que uses una App Password, no tu contraseña normal
   - Verifica que la verificación en dos pasos esté habilitada en Gmail

2. **Revisa los logs en Render:**
   - Ve al dashboard de Render
   - Abre los logs de tu servicio
   - Busca mensajes de `[SendEmail]` o `[authController]`
   - Busca errores como "Invalid login" o "Authentication failed"

3. **Verifica la configuración del servidor SMTP:**
   - Gmail: `smtp.gmail.com:587`
   - Outlook: `smtp-mail.outlook.com:587`
   - Verifica que `EMAIL_HOST` y `EMAIL_PORT` sean correctos

4. **Verifica que el email del usuario exista en la base de datos**

5. **Errores comunes:**
   - `Invalid login`: App Password incorrecta o no generada
   - `Timeout`: Render puede estar bloqueando el puerto 587, prueba con el puerto 465 y `EMAIL_SECURE=true`
   - `Authentication failed`: Credenciales incorrectas

### Token inválido o expirado

1. Verifica que no hayan pasado más de 10 minutos
2. Asegúrate de usar el token exacto del email
3. Cada token solo puede usarse una vez

### Error de CORS

Si hay problemas de CORS desde el frontend, asegúrate de que el origen esté en la lista de orígenes permitidos en `server.js`.

### Alternativa si Gmail no funciona en Render

Algunos servicios de hosting bloquean puertos SMTP. Si Gmail no funciona:

1. **Prueba con puerto 465 (SSL):**
   ```env
   EMAIL_PORT=465
   EMAIL_SECURE=true
   ```

2. **Usa un servicio SMTP de terceros gratuito:**
   - **Brevo (ex-Sendinblue)**: 300 emails/día gratis
   - **Mailgun**: 5,000 emails/mes gratis
   - **Elastic Email**: Plan gratuito disponible
