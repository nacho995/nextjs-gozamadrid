import React from 'react';
import { IoMdTime, IoMdGlobe } from 'react-icons/io';
import { FaChartLine, FaBuildingUser } from 'react-icons/fa6';

function ValorUnico() {
  const valores = [
    {
      icon: <IoMdTime className="h-12 w-12 text-yellow-600" />,
      title: "10 años de experiencia",
      description: "Amplia trayectoria en el mercado inmobiliario de lujo madrileño"
    },
    {
      icon: <IoMdGlobe className="h-12 w-12 text-yellow-600" />,
      title: "Red exclusiva de compradores",
      description: "Acceso a compradores potenciales nacionales e internacionales"
    },
    {
      icon: <FaChartLine className="h-12 w-12 text-yellow-600" />,
      title: "Marketing personalizado",
      description: "Estrategia de promoción única adaptada a cada propiedad"
    },
    {
      icon: <FaBuildingUser className="h-12 w-12 text-yellow-600" />,
      title: "Respaldo internacional",
      description: "Soporte de EXPRealty, líder mundial en el sector inmobiliario"
    }
  ];

  return (
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-16 text-center">
          <h2 className="mb-4 font-serif text-3xl font-bold text-black md:text-4xl">
            ¿Por qué elegir realestategozamadrid.com?
          </h2>
          <div className="mx-auto h-1 w-24 bg-yellow-500"></div>
        </div>
        
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
          {valores.map((valor, index) => (
            <div 
              key={index} 
              className="flex flex-col items-center rounded-lg p-6 text-center transition-all duration-300 hover:shadow-xl"
            >
              <div className="mb-4 rounded-full bg-yellow-100 p-4">
                {valor.icon}
              </div>
              <h3 className="mb-2 text-xl font-bold text-black">
                {valor.title}
              </h3>
              <p className="text-gray-800">
                {valor.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ValorUnico;
