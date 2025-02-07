import { motion } from 'framer-motion';
import Layout from '../components/layout'; // Asegúrate de que la ruta esté correcta
import '../globals.css';
function MyApp({ Component, pageProps }) {
  return (
    <Layout>
      <motion.div
        initial={{ opacity: 0, y: 50 }}  // Empieza desplazado hacia abajo y oculto
        whileInView={{ opacity: 1, y: 0 }}  // Aparece y se mueve a su posición original
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}  // Controla la velocidad y suavidad de la animación
        viewport={{ once: true }}  // Ejecutar solo una vez cuando entra en la vista
      >
        <Component {...pageProps} />
      </motion.div>
    </Layout>
  );
}

export default MyApp;
