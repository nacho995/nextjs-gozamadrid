import React from "react";

const cardData = [
  { front: "Card 1", back: "Description for Card 1" },
  { front: "Card 2", back: "Description for Card 2" },
  { front: "Card 3", back: "Description for Card 3" },
  { front: "Card 4", back: "Description for Card 4" },
];

export default function Cards() {
  return (
    <div className="flex justify-center items-center w-full p-10">
      <div className="grid grid-cols-4 grid-rows-4 gap-8 h-[50vh]">
        {cardData.map((card, index) => (
          <div
            key={index}
            className="relative w-[35vh] h-32 group [perspective:1000px]"
            style={{ gridColumnStart: index + 1, gridRowStart: index + 1 }}
          >
            {/* Condicional para mostrar imágenes */}
            {index === 0 && (
              <img
                src="/path/to/image1.jpg"
                alt="Image below Card 1"
                className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2"
              />
            )}
            {index === 1 && (
              <img
                src="/path/to/image2.jpg"
                alt="Image below Card 2"
                className="absolute bottom-[-50px] left-1/2 transform -translate-x-1/2"
              />
            )}
            {index === 2 && (
              <img
                src="/path/to/image3.jpg"
                alt="Image above Card 3"
                className="absolute top-[-50px] left-1/2 transform -translate-x-1/2"
              />
            )}
            {index === 3 && (
              <img
                src="/path/to/image4.jpg"
                alt="Image above Card 4"
                className="absolute top-[-50px] left-1/2 transform -translate-x-1/2"
              />
            )}

            <div className="relative w-full h-full transition-all duration-700 [transform-style:preserve-3d] group-hover:[transform:rotateY(180deg)]">
              {/* Cara frontal */}
              <div
                className="absolute w-full h-full bg-amarillo text-black shadow-lg hover:shadow-xl rounded-lg p-2 flex items-center justify-center [backface-visibility:hidden] bg-opacity-50"
                aria-hidden="true"
              >
                <h2 className="text-sm font-bold">{card.front}</h2>
              </div>

              {/* Cara trasera */}
              <div
                className="absolute w-full h-full bg-black bg-opacity-50 text-white shadow-lg hover:shadow-xl rounded-lg p-2 flex items-center justify-center [backface-visibility:hidden] [transform:rotateY(180deg)]"
                aria-hidden="true"
              >
                <p className="text-center text-sm">{card.back}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
