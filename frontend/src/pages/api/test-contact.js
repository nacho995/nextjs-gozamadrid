// Endpoint de prueba para el formulario de contacto
export default async function handler(req, res) {
  res.setHeader('Content-Type', 'application/json');

  // Solo permitir GET
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Método no permitido' });
  }

  try {
    // Datos de prueba para el formulario
    const testData = {
      name: 'Usuario de prueba',
      email: 'ignaciodalesio1995@gmail.com',
      phone: '123456789',
      prefix: '+34',
      message: 'Este es un mensaje de prueba enviado desde el endpoint test-contact',
      _captcha: 'false'
    };
    
    console.log('[Test Contact] Enviando datos de prueba:', testData);
    
    // Intentar enviar el correo vía FormSubmit a ambos emails
    const formSubmitPromises = [
      // Enviar a ignaciodalesio1995@gmail.com
      fetch('https://formsubmit.co/ajax/ignaciodalesio1995@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: testData.name,
          email: testData.email,
          _subject: 'TEST - Formulario de contacto',
          message: `
Prueba de formulario de contacto

Nombre: ${testData.name}
Email: ${testData.email}
Teléfono: ${testData.prefix} ${testData.phone}
Mensaje: ${testData.message}
          `,
          _template: 'box',
          _captcha: 'false'
        })
      }),
      
      // Enviar a marta@gozamadrid.com
      fetch('https://formsubmit.co/ajax/marta@gozamadrid.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          name: testData.name,
          email: testData.email,
          _subject: 'TEST - Formulario de contacto',
          message: `
Prueba de formulario de contacto

Nombre: ${testData.name}
Email: ${testData.email}
Teléfono: ${testData.prefix} ${testData.phone}
Mensaje: ${testData.message}
          `,
          _template: 'box',
          _captcha: 'false'
        })
      })
    ];
    
    // Esperar a que se completen ambas solicitudes
    const formSubmitResults = await Promise.allSettled(formSubmitPromises);
    
    // Intentar enviar directamente al backend
    const backendUrl = 'http://gozamadrid-api-prod.eba-adypnjgx.eu-west-3.elasticbeanstalk.com';
    const backendResponse = await fetch(`${backendUrl}/api/contact`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        nombre: testData.name,
        email: testData.email,
        telefono: testData.phone,
        prefix: testData.prefix,
        mensaje: testData.message,
        asunto: 'TEST - Formulario de contacto',
        ccEmail: 'ignaciodalesio1995@gmail.com,marta@gozamadrid.com' // Enviar a ambos emails
      })
    });
    
    // Obtener resultados
    const formSubmitSuccess = formSubmitResults.filter(r => r.status === 'fulfilled' && r.value.ok).length;
    
    const backendResult = backendResponse.ok 
      ? await backendResponse.json() 
      : { error: `${backendResponse.status}: ${await backendResponse.text()}` };
    
    // Devolver resultados
    return res.status(200).json({
      success: true,
      message: 'Pruebas completadas',
      results: {
        formSubmit: {
          success: formSubmitSuccess > 0,
          emailsSent: formSubmitSuccess,
          details: formSubmitResults.map((r, i) => ({
            recipient: i === 0 ? 'ignaciodalesio1995@gmail.com' : 'marta@gozamadrid.com',
            status: r.status,
            success: r.status === 'fulfilled' && r.value.ok
          }))
        },
        backend: backendResult
      }
    });
  } catch (error) {
    console.error('[Test Contact] Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Error en prueba',
      error: error.message
    });
  }
} 