# Comprehensive Analysis & Recommendations: R3 & R4

**Author:** Survey Explorer 3  
**Target Project:** Harman Saini Portfolio Refactor  
**Focus Areas:** Requirement R3 (Centralized Data Validation & Media Segregation) & Requirement R4 (Interaction Fixes: Liquid Glass Carousel, Vortex Dissolve, Tech Stack 3D)  
**Date:** 2026-10-09  

---

## 1. Executive Summary

This report delivers an in-depth code-level analysis and architectural specification for:
1. **Requirement R3 (Centralized Data Validation)**: Redesigning `lib/portfolio-data.ts` to cleanly isolate all image and video assets into a centralized, strongly typed registry (`PORTFOLIO_MEDIA`) while maintaining complete backward compatibility with existing components (`LiquidGlassCarousel`, `MosaicFlip`, `HoverImageReveal`).
2. **Requirement R4 (Interaction Fixes)**: Identifying the exact root causes behind why the Liquid Glass Carousel fails to receive drag and scroll events immediately after the vortex dissolves, providing exact CSS and React solutions, and auditing the 3D Tech Stack behavior and performance.

---

## 2. Requirement R3: Centralized Data Validation & Media Segregation

### 2.1 Current State Analysis

The current `lib/portfolio-data.ts` file exhibits several critical architectural weaknesses:

1. **Inlined Media URLs Without Typing**:
   In `CAROUSEL_DATA` (lines 1–27) and `PROJECT_DATA` (lines 29–40), image URLs are hardcoded as plain string properties directly alongside content text (`title`, `desc`), without any TypeScript interface or type declarations.
   ```ts
   // Current lib/portfolio-data.ts (lines 1-6)
   export const CAROUSEL_DATA = [
     { 
       image: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=60',
       title: "CSMU B.Tech CSE",
       desc: "2023 - 2027 | CGPA 8.6"
     }, ...
   ];
   ```

2. **No Segregation of Image vs. Video Assets**:
   There is zero support or modeling for video URLs (`.mp4`, `.webm`, streaming embeds), video posters, or alternative asset fallbacks. If a user wants to add a video demo for a project (e.g., Harriot SOA or Aegis.AI) or a journey highlight, there is no typed field or convention.

3. **Inconsistent Data Schemas Across Sections**:
   - `CAROUSEL_DATA` is an array of `{ image, title, desc }`.
   - `PROJECT_DATA` is an array of `{ image, title, desc }`.
   - `ACHIEVEMENTS_DATA` (lines 42–49) uses an arbitrary dictionary structure tailored to an old OriginKit component:
     ```ts
     export const ACHIEVEMENTS_DATA = {
       itemCount: 5,
       item1: { text: "2× HACKATHON WINNER", image: { src: "https://..." } },
       item2: { text: "GHOST MODE", image: { src: "https://..." } }, ...
     };
     ```
     This structure makes programmatic updates clumsy and prevents standard array operations (`map`, `filter`).

4. **Scattered Hero Media**:
   Hero assets (`base.png` and `chrome.png`) are defined outside `lib/portfolio-data.ts` in `app/page.tsx` (lines 18–21):
   ```ts
   const HERO_IMAGES = {
     base: '/images/base.png',
     chrome: '/images/chrome.png',
   };
   ```
   This breaks centralization because updating portfolio assets requires editing multiple files.

### 2.2 Proposed Architecture: Segregated Media Registry

To satisfy Requirement R3, we introduce a dual-layer architecture in `lib/portfolio-data.ts`:

1. **Layer 1: Centralized Media Asset Registry (`PORTFOLIO_MEDIA`)**:
   A single, dedicated top-level constant where every image, video, poster, and fallback URL is declared and categorized by section. Anyone updating media assets only ever edits this registry.
2. **Layer 2: Strongly Typed Content Entities (`JourneyItem`, `ProjectItem`, `AchievementItem`)**:
   Entity arrays populated cleanly from the registry, providing rich domain fields (IDs, dates, tags, live links, github links, video URLs) while retaining `image` getters for seamless compatibility with `LiquidGlassCarousel` and `MosaicFlip`.

