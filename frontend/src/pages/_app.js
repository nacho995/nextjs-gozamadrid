
import Head from 'next/head';
import Layout from '../components/layout';
import '../globals.css';

function MyApp({ Component, pageProps }) {
  return (
    <>
      <Head>
        <title>Goza Madrid</title>
        <link rel="icon" href="/logo.png" />
        <meta name="description" content="Descripción de mi sitio web" />
      </Head>
      <Layout>
        
          <Component {...pageProps} />
  
      </Layout>
    </>
  );
}

export default MyApp;
