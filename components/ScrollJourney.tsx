'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import dynamic from 'next/dynamic';
import './ScrollJourney.css';

const Vortex = dynamic(() => import('./Vortex'), { ssr: false });

export default function ScrollJourney() {
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 40,
    damping: 18,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Vortex glides from center (0vw) to right (24vw)
  const vortexX = useTransform(smoothProgress, [0.05, 0.45], ['0vw', '24vw']);
  const vortexScale = useTransform(smoothProgress, [0.05, 0.45], [1.0, 0.82]);
  const vortexOpacity = useTransform(
    smoothProgress,
    [0.0, 0.1, 0.85, 0.98],
    [0.4, 1.0, 1.0, 0.2]
  );

  // Left-docked About Me description rises from down to up
  const aboutY = useTransform(smoothProgress, [0.2, 0.42], ['120px', '0px']);
  const aboutOpacity = useTransform(
    smoothProgress,
    [0.18, 0.32, 0.82, 0.95],
    [0, 1, 1, 0]
  );

  const hintOpacity = useTransform(smoothProgress, [0.0, 0.05], [1, 0]);

  return (
    <div ref={trackRef} className="sj-track">
      <div className="sj-sticky">
        <div className="sj-top-fade" aria-hidden />

        {/* ── Layer 1: 3D WebGL Vortex (Slides right as user scrolls) ── */}
        <motion.div
          className="sj-vortex-layer"
          style={{
            x: vortexX,
            scale: vortexScale,
            opacity: vortexOpacity,
          }}
        >
          <Vortex background="#000000" dots comets direction="right" />
        </motion.div>

        {/* ── Layer 2: Left-side About Me Narrative ── */}
        <motion.div
          className="sj-about-left"
          style={{
            y: aboutY,
            opacity: aboutOpacity,
          }}
        >
          <div className="sj-eyebrow">
            <span className="sj-eyebrow-dot" />
            <span>ABOUT // SYSTEMS ARCHITECTURE</span>
          </div>

          <h2 className="sj-about-title">
            Crafting Low-Latency Engines &amp; 120 FPS Spatial 3D
          </h2>

          <p className="sj-about-desc">
            I am a full-stack engineer and distributed systems builder specializing in thread-safe Java microservices, algorithmic financial execution pipelines, and WebGL rendering. I design low-latency architectures with zero-compromise spatial visual design.
          </p>

          <div className="sj-about-tech-pills">
            <span>Distributed Systems</span>
            <span>Java 21</span>
            <span>Three.js / WebGL</span>
            <span>Next.js 15</span>
            <span>Kafka &amp; Redis</span>
            <span>Flutter</span>
          </div>
        </motion.div>

        {/* ── Layer 3: Scroll Hint ── */}
        <motion.div
          className="sj-scroll-hint"
          style={{ opacity: hintOpacity }}
          aria-hidden
        >
          <div className="sj-mouse-icon">
            <div className="sj-mouse-wheel" />
          </div>
          <span>Scroll to Explore</span>
        </motion.div>
      </div>
    </div>
  );
}