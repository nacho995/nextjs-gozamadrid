import { OpenAI } from 'openai';
import nodemailer from 'nodemailer';
import Contact from '../models/Contact';
import dbConnect from '../lib/dbConnect';

class EmailService {
  constructor() {
    // Configuramos OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    // Configuramos el transporter de nodemailer
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_SECURE === 'true',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  /**
   * Genera contenido personalizado usando OpenAI
   */
  async generateEmailContent(contact, previousTopics = []) {
    // Temas posibles para emails
    const possibleTopics = [
      'Consejos para aumentar el valor de su propiedad',
      'Tendencias actuales del mercado inmobiliario en Madrid',
      'Los mejores barrios para invertir en Madrid',
      'Cómo preparar su propiedad para la venta',
      'Reformas que aumentan el valor de su propiedad',
      'El proceso de venta de una propiedad paso a paso',
      'Aspectos legales a considerar al vender una propiedad',
      'Cómo determinar el precio adecuado para su propiedad',
      'Las ventajas de trabajar con un agente inmobiliario premium',
      'Fotografía y presentación: claves para vender su propiedad',
      'Consejos para negociar el mejor precio para su propiedad',
      'Servicios exclusivos de Real Estate Goza Madrid',
      'El mercado de lujo en Madrid: características y oportunidades',
      'Cómo maximizar el retorno de inversión en propiedades',
      'Preguntas frecuentes al vender una propiedad de lujo'
    ];

    // Filtramos temas que no se hayan enviado recientemente
    const availableTopics = possibleTopics.filter(topic => !previousTopics.includes(topic));
    
    // Si todos los temas se han usado, reiniciamos
    const topic = availableTopics.length > 0 
      ? availableTopics[Math.floor(Math.random() * availableTopics.length)]
      : possibleTopics[Math.floor(Math.random() * possibleTopics.length)];

    // Tipo de propiedad del usuario para personalización
    const propertyType = contact.tipoPropiedad || 'propiedad';
    const propertyZone = contact.zonaPropiedad || 'Madrid';

    // Generamos contenido personalizado con OpenAI
    const prompt = `
    Escribe un email de marketing para un cliente interesado en la valoración de su ${propertyType} en ${propertyZone}.
    
    El tema del email es: "${topic}".
    
    El email debe:
    1. Dirigirse a ${contact.nombre} personalmente
    2. Ser amigable pero profesional
    3. Proporcionar información valiosa sobre el tema
    4. Incluir un párrafo que mencione que Marta Goza está disponible para una consulta personalizada
    5. Terminar con una llamada a la acción clara
    
    El contenido debe ser breve (máximo 300 palabras), atractivo y transmitir exclusividad.
    Escribe solo el contenido del email, sin asunto.
    `;

    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          { 
            role: "system", 
            content: "Eres un experto en marketing inmobiliario de lujo. Escribes contenido elegante, persuasivo y exclusivo."
          },
          { 
            role: "user", 
            content: prompt
          }
        ],
        max_tokens: 600,
        temperature: 0.7,
      });

      const emailContent = completion.choices[0].message.content.trim();
      const emailSubject = `${contact.nombre}, ${topic}`;

      return {
        subject: emailSubject,
        content: emailContent,
        topic: topic
      };
    } catch (error) {
      console.error('Error al generar contenido con OpenAI:', error);
      throw error;
    }
  }

  /**
   * Envía un email personalizado a un contacto
   */
  async sendPersonalizedEmail(contact) {
    try {
      // Generamos contenido personalizado
      const { subject, content, topic } = await this.generateEmailContent(
        contact, 
        contact.ultimosTemasEnviados || []
      );

      // Preparamos HTML para el email
      const htmlContent = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; color: #333;">
          <div style="text-align: center; margin-bottom: 20px;">
            <img src="https://gozamadrid.com/logo.png" alt="Real Estate Goza Madrid" style="max-width: 200px; height: auto;">
          </div>
          
          <div style="border-top: 3px solid #D4AF37; border-bottom: 3px solid #D4AF37; padding: 20px 0; margin-bottom: 20px;">
            <h2 style="color: #000; margin-bottom: 20px; font-size: 22px;">${subject}</h2>
            
            <div style="line-height: 1.6; margin-bottom: 25px;">
              ${content.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
            <div style="display: flex; align-items: center;">
              <img src="https://gozamadrid.com/marta.jpeg" alt="Marta Goza" style="width: 80px; height: 80px; border-radius: 50%; margin-right: 15px; object-fit: cover;">
              <div>
                <p style="margin: 0; font-weight: bold;">Marta Goza</p>
                <p style="margin: 5px 0 0; font-size: 14px;">Asesora Inmobiliaria Premium</p>
                <p style="margin: 5px 0 0; color: #D4AF37;">+34 919 012 103</p>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; font-size: 12px; color: #777; margin-top: 30px;">
            <p>Real Estate Goza Madrid | Calle de Azulinas, 28036 Madrid</p>
            <p>
              <a href="https://gozamadrid.com" style="color: #D4AF37; text-decoration: none;">gozamadrid.com</a> | 
              <a href="mailto:marta@gozamadrid.com" style="color: #D4AF37; text-decoration: none;">marta@gozamadrid.com</a>
            </p>
            <p>
              Si desea dejar de recibir estos emails, <a href="https://gozamadrid.com/unsubscribe?email=${contact.email}" style="color: #D4AF37; text-decoration: none;">haga clic aquí</a>.
            </p>
          </div>
        </div>
      `;

      // Enviamos el email
      const mailOptions = {
        from: `"Real Estate Goza Madrid" <${process.env.EMAIL_USER}>`,
        to: contact.email,
        subject: subject,
        html: htmlContent,
      };

      await this.transporter.sendMail(mailOptions);

      // Actualizamos el contacto en la base de datos
      await dbConnect();
      
      // Guardamos los últimos 5 temas enviados para no repetir
      let updatedTopics = [...(contact.ultimosTemasEnviados || []), topic];
      if (updatedTopics.length > 5) {
        updatedTopics = updatedTopics.slice(-5);
      }
      
      await Contact.findByIdAndUpdate(contact._id, {
        $inc: { emailsEnviados: 1 },
        ultimoContacto: new Date(),
        ultimosTemasEnviados: updatedTopics
      });

      return true;
    } catch (error) {
      console.error('Error al enviar email personalizado:', error);
      throw error;
    }
  }

  /**
   * Envía emails a todos los contactos activos
   */
  async sendDailyEmails() {
    try {
      await dbConnect();
      
      // Obtenemos todos los contactos activos
      const contacts = await Contact.find({ estado: 'activo' });
      
      console.log(`Enviando emails diarios a ${contacts.length} contactos...`);
      
      // Enviamos emails a cada contacto
      const results = await Promise.allSettled(
        contacts.map(contact => this.sendPersonalizedEmail(contact))
      );
      
      // Contamos éxitos y fallos
      const succeeded = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;
      
      console.log(`Emails enviados: ${succeeded} exitosos, ${failed} fallidos`);
      
      return { succeeded, failed };
    } catch (error) {
      console.error('Error al enviar emails diarios:', error);
      throw error;
    }
  }
}

// Exportamos una instancia de la clase
export default new EmailService();
