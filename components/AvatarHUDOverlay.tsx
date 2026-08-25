'use client';

import React, { useRef, useEffect, useState, useCallback } from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion';
import './AvatarHUDOverlay.css';

interface HUDCard {
  id: string;
  title: string;
  titleTag: string;
  accentColor: string;
  content: React.ReactNode;
}

const TECH_BADGES = [
  { name: 'React 19', color: '#61dafb' },
  { name: 'Next.js', color: '#ffffff' },
  { name: 'Java 21', color: '#f89820' },
  { name: 'Spring Boot', color: '#6db33f' },
  { name: 'Node.js', color: '#68a063' },
  { name: 'Three.js / WebGL', color: '#38bdf8' },
  { name: 'Flutter & Dart', color: '#54c5f8' },
  { name: 'Kafka & Redis', color: '#dc382d' },
  { name: 'Distributed Systems', color: '#a855f7' },
  { name: 'FinTech Algo Engine', color: '#10b981' },
];

const HUD_CARDS: HUDCard[] = [
  {
    id: 'identity',
    title: 'Profile & Systems Core',
    titleTag: 'SYS.ID // HARMAN.SAINI',
    accentColor: '#6366f1',
    content: (
      <>
        <div className="hud-bio-name">Harman Saini</div>
        <div className="hud-bio-role">Full-Stack Engineer · Distributed Systems &amp; Spatial 3D</div>
        <div className="hud-bio-grid">
          <span className="hud-bio-item">
            <span className="hud-bio-label">ENGINEERING</span>
            <span className="hud-bio-value">High-Concurrency</span>
          </span>
          <span className="hud-bio-item">
            <span className="hud-bio-label">EXPERIENCE</span>
            <span className="hud-bio-value">3+ Years Active</span>
          </span>
          <span className="hud-bio-item">
            <span className="hud-bio-label">ARCHITECTURE</span>
            <span className="hud-bio-value">Java &amp; 3D WebGL</span>
          </span>
          <span className="hud-bio-item">
            <span className="hud-bio-label">STATUS</span>
            <span className="hud-bio-value hud-status-active">● OPERATIONAL</span>
          </span>
        </div>
      </>
    ),
  },
  {
    id: 'techstack',
    title: 'Technology Matrix',
    titleTag: 'STACK // PRODUCTION MODULES',
    accentColor: '#06b6d4',
    content: (
      <div className="hud-tech-grid">
        {TECH_BADGES.map((b) => (
          <span
            key={b.name}
            className="hud-tech-badge"
            style={{ '--badge-color': b.color } as React.CSSProperties}
          >
            {b.name}
          </span>
        ))}
      </div>
    ),
  },
  {
    id: 'philosophy',
    title: 'Engineering Philosophy',
    titleTag: 'ARCH.PHILOSOPHY',
    accentColor: '#10b981',
    content: (
      <ul className="hud-eng-list">
        <li className="hud-eng-item">
          <span className="hud-eng-dot" style={{ background: '#6366f1' }} />
          <span>Low-latency, thread-safe financial execution pipelines and fraud telemetry</span>
        </li>
        <li className="hud-eng-item">
          <span className="hud-eng-dot" style={{ background: '#06b6d4' }} />
          <span>Zero-compromise spatial 3D web experiences running at 120 FPS</span>
        </li>
      </ul>
    ),
  },
];

function getBezierPoint(
  t: number,
  p0x: number, p0y: number,
  p1x: number, p1y: number,
  p2x: number, p2y: number
) {
  const u = 1 - t;
  return {
    x: u * u * p0x + 2 * u * t * p1x + t * t * p2x,
    y: u * u * p0y + 2 * u * t * p1y + t * t * p2y,
  };
}

interface LeaderLinesProps {
  w: number;
  h: number;
  visible: boolean;
}

