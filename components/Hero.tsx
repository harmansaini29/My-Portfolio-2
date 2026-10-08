'use client';

import './Hero.css';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import DiceRoleFlipper from './DiceRoleFlipper';

const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false });

interface LiquidRevealHeroProps {
  baseSrc: string;
  chromeSrc: string;
  name?: string;
  hint?: string;
}

const ROLES = [
  'Full Stack Developer',
  'Java Systems Engineer',
  '3D WebGL Architect',
  'Algorithmic Trader',
  'Horology Analyst',
];

const HeroTelemetryLeft = React.memo(function HeroTelemetryLeft() {
  return (
    <div className="hero-telemetry-left" aria-hidden>
      <div className="hero-telemetry-line" />
      <span className="hero-telemetry-text">LAT 28 38&apos; N // HIGH POWER // 120 FPS WebGL</span>
      <div className="hero-telemetry-line" />
    </div>
  );
});

const HeroTelemetryRight = React.memo(function HeroTelemetryRight() {
  return (
    <div className="hero-telemetry-right" aria-hidden>
      <div className="hero-telemetry-line" />
      <span className="hero-telemetry-text">LON 77 13&apos; E // &lt;10MS LATENCY // CORE ACTIVE</span>
      <div className="hero-telemetry-line" />
    </div>
  );
});

const HeroPowerBadges = React.memo(function HeroPowerBadges() {
  return (
    <div className="hero-power-badges">
      <div className="hero-power-badge">
        <span className="hero-power-dot cyan" />
        <span>High Power Core</span>
      </div>
      <div className="hero-power-badge">
        <span className="hero-power-dot emerald" />
        <span>&lt;10ms Latency</span>
      </div>
      <div className="hero-power-badge">
        <span className="hero-power-dot indigo" />
        <span>120 FPS WebGL</span>
      </div>
    </div>
  );
});