### 2.3 Proposed TypeScript Schema (`lib/portfolio-data.ts`)

```typescript
// ============================================================================
// PORTFOLIO MEDIA ASSET REGISTRY & TYPE DEFINITIONS
// ============================================================================

export type MediaType = 'image' | 'video';

export interface MediaAsset {
  readonly type: MediaType;
  readonly url: string;
  readonly posterUrl?: string; // Fallback image or video poster
  readonly alt?: string;
  readonly width?: number;
  readonly height?: number;
}

// ----------------------------------------------------------------------------
// 1. Centralized Media Assets Registry
// ----------------------------------------------------------------------------
export const PORTFOLIO_MEDIA = {
  hero: {
    base: {
      type: 'image' as const,
      url: '/images/base.png',
      alt: 'Harman Saini Portrait Base Layer',
    },
    chrome: {
      type: 'image' as const,
      url: '/images/chrome.png',
      alt: 'Harman Saini Liquid Chrome Mask Layer',
    },
  },
  journey: {
    csmu: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=900&auto=format&fit=crop&q=60',
      alt: 'CSMU B.Tech CSE Campus',
    },
    googleAmbassador: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=900&auto=format&fit=crop&q=60',
      alt: 'Google Student Ambassador Hackathon',
    },
    sapphireInfocom: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?w=900&auto=format&fit=crop&q=60',
      alt: 'Sapphire Infocom Full Stack Architecture',
    },
    growsphere: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=900&auto=format&fit=crop&q=60',
      alt: 'GrowSphere Developer Community',
    },
    awsBuilder: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=900&auto=format&fit=crop&q=60',
      alt: 'AWS Student Builder Campus Event',
    },
  },
  projects: {
    umbrella: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&auto=format&fit=crop&q=60',
      videoUrl: '', // Readily accept video URL e.g. '/videos/umbrella-demo.mp4'
      alt: 'Project UMBRELLA Autonomous Multi-Agent System',
    },
    harriot: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Harriot SOA Smart Occupancy Agent',
    },
    aegis: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Aegis.AI Intelligent Anti-Bot Defense',
    },
    connex: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1474487548417-781cb71495f3?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Connex Systems Railway Automation',
    },
    nyaya: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'NyayaAI Legal Copilot',
    },
    pgRental: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'PG Rental CRM Platform',
    },
    onlineGyan: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1501504905252-473c47e087f8?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'OnlineGyan EdTech Portal',
    },
    smartUmpire: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Smart AI Umpire 3D System',
    },
    cetPortal: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'CET Exam Utility Portal',
    },
    aiLogoMaker: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1626785774573-4b799315345d?w=900&auto=format&fit=crop&q=60',
      videoUrl: '',
      alt: 'Generative AI Logo Maker',
    },
  },
  achievements: {
    hackathonWinner: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
      alt: '2× Hackathon Winner Trophy',
    },
    ghostMode: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=60',
      alt: 'Ghost Mode Security Challenge',
    },
    enigmaTop10: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=800&auto=format&fit=crop&q=60',
      alt: 'ENIGMA National Top 10 Finalist',
    },
    hacknova7th: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&auto=format&fit=crop&q=60',
      alt: 'HackNova 7th Place Award',
    },
    nptelGold: {
      type: 'image' as const,
      url: 'https://images.unsplash.com/photo-1523050854058-8df90110c9f1?w=800&auto=format&fit=crop&q=60',
      alt: 'NPTEL Elite Gold Certification',
    },
  },
} as const;

// ----------------------------------------------------------------------------
// 2. Strongly Typed Domain Entities
// ----------------------------------------------------------------------------

export interface JourneyItem {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly period?: string;
  readonly media: MediaAsset;
  readonly image: string; // Compatibility alias
  readonly video?: string;
}

export interface ProjectItem {
  readonly id: string;
  readonly title: string;
  readonly desc: string;
  readonly media: MediaAsset;
  readonly image: string; // Compatibility alias
  readonly video?: string;
  readonly link?: string;
  readonly tags?: readonly string[];
}

export interface AchievementItem {
  readonly id: string;
  readonly text: string;
  readonly media: MediaAsset;
  readonly image: { readonly src: string; readonly alt?: string };
  readonly video?: string;
  readonly link?: string;
}

// ----------------------------------------------------------------------------
// 3. Centralized Data Collections (Fully Compatible with UI Components)
// ----------------------------------------------------------------------------

export const CAROUSEL_DATA: readonly JourneyItem[] = [
  {
    id: 'csmu',
    title: 'CSMU B.Tech CSE',
    desc: '2023 - 2027 | CGPA 8.6',
    period: '2023 - 2027',
    media: PORTFOLIO_MEDIA.journey.csmu,
    image: PORTFOLIO_MEDIA.journey.csmu.url,
  },
  {
    id: 'google-ambassador',
    title: 'Google Student Ambassador',
    desc: 'Aug 2025 - Dec 2025 | Organized Ideathons & Hackathons',
    period: 'Aug 2025 - Dec 2025',
    media: PORTFOLIO_MEDIA.journey.googleAmbassador,
    image: PORTFOLIO_MEDIA.journey.googleAmbassador.url,
  },
  {
    id: 'sapphire-infocom',
    title: 'Sapphire Infocom',
    desc: 'Dec 2025 - Mar 2026 | Full Stack Developer Intern',
    period: 'Dec 2025 - Mar 2026',
    media: PORTFOLIO_MEDIA.journey.sapphireInfocom,
    image: PORTFOLIO_MEDIA.journey.sapphireInfocom.url,
  },
  {
    id: 'growsphere',
    title: 'Founder @ GrowSphere',
    desc: 'Mar 2026 - Present | 1,200+ Developers | 5+ Events',
    period: 'Mar 2026 - Present',
    media: PORTFOLIO_MEDIA.journey.growsphere,
    image: PORTFOLIO_MEDIA.journey.growsphere.url,
  },
  {
    id: 'aws-builder',
    title: 'AWS Student Builder',
    desc: 'Campus Leader | Sep 2026 - Present',
    period: 'Sep 2026 - Present',
    media: PORTFOLIO_MEDIA.journey.awsBuilder,
    image: PORTFOLIO_MEDIA.journey.awsBuilder.url,
  },
];

export const PROJECT_DATA: readonly ProjectItem[] = [
  {
    id: 'umbrella',
    title: 'Project UMBRELLA',
    desc: 'Risk-Aware Multi-Agent Fault Detection System',
    media: PORTFOLIO_MEDIA.projects.umbrella,
    image: PORTFOLIO_MEDIA.projects.umbrella.url,
    video: PORTFOLIO_MEDIA.projects.umbrella.videoUrl,
  },
  {
    id: 'harriot-soa',
    title: 'Harriot SOA',
    desc: 'Smart Occupancy Agent | React | FastAPI | LangGraph',
    media: PORTFOLIO_MEDIA.projects.harriot,
    image: PORTFOLIO_MEDIA.projects.harriot.url,
  },
  {
    id: 'aegis-ai',
    title: 'Aegis.AI',
    desc: 'Intelligent Anti-Bot Defense | Live → aegis-ai.vercel.app',
    media: PORTFOLIO_MEDIA.projects.aegis,
    image: PORTFOLIO_MEDIA.projects.aegis.url,
    link: 'https://aegis-ai.vercel.app',
  },
  {
    id: 'connex-systems',
    title: 'Connex Systems',
    desc: 'Railway Concession Automation | 60% Less Manual Processing',
    media: PORTFOLIO_MEDIA.projects.connex,
    image: PORTFOLIO_MEDIA.projects.connex.url,
  },
  {
    id: 'nyaya-ai',
    title: 'NyayaAI',
    desc: 'AI Legal Copilot | OCR | NER | RAG | FAISS',
    media: PORTFOLIO_MEDIA.projects.nyaya,
    image: PORTFOLIO_MEDIA.projects.nyaya.url,
  },
  {
    id: 'pg-rental',
    title: 'PG Rental CRM',
    desc: 'Property Management | 10,000+ Users',
    media: PORTFOLIO_MEDIA.projects.pgRental,
    image: PORTFOLIO_MEDIA.projects.pgRental.url,
  },
  {
    id: 'online-gyan',
    title: 'OnlineGyan',
    desc: 'E-learning Platform | Sapphire Infocom',
    media: PORTFOLIO_MEDIA.projects.onlineGyan,
    image: PORTFOLIO_MEDIA.projects.onlineGyan.url,
  },
  {
    id: 'smart-ai-umpire',
    title: 'Smart AI Umpire',
    desc: '3D Sports Umpiring | Three.js | Socket.io',
    media: PORTFOLIO_MEDIA.projects.smartUmpire,
    image: PORTFOLIO_MEDIA.projects.smartUmpire.url,
  },
  {
    id: 'cet-exam-portal',
    title: 'CET Exam Portal',
    desc: 'CSMU Utility | Live → cet-exam-portal.vercel.app',
    media: PORTFOLIO_MEDIA.projects.cetPortal,
    image: PORTFOLIO_MEDIA.projects.cetPortal.url,
    link: 'https://cet-exam-portal.vercel.app',
  },
  {
    id: 'ai-logo-maker',
    title: 'AI Logo Maker',
    desc: 'Generative AI Branding | Live → ai-logo-maker.vercel.app',
    media: PORTFOLIO_MEDIA.projects.aiLogoMaker,
    image: PORTFOLIO_MEDIA.projects.aiLogoMaker.url,
    link: 'https://ai-logo-maker.vercel.app',
  },
];

export const ACHIEVEMENTS_LIST: readonly AchievementItem[] = [
  {
    id: 'hackathon-winner',
    text: '2× HACKATHON WINNER',
    media: PORTFOLIO_MEDIA.achievements.hackathonWinner,
    image: { src: PORTFOLIO_MEDIA.achievements.hackathonWinner.url, alt: '2× Hackathon Winner' },
  },
  {
    id: 'ghost-mode',
    text: 'GHOST MODE',
    media: PORTFOLIO_MEDIA.achievements.ghostMode,
    image: { src: PORTFOLIO_MEDIA.achievements.ghostMode.url, alt: 'Ghost Mode' },
  },
  {
    id: 'enigma-top-10',
    text: 'ENIGMA TOP 10',
    media: PORTFOLIO_MEDIA.achievements.enigmaTop10,
    image: { src: PORTFOLIO_MEDIA.achievements.enigmaTop10.url, alt: 'ENIGMA Top 10' },
  },
  {
    id: 'hacknova-7th',
    text: 'HACKNOVA 7TH',
    media: PORTFOLIO_MEDIA.achievements.hacknova7th,
    image: { src: PORTFOLIO_MEDIA.achievements.hacknova7th.url, alt: 'HackNova 7th' },
  },
  {
    id: 'nptel-gold',
    text: 'NPTEL ELITE GOLD',
    media: PORTFOLIO_MEDIA.achievements.nptelGold,
    image: { src: PORTFOLIO_MEDIA.achievements.nptelGold.url, alt: 'NPTEL Elite Gold' },
  },
];

// OriginKit HoverImageReveal preset compatible dictionary structure
export const ACHIEVEMENTS_DATA = {
  itemCount: ACHIEVEMENTS_LIST.length,
  item1: ACHIEVEMENTS_LIST[0],
  item2: ACHIEVEMENTS_LIST[1],
  item3: ACHIEVEMENTS_LIST[2],
  item4: ACHIEVEMENTS_LIST[3],
  item5: ACHIEVEMENTS_LIST[4],
};
```

