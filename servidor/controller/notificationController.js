import emailConfig from '../config/emailConfig.js';

export const sendNotification = async (req, res) => {
    try {
        const { type, data } = req.body;

        // Validar que se recibieron los datos necesarios
        if (!type || !data) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos requeridos'
            });
        }
        
        // Validar variables de entorno
        if (!process.env.EMAIL_TO) {
            throw new Error('Falta configuración de email destino en variables de entorno');
        }

        console.log('Iniciando envío de email...', { type, data });
        
        if (type === 'contact') {
            // Validar datos del formulario de contacto
            if (!data.name || !data.email || !data.message) {
                return res.status(400).json({
                    success: false,
                    message: 'Faltan campos requeridos en el formulario'
                });
            }

            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Nuevo Mensaje de Contacto</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p><strong>Nombre:</strong> ${data.name}</p>
                        <p><strong>Email:</strong> ${data.email}</p>
                        <p><strong>Teléfono:</strong> ${data.prefix || ''}${data.phone || 'No proporcionado'}</p>
                        <p><strong>Mensaje:</strong></p>
                        <p style="white-space: pre-wrap;">${data.message}</p>
                    </div>
                </div>
            `;

            await emailConfig.sendEmail({
                to: process.env.EMAIL_TO,
                subject: `Nuevo mensaje de contacto de ${data.name}`,
                html: emailContent
            });

            console.log('Email enviado exitosamente');
        } else {
            return res.status(400).json({
                success: false,
                message: 'Tipo de notificación no válido'
            });
        }

        res.status(200).json({ 
            success: true,
            message: 'Notificación enviada correctamente' 
        });

    } catch (error) {
        console.error('Error en notificationController:', {
            message: error.message,
            stack: error.stack
        });

        // Determinar el código de estado apropiado
        const statusCode = error.code === 'EENVELOPE' ? 400 : 500;

        res.status(statusCode).json({ 
            success: false,
            message: 'Error al enviar la notificación',
            error: error.message 
        });
    }
};

