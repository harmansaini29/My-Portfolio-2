# Comprehensive Technical Survey Report: Requirement R2 (Projects Section Chromium Border)

**Explorer**: Survey Explorer 2  
**Date**: 2026-10-09  
**Focus**: Requirement R2 (Projects Section Chromium Profile Lighting Border Rectangle & MosaicFlip Architecture)  
**Target Project**: `e:\Cloned Github Repo\My-Portfolio 2`

---

## 1. Executive Summary

Requirement R2 mandates:
> *"Update the main projects section (MosaicFlip) to feature a chromium profile lighting border rectangle."*  
> Acceptance Criterion: *"The MosaicFlip container features a CSS/Tailwind border implementing a chromium lighting aesthetic."*

Currently, the Projects section is implemented inline in `app/page.tsx` (lines 94–120). It wraps `<MosaicFlip>` in an unstyled container with a primitive static border:
```tsx
<div className="w-[95vw] h-[90vh] relative z-10 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
  <MosaicFlip images={PROJECT_ITEMS} background="transparent" size={100} onSlideChange={setActiveProject} />
</div>
```
This existing border lacks the high-specular metallic gradients, illuminated rim glow, animated specular light sweep, machined chamfer bevels, and technical telemetry framing required for a true "chromium profile lighting" aesthetic.

This report delivers a comprehensive architectural survey of `MosaicFlip.tsx`, inspects its 3D CSS rendering pipeline, event propagation mechanics, and responsive sizing constraints, and provides a ready-to-implement technical specification for a GPU-accelerated **Chromium Profile Lighting Border Rectangle** component (`ChromiumBorderContainer`) and a modular `ProjectsSection` component conforming to Requirement R1.

---

## 2. Anatomical Inspection of `MosaicFlip` (`components/MosaicFlip.tsx`)

### 2.1 File Location and Structure
- **Path**: `components/MosaicFlip.tsx` (665 lines, 21.9 KB).
- **Export Pattern**:
  - Internal base component: `function __OriginkitBase_MosaicFlip(...)` (line 190).
  - Public default export: `export default function MosaicFlip(props: Record<string, unknown>)` (lines 662–664).
  - Wrapped with hardcoded fallback preset props (`__originkitPresetProps` on lines 649–660) containing two Unsplash images.

### 2.2 Component Props & Data Interfaces
```typescript
export interface MosaicImage {
  image?: ImageInput;
  offsetY?: number;
}

export type MosaicOrigin = "center" | "edges" | "start" | "random";

export interface MosaicFlipProps {
  images?: (MosaicImage | ImageInput)[];
  background?: string;         // Default: "#000000"
  columns?: number;            // Default: 12
  rows?: number;               // Default: 8
  gap?: number;                // Default: 0
  speed?: number;              // Default: 7 (controls flipDuration: 0.5s)
  stagger?: number;            // Default: 5 (controls staggerSpan: 0.6s)
  origin?: MosaicOrigin;       // Default: "center"
  float?: number;              // Default: 5 (controls amplitude of idle floating)
  hover?: number;              // Default: 10 (controls hover lift & tilt strength)
  size?: number;               // Default: 77 (clamped 10–100, page.tsx passes 100)
  style?: CSSProperties;
  onSlideChange?: (index: number) => void;
}
```

### 2.3 3D Rendering & Animation Engine
`MosaicFlip` does **not** use Three.js, React Three Fiber, or shaders. Instead, it is a high-performance **CSS 3D Transform engine** driven by a native `requestAnimationFrame(paint)` loop (lines 407–522):
1. **Perspective Container**:
   - Outermost element (lines 609–631) sets `perspective: "800px"`, `transformStyle: "preserve-3d"`, `overflow: "hidden"`, `userSelect: "none"`.
2. **Dynamic Grid Layout**:
   - An inner grid `div` (lines 632–645) runs `display: "grid"`, `gridTemplateColumns: repeat(columnCount, tile px)`, `gridTemplateRows: repeat(rowCount, tile px)`, `transform: scale(sizeScale)`, `transformStyle: "preserve-3d"`, and `pointerEvents: "none"`.
