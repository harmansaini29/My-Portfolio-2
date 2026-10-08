'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import LiquidRevealHero from '@/components/Hero';
import ContactSection from '@/components/ContactSection';
import LiquidGlassCarousel from '@/components/LiquidGlassCarousel';
import MosaicFlip from '@/components/MosaicFlip';
import HoverImageReveal from '@/components/HoverImageReveal';
import ParticleField from '@/components/ParticleField';

// Client-only dynamic WebGL components
const ScrollJourney = dynamic(() => import('@/components/ScrollJourney'), { ssr: false });
const TechStackSection = dynamic(() => import('@/components/TechStackSection'), { ssr: false });

const HERO_IMAGES = {
  base: '/images/base.png',
  chrome: '/images/chrome.png',
};

const CAROUSEL_ITEMS = [
  { image: "https://images.unsplash.com/photo-1663076125875-b8454612ed9b?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
  { image: "https://images.unsplash.com/photo-1636408807362-a6195d3dd4de?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
  { image: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
  { image: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0" },
];

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Shared Unified Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen">
        <ParticleField />
      </div>

      <div className="relative z-10">
        {/* 1. Hero */}
        <LiquidRevealHero
          baseSrc={HERO_IMAGES.base}
          chromeSrc={HERO_IMAGES.chrome}
          name="Harman Saini"
          hint="Move cursor to reveal"
        />

        {/* 2. Vortex About Section */}
        <ScrollJourney />

        {/* 3. Journey Section */}
        <section className="relative w-full h-[100vh] bg-transparent py-20 overflow-hidden flex flex-col justify-center items-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-10 text-center z-10 text-white tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(0, 157, 255, 0.5)" }}>My Journey</h2>
          <div className="w-full h-[70vh]">
            <LiquidGlassCarousel items={CAROUSEL_ITEMS} background="transparent" />
          </div>
        </section>

        {/* 4. Tech Stack Section */}
        <TechStackSection />

        {/* 5. My Work as Projects Section */}
        <section className="relative w-full h-[100vh] bg-transparent py-20 overflow-hidden flex flex-col justify-center items-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-10 text-center z-10 text-white tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(0, 157, 255, 0.5)" }}>My Projects</h2>
          <div className="w-full h-[70vh]">
            <MosaicFlip background="transparent" />
          </div>
        </section>

        {/* 6. My Achievements Section */}
        <section className="relative w-full h-[100vh] bg-transparent py-20 overflow-hidden flex flex-col justify-center items-center">
          <h2 className="text-4xl md:text-6xl font-bold mb-10 text-center z-10 text-white tracking-widest uppercase" style={{ textShadow: "0 0 20px rgba(0, 157, 255, 0.5)" }}>Achievements</h2>
          <div className="w-full h-[70vh]">
            <HoverImageReveal backgroundColor="transparent" />
          </div>
        </section>

        {/* 7. Contact Us Section */}
        <ContactSection />
      </div>
    </main>
  );
}