import nodemailer from 'nodemailer';

export const sendEmail = async (options) => {
  try {
    // Crear un transporter con la configuración correcta para Gmail
    const transporter = nodemailer.createTransport({
      service: 'gmail',  // Usar 'gmail' en lugar de host/port manual
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      secure: true,  // Para conexión segura
      debug: true    // Para ver logs detallados
    });

    // Obtener los emails de administrador de la variable de entorno
    const adminEmails = process.env.EMAIL_TO ? process.env.EMAIL_TO.split(',') : [];
    
    // Definir las opciones del email
    const mailOptions = {
      from: `"GozaMadrid" <${process.env.EMAIL_FROM}>`,
      to: options.email,
      bcc: options.sendCopyToAdmin ? adminEmails : [], // Agregar copia oculta a admins si se solicita
      subject: options.subject,
      html: options.html
    };

    console.log('Intentando enviar email a:', options.email);
    if (options.sendCopyToAdmin && adminEmails.length > 0) {
      console.log('Con copia oculta (BCC) a:', adminEmails.join(', '));
    }
    
    // Enviar el email y capturar información de envío
    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado correctamente:', info.response);
    return info;
  } catch (error) {
    console.error('Error al enviar email:', error);
    throw error;
  }
}; 