# Survey Analysis & Recommendations Report (Requirement R1)

**Target**: Refactor portfolio folder structure, optimize code, delete unused garbage files, align sections with requested flow.  
**Surveyed by**: Survey Explorer 1  
**Project Root**: `e:\Cloned Github Repo\My-Portfolio 2`  
**Date**: 2026-10-09  

---

## 1. Executive Summary

This investigation analyzed the repository architecture, component hierarchy, page routing, styling, scripts, and dependencies against Requirement R1:
> *"Rename and organize the components to strictly match the requested flow: Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us. Delete any duplicate or unused components, CSS files, or dependencies."*

Key survey findings:
1. **Component Naming & Architecture Mismatch**: Currently, the "Vortex About" section is misnamed as `ScrollJourney.tsx`, while the actual "Journey" section (`LiquidGlassCarousel`) is inlined directly inside `app/page.tsx` within an overlapping grid with `ScrollJourney`. Similarly, "Projects" (`MosaicFlip`) and "Achievements" (`HoverImageReveal`) are inlined in `app/page.tsx` rather than structured as distinct section components.
2. **Dead / Unused Components Identified**:
   - `components/ScrollDissolveReveal.tsx` (353 lines): Completely dead; an earlier prototype of the Sobel edge dissolve shader that was later merged directly into `ScrollJourney.tsx`.
   - `components/ui/cylinder-carousel.tsx` (205 lines): Completely dead; unused 3D cylinder carousel.
   - `components/StaggeredGrid.tsx` (5 lines) & `components/ui/staggered-grid.tsx` (330 lines): Redundant/duplicate; `components/ContactSection.tsx` duplicated the entire implementation inline.
3. **Dead Root & Garbage Files**:
   - `patch.py` (1,633 lines, 49.9 KB): Scratch patch script left in project root.
   - `public/assets`: Empty directory.
4. **Dead Imports & Unused CSS**:
   - `components/Hero.tsx` imports `ParticleField` dynamically on line 8, but never renders it (it is rendered globally in `app/page.tsx`).
   - `app/globals.css` contains 45+ lines of dead CSS and keyframes (`.road-moving-dashes`, `@keyframes roadDashMove`, `.road-photon-stream`, `@keyframes roadPhotonMove`, `@keyframes cylinderRotate`, `@keyframes ry`, `.venom-mercury-side-left`, `.venom-mercury-side-right`).
5. **Unused Dependencies in `package.json`**:
   - `@base-ui/react`: 0 references in codebase.
   - `class-variance-authority`: 0 references in codebase.
   - `lucide-react`: Only imported by the unused `components/ui/cylinder-carousel.tsx`.
   - `@types/imagesloaded`: Misplaced in `dependencies` instead of `devDependencies`.
   - Script `"lint": "next lint"`: Broken under Next.js 16.3.6 (`next lint` is no longer a valid CLI command in Next 16; running it interprets `lint` as a directory path).

---

## 2. Codebase Structure & Component Tree Mapping

