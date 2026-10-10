'use client';

import React from 'react';

interface ChromiumBorderContainerProps {
  children: React.ReactNode;
  activeProjectIndex?: number;
  totalProjects?: number;
  className?: string;
}

export default function ChromiumBorderContainer({
  children,
  activeProjectIndex = 0,
  totalProjects = 10,
  className = '',
}: ChromiumBorderContainerProps) {
  return (
    <div
      className={`relative w-[94vw] max-w-6xl aspect-square max-h-[min(70vh,640px)] max-w-[min(94vw,70vh,640px)] mx-auto rounded-3xl p-2 sm:p-3 transition-all duration-500 border-2 border-amber-100/40 bg-black/50 shadow-[0_0_30px_rgba(253,230,138,0.15)] ${className}`}
    >
      {/* 1. Ambient Rim Halo / Backlight Radiance - Warm White + Cyan Photonic Accent */}
      <div
        className="absolute -inset-2 rounded-3xl bg-gradient-to-r from-cyan-500/25 via-white/20 to-amber-200/25 blur-2xl pointer-events-none animate-chromium-halo"
        aria-hidden="true"
      />

      {/* 2. Outer Chromium Border Ring (Double border created by padding + inner border) */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        {/* Static Specular Bezel Foundation */}
        <div className="absolute inset-0 bg-chromium-bezel opacity-40" />
        
        {/* Rotating Conic Photonic Light Beam */}
        <div className="absolute inset-[-150%] bg-chromium-conic-beam animate-chromium-beam opacity-70 mix-blend-screen" />
      </div>

      {/* 3. Inner Obsidian Chamber Housing MosaicFlip */}
      <div className="relative w-full h-full rounded-[calc(1.5rem-8px)] sm:rounded-[calc(1.5rem-12px)] bg-black/90 backdrop-blur-2xl overflow-hidden z-10 border-2 border-amber-100/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-1.5px_1px_rgba(0,0,0,0.9),inset_0_0_35px_rgba(0,0,0,0.85)]">
        {children}

        {/* Specular Diagonal Light Sweep Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-amber-100/10 to-transparent animate-specular-sheen" />
        </div>
      </div>

      {/* 4. Precision Machined Corner Brackets & Telemetry */}
      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-amber-200/80 rounded-tl-sm pointer-events-none z-30" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-amber-200/80 rounded-tr-sm pointer-events-none z-30" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-amber-200/80 rounded-bl-sm pointer-events-none z-30" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-amber-200/80 rounded-br-sm pointer-events-none z-30" />

      {/* Telemetry HUD Headers */}
      <div className="absolute top-3.5 left-5 pointer-events-none z-30 flex items-center gap-2 font-mono text-[0.62rem] tracking-widest text-amber-200/80 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-200 animate-pulse" />
        <span className="hidden sm:inline">SYS // WARM-PROFILE-01</span>
        <span className="sm:hidden">SYS // 01</span>
      </div>

      <div className="absolute top-3.5 right-5 pointer-events-none z-30 font-mono text-[0.62rem] tracking-widest text-slate-300 uppercase">
        <span>
          PROJECT [{String(activeProjectIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(totalProjects).padStart(2, '0')}]
        </span>
      </div>
    </div>
  );
}
