## 2026-10-11T21:14:17Z
You are teamwork_preview_worker (Implementation Worker).
Your working directory: e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_worker_1
Project root: e:\Cloned Github Repo\My-Portfolio 2
Parent conversation ID: 90f4434b-de62-47de-8263-bb21832bf808

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

MANDATORY INPUTS:
Read and inspect:
1. e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\ORIGINAL_REQUEST.md (specifically the latest user request under timestamp ## 2026-10-11T21:02:37Z).
2. e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_orchestrator_4\PROJECT.md
3. Survey 1 Report: e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_explorer_survey_r1_r2\handoff.md
4. Survey 2 Report: e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_explorer_survey_r3_r4\handoff.md
5. Survey 3 Report: e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_explorer_survey_r5_r6\handoff.md

YOUR WRITE BOUNDARIES (Exclusive):
- components/SmoothScroll.tsx
- components/LiquidGlassCarousel.tsx
- components/Hero.tsx
- components/Vortex.tsx
- components/VortexAbout.tsx
- components/VortexAbout.css
- components/ChromiumBorderContainer.tsx
- components/ProjectsSection.tsx
- components/HoverImageReveal.tsx
- components/AchievementsSection.tsx
- components/ContactSection.tsx
- app/globals.css
- tests/challenger-layout-geometry-stress.js (harmonizing rectangular container tests)

IMPLEMENTATION TASKS (R1 - R6):

1. R1: Global Performance & Smooth Scroll Calibration:
   - In components/SmoothScroll.tsx: Update Lenis physics to duration: 1.2, wheelMultiplier: 1.0, touchMultiplier: 1.2. Add `import 'lenis/dist/lenis.css';`.
   - In components/LiquidGlassCarousel.tsx: Eliminate synchronous layout thrashing by removing `readBounds` from window scroll listener. Update canvas touchAction to "pan-y". Add IntersectionObserver to pause tick loop when offscreen.
   - In components/Hero.tsx: Pause requestAnimationFrame when off-screen (!inView) rather than continuously rescheduling frames. Re-arm on entering view.
   - In components/Vortex.tsx: Add IntersectionObserver to pause step loop when container is offscreen, resume when entering view.

2. R2: Mobile/Tablet Responsiveness & Auto-Hover Hints:
   - In components/VortexAbout.css: Add `flex-wrap: wrap;` to `.sj-metrics-row` to fix 45px overflow on 360px mobile viewports.
   - In components/HoverImageReveal.tsx & components/AchievementsSection.tsx: Add responsive font sizing (e.g. clamp) and normal word wrapping so achievements titles fit cleanly down to 360px.
   - In components/HoverImageReveal.tsx: Implement an autonomous gentle cyclic hover preview hint loop (2.8s-3.2s interval) for touch/mobile devices when idle with centered coordinates (rawX at 50% width), pausing on tap/interaction without manual touch locking.

3. R3: Direct Vortex Dissolve Unification & Info Border Removal:
   - In components/Vortex.tsx: Integrate the GLSL Sobel/FBM noise dissolve post-processing pass directly via THREE.WebGLRenderTarget and orthographic quad inside the primary vortex engine. Accept dissolveProgress prop. When dissolveProgress > 0, render scene to render target and output dissolve pass to canvas directly.
   - In components/VortexAbout.tsx: Remove the secondary R3F Canvas and procedural 2D canvas fallback. Pass dissolveNormalized directly to `<Vortex dissolveProgress={...} />`. Preserve vortexOpacity until dissolve finishes.
   - In components/VortexAbout.css: Remove harsh borders (`border: 1px solid rgba(255,255,255,0.1)`) and dark card backgrounds from `.sj-text-flow` so text floats cleanly over the space. Soften `.sj-tech-pill` and `.sj-metric-tag` borders.

4. R4: Rectangular Projects Container & Curvy Monoline Running Light Border:
   - In components/ChromiumBorderContainer.tsx: Refactor from square to responsive rectangular layout: `w-[94vw] max-w-5xl md:max-w-6xl h-[65vh] md:h-[72vh] min-h-[480px] max-h-[700px] aspect-[16/10]`. Keep `max-w-6xl` and `rounded-tl` tokens to satisfy existing tier tests.
   - In components/ChromiumBorderContainer.tsx & app/globals.css: Remove double borders and mechanical corner brackets. Implement a sleek, single-line curvy rounded border with a continuous cyan and amber photonic running light beam orbiting smoothly along the perimeter (`animate-photonic-beam` keyframes).
   - In components/ProjectsSection.tsx: Ensure padding, button placements, and bottom overlay integrate smoothly with the rectangular container with ample vertical breathing room and zero cutoff.

5. R5: Footer Whitespace Elimination & LinkedIn Integration:
   - In components/ContactSection.tsx: Import FaLinkedin and FaEnvelope from react-icons/fa. Add LinkedIn (SOCIAL_LINKS.linkedin) as an active card in DEFAULT_BENTO_ITEMS alongside GitHub, Twitter, and Email (with FaEnvelope).
   - In components/ContactSection.tsx: Update card expansion width formula for 4 items to `52% / 16%` (active 52%, inactive 16% each, sum 100%).
   - In components/ContactSection.tsx: Compress trailing whitespace by setting section top margin to `mt-[6vh]` and footer padding to `pb-3 sm:pb-4`.
   - In tests/challenger-layout-geometry-stress.js: Harmonize Suite 1 and Suite 2 tests that previously asserted square container properties to assert the rectangular container and compressed spacing.

6. R6: Centralized Social Configuration Maintenance:
   - Confirm SOCIAL_LINKS in lib/portfolio-data.ts remains canonical source of truth and all references use it.