---

## 3. Requirement R4: Interaction Fixes

### 3.1 Anatomical Analysis of the Interaction Lockout

In `app/page.tsx` (lines 48–87):
```tsx
{/* 2. Vortex & 3. Journey Section - Grid Overlap for Seamless Dissolve */}
<div className="grid grid-cols-1 grid-rows-1 w-full">
  <div className="col-start-1 row-start-1 w-full relative z-20">
    <ScrollJourney />
  </div>
  <div className="col-start-1 row-start-1 w-full pt-[0vh] relative z-10 pointer-events-none">
    <div className="pointer-events-auto">
      <StickySection 
        height="460vh" 
        startEndOffset={["start start", "end end"]}
        opacityStops={[0, 0.65, 0.74, 1]} 
        opacityMap={[0, 0, 1, 1]} 
        scaleStops={[0, 1]} 
        scaleMap={[1, 1]}
      >
      <section className="w-full h-full bg-transparent py-20 overflow-hidden flex flex-col justify-center items-center relative">
        <h2 className="text-4xl md:text-6xl font-bold mb-10 text-center z-10 text-white tracking-widest uppercase pointer-events-none" style={{ textShadow: "0 0 20px rgba(0, 157, 255, 0.5)" }}>My Journey</h2>
        
        <div className="w-full h-[70vh] relative z-20">
          <LiquidGlassCarousel items={CAROUSEL_ITEMS} background="transparent" onFocusChange={setActiveCarousel} />
        </div>
        ...
```

