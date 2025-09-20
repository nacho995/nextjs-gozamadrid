import { useState } from 'react';

export default function TestFormSubmit() {
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testFormSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setResult('');

    const formData = {
      name: 'Test Usuario Vercel',
      email: 'test@example.com',
      message: 'Este es un test desde el frontend de Vercel para verificar que FormSubmit funciona correctamente.',
      subject: 'Test FormSubmit desde Vercel',
      _template: 'box'
    };

    console.log('Enviando test FormSubmit:', formData);

    try {
      // Test a marta@gozamadrid.com
      const response1 = await fetch('https://formsubmit.co/ajax/marta@gozamadrid.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result1 = await response1.text();
      console.log('Respuesta marta@gozamadrid.com:', response1.status, result1);

      // Test a ignaciodalesio1995@gmail.com
      const response2 = await fetch('https://formsubmit.co/ajax/ignaciodalesio1995@gmail.com', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });

      const result2 = await response2.text();
      console.log('Respuesta ignaciodalesio1995@gmail.com:', response2.status, result2);

      setResult(`
        Resultados del test:
        
        marta@gozamadrid.com: ${response1.status} - ${result1}
        
        ignaciodalesio1995@gmail.com: ${response2.status} - ${result2}
      `);

    } catch (error) {
      console.error('Error en test:', error);
      setResult(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h1>Test FormSubmit desde Vercel</h1>
      
      <form onSubmit={testFormSubmit}>
        <button 
          type="submit" 
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: loading ? '#ccc' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Enviando...' : 'Test FormSubmit'}
        </button>
      </form>

      {result && (
        <div style={{
          marginTop: '20px',
          padding: '15px',
          backgroundColor: '#f8f9fa',
          border: '1px solid #dee2e6',
          borderRadius: '5px',
          whiteSpace: 'pre-line'
        }}>
          <h3>Resultados:</h3>
          <p>{result}</p>
        </div>
      )}

      <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
        <p>Este test verifica si FormSubmit funciona correctamente desde el frontend desplegado.</p>
        <p>Revisa la consola del navegador para logs detallados.</p>
      </div>
    </div>
  );
}
