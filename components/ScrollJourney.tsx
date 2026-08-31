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
    stiffness: 45,
    damping: 20,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Vortex smoothly slides to the right as user scrolls
  const vortexX = useTransform(smoothProgress, [0.05, 0.45], ['0vw', '25vw']);
  const vortexScale = useTransform(smoothProgress, [0.05, 0.45], [1.0, 0.85]);
  const vortexOpacity = useTransform(
    smoothProgress,
    [0.0, 0.1, 0.85, 0.98],
    [0.5, 1.0, 1.0, 0.2]
  );

  // Left-docked narrative: enters gently and stays locked in the upper-middle left
  const aboutY = useTransform(smoothProgress, [0.15, 0.38], ['60px', '0px']);
  const aboutOpacity = useTransform(
    smoothProgress,
    [0.15, 0.30, 0.82, 0.95],
    [0, 1, 1, 0]
  );

  const hintOpacity = useTransform(smoothProgress, [0.0, 0.06], [1, 0]);

  return (
    <div ref={trackRef} className="sj-track">
      <div className="sj-sticky">
        <div className="sj-top-fade" aria-hidden />

        {/* ── Layer 1: 3D WebGL Vortex (Slides right) ── */}
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

        {/* ── Layer 2: Left-side About Me Narrative (Upper-Middle Left Aligned) ── */}
        <motion.div
          className="sj-about-left"
          style={{
            y: aboutY,
            opacity: aboutOpacity,
          }}
        >
          <div className="sj-eyebrow">
            <span className="sj-eyebrow-dot" />
            <span>ABOUT // SYSTEMS &amp; SPATIAL ARCHITECTURE</span>
          </div>

          <h2 className="sj-about-title">
            Crafting Low-Latency Engines &amp; 120 FPS Spatial 3D
          </h2>

          <p className="sj-about-desc">
            I am a full-stack engineer and distributed systems builder specializing in thread-safe Java microservices, algorithmic financial execution pipelines, and WebGL rendering. I bridge computational throughput with tactile visual aesthetics.
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