The bug report states:
> *"Dragging and scrolling horizontally on the Liquid Glass Carousel works immediately after the vortex dissolves."*

Currently, dragging and scrolling **does NOT work** immediately after the vortex dissolves. Why?

### 3.2 Root Causes Identified

#### Root Cause 1: CSS Stacking Context Inversion (`z-20` vs. `z-10`)
- `ScrollJourney`'s wrapper is declared at `z-index: 20` (`relative z-20`).
- The Journey Carousel's wrapper is declared at `z-index: 10` (`relative z-10 pointer-events-none`).
- In standard CSS stacking rules, an element at `z-20` sits above an element at `z-10` within the same stacking context (`grid-cols-1 grid-rows-1`). Therefore, `ScrollJourney` is physically layered above the Journey Carousel.

#### Root Cause 2: Sticky Pinned Scroll Distance Mismatch (360vh vs. 266vh)
- `ScrollJourney` (`ScrollJourney.css` line 4) has a track height of `360vh` (`.sj-track { height: 360vh; }`).
- Inside `ScrollJourney`, `.sj-sticky` has `position: sticky; top: 0; width: 100%; height: 100vh; z-index: 10;`.
- The vortex dissolve timeline in `ScrollJourney.tsx` dissolves the vortex between scroll progress `0.74` and `0.98`:
  $$360\text{vh} \times 0.74 = 266.4\text{vh}$$