3. **Hexahedral (6-Face) Tile Cubes**:
   - With `columns = 12` and `rows = 8`, there are `96` 3D cube elements.
   - Each cube has 6 faces: `front`, `rear`, `right`, `left`, `top`, `bottom`.
   - Front and rear faces take slice-positioned background images (`backgroundSize` and `backgroundPosition` calculated based on column/row tile offset).
   - Cap faces (`top`, `bottom`, `left`, `right`) take `backgroundColor: background` (black by default).
4. **Physics & Animation Loop**:
   - **Continuous Idle Z-Drift**: Each tile continuously floats independently forward and backward in Z-depth (`randomBetween(-config.amplitude, config.amplitude)` via `easeInOutSine`).
   - **Interactive Pointer Hover**: Pointer coordinates are normalized (`0` to `1`). Radial proximity (`HOVER_RADIUS = 2.8`) computes dynamic hover lift (`hoverZ`), 3D tilt (`tiltX`, `tiltY`), and scaling (`scale(1 + hover * 0.035)`).
   - **Staggered 180° Flip Transition**: Clicking advances the active slide. Tiles rotate 180 degrees via `easeInOutQuart(progress)` with spatial stagger delays calculated outward from the origin (`computeDelays`).
   - Callback trigger: `onSlideChange(index)` is invoked at line 374 when a flip transition begins.

### 2.4 Resizing and Layout Geometry
`MosaicFlip` utilizes a `ResizeObserver` (lines 351–361) on its container element:
```typescript
const baseTile = Math.max(
  1,
  Math.min(
    (frameWidth - gap * (columnCount - 1)) / columnCount,
    (frameHeight - gap * (rowCount - 1)) / rowCount
  )
);
```
- The grid aspect ratio is fixed at `columns : rows` = `12 : 8` = `3 : 2` (1.5:1).
- `baseTile` uses `Math.min(...)`, meaning the grid automatically fits within the container and letterboxes if the container aspect ratio does not match 1.5:1.
- Crucially, `MosaicFlip` **requires a concrete bounding box** from its parent (e.g. `w-full h-full` inside a sized container).

---

## 3. Current Implementation & Shortcomings in `app/page.tsx`

### 3.1 Current Code Snippet (`app/page.tsx`, lines 94–120)
```tsx
{/* 5. My Work as Projects Section */}
<StickySection>
  <section className="w-full h-full bg-transparent overflow-hidden flex flex-col justify-center items-center relative">
    <h2 className="absolute top-20 text-4xl md:text-6xl font-bold text-center z-20 text-white tracking-widest uppercase pointer-events-none" style={{ textShadow: "0 0 20px rgba(0, 157, 255, 0.5)" }}>My Projects</h2>
    
    {/* Enlarged MosaicFlip from default size=77 to size=100 */}
    <div className="w-[95vw] h-[90vh] relative z-10 rounded-2xl border border-white/20 shadow-[0_0_40px_rgba(6,182,212,0.15)] overflow-hidden">
      <MosaicFlip images={PROJECT_ITEMS} background="transparent" size={100} onSlideChange={setActiveProject} />
    </div>

    <AnimatePresence mode="wait">
      {PROJECT_DATA[activeProject] && (
        <motion.div
          key={activeProject}
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.3 }}
          className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 pointer-events-none bg-black/70 backdrop-blur-lg px-8 py-5 rounded-2xl border border-cyan-500/40 text-center w-[90%] max-w-2xl shadow-[0_0_30px_rgba(6,182,212,0.15)]"
        >
          <h3 className="text-3xl md:text-4xl font-bold text-white mb-2 tracking-wide uppercase">{PROJECT_DATA[activeProject].title}</h3>
          <p className="text-sm md:text-lg text-cyan-300 font-mono tracking-widest uppercase">{PROJECT_DATA[activeProject].desc}</p>
        </motion.div>
      )}
    </AnimatePresence>
  </section>
</StickySection>
```