### Current Directory Structure
```
e:\Cloned Github Repo\My-Portfolio 2/
├── app/
│   ├── globals.css           (Tailwind v4 theme tokens, scrollbar, dead keyframes)
│   ├── layout.tsx            (Geist & Plus_Jakarta_Sans fonts, SmoothScroll wrapper)
│   └── page.tsx              (Monolithic composition of sections and inlined carousels)
├── components/
│   ├── ContactSection.tsx    (333 lines - Inlined StaggeredGrid contact section)
│   ├── DiceRoleFlipper.css   (3D dice flip ticker styles)
│   ├── DiceRoleFlipper.tsx   (101 lines - Roles flipper inside Hero)
│   ├── Hero.css              (Liquid reveal hero styles)
│   ├── Hero.tsx              (354 lines - Hero with swap button, dead ParticleField import)
│   ├── HoverImageReveal.tsx  (402 lines - Achievements hover reveal)
│   ├── LiquidGlassCarousel.tsx (1974 lines - Refraction glass carousel for Journey)
│   ├── MosaicFlip.tsx        (665 lines - 3D mosaic flip for Projects)
│   ├── ParticleField.tsx     (157 lines - Ambient 2D canvas particle field)
│   ├── ScrollDissolveReveal.tsx (353 lines - UNUSED DEAD COMPONENT)
│   ├── ScrollJourney.css     (Vortex track and dissolve HUD styles)
│   ├── ScrollJourney.tsx     (641 lines - Vortex + About text + Sobel Edge Dissolve)
│   ├── SmoothScroll.tsx      (48 lines - Lenis + GSAP ScrollTrigger ticker integration)
│   ├── StaggeredGrid.tsx     (5 lines - UNUSED wrapper)
│   ├── StickySection.tsx     (44 lines - Framer Motion sticky scroll container)
│   ├── TechStackDualCarousel.tsx (144 lines - 3D floating rotating tech cubes)
│   ├── TechStackSection.tsx  (15 lines - Dynamic import wrapper)
│   ├── Vortex.tsx            (1381 lines - 3D WebGL Tornado engine)
│   └── ui/
│       ├── GooeyTextReveal.tsx (361 lines - GSAP text reveal used in ScrollJourney)
│       ├── cylinder-carousel.tsx (205 lines - UNUSED DEAD COMPONENT)
│       └── staggered-grid.tsx (330 lines - UNUSED DUPLICATE)
├── lib/
│   ├── portfolio-data.ts     (CAROUSEL_DATA, PROJECT_DATA, ACHIEVEMENTS_DATA)
│   └── utils.ts              (cn utility)
├── public/
│   ├── assets/               (EMPTY DIRECTORY)
│   └── images/
│       ├── base.png
│       ├── chrome.png
│       └── screen.png
├── patch.py                  (1633 lines - UNUSED SCRATCH SCRIPT)
├── package.json
└── tsconfig.json
```

### Current vs. Requested Flow Mapping

| Flow Step | Requested Section | Current Implementation | Naming Gap / Issue | Recommended Refactor Target |
|---|---|---|---|---|
| **1** | **Hero** | `components/Hero.tsx` + `components/DiceRoleFlipper.tsx` | Dead import of `ParticleField` in `Hero.tsx`. Section itself is functionally solid. | `components/Hero.tsx` (remove dead import) |
| **2** | **Vortex About** | `components/ScrollJourney.tsx` + `ScrollJourney.css` | **Misnamed**: Named "ScrollJourney" even though it renders the 3D Vortex, "Harman Saini / Systems Architect" about text, and the Sobel Dissolve layer. | Rename to `components/VortexAbout.tsx` (and `components/VortexAbout.css`) |
| **3** | **Journey** | Inlined inside `app/page.tsx` lines 53–86 (`StickySection` + `LiquidGlassCarousel`) | Inlined in `page.tsx` inside a CSS Grid overlap with `ScrollJourney`. Causes z-index / pointer-events blocking. | Extract to dedicated `components/JourneySection.tsx` (or `Journey.tsx`) |
| **4** | **Techstack** | `components/TechStackSection.tsx` wrapping `components/TechStackDualCarousel.tsx` | Separate 15-line wrapper file. Works, but can be standardized. | `components/TechStackSection.tsx` |
| **5** | **Projects** | Inlined inside `app/page.tsx` lines 95–120 (`StickySection` + `MosaicFlip`) | Inlined in `page.tsx`. Currently lacks the Chromium profile lighting border (Req R2). | Extract to dedicated `components/ProjectsSection.tsx` (with Chromium border) |
| **6** | **Achievements** | Inlined inside `app/page.tsx` lines 123–128 (`HoverImageReveal`) | Inlined in `page.tsx`. | Extract to dedicated `components/AchievementsSection.tsx` |
| **7** | **Contact Us** | `components/ContactSection.tsx` | Inlines duplicated `staggered-grid.tsx` logic. | Clean up and standardize as `components/ContactSection.tsx` |

