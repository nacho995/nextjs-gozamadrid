import Head from "next/head";
import AnimatedOnScroll from "@/components/AnimatedScroll";

// Componentes para datos estructurados
const LegalServiceStructuredData = ({ description }) => {
  try {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "LegalService",
      "name": "Aviso Legal - Goza Madrid Inmobiliaria",
      "description": description,
      "provider": {
        "@type": "RealEstateAgent",
        "name": "Goza Madrid Inmobiliaria",
        "legalName": "Goza Madrid",
        "vatID": "05430931X",
        "address": {
          "@type": "PostalAddress",
          "streetAddress": "Calle de Alcalá, 96",
          "addressLocality": "Madrid",
          "postalCode": "28009",
          "addressCountry": "ES"
        },
        "telephone": "+34 919 012 103",
        "email": "marta@gozamadrid.com",
        "url": "https://realestategozamadrid.com"
      },
      "knowsAbout": [
        "Términos y condiciones",
        "Política de privacidad",
        "Normativa inmobiliaria",
        "Derechos de propiedad intelectual"
      ]
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    );
  } catch (error) {
    console.error("Error generando datos estructurados LegalService:", error);
    return null;
  }
};

const BreadcrumbStructuredData = () => {
  try {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": [
        {
          "@type": "ListItem",
          "position": 1,
          "name": "Inicio",
          "item": "https://realestategozamadrid.com"
        },
        {
          "@type": "ListItem",
          "position": 2,
          "name": "Aviso Legal",
          "item": "https://realestategozamadrid.com/aviso-legal"
        }
      ]
    };

    return (
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData)
        }}
      />
    );
  } catch (error) {
    console.error("Error generando datos estructurados BreadcrumbList:", error);
    return null;
  }
};

export default function AvisoLegal() {
    const pageTitle = "Aviso Legal | Goza Madrid Inmobiliaria";
    const pageDescription = "Información legal, términos y condiciones de uso, política de privacidad y datos de contacto de Goza Madrid Inmobiliaria. Consulta nuestras acreditaciones profesionales y normativa aplicable.";

    return (
        <>
            <Head>
                <title>{pageTitle}</title>
                <meta name="description" content={pageDescription} />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href="https://realestategozamadrid.com/aviso-legal" />

                {/* Open Graph */}
                <meta property="og:type" content="website" />
                <meta property="og:title" content={pageTitle} />
                <meta property="og:description" content={pageDescription} />
                <meta property="og:url" content="https://realestategozamadrid.com/aviso-legal" />
                <meta property="og:site_name" content="Goza Madrid Inmobiliaria" />

                {/* Twitter Card */}
                <meta name="twitter:card" content="summary" />
                <meta name="twitter:title" content={pageTitle} />
                <meta name="twitter:description" content={pageDescription} />

                {/* Datos estructurados */}
                <LegalServiceStructuredData description={pageDescription} />
                <BreadcrumbStructuredData />

                {/* Metadatos adicionales */}
                <meta name="keywords" content="aviso legal goza madrid, términos y condiciones inmobiliaria, política privacidad madrid, normativa inmobiliaria" />
            </Head>

            <div
                className="fixed inset-0 z-0 opacity-100 bg-cover bg-center"
                style={{
                    backgroundImage: "url('/gozamadridwp.jpg')",
                    backgroundAttachment: "fixed",
                }}
            ></div>
            <AnimatedOnScroll>
                <div className="container mx-auto px-4 py-16 relative z-10">
                    <div className="bg-white/90 backdrop-blur-sm p-8 rounded-xl shadow-lg max-w-4xl mx-auto">
                        <h1 className="text-4xl font-bold mb-8 text-black">Aviso Legal</h1>
                        
                        <div className="space-y-6 text-gray-700">
                            <section>
                                <h2 className="text-2xl font-semibold mb-4">1. Datos de la Empresa</h2>
                                <ul className="list-none space-y-2">
                                    <li><strong>Denominación Social:</strong> Goza Madrid</li>
                                    <li><strong>NIF/CIF:</strong> 05430931X</li>
                                    <li><strong>Domicilio Social:</strong> Calle de Alcalá, 96, 28009 Madrid</li>
                                    <li><strong>Email:</strong> marta@gozamadrid.com</li>
                                    <li><strong>Teléfono:</strong> +34 919 012 103</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">2. Objeto y Ámbito de Aplicación</h2>
                                <p>Este sitio web es propiedad de Goza Madrid. El presente aviso legal regula el uso del servicio del portal de Internet www.realestategozamadrid.com. La navegación por el sitio web atribuye la condición de usuario e implica la aceptación plena y sin reservas de todas las disposiciones incluidas en este aviso legal.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">3. Acreditaciones Profesionales</h2>
                                <ul className="list-disc pl-6 mt-2">
                                    <li>Agente de la Propiedad Inmobiliaria colegiado</li>
                                    <li>Miembro de eXp Realty</li>
                                    <li>Todas las actividades están sujetas a la normativa vigente</li>
                                </ul>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">4. Propiedad Intelectual e Industrial</h2>
                                <p>Los derechos de propiedad intelectual del contenido de las páginas web, su diseño gráfico y códigos son titularidad de Goza Madrid y, por tanto, queda prohibida su reproducción, distribución, comunicación pública, transformación o cualquier otra actividad que se realice con los contenidos, ni siquiera citando las fuentes, salvo consentimiento por escrito de Goza Madrid.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">5. Exclusión de Garantías y Responsabilidad</h2>
                                <p>Goza Madrid no se hace responsable, en ningún caso, de los daños y perjuicios de cualquier naturaleza que pudieran ocasionar, a título enunciativo: errores u omisiones en los contenidos, falta de disponibilidad del portal o la transmisión de virus o programas maliciosos.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">6. Enlaces</h2>
                                <p>En el caso de que en www.realestategozamadrid.com se incluyesen enlaces o hipervínculos hacia otros sitios de Internet, Goza Madrid no ejercerá ningún tipo de control sobre dichos sitios y contenidos. En ningún caso asumirá responsabilidad alguna por los contenidos de algún enlace perteneciente a un sitio web ajeno.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">7. Derecho de Exclusión</h2>
                                <p>Goza Madrid se reserva el derecho a denegar o retirar el acceso al portal y/o los servicios ofrecidos sin necesidad de advertencia previa, a instancia propia o de un tercero, a aquellos usuarios que incumplan el presente Aviso Legal.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">8. Generalidades</h2>
                                <p>Goza Madrid perseguirá el incumplimiento de las presentes condiciones así como cualquier utilización indebida de su portal ejerciendo todas las acciones civiles y penales que le puedan corresponder en derecho.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">9. Legislación Aplicable y Jurisdicción</h2>
                                <p>La relación entre Goza Madrid y el usuario se regirá por la normativa española vigente. Todas las disputas y reclamaciones derivadas de este aviso legal se resolverán por los juzgados y tribunales de Madrid.</p>
                            </section>

                            <section>
                                <h2 className="text-2xl font-semibold mb-4">10. Modificaciones</h2>
                                <p>Goza Madrid se reserva el derecho de efectuar sin previo aviso las modificaciones que considere oportunas en su portal, pudiendo cambiar, suprimir o añadir tanto los contenidos y servicios que se presten a través del mismo como la forma en la que éstos aparezcan presentados o localizados en su portal.</p>
                            </section>
                        </div>
                    </div>
                </div>
            </AnimatedOnScroll>
        </>
    );
} 