import dotenv from 'dotenv';
import sgMail from '@sendgrid/mail';
import { ContactForm } from '../models/emailSchema.js';
import { getSystemInfo } from '../utils/systemInfo.js';

dotenv.config();

// Configurar SendGrid (si no está ya hecho globalmente)
if (process.env.SENDGRID_API_KEY) {
    sgMail.setApiKey(process.env.SENDGRID_API_KEY);
} else {
    console.error('❌ [notificationController] SENDGRID_API_KEY no configurada.');
}

export const sendNotification = async (req, res) => {
    const { subject, message, htmlContent } = req.body;
    const verifiedSender = process.env.SENDGRID_VERIFIED_SENDER;
    const adminRecipients = process.env.EMAIL_RECIPIENT ? process.env.EMAIL_RECIPIENT.split(',').map(email => email.trim()) : [];

    if (!subject || (!message && !htmlContent)) {
        return res.status(400).json({ success: false, message: 'Faltan datos: subject y message/htmlContent son requeridos.' });
    }

    if (!verifiedSender) {
        console.error('❌ [notificationController] SENDGRID_VERIFIED_SENDER no configurado.');
        return res.status(500).json({ success: false, message: 'Error de configuración del servidor (email sender).', });
    }
    
    if (adminRecipients.length === 0) {
        console.error('❌ [notificationController] EMAIL_RECIPIENT no configurado o vacío.');
        return res.status(500).json({ success: false, message: 'Error de configuración del servidor (email recipient).', });
    }

    const msg = {
        to: adminRecipients,
        from: { email: verifiedSender, name: "Goza Madrid Notificación" },
        subject: subject,
        text: message || 'Ver el contenido HTML.', // Texto plano de fallback
        html: htmlContent || `<p>${message}</p>`, // Usar HTML si existe, si no, el mensaje
    };

    try {
        console.log(`📧 [notificationController] Intentando enviar notificación SendGrid a: ${adminRecipients.join(', ')}`);
        const response = await sgMail.send(msg);
        console.log('✅ [notificationController] Notificación SendGrid enviada:', response[0].statusCode);
        res.status(200).json({ success: true, message: 'Notificación enviada correctamente.' });
    } catch (error) {
        console.error('❌ [notificationController] Error enviando notificación SendGrid:', error);
        if (error.response) {
            console.error('Body del error de SendGrid:', error.response.body);
        }
        res.status(500).json({ success: false, message: 'Error al enviar la notificación.', error: error.message });
    }
};

export const getNotificationStatus = (req, res) => {
    const systemInfo = getSystemInfo();
    const sendgridConfigured = process.env.SENDGRID_API_KEY && process.env.SENDGRID_VERIFIED_SENDER;
    const recipientsConfigured = process.env.EMAIL_RECIPIENT && process.env.EMAIL_RECIPIENT.length > 0;

    res.status(200).json({
        message: "Estado del servicio de notificaciones (SendGrid)",
        sendgridConfigured: sendgridConfigured,
        recipientsConfigured: recipientsConfigured,
        adminRecipients: process.env.EMAIL_RECIPIENT || "No configurado",
        systemInfo: {
            nodeVersion: systemInfo.nodeVersion,
            platform: systemInfo.platform,
            uptime: systemInfo.uptime
        }
    });
};

