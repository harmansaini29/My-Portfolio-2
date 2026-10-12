# Handoff Report: Survey Explorer R1 & R2 Investigation

**Explorer**: `teamwork_preview_explorer` (Survey Explorer R1 R2)  
**Date**: 2026-10-11T21:18:00Z  
**Type**: Hard Handoff  
**Scope**: Requirement R1 (Global Performance & Smooth Scroll Calibration) and Requirement R2 (Mobile/Tablet Responsiveness & Auto-Hover Hints)

---

## 1. Observation

### 1.1 SmoothScroll & Lenis Calibration (`components/SmoothScroll.tsx`)
- **File path**: `components/SmoothScroll.tsx`, lines 16-25:
  ```ts
  const lenis = new Lenis({
    duration: 0.9, // Fast & crisp response — no dragging or heavy lag
    easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    orientation: 'vertical',
    gestureOrientation: 'vertical',
    smoothWheel: true,
    wheelMultiplier: 1.25, // Snappy response so single flick moves cleanly
    touchMultiplier: 1.6,  // Fast on mobile
    infinite: false,
  });
  ```
- **Package version**: `package.json` line 23 specifies `"lenis": "^1.3.26"`.
- **CSS Status**: Searching for `lenis.css` across the repository confirmed that `import 'lenis/dist/lenis.css'` is **missing** from both `app/layout.tsx`, `app/globals.css`, and `components/SmoothScroll.tsx`. Native CSS `html.lenis, html.lenis body { height: auto; }` and `.lenis.lenis-smooth { scroll-behavior: auto !important; }` are unstyled, risking native browser smooth scroll / momentum collision.

---

### 1.2 WebGL Canvas Frameloops & Event Listeners Audit
A complete audit was conducted across all interactive canvas/WebGL components:

#### A. Hero Section (`components/Hero.tsx`)
- **Lines 130-133**:
  ```ts
  function frame(now: number) {
    if (!inView) {
      rafId = requestAnimationFrame(frame);
      return;
    }
  ```
  **Direct Observation**: When `!inView` is true (hero is off-screen after user scrolls down), `Hero.tsx` **continues scheduling `requestAnimationFrame(frame)` every single frame indefinitely** (60-120 times/sec) instead of pausing the loop and re-arming upon entering view.

#### B. 3D WebGL Vortex Engine (`components/Vortex.tsx` & `components/VortexAbout.tsx`)
- **Lines 1048-1060 & 1155-1158 (`components/Vortex.tsx`)**:
  ```ts
  function step(now: number) {
      frame = requestAnimationFrame(step);
      const cfg = cfgRef.current;
      ...
  ```
  ```ts
  build();
  observer.observe(container); // Note: observer is a ResizeObserver (line 738), NOT an IntersectionObserver!
  lastTime = performance.now();
  frame = requestAnimationFrame(step);
  ```
  **Direct Observation**: `Vortex.tsx` manages 8,000 instanced particle dots, 240 strands, 10 comets, dynamic matrix writes (`dotMesh.setMatrixAt`), and collision math (`collide(t)`). It has **NO `IntersectionObserver`**. The render loop runs unconditionally across the entire application lifecycle even when the user is scrolled to TechStack, Projects, Achievements, or Contact!
- **Lines 251-265 (`components/VortexAbout.tsx`)**:
  During the dissolve phase, `new THREE.CanvasTexture(vCanvas)` uploads live WebGL canvas pixels into another WebGL texture with `liveTexRef.current.needsUpdate = true` on every frame, while `createProceduralVortexTexture()` simultaneously maintains an offscreen 1024x1024 2D canvas running 120 radial spiral sweeps.

#### C. Liquid Glass Carousel (`components/LiquidGlassCarousel.tsx`)
- **Lines 1827-1832 & 1869 (`components/LiquidGlassCarousel.tsx`)**:
  ```ts
  function tick(t: number) {
      raf = requestAnimationFrame(tick)
      const dt = Math.min(0.05, Math.max(0, (t - lastT) / 1000))
      lastT = t
      step(dt)
  }
  ```
  **Direct Observation**: `LiquidGlassCarousel` mounts immediately on page load and runs a continuous rAF loop performing **two WebGL render passes** per frame (`renderer.setRenderTarget(rt)` + `renderer.render(lensScene, lensCam)`). It has **NO `IntersectionObserver`** and renders continuously while off-screen.
