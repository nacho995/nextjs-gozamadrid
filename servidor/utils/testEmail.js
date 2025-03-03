import emailConfig from '../config/emailConfig.js';
import dotenv from 'dotenv';

// Cargar variables de entorno
dotenv.config();

// Función para probar el envío de email
const testEmail = async () => {
    try {
        console.log('⏳ Iniciando prueba de envío de email...');
        console.log('📧 Configuración de correo:');
        console.log({
            host: process.env.EMAIL_HOST,
            port: process.env.EMAIL_PORT,
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS ? '******' : 'no configurado',
            to: process.env.EMAIL_TO
        });
        
        // Verificar variables de entorno
        if (!process.env.EMAIL_TO) {
            console.error('❌ Variable EMAIL_TO no configurada');
            return;
        }
        
        const destinatarios = process.env.EMAIL_TO.split(',').map(email => email.trim());
        console.log(`📧 Enviando email de prueba a: ${destinatarios.join(', ')}`);
        
        // Contenido de prueba
        const testHtml = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Email de Prueba</h2>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                    <p>Este es un email de prueba enviado desde el servidor de Goza Madrid.</p>
                    <p>Fecha y hora: ${new Date().toLocaleString('es-ES')}</p>
                    <p>Si estás viendo este mensaje, la configuración de email funciona correctamente.</p>
                </div>
            </div>
        `;
        
        // Enviar a cada destinatario
        let successCount = 0;
        const errors = [];
        
        for (const emailTo of destinatarios) {
            try {
                await emailConfig.sendEmail({
                    to: emailTo,
                    subject: 'Prueba de Email - Goza Madrid',
                    html: testHtml
                });
                successCount++;
                console.log(`✅ Email de prueba enviado a: ${emailTo}`);
            } catch (error) {
                console.error(`❌ Error al enviar a ${emailTo}:`, error.message);
                errors.push(error.message);
            }
        }
        
        // Resultado
        if (successCount > 0) {
            console.log(`✅ Prueba completada: ${successCount} de ${destinatarios.length} emails enviados correctamente`);
        } else {
            console.error(`❌ No se pudo enviar ningún email. Errores: ${errors.join('; ')}`);
        }
        
    } catch (error) {
        console.error('❌ Error en la prueba de email:', error);
    }
};

// Ejecutar prueba
testEmail(); 