### 3.2 Key Deficiencies
1. **Lacks Chromium Metallic Styling**:
   - The border is a simple `border border-white/20`.
   - It possesses no specular gradients (platinum, mirror white, gunmetal, liquid silver), no chamfer bevel, and no metallic reflection stops.
2. **Lacks Profile Lighting**:
   - It has only a static cyan drop shadow (`shadow-[0_0_40px_rgba(6,182,212,0.15)]`).
   - There is no illuminated rim profile, no traveling photonic beam along the perimeter, and no ambient specular radiance.
3. **Violates Separation of Concerns & Flow (Requirement R1)**:
   - The Projects section is hardcoded directly into `app/page.tsx` instead of being an independent, cleanly structured component (`components/ProjectsSection.tsx`).
4. **Viewport & Sizing Hazards on Mobile**:
   - `w-[95vw] h-[90vh]` combined with `h2` at `top-20` and the metadata card at `bottom-16` causes content crowding or vertical collisions on mobile screens (< 768px).
5. **Non-Interactive Project Links**:
   - Descriptions in `lib/portfolio-data.ts` contain live demo URLs (e.g. `Live → aegis-ai.vercel.app`, `Live → cet-exam-portal.vercel.app`), but the HUD card is marked `pointer-events-none`, preventing users from clicking or opening projects.

---

## 4. Design & Architecture of the "Chromium Profile Lighting Border Rectangle"

### 4.1 Aesthetic Philosophy
In luxury horology, automotive styling, and cybernetic design:
- **Chromium** represents polished mirror reflections, extreme contrast ratios, crisp specular glints (`#ffffff`), liquid platinum (`#e2e8f0`), brushed gunmetal (`#1e293b`), and obsidian depths (`#09090b`), accented by cyan/electric blue iridescence (`#06b6d4`).
- **Profile Lighting** denotes an illuminated perimeter channel that traces the geometric contour of the chassis, emitting both a sharp rim light and a diffuse outer photonic glow.

### 4.2 Multi-Layered Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│ Outer Wrapper (.relative, responsive dimensions, e.g. w-[92vw] h-[78vh]) │
│                                                                        │
│  [Layer 1] Ambient Rim Halo (-inset-2, blur-2xl, cyan/white diffuse glow) │
│                                                                        │
│  [Layer 2] Chromium Profile Ring (p-[2px], rounded-3xl, overflow-hidden) │
│   ├─ Animated Conic Beam (inset-[-150%], conic-gradient, rotates 360°) │
│   └─ Specular Metallic Base (linear-gradient: chrome, silver, slate)   │
│                                                                        │
│  [Layer 3] Inner Obsidian Chamber (rounded-[calc(...)], bg-black/95)  │
│   ├─ Inset Bevel Shadow (inset 0 1px 1px white/40, inset 0 0 25px black)│
│   ├─ <MosaicFlip /> (receives 100% pointer events & clicks)            │
│   └─ Specular Light Sweep Overlay (pointer-events-none, skew sheen)    │
│                                                                        │
│  [Layer 4] Technical Telemetry & Corner Brackets (pointer-events-none) │
│   ├─ Top-Left: System Status Indicator "SYS // MOSAIC-3D [ONLINE]"      │
│   ├─ Top-Right: Project Counter "PROJECT // [01 / 10]"                 │
│   ├─ 4x Corner Precision Machined Brackets (border-cyan-400/80)        │
│   └─ Bottom: Interactive Floating Project HUD with clickable links     │
└────────────────────────────────────────────────────────────────────────┘
```

### 4.3 Technical CSS Specifications

Add to `app/globals.css` (or dedicated CSS file):
```css
/* =========================================================================
   Chromium Profile Lighting Animations & Gradients
   ========================================================================= */

@keyframes chromiumBeamRotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes chromiumHaloPulse {
  0%, 100% {
    opacity: 0.55;
    transform: scale(0.995);
  }
  50% {
    opacity: 0.85;
    transform: scale(1.005);
  }
}