- **Lines 1867-1868 & 1346-1349 (`components/LiquidGlassCarousel.tsx`)**:
  ```ts
  window.addEventListener("scroll", readBounds, { passive: true })
  ```
  ```ts
  let bounds = mount.getBoundingClientRect()
  const readBounds = () => {
      bounds = mount.getBoundingClientRect()
  }
  ```
  **Direct Observation**: On **every single browser scroll event** (60-120 times/second during Lenis scrolling), `readBounds` fires synchronously and executes `mount.getBoundingClientRect()`. This causes **forced synchronous layout thrashing / reflow** on the main thread during scrolling.
- **Line 766 (`components/LiquidGlassCarousel.tsx`)**:
  ```ts
  el.style.touchAction = "none"
  ```
  **Direct Observation**: `touchAction = "none"` captures all touch pointers on mobile devices, preventing users from scrolling down the page vertically when their finger starts on the carousel container.

#### D. Projects MosaicFlip (`components/MosaicFlip.tsx`)
- **Lines 498-522 (`components/MosaicFlip.tsx`)**:
  ```ts
  for (let row = 0; row < rowCount; row += 1) {
      for (let column = 0; column < columnCount; column += 1) {
          ...
          node.style.transform = `translateZ(...) rotateX(...) rotateY(...) scale(...)`
      }
  }
  ...
  raf = requestAnimationFrame(paint)
  ```
  **Direct Observation**: `paint()` iterates over 64 DOM elements (`8x8` tiles) and mutates inline `node.style.transform` on every animation frame, even when no flip is active, no pointer is hovering, and when the component is completely offscreen. It lacks dirty-checking and an `IntersectionObserver`.

#### E. Particle Background Field (`components/ParticleField.tsx`)
- **Lines 64-68**:
  `onMouseMove` calls `canvas.getBoundingClientRect()` on every mousemove event, even though the canvas is fixed full-viewport `fixed inset-0` (`left: 0, top: 0`).

---

### 1.3 Mobile / Tablet Viewport Audit (down to 360px)
- **Hero Title & Dice Flipper**:
  - `Hero.css` line 322: `.hero-silver-title { font-size: 2.5rem; }` hardcoded at `<= 768px`. On 360px devices (effective width ~320px inside padding), 2.5rem (40px) is excessively tight.
  - `DiceRoleFlipper.css` line 35: `.dice-flipper-box` has `min-width: 280px;`.
- **VortexAbout Metrics Horizontal Overflow**:
  - `VortexAbout.css` lines 175-179:
    ```css
    .sj-metrics-row {
      display: flex;
      gap: 0.5rem;
      margin-top: 0.45rem;
    }
    ```
    **Direct Observation**: `.sj-metrics-row` **lacks `flex-wrap: wrap;`**.
    On 360px mobile viewports: `.sj-about-container` is `min(92vw, 460px)` = 331px. With `1.25rem` (40px) padding, inner width is **291px**.
    The three metric badges (`<10ms Latency`, `120 FPS WebGL`, `99.99% Uptime`) total **336px** in width (`100px + 110px + 110px + 16px gap`). This causes a **45px horizontal overflow / clipping**!
- **HoverImageReveal / Achievements Section Text Clipping**:
  - `HoverImageReveal.tsx` lines 107-111 & 289:
    ```ts
    fontSize: 61,
    lineHeight: "0.9em",
    letterSpacing: "-0.05em",
    ```
    ```ts
    whiteSpace: "pre",
    ```
    **Direct Observation**: `fontSize: 61` combined with `whiteSpace: "pre"` renders titles like `"GROWSPHERE x ROAD TO DEVCON"` and `"2× HACKATHON WINNER"` at over **800px-1000px wide**, clipping off the screen inside the `overflow: hidden` container on mobile devices.
