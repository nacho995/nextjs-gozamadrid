import emailConfig from '../config/emailConfig.js';
import PropertyVisit from '../models/propertyVisitSchema.js';

export const sendPropertyNotification = async (req, res) => {
    // Asegurarse que la respuesta sea JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
        console.log('📩 Recibida solicitud de notificación:', req.body);
        
        const { date, time, email, name, phone, property, propertyAddress, message } = req.body;

        // Validar que se recibieron los datos necesarios
        if (!email || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de contacto requeridos'
            });
        }

        if (!property || !propertyAddress || !date || !time) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de la visita'
            });
        }

        // Validar variables de entorno
        if (!process.env.EMAIL_TO) {
            console.error('❌ Variable de entorno EMAIL_TO no configurada');
            return res.status(500).json({
                success: false,
                message: 'Error en la configuración del servidor de email'
            });
        }

        // Guardar la visita en la base de datos
        const visitData = await PropertyVisit.create({
            property,
            propertyAddress,
            date: new Date(date),
            time: new Date(time),
            email,
            name,
            phone,
            message,
            emailSent: {
                success: false,
                attempts: 0
            }
        });

        // Formatear la fecha y hora para el email
        const formattedDate = new Date(date).toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
        
        const formattedTime = new Date(time).toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Nueva Solicitud de Visita</h2>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                    <p><strong>Propiedad:</strong> ${propertyAddress}</p>
                    <p><strong>Fecha:</strong> ${formattedDate}</p>
                    <p><strong>Hora:</strong> ${formattedTime}</p>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    ${message ? `<p><strong>Mensaje:</strong> ${message}</p>` : ''}
                </div>
            </div>
        `;

        const emailSubject = `Nueva solicitud de visita para ${propertyAddress}`;

        try {
            // Obtener los emails y dividirlos en un array
            const emailList = process.env.EMAIL_TO.split(',').map(email => email.trim());
            console.log('📧 Enviando notificación a:', emailList);

            // Enviar a cada destinatario
            let successCount = 0;
            let errorMessages = [];

            for (const emailTo of emailList) {
                try {
                    await emailConfig.sendEmail({
                        to: emailTo,
                        subject: emailSubject,
                        html: emailContent
                    });
                    successCount++;
                } catch (singleEmailError) {
                    errorMessages.push(`Error al enviar a ${emailTo}: ${singleEmailError.message}`);
                }
            }

            // Actualizar el estado de la visita
            await PropertyVisit.findByIdAndUpdate(visitData._id, {
                'emailSent.success': successCount > 0,
                'emailSent.error': errorMessages.join('; '),
                'emailSent.attempts': 1,
                'emailSent.lastAttempt': new Date()
            });

            // Si al menos un email se envió correctamente, considerar éxito
            if (successCount > 0) {
                return res.status(200).json({
                    success: true,
                    message: `Notificación enviada correctamente a ${successCount} de ${emailList.length} destinatarios`,
                    errors: errorMessages.length > 0 ? errorMessages : undefined
                });
            } else {
                throw new Error(errorMessages.join('; '));
            }
        } catch (emailError) {
            console.error('❌ Error al enviar email:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el email',
                error: emailError.message
            });
        }
    } catch (error) {
        console.error('❌ Error en propertyNotificationController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}; 