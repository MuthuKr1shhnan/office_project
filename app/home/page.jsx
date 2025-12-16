"use client";
import Image from "next/image";
import "../globals.css";
import heroImage from "../../assets/heroimage.png";

export default function Home() {
  return (
    <section className='w-full' style={{ height: "calc(100vh - 65px)" }}>
      <div className='flex h-full flex-col px-20 md:flex-row justify-center  md:items-start w-full '>
        <div className='md:w-1/2 w-full h-full justify-center flex flex-col md:mb-0'>
          <h1 className='text-2xl md:text-5xl font-bold  tracking-wide leading-tight'>
            &quot;We connect Doctors and Patients.&quot;
          </h1>
        </div>

        <div className='w-full h-full md:w-1/2 flex justify-center md:justify-end'>
          <Image
            className='w-full h-full  max-w-md md:max-w-full'
            alt='doctor vs patient image'
            src={heroImage}
          />
        </div>
      </div>
    </section>
  );
}
