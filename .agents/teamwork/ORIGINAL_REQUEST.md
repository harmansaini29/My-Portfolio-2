# Original User Request

## 2026-10-09T17:59:25Z

Refactor the portfolio folder structure, optimize all code, remove unused garbage files, implement the main project section with a chromium profile lighting border, and verify the Tech Stack 3D and Liquid Glass Carousel behaviors.

Working directory: e:\Cloned Github Repo\My-Portfolio 2

## Requirements

### R1. Restructure and Clean Files
Rename and organize the components to strictly match the requested flow: Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us. Delete any duplicate or unused components, CSS files, or dependencies.

### R2. Projects Section Chromium Border
Update the main projects section (MosaicFlip) to feature a chromium profile lighting border rectangle.

### R3. Centralized Data Validation
Ensure `lib/portfolio-data.ts` perfectly segregates all image and video URLs for Achievements, Projects, and Journey, allowing instant updates.

### R4. Interaction Fixes
Ensure the Liquid Glass Carousel behind the Vortex (used for Journey/Projects) correctly receives scroll/drag events by fixing any Z-index or pointer-events overlaps caused by the Vortex/Dissolve layers.

## Acceptance Criteria

### Restructure & Cleanup
- [ ] No duplicate or unused React components exist in the `components` directory.
- [ ] Section component names match the user's requested flow.

### Projects Section
- [ ] The MosaicFlip container features a CSS/Tailwind border implementing a chromium lighting aesthetic.

### Interaction
- [ ] Dragging and scrolling horizontally on the Liquid Glass Carousel works immediately after the vortex dissolves.


## 2026-10-10T12:24:04Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full agent team

Use the full team of agents.

Fix the Hero section image cropping issue (preventing heads from being cut off) and restore the original `DiceRoleFlipper` and CTA elements in the `My-Portfolio 2` Next.js application.

Working directory: e:\Cloned Github Repo\My-Portfolio 2
Integrity mode: demo

## Requirements

### R1. Prevent Image Cropping in Hero Section
Adjust the CSS properties (e.g., `object-position: center top`) in `components/Hero.css` and/or the `data-fit` styling logic in `components/Hero.tsx` so that the upper portions (heads) of both portraits (`base.png`, `portrait.png`, `chrome.png`) remain fully visible and aligned across all viewport sizes. The solution must not break the existing liquid mask transition effect.

### R2. Restore Original Identity Section Components
Re-integrate the original `DiceRoleFlipper` component into `components/Hero.tsx` and remove the plain text Javascript-based role flipper that replaced it. Restore the exact layout structure of the original bottom-left Identity Section (including any existing CTA buttons or layouts that were previously present before the liquid-reveal refactor).

## Acceptance Criteria

### CSS & Layout Verification
- [ ] `components/Hero.css` contains layout adjustments (`object-position` or equivalent) that explicitly prioritize the top of the hero images.
- [ ] The Hero images do not overlap into other sections.

### Component Restoration Verification
- [ ] `DiceRoleFlipper` is imported and successfully renders in `components/Hero.tsx`.
- [ ] The `setInterval` script logic for the plain text role flipper has been removed from the `useEffect` hook in `Hero.tsx`.

### Build Verification
- [ ] The project successfully compiles via `npm run build` with zero TypeScript or React errors.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*


## 2026-10-10T18:14:47Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full agent team

Use the full team of agents.

Final UI polish for the portfolio: fix Hero image scaling to match reference, enhance Vortex text clarity, add auto-scroll to Journey carousel, reshape Projects section to a square, remove bottom whitespace, and centralize social links.

Working directory: e:\Cloned Github Repo\My-Portfolio 2
Integrity mode: benchmark

## Requirements

### R1. Hero Image Scaling
Adjust the Hero image styling (`object-fit`, `transform` scaling, `data-fit`) so the portrait matches the medium size and shoulder-level framing of the provided reference image. It must auto-align responsively without leaving gaps on the screen edges.

### R2. Vortex Text Clarity (4K Look)
Enhance the typography of the left and right info text in the Vortex section to look crisp ("4K" quality) using font-weight, text-shadow, or contrast adjustments so the words are clearly readable against the background.

### R3. Journey Carousel Auto-Motion
Update the Journey carousel so that it auto-scrolls continuously in motion, while still respecting the user's manual scroll.

### R4. Projects Section Square Shape
Refactor the Projects section (`ChromiumBorderContainer` / `MosaicFlip`) to have a square aspect ratio (`aspect-square` or balanced width/height) instead of a rectangle. Ensure proper alignment so nothing is cut off at the bottom and there is no overlap with other sections.

### R5. Remove Bottom Whitespace
Locate and remove the extra spacing/padding at the very end of the portfolio page.

