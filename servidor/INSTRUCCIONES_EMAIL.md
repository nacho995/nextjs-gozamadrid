# Instrucciones para Verificar la Configuración de Correo Electrónico

Hemos configurado el sistema para que los correos electrónicos se envíen desde **ignaciodalesiolopez@gmail.com** y lleguen a **marta@gozamadrid.com** y **ignaciodalesio1995@gmail.com**.

## Verificación después del Despliegue

Después de desplegar los cambios en AWS Beanstalk, puedes verificar que la configuración funciona correctamente:

### 1. Verificar el Estado del Servidor

Accede a la siguiente URL para comprobar el estado general del sistema:

```
http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/health
```

### 2. Verificar la Configuración de Correo

Accede a la siguiente URL para verificar específicamente la configuración de correo:

```
http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com/api/health/email
```

### 3. Probar el Envío de Correo

Para probar que los correos se envían correctamente, puedes:

1. Realizar una solicitud de visita desde el frontend
2. Realizar una oferta desde el frontend
3. Usar el formulario de contacto desde el frontend

O, si tienes acceso SSH al servidor, ejecutar:

```bash
cd /var/app/current
node servidor/utils/testEmailFromConsole.js
```

## Posibles Problemas y Soluciones

### Si los correos no llegan:

1. **Verifica los logs del servidor**:
   ```bash
   tail -f /var/log/nodejs/nodejs.log
   ```

2. **Comprueba las credenciales configuradas**:
   - El usuario de correo es: `ignaciodalesiolopez@gmail.com`
   - La contraseña es la configurada en los archivos

3. **Revisa la configuración de seguridad de Gmail**:
   - Asegúrate de que la cuenta permita el acceso de aplicaciones menos seguras o
   - Confirma que se está usando una contraseña de aplicación válida

### Si necesitas cambiar la configuración:

Puedes editar el archivo `servidor/config/email-credentials.json` con los siguientes datos:

```json
{
  "user": "ignaciodalesiolopez@gmail.com",
  "pass": "tjlt deip zhwe mkzm",
  "recipient": "marta@gozamadrid.com,ignaciodalesio1995@gmail.com"
}
``` 