- At `266.4vh`, the vortex dissolves into transparency and the Journey Carousel fades in to `opacity: 1`.
- However, `.sj-sticky` remains pinned to the viewport for the entire remaining track:
  $$360\text{vh} - 266.4\text{vh} = 93.6\text{vh}$$
- For almost **100vh of scroll distance**, `ScrollJourney`'s sticky container sits pinned at `top: 0` covering 100% of the viewport at `z-20`.

#### Root Cause 3: Pointer Events Trap in Invisible `.sj-vortex-layer`
- In `ScrollJourney.css` line 32:
  ```css
  .sj-vortex-layer {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
    pointer-events: auto;
    z-index: 1;
  }
  ```
- In `ScrollJourney.tsx` line 353:
  ```ts
  const vortexOpacity = useTransform(smoothProgress, [0.0, 0.15, 0.74, 0.741], [0.6, 1.0, 1.0, 0.0]);
  ```
- While `vortexOpacity` drops to `0.0`, the DOM element retains `pointer-events: auto`.
- In browser hit-testing, an element with `opacity: 0` and `pointer-events: auto` **still absorbs all mouse, touch, and pointer events**.
- Therefore, every click, touchstart, drag, or wheel event aimed at `LiquidGlassCarousel` hits `.sj-vortex-layer` in `ScrollJourney` at `z-20` and is completely swallowed. `LiquidGlassCarousel` at `z-10` receives nothing.

#### Root Cause 4: Internal Input Lockout in `LiquidGlassCarousel.tsx`
- In `LiquidGlassCarousel.tsx` lines 1394–1396:
  ```ts
  function inputLocked() {
    return focusState.active || entryActive || entrySettled;
  }
  ```
- And lines 1030–1035:
  ```ts
  if (!still && pp.entry.enabled) playEntry();
  ```