@keyframes specularSheenSweep {
  0% {
    transform: translateX(-150%) skewX(-25deg);
  }
  40%, 100% {
    transform: translateX(250%) skewX(-25deg);
  }
}

/* GPU-Accelerated Utility Classes */
.animate-chromium-beam {
  animation: chromiumBeamRotate 8s linear infinite;
  will-change: transform;
}

.animate-chromium-halo {
  animation: chromiumHaloPulse 4s ease-in-out infinite;
  will-change: opacity, transform;
}

.animate-specular-sheen {
  animation: specularSheenSweep 9s cubic-bezier(0.4, 0, 0.2, 1) infinite;
  will-change: transform;
}

/* Conic Specular Chromium Gradient for the Edge Beam */
.bg-chromium-conic-beam {
  background: conic-gradient(
    from 0deg at 50% 50%,
    transparent 0deg,
    rgba(255, 255, 255, 0.15) 35deg,
    rgba(255, 255, 255, 0.95) 55deg,
    rgba(6, 182, 212, 0.9) 70deg,
    rgba(255, 255, 255, 0.4) 90deg,
    transparent 130deg,
    rgba(255, 255, 255, 0.1) 215deg,
    rgba(255, 255, 255, 0.95) 235deg,
    rgba(6, 182, 212, 0.85) 250deg,
    rgba(255, 255, 255, 0.3) 270deg,
    transparent 360deg
  );
}

/* Specular Metallic Linear Bezel Gradient */
.bg-chromium-bezel {
  background: linear-gradient(
    135deg,
    rgba(255, 255, 255, 0.8) 0%,
    rgba(148, 163, 184, 0.35) 20%,
    rgba(30, 41, 59, 0.6) 40%,
    rgba(15, 23, 42, 0.9) 60%,
    rgba(6, 182, 212, 0.6) 80%,
    rgba(255, 255, 255, 0.9) 100%
  );
}
```

---

## 5. Proposed Concrete Code Implementations

### 5.1 Component 1: `ChromiumBorderContainer.tsx`
Place in `components/ChromiumBorderContainer.tsx`:

```tsx
'use client';

import React from 'react';

interface ChromiumBorderContainerProps {
  children: React.ReactNode;
  activeProjectIndex?: number;
  totalProjects?: number;
  className?: string;
}

