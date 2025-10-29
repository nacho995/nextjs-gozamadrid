import dotenv from 'dotenv';
import { ContactForm } from '../models/emailSchema.js';
import { getSystemInfo } from '../utils/systemInfo.js';
import { sendEmail } from '../utils/email.js';

dotenv.config();

// Verificar configuración de Brevo
if (!process.env.BREVO_API_KEY) {
    console.error('❌ [notificationController] BREVO_API_KEY no configurada.');
    console.log('ℹ️  Obtén una API Key gratis en: https://www.brevo.com/');
}

export const sendNotification = async (req, res) => {
    const { subject, message, htmlContent, nombre, email, telefono, prefix } = req.body;
    const adminRecipients = process.env.EMAIL_RECIPIENT ? process.env.EMAIL_RECIPIENT.split(',').map(email => email.trim()) : [];

    if (!subject || (!message && !htmlContent)) {
        return res.status(400).json({ success: false, message: 'Faltan datos: subject y message/htmlContent son requeridos.' });
    }
    
    if (adminRecipients.length === 0) {
        console.error('❌ [notificationController] EMAIL_RECIPIENT no configurado o vacío.');
        return res.status(500).json({ success: false, message: 'Error de configuración del servidor (email recipient).', });
    }

    try {
        // Preparar contenido HTML mejorado
        const emailHtml = htmlContent || `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Nueva Notificación - Goza Madrid</h2>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                    ${nombre ? `<p><strong>Nombre:</strong> ${nombre}</p>` : ''}
                    ${email ? `<p><strong>Email:</strong> ${email}</p>` : ''}
                    ${telefono ? `<p><strong>Teléfono:</strong> ${prefix ? prefix + ' ' : ''}${telefono}</p>` : ''}
                    <hr style="border: 1px solid #ddd;">
                    <p><strong>Mensaje:</strong></p>
                    <p>${message || 'No se proporcionó mensaje.'}</p>
                </div>
                <p style="color: #666; font-size: 12px; margin-top: 20px;">
                    Este email fue enviado desde el formulario de contacto de Goza Madrid.
                </p>
            </div>
        `;

        console.log(`📧 [notificationController] Intentando enviar notificación Brevo a: ${adminRecipients.join(', ')}`);
        
        // Enviar email a todos los destinatarios admin
        for (const recipient of adminRecipients) {
            await sendEmail({
                email: recipient,
                subject: subject,
                html: emailHtml,
                text: message || 'Ver contenido HTML',
                sendCopyToAdmin: false // Ya estamos enviando al admin
            });
        }

        console.log('✅ [notificationController] Notificación Brevo enviada correctamente');
        res.status(200).json({ success: true, message: 'Notificación enviada correctamente.' });
    } catch (error) {
        console.error('❌ [notificationController] Error enviando notificación Brevo:', error);
        res.status(500).json({ success: false, message: 'Error al enviar la notificación.', error: error.message });
    }
};

export const getNotificationStatus = (req, res) => {
    const systemInfo = getSystemInfo();
    const brevoConfigured = process.env.BREVO_API_KEY && process.env.EMAIL_FROM;
    const recipientsConfigured = process.env.EMAIL_RECIPIENT && process.env.EMAIL_RECIPIENT.length > 0;

    res.status(200).json({
        message: "Estado del servicio de notificaciones (Brevo)",
        brevoConfigured: brevoConfigured,
        recipientsConfigured: recipientsConfigured,
        adminRecipients: process.env.EMAIL_RECIPIENT || "No configurado",
        emailFrom: process.env.EMAIL_FROM || "No configurado",
        systemInfo: {
            nodeVersion: systemInfo.nodeVersion,
            platform: systemInfo.platform,
            uptime: systemInfo.uptime
        }
    });
};