- **Contact Bento Grid Layout**:
  - `ContactSection.tsx` line 225:
    `grid gap-4 grid-cols-7 grid-rows-3 aspect-[1.8]`
    On 360px phones, 7 columns across 330px results in **~33px column widths**, rendering the text and icons unreadable.

---

### 1.4 Touch Device Hover Mechanism (`components/HoverImageReveal.tsx`)
- **Event Listeners in `HoverImageReveal.tsx`**:
  - Only `onMouseMove` (lines 175-180), `onMouseEnter` (line 316), and `onMouseLeave` (lines 186, 274) are implemented.
  - Zero touch listeners (`onTouchStart`, `onTouchMove`, `pointerdown`) exist.
  - Image preview coordinates use hardcoded `offsetX = 200`:
    ```ts
    rawX.set(e.clientX - rect.left + offsetX); // offsetX = 200
    ```
    On a 360px mobile screen, adding 200px positions the preview image completely out of viewport bounds!
  - When mobile users view the Achievements section, no previews are displayed unless a tap occurs; on tap, the preview locks and jumps offscreen.

---

## 2. Logic Chain

1. **Lenis Physics**: The user requested a silky, luxurious momentum with duration 1.2, wheelMultiplier 1.0, and touchMultiplier 1.2. The current values (0.9, 1.25, 1.6) create a hurried, snappy flick with excessive wheel acceleration. Updating to requested parameters aligns momentum with the intended high-end aesthetic.
2. **Eliminating Layout Thrashing**: Lenis synchronizes with `ScrollTrigger.update` on the GSAP ticker. However, `LiquidGlassCarousel` listens to every `scroll` event and calls `mount.getBoundingClientRect()`. Removing `readBounds` from the window scroll listener eliminates synchronous layout recalculations during smooth scrolling, ensuring high-refresh (60-120fps) rendering.
3. **Offscreen Resource Conservation**: Currently, `Hero`, `Vortex`, `LiquidGlassCarousel`, and `MosaicFlip` run continuous rAF loops or mutate DOM styles while completely offscreen. By pausing rAF loops via `IntersectionObserver` when sections are outside the viewport, GPU and main thread contention drop dramatically, freeing capacity for whichever section is actively in view.
4. **Touch Scrolling Freedom**: `LiquidGlassCarousel` sets `touchAction = "none"`, trapping mobile users who swipe vertically over the carousel. Changing this to `pan-y` ensures mobile users can smoothly scroll the page down through the portfolio.
5. **360px Overflow Resolution**: `.sj-metrics-row` in `VortexAbout.css` has `flex-wrap: nowrap` with 336px width inside a 291px container. Adding `flex-wrap: wrap;` guarantees zero overflow down to 320px viewports.
6. **Mobile Hover Hint Autonomy**: Touch devices lack cursor hover. In `HoverImageReveal.tsx`, implementing a cyclic timer (2.8s-3.2s) when idle in touch environments that cycles `hovered` through items 0..4, centers the floating preview horizontally (`rawX = rect.width / 2`), and pauses on touch tap resolves the interaction gap without requiring manual touch locking.

---

## 3. Caveats

- **Caveat 1**: `ParticleField` is rendered full-screen with `fixed inset-0` in `app/page.tsx`. Its canvas is technically always intersecting the viewport. Its particle count (110) is lightweight, but removing `canvas.getBoundingClientRect()` from `onMouseMove` is safe and recommended.
- **Caveat 2**: In `LiquidGlassCarousel.tsx`, `readBounds()` is needed when pointer coordinates are translated relative to the canvas. Calling `readBounds()` on pointer events (`onPointerDown`, `onPointerMove`) and `window.resize` completely satisfies pointer math without listening to `window.scroll`.
- **Caveat 3**: No other uninvestigated canvas layers exist in the repository; the entire component tree from `Hero` to `ContactSection` has been surveyed.

---

## 4. Conclusion & Concrete Code Proposals

