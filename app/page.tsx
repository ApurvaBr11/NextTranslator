'use client'

import { useEffect } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Translator from './component/Translation';

gsap.registerPlugin(ScrollTrigger);

export default function AnimatedText() {
  useEffect(() => {
    // Initial animations
    gsap.fromTo(
      ".transform-text",
      { 
        opacity: 0, 
        rotate: -10, 
        x: -150, 
        zIndex: -1 
      },
      {
        opacity: 1,
        rotate: 0,
        x: 0,
        zIndex: 1,
        duration: 3,
        ease: "power2.out",
        delay: 0.8,
      }
    );

    gsap.fromTo(
      ".translate-text",
      { 
        opacity: 0, 
        rotate: 10, 
        x: 150, 
        zIndex: 1 
      },
      {
        opacity: 1,
        rotate: 0,
        x: 0,
        zIndex: 1,
        duration: 3,
        ease: "power2.out",
        delay: 1.5,
      }
    );

    // ScrollTrigger animations
    ScrollTrigger.create({
      trigger: ".pageone",
      start: "center center-=200px",
      end: "center center+=100px",
      scrub:1,
      onEnter: () => {
        gsap.fromTo(
          ".transform-text",
          { 
            opacity: 1, 
            rotate: 0, 
            x: 0, 
            zIndex: 1 
          },
          {
            opacity: 0,
            rotate: -10,
            x: -150,
            zIndex: -1,
            duration: 3,
            ease: "power2.out",
          }
        );
       
    
        gsap.fromTo(
          ".translate-text",
          { 
            opacity: 1, 
            rotate: 0, 
            x: 0, 
            zIndex: 1 
          },
          {
            opacity: 0,
            rotate: 10,
            x: 150,
            zIndex: 1,
            duration: 3,
            ease: "power2.out",
          }
        );
      },
      onEnterBack: () => {
        gsap.to(
          ".transform-text",
          
          {
            opacity: 1,
            rotate: 0,
            x: 0,
            zIndex: 1,
            duration: 3,
            ease: "power2.out",
          }
        );

        gsap.to(
          ".translate-text",
         
          {
            opacity: 1,
            rotate: 0,
            x: 0,
            zIndex: 1,
            duration: 3,
            ease: "power2.out",
          }
        );

       
      },
    });

    ScrollTrigger.create({
      trigger: ".pageone",
      start: "center center-=330px",
      end: "center center-=300px",
      onEnter: () => {
       
        gsap.to(
          ".mid",
          {
            position:"fixed",
            top:'10px',
           
          }
        );
    
        
      },
      onEnterBack: () => {
       
        gsap.to(
          ".mid",
         
          {
            position:"relative",
           top:'0',
          }
        );
      },
    });

  }, []);

  return (
    <div className="flex-col  bg-black text-white  justify-center min-h-screen w-[100%] overflow-hidden">
      <div className="absolute bottom-0 left-1/4 rotate-60 scale-75" >
        <img src="/arrow.png" alt="" />
      </div>
      <div className="md:flex hidden flex-col justify-center items-center h-screen pageone leading-[80px] ">
        <h1 className="transform-text text-[100px] -z-30 font-black text-gray-100 opacity-0 bgtt">Transform</h1>
        <h1 className="mid revolution-tex text-[100px] bgtt z-10 font-black text-gray-50">Translate Into</h1>
        <h1 className="translate-text text-[100px] z-50 bgtt font-black text-gray-100 opacity-0">Revolution</h1>
      </div>
      <div className="pagetwo">
       <Translator/>
      </div>
    </div>
  );
}
