// components/VortexAbout.tsx
"use client";

import React, { useRef, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

import GooeyTextReveal from "@/components/ui/GooeyTextReveal";
import "./VortexAbout.css";

const Vortex = dynamic(() => import("./Vortex"), { ssr: false });

export default function VortexAbout() {
  const trackRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  const [leftActive, setLeftActive] = useState(false);
  const [rightActive, setRightActive] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 960);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Continuous scroll track dedicated to Vortex, Dual Info Flank, and Tail Dissolve
  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ["start start", "end end"],
  });

  // Responsive spring with high stiffness ensuring crisp, zero-lag response to smooth scroll
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 180,
    damping: 26,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Dynamic pointer-events delegation (Requirement R4):
  // When smoothProgress >= 0.74 (the dissolve start point), immediately release pointer events
  // so the Journey carousel behind/below receives all drags and scroll interactions without blockage.
  const vortexPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));
  const stickyPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));

  // ---------------------------------------------------------------------------------------------------
  // REVISED TIMING: LEFT CARD ONLY REVEALS ONCE FULLY IMMERSED (v >= 0.38)
  // RIGHT CARD FOLLOWS SMOOTHLY AT (v >= 0.52)
  // ---------------------------------------------------------------------------------------------------
  useEffect(() => {
    return smoothProgress.on("change", (v) => {
      setLeftActive(v >= 0.38);
      setRightActive(v >= 0.52);
    });
  }, [smoothProgress]);

  // ---------------------------------------------------------------------------------------------------
  // 1. VORTEX: EVOLVES FROM DOWN BEFOREHAND, REACHES IMMERSION, THEN DISSOLVES
  // ---------------------------------------------------------------------------------------------------
  const vortexY = useTransform(smoothProgress, [0.0, 0.22], ["140px", "0px"]);
  const vortexScale = useTransform(
    smoothProgress,
    [0.0, 0.28, 0.85, 1.0],
    [0.88, 1.0, 1.02, 1.05]
  );

  const vortexOpacity = useTransform(
    smoothProgress,
    [0.0, 0.15, 0.98, 1.0],
    [0.6, 1.0, 1.0, 0.0]
  );

  // ---------------------------------------------------------------------------------------------------
  // 2. LEFT INFO: HARMAN SAINI + INTRO (DELAYED UNTIL FULLY IMMERSED IN VORTEX)
  // ---------------------------------------------------------------------------------------------------
  const leftY = useTransform(smoothProgress, [0.34, 0.44], ["60px", "0px"]);
  const leftDesktopOpacity = useTransform(
    smoothProgress,
    [0.34, 0.42, 0.68, 0.76],
    [0.0, 1.0, 1.0, 0.0]
  );
  const leftMobileOpacity = useTransform(
    smoothProgress,
    [0.34, 0.42, 0.52, 0.60],
    [0.0, 1.0, 1.0, 0.0]
  );
  const leftOpacity = isMobile ? leftMobileOpacity : leftDesktopOpacity;

  // ---------------------------------------------------------------------------------------------------
  // 3. RIGHT INFO: DISCIPLINE & CAPABILITIES (FOLLOWS SMOOTHLY AFTER LEFT INFO)
  // ---------------------------------------------------------------------------------------------------
  const rightY = useTransform(smoothProgress, [0.50, 0.60], ["60px", "0px"]);
  const rightDesktopOpacity = useTransform(
    smoothProgress,
    [0.50, 0.58, 0.72, 0.78],
    [0.0, 1.0, 1.0, 0.0]
  );
  const rightMobileOpacity = useTransform(
    smoothProgress,
    [0.58, 0.66, 0.74, 0.80],
    [0.0, 1.0, 1.0, 0.0]
  );
  const rightOpacity = isMobile ? rightMobileOpacity : rightDesktopOpacity;

  // ---------------------------------------------------------------------------------------------------
  // 4. TAIL-END NATIVE GLSL SOBEL EDGE & FBM NOISE DISSOLVE TIMELINE
  // ---------------------------------------------------------------------------------------------------
  const dissolveNormalized = useTransform(smoothProgress, [0.74, 0.98], [0, 1]);
  const dissolveLayerOpacity = useTransform(smoothProgress, [0.74, 0.741, 0.99, 1.0], [0, 1, 1, 0]);
  const dissolveHudOpacity = useTransform(smoothProgress, [0.78, 0.83, 0.94, 0.98], [0, 1, 1, 0]);

  // Initial scroll hint
  const hintOpacity = useTransform(smoothProgress, [0.0, 0.10], [1, 0]);

  return (
    <div ref={trackRef} className="sj-track">
      <motion.div className="sj-sticky" style={{ pointerEvents: stickyPointerEvents }}>
        {/* =====================================================================
             LAYER 1: 3D WEBGL VORTEX
             ===================================================================== */}
        <motion.div
          className="sj-vortex-layer"
          style={{
            y: vortexY,
            scale: vortexScale,
            opacity: vortexOpacity,
            pointerEvents: vortexPointerEvents,
          }}
        >
          <Vortex
            background="#000000"
            dots
            comets
            direction="right"
            className="w-full h-full"
            dissolveProgress={dissolveNormalized}
          />
        </motion.div>

        {/* =====================================================================
             LAYER 2: LEFT INFO (DELAYS UNTIL FULL IMMERSION, GOOEY TEXT REVEAL)
             ===================================================================== */}
        <div className="sj-about-container">
          <motion.div
            className="sj-text-flow"
            style={{
              y: leftY,
              opacity: leftOpacity,
            }}
          >
            <div className="sj-tag-row">
              <span className="sj-pulse-dot cyan" />
              <span className="sj-tag-label">01 // SYSTEMS ARCHITECT</span>
            </div>

            <GooeyTextReveal
              mode="immediate"
              trigger={leftActive}
              duration={1.2}
              blurAmount={0.3}
              ease="power3.out"
            >
              <h2 className="sj-heading">Harman Saini</h2>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={leftActive}
              duration={1.2}
              delay={0.15}
              blurAmount={0.25}
            >
              <p className="sj-subheading text-cyan-400">
                Full-Stack Systems Architect &amp; 3D Spatial Engineer
              </p>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={leftActive}
              duration={1.3}
              delay={0.25}
              blurAmount={0.2}
            >
              <p className="sj-paragraph">
                Specializing in thread-safe Java microservices, algorithmic financial
                execution pipelines, and WebGL rendering. I bridge low-latency computational
                throughput with tactile visual aesthetics.
              </p>
            </GooeyTextReveal>

            <div className="sj-tech-pills">
              {[
                "Distributed Systems",
                "Java 21",
                "Three.js / WebGL",
                "Next.js 16",
                "Kafka & Redis",
                "Lock-Free Queues",
                "Custom GLSL",
              ].map((tech) => (
                <span key={tech} className="sj-tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            <div className="sj-metrics-row">
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot cyan" />
                <span>&lt;10ms Latency</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot indigo" />
                <span>120 FPS WebGL</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot cyan" />
                <span>99.99% Uptime</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =====================================================================
             LAYER 3: RIGHT INFO (FOLLOWS SMOOTHLY AFTER LEFT INFO)
             ===================================================================== */}
        <div className="sj-right-container">
          <motion.div
            className="sj-text-flow"
            style={{
              y: rightY,
              opacity: rightOpacity,
            }}
          >
            <div className="sj-tag-row">
              <span className="sj-pulse-dot indigo" />
              <span className="sj-tag-label">02 // DISCIPLINE &amp; CAPABILITIES</span>
            </div>

            <GooeyTextReveal
              mode="immediate"
              trigger={rightActive}
              duration={1.2}
              blurAmount={0.3}
              ease="power3.out"
            >
              <h2 className="sj-heading">Algorithmic Precision &amp; Spatial Computation</h2>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={rightActive}
              duration={1.2}
              delay={0.15}
              blurAmount={0.25}
            >
              <p className="sj-subheading text-indigo-400">
                Deterministic Event Streams &amp; Concurrency
              </p>
            </GooeyTextReveal>

            <GooeyTextReveal
              mode="immediate"
              trigger={rightActive}
              duration={1.3}
              delay={0.25}
              blurAmount={0.2}
            >
              <p className="sj-paragraph">
                Engineering deterministic event streams, lock-free ring buffers, and
                hardware-accelerated GLSL compute shaders. Designed for extreme fault
                tolerance and zero garbage collection pauses.
              </p>
            </GooeyTextReveal>

            <div className="sj-tech-pills">
              {[
                "Zero-Lock Concurrency",
                "GLSL Shaders",
                "Raft Consensus",
                "Micro-Pipelines",
                "Event Streams",
                "WebGPU Matrix",
                "eBPF & NetOps",
              ].map((tech) => (
                <span key={tech} className="sj-tech-pill">
                  {tech}
                </span>
              ))}
            </div>

            <div className="sj-metrics-row">
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot indigo" />
                <span>Sub-10ms Core</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot cyan" />
                <span>Zero-Lock RAM</span>
              </div>
              <div className="sj-metric-tag">
                <span className="sj-pulse-dot indigo" />
                <span>Raft Engine</span>
              </div>
            </div>
          </motion.div>
        </div>

        {/* =====================================================================
             LAYER 4: DIRECT GLSL DISSOLVE HUD & TRANSITION
             ===================================================================== */}
        <motion.div
          className="sj-dissolve-layer"
          style={{ opacity: 0, pointerEvents: "none" }}
        />

        {/* Telemetry HUD displaying transition status */}
        <motion.div
          className="sj-dissolve-hud"
          style={{ opacity: dissolveHudOpacity }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-cyan-500/40 bg-black/75 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.25)]">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-[0.68rem] font-mono tracking-widest text-cyan-300 uppercase font-semibold">
              VORTEX DISSOLVE // TRANSITIONING TO JOURNEY
            </span>
          </div>
        </motion.div>

        {/* =====================================================================
             SCROLL EXPLORATION HINT
             ===================================================================== */}
        <motion.div className="sj-scroll-hint" style={{ opacity: hintOpacity }} aria-hidden>
          <div className="sj-mouse-icon">
            <div className="sj-mouse-wheel" />
          </div>
          <span>Scroll to Explore</span>
        </motion.div>
      </motion.div>
    </div>
  );
}
