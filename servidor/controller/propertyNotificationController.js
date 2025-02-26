import emailConfig from '../config/emailConfig.js';

export const sendPropertyNotification = async (req, res) => {
    try {
        // Asegurarse que la respuesta sea JSON
        res.setHeader('Content-Type', 'application/json');
        
        const { date, time, email, name, phone, property, propertyAddress, offer } = req.body;

        // Validar que se recibieron los datos necesarios
        if (!email || !name || !phone || !property || !propertyAddress) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }

        // Validar variables de entorno
        if (!process.env.EMAIL_TO) {
            return res.status(500).json({
                success: false,
                message: 'Error en la configuración del servidor'
            });
        }

        let emailContent;
        let emailSubject;

        // Si hay una oferta, es una notificación de oferta
        if (offer !== undefined) {
            emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Nueva Oferta de Propiedad</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p><strong>Propiedad:</strong> ${propertyAddress}</p>
                        <p><strong>Oferta:</strong> ${offer}€</p>
                        <p><strong>Nombre:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teléfono:</strong> ${phone}</p>
                    </div>
                </div>
            `;
            emailSubject = `Nueva oferta para ${propertyAddress}`;
        } 
        // Si hay fecha y hora, es una solicitud de visita
        else if (date && time) {
            const formattedDate = new Date(date).toLocaleDateString('es-ES');
            const formattedTime = new Date(time).toLocaleTimeString('es-ES', {
                hour: '2-digit',
                minute: '2-digit'
            });

            emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Nueva Solicitud de Visita</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p><strong>Propiedad:</strong> ${propertyAddress}</p>
                        <p><strong>Fecha:</strong> ${formattedDate}</p>
                        <p><strong>Hora:</strong> ${formattedTime}</p>
                        <p><strong>Nombre:</strong> ${name}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teléfono:</strong> ${phone}</p>
                    </div>
                </div>
            `;
            emailSubject = `Nueva solicitud de visita para ${propertyAddress}`;
        } else {
            return res.status(400).json({
                success: false,
                message: 'Tipo de notificación no válido'
            });
        }

        try {
            await emailConfig.sendEmail({
                to: process.env.EMAIL_TO,
                subject: emailSubject,
                html: emailContent
            });

            return res.status(200).json({
                success: true,
                message: 'Notificación enviada correctamente'
            });
        } catch (emailError) {
            console.error('Error al enviar email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el email'
            });
        }

    } catch (error) {
        console.error('Error en propertyNotificationController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}; 