---

## 3. Detailed Audit of Garbage, Unused, and Duplicate Code

### 3.1 Unused React Components
1. **`components/ScrollDissolveReveal.tsx`**:
   - Lines: 353
   - Purpose: An earlier standalone implementation of the Sobel edge & FBM noise dissolve scene.
   - Verification: `grep_search` found 0 import references across the entire repository. Its shader code and Three.js canvas setup were already copied into `components/ScrollJourney.tsx`.
   - **Action**: Safe to delete.
2. **`components/ui/cylinder-carousel.tsx`**:
   - Lines: 205
   - Purpose: Cylinder carousel with popup modal.
   - Verification: 0 import references. Never used anywhere in the app.
   - **Action**: Safe to delete.
3. **`components/StaggeredGrid.tsx` & `components/ui/staggered-grid.tsx`**:
   - Lines: 5 + 330
   - Purpose: `ContactSection.tsx` duplicated the full implementation. Neither `StaggeredGrid.tsx` nor `components/ui/staggered-grid.tsx` is imported by `app/page.tsx`.
   - **Action**: Delete both after confirming `ContactSection.tsx` is self-contained.

### 3.2 Dead Imports
1. **`components/Hero.tsx` (Line 8)**:
   ```tsx
   const ParticleField = dynamic(() => import('./ParticleField'), { ssr: false });
   ```
   - `ParticleField` is never rendered in `Hero.tsx`.
   - `ParticleField` is rendered in `app/page.tsx` as the fixed global background.
   - **Action**: Remove the line from `components/Hero.tsx`.

### 3.3 Dead CSS in `app/globals.css`
1. **Lines 22–29**: `.road-moving-dashes` and `@keyframes roadDashMove`. (0 occurrences in project).
2. **Lines 31–37**: `.road-photon-stream` and `@keyframes roadPhotonMove`. (0 occurrences in project).
3. **Lines 39–45**: `@keyframes cylinderRotate` and `@keyframes ry`. (Only belonged to deleted `cylinder-carousel.tsx`).
4. **Lines 63–104**: `.venom-mercury-side-left` and `.venom-mercury-side-right` fixed side gradients. (0 occurrences in project).
- **Action**: Remove these dead styles to keep `app/globals.css` clean.

### 3.4 Root / Filesystem Garbage
1. **`patch.py`**:
   - Size: 49.9 KB (1,633 lines).
   - Purpose: Temporary Python script used during earlier development.
   - **Action**: Safe to delete.
2. **`public/assets`**:
   - Empty folder.
   - **Action**: Remove empty folder.

### 3.5 Dependencies in `package.json`
1. **`@base-ui/react`**:
   - 0 imports anywhere in the codebase.
   - **Action**: Safe to uninstall / remove from `dependencies`.
2. **`class-variance-authority`**:
   - 0 imports anywhere in the codebase.
   - **Action**: Safe to uninstall / remove from `dependencies`.
3. **`lucide-react`**:
   - Only imported by the dead `components/ui/cylinder-carousel.tsx`.
   - **Action**: Once `cylinder-carousel.tsx` is removed, `lucide-react` is unused. Can be removed if no other icon needs it.
4. **`@types/imagesloaded`**:
   - Currently listed under `"dependencies"`.
   - **Action**: Move to `"devDependencies"`.
5. **Scripts**:
   - `"lint": "next lint"` in `package.json`: In Next.js 16.3.6, `next lint` is not a valid subcommand and errors with `Invalid project directory provided, no such directory: ...\lint`.
   - **Action**: Replace with `"typecheck": "tsc --noEmit"` or remove broken lint script.

---

## 4. Build System & Test Health

