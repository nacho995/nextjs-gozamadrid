# Guía de Deploy - Goza Madrid Frontend

## ✅ Cambios Implementados para Solucionar Problemas de Imágenes

### 🔧 Configuraciones Aplicadas:

1. **Next.js Config Optimizado** (`next.config.js`)
   - Configuración de imágenes mejorada
   - Headers específicos para archivos estáticos
   - Configuración de producción optimizada

2. **Middleware Personalizado** (`src/middleware.js`)
   - Manejo de headers para archivos estáticos
   - Tipos MIME correctos para imágenes
   - Cache control optimizado

3. **Vercel Config Actualizado** (`vercel.json`)
   - Headers específicos para imágenes
   - Rewrites para archivos críticos
   - Framework Next.js especificado

4. **Scripts de Verificación**
   - `build-config.js`: Verificación de archivos críticos
   - Prebuild automático que verifica imágenes

5. **Archivos de Configuración del Servidor**
   - `.htaccess`: Para servidores Apache
   - `web.config`: Para servidores IIS
   - `_redirects`: Para Netlify/Vercel

### 📁 Archivos Críticos Verificados:
- ✅ `logonuevo.png` (607 KB)
- ✅ `logo.png` (85 KB)
- ✅ `manifest.json` (0.4 KB)
- ✅ `favicon.ico` (85 KB)

### 🚀 Proceso de Deploy:

1. **Prebuild**: Verificación automática de archivos críticos
2. **Build**: Compilación de Next.js con configuración optimizada
3. **Postbuild**: Generación de sitemap

### 🔍 Verificación Post-Deploy:

Después del deploy, verificar que estas URLs respondan correctamente:
- `https://www.realestategozamadrid.com/logonuevo.png`
- `https://www.realestategozamadrid.com/logo.png`
- `https://www.realestategozamadrid.com/manifest.json`

### 🛠️ Solución de Problemas:

Si las imágenes siguen sin cargarse:
1. Verificar que los archivos estén en `/public/`
2. Comprobar que no hay errores en el build
3. Revisar los headers de respuesta del servidor
4. Verificar la configuración de CDN/proxy

### 📝 Notas Importantes:

- El popup ahora es siempre visible (minimizado/maximizado)
- Logo en landing page de lujo es más alto (200px vs 150px)
- Teléfono actualizado a +34 677 364 015
- Configuración multi-servidor para máxima compatibilidad 