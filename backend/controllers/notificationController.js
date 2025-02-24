const transporter = require('../config/emailConfig');

const sendNotification = async (req, res) => {
    try {
        const { type, data } = req.body;
        let emailContent;
        let subject;

        if (type === 'visit') {
            subject = 'Nueva Solicitud de Visita';
            emailContent = `
                <h2>Nueva Solicitud de Visita</h2>
                <p><strong>Fecha:</strong> ${new Date(data.date).toLocaleDateString('es-ES')}</p>
                <p><strong>Hora:</strong> ${data.time}:00</p>
                <p><strong>Propiedad ID:</strong> ${data.propertyId}</p>
                <p><strong>Dirección:</strong> ${data.propertyAddress}</p>
                <p><strong>Contacto:</strong></p>
                <p>Nombre: ${data.contactInfo?.name || 'No proporcionado'}</p>
                <p>Email: ${data.contactInfo?.email || 'No proporcionado'}</p>
                <p>Teléfono: ${data.contactInfo?.phone || 'No proporcionado'}</p>
            `;
        } else if (type === 'offer') {
            subject = 'Nueva Oferta Recibida';
            emailContent = `
                <h2>Nueva Oferta Recibida</h2>
                <p><strong>Precio Ofertado:</strong> ${data.offerAmount.toLocaleString()}€</p>
                <p><strong>Precio Original:</strong> ${data.originalPrice.toLocaleString()}€</p>
                <p><strong>Diferencia:</strong> ${(data.originalPrice - data.offerAmount).toLocaleString()}€</p>
                <p><strong>Propiedad ID:</strong> ${data.propertyId}</p>
                <p><strong>Dirección:</strong> ${data.propertyAddress}</p>
                <p><strong>Contacto:</strong></p>
                <p>Nombre: ${data.contactInfo?.name || 'No proporcionado'}</p>
                <p>Email: ${data.contactInfo?.email || 'No proporcionado'}</p>
                <p>Teléfono: ${data.contactInfo?.phone || 'No proporcionado'}</p>
            `;
        }

        await transporter.sendMail({
            from: process.env.EMAIL_FROM,
            to: process.env.EMAIL_TO,
            subject: subject,
            html: emailContent,
        });

        // Guardar en la base de datos
        await saveNotification({
            type,
            propertyId: data.propertyId,
            details: data,
            status: 'sent'
        });

        res.status(200).json({ 
            success: true,
            message: 'Notificación enviada correctamente' 
        });

    } catch (error) {
        console.error('Error en notificationController:', error);
        res.status(500).json({ 
            success: false,
            message: 'Error al enviar la notificación',
            error: error.message 
        });
    }
};

module.exports = {
    sendNotification
}; 