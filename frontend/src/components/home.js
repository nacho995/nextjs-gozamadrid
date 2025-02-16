"use client";

import "tailwindcss/tailwind.css";

import Eslogan from "./eslogan";
import ImageSlider from "./slider";

import BlogHome from "./blog";

import CounterExp from "./countereXp";
import Video from "./video";
import YoutubeVideo from "./Youtube";
import Cards from "./cards";
import RegisterForm from "./FormContact";
import Guide from "./guia";
import Agreements from "./Agreements";






export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 mb-[-15%] w-full mb:h-full h-[20vh] z-0">
        <Video />
      </div>
      <div className="relative z-10 flex flex-col mt-[70vh] p-0">
        <div className="w-full md:h-[100vh] h-[50vh] md:mt-[-0.5%] mt-[80%] z-0 flex justify-center items-center">
          <Cards />
        </div>
        <div className="w-full h[100vh] mt-[5%] ">
          <Eslogan />
        </div>
        <div className="w-full mb-4">
          <ImageSlider />
        </div>
        <div className=" w-full mb-4">
          <BlogHome />
        </div>
        <div className="w-full h-[60vh] mb-4">
          <Guide />
        </div>
        <CounterExp />
        <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
        <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
        <div className="w-full mb-4">
          <YoutubeVideo videoId="UHx6yIrI5UY" title="Goza Madrid" />
        </div>
        <hr className="w-full border-t-1 border-b-1 border-amber-400 mb-4" />
        <hr className="w-full border-t-1 border-b-1 border-black mb-4" />
        <div className="mb[-50%] w-full p-4 max-w-full">
          <RegisterForm />
        </div>
        <div className="w-full min-h-[50vh] ">
          <Agreements />
        </div>

      </div>
    </>
  );
}




