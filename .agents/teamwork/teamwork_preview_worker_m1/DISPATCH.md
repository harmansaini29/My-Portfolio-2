## 2026-10-10T18:28:47Z
You are Worker 1 for Milestone M1 (Final UI Polish).

Read the authoritative user request at:
e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\ORIGINAL_REQUEST.md (specifically section ## 2026-10-10T18:14:47Z).

Your working directory is:
e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_worker_m1\
The project root is:
e:\Cloned Github Repo\My-Portfolio 2

Maintain progress.md in your working directory with a "Last visited: [timestamp]" header.
When done, write a comprehensive handoff.md in your working directory and notify the parent orchestrator via send_message.

MANDATORY INTEGRITY WARNING:
DO NOT CHEAT. All implementations must be genuine. DO NOT hardcode test results, create dummy/facade implementations, or circumvent the intended task. A teamwork_preview_auditor will independently verify your work. Integrity violations WILL be detected and your work WILL be rejected.

You have access to 3 comprehensive survey reports with exact line numbers and proposed code solutions:
1. Survey Explorer 1 report (R1 Hero Scaling & R2 Vortex Text Clarity):
   e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_explorer_survey_1\handoff.md
2. Survey Explorer 2 report (R3 Journey Auto-Motion & R4 Projects Square Shape):
   e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_explorer_survey_2\handoff.md
3. Survey Explorer 3 report (R5 Remove Whitespace & R6 Centralized Social Config):
   e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_explorer_survey_3\handoff.md

Your tasks:
1. R6 Centralized Social Config:
   - In lib/portfolio-data.ts, add the compact (28-line) typed SOCIAL_LINKS registry at the very top (lines 1-28), exporting SOCIAL_LINKS and SocialLink interface.
2. R5 Remove Bottom Whitespace:
   - In app/layout.tsx, add "dark" to <html className={cn("dark", ...)}> to ensure dark mode classes work properly.
   - In components/ContactSection.tsx, change grid-rows-5 to grid-rows-3, change aspect-[1.1] to aspect-[1.8], and add mb-8 pb-4 to prevent overlap with footer when Bento scales.
   - Wire SOCIAL_LINKS into ContactSection (DEFAULT_BENTO_ITEMS, credits, and footer social links).
3. R1 Hero Image Scaling:
   - In components/Hero.tsx, set portraitSrc and chromeSrc to scale: "1", transformOrigin: "50% 0%", preserving data-fit="cover", data-position="top", and liquid mask responsiveness.
   - In components/Hero.css, adjust .hero::after to height: 9% with steep black gradient so shoulders/upper chest are visible while transitioning smoothly into VortexAbout.
4. R2 Vortex Text Clarity (4K Look):
   - In components/ui/GooeyTextReveal.tsx, strip the lingering filter in GSAP onComplete callback so text is crisp and vector subpixel antialiased.
   - In components/VortexAbout.css, add frosted glass contrast shield (backdrop-filter: blur(16px), background, border, shadow) to .sj-text-flow, and enhance text-shadow, font-weight, and antialiasing across headings, subheadings, paragraphs, tech pills, and metrics.
5. R3 Journey Carousel Auto-Motion:
   - In components/LiquidGlassCarousel.tsx, extend MotionSettings with autoScroll, autoScrollSpeed, pauseOnHover, resumeDelay. Implement zero-lag dual-increment (target += delta; scroll += delta;) in step(dt), pausing on drag, hover, modal focus, and respecting fling inertia with resume cooldown.
   - In components/JourneySection.tsx, configure motion={{ autoScroll: true, autoScrollSpeed: 38, pauseOnHover: true, resumeDelay: 1200 }} on LiquidGlassCarousel.
6. R4 Projects Section Square Shape:
   - In components/ChromiumBorderContainer.tsx, set aspect-square max-h-[min(70vh,640px)] max-w-[min(94vw,70vh,640px)] w-[94vw] max-w-6xl, and include cyan-500 illumination in the halo gradient (satisfying test T1.3.2 and T2.3.1).
   - In components/ProjectsSection.tsx, remove min-h-[115vh] py-24 sm:py-32 to fit within the 100vh StickySection viewport without cutoff, and balance MosaicFlip to columns={8} rows={8}.

VERIFICATION REQUIREMENT:
After making the changes, run:
- npx.cmd tsc --noEmit
- npm.cmd run build
- node tests/e2e-verify.js
- node tests/challenger-hero-stress.js
Document the exact command outputs and verification status in your handoff.md.
