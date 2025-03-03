import { ContactForm } from '../models/emailSchema.js';
import emailConfig from '../config/emailConfig.js';

export const sendNotification = async (req, res) => {
    try {
        console.log('🧐 DIAGNÓSTICO DETALLADO:');
        console.log('- Body recibido:', req.body);
        console.log('- Keys en body:', Object.keys(req.body));
        
        const { nombre, email, telefono, prefix, asunto } = req.body;
        
        // Validación básica
        if (!nombre || !email) {
            return res.status(400).json({
                success: false,
                message: 'Faltan datos de contacto requeridos (nombre y email)'
            });
        }
        
        // IMPORTANTE: Responder inmediatamente al cliente
        res.status(200).json({
            success: true,
            message: 'Formulario recibido correctamente',
            received: { nombre, email }
        });
        
        // A partir de aquí, todo se ejecuta después de enviar la respuesta
        
        // Procesamiento en segundo plano...
        try {
            // Guardar en base de datos
            let contactData;
            try {
                contactData = await ContactForm.create(req.body);
                console.log('✅ Contacto guardado en base de datos:', contactData._id);
            } catch (dbError) {
                console.error('❌ Error al guardar contacto en base de datos:', dbError);
            }
            
            // Validar variables de entorno
            if (!process.env.EMAIL_TO) {
                console.error('❌ Variable de entorno EMAIL_TO no configurada');
                return; // El cliente ya recibió respuesta
            }
            
            // Preparar el email
            const fullPhone = `${prefix || ''}${telefono || ''}`;
            const emailContent = `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #333;">Nuevo mensaje de contacto</h2>
                    <div style="background-color: #f5f5f5; padding: 20px; border-radius: 5px;">
                        <p><strong>Nombre:</strong> ${nombre}</p>
                        <p><strong>Email:</strong> ${email}</p>
                        <p><strong>Teléfono:</strong> ${fullPhone || 'No proporcionado'}</p>
                        <p><strong>Mensaje:</strong></p>
                        <p style="background-color: #fff; padding: 10px; border-left: 3px solid #C7A336;">${asunto || 'Sin mensaje'}</p>
                    </div>
                </div>
            `;
            
            const emailSubject = `Nuevo contacto de ${nombre}`;
            
            // Obtener los destinatarios
            const emailList = process.env.EMAIL_TO.split(',').map(email => email.trim());
            console.log('📧 Enviando contacto a:', emailList);
            
            // Verificamos si EMAIL_TO está configurado
            if (!process.env.EMAIL_TO || emailList.length === 0) {
                console.error('❌ No hay destinatarios configurados');
                return;
            }
            
            // Comprobar que tenemos la configuración de correo
            console.log('📧 Configuración de correo:', {
                host: process.env.EMAIL_HOST,
                port: process.env.EMAIL_PORT,
                user: process.env.EMAIL_USER ? 'Configurado' : 'No configurado',
                EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'Configurado' : 'No configurado',
                EMAIL_TO: process.env.EMAIL_TO
            });
            
            let successCount = 0;
            let errorMessages = [];
            
            // Probamos a enviar el email de la misma forma que en propertyNotificationController
            for (const emailTo of emailList) {
                try {
                    // Método 1: El que usa notificationController
                    await emailConfig.sendEmail({
                        to: emailTo,
                        subject: emailSubject,
                        html: emailContent
                    });
                    
                    console.log(`✅ Método 1: Email enviado a ${emailTo}`);
                    successCount++;
                } catch (error1) {
                    console.error(`❌ Método 1 falló: ${error1.message}`);
                    
                    try {
                        // Método 2: El que podría estar usando propertyNotificationController
                        // Intenta acceder directamente al transporter
                        if (emailConfig.transporter) {
                            await emailConfig.transporter.sendMail({
                                from: process.env.EMAIL_FROM || 'info@gozamadrid.com',
                                to: emailTo,
                                subject: emailSubject,
                                html: emailContent
                            });
                            console.log(`✅ Método 2: Email enviado a ${emailTo}`);
                            successCount++;
                        } else {
                            throw new Error('No hay transporter disponible');
                        }
                    } catch (error2) {
                        console.error(`❌ Método 2 falló: ${error2.message}`);
                        errorMessages.push(`Error al enviar a ${emailTo}: ${error1.message} / ${error2.message}`);
                    }
                }
            }
            
            // Actualizar en base de datos si es necesario
            if (contactData) {
                try {
                    await ContactForm.findByIdAndUpdate(contactData._id, {
                        'emailSent.success': successCount > 0,
                        'emailSent.error': errorMessages.join('; '),
                        'emailSent.attempts': 1,
                        'emailSent.lastAttempt': new Date()
                    });
                } catch (updateError) {
                    console.error('❌ Error al actualizar estado del contacto:', updateError);
                }
            }
            
            console.log(`📊 Resultado del envío: ${successCount} de ${emailList.length} emails enviados`);
            
        } catch (processingError) {
            console.error('❌ Error en el procesamiento en segundo plano:', processingError);
        }
        
    } catch (error) {
        console.error('❌ Error general en notificationController:', error);
        // Solo enviamos respuesta si no se ha enviado ya
        if (!res.headersSent) {
            return res.status(500).json({
                success: false,
                message: 'Error al procesar el formulario',
                error: error.message
            });
        }
    }
};

