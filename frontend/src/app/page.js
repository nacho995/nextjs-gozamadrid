import Image from "next/image";


import "tailwindcss/tailwind.css";
import Video from "./components/video";
import Eslogan from "./components/eslogan";
import ImageSlider from "./components/slider";
import Form from "./components/form";
import BlogHome from "./components/blog";
import YoutubeVideo from "./components/Youtube"
import CounterExp from "./components/countereXp";





export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 mb-[-15%] w-full h-full z-0">
        <Video />
      </div>

      <div className="relative z-10 flex flex-col m-0 p-0">
        
          <Eslogan />
       
        <div className="w-full mb-4">
          <ImageSlider />
        </div>
        <div className="mt-[-20%] w-full mb-4">
          <BlogHome />
        </div>
        <CounterExp />
        <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
        <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
        <div className="w-full mb-4">
          <YoutubeVideo videoId="UHx6yIrI5UY" title="Goza Madrid" />
        </div>
        <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
        <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
        <div className="mb[-50%] mt-[20%] w-full p-4 max-w-full">
          <Form />
        </div>
      </div>
    </>
  );
}




