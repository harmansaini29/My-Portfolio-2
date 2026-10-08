"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { X, Sparkles } from "lucide-react";

export interface CarouselImage {
  src: string;
  alt?: string;
  title?: string;
  description?: string;
  tags?: string[];
  link?: string;
}

export interface CylinderCarouselProps extends React.HTMLAttributes<HTMLDivElement> {
  images: CarouselImage[];
  containerClassName?: string;
  cardClassName?: string;
  animationDuration?: number; // in seconds
  cardWidth?: number; // in pixels
}

export const CylinderCarousel = React.forwardRef<HTMLDivElement, CylinderCarouselProps>(
  (
    {
      images,
      className,
      containerClassName,
      cardClassName,
      animationDuration = 24,
      cardWidth = 260,
      ...props
    },
    ref
  ) => {
    const [selectedProject, setSelectedProject] = useState<CarouselImage | null>(null);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
      setMounted(true);
    }, []);

    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") setSelectedProject(null);
      };
      if (selectedProject) {
        window.addEventListener("keydown", handleKeyDown);
      }
      return () => window.removeEventListener("keydown", handleKeyDown);
    }, [selectedProject]);

    const N = images.length || 1;
    // Calculate radius to position cards in a true 3D cylinder without edge clipping
    const baseRadius = Math.round((cardWidth / 2) / Math.tan(Math.PI / Math.max(3, N)));
    const circumferenceRadius = Math.round((cardWidth * N) / (2 * Math.PI));
    const radius = Math.max(baseRadius, circumferenceRadius, cardWidth + (N <= 4 ? 40 : 15));

    const customStyle = {
      "--n": N,
      "--w": `${cardWidth}px`,
      "--ba": `calc(1turn / var(--n))`,
      "--radius": `${radius}px`,
      "--anim-dur": `${animationDuration}s`,
    } as React.CSSProperties;

    return (
      <div
        ref={ref}
        className={cn(
          "w-full h-full min-h-[480px] grid place-items-center overflow-hidden relative select-none",
          className
        )}
        style={{
          perspective: "45em",
          maskImage: "linear-gradient(90deg, transparent, #000 12% 88%, transparent)",
          WebkitMaskImage: "linear-gradient(90deg, transparent, #000 12% 88%, transparent)",
        }}
        {...props}
      >
        <div
          className={cn(
            "grid place-items-center [transform-style:preserve-3d] motion-reduce:!animate-[ry_128s_linear_infinite] [&:hover]:[animation-play-state:paused]",
            containerClassName
          )}
          style={{
            ...customStyle,
            // Continuous 3D rotation around Y axis
            animation: "cylinderRotate var(--anim-dur) linear infinite",
          }}
        >


          {images.map((img, i) => {
            const angle = (360 / N) * i;
            return (
              <div
                key={i}
                onClick={() => setSelectedProject(img)}
                className={cn(
                  "[grid-area:1/1] rounded-2xl overflow-hidden border border-white/20 bg-slate-900/90 shadow-[0_16px_50px_rgba(0,0,0,0.85)] [backface-visibility:hidden] transition-all duration-300 hover:scale-105 hover:border-cyan-400/80 group cursor-pointer",
                  cardClassName
                )}
                style={{
                  width: "var(--w)",
                  aspectRatio: "3/4",
                  transform: `rotateY(${angle}deg) translateZ(${radius}px)`,
                }}
              >
                <img
                  src={img.src}
                  alt={img.alt || `Project ${i + 1}`}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent flex flex-col justify-end p-4">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-[0.62rem] font-mono tracking-widest text-cyan-400 uppercase font-bold">
                      0{i + 1} // ARCHITECTURE
                    </span>
                    <span className="text-[0.55rem] font-mono px-1.5 py-0.5 rounded bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                      INSPECT
                    </span>
                  </div>

                  <h4 className="text-white font-bold text-sm tracking-tight group-hover:text-cyan-200 transition-colors">
                    {img.title || img.alt}
                  </h4>

                  {img.description && (
                    <p className="text-slate-300 text-[0.68rem] line-clamp-2 mt-1 leading-relaxed">
                      {img.description}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* ── Interactive Detail Modal for Inspected Project (Rendered via Portal to avoid 3D mask/perspective clipping) ── */}
        {mounted &&
          selectedProject &&
          createPortal(
            <div
              className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in pointer-events-auto"
              onClick={() => setSelectedProject(null)}
            >
              <div
                className="relative max-w-lg w-full bg-slate-950 border border-cyan-500/40 rounded-2xl p-6 shadow-[0_0_60px_rgba(6,182,212,0.4)]"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setSelectedProject(null)}
                  className="absolute top-4 right-4 p-1.5 rounded-full bg-slate-900 border border-white/10 text-slate-400 hover:text-white transition-colors cursor-pointer"
                  aria-label="Close dialog"
                >
                  <X className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2 mb-3">
                  <Sparkles className="w-4 h-4 text-cyan-400" />
                  <span className="text-[0.68rem] font-mono tracking-widest text-cyan-400 uppercase">
                    SYSTEM ARCHITECTURE SPECIFICATION
                  </span>
                </div>

                <div className="w-full h-48 rounded-xl overflow-hidden mb-4 border border-white/10">
                  <img
                    src={selectedProject.src}
                    alt={selectedProject.title || "Project preview"}
                    className="w-full h-full object-cover"
                  />
                </div>

                <h3 className="text-xl font-bold text-white mb-2">
                  {selectedProject.title}
                </h3>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {selectedProject.description}
                </p>

                <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
                  <button
                    onClick={() => setSelectedProject(null)}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-xs font-mono text-slate-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>,
            document.body
          )}
      </div>
    );
  }
);

CylinderCarousel.displayName = "CylinderCarousel";
export default CylinderCarousel;