function LeaderLinesFromRight({ w, h, visible }: LeaderLinesProps) {
  const avatarCenterX = w * 0.72;
  const cardRightEdgeX = w * 0.48;

  const defs = [
    { id: 'l1', anchorY: h * 0.28, cardY: h * 0.23, color: '#6366f1', label: 'IDENTITY' },
    { id: 'l2', anchorY: h * 0.48, cardY: h * 0.50, color: '#06b6d4', label: 'STACK' },
    { id: 'l3', anchorY: h * 0.68, cardY: h * 0.75, color: '#10b981', label: 'FOCUS' },
  ];

  const lines = defs.map((d) => {
    const ax = avatarCenterX;
    const ay = d.anchorY;
    const ex = cardRightEdgeX;
    const ey = d.cardY;
    const cx = ax - (ax - ex) * 0.5;
    const cy = ay + (ey - ay) * 0.4;
    const path = `M ${ax.toFixed(1)} ${ay.toFixed(1)} Q ${cx.toFixed(1)} ${cy.toFixed(1)} ${ex.toFixed(1)} ${ey.toFixed(1)}`;
    const pulse = getBezierPoint(0.5, ax, ay, cx, cy, ex, ey);
    return { ...d, path, ax, ay, ex, ey, pulse };
  });

  return (
    <svg
      className="hud-leader-svg"
      width={w}
      height={h}
      style={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 5 }}
      aria-hidden
    >
      <defs>
        {lines.map((l) => (
          <filter key={`glow-${l.id}`} id={`glow-${l.id}`} x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        ))}
      </defs>

      {lines.map((l, i) => (
        <g key={l.id}>
          <path
            d={l.path}
            stroke={l.color}
            strokeWidth={3}
            fill="none"
            opacity={0.3}
            filter={`url(#glow-${l.id})`}
            style={{
              strokeDasharray: 300,
              strokeDashoffset: visible ? 0 : 300,
              transition: `stroke-dashoffset 0.7s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
            }}
          />
          <path
            d={l.path}
            stroke={l.color}
            strokeWidth={1.5}
            fill="none"
            opacity={0.85}
            style={{
              strokeDasharray: 300,
              strokeDashoffset: visible ? 0 : 300,
              transition: `stroke-dashoffset 0.65s cubic-bezier(0.16, 1, 0.3, 1) ${i * 120}ms`,
            }}
          />
          <circle
            cx={l.ax}
            cy={l.ay}
            r={3.5}
            fill={l.color}
            opacity={visible ? 1 : 0}
            style={{ transition: `opacity 0.3s ease ${i * 120 + 350}ms` }}
          />
          <rect
            x={l.ax - 6}
            y={l.ay - 6}
            width={12}
            height={12}
            fill="none"
            stroke={l.color}
            strokeWidth={1}
            opacity={visible ? 0.5 : 0}
            rx={2}
            style={{ transition: `opacity 0.3s ease ${i * 120 + 400}ms` }}
          />
          <circle
            cx={l.pulse.x}
            cy={l.pulse.y}
            r={2.5}
            fill={l.color}
            className="hud-pulse-dot"
            opacity={visible ? 1 : 0}
          />
          <circle
            cx={l.ex}
            cy={l.ey}
            r={2.5}
            fill={l.color}
            opacity={visible ? 0.9 : 0}
            style={{ transition: `opacity 0.3s ease ${i * 120 + 450}ms` }}
          />
          <text
            x={l.ax + 12}
            y={l.ay + 3}
            fontSize={8}
            fill={l.color}
            opacity={visible ? 0.75 : 0}
            letterSpacing={1.2}
            fontFamily="'SF Mono', Menlo, monospace"
            style={{ transition: `opacity 0.3s ease ${i * 120 + 400}ms` }}
          >
            {l.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

interface AvatarHUDOverlayProps {
  scrollProgress: MotionValue<number>;
}

export default function AvatarHUDOverlay({ scrollProgress }: AvatarHUDOverlayProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const [linesVisible, setLinesVisible] = useState(false);

  const springProgress = useSpring(scrollProgress, { stiffness: 45, damping: 18 });

  // 1. Overall Opacity Phase: Emerges at 0.15, stays active, dissolves into Journey at 0.48
  const overlayOpacity = useTransform(springProgress, [0.12, 0.22, 0.44, 0.52], [0, 1, 1, 0]);

  // 2. Avatar Rising Effect from Down to Up
  const avatarY = useTransform(springProgress, [0.12, 0.25], ['140px', '0px']);
  const avatarScale = useTransform(springProgress, [0.12, 0.25], [0.85, 1]);

  // 3. Left HUD Cards Staggered Rise from Down to Up
  const cardsY = useTransform(springProgress, [0.14, 0.28], ['120px', '0px']);

  useEffect(() => {
    const unsub = scrollProgress.on('change', (v) => {
      if (v > 0.18 && v < 0.48) setLinesVisible(true);
      else setLinesVisible(false);
    });
    return unsub;
  }, [scrollProgress]);

  const measure = useCallback(() => {
    if (!rootRef.current) return;
    const { offsetWidth, offsetHeight } = rootRef.current;
    setDimensions({ w: offsetWidth, h: offsetHeight });
    setIsMobile(offsetWidth < 860);
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (rootRef.current) ro.observe(rootRef.current);
    return () => ro.disconnect();
  }, [measure]);

  return (
    <motion.div
      ref={rootRef}
      className="hud-overlay-root"
      style={{ opacity: overlayOpacity }}
    >
      {!isMobile && dimensions.w > 0 && (
        <LeaderLinesFromRight
          w={dimensions.w}
          h={dimensions.h}
          visible={linesVisible}
        />
      )}

      {/* ── LEFT COLUMN: HUD Data Cards (Rising from Down to Up) ── */}
      <motion.div className="hud-cards-col-left" style={{ y: cardsY }}>
        {HUD_CARDS.map((card, i) => (
          <motion.div
            key={card.id}
            className="hud-card"
            style={{
              '--card-accent': card.accentColor,
              borderColor: `${card.accentColor}33`,
            } as React.CSSProperties}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.6,
              delay: i * 0.12,
              ease: [0.16, 1, 0.3, 1],
            }}
          >
            <div className="hud-card-header">
              <span
                className="hud-card-accent-bar"
                style={{ background: card.accentColor }}
              />
              <div className="hud-card-titles">
                <span className="hud-card-title">{card.title}</span>
                <span className="hud-card-tag">{card.titleTag}</span>
              </div>
              <span
                className="hud-card-corner-bracket"
                style={{ borderColor: `${card.accentColor}60` }}
              />
            </div>
            <div className="hud-card-body">{card.content}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* ── RIGHT COLUMN: Avatar & Stats (Rising from Down to Up) ── */}
      <motion.div
        className="hud-avatar-col-right"
        style={{ y: avatarY, scale: avatarScale }}
      >
        <div className="hud-avatar-frame">
          <div className="hud-avatar-rim" />
          <img
            src="/images/avatar.png"
            alt="Harman Saini"
            className="hud-avatar-img"
            draggable={false}
          />
          <div className="hud-avatar-scanlines" aria-hidden />
          <div className="hud-avatar-badge">
            <span className="hud-avatar-badge-dot" />
            <span className="hud-avatar-badge-text">HARMAN.SAINI // ONLINE</span>
          </div>
        </div>

        <div className="hud-stats-row">
          {[
            { v: '3+', l: 'Years Exp' },
            { v: '20+', l: 'Projects' },
            { v: '5', l: 'Domains' },
            { v: '∞', l: 'Creativity' },
          ].map((s) => (
            <div key={s.l} className="hud-stat">
              <span className="hud-stat-value">{s.v}</span>
              <span className="hud-stat-label">{s.l}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </motion.div>
  );
}