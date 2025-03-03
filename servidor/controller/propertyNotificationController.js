import emailConfig from '../config/emailConfig.js';
import mongoose from 'mongoose';

// Intentar importar los modelos (si existen)
let PropertyVisit;
try {
  PropertyVisit = mongoose.model('PropertyVisit');
} catch (e) {
  // Crear el modelo si no existe
  const PropertyVisitSchema = new mongoose.Schema({
    property: String,
    propertyAddress: String,
    date: Date,
    time: Date,
    email: String,
    name: String,
    phone: String,
    status: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled'],
      default: 'pending'
    },
    emailSent: {
      success: Boolean,
      error: String,
      attempts: Number,
      lastAttempt: Date
    }
  }, { timestamps: true });
  
  PropertyVisit = mongoose.model('PropertyVisit', PropertyVisitSchema);
}

export const sendPropertyNotification = async (req, res) => {
    // Asegurarse que la respuesta sea JSON
    res.setHeader('Content-Type', 'application/json');
    
    try {
        console.log('📩 Recibida solicitud de notificación:', req.body);
        
        const { date, time, email, name, phone, property, propertyAddress, offer } = req.body;

        // Validar que se recibieron los datos necesarios
        if (!email || !name || !phone) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de contacto requeridos'
            });
        }

        if (!property || !propertyAddress) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de la propiedad'
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

        let emailContent;
        let emailSubject;
        let visitData = null;

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
            // Convertir a objetos Date si vienen como strings
            const visitDate = typeof date === 'string' ? new Date(date) : date;
            const visitTime = typeof time === 'string' ? new Date(time) : time;
            
            // Asegurarse de que son fechas válidas
            if (isNaN(visitDate.getTime()) || isNaN(visitTime.getTime())) {
                return res.status(400).json({
                    success: false,
                    message: 'La fecha o la hora no son válidas'
                });
            }
            
            const formattedDate = visitDate.toLocaleDateString('es-ES', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            
            const formattedTime = visitTime.toLocaleTimeString('es-ES', {
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
            
            // Guardar la visita en la base de datos
            if (mongoose.connection.readyState === 1) { // Verificar conexión a MongoDB
                try {
                    visitData = await PropertyVisit.create({
                        property,
                        propertyAddress,
                        date: visitDate,
                        time: visitTime,
                        email,
                        name,
                        phone,
                        emailSent: {
                            success: false,
                            attempts: 0
                        }
                    });
                    console.log('✅ Visita guardada en base de datos:', visitData._id);
                } catch (dbError) {
                    console.error('❌ Error al guardar visita en base de datos:', dbError);
                    // Continuamos para intentar enviar el email de todas formas
                }
            }
        } else {
            return res.status(400).json({
                success: false,
                message: 'Tipo de notificación no válido'
            });
        }

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

            // Actualizar el estado de la visita si existe
            if (visitData) {
                try {
                    await PropertyVisit.findByIdAndUpdate(visitData._id, {
                        'emailSent.success': successCount > 0,
                        'emailSent.error': errorMessages.join('; '),
                        'emailSent.attempts': 1,
                        'emailSent.lastAttempt': new Date()
                    });
                } catch (updateError) {
                    console.error('❌ Error al actualizar estado de la visita:', updateError);
                }
            }

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