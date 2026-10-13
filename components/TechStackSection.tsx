'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TechStackDualCarousel = dynamic(() => import('./TechStackDualCarousel'), { ssr: false });

export default function TechStackSection() {
  return (
    <section className="relative w-full min-h-screen bg-transparent flex flex-col justify-center items-center py-10 sm:py-16 overflow-hidden">
      {/* Section Title */}
      <div className="text-center z-10 px-4 mb-4 sm:mb-6 pointer-events-none">
        <h2
          className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-widest uppercase"
          style={{ textShadow: '0 0 25px rgba(6, 182, 212, 0.55)' }}
        >
          Tech Stack & Architecture
        </h2>
        <p className="text-[0.65rem] sm:text-xs text-cyan-400/80 font-mono tracking-widest mt-1 uppercase">
          Interactive Mechanical Keycap Matrix • Click to Press
        </p>
      </div>

      {/* Interactive Keycap Matrix Wall */}
      <div className="relative w-full max-w-7xl mx-auto px-2 sm:px-4 flex items-center justify-center">
        <div className="w-full rounded-2xl overflow-hidden border-x border-white/10 shadow-[0_0_60px_rgba(0,0,0,0.9)]">
          <TechStackDualCarousel />
        </div>
      </div>
    </section>
  );
}
