'use client';

import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  depth: number;
  twinklePhase: number;
  twinkleSpeed: number;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    let lastTime = performance.now();

    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };

    const createParticles = (width: number, height: number, count: number) => {
      const list: Particle[] = [];
      for (let i = 0; i < count; i++) {
        const depth = Math.random();
        list.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.1 - 0.03,
          size: 0.8 + depth * 1.6,
          opacity: 0.15 + depth * 0.45,
          depth,
          twinklePhase: Math.random() * Math.PI * 2,
          twinkleSpeed: 0.01 + Math.random() * 0.02,
        });
      }
      return list;
    };

    const resize = () => {
      w = canvas.offsetWidth || window.innerWidth;
      h = canvas.offsetHeight || window.innerHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      ctx.scale(dpr, dpr);
      particles = createParticles(w, h, 110);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - w * 0.5;
      mouse.y = e.clientY - rect.top - h * 0.5;
    };

    resize();
    window.addEventListener('resize', resize, { passive: true });
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      const dt = Math.min(32, now - lastTime) / 16.67;
      lastTime = now;

      smoothMouse.x = lerp(smoothMouse.x, mouse.x, 0.05);
      smoothMouse.y = lerp(smoothMouse.y, mouse.y, 0.05);

      ctx.clearRect(0, 0, w, h);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.twinklePhase += p.twinkleSpeed * dt;
        const twinkle = 0.7 + 0.3 * Math.sin(p.twinklePhase);

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;

        const px = p.x + smoothMouse.x * p.depth * 0.08;
        const py = p.y + smoothMouse.y * p.depth * 0.05;

        const r = Math.round(lerp(140, 255, p.depth));
        const g = Math.round(lerp(150, 245, p.depth));
        const b = Math.round(lerp(255, 255, p.depth));
        const alpha = Math.max(0, p.opacity * twinkle);

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha.toFixed(3)})`;
        ctx.fill();
      }
    };

    rafId = requestAnimationFrame(frame);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', resize);
      window.removeEventListener('mousemove', onMouseMove);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        transform: 'translateZ(0)',
      }}
      aria-hidden
    />
  );
}