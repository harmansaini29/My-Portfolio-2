'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Journey3DScene from './Journey3DScene';
import './Journey3DSection.css';

export default function Journey3DSection() {
  const trackRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: trackRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 18,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Central spine & branches SVG line draw progress
  const spineHeight = useTransform(smoothProgress, [0.05, 0.95], ['0%', '100%']);
  const branch1Draw = useTransform(smoothProgress, [0.10, 0.24], [1, 0]);
  const branch2Draw = useTransform(smoothProgress, [0.42, 0.56], [1, 0]);
  const branch3Draw = useTransform(smoothProgress, [0.73, 0.88], [1, 0]);

  // Milestone 1: School (Active ~ 0.08 - 0.36)
  const schoolOpacity = useTransform(smoothProgress, [0.08, 0.18, 0.28, 0.36], [0, 1, 1, 0]);
  const schoolX = useTransform(smoothProgress, [0.08, 0.18], ['50px', '0px']);

  // Milestone 2: College (Active ~ 0.40 - 0.68)
  const collegeOpacity = useTransform(smoothProgress, [0.40, 0.50, 0.60, 0.68], [0, 1, 1, 0]);
  const collegeX = useTransform(smoothProgress, [0.40, 0.50], ['-50px', '0px']);

  // Milestone 3: University (Active ~ 0.72 - 0.98)
  const uniOpacity = useTransform(smoothProgress, [0.72, 0.82, 0.92, 1.0], [0, 1, 1, 1]);
  const uniX = useTransform(smoothProgress, [0.72, 0.82], ['50px', '0px']);

  return (
    <div ref={trackRef} className="j3d-track">
      <div className="j3d-sticky">
        <div className="j3d-top-fade" aria-hidden />
        <div className="j3d-ambient-grid" aria-hidden />

        {/* ── WebGL 3D Interactive Model Canvas ── */}
        <Journey3DScene scrollProgress={smoothProgress} />

        {/* ── Scroll-Driven Branching Tree SVG Spine ── */}
        <div className="j3d-tree-container" aria-hidden>
          <div className="j3d-tree-spine-track">
            <motion.div className="j3d-tree-spine-fill" style={{ height: spineHeight }} />
          </div>

          <svg className="j3d-tree-branches-svg" viewBox="0 0 1000 1000" preserveAspectRatio="none">
            {/* Branch 1: Center to Right (School) */}
            <motion.path
              d="M 500 200 Q 580 200 680 200"
              stroke="#6366f1"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="200"
              style={{ strokeDashoffset: useTransform(branch1Draw, (v) => v * 200) }}
            />
            {/* Branch 2: Center to Left (College) */}
            <motion.path
              d="M 500 530 Q 420 530 320 530"
              stroke="#06b6d4"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="200"
              style={{ strokeDashoffset: useTransform(branch2Draw, (v) => v * 200) }}
            />
            {/* Branch 3: Center to Right (University) */}
            <motion.path
              d="M 500 870 Q 580 870 680 870"
              stroke="#10b981"
              strokeWidth="2.5"
              fill="none"
              strokeDasharray="200"
              style={{ strokeDashoffset: useTransform(branch3Draw, (v) => v * 200) }}
            />
          </svg>
        </div>

        {/* ── Milestone 1: School (Right Docked, 3D on Left) ── */}
        <motion.div
          className="j3d-dock j3d-dock-right"
          style={{ opacity: schoolOpacity, x: schoolX }}
        >
          <div className="j3d-serial" style={{ color: '#818cf8' }}>
            [01 // STEM &amp; LOGIC FOUNDATIONS]
          </div>
          <h2 className="j3d-title">St. Marks Senior Secondary School</h2>
          <div className="j3d-meta">
            <span className="j3d-badge">2018 — 2020</span>
            <span className="j3d-tagline">Applied Mathematics &amp; Physics</span>
          </div>
          <p className="j3d-desc">
            Cultivated deep analytical thinking, advanced calculus, and wrote logic scripts that initiated my core passion for computing.
          </p>
          <div className="j3d-tags">
            <span>Calculus</span>
            <span>Applied Physics</span>
            <span>Logic Systems</span>
            <span>C++ Foundations</span>
          </div>
        </motion.div>

        {/* ── Milestone 2: College (Left Docked, 3D on Right) ── */}
        <motion.div
          className="j3d-dock j3d-dock-left"
          style={{ opacity: collegeOpacity, x: collegeX }}
        >
          <div className="j3d-serial" style={{ color: '#22d3ee' }}>
            [02 // HIGHER SECONDARY CS]
          </div>
          <h2 className="j3d-title">Senior Secondary College</h2>
          <div className="j3d-meta">
            <span className="j3d-badge">2020 — 2022</span>
            <span className="j3d-tagline">Full-Stack &amp; OOP Architectures</span>
          </div>
          <p className="j3d-desc">
            Mastered computer organization, memory models, object-oriented system design, and built my early scalable web micro-services.
          </p>
          <div className="j3d-tags">
            <span>JavaScript</span>
            <span>Data Structures</span>
            <span>OOP Architecture</span>
            <span>REST Protocol</span>
          </div>
        </motion.div>

        {/* ── Milestone 3: University (Right Docked, 3D on Left) ── */}
        <motion.div
          className="j3d-dock j3d-dock-right"
          style={{ opacity: uniOpacity, x: uniX }}
        >
          <div className="j3d-serial" style={{ color: '#34d399' }}>
            [03 // B.TECH COMPUTER SCIENCE &amp; ENGINEERING]
          </div>
          <h2 className="j3d-title">Chhatrapati Shivaji Maharaj University</h2>
          <div className="j3d-meta">
            <span className="j3d-badge">2022 — 2026</span>
            <span className="j3d-tagline">Distributed Systems &amp; Spatial WebGL</span>
          </div>
          <p className="j3d-desc">
            Architected enterprise Java microservices, high-concurrency trading engines, Onlinegyan platform, KaramStay hospitality systems, and 120 FPS spatial web graphics.
          </p>
          <div className="j3d-tags">
            <span>Distributed Systems</span>
            <span>Java 21</span>
            <span>Spring Boot</span>
            <span>Kafka &amp; Redis</span>
            <span>Three.js / WebGL</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}