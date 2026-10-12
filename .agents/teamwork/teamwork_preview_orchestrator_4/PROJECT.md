# Project: Comprehensive Optimization, Responsive Unification & Orbital Showcase

## Architecture
- **Framework**: Next.js 16 (Turbopack, App Router) with React 19, Tailwind CSS, Framer Motion, GSAP, and Three.js.
- **Section Flow**: Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us.
- **Scroll Physics & Performance**: Calibrated Lenis smooth scroll (duration 1.2, wheelMultiplier 1.0, touchMultiplier 1.2) synced with GSAP ticker, with off-screen WebGL pause observers across all canvas layers.
- **Vortex Architecture**: Direct WebGL RenderTarget GPU dissolve unification inside primary Vortex engine, removing secondary canvas and procedural fallbacks. Floating borderless typography.
- **Projects Presentation**: Responsive rectangular container (`aspect-[16/10]`, `h-[65vh] md:h-[72vh]`) with sleek curvy monoline border and continuous cyan/amber photonic running light beam.
- **Achievements & Touch**: Responsive layout down to 360px with autonomous cyclic hover preview hint loop for touch devices when idle.
- **Contact & Footer**: 4-card interactive Bento group (Email, LinkedIn, Twitter, GitHub) consuming typed `SOCIAL_LINKS`, with compressed trailing whitespace.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Lenis Scroll Physics Calibration & WebGL frameloop optimizations | Update `SmoothScroll.tsx` to duration: 1.2, wheelMultiplier: 1.0, touchMultiplier: 1.2; import `lenis.css`; eliminate layout thrashing in `LiquidGlassCarousel.tsx`; add IntersectionObserver pauses to Hero, Vortex, Carousel, MosaicFlip. | M1 | Survey E1 / R1 |
| 2 | Mobile/Tablet Responsiveness & Auto-Hover Hints | Fix 360px overflow in `VortexAbout.css` (`.sj-metrics-row` `flex-wrap: wrap`); add responsive font clamp in `HoverImageReveal.tsx` / `AchievementsSection.tsx`; implement autonomous idle cyclic preview loop (3s) for touch devices. | M1 | Survey E1 / R2 |
| 3 | Direct Vortex Dissolve Unification & Info Border Removal | Refactor `Vortex.tsx` with WebGLRenderTarget and GLSL Sobel/FBM shader quad; remove secondary R3F canvas and procedural 2D spiral from `VortexAbout.tsx`; remove harsh card borders from `.sj-text-flow`, `.sj-tech-pill`, `.sj-metric-tag`. | M1 | Survey E2 / R3 |
| 4 | Rectangular Projects Container & Curvy Monoline Running Light Border | Refactor `ChromiumBorderContainer.tsx` to responsive rectangular aspect ratio (`aspect-[16/10]`, `w-[94vw] max-w-5xl md:max-w-6xl h-[65vh] md:h-[72vh]`); replace double borders and corner brackets with single-line curvy border and orbiting cyan/amber running light beam (`animate-photonic-beam`). | M1 | Survey E2 / R4 |
| 5 | Footer Whitespace Elimination & Bento LinkedIn Integration | Add LinkedIn (`SOCIAL_LINKS.linkedin`) with `FaLinkedin` to `DEFAULT_BENTO_ITEMS` in `ContactSection.tsx`, update Email to `FaEnvelope`; adjust expansion width to 52%/16%; compress footer padding to `pb-3 sm:pb-4` and margin to `mt-[6vh]`. Harmonize layout tests. | M1 | Survey E3 / R5 |
| 6 | Centralized Social Registry Maintenance | Verify and preserve typed canonical `SOCIAL_LINKS` in `lib/portfolio-data.ts`, ensuring zero external hardcoded URLs. | M1 | Survey E3 / R6 |
| 7 | Multi-Agent Verification Gate & Integrity Audit | Comprehensive verification: 2 Reviewers (Code/Architecture & UI/UX), 2 Challengers (Geometry/Layout & Motion/Interaction), and 1 Forensic Auditor (Integrity Forensics in benchmark mode). | M2 | Teamwork Lifecycle |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Full Implementation (R1-R6) | Apply verified code changes to SmoothScroll, Vortex, VortexAbout, ChromiumBorderContainer, ContactSection, HoverImageReveal, globals.css, and harmonize test assertions. Run tsc and build. | none | DONE |
| M2 | Multi-Agent Verification & Integrity Gate | Dispatch 2 Reviewers, 2 Challengers, and 1 Forensic Auditor. Verify 100% test pass rate, code quality, and genuine implementations. | M1 | DONE |

## Code Layout & Write Boundaries
- **Implementation Worker Write Boundaries**:
  - `components/SmoothScroll.tsx`
  - `components/LiquidGlassCarousel.tsx`
  - `components/Hero.tsx`
  - `components/Vortex.tsx`
  - `components/VortexAbout.tsx`
  - `components/VortexAbout.css`
  - `components/ChromiumBorderContainer.tsx`
  - `components/ProjectsSection.tsx`
  - `components/HoverImageReveal.tsx`
  - `components/AchievementsSection.tsx`
  - `components/ContactSection.tsx`
  - `app/globals.css`
  - `tests/challenger-layout-geometry-stress.js`
