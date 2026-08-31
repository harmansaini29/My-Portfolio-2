'use client';

import React from 'react';
import LiquidRevealHero from '@/components/Hero';
import ScrollJourney from '@/components/ScrollJourney';
import ScrollDissolveReveal from '@/components/ScrollDissolveReveal';
import Journey3DSection from '@/components/Journey3DSection';
import CloudDiveSection from '@/components/CloudDiveSection';

// ── 2-Picture Configuration System (Modify filenames anytime) ──────────
const HERO_IMAGES = {
  base: '/images/base.png',
  chrome: '/images/chrome.png',
};

const DISSOLVE_IMAGES = {
  front: '/images/avatar.png',
  back: '/images/chrome.png',
};

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* 1. Hero: Liquid Pointer Reveal + Silver Typography + 3D Flipper */}
      <LiquidRevealHero
        baseSrc={HERO_IMAGES.base}
        chromeSrc={HERO_IMAGES.chrome}
        name="Harman Saini"
        hint="Move cursor to reveal"
      />

      {/* 2. Vortex Scroll & Upper-Middle Left About Me Narrative */}
      <ScrollJourney />

      {/* 3. Fullscreen Sobel Edge & FBM Particle Dissolve Reveal (Slow Transition & Zoom Exit) */}
      <ScrollDissolveReveal
        imageFront={DISSOLVE_IMAGES.front}
        imageBack={DISSOLVE_IMAGES.back}
      />

      {/* 4. 3D Milestone Branching Tree Timeline (Emerges from Depth) */}
      <Journey3DSection />

      {/* 5. Volumetric 3D Cloud Fly-Through */}
      <CloudDiveSection />
    </main>
  );
}