# Project: Portfolio Refactor & Modernization

## Architecture
- **Framework**: Next.js 16 (Turbopack, App Router) with React 19, Tailwind CSS, Framer Motion, and Three.js.
- **Section Flow**: Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us.
- **Data Layer**: Centralized media registry and strictly typed datasets in `lib/portfolio-data.ts`.
- **Interaction Layer**: Coordinated Z-index stacking contexts and pointer-events passing between pinned Three.js/WebGL background canvases and interactive foreground carousels.
- **Projects Presentation**: GPU-accelerated chromium profile lighting border rectangle wrapping the 3D `MosaicFlip` interactive showcase.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Centralized Data Validation & Media Segregation | Segregate image and video URLs for Hero, Journey, Projects, Achievements into `PORTFOLIO_MEDIA` with strict TypeScript types in `lib/portfolio-data.ts`. Retain backward-compatible exports. | M1-Implementation | Survey E3 / R3 |
| 2 | Chromium Profile Lighting Border Rectangle | Create `ChromiumBorderContainer.tsx` with 4-layer GPU-composited metallic sheen, rotating conic beam, and edge halo, wrapping `MosaicFlip` within a modular `ProjectsSection.tsx`. | M1-Implementation | Survey E2 / R2 |
| 3 | Interaction & Pointer-Events Fixes | Invert Z-index stacking context (`z-20` for Journey, `z-10` for Vortex About), dynamically toggle pointer-events in `ScrollJourney.tsx` / `VortexAbout.tsx` (`useTransform(smoothProgress, v => v >= 0.74 ? "none" : "auto")`), disable `LiquidGlassCarousel` entry animation lock (`entry={{ enabled: false }}`). | M1-Implementation | Survey E3 / R4 |
| 4 | Restructure & Clean Files | Rename `ScrollJourney.tsx`/`.css` to `VortexAbout.tsx`/`.css`, extract `JourneySection.tsx`, `ProjectsSection.tsx`, `AchievementsSection.tsx`, organize `app/page.tsx` strictly matching the 7-section flow, delete 4 unused components, delete `patch.py`, remove dead CSS in `globals.css`, clean package.json. | M1-Implementation | Survey E1 / R1 |
| 5 | E2E Testing Suite & Infrastructure | Design and implement an automated opaque-box verification test harness covering Tiers 1-4 across all 7 flow sections, chromium border, data segregation, and interaction criteria. | E2E Test Track | Dual Track |
| 6 | E2E Test Passing & Adversarial Hardening | Pass 100% of E2E tests (Tiers 1-4) and execute Tier 5 adversarial stress testing via Challenger. | M2-FinalGate | Dual Track / R1-R4 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| E2E | E2E Test Suite Creation | Design 4-tier requirement-driven opaque-box test suite, test runner, `TEST_INFRA.md`, publish `TEST_READY.md`. | none | IN_PROGRESS |
| M1 | Full Portfolio Implementation (R1-R4) | Implement centralized data validation, chromium border container, interaction/z-index fixes, component flow restructure, and file cleanup. | none | IN_PROGRESS |
| M2 | Final Verification & Hardening | Run full E2E test suite against implementation, 2 Reviewers, 2 Challengers, and Forensic Auditor verification. | E2E, M1 | PLANNED |

## Code Layout & Write Boundaries
- **Implementation Worker Write Boundaries**:
  - `lib/portfolio-data.ts`
  - `components/ChromiumBorderContainer.tsx`
  - `components/ProjectsSection.tsx`
  - `components/VortexAbout.tsx` + `components/VortexAbout.css`
  - `components/JourneySection.tsx`
  - `components/AchievementsSection.tsx`
  - `components/Hero.tsx` (remove unused import)
  - `components/LiquidGlassCarousel.tsx`
  - `app/page.tsx`
  - `app/globals.css`
  - `package.json`
  - Deletions: `components/ScrollDissolveReveal.tsx`, `components/ui/cylinder-carousel.tsx`, `components/StaggeredGrid.tsx`, `components/ui/staggered-grid.tsx`, `components/ScrollJourney.tsx`, `components/ScrollJourney.css`, `patch.py`
- **E2E Test Writer Write Boundaries**:
  - `tests/`
  - `TEST_INFRA.md`
  - `TEST_READY.md`
