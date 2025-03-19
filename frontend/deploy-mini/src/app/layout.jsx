import '../styles/globals.css';

export const metadata = {
  title: 'GozaMadrid - Portal inmobiliario',
  description: 'Encuentra las mejores propiedades en Madrid',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        {children}
      </body>
    </html>
  );
} 