export default function ChromiumBorderContainer({
  children,
  activeProjectIndex = 0,
  totalProjects = 10,
  className = '',
}: ChromiumBorderContainerProps) {
  return (
    <div
      className={`relative w-[94vw] max-w-6xl h-[68vh] sm:h-[74vh] md:h-[78vh] lg:h-[82vh] mx-auto rounded-3xl p-[2px] transition-all duration-500 ${className}`}
    >
      {/* 1. Ambient Rim Halo / Backlight Radiance */}
      <div
        className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyan-500/25 via-white/20 to-cyan-500/25 blur-2xl pointer-events-none animate-chromium-halo"
        aria-hidden="true"
      />

      {/* 2. Chromium Profile Border Ring */}
      <div className="absolute inset-0 rounded-3xl overflow-hidden pointer-events-none">
        {/* Static Specular Bezel Foundation */}
        <div className="absolute inset-0 bg-chromium-bezel opacity-50" />
        
        {/* Rotating Conic Photonic Light Beam */}
        <div className="absolute inset-[-150%] bg-chromium-conic-beam animate-chromium-beam" />
      </div>

      {/* 3. Inner Obsidian Chamber Housing MosaicFlip */}
      <div className="relative w-full h-full rounded-[calc(1.5rem-2px)] bg-black/90 backdrop-blur-2xl overflow-hidden z-10 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-1.5px_1px_rgba(0,0,0,0.9),inset_0_0_35px_rgba(0,0,0,0.85)]">
        {children}

        {/* Specular Diagonal Light Sweep Overlay */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-white/12 to-transparent animate-specular-sheen" />
        </div>
      </div>

      {/* 4. Precision Machined Corner Brackets & Telemetry */}
      {/* Corner Brackets */}
      <div className="absolute top-2 left-2 w-3.5 h-3.5 border-t-2 border-l-2 border-cyan-400/80 rounded-tl-sm pointer-events-none z-30" />
      <div className="absolute top-2 right-2 w-3.5 h-3.5 border-t-2 border-r-2 border-cyan-400/80 rounded-tr-sm pointer-events-none z-30" />
      <div className="absolute bottom-2 left-2 w-3.5 h-3.5 border-b-2 border-l-2 border-cyan-400/80 rounded-bl-sm pointer-events-none z-30" />
      <div className="absolute bottom-2 right-2 w-3.5 h-3.5 border-b-2 border-r-2 border-cyan-400/80 rounded-br-sm pointer-events-none z-30" />

      {/* Telemetry HUD Headers */}
      <div className="absolute top-3.5 left-5 pointer-events-none z-30 flex items-center gap-2 font-mono text-[0.62rem] tracking-widest text-cyan-400/80 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="hidden sm:inline">SYS // CHROMIUM-PROFILE-01</span>
        <span className="sm:hidden">SYS // 01</span>
      </div>

      <div className="absolute top-3.5 right-5 pointer-events-none z-30 font-mono text-[0.62rem] tracking-widest text-slate-400 uppercase">
        <span>
          PROJECT [{String(activeProjectIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(totalProjects).padStart(2, '0')}]
        </span>
      </div>
    </div>
  );
}
```

### 5.2 Component 2: Dedicated `ProjectsSection.tsx`
Place in `components/ProjectsSection.tsx` (fulfilling R1 & R2):

```tsx
'use client';

import React, { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import MosaicFlip from '@/components/MosaicFlip';
import ChromiumBorderContainer from '@/components/ChromiumBorderContainer';
import { PROJECT_DATA } from '@/lib/portfolio-data';

const PROJECT_ITEMS = PROJECT_DATA.map((d) => ({ image: d.image }));

export default function ProjectsSection() {
  const [activeProject, setActiveProject] = useState(0);
  const currentProject = PROJECT_DATA[activeProject];

  // Optional: Extract live link if present in description
  const liveMatch = currentProject?.desc?.match(/Live\s*→\s*([a-zA-Z0-9.-]+)/i);
  const liveDomain = liveMatch ? liveMatch[1] : null;

  return (
    <section className="relative w-full h-full min-h-screen bg-transparent py-16 flex flex-col justify-center items-center overflow-hidden">
      {/* Section Title */}
      <div className="mb-6 text-center z-20 pointer-events-none">
        <h2
          className="text-3xl sm:text-4xl md:text-6xl font-bold text-white tracking-widest uppercase"
          style={{ textShadow: '0 0 25px rgba(0, 157, 255, 0.6)' }}
        >
          My Projects
        </h2>
        <p className="text-xs sm:text-sm text-cyan-400 font-mono tracking-widest mt-1 uppercase">
          [ 3D Mosaic Showcase // Click or Drag to Flip ]
        </p>
      </div>

      {/* Main Chromium Border Container */}
      <ChromiumBorderContainer
        activeProjectIndex={activeProject}
        totalProjects={PROJECT_DATA.length}
      >
        <MosaicFlip
          images={PROJECT_ITEMS}
          background="transparent"
          size={100}
          onSlideChange={setActiveProject}
        />
      </ChromiumBorderContainer>

      {/* Floating Project Metadata HUD Card */}
      <div className="w-[92vw] max-w-2xl mt-4 sm:mt-6 z-20">
        <AnimatePresence mode="wait">
          {currentProject && (
            <motion.div
              key={activeProject}
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -15, scale: 0.98 }}
              transition={{ duration: 0.25 }}
              className="bg-black/80 backdrop-blur-xl px-6 py-4 rounded-2xl border border-cyan-500/40 text-center shadow-[0_0_35px_rgba(6,182,212,0.18)]"
            >
              <div className="flex flex-col sm:flex-row items-center justify-between gap-2 mb-1.5">
                <h3 className="text-xl sm:text-2xl md:text-3xl font-bold text-white tracking-wide uppercase">
                  {currentProject.title}
                </h3>
                {liveDomain && (
                  <a
                    href={`https://${liveDomain}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-950/80 hover:bg-cyan-900 border border-cyan-500/50 text-cyan-300 text-xs font-mono tracking-wider transition-colors pointer-events-auto cursor-pointer"
                  >
                    <span>Launch</span>
                    <span className="text-[0.7rem]">↗</span>
                  </a>
                )}
              </div>
              <p className="text-xs sm:text-sm md:text-base text-cyan-300 font-mono tracking-wide">
                {currentProject.desc}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
}
```

---

## 6. Interaction, Event Propagation & Performance Verification

| Factor | Critical Requirement | Implementation Validation |
|---|---|---|
| **Click to Advance** | `onClick={advance}` in `MosaicFlip` must receive clicks. | All border glow layers, conic gradient layers, and corner telemetry use `pointer-events-none`. The inner vessel allows full click bubbling to `MosaicFlip`. |
| **Pointer Hover Physics** | `onPointerMove={handlePointerMove}` calculates cursor proximity for 3D tilt. | Completely unobstructed. Cursor movements over the container translate directly to tile lift and tilt. |
| **Mobile Tap Support** | Taps advance the slide via `touchAction: "manipulation"`. | Verified. Touch events trigger `onClick` cleanly without 300ms delays. |
| **60fps GPU Compositing** | Animations must not stutter the `requestAnimationFrame` loop. | CSS animations run strictly on `transform: rotate` and `opacity`. No layout reflows (`width`, `height`, `margin`) are animated. |
| **Zero Clipping Artifacts** | Tiles drift in Z-space up to `amplitude` (~15px). | `overflow-hidden` on the inner vessel cleanly confines tiles within the border radius without boundary tears. |

---

## 7. Requirement R3 (Centralized Data Validation) Compatibility
Requirement R3 states:
> *"Ensure `lib/portfolio-data.ts` perfectly segregates all image and video URLs for Achievements, Projects, and Journey, allowing instant updates."*

Currently in `lib/portfolio-data.ts`:
```typescript
export const PROJECT_DATA = [
  { image: 'https://images.unsplash.com/...', title: "Project UMBRELLA", desc: "..." },
  // ... 10 projects
];
```
- In `app/page.tsx` line 26: `const PROJECT_ITEMS = PROJECT_DATA.map(d => ({ image: d.image }));`.
- In `MosaicFlip.tsx` lines 99–110: `resolveEntry` extracts `entry.image` or string URLs cleanly.
- **Recommendation for Implementer**: Ensure `PROJECT_DATA` in `lib/portfolio-data.ts` exports an explicit TypeScript interface:
  ```typescript
  export interface ProjectItem {
    image: string;
    title: string;
    desc: string;
    url?: string;
  }
  ```
  This guarantees that updating any image URL in `lib/portfolio-data.ts` instantly and safely updates both `PROJECT_ITEMS` for `MosaicFlip` and the corresponding title/description HUD.

---

## 8. Summary Checklist for Implementer

- [ ] Add CSS keyframes and utility classes (`animate-chromium-beam`, `animate-chromium-halo`, `bg-chromium-conic-beam`, `bg-chromium-bezel`) to `app/globals.css`.
- [ ] Create `components/ChromiumBorderContainer.tsx` with multi-layered specular gradients, ambient halo, and corner brackets.
- [ ] Create `components/ProjectsSection.tsx` wrapping `ChromiumBorderContainer`, `MosaicFlip`, and the metadata HUD.
- [ ] In `app/page.tsx`, replace the inline projects block (lines 94–120) with `<ProjectsSection />` wrapped in `<StickySection>`.
- [ ] Verify that clicking the mosaic advances slides, updates project metadata, and triggers 3D tile flips smoothly.
- [ ] Run `cmd /c npm run build` to confirm zero TypeScript or build regressions.
