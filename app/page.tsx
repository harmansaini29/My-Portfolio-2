'use client';

import React from 'react';
import Hero from '@/components/Hero';
import VortexAbout from '@/components/VortexAbout';
import JourneySection from '@/components/JourneySection';
import TechStackSection from '@/components/TechStackSection';
import ProjectsSection from '@/components/ProjectsSection';
import AchievementsSection from '@/components/AchievementsSection';
import ContactSection from '@/components/ContactSection';
import ParticleField from '@/components/ParticleField';
import StickySection from '@/components/StickySection';
import { HERO_MEDIA } from '@/lib/portfolio-data';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white overflow-x-clip pb-0 selection:bg-cyan-500 selection:text-black">
      {/* Shared Ambient Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen">
        <ParticleField />
      </div>

      <div className="relative z-10">
        {/* 1. Hero */}
        <Hero
          baseSrc={HERO_MEDIA.base.url}
          portraitSrc={HERO_MEDIA.portrait.url}
          chromeSrc={HERO_MEDIA.chrome.url}
          name="Harman Saini"
          hint="Move cursor to reveal"
        />

        {/* 2. Vortex About & 3. Journey Section - Grid Overlap for Seamless Dissolve */}
        {/* Stacking hierarchy: Journey at z-20, VortexAbout at z-10 */}
        <div id="vortex-journey" className="grid grid-cols-1 grid-rows-1 w-full">
          <div className="col-start-1 row-start-1 w-full relative z-10">
            <VortexAbout />
          </div>
          <div className="col-start-1 row-start-1 w-full relative z-20 pointer-events-none">
            <JourneySection />
          </div>
        </div>

        {/* 4. Techstack */}
        <div id="techstack-section">
          <StickySection>
            <TechStackSection />
          </StickySection>
        </div>

        {/* 5. Projects */}
        <div id="projects-section">
          <StickySection>
            <ProjectsSection />
          </StickySection>
        </div>

        {/* 6. Achievements */}
        <div id="achievements-section">
          <AchievementsSection />
        </div>

        {/* 7. Contact Us */}
        <div id="contact-section">
          <ContactSection />
        </div>
      </div>
    </main>
  );
}