export default function LiquidRevealHero({
  baseSrc,
  chromeSrc,
  name = 'Harman Saini',
  hint = 'Move cursor to reveal',
}: LiquidRevealHeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const imgTopRef = useRef<HTMLImageElement>(null);
  const imgBottomRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);

  const [topSrc, setTopSrc] = useState(chromeSrc);
  const [bottomSrc, setBottomSrc] = useState(baseSrc);
  const [spinning, setSpinning] = useState(false);

  useEffect(() => { setTopSrc(chromeSrc); }, [chromeSrc]);
  useEffect(() => { setBottomSrc(baseSrc); }, [baseSrc]);

  const handleSwap = useCallback(() => {
    setTopSrc((prev) => (prev === chromeSrc ? baseSrc : chromeSrc));
    setBottomSrc((prev) => (prev === baseSrc ? chromeSrc : baseSrc));
    setSpinning(true);
    window.setTimeout(() => setSpinning(false), 500);
  }, [baseSrc, chromeSrc]);

  // Visibility state to pause RAF loops when offscreen
  const [isInView, setIsInView] = useState(true);

  useEffect(() => {
    const hero = heroRef.current;
    if (!hero || typeof IntersectionObserver === 'undefined') return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInView(entry.isIntersecting);
      },
      { threshold: 0.05 }
    );
    observer.observe(hero);
    return () => observer.disconnect();
  }, []);

  // Direct, low-overhead scroll parallax optimized for Lenis RAF loop (zero double-lerp lag)
  useEffect(() => {
    const imgBottom = imgBottomRef.current;
    const imgTop = imgTopRef.current;
    const bottomLeft = bottomLeftRef.current;
    if (!imgBottom || !imgTop || !bottomLeft) return;

    let rafId = 0;
    let isScheduled = false;

    const updateParallax = () => {
      isScheduled = false;
      if (!isInView) return;

      const scrollY = window.scrollY || 0;
      const maxH = window.innerHeight || 900;
      if (scrollY > maxH * 1.5) return; // Completely offscreen

      const t = Math.min(1, Math.max(0, scrollY / maxH));

      // Direct hardware-accelerated transforms - perfectly synchronized with Lenis
      imgBottom.style.transform = `translate3d(0, ${(t * -60).toFixed(2)}px, 0) scale(${(1 + t * 0.04).toFixed(4)})`;
      imgTop.style.transform = `translate3d(0, ${(t * -35).toFixed(2)}px, 0) scale(${(1 + t * 0.02).toFixed(4)})`;
      bottomLeft.style.transform = `translate3d(0, ${(t * -70).toFixed(2)}px, 0)`;
      bottomLeft.style.opacity = Math.max(0, 1 - t * 2.2).toFixed(3);
    };

    const onScroll = () => {
      if (!isScheduled && isInView) {
        isScheduled = true;
        rafId = requestAnimationFrame(updateParallax);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateParallax();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView]);

  // 120 FPS Fluid Pointer Mask Loop
  useEffect(() => {
    const hero = heroRef.current;
    const imgTop = imgTopRef.current;
    const glow = glowRef.current;
    const hintEl = hintRef.current;
    if (!hero || !imgTop || !glow || !hintEl) return;

    let w = hero.clientWidth || window.innerWidth;
    let h = hero.clientHeight || window.innerHeight;

    const onResize = () => {
      if (!hero) return;
      w = hero.clientWidth || window.innerWidth;
      h = hero.clientHeight || window.innerHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    const target = { x: w * 0.5, y: h * 0.5 };
    const head = { x: w * 0.5, y: h * 0.5 };
    const lag = { x: w * 0.5, y: h * 0.5 };
    let pointerActive = false;
    let lastPointerTime = 0;
    let radius = 0;
    let targetRadius = 26;
    const feather = 0.65;

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
    const clamp01 = (v: number) => Math.max(0, Math.min(1, v));
    let idleT = 0;

    const getIdlePos = (t: number) => {
      const cx = w * 0.5;
      const cy = h * 0.48;
      const rx = w * 0.22;
      const ry = h * 0.16;
      return {
        x: cx + Math.sin(t * 0.6) * rx + Math.sin(t * 0.18) * rx * 0.3,
        y: cy + Math.cos(t * 0.45) * ry + Math.sin(t * 0.25) * ry * 0.2,
      };
    };

    const updatePointer = (clientX: number, clientY: number) => {
      const rect = hero.getBoundingClientRect();
      target.x = clientX - rect.left;
      target.y = clientY - rect.top;
      pointerActive = true;
      lastPointerTime = performance.now();
      targetRadius = 28;
      hintEl.style.opacity = '0';
    };

    const handlePointerMove = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const handlePointerDown = (e: PointerEvent) => updatePointer(e.clientX, e.clientY);
    const handlePointerEnd = () => { pointerActive = false; };

    hero.addEventListener('pointermove', handlePointerMove, { passive: true });
    hero.addEventListener('pointerdown', handlePointerDown, { passive: true });
    hero.addEventListener('pointerleave', handlePointerEnd, { passive: true });
    hero.addEventListener('pointerup', handlePointerEnd, { passive: true });
    hero.addEventListener('pointercancel', handlePointerEnd, { passive: true });

    let lastTime = performance.now();
    let rafId = 0;

    const frame = (now: number) => {
      if (!isInView) {
        rafId = 0;
        return;
      }

      const dt = Math.min(36, now - lastTime) / 1000;
      lastTime = now;

      const idle = !pointerActive && now - lastPointerTime > 1200;
      if (idle) {
        idleT += dt * 0.7;
        const p = getIdlePos(idleT);
        target.x = p.x;
        target.y = p.y;
        targetRadius = 22;
      }

      const easeHead = 1 - Math.pow(0.002, dt);
      head.x = lerp(head.x, target.x, easeHead);
      head.y = lerp(head.y, target.y, easeHead);

      const easeLag = 1 - Math.pow(0.018, dt);
      lag.x = lerp(lag.x, head.x, easeLag);
      lag.y = lerp(lag.y, head.y, easeLag);

      const easeRad = 1 - Math.pow(0.025, dt);
      radius = lerp(radius, Math.max(targetRadius, 0.001), easeRad);

      if (!idle && now - lastPointerTime > 180) {
        targetRadius = lerp(targetRadius, 0.001, easeRad * 0.6);
      }

      const hxPct = (head.x / w) * 100;
      const hyPct = (head.y / h) * 100;
      const lxPct = (lag.x / w) * 100;
      const lyPct = (lag.y / h) * 100;
      const corePct = radius * feather;
      const lagR = radius * 0.82;
      const lagCore = lagR * feather;

      const maskStr =
        `radial-gradient(circle at ${hxPct.toFixed(2)}% ${hyPct.toFixed(2)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${corePct.toFixed(2)}%, rgba(0,0,0,1) ${radius.toFixed(2)}%), ` +
        `radial-gradient(circle at ${lxPct.toFixed(2)}% ${lyPct.toFixed(2)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${lagCore.toFixed(2)}%, rgba(0,0,0,1) ${lagR.toFixed(2)}%)`;

      imgTop.style.webkitMaskImage = maskStr;
      imgTop.style.maskImage = maskStr;

      const openness = clamp01(radius / 28);
      const gx = head.x - w * 0.5;
      const gy = head.y - h * 0.5;
      glow.style.transform = `translate3d(${gx.toFixed(1)}px, ${gy.toFixed(1)}px, 0)`;
      glow.style.opacity = (0.35 * openness).toFixed(3);

      rafId = requestAnimationFrame(frame);
    };

    if (isInView) {
      rafId = requestAnimationFrame(frame);
    }

    return () => {
      window.removeEventListener('resize', onResize);
      hero.removeEventListener('pointermove', handlePointerMove);
      hero.removeEventListener('pointerdown', handlePointerDown);
      hero.removeEventListener('pointerleave', handlePointerEnd);
      hero.removeEventListener('pointerup', handlePointerEnd);
      hero.removeEventListener('pointercancel', handlePointerEnd);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [isInView]);

  return (
    <div className="hero" id="hero" ref={heroRef}>
      <ParticleField />
      <img
        className="layerChrome"
        id="imgBottom"
        src={bottomSrc}
        alt="Harman Saini Background"
        draggable={false}
        ref={imgBottomRef}
      />
      <img
        className="layerBase"
        id="imgTop"
        src={topSrc}
        alt="Harman Saini Reveal"
        draggable={false}
        ref={imgTopRef}
      />
      <div className="glow" id="glow" ref={glowRef} />

      {/* Perimeter Telemetry */}
      <HeroTelemetryLeft />
      <HeroTelemetryRight />

      {/* Top Right Controls */}
      <div className="top-right-controls">
        <div className="swap-wrapper">
          <button
            className={`swapBtnIcon${spinning ? ' spinning' : ''}`}
            type="button"
            aria-label="Swap background and foreground layers"
            onClick={handleSwap}
            suppressHydrationWarning
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          </button>
        </div>
      </div>

      {/* Bottom Left Identity Section */}
      <div className="bottom-left-section" ref={bottomLeftRef}>
        <div className="greeting-row">
          <span className="wave-hand">👋</span>
          <span className="greeting-silver-subtitle">Hey mate, I am</span>
        </div>
        <div className="hero-silver-title-wrapper">
          <div className="hero-silver-backglow" aria-hidden />
          <h1 className="hero-silver-title">{name}</h1>
        </div>
        <DiceRoleFlipper roles={ROLES} intervalMs={3000} />

        {/* High Power & Latency Telemetry Matrix */}
        <HeroPowerBadges />
      </div>

      <div className="hint" id="hint" ref={hintRef}>
        {hint}
      </div>
    </div>
  );
}