// Script de diagnóstico optimizado para verificar archivos de video
(function() {
    // Solo ejecutar en producción y limitar la frecuencia
    if (window.location.hostname !== 'www.realestategozamadrid.com') {
        return;
    }
    
    // Verificar si ya se ejecutó en los últimos 5 minutos
    const lastRun = localStorage.getItem('videoDiagnosticLastRun');
    const now = Date.now();
    if (lastRun && (now - parseInt(lastRun)) < 5 * 60 * 1000) {
        console.log('🔍 [Video Diagnostic] Saltando diagnóstico - ejecutado recientemente');
        return;
    }
    
    console.log('🔍 [Video Diagnostic] Iniciando diagnóstico de archivos de video...');
    
    const videoFiles = [
        '/video.mp4',
        '/videoExpIngles.mp4',
        '/madrid.jpg',
        '/manifest.json'
    ];
    
    async function checkFile(url) {
        try {
            const response = await fetch(url, { 
                method: 'HEAD',
                signal: AbortSignal.timeout(3000) // Timeout de 3 segundos
            });
            
            const result = {
                url: url,
                status: response.status,
                ok: response.ok,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
                lastModified: response.headers.get('last-modified')
            };
            
            if (response.ok) {
                console.log(`✅ [Video Diagnostic] ${url} - OK`, result);
            } else {
                console.error(`❌ [Video Diagnostic] ${url} - FAILED`, result);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ [Video Diagnostic] ${url} - ERROR:`, error.message);
            return {
                url: url,
                error: error.message,
                ok: false
            };
        }
    }
    
    async function runDiagnostic() {
        console.log('🌐 [Video Diagnostic] Información del entorno:');
        console.log('- Hostname:', window.location.hostname);
        console.log('- Protocol:', window.location.protocol);
        console.log('- Port:', window.location.port);
        console.log('- Origin:', window.location.origin);
        console.log('- User Agent:', navigator.userAgent);
        
        const results = [];
        for (const file of videoFiles) {
            const result = await checkFile(file);
            results.push(result);
        }
        
        console.log('📊 [Video Diagnostic] Resumen de resultados:', results);
        
        // Guardar resultados y timestamp
        localStorage.setItem('videoDiagnosticLastRun', now.toString());
        localStorage.setItem('videoDiagnostic', JSON.stringify({
            timestamp: new Date().toISOString(),
            hostname: window.location.hostname,
            results: results
        }));
        
        return results;
    }
    
    // Ejecutar diagnóstico cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', runDiagnostic);
    } else {
        runDiagnostic();
    }
    
    // Exponer función globalmente para debugging manual
    window.videoDiagnostic = runDiagnostic;
})(); 