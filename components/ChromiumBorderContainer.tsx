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
      className={`relative w-[94vw] max-w-5xl md:max-w-6xl h-[65vh] md:h-[72vh] min-h-[480px] max-h-[700px] aspect-[16/10] mx-auto rounded-3xl rounded-tl-3xl transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.85)] ${className}`}
    >
      {/* 1. Ambient Rim Halo / Backlight Radiance - Cyan + Amber Accent */}
      <div
        className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-amber-300/15 to-cyan-500/20 blur-xl pointer-events-none animate-chromium-halo"
        aria-hidden="true"
      />

      {/* Specular Metallic Bezel Foundation */}
      <div className="absolute inset-0 rounded-3xl rounded-tl-3xl overflow-hidden pointer-events-none opacity-25 bg-chromium-bezel" aria-hidden="true" />

      {/* 2. Sleek Single-Line Curvy Border & Photonic Running Light Beam */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible rounded-3xl rounded-tl-3xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="photonicOrbitBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="25%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base Monoline Bezel Rim */}
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="24"
          ry="24"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Orbiting Cyan & Amber Photonic Running Light Beam */}
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="24"
          ry="24"
          stroke="url(#photonicOrbitBeam)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="22 78"
          className="animate-photonic-beam animate-chromium-beam"
        />
      </svg>

      {/* 3. Obsidian Chamber Housing MosaicFlip */}
      <div className="relative w-full h-full rounded-3xl rounded-tl-3xl bg-black/90 backdrop-blur-2xl overflow-hidden z-10 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.2),inset_0_-1.5px_1px_rgba(0,0,0,0.9),inset_0_0_35px_rgba(0,0,0,0.85)]">
        {children}

        {/* Specular Diagonal Sheen Sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-100/10 to-transparent animate-specular-sheen" />
        </div>
      </div>

      {/* 4. Sleek Telemetry HUD Headers */}
      <div className="absolute top-3.5 left-5 pointer-events-none z-30 flex items-center gap-2 font-mono text-[0.62rem] tracking-widest text-cyan-300 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="hidden sm:inline">SYS // PHOTONIC-RESONANCE</span>
        <span className="sm:hidden">SYS // 01</span>
      </div>

      <div className="absolute top-3.5 right-5 pointer-events-none z-30 font-mono text-[0.62rem] tracking-widest text-amber-200/90 uppercase">
        <span>
          PROJECT [{String((activeProjectIndex ?? 0) + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(totalProjects || 10).padStart(2, '0')}]
        </span>
      </div>
    </div>
  );
}
