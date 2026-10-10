'use client';

import React from 'react';

// Full tech stack with icon CDN URLs (Simple Icons / Devicons)
const ROW1 = [
  { name: 'React',      icon: 'https://cdn.simpleicons.org/react/61DAFB' },
  { name: 'Next.js',    icon: 'https://cdn.simpleicons.org/nextdotjs/ffffff' },
  { name: 'TypeScript', icon: 'https://cdn.simpleicons.org/typescript/3178C6' },
  { name: 'Node.js',    icon: 'https://cdn.simpleicons.org/nodedotjs/5FA04E' },
  { name: 'Python',     icon: 'https://cdn.simpleicons.org/python/3776AB' },
  { name: 'Go',         icon: 'https://cdn.simpleicons.org/go/00ADD8' },
  { name: 'Java',       icon: 'https://cdn.simpleicons.org/openjdk/ffffff' },
  { name: 'Rust',       icon: 'https://cdn.simpleicons.org/rust/ffffff' },
  { name: 'Docker',     icon: 'https://cdn.simpleicons.org/docker/2496ED' },
  { name: 'Kubernetes', icon: 'https://cdn.simpleicons.org/kubernetes/326CE5' },
];

const ROW2 = [
  { name: 'PostgreSQL', icon: 'https://cdn.simpleicons.org/postgresql/4169E1' },
  { name: 'MongoDB',    icon: 'https://cdn.simpleicons.org/mongodb/47A248' },
  { name: 'Redis',      icon: 'https://cdn.simpleicons.org/redis/FF4438' },
  { name: 'AWS',        icon: 'https://cdn.simpleicons.org/amazonaws/FF9900' },
  { name: 'GCP',        icon: 'https://cdn.simpleicons.org/googlecloud/4285F4' },
  { name: 'Tailwind',   icon: 'https://cdn.simpleicons.org/tailwindcss/06B6D4' },
  { name: 'Prisma',     icon: 'https://cdn.simpleicons.org/prisma/ffffff' },
  { name: 'GraphQL',    icon: 'https://cdn.simpleicons.org/graphql/E10098' },
  { name: 'LangChain',  icon: 'https://cdn.simpleicons.org/langchain/ffffff' },
  { name: 'Vercel',     icon: 'https://cdn.simpleicons.org/vercel/ffffff' },
];

interface TechChipProps {
  name: string;
  icon: string;
}

function TechChip({ name, icon }: TechChipProps) {
  return (
    <div className="relative overflow-hidden flex-shrink-0 flex items-center gap-6 mx-6 px-10 py-5 rounded-2xl bg-white/[0.04] border border-white/[0.12] backdrop-blur-md hover:bg-white/[0.08] hover:border-cyan-500/50 hover:shadow-[0_0_20px_rgba(6,182,212,0.3)] transition-all duration-300 group cursor-default select-none">
      {/* Shine effect */}
      <div className="absolute inset-0 -translate-x-[150%] skew-x-12 bg-gradient-to-r from-transparent via-cyan-400/40 to-transparent group-hover:translate-x-[150%] transition-transform duration-1000 ease-in-out z-0" />
      {/* Symbol / Icon */}
      <img
        src={icon}
        alt={name}
        width={48}
        height={48}
        className="w-12 h-12 object-contain group-hover:scale-110 transition-transform duration-300 relative z-10"
        loading="lazy"
      />
      <span className="text-xl font-bold text-slate-300 group-hover:text-white transition-colors tracking-wide whitespace-nowrap relative z-10">
        {name}
      </span>
    </div>
  );
}

// Duplicate arrays for seamless infinite loop
const ITEMS1 = [...ROW1, ...ROW1, ...ROW1];
const ITEMS2 = [...ROW2, ...ROW2, ...ROW2];

export default function TechStackDualCarousel() {
  return (
    <div className="w-full h-full flex flex-col items-center justify-center gap-16 overflow-hidden px-0 mt-32 pt-16 pb-16">
      {/* Section title */}
      <div className="text-center pointer-events-none z-10 px-4">
        <h2
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-widest uppercase"
          style={{ textShadow: '0 0 25px rgba(6, 182, 212, 0.55)' }}
        >
          Tech Stack
        </h2>
        <p className="text-xs sm:text-sm text-cyan-400/70 font-mono tracking-widest mt-2 uppercase">
          Tools & Technologies I Work With
        </p>
      </div>

      {/* Row 1 → moves LEFT */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex animate-marquee-left">
          {ITEMS1.map((tech, i) => (
            <TechChip key={`r1-${i}`} name={tech.name} icon={tech.icon} />
          ))}
        </div>
      </div>

      {/* Row 2 → moves RIGHT */}
      <div
        className="relative w-full overflow-hidden"
        style={{
          maskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
          WebkitMaskImage: 'linear-gradient(to right, transparent, black 8%, black 92%, transparent)',
        }}
      >
        <div className="flex animate-marquee-right">
          {ITEMS2.map((tech, i) => (
            <TechChip key={`r2-${i}`} name={tech.name} icon={tech.icon} />
          ))}
        </div>
      </div>
    </div>
  );
}
