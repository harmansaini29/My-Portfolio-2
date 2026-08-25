'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform, useSpring } from 'framer-motion';
import Journey3DScene from './Journey3DScene';
import './Journey3DSection.css';

export default function Journey3DSection() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 45,
    damping: 18,
    mass: 0.1,
    restDelta: 0.001,
  });

  // Milestone 1: School (Active ~ 0.44 to 0.64)
  const schoolOpacity = useTransform(smoothProgress, [0.44, 0.50, 0.58, 0.64], [0, 1, 1, 0]);
  const schoolX = useTransform(smoothProgress, [0.44, 0.50], ['-50px', '0px']);

  // Milestone 2: College (Active ~ 0.65 to 0.83)
  const collegeOpacity = useTransform(smoothProgress, [0.65, 0.71, 0.77, 0.83], [0, 1, 1, 0]);
  const collegeX = useTransform(smoothProgress, [0.65, 0.71], ['50px', '0px']);

  // Milestone 3: University (Active ~ 0.84 to 1.0)
  const uniOpacity = useTransform(smoothProgress, [0.84, 0.90, 0.96, 1.0], [0, 1, 1, 0]);
  const uniX = useTransform(smoothProgress, [0.84, 0.90], ['-50px', '0px']);

  return (
    <div ref={containerRef} className="j3d-track" style={{ position: 'relative' }}>
      <div className="j3d-sticky">
        {/* WebGL 3D Interactive Models */}
        <Journey3DScene scrollProgress={smoothProgress} />

        {/* Milestone 1: School */}
        <motion.div
          className="j3d-milestone-dock j3d-dock-left"
          style={{ opacity: schoolOpacity, x: schoolX }}
        >
          <div className="j3d-milestone-serial" style={{ color: '#818cf8' }}>
            [01 // FOUNDATION &amp; STEM]
          </div>
          <h2 className="j3d-milestone-title">St. Marks Senior Secondary School</h2>
          <div className="j3d-milestone-meta">
            <span className="j3d-meta-badge">2018 — 2020</span>
            <span className="j3d-meta-cat">Applied Mathematics &amp; Logic</span>
          </div>
          <p className="j3d-milestone-desc">
            Cultivated deep analytical thinking, advanced calculus, and wrote logic scripts that initiated my core passion for distributed computing.
          </p>
          <div className="j3d-tag-cloud">
            <span>Calculus</span>
            <span>Applied Physics</span>
            <span>Logic Systems</span>
            <span>C++ Foundations</span>
          </div>
        </motion.div>

        {/* Milestone 2: College */}
        <motion.div
          className="j3d-milestone-dock j3d-dock-right"
          style={{ opacity: collegeOpacity, x: collegeX }}
        >
          <div className="j3d-milestone-serial" style={{ color: '#22d3ee' }}>
            [02 // HIGHER SECONDARY CS]
          </div>
          <h2 className="j3d-milestone-title">Senior Secondary College</h2>
          <div className="j3d-milestone-meta">
            <span className="j3d-meta-badge">2020 — 2022</span>
            <span className="j3d-meta-cat">Full-Stack &amp; Algorithms</span>
          </div>
          <p className="j3d-milestone-desc">
            Mastered computer architecture, object-oriented system design, and built my first full-stack scalable web prototypes.
          </p>
          <div className="j3d-tag-cloud">
            <span>JavaScript</span>
            <span>Data Structures</span>
            <span>OOP Architecture</span>
            <span>REST Protocol</span>
          </div>
        </motion.div>

        {/* Milestone 3: University */}
        <motion.div
          className="j3d-milestone-dock j3d-dock-left"
          style={{ opacity: uniOpacity, x: uniX }}
        >
          <div className="j3d-milestone-serial" style={{ color: '#34d399' }}>
            [03 // B.TECH COMPUTER SCIENCE &amp; ENGINEERING]
          </div>
          <h2 className="j3d-milestone-title">Chhatrapati Shivaji Maharaj University</h2>
          <div className="j3d-milestone-meta">
            <span className="j3d-meta-badge">2022 — 2026</span>
            <span className="j3d-meta-cat">Distributed Systems &amp; WebGL</span>
          </div>
          <p className="j3d-milestone-desc">
            Architected enterprise Java microservices, low-latency trading engines, Onlinegyan platform, KaramStay hospitality engines, and zero-compromise 120 FPS spatial web graphics.
          </p>
          <div className="j3d-tag-cloud">
            <span>Distributed Systems</span>
            <span>Enterprise Java 21</span>
            <span>Spring Boot</span>
            <span>Kafka &amp; Redis</span>
            <span>Three.js / WebGL</span>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
