"use client";
import Image from "next/image";
import "../globals.css";
import heroImage from "../../assets/heroimage.png";
import Btn from "../../component/Btn";
export default function Home() {
  return (
    <section className='w-full relative h-[calc(100vh-65px)]'>
      <Image
        className='w-full h-full object-cover'
        alt='doctor vs patient image'
        src={heroImage}
        priority
      />

      {/* Overlay content */}
      <div className='absolute bottom-25  md:bottom-20 w-full  flex flex-col items-center justify-center text-center px-4'>
        <h1 className='text-2xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg'>
          Doctor vs Patient
        </h1>
        <p className='mt-4 text-sm md:text-lg lg:text-xl text-white max-w-xl'>
          Connecting healthcare professionals with patients anytime, anywhere.
        </p>
        <Btn
          variant='primary'
          className='mt-6 px-6 py-3 text-white rounded-lg shadow-md transition'
        >
          Get Started
        </Btn>
      </div>
    </section>
  );
}
