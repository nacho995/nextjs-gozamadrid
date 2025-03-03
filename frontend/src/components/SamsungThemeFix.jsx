import Head from 'next/head';

const SamsungThemeFix = () => {
  return (
    <Head>
      <meta name="color-scheme" content="light" />
      <meta name="theme-color" content="#ffffff" />
      <meta name="forced-colors" content="none" />
      <style>{`
        html {
          color-scheme: light !important;
          forced-color-adjust: none !important;
        }
        @media (prefers-color-scheme: dark) {
          html {
            filter: none !important;
          }
        }
      `}</style>
    </Head>
  );
};

export default SamsungThemeFix;