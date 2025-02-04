"use client";

import "tailwindcss/tailwind.css";

import Eslogan from "./eslogan";
import ImageSlider from "./slider";
import Form from "./form";
import BlogHome from "./blog";

import CounterExp from "./countereXp";
import Video from "./video";
import YoutubeVideo from "./Youtube";
import Cards from "./cards";






export default function Home() {
  return (
    <>
      <div className="absolute top-0 left-0 mb-[-15%] w-full h-full z-0">
        <Video />
      </div>
      <div className="relative z-10 flex flex-col mt-[60vh] p-0">
        <div className="w-full h-[80vh] z-0 flex justify-center items-center">
          <Cards />
        </div>
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
        <div className="mb[-50%] w-full p-4 max-w-full">
          <Form />
        </div>
      </div>
    </>
  );
}