- `pp.entry.enabled` defaults to `true` (`e.enabled !== false`). When `LiquidGlassCarousel` mounts, `playEntry()` starts an entrance animation timeline that sets `entryActive = true` and `entrySettled = true`.
- If images are loading over the network, `awaiting` triggers a timeout (`setTimeout(boot, 6000)`).
- During this window, `inputLocked()` returns `true`, and all event listeners (`onWheel`, `onPointerDown`, `onClick`) immediately abort (`if (inputLocked()) return;`).
- Disabling the entry animation on the carousel when used in the scroll sequence (`entry={{ enabled: false }}`) ensures `inputLocked()` is never locked when the user reaches Journey.

---

### 3.3 Concrete CSS & JS Fix Specifications for R4

#### Fix 1: Invert Stacking Hierarchy in `app/page.tsx`
Give the Journey container `z-20` and `ScrollJourney` `z-10`:
```tsx
{/* 2. Vortex & 3. Journey Section - Grid Overlap for Seamless Dissolve */}
<div className="grid grid-cols-1 grid-rows-1 w-full">
  {/* Vortex Layer at z-10 */}
  <div className="col-start-1 row-start-1 w-full relative z-10">
    <ScrollJourney />
  </div>
  {/* Journey Carousel at z-20 */}
  <div className="col-start-1 row-start-1 w-full pt-[0vh] relative z-20 pointer-events-none">
    <div className="pointer-events-auto">
      <StickySection 
        height="460vh" 
        startEndOffset={["start start", "end end"]}
        opacityStops={[0, 0.65, 0.74, 1]} 
        opacityMap={[0, 0, 1, 1]} 
        scaleStops={[0, 1]} 
        scaleMap={[1, 1]}
      >
        <section className="w-full h-full bg-transparent py-20 overflow-hidden flex flex-col justify-center items-center relative">
          <h2 className="text-4xl md:text-6xl font-bold mb-10 text-center z-10 text-white tracking-widest uppercase pointer-events-none" style={{ textShadow: "0 0 20px rgba(0, 157, 255, 0.5)" }}>My Journey</h2>
          
          <div className="w-full h-[70vh] relative z-20 pointer-events-auto">
            <LiquidGlassCarousel 
              items={CAROUSEL_ITEMS} 
              background="transparent" 
              onFocusChange={setActiveCarousel} 
              entry={{ enabled: false }}
              interaction={{ drag: true, wheel: true, clickToFocus: true }}
            />
          </div>
```

#### Fix 2: Dynamic Pointer Events Delegation in `ScrollJourney.tsx`
Add a Framer Motion transform that disables pointer-events on `ScrollJourney` elements as soon as dissolve commences:
```tsx
// In ScrollJourney.tsx:
const vortexPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));
const stickyPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.75 ? "none" : "auto"));
```
Apply to `.sj-vortex-layer`:
```tsx
<motion.div
  className="sj-vortex-layer"
  style={{
    y: vortexY,
    scale: vortexScale,
    opacity: vortexOpacity,
    pointerEvents: vortexPointerEvents,
  }}
>
```
And apply to `.sj-sticky`:
```tsx
<motion.div 
  className="sj-sticky"
  style={{
    pointerEvents: stickyPointerEvents,
  }}
>
```

#### Fix 3: Style Updates in `ScrollJourney.css`
Ensure `.sj-dissolve-layer` and `.sj-vortex-layer` allow pass-through:
```css
.sj-vortex-layer {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  pointer-events: auto;
  z-index: 1;
}

/* Ensure no residual trap */
.sj-dissolve-layer {
  pointer-events: none !important;
}
```

---

## 4. Tech Stack 3D Verification

ORIGINAL_REQUEST.md line 5 specifies:
> *"verify the Tech Stack 3D and Liquid Glass Carousel behaviors."*

### 4.1 Component Audit: `TechStackDualCarousel.tsx` & `TechStackSection.tsx`

