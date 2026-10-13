'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import { AnimatePresence, motion, useScroll, useSpring, useTransform } from 'framer-motion';
import LiquidGlassCarousel from '@/components/LiquidGlassCarousel';
import { CAROUSEL_DATA } from '@/lib/portfolio-data';

export default function JourneySection() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeCarousel, setActiveCarousel] = useState(-1);
  const [isInteractive, setIsInteractive] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const carouselItems = useMemo(
    () => CAROUSEL_DATA.map((d) => ({ image: d.image })),
    []
  );

  // Track scroll progress along the 460vh journey track
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  // Responsive spring with high stiffness ensuring zero-lag synchronization
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 26,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Fade in as vortex finishes dissolving
  const opacity = useTransform(smoothProgress, [0, 0.88, 0.96, 1], [0, 0, 1, 1]);

  // Pre-Dissolve Stacking & Wheel Hardening (Adversarial Advisory):
  // Dynamically disable pointer events when progress < 0.96 so Journey does not capture
  // mouse wheel or drag events prior to vortex dissolution.
  const journeyPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.96 ? 'auto' : 'none'));

  useEffect(() => {
    return smoothProgress.on('change', (v) => {
      setIsInteractive(v >= 0.96);
    });
  }, [smoothProgress]);

  return (
    <div ref={containerRef} style={{ height: '260vh', position: 'relative' }}>
      <motion.div
        style={{
          position: 'sticky',
          top: 0,
          height: '100vh',
          opacity,
          pointerEvents: journeyPointerEvents,
          overflow: 'hidden',
        }}
      >
        <section
          className="w-full h-full bg-transparent py-20 overflow-hidden flex flex-col justify-center items-center relative pointer-events-auto"
          style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
        >
          <h2
            className="text-4xl md:text-6xl font-bold mb-10 text-center z-10 text-white tracking-widest uppercase pointer-events-none"
            style={{ textShadow: '0 0 20px rgba(0, 157, 255, 0.5)' }}
          >
            My Journey
          </h2>

          <div
            className="w-full h-[65vh] relative z-20 pointer-events-auto"
            style={{ pointerEvents: isInteractive ? 'auto' : 'none' }}
          >
            <LiquidGlassCarousel
              items={carouselItems}
              background="transparent"
              cardWidth={isMobile ? 120 : 220}
              cardHeight={isMobile ? 165 : 295}
              gap={isMobile ? 10 : 14}
              onFocusChange={setActiveCarousel}
              entry={{ enabled: false }}
              motion={{
                autoScroll: true,
                autoScrollSpeed: 38,
                pauseOnHover: true,
                resumeDelay: 1200,
              }}
              interaction={{
                drag: isInteractive,
                wheel: isInteractive,
                clickToFocus: isInteractive,
              }}
            />
          </div>

          <AnimatePresence>
            {activeCarousel !== -1 && CAROUSEL_DATA[activeCarousel] && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute bottom-[10%] left-1/2 -translate-x-1/2 z-30 pointer-events-none bg-black/60 backdrop-blur-md px-8 py-4 rounded-2xl text-center w-[90%] max-w-2xl border border-cyan-500/20 shadow-[0_0_25px_rgba(6,182,212,0.15)]"
              >
                <h3 className="text-2xl md:text-3xl font-bold text-white mb-2 tracking-wide uppercase">
                  {CAROUSEL_DATA[activeCarousel].title}
                </h3>
                <p className="text-sm md:text-base text-cyan-300 font-mono tracking-wider">
                  {CAROUSEL_DATA[activeCarousel].desc}
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </motion.div>
    </div>
  );
}