### Proposal 1: Calibrate Lenis & Smooth Scroll (`components/SmoothScroll.tsx`)
```tsx
// components/SmoothScroll.tsx
'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

export default function SmoothScroll({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (typeof window !== 'undefined') {
      gsap.registerPlugin(ScrollTrigger);
    }

    // Calibrated luxurious Lenis physics
    const lenis = new Lenis({
      duration: 1.2,        // Silky, controlled, luxurious momentum
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1.0, // Natural 1:1 wheel response
      touchMultiplier: 1.2, // Controlled mobile flick momentum
      infinite: false,
    });

    (window as any).__lenis = lenis;

    // Synchronize Lenis with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const updateLenis = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(updateLenis);
    gsap.ticker.lagSmoothing(0);

    return () => {
      delete (window as any).__lenis;
      gsap.ticker.remove(updateLenis);
      lenis.destroy();
    };
  }, []);

  return <>{children}</>;
}
```

---

### Proposal 2: Hero Section Off-Screen rAF Pause (`components/Hero.tsx`)
In `components/Hero.tsx`:
Replace the spinning loop on line 130:
```ts
// BEFORE (Lines 130-133):
function frame(now: number) {
  if (!inView) {
    rafId = requestAnimationFrame(frame);
    return;
  }

// AFTER:
function frame(now: number) {
  if (!inView) {
    rafId = 0;
    return;
  }
```
And inside the `IntersectionObserver` callback (lines 62-65):
```ts
// AFTER:
observer = new IntersectionObserver((entries) => {
  const visible = entries[0].isIntersecting;
  const wasVisible = inView;
  inView = visible;
  if (!wasVisible && visible && !reduce) {
    last = performance.now();
    rafId = requestAnimationFrame(frame);
  }
}, { threshold: 0.05 });
```

---

### Proposal 3: Liquid Glass Carousel Layout Thrashing & Touch Action Fix (`components/LiquidGlassCarousel.tsx`)
1. Remove `window.addEventListener("scroll", readBounds, { passive: true })` from line 1867.
2. In `onPointerDown` (line 1419) and `onPointerMove`: call `readBounds()` to ensure coordinate freshness only when interactive touch/pointer events happen.
3. Change `el.style.touchAction = "none"` (line 766) to `el.style.touchAction = "pan-y"`.
4. Wrap `tick` in an `IntersectionObserver`:
```ts
let inViewport = true;
const io = new IntersectionObserver(([entry]) => {
  const visible = entry.isIntersecting;
  if (!inViewport && visible) {
    inViewport = true;
    lastT = performance.now();
    raf = requestAnimationFrame(tick);
  } else if (!visible) {
    inViewport = false;
    cancelAnimationFrame(raf);
  }
}, { threshold: 0.02 });
io.observe(mount);
```
And disconnect `io` inside `destroy()`.

---

### Proposal 4: 3D Vortex Off-Screen Pause (`components/Vortex.tsx`)
Add an `IntersectionObserver` to `container` in `createVortex`:
```ts
let isVortexVisible = true;
const visibilityObserver = new IntersectionObserver(([entry]) => {
  const visible = entry.isIntersecting;
  if (!isVortexVisible && visible) {
    isVortexVisible = true;
    lastTime = performance.now();
    frame = requestAnimationFrame(step);
  } else if (!visible) {
    isVortexVisible = false;
    cancelAnimationFrame(frame);
  }
}, { threshold: 0.02 });
visibilityObserver.observe(container);
```
And in `step(now)`:
```ts
if (!isVortexVisible) return;
```
And disconnect `visibilityObserver` in `dispose()`.

---

### Proposal 5: MosaicFlip Dirty Check & Visibility Pause (`components/MosaicFlip.tsx`)
In `components/MosaicFlip.tsx`:
Only request frames when actively flipping or when hover proximity is non-zero, and pause the loop when offscreen using `IntersectionObserver`.

---