- **TypeScript Typecheck**:
  - Command: `npx.cmd tsc --noEmit`
  - Status: **PASSED (Exit code 0)** with zero type errors.
- **Next.js Production Build**:
  - Command: `npm.cmd run build` (Next.js 16.3.6 with Turbopack)
  - Status: **PASSED (Exit code 0)**. Successfully compiled static pages `○ /` and `○ /_not-found`.
- **Existing Tests**:
  - No test suite (e.g. Jest, Vitest, Playwright) is currently configured in `package.json`.
  - Type checking (`tsc --noEmit`) and production builds (`next build`) are the verified verification gates.

---

## 5. Architectural Recommendation for Requirement R1 Flow

To satisfy Requirement R1 cleanly and create a maintainable structure:

### 1. Section Component Directory & Naming
Create or standardize the 7 sections to directly match the requested flow:
1. `components/Hero.tsx` -> **Hero**
2. `components/VortexAbout.tsx` (renamed from `ScrollJourney.tsx`) -> **Vortex About**
3. `components/JourneySection.tsx` (extracted from `app/page.tsx`) -> **Journey**
4. `components/TechStackSection.tsx` -> **Techstack**
5. `components/ProjectsSection.tsx` (extracted from `app/page.tsx`, with R2 Chromium border) -> **Projects**
6. `components/AchievementsSection.tsx` (extracted from `app/page.tsx`) -> **Achievements**
7. `components/ContactSection.tsx` -> **Contact Us**

### 2. Clean `app/page.tsx` Composition
`app/page.tsx` becomes ultra-clean and declarative:
```tsx
'use client';

import ParticleField from '@/components/ParticleField';
import Hero from '@/components/Hero';
import VortexAbout from '@/components/VortexAbout';
import JourneySection from '@/components/JourneySection';
import TechStackSection from '@/components/TechStackSection';
import ProjectsSection from '@/components/ProjectsSection';
import AchievementsSection from '@/components/AchievementsSection';
import ContactSection from '@/components/ContactSection';

export default function Home() {
  return (
    <main className="relative min-h-screen w-full bg-black text-white selection:bg-cyan-500 selection:text-black">
      {/* Shared Ambient Particle Background */}
      <div className="fixed inset-0 z-0 pointer-events-none opacity-70 mix-blend-screen">
        <ParticleField />
      </div>

      <div className="relative z-10">
        {/* 1. Hero */}
        <Hero />

        {/* 2. Vortex About */}
        <VortexAbout />

        {/* 3. Journey */}
        <JourneySection />

        {/* 4. Techstack */}
        <TechStackSection />

        {/* 5. Projects */}
        <ProjectsSection />

        {/* 6. Achievements */}
        <AchievementsSection />

        {/* 7. Contact Us */}
        <ContactSection />
      </div>
    </main>
  );
}
```

### 3. Note for Downstream Explorers (R2, R3, R4)
- **For R2 (Projects Section Chromium Border)**:
  Extracting `ProjectsSection.tsx` provides the exact container boundary where the chromium profile lighting border rectangle (via CSS/Tailwind) can be cleanly applied without cluttering `app/page.tsx`.
- **For R3 (Centralized Data Validation)**:
  `lib/portfolio-data.ts` is the single source of truth for `CAROUSEL_DATA` (Journey), `PROJECT_DATA` (Projects), and `ACHIEVEMENTS_DATA` (Achievements). Downstream explorer for R3 should ensure image/video URL validation and segregation.
- **For R4 (Interaction Fixes for Liquid Glass Carousel behind Vortex)**:
  Currently, `ScrollJourney` and `StickySection` overlap in a single CSS grid row/column in `app/page.tsx` with `ScrollJourney` at `z-20` and `pointer-events-none` on the carousel parent. Decoupling them or dynamically adjusting `pointer-events` / `z-index` when `dissolveProgress >= 0.74` is the key to letting mouse/touch events reach `LiquidGlassCarousel`.
