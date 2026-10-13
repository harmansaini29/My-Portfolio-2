'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import DiceRoleFlipper from './DiceRoleFlipper';
import './Hero.css';

const ROLES = [
  'Full Stack Developer',
  'Java Systems Engineer',
  '3D WebGL Architect',
  'Algorithmic Trader',
  'Horology Analyst',
];

interface HeroProps {
  baseSrc?: string;
  portraitSrc?: string;
  chromeSrc?: string;
  name?: string;
  hint?: string;
}

export default function Hero({
  baseSrc = '/images/base.png',
  portraitSrc = '/images/portrait.png',
  chromeSrc = '/images/chrome.png',
  name = 'Harman Saini',
  hint = 'Move cursor to reveal',
}: HeroProps) {
  const heroRef = useRef<HTMLDivElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const imgTopRef = useRef<HTMLDivElement>(null);
  const imgBottomRef = useRef<HTMLImageElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLDivElement>(null);
  const bottomLeftRef = useRef<HTMLDivElement>(null);

  const [activeIdx, setActiveIdx] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [portraitLoaded, setPortraitLoaded] = useState(false);

  // Check initial load state of portrait
  useEffect(() => {
    const img = new Image();
    img.src = portraitSrc;
    if (img.complete) {
      setPortraitLoaded(true);
    } else {
      img.onload = () => setPortraitLoaded(true);
    }
  }, [portraitSrc]);

  const handleSwap = () => {
    setActiveIdx((prev) => (prev === 0 ? 1 : 0));
    setSpinning(true);
    setTimeout(() => setSpinning(false), 500);
  };

  useEffect(() => {
    const hero = heroRef.current;
    const imgTop = imgTopRef.current;
    const imgBottom = imgBottomRef.current;
    const glow = glowRef.current;
    const hintEl = hintRef.current;
    const bottomLeft = bottomLeftRef.current;

    if (!hero || !imgTop || !imgBottom || !glow || !hintEl || !bottomLeft) return;

    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Visibility
    let inView = true;
    let observer: IntersectionObserver | null = null;
    let last = performance.now();
    let rafId: number = 0;

    if ('IntersectionObserver' in window) {
      observer = new IntersectionObserver((e) => {
        const visible = e[0].isIntersecting;
        const wasVisible = inView;
        inView = visible;
        if (!wasVisible && visible && !reduce) {
          last = performance.now();
          if (!rafId) {
            rafId = requestAnimationFrame(frame);
          }
        }
      }, { threshold: .05 });
      observer.observe(hero);
    }

    // Parallax
    let sched = false;
    function parallax() {
      sched = false;
      if (!inView) return;
      const sy = window.scrollY || 0;
      const mh = window.innerHeight || 900;
      if (sy > mh * 1.5) return;
      const t = Math.min(1, Math.max(0, sy / mh));
      imgBottom!.style.transform = `translate3d(0, ${(t * -60).toFixed(2)}px, 0) scale(${(1 + t * .04).toFixed(4)})`;
      imgTop!.style.transform = `translate3d(0, ${(t * -35).toFixed(2)}px, 0) scale(${(1 + t * .02).toFixed(4)})`;
      bottomLeft!.style.transform = `translate3d(0, ${(t * -70).toFixed(2)}px, 0)`;
      bottomLeft!.style.opacity = Math.max(0, 1 - t * 2.2).toFixed(3);
    }
    const onScroll = () => {
      if (!sched) {
        sched = true;
        requestAnimationFrame(parallax);
      }
    };
    window.addEventListener('scroll', onScroll, { passive: true });

    // Pointer mask loop
    let w = stageRef.current ? stageRef.current.clientWidth : hero.clientWidth;
    let h = stageRef.current ? stageRef.current.clientHeight : hero.clientHeight;
    const onResize = () => {
      const s = stageRef.current || hero;
      w = s.clientWidth;
      h = s.clientHeight;
    };
    window.addEventListener('resize', onResize, { passive: true });

    const target = { x: w * .5, y: h * .5 }, head = { x: w * .5, y: h * .5 }, lag = { x: w * .5, y: h * .5 };
    let active = false, lastPtr = 0, radius = 0, targetR = 26, feather = .65, idleT = 0;
    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    function idlePos(t: number) {
      return {
        x: w * .5 + Math.sin(t * .8) * w * .3 + Math.sin(t * .24) * w * .09,
        y: h * .48 + Math.cos(t * .6) * h * .22 + Math.sin(t * .35) * h * .044
      };
    }

    function ptr(e: PointerEvent) {
      const stage = stageRef.current || hero;
      if (!stage) return;
      const r = stage.getBoundingClientRect();
      const stageScale = r.width / (stage.clientWidth || 1);
      target.x = (e.clientX - r.left) / (stageScale || 1);
      target.y = (e.clientY - r.top) / (stageScale || 1);
      active = true;
      lastPtr = performance.now();
      targetR = 38;
      hintEl!.style.opacity = '0';
    }

    const onPtrEnd = () => { active = false; };
    
    // Type assertions to any because React refs typing vs DOM event types can sometimes mismatch
    hero.addEventListener('pointermove', ptr as any, { passive: true });
    hero.addEventListener('pointerdown', ptr as any, { passive: true });
    
    ['pointerleave', 'pointerup', 'pointercancel'].forEach(n => {
      hero.addEventListener(n, onPtrEnd, { passive: true });
    });

    function frame(now: number) {
      if (!inView) {
        rafId = 0;
        return;
      }
      const dt = Math.min(36, now - last) / 1000;
      last = now;

      const idle = !active && now - lastPtr > 600;
      if (idle) {
        idleT += dt * .8;
        const p = idlePos(idleT);
        target.x = p.x; target.y = p.y;
        targetR = 32;
      }

      const eh = 1 - Math.pow(.001, dt);
      head.x = lerp(head.x, target.x, eh);
      head.y = lerp(head.y, target.y, eh);

      const el = 1 - Math.pow(.012, dt);
      lag.x = lerp(lag.x, head.x, el);
      lag.y = lerp(lag.y, head.y, el);

      const er = 1 - Math.pow(.015, dt);
      radius = lerp(radius, Math.max(targetR, .001), er);

      if (!idle && now - lastPtr > 180) {
        targetR = lerp(targetR, .001, er * .6);
      }

      const lagR = radius * .82;
      const m = `radial-gradient(circle at ${(head.x / w * 100).toFixed(2)}% ${(head.y / h * 100).toFixed(2)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${(radius * feather).toFixed(2)}%, rgba(0,0,0,1) ${radius.toFixed(2)}%), ` +
                `radial-gradient(circle at ${(lag.x / w * 100).toFixed(2)}% ${(lag.y / h * 100).toFixed(2)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${(lagR * feather).toFixed(2)}%, rgba(0,0,0,1) ${lagR.toFixed(2)}%)`;

      imgTop!.style.webkitMaskImage = m;
      imgTop!.style.maskImage = m;

      const open = Math.max(0, Math.min(1, radius / 28));
      glow!.style.transform = `translate3d(${(head.x - w * .5).toFixed(1)}px,${(head.y - h * .5).toFixed(1)}px,0)`;
      glow!.style.opacity = (.35 * open).toFixed(3);

      rafId = requestAnimationFrame(frame);
    }

    if (!reduce) rafId = requestAnimationFrame(frame);

    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onResize);
      hero.removeEventListener('pointermove', ptr as any);
      hero.removeEventListener('pointerdown', ptr as any);
      ['pointerleave', 'pointerup', 'pointercancel'].forEach(n => {
        hero.removeEventListener(n, onPtrEnd);
      });
      if (observer) observer.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <div className="hero" id="hero" ref={heroRef}>
      <div className="hero-stage" ref={stageRef}>
        <img
          className="layerChrome"
          id="imgBottom"
          src={baseSrc}
          alt=""
          ref={imgBottomRef}
          draggable={false}
          data-fit="cover"
          data-position="top"
          loading="lazy"
          fetchPriority="low"
          decoding="async"
          style={{
            opacity: portraitLoaded ? 1 : 0,
            transition: 'opacity 0.6s ease',
          }}
        />
        
        <div className="layerBase" id="imgTop" ref={imgTopRef}>
          <img
            className={activeIdx === 0 ? "isActive" : ""}
            style={{ translate: "0% 0%", scale: "1", transformOrigin: "50% 0%" }}
            src={portraitSrc}
            alt={activeIdx === 0 ? "Portrait" : ""}
            aria-hidden={activeIdx !== 0}
            draggable={false}
            data-fit="cover"
            data-position="top"
            loading="eager"
            fetchPriority="high"
            decoding="sync"
            onLoad={() => setPortraitLoaded(true)}
          />
          <img
            className={activeIdx === 1 ? "isActive" : ""}
            style={{ translate: "0% 0%", scale: "1", transformOrigin: "50% 0%" }}
            src={chromeSrc}
            alt={activeIdx === 1 ? "Younger portrait" : ""}
            aria-hidden={activeIdx !== 1}
            draggable={false}
            data-fit="cover"
            data-position="top"
          />
        </div>
        
        <div className="glow" id="glow" ref={glowRef}></div>
      </div>

      <div className="tele l" aria-hidden="true">
        <div className="tele-line"></div>
        <span className="tele-text">LAT 28 38' N // HIGH POWER // 120 FPS WebGL</span>
        <div className="tele-line"></div>
      </div>
      
      <div className="tele r" aria-hidden="true">
        <div className="tele-line"></div>
        <span className="tele-text">LON 77 13' E // &lt;10MS LATENCY // CORE ACTIVE</span>
        <div className="tele-line"></div>
      </div>

      <div className="top-right-controls">
        <button 
          className={`swapBtnIcon ${spinning ? 'spinning' : ''}`} 
          id="swap" 
          type="button" 
          onClick={handleSwap} 
          aria-label="Swap between the two portraits"
          title="Swap portrait appearance"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="17 1 21 5 17 9"/>
            <path d="M3 11V9a4 4 0 0 1 4-4h14"/>
            <polyline points="7 23 3 19 7 15"/>
            <path d="M21 13v2a4 4 0 0 1-4 4H3"/>
          </svg>
        </button>
      </div>

      <div className="bottom-left-section" id="bottomLeft" ref={bottomLeftRef}>
        <div className="greeting-row">
          <span className="wave-hand">👋</span>
          <span className="greeting-silver-subtitle">Hey mate, I am</span>
        </div>
        <div className="hero-silver-title-wrapper">
          <div className="hero-silver-backglow" aria-hidden="true"></div>
          <h1 className="hero-silver-title">{name}</h1>
        </div>
        <DiceRoleFlipper roles={ROLES} intervalMs={3000} />
        <div className="hero-power-badges">
          <div className="hero-power-badge"><span className="hero-power-dot cyan"></span><span>High Power Core</span></div>
          <div className="hero-power-badge"><span className="hero-power-dot emerald"></span><span>&lt;10ms Latency</span></div>
          <div className="hero-power-badge"><span className="hero-power-dot indigo"></span><span>120 FPS WebGL</span></div>
        </div>
      </div>
      <div className="hint" id="hint" ref={hintRef}>{hint}</div>
    </div>
  );
}