import dotenv from 'dotenv';
// import nodemailer from 'nodemailer'; // Eliminado

dotenv.config();

/* Eliminado: Configuración del transporter de Nodemailer
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com', 
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: process.env.EMAIL_USER, // generated ethereal user
        pass: process.env.EMAIL_PASSWORD, // generated ethereal password
    },
});
*/

/* Eliminado: Función sendEmail que usaba Nodemailer
export const sendEmail = async (subject, text, html) => {
    try {
        const adminEmails = process.env.EMAIL_TO ? process.env.EMAIL_TO.split(',') : [];
        if (adminEmails.length === 0) {
            console.error('No admin email configured in EMAIL_TO');
            return;
        }
        let info = await transporter.sendMail({
            from: `"GozaMadrid" <${process.env.EMAIL_FROM}>`, // sender address
            to: adminEmails.join(', '), // list of receivers
            subject: subject, // Subject line
            text: text, // plain text body
            html: html, // html body
        });
        console.log('Message sent: %s', info.messageId);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};
*/

// Si hubiera otras funciones de utilidad no relacionadas con el envío directo
// de Nodemailer, se mantendrían aquí. Por ahora, el archivo queda vacío 
// o con comentarios indicando que su funcionalidad fue migrada a SendGrid
// en los controladores respectivos.

console.log('[utils/email.js] Lógica de Nodemailer eliminada. Usar SendGrid desde los controladores.'); 