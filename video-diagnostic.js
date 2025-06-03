// Script de diagnóstico para detectar problemas de Fast Refresh y hidratación
(function() {
    'use strict';
    
    console.log('🔍 [Diagnóstico] Script de diagnóstico iniciado');
    
    let refreshCount = 0;
    let lastRefreshTime = Date.now();
    let hydrationErrors = [];
    let apiErrors = [];
    
    // Detectar recargas rápidas (posible Fast Refresh infinito)
    const originalReload = window.location.reload;
    window.location.reload = function(...args) {
        refreshCount++;
        const now = Date.now();
        const timeSinceLastRefresh = now - lastRefreshTime;
        
        console.warn(`🔄 [Diagnóstico] Recarga detectada #${refreshCount} (${timeSinceLastRefresh}ms desde la anterior)`);
        
        if (timeSinceLastRefresh < 2000 && refreshCount > 3) {
            console.error('🚨 [Diagnóstico] POSIBLE FAST REFRESH INFINITO DETECTADO');
            console.error('🚨 Recargas muy frecuentes:', refreshCount, 'en', now - (lastRefreshTime - timeSinceLastRefresh * refreshCount), 'ms');
            
            // Intentar detener el ciclo
            if (confirm('Se detectó un posible ciclo de recarga infinita. ¿Desea detener las recargas automáticas?')) {
                return; // No recargar
            }
        }
        
        lastRefreshTime = now;
        return originalReload.apply(this, args);
    };
    
    // Detectar errores de hidratación
    const originalError = console.error;
    console.error = function(...args) {
        const message = args.join(' ');
        
        // Detectar errores específicos de hidratación
        if (message.includes('Hydration') || 
            message.includes('server') && message.includes('client') ||
            message.includes('disabled') && message.includes('attribute')) {
            
            hydrationErrors.push({
                message: message,
                timestamp: new Date().toISOString(),
                stack: new Error().stack
            });
            
            console.warn('🚨 [Diagnóstico] Error de hidratación detectado:', message);
        }
        
        // Detectar errores de API
        if (message.includes('404') || message.includes('500') || message.includes('Failed to fetch')) {
            apiErrors.push({
                message: message,
                timestamp: new Date().toISOString()
            });
            
            console.warn('🚨 [Diagnóstico] Error de API detectado:', message);
        }
        
        return originalError.apply(this, args);
    };
    
    // Monitorear cambios en el DOM que puedan indicar re-renders
    let renderCount = 0;
    const observer = new MutationObserver(function(mutations) {
        renderCount++;
        
        if (renderCount > 100) {
            console.warn('🚨 [Diagnóstico] Muchos cambios en el DOM detectados:', renderCount);
            console.warn('🚨 Esto podría indicar re-renders excesivos');
        }
    });
    
    // Observar cambios en el body
    if (document.body) {
        observer.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true
        });
    }
    
    // Reporte cada 30 segundos
    setInterval(() => {
        if (hydrationErrors.length > 0 || apiErrors.length > 0 || refreshCount > 0) {
            console.group('📊 [Diagnóstico] Reporte de estado');
            console.log('🔄 Recargas detectadas:', refreshCount);
            console.log('💧 Errores de hidratación:', hydrationErrors.length);
            console.log('🌐 Errores de API:', apiErrors.length);
            console.log('🔄 Cambios en DOM:', renderCount);
            
            if (hydrationErrors.length > 0) {
                console.warn('💧 Últimos errores de hidratación:', hydrationErrors.slice(-3));
            }
            
            if (apiErrors.length > 0) {
                console.warn('🌐 Últimos errores de API:', apiErrors.slice(-3));
            }
            
            console.groupEnd();
        }
    }, 30000);
    
    // Detectar si la página está hidratada
    window.addEventListener('load', () => {
        setTimeout(() => {
            const isHydrated = document.documentElement.getAttribute('data-hydrated') === 'true';
            console.log('💧 [Diagnóstico] Estado de hidratación:', isHydrated ? '✅ Hidratado' : '❌ No hidratado');
        }, 1000);
    });
    
    console.log('✅ [Diagnóstico] Script de diagnóstico configurado correctamente');
})(); 