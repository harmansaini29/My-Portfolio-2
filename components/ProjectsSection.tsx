'use client';

import React, { useState, useMemo } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MosaicFlip from '@/components/MosaicFlip';
import ChromiumBorderContainer from '@/components/ChromiumBorderContainer';
import { PROJECT_DATA } from '@/lib/portfolio-data';

export default function ProjectsSection() {
  const [activeProject, setActiveProject] = useState(0);
  const currentProject = PROJECT_DATA[activeProject];

  const projectItems = useMemo(
    () => PROJECT_DATA.map((d) => ({ image: d.image })),
    []
  );

  return (
    <section className="relative w-full h-full max-h-screen bg-transparent py-3 sm:py-5 flex flex-col justify-center items-center overflow-hidden">
      {/* Section Title */}
      <div className="mb-2 sm:mb-3 text-center z-20 pointer-events-none px-4">
        <h2
          className="text-2xl sm:text-3xl md:text-5xl font-bold text-white tracking-widest uppercase"
          style={{ textShadow: '0 0 25px rgba(0, 157, 255, 0.6)' }}
        >
          My Projects
        </h2>
        <p className="text-[0.65rem] sm:text-xs text-cyan-400 font-mono tracking-widest mt-0.5 uppercase">
          [ Click or Drag to Flip ]
        </p>
      </div>

      {/* Chromium Border + MosaicFlip + Info inside / links on right */}
      <div className="relative w-full flex justify-center items-center px-2 sm:px-4">
        {/* Main container */}
        <ChromiumBorderContainer
          activeProjectIndex={activeProject}
          totalProjects={PROJECT_DATA.length}
        >
          {/* MosaicFlip takes full inner space */}
          <MosaicFlip
            images={projectItems}
            background="transparent"
            size={100}
            columns={8}
            rows={8}
            speed={10}
            stagger={1.5}
            onSlideChange={setActiveProject}
          />

          {/* Project Info Overlay — inside the chromium border, bottom of the carpet */}
          <AnimatePresence mode="wait">
            {currentProject && (
              <motion.div
                key={activeProject}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.22 }}
                className="absolute bottom-0 left-0 right-0 z-30 pointer-events-none"
              >
                <div className="mx-2 sm:mx-4 mb-2 sm:mb-3 px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-black/75 backdrop-blur-xl border border-white/10 shadow-[0_0_30px_rgba(0,0,0,0.8)]">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex flex-col gap-0.5 sm:gap-1 flex-1 min-w-0">
                      <h3 className="text-sm sm:text-base md:text-lg font-bold text-white tracking-wide uppercase truncate">
                        {currentProject.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-cyan-300 font-mono tracking-wide line-clamp-2">
                        {currentProject.desc}
                      </p>
                      {currentProject.tags && currentProject.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                          {currentProject.tags.map((tag) => (
                            <span
                              key={tag}
                              className="text-[0.6rem] font-mono px-1.5 py-0.5 rounded bg-white/5 border border-white/10 text-slate-400"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          {/* GitHub / Live Link Icons — floating on the right side of the border */}
          <div className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 flex flex-col gap-2 sm:gap-3 pointer-events-auto">
            <AnimatePresence mode="wait">
              {currentProject && (
                <motion.div
                  key={activeProject}
                  initial={{ opacity: 0, x: 12 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 12 }}
                  transition={{ duration: 0.2 }}
                  className="flex flex-col gap-2"
                >
                  {/* GitHub Icon Button */}
                  {currentProject.github && (
                    <a
                      href={currentProject.github}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View on GitHub"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-black/80 border border-white/20 hover:border-white/60 hover:bg-white/10 text-white transition-all duration-200 shadow-lg hover:scale-110"
                    >
                      {/* GitHub SVG */}
                      <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
                        <path d="M12 0C5.37 0 0 5.37 0 12c0 5.3 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61-.546-1.385-1.335-1.755-1.335-1.755-1.087-.744.083-.729.083-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 21.795 24 17.295 24 12c0-6.63-5.37-12-12-12z"/>
                      </svg>
                    </a>
                  )}

                  {/* Live Link Icon Button */}
                  {currentProject.link && (
                    <a
                      href={currentProject.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="View Live Project"
                      className="flex items-center justify-center w-10 h-10 rounded-full bg-cyan-950/80 border border-cyan-500/40 hover:border-cyan-400 hover:bg-cyan-900/60 text-cyan-300 transition-all duration-200 shadow-lg hover:scale-110"
                    >
                      {/* External Link SVG */}
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
                        <polyline points="15 3 21 3 21 9"/>
                        <line x1="10" y1="14" x2="21" y2="3"/>
                      </svg>
                    </a>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </ChromiumBorderContainer>
      </div>
    </section>
  );
}
