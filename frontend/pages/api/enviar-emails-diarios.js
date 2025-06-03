import EmailService from '../../services/EmailService';
import { isValidSignature, SIGNATURE_HEADER_NAME } from '@vercel/edge-config';

/**
 * Endpoint para enviar emails diarios a todos los contactos activos
 * Este endpoint debe ser protegido y solo accesible mediante un cron job
 */
export default async function handler(req, res) {
  // Solo permitir método POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  // Verificar que la solicitud venga de un cron job autorizado
  // Esto es importante para seguridad
  try {
    // Verificar firma si viene de un cron job de Vercel
    const signature = req.headers[SIGNATURE_HEADER_NAME];
    const secret = process.env.CRON_SECRET;
    
    // Si hay un secreto configurado y la firma no es válida o falta, rechazar
    if (secret) {
      const isValid = signature && (
        // Verificar mediante Vercel Edge Config si está disponible
        (typeof isValidSignature === 'function' && isValidSignature(signature, secret)) ||
        // Verificar manualmente
        signature === secret
      );
      
      if (!isValid) {
        return res.status(401).json({ error: 'No autorizado' });
      }
    }

    // Iniciar el envío de emails
    console.log('Iniciando envío de emails diarios...');
    
    const result = await EmailService.sendDailyEmails();
    
    return res.status(200).json({
      success: true,
      emailsEnviados: result.succeeded,
      emailsFallidos: result.failed,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error al enviar emails diarios:', error);
    return res.status(500).json({ 
      error: 'Error al enviar emails diarios', 
      details: error.message 
    });
  }
}
