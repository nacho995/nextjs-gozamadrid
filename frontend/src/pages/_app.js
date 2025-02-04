// src/pages/_app.js
import Layout from '@/components/layout'; // Asegúrate de que la ruta sea correcta
import '../globals.css'; // Cambia la ruta si es necesario

function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <Component {...pageProps} />
    </Layout>
  );
}

export default MyApp;