1. **Rendering Model**:
   - `TechStackDualCarousel` renders two opposite-traveling conveyor rows using React Three Fiber (`@react-three/fiber`) and `@react-three/drei`.
   - Row 1: Frontend/Language items traveling left (`direction = -1`): React, Next.js, TypeScript, Node.js, Python, Go, Java.
   - Row 2: DevOps/Backend items traveling right (`direction = 1`): PostgreSQL, MongoDB, Redis, Docker, Kubernetes, AWS, GCP.
   - Both rows repeat seamlessly using `totalWidth = items.length * 3.5` modular arithmetic in `useFrame`.
2. **Cube Materials & Shading**:
   - Each cube features `<meshPhysicalMaterial>` with transmission (`0.9`), roughness (`0.2`), metalness (`0.8`), and clearcoat (`1`).
   - Each cube has 4 `<Text>` children rendering the tech label on front, rear, left, and right faces.
   - Wrapped in `<Float>` for subtle organic hover dynamics.
3. **Current Interaction State**:
   - Line 131 in `TechStackDualCarousel.tsx`:
     ```tsx
     <div className="w-full h-[70vh] absolute top-1/2 -translate-y-1/2 [mask-image:linear-gradient(to_right,transparent,black_15%,black_85%,transparent)] pointer-events-none">
     ```
   - The entire canvas container has `pointer-events-none`.
   - **Behavior Assessment**: The Tech Stack 3D component is currently designed as an autonomous ambient visual conveyor. It does not accept user pointer dragging or mouse hover rotation. This is intentional to prevent interference with vertical page scrolling inside the `StickySection`.
4. **Performance & GPU Assessment**:
   - Total cubes rendered: $7 \times 5 \times 2 = 70$ cubes.
   - Each cube renders 4 `<Text>` sub-meshes $= 280$ text instances.
   - Each cube uses `meshPhysicalMaterial` with transmission $= 0.9$. In WebGL, Three.js transmission creates a scene copy render target. Rendering 70 transmissive meshes per frame can cause high fill-rate overhead on mobile GPUs.
   - **Recommendation**:
     - Keep `items` repetition at 3x instead of 5x ($7 \times 3 \times 2 = 42$ cubes, saving 112 text nodes).
     - Or toggle `roughness={0.1}`, `metalness={0.9}` standard PBR without expensive refraction if mobile lag is detected.

---

## 5. Summary Matrix: Requirements R3 & R4

| Requirement | Area | Current Status | Recommended Action |
| :--- | :--- | :--- | :--- |
| **R3** | Media Centralization | Hardcoded strings in `CAROUSEL_DATA` & `PROJECT_DATA`; Hero images in `page.tsx`. | Consolidate all image & video URLs into `PORTFOLIO_MEDIA` in `lib/portfolio-data.ts`. |
| **R3** | Video Segregation | No video fields or types. | Add typed `videoUrl`, `posterUrl`, and `type: 'image' \| 'video'` to `MediaAsset`. |
| **R3** | TypeScript Typing | Zero interfaces in `portfolio-data.ts`. | Export `MediaAsset`, `JourneyItem`, `ProjectItem`, `AchievementItem`. |
| **R3** | Achievements Format | Awkward dictionary object (`itemCount: 5`, `item1`...). | Create clean array `ACHIEVEMENTS_LIST` and export typed `ACHIEVEMENTS_DATA` alias. |
| **R4** | Z-Index Stacking | `ScrollJourney` at `z-20` covers Journey at `z-10`. | Swap stacking: Journey wrapper at `z-20`, `ScrollJourney` at `z-10`. |
| **R4** | Pointer Events | `.sj-vortex-layer` has `pointer-events: auto` even when `opacity: 0`. | Use Framer Motion `useTransform` to set `pointerEvents: 'none'` when `smoothProgress >= 0.74`. |
| **R4** | Carousel Input Lock | `entry.enabled: true` locks interactions during boot/entry. | Pass `entry={{ enabled: false }}` to `LiquidGlassCarousel` in `app/page.tsx`. |
| **R4** | Tech Stack 3D | Non-interactive ambient conveyor with 70 transmissive cubes. | Document behavior; optimize repeated item count to 3x if mobile performance tuning is needed. |
