# GozaMadrid - Portal Inmobiliario

## Estructura del Proyecto (Pages Router)

Este proyecto utiliza Next.js con el enfoque tradicional de Pages Router. A continuación se detalla la estructura correcta del proyecto:

```
frontend/
├── src/                 # Código fuente principal
│   ├── pages/           # Páginas de Next.js (IMPORTANTE)
│   │   ├── _app.js      # Componente personalizado App
│   │   ├── _document.js # Documento HTML personalizado
│   │   ├── index.js     # Página principal (raíz /)
│   │   ├── api-test.js  # Página /api-test
│   │   └── ...          # Otras páginas
│   ├── components/      # Componentes reutilizables
│   ├── styles/          # Estilos CSS/SCSS
│   └── utils/           # Funciones de utilidad, hooks, etc.
├── public/              # Archivos estáticos accesibles públicamente
├── dist/                # Carpeta de salida de la exportación estática
├── next.config.js       # Configuración de Next.js
├── vercel.json          # Configuración de despliegue en Vercel
└── ...
```

## Archivos Especiales

- **_app.js**: Utilizado para inicializar páginas, mantener estado entre cambios de página y agregar layouts comunes.
- **_document.js**: Utilizado para modificar la estructura HTML del documento (html, head, body).

## Sobre la carpeta `app` (App Router)

Si estás considerando migrar a App Router en el futuro, debes tener en cuenta:

1. **Incompatibilidad parcial**: No se pueden mezclar completamente ambos enfoques. El archivo `_app.js` y `_document.js` solo funcionan con Pages Router.

2. **Migración gradual**: Si deseas realizar una migración gradual, puedes mantener ambas estructuras, pero debes asegurarte de que no haya rutas duplicadas:
   - Una ruta debe estar definida en `pages/` O en `app/`, no en ambas.
   - La ruta `/` (raíz) siempre se servirá desde `app/page.js` si existe.

3. **Configuración actual**: Actualmente el proyecto está configurado para usar Pages Router con `experimental.appDir: false` en `next.config.js`.

4. **Respaldo**: Se ha creado un archivo `app-backup-layout.jsx` con el contenido del antiguo `app/layout.jsx` para referencia futura.

## Configuración

- La exportación estática está configurada en `next.config.js` con `output: 'export'`
- El directorio de salida está configurado como `dist`
- Las URLs limpias están habilitadas con `cleanUrls: true` en `vercel.json`

## Despliegue

Este proyecto está configurado para desplegarse en Vercel con la siguiente configuración:
- Región: Frankfurt (fra1)
- Directorio de salida: dist
- URLs limpias: habilitadas

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.js`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
