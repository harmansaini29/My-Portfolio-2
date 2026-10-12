'use client';

import React from 'react';
import HoverImageReveal from '@/components/HoverImageReveal';
import { ACHIEVEMENTS_DATA } from '@/lib/portfolio-data';

export default function AchievementsSection() {
  return (
    <section className="relative w-full h-[100vh] bg-transparent py-12 sm:py-20 overflow-hidden flex flex-col justify-center items-center">
      <div className="mb-6 sm:mb-10 text-center z-10 pointer-events-none px-4">
        <h2
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-widest uppercase"
          style={{ textShadow: '0 0 20px rgba(0, 157, 255, 0.5)' }}
        >
          Achievements
        </h2>
        <p className="text-[0.65rem] sm:text-xs md:text-sm text-cyan-400 font-mono tracking-widest mt-1 uppercase">
          [ Recognition &amp; Honors // Hover to Inspect ]
        </p>
      </div>

      <div className="w-full h-[70vh] flex items-center justify-center">
        <HoverImageReveal
          items={ACHIEVEMENTS_DATA}
          backgroundColor="transparent"
          font={{
            fontSize: "clamp(1.15rem, 4.2vw, 3.2rem)",
            fontWeight: 700,
            letterSpacing: "-0.02em",
            textAlign: "center",
          }}
        />
      </div>
    </section>
  );
}
