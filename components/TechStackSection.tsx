'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const TechStackDualCarousel = dynamic(() => import('./TechStackDualCarousel'), { ssr: false });

export default function TechStackSection() {
  return (
    <section className="relative w-full min-h-screen bg-transparent">
      <TechStackDualCarousel />
    </section>
  );
}