### R6. Centralized Social/Contact Config
Update the existing `lib/portfolio-data.ts` to act as the centralized configuration file for all Contact Us, GitHub, and other social button links. Keep it compact (max 15-30 lines for the link section) and easily modifiable at the top of the file. Update the relevant UI components to consume these links.

## Acceptance Criteria

### Visual & Layout Verification
- [ ] The Hero image is zoomed out to show shoulders/chest like the reference, covering the full viewport gracefully.
- [ ] Vortex text is clearly legible with high contrast/shadows.
- [ ] Journey carousel exhibits continuous background motion.
- [ ] Projects section container is square-shaped, with no bottom cutoff or section overlap.
- [ ] No blank white/black space at the absolute bottom of the page.

### Code Quality Verification
- [ ] `lib/portfolio-data.ts` contains a clearly marked, compact section for social/contact links.
- [ ] The project successfully compiles (`npm run build`) with zero TypeScript or React errors.

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*

## 2026-10-11T21:02:37Z

# Teamwork Project Prompt — Draft

> Status: Launched
> Goal: Craft prompt → get user approval → delegate to teamwork_preview
> Requested team: Full agent team

Use the full team of agents.

Final comprehensive optimization, mobile/tablet responsiveness with auto-hover hints, direct Vortex dissolve unification, rectangular project showcase with single-line orbital light border, and footer cleanup with LinkedIn integration.

Working directory: e:\Cloned Github Repo\My-Portfolio 2
Integrity mode: benchmark

## Requirements

### R1. Global Performance & Smooth Scroll Calibration
Adjust Lenis scroll physics in `components/SmoothScroll.tsx` (duration: 1.2, wheelMultiplier: 1.0, touchMultiplier: 1.2) to deliver a silky, controlled, luxurious momentum that is neither too fast nor laggy. Optimize WebGL canvas frameloops and event listeners across all sections to ensure fluid, jitter-free 60-120fps rendering.

### R2. Mobile/Tablet Responsiveness & Auto-Hover Hints
Ensure every section and component is fully responsive across mobile phones, tablets, and desktops (360px to 4K). In touch/mobile environments where cursor hover does not exist (specifically `HoverImageReveal` in the Achievements section), implement an autonomous gentle cyclic hover hint/preview loop when idle so mobile users see previews automatically without requiring manual touch locking.

### R3. Direct Vortex Dissolve Unification & Info Border Removal
Refactor `components/VortexAbout.tsx` and `components/VortexAbout.css` so that the GLSL Sobel/FBM noise dissolve transition acts directly on the primary live Vortex instance without creating or displaying a duplicate/procedural vortex canvas. Remove the harsh background borders on the left and right informational text blocks (`.sj-text-flow`) so the text floats cleanly over the space.

### R4. Rectangular Projects Container & Curvy Monoline Running Light Border
Refactor `components/ChromiumBorderContainer.tsx` and `components/ProjectsSection.tsx` from a rigid square to a responsive rectangular aspect ratio (e.g., `aspect-[16/10]` or `w-[94vw] max-w-5xl h-[65vh] md:h-[74vh]`) so inner project cards and text are never cut off. Replace the double borders and mechanical corner brackets with a sleek, single-line curvy rounded border featuring a continuous cyan and amber photonic running light beam orbiting smoothly along the perimeter.

### R5. Footer Whitespace Elimination & LinkedIn Integration
Compress remaining trailing whitespace in `components/ContactSection.tsx` to leave only minimal clean breathing room. In the interactive Bento contact group, explicitly integrate the LinkedIn profile (`SOCIAL_LINKS.linkedin`) as an active primary card alongside GitHub, Twitter, and Email.

### R6. Centralized Social Configuration Maintenance
Preserve the centralized, typed `SOCIAL_LINKS` registry in `lib/portfolio-data.ts`, ensuring all social buttons and links across the site cleanly consume this single source of truth.

## Acceptance Criteria

### Visual & Interactive Verification
- [ ] Page scrolling exhibits a smooth, controlled momentum without aggressive acceleration or lag.
- [ ] All components resize cleanly down to 360px mobile viewports with zero horizontal overflow.
- [ ] Achievements section runs an automatic cyclic preview hint on touch devices when idle.
- [ ] Vortex dissolve transitions smoothly on the primary canvas with no duplicate texture flicker, and info blocks have no outer border lines.
- [ ] Projects container is rectangular with plenty of vertical breathing room, enclosed by a curvy rounded single-line border with an orbiting cyan/amber running light beam.
- [ ] LinkedIn profile is actively present in the Bento cards, and the portfolio ends cleanly with minimal bottom padding.

### Code Quality Verification
- [ ] Zero TypeScript or React lint warnings (`npx tsc --noEmit`).
- [ ] Production build succeeds cleanly (`npm run build`).

---
*Next: when approved → delegate via invoke_subagent (see Delegation Protocol)*