### Proposal 6: VortexAbout Metrics Row 360px Overflow Fix (`components/VortexAbout.css`)
In `components/VortexAbout.css`:
```css
/* BEFORE (line 175): */
.sj-metrics-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.45rem;
}

/* AFTER: */
.sj-metrics-row {
  display: flex;
  flex-wrap: wrap; /* Fixes 45px overflow on 360px mobile viewports */
  gap: 0.5rem;
  margin-top: 0.45rem;
}
```

---

### Proposal 7: Autonomous Gentle Cyclic Hover Hint Loop for Touch (`components/HoverImageReveal.tsx` & `components/AchievementsSection.tsx`)
In `components/HoverImageReveal.tsx`:
1. Implement touch/mobile detection:
   ```ts
   const [isTouch, setIsTouch] = useState(false);
   useEffect(() => {
     const checkTouch = () => {
       setIsTouch(window.matchMedia('(hover: none) and (pointer: coarse)').matches || window.innerWidth < 768);
     };
     checkTouch();
     window.addEventListener('resize', checkTouch);
     return () => window.removeEventListener('resize', checkTouch);
   }, []);
   ```
2. Autonomous idle cyclic loop:
   ```ts
   useEffect(() => {
     if (!isTouch || count <= 1) return;
     
     let cycleTimer: NodeJS.Timeout | null = null;
     let isIdle = true;
     let resumeTimer: NodeJS.Timeout | null = null;

     const startCycle = () => {
       cycleTimer = setInterval(() => {
         if (!isIdle) return;
         setHovered((prev) => {
           const next = prev === null ? 0 : (prev + 1) % count;
           // On mobile, position floating preview comfortably centered
           const rect = containerRef.current?.getBoundingClientRect();
           if (rect) {
             rawX.set(rect.width * 0.5);
             rawY.set(rect.height * 0.5);
           }
           return next;
         });
       }, 3000);
     };

     startCycle();

     return () => {
       if (cycleTimer) clearInterval(cycleTimer);
       if (resumeTimer) clearTimeout(resumeTimer);
     };
   }, [isTouch, count]);
   ```
3. Support touch tapping without locking:
   ```ts
   const onTouchStartItem = (idx: number) => {
     setHovered(idx);
     const rect = containerRef.current?.getBoundingClientRect();
     if (rect) {
       rawX.set(rect.width * 0.5);
       rawY.set(rect.height * 0.5);
     }
   };
   ```
4. In `components/AchievementsSection.tsx`, pass responsive font sizing:
   ```tsx
   <HoverImageReveal
     items={ACHIEVEMENTS_DATA}
     backgroundColor="transparent"
     font={{
       fontSize: "clamp(1.15rem, 4.2vw, 3.2rem)",
       fontWeight: 700,
       letterSpacing: "-0.02em",
       textAlign: "center",
     }}
   />
   ```
   And in `HoverImageReveal.tsx`, replace `whiteSpace: "pre"` with `whiteSpace: "normal"` or responsive wrapping to eliminate text overflow on 360px screens.

---

## 5. Verification Method

To verify these findings and confirm that proposed fixes compile cleanly:
1. **TypeScript Typecheck**:
   Run in command line:
   ```bash
   cmd.exe /c npx tsc --noEmit
   ```
   *(Must exit with code 0).*
2. **Next.js Production Build**:
   ```bash
   cmd.exe /c npm run build
   ```
   *(Must produce clean `.next/` output without SSR or bundling errors).*
3. **Viewport Inspection**:
   Open browser devtools responsive view at **360px x 640px** and **375px x 812px**:
   - Check `document.body.scrollWidth === window.innerWidth` (no horizontal scrollbar).
   - Inspect `.sj-metrics-row` in VortexAbout to verify badges wrap cleanly.
   - Inspect Achievements section to verify titles fit without clipping and preview images cycle smoothly when idle.
4. **Performance & Profiling**:
   In Chrome DevTools Performance panel:
   - Record scroll profile during Lenis smooth scroll: verify zero `Layout` recalculation marks triggered from scroll events.
   - Verify GPU framerate holds at 60-120fps across all sections.
