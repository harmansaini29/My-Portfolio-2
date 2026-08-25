'use client';

import React from 'react';
import LiquidRevealHero from '@/components/Hero';
import ScrollJourney from '@/components/ScrollJourney';
import ScrollDissolveReveal from '@/components/ScrollDissolveReveal';
import Journey3DSection from '@/components/Journey3DSection';
import CloudDiveSection from '@/components/CloudDiveSection';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-indigo-500 selection:text-white">
      {/* 1. Hero: Liquid Cursor Reveal, Silver Embroidered Typography & Smooth 3D Dice Flipper */}
      <LiquidRevealHero
        baseSrc="/images/base.png"
        chromeSrc="/images/chrome.png"
        name="Harman Saini"
        hint="Move cursor to reveal"
      />

      {/* 2. Vortex Scroll & Left-Side About Narrative */}
      <ScrollJourney />

      {/* 3. Fullscreen Shader Dissolve Reveal */}
      <ScrollDissolveReveal
        imageFront="/images/avatar.png"
        imageBack="/images/chrome.png"
      />

      {/* 4. 3D Milestone Journey: Branching Tree Spine + 3D WebGL Models + 2-Liner Info */}
      <Journey3DSection />

      {/* 5. 3D Volumetric Cloud Fly-Through */}
      <CloudDiveSection />
    </main>
  );
}