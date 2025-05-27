// Script de diagnóstico para verificar archivos de video
(function() {
    console.log('🔍 [Video Diagnostic] Iniciando diagnóstico de archivos de video...');
    
    const videoFiles = [
        '/video.mp4',
        '/videoExpIngles.mp4',
        '/madrid.jpg',
        '/manifest.json'
    ];
    
    async function checkFile(url) {
        try {
            console.log(`🔍 [Video Diagnostic] Verificando: ${url}`);
            const response = await fetch(url, { method: 'HEAD' });
            
            const result = {
                url: url,
                status: response.status,
                ok: response.ok,
                contentType: response.headers.get('content-type'),
                contentLength: response.headers.get('content-length'),
                lastModified: response.headers.get('last-modified'),
                cacheControl: response.headers.get('cache-control')
            };
            
            if (response.ok) {
                console.log(`✅ [Video Diagnostic] ${url} - OK`, result);
            } else {
                console.error(`❌ [Video Diagnostic] ${url} - FAILED`, result);
            }
            
            return result;
        } catch (error) {
            console.error(`❌ [Video Diagnostic] ${url} - ERROR:`, error);
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
        
        // Guardar resultados en localStorage para debugging
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