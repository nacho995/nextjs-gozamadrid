import emailConfig from '../config/emailConfig.js';

export const createPropertyOffer = async (req, res) => {
    try {
        // Asegurarse que la respuesta sea JSON
        res.setHeader('Content-Type', 'application/json');
        
        const { offerPrice, offerPercentage, email, name, phone, property, propertyAddress } = req.body;

        // Validar que se recibieron los datos necesarios
        if (!email || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de contacto requeridos'
            });
        }

        if (!property || !propertyAddress || !offerPrice) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de la oferta'
            });
        }

        // Validar variables de entorno
        if (!process.env.EMAIL_TO) {
            return res.status(500).json({
                success: false,
                message: 'Error en la configuración del servidor'
            });
        }

        // Crear el contenido del email
        const emailContent = `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                <h2 style="color: #333;">Nueva Oferta de Propiedad</h2>
                <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                    <p><strong>Propiedad:</strong> ${propertyAddress}</p>
                    <p><strong>Oferta:</strong> ${offerPrice}€</p>
                    <p><strong>Tipo de oferta:</strong> ${offerPercentage || 'Personalizada'}</p>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                </div>
            </div>
        `;
        
        const emailSubject = `Nueva oferta de ${offerPrice}€ para ${propertyAddress}`;

        try {
            // Obtener los emails y dividirlos en un array
            const emailList = process.env.EMAIL_TO.split(',').map(email => email.trim());

            await Promise.all(emailList.map(async (emailTo) => {
                await emailConfig.sendEmail({
                    to: emailTo,
                    subject: emailSubject,
                    html: emailContent
                });
            }));

            return res.status(200).json({
                success: true,
                message: 'Oferta enviada correctamente'
            });
        } catch (emailError) {
            console.error('Error al enviar email de oferta:', emailError);
            return res.status(500).json({
                success: false,
                message: 'Error al enviar el email'
            });
        }

    } catch (error) {
        console.error('Error en propertyOfferController:', error);
        return res.status(500).json({
            success: false,
            message: 'Error interno del servidor',
            error: error.message
        });
    }
}; 