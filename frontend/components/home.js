// Importaciones de componentes
import Eslogan from "./eslogan";
import ImageSlider from "./slider";
import BlogHome from "./blog";
// import CounterExp from "./countereXp";
import Video from "./video";
// import YoutubeVideo from "./Youtube";
import Cards from "./cards";
import RegisterForm from "./FormContact";
import Guide from "./guia";
import Agreements from "./Agreements";

// Mover estilos fuera del componente para evitar recreación
const gradientStyle = {
  backgroundImage: "url('/gozamadridwp.jpg')",
  backgroundAttachment: "fixed",
};

export default function HomeComponent() {
  return (
    <>
      <div className="">
        <div className="fixed inset-0 z-0 opacity-100 bg-cover bg-center" style={gradientStyle}></div>

        <div className="absolute top-0 left-0 w-full z-1">
          <Video />
        </div>

        <div className="relative z-1">
          <div className="w-full 
            mt-[110vh]                
            sm:mt-[110vh]             
            md:mt-[70vh]              
            lg:mt-[85vh]              
            xl:mt-[100vh]
            sm:mb-[120vh] 
            md:mb-[-40vh] 
            lg:mb-[10vh] 
            mb-[120vh]
            h-[50vh] 
            md:h-[90vh] 
            flex justify-center items-center"
          >
            <Cards />
          </div>

          <div className="w-full h[100vh] lg:mt-[-10vh] md:mt-[80vh]">
            <Eslogan />
          </div>
          <div className="w-full mb-4">
            <ImageSlider />
          </div>
          <div className="w-full mb-4">
            <BlogHome />
          </div>
          <div className="w-full h-[60vh] lg:h-[50vh] mb-4">
            <Guide />
          </div>
          <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
          <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
          <div className="w-full p-4 max-w-full mt-[30vh] sm:mt-[30vh] md:mt-12 lg:mt-0">
            <RegisterForm />
          </div>
        </div>
      </div>

      <div className="relative z-50 w-full min-h-[50vh]">
        <Agreements />
      </div>
    </>
  );
}




