// src/pages/_app.js
; // Asegúrate de que la ruta sea correcta
import Layout from '@/components/layout';
import '../globals.css'; // Cambia la ruta si es necesario
// Cambia la ruta si es necesario

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
