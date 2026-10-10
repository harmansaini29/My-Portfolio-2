# Project: Final UI Polish & Refinements

## Architecture
- Modern Next.js 16 + React 19 portfolio application.
- Visual flow: Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us.
- Three.js WebGL rendering for Hero Liquid Reveal mask, Vortex particle field, and Journey Liquid Glass Carousel.
- CSS Grid & GSAP ScrollTrigger for Contact Us Bento section.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Hero Image Scaling (R1) | Scale portraits to 1.0, eliminate edge gaps, reduce bottom black fade to 9% for shoulder framing while preserving liquid mask | M1 | Survey Explorer 1 |
| 2 | Vortex Text Clarity 4K (R2) | Strip lingering SVG blur filter onComplete in GooeyTextReveal, add backdrop blur frosted panel to .sj-text-flow, boost font weight and multi-layer text shadows | M1 | Survey Explorer 1 |
| 3 | Journey Auto-Motion (R3) | Dual-increment continuous auto-scroll in LiquidGlassCarousel, pause on drag/modal focus, 1.2s resume cooldown | M1 | Survey Explorer 2 |
| 4 | Projects Square Shape (R4) | Aspect-square ChromiumBorderContainer with cyan halo, max-h-[min(70vh,640px)], balanced 8x8 MosaicFlip, prevent 100vh sticky overflow | M1 | Survey Explorer 2 |
| 5 | Remove Bottom Whitespace (R5) | Fix ContactSection 5-row grid with only 3 rows populated; set grid-rows-3, aspect-[1.8], and add "dark" class to html in layout.tsx | M1 | Survey Explorer 3 |
| 6 | Centralized Social Config (R6) | Add compact typed SOCIAL_LINKS (28 lines) at top of lib/portfolio-data.ts; connect ContactSection, Bento items, and footer | M1 | Survey Explorer 3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Complete UI Polish & Verification | Implement R1, R2, R3, R4, R5, R6 per survey specifications; run typecheck, build, and test suites | Survey Phase | DONE |

## Interface Contracts & File Boundaries
### File Ownership:
- `lib/portfolio-data.ts`: Add `SOCIAL_LINKS` (lines 1-28), export `SOCIAL_LINKS` and types.
- `app/layout.tsx`: Add `"dark"` class to `<html>`.
- `components/ContactSection.tsx`: Wire `SOCIAL_LINKS`, update grid to `grid-rows-3 aspect-[1.8] mb-8 pb-4`, wire bento and footer click actions.
- `components/Hero.tsx`: Set portrait `scale: "1"`, `transformOrigin: "50% 0%"`, keep `data-fit="cover"` and `data-position="top"`.
- `components/Hero.css`: Set `.hero::after` height to `9%` with smooth gradient.
- `components/ui/GooeyTextReveal.tsx`: Strip lingering filter on GSAP `onComplete`.
- `components/VortexAbout.css`: Add `.sj-text-flow` backdrop-filter blur frosted panel, multi-layer text shadows, font-weight boosts.
- `components/LiquidGlassCarousel.tsx`: Add `autoScroll` and `autoScrollSpeed` to `MotionSettings`, implement dual increment in `step(dt)`, handle drag/focus pause.
- `components/JourneySection.tsx`: Configure `motion={{ autoScroll: true, autoScrollSpeed: 38, pauseOnHover: true, resumeDelay: 1200 }}`.
- `components/ChromiumBorderContainer.tsx`: Set `aspect-square max-h-[min(70vh,640px)] max-w-[min(94vw,70vh,640px)] w-[94vw] max-w-6xl`, add `cyan-500` to ambient halo.
- `components/ProjectsSection.tsx`: Remove `min-h-[115vh] py-24 sm:py-32`, set compact padding, set `columns={8} rows={8}` on `MosaicFlip`.
