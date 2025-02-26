import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const emailConfig = {
    // Inicializar el transporter
    getTransporter: async () => {
        try {
            const transporter = nodemailer.createTransport({
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                secure: process.env.EMAIL_PORT === '465',
                auth: {
                    user: process.env.EMAIL_USER,
                    pass: process.env.EMAIL_PASSWORD
                }
            });

            // Verificar la conexión
            await transporter.verify();
            console.log('Conexión SMTP establecida correctamente');
            return transporter;
        } catch (error) {
            console.error('Error al configurar el transporter:', error);
            throw new Error('Error en la configuración del servidor de correo');
        }
    },

    // Enviar email
    sendEmail: async ({ to, subject, html }) => {
        try {
            // Validaciones básicas
            if (!to || !subject || !html) {
                throw new Error('Faltan campos requeridos para el envío del correo');
            }

            const transporter = await emailConfig.getTransporter();

            const mailOptions = {
                from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
                to,
                subject,
                html
            };

            const result = await transporter.sendMail(mailOptions);
            console.log('Correo enviado exitosamente:', result.messageId);
            return result;

        } catch (error) {
            console.error('Error al enviar el correo:', error);
            throw error;
        }
    }
};

export default emailConfig;

