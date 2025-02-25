import Image from 'next/image';

const DefaultPropertyContent = ({ property }) => {
  return (
    <div>
      {/* ... otro contenido ... */}
      {property.images.map((image, index) => (
        <button key={index}>
          <Image
            src={image.src}
            alt={image.alt || "Imagen de la propiedad"}
            style={{ objectFit: 'cover' }}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={index === 0}
          />
        </button>
      ))}
      {/* ... resto del contenido ... */}
    </div>
  );
};

export default DefaultPropertyContent; 