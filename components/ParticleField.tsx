'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  baseX: number;
  baseY: number;
  size: number;
  opacity: number;
  depth: number; // 0 = far, 1 = near
  twinklePhase: number;
  twinkleSpeed: number;
}

function createParticles(w: number, h: number, count: number): Particle[] {
  const particles: Particle[] = [];
  for (let i = 0; i < count; i++) {
    const depth = Math.random();
    const x = Math.random() * w;
    const y = Math.random() * h;
    particles.push({
      x,
      y,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.12 - 0.04,
      baseX: x,
      baseY: y,
      size: 0.6 + depth * 1.8,
      opacity: 0.08 + depth * 0.28,
      depth,
      twinklePhase: Math.random() * Math.PI * 2,
      twinkleSpeed: 0.008 + Math.random() * 0.016,
    });
  }
  return particles;
}

export default function ParticleField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = 0;
    let h = 0;
    let particles: Particle[] = [];
    let rafId = 0;
    let last = performance.now();
    const FPS_CAP = 1000 / 120;

    const mouse = { x: 0, y: 0 };
    const smoothMouse = { x: 0, y: 0 };

    const resize = () => {
      w = canvas.offsetWidth;
      h = canvas.offsetHeight;
      canvas.width = w;
      canvas.height = h;
      particles = createParticles(w, h, 180);
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouse.x = e.clientX - rect.left - w * 0.5;
      mouse.y = e.clientY - rect.top - h * 0.5;
    };

    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

    const frame = (now: number) => {
      rafId = requestAnimationFrame(frame);
      if (now - last < FPS_CAP) return;
      const dt = Math.min(48, now - last) / 16.67;
      last = now;

      // Smooth mouse parallax
      smoothMouse.x = lerp(smoothMouse.x, mouse.x, 0.04);
      smoothMouse.y = lerp(smoothMouse.y, mouse.y, 0.04);

      ctx.clearRect(0, 0, w, h);

      // Deep layer — blurred particles (depth < 0.45)
      ctx.save();
      ctx.filter = 'blur(1.4px)';
      particles.forEach((p) => {
        if (p.depth >= 0.45) return;
        p.twinklePhase += p.twinkleSpeed * dt;
        const twinkle = 0.6 + 0.4 * Math.sin(p.twinklePhase);
        const px = p.x + smoothMouse.x * p.depth * 0.06;
        const py = p.y + smoothMouse.y * p.depth * 0.04;

        ctx.beginPath();
        ctx.arc(px, py, p.size * 0.7, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(140, 120, 255, ${p.opacity * twinkle * 0.7})`;
        ctx.fill();
      });
      ctx.restore();

      // Sharp layer — near particles (depth >= 0.45)
      particles.forEach((p) => {
        if (p.depth < 0.45) return;
        p.twinklePhase += p.twinkleSpeed * dt;
        const twinkle = 0.7 + 0.3 * Math.sin(p.twinklePhase);

        // Parallax offset — stronger for near particles
        const px = p.x + smoothMouse.x * p.depth * 0.12;
        const py = p.y + smoothMouse.y * p.depth * 0.08;

        // Color blend: near = warm white, far = cool violet
        const r = Math.round(lerp(120, 255, p.depth));
        const g = Math.round(lerp(100, 245, p.depth));
        const b = Math.round(lerp(200, 255, p.depth));

        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * twinkle})`;
        ctx.fill();

        // Soft halo for large near particles
        if (p.size > 1.8) {
          ctx.beginPath();
          ctx.arc(px, py, p.size * 2.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${p.opacity * twinkle * 0.12})`;
          ctx.fill();
        }
      });

      // Drift particles slowly
      particles.forEach((p) => {
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        // Wrap around edges
        if (p.x < -10) p.x = w + 10;
        if (p.x > w + 10) p.x = -10;
        if (p.y < -10) p.y = h + 10;
        if (p.y > h + 10) p.y = -10;
      });
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
        opacity: 0.85,
      }}
      aria-hidden
    />
  );
}
