# Survey & Investigation Handoff Report: Hero Image Scaling (R1) & Vortex 4K Text Clarity (R2)

## 1. Observation

### 1.1 Hero Image Assets & Geometry
Direct inspection via OpenCV (`cv2`) of the hero image assets located in `public/images/`:
- **`public/images/base.png`**:
  - Format: JFIF JPEG, Dimensions: `2848 × 1600` px (Aspect Ratio: `1.78 : 1` / 16:9).
  - Head apex: $y = 0$ px. Face center: $x = 1464$ ($51.4\%$), $y = 523$ ($32.7\%$).
  - Edge column pixel intensity: Left $x = 0$ max = 42, mean = 4.25; Right $x = 2847$ max = 69, mean = 6.52.
- **`public/images/portrait.png`**:
  - Format: PNG, Dimensions: `1024 × 575` px (Aspect Ratio: `1.7809 : 1` / 16:9).
  - Hair apex: $y = 4$ px ($0.70\%$). Face bounding box: $x = 326$ ($31.8\%$), $y = 76$ ($13.2\%$), $w = 354$ ($34.6\%$), $h = 354$ ($61.6\%$).
  - Chin bottom: $y = 430$ px ($74.8\%$).
  - Torso & shoulders: Span $y = 430$ to $574$ px ($25.2\%$ of canvas height), width: $794$ px ($77.5\%$ of canvas width).
  - Edge column pixel intensity: Left $x = 0$ max = 4, mean = 2.41; Right $x = 1023$ max = 5, mean = 2.82.
- **`public/images/chrome.png`**:
  - Format: PNG, Dimensions: `2848 × 1600` px (Aspect Ratio: `1.7800 : 1` / 16:9).
  - Hair apex: $y = 3$ px ($0.19\%$). Face bounding box: $x = 1000$ ($35.1\%$), $y = 420$ ($26.2\%$), $w = 853$ ($30.0\%$), $h = 853$ ($53.3\%$).
  - Chin bottom: $y = 1273$ px ($79.6\%$).
  - Torso & shoulders: Span $y = 1273$ to $1600$ px ($20.4\%$ of canvas height), width: $1751$ px ($61.5\%$ of canvas width).
  - Edge column pixel intensity: Left $x = 0$ max = 8, mean = 4.90; Right $x = 2847$ max = 13, mean = 6.68.

### 1.2 Current Hero Section Implementation
In `components/Hero.tsx` lines 190–223:
```tsx
190: <div className="hero" id="hero" ref={heroRef}>
191:   <img
192:     className="layerChrome"
193:     id="imgBottom"
194:     src={baseSrc}
195:     alt=""
196:     ref={imgBottomRef}
197:     draggable={false}
198:     data-fit="cover"
199:     data-position="top"
200:   />
201:   
202:   <div className="layerBase" id="imgTop" ref={imgTopRef}>
203:     <img
204:       className={activeIdx === 0 ? "isActive" : ""}
205:       style={{ translate: "1.5% 0%", scale: "1.04", transformOrigin: "50% 0%" }}
206:       src={portraitSrc}
207:       alt={activeIdx === 0 ? "Portrait" : ""}
208:       aria-hidden={activeIdx !== 0}
209:       draggable={false}
210:       data-fit="cover"
211:       data-position="top"
212:     />
213:     <img
214:       className={activeIdx === 1 ? "isActive" : ""}
215:       style={{ translate: "0% 2%", scale: "0.85", transformOrigin: "50% 0%" }}
216:       src={chromeSrc}
217:       alt={activeIdx === 1 ? "Younger portrait" : ""}
218:       aria-hidden={activeIdx !== 1}
219:       draggable={false}
220:       data-fit="cover"
221:       data-position="top"
222:     />
223:   </div>
```

In `components/Hero.css`:
```css
24: .hero::after {
25:   content: '';
26:   position: absolute;
27:   bottom: 0;
28:   left: 0;
29:   right: 0;
30:   height: 15%;
31:   background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.4) 50%, #000 100%);
32:   z-index: 6;
33:   pointer-events: none;
34: }
...
36: .hero img {
37:   position: absolute;
38:   inset: 0;
39:   width: 100%;
40:   height: 100%;
41:   object-fit: cover;
42:   object-position: center top;
43:   pointer-events: none;
44:   user-select: none;
45:   -webkit-user-drag: none;
46:   transform-origin: center top;
47: }
```

### 1.3 Vortex Section Component & Typography
In `components/VortexAbout.tsx` lines 428–593:
- Left container (`.sj-about-container`) renders:
  - `.sj-tag-label`: `"01 // SYSTEMS ARCHITECT"`
  - `GooeyTextReveal` > `h2.sj-heading`: `"Harman Saini"`
  - `GooeyTextReveal` > `p.sj-subheading.text-cyan-400`: `"Full-Stack Systems Architect & 3D Spatial Engineer"`
  - `GooeyTextReveal` > `p.sj-paragraph`: `"Specializing in thread-safe Java microservices..."`
  - `.sj-tech-pills` > 7 pills: `"Distributed Systems"`, `"Java 21"`, `"Three.js / WebGL"`, etc.
  - `.sj-metrics-row` > 3 tags: `"<10ms Latency"`, `"120 FPS WebGL"`, `"99.99% Uptime"`
- Right container (`.sj-right-container`) renders:
  - `.sj-tag-label`: `"02 // DISCIPLINE & CAPABILITIES"`
  - `GooeyTextReveal` > `h2.sj-heading`: `"Algorithmic Precision & Spatial Computation"`
  - `GooeyTextReveal` > `p.sj-subheading.text-indigo-400`: `"Deterministic Event Streams & Concurrency"`
  - `GooeyTextReveal` > `p.sj-paragraph`: `"Engineering deterministic event streams..."`
  - `.sj-tech-pills` > 7 pills: `"Zero-Lock Concurrency"`, `"GLSL Shaders"`, etc.
  - `.sj-metrics-row` > 3 tags: `"Sub-10ms Core"`, `"Zero-Lock RAM"`, `"Raft Engine"`

In `components/VortexAbout.css`:
```css
110: .sj-heading {
111:   font-size: clamp(1.8rem, 3.2vw, 2.75rem);
112:   font-weight: 900;
113:   line-height: 1.08;
114:   letter-spacing: -0.025em;
115:   color: #ffffff;
116:   margin: 0;
117:   text-shadow: 0 2px 20px rgba(0, 0, 0, 0.9);
118: }
120: .sj-subheading {
121:   font-family: var(--font-mono, monospace);
122:   font-size: 0.78rem;
123:   font-weight: 600;
124:   letter-spacing: 0.04em;
125:   line-height: 1.4;
126: }
128: .sj-paragraph {
129:   font-size: clamp(0.78rem, 1.1vw, 0.88rem);
130:   line-height: 1.65;
131:   color: rgba(226, 232, 240, 0.88);
132:   font-weight: 400;
133: }
```
Neither `.sj-subheading`, `.sj-paragraph`, `.sj-tag-label`, `.sj-tech-pill`, nor `.sj-metric-tag` has ANY `text-shadow`. There is no backdrop blur or frosted glass panel behind `.sj-text-flow`.

### 1.4 Lingering Blur Defect in `GooeyTextReveal.tsx`
In `components/ui/GooeyTextReveal.tsx` lines 224–246 and 345–351:
```tsx
224: lineElement.style.filter = `url(#${filterId}) blur(${LINE_EDGE_BLUR}px)`; // LINE_EDGE_BLUR = 0.4
...
240: const animation: gsap.TweenVars = {
241:   filter: "blur(0em)",
242:   duration,
243:   ease,
244:   stagger,
245:   onComplete,
246: };
...
345: <filter id={filterId} x="-50%" y="-50%" width="200%" height="200%">
346:   <feColorMatrix
347:     in="SourceGraphic"
348:     type="matrix"
349:     values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 255 -140"
350:   />
351: </filter>
```
While GSAP animates the inner span (`layers`), the outer `lineElement`'s inline filter `url(#filterId) blur(0.4px)` is NEVER removed after animation completion. This permanently applies a $0.4$ px blur and alpha thresholding to all headings, subheadings, and paragraphs, disabling OS subpixel font antialiasing.

---

## 2. Logic Chain

### 2.1 Hero Image Scaling & Screen Edge Gaps (R1)
1. **Cause of Edge Gaps**: In `Hero.tsx:215`, `chromeSrc` has inline `style={{ translate: "0% 2%", scale: "0.85", transformOrigin: "50% 0%" }}`.
   Because `object-fit: cover` sizes the element to $100\%$ viewport width, multiplying by `scale: 0.85` shrinks the rendered width to $85\%$ of the viewport width.
   On a standard $1920\times 1080$ display, visual width is $1632$ px, leaving $288$ px of empty margins ($144$ px on each side).
   Furthermore, `imgBottom` (`baseSrc`) is at scale $1.0$. When the cursor moves into the outer $7.5\%$ margins, the liquid mask cuts through `layerBase`'s `#000` background and reveals the underlying `baseSrc` layer, creating an obvious clipping discontinuity.
2. **Cause of Missing Shoulders**: In `Hero.tsx:205`, `portraitSrc` has inline `style={{ translate: "1.5% 0%", scale: "1.04", transformOrigin: "50% 0%" }}`.
   Because the native asset `portrait.png` has its chin at $74.8\%$ of height, applying `scale: 1.04` pushes the chin to $77.8\%$.
   On wide laptop displays (e.g. $1920\times 920$, aspect ratio $2.08$), `object-fit: cover` causes $14.5\%$ of the image height to overflow below the viewport.
   Additionally, `.hero::after` overlays a black gradient fade across the bottom $15\%$ of the viewport.
   Combined, $14.5\% + 15\% \times (1 - 0.145) = 27.3\%$ of the bottom is obscured. Because shoulders and chest start at $74.8\%$ down, the shoulders are completely swallowed by the black fade.
3. **Resolution Strategy**:
   - Both `portraitSrc` and `chromeSrc` must be set to `scale: "1"` (100% viewport coverage). This immediately eliminates all edge gaps across all viewports.
   - Set `transformOrigin: "50% 0%"` on both portrait layers to anchor them cleanly at the top.
   - Adjust `translate` gently (e.g. `translate: "0% 0%"` or `0% 2%`) to auto-align facial centers ($49.1\% - 50.1\%$).
   - Reduce `.hero::after` height from `15%` to `9%` with a steeper gradient fade (`rgba(0,0,0,0.5) 60%, #000 100%`). This recovers the bottom $6\%$ of the viewport, bringing the shoulders and upper chest into clear view without breaking the transition into `VortexAbout`.
   - Maintain `object-fit: cover`, `object-position: center top`, and `data-fit="cover"` / `data-position="top"` across all three layers so coordinate systems match 1:1 for the liquid reveal mask.

### 2.2 Vortex Section 4K Text Clarity (R2)
1. **Eliminating the Permanent Blur**: In `GooeyTextReveal.tsx`, `lineElement.style.filter = url(#filterId) blur(0.4px)` remains active indefinitely after the reveal tween finishes.
   Updating the GSAP completion callback `onComplete` to set `layers.forEach(l => (l as HTMLElement).style.filter = "none")` and resetting the parent line filter removes the blur and alpha threshold, restoring 100% native subpixel vector font rendering.
2. **Defeating Animated Vortex Particle Bleed**:
   The WebGL Vortex background renders thousands of bright moving particles (`cyan-400`, `indigo-400`, `purple-500`) directly beneath the text.
   - Naked text with `font-weight: 400` and no shadow is overwhelmed whenever bright particles pass behind it.
   - Applying a multi-layer crisp dark text shadow (`text-shadow: 0 1px 3px rgba(0,0,0,0.95), 0 2px 8px rgba(0,0,0,0.9), 0 0 16px rgba(0,0,0,0.75)`) creates an imperceptible dark halo that isolates glyph edges against bright particles.
   - Adding a frosted glass contrast shield to `.sj-text-flow` (`background: radial-gradient(...)`, `backdrop-filter: blur(16px)`, `border: 1px solid rgba(255,255,255,0.1)`) diffuses background particles into a soft atmospheric glow while keeping foreground text razor sharp.
   - Increasing `.sj-paragraph` font weight from `400` to `450` / `500` and color to `#f8fafc` elevates luminance contrast.

---

## 3. Caveats

1. **Test Suite Constraints**:
   - `tests/challenger-hero-stress.js` explicitly tests for string literals:
     - `Hero.css` must contain `object-position: center top;` and `transform-origin: center top;`.
     - `Hero.tsx` must contain `data-fit="cover"`, `data-position="top"`, and `transformOrigin: "50% 0%"`.
   - Proposed changes MUST retain these exact CSS declarations and attributes to avoid regression in challenger stress tests.
2. **Parallax Scroll Upward Motion**:
   - During scroll into `VortexAbout`, `imgBottom` translates up by up to 60px and `imgTop` by 35px. This is normal parallax and only happens while actively scrolling down.

---

## 4. Conclusion & Actionable Proposals

### 4.1 Proposed Modifications for Requirement R1 (Hero Image Scaling)

#### File: `components/Hero.tsx` (lines 203–223)
```tsx
<<<< BEFORE:
        <img
          className={activeIdx === 0 ? "isActive" : ""}
          style={{ translate: "1.5% 0%", scale: "1.04", transformOrigin: "50% 0%" }}
          src={portraitSrc}
          alt={activeIdx === 0 ? "Portrait" : ""}
          aria-hidden={activeIdx !== 0}
          draggable={false}
          data-fit="cover"
          data-position="top"
        />
        <img
          className={activeIdx === 1 ? "isActive" : ""}
          style={{ translate: "0% 2%", scale: "0.85", transformOrigin: "50% 0%" }}
          src={chromeSrc}
          alt={activeIdx === 1 ? "Younger portrait" : ""}
          aria-hidden={activeIdx !== 1}
          draggable={false}
          data-fit="cover"
          data-position="top"
        />
==== AFTER:
        <img
          className={activeIdx === 0 ? "isActive" : ""}
          style={{ translate: "0% 0%", scale: "1", transformOrigin: "50% 0%" }}
          src={portraitSrc}
          alt={activeIdx === 0 ? "Portrait" : ""}
          aria-hidden={activeIdx !== 0}
          draggable={false}
          data-fit="cover"
          data-position="top"
        />
        <img
          className={activeIdx === 1 ? "isActive" : ""}
          style={{ translate: "0% 0%", scale: "1", transformOrigin: "50% 0%" }}
          src={chromeSrc}
          alt={activeIdx === 1 ? "Younger portrait" : ""}
          aria-hidden={activeIdx !== 1}
          draggable={false}
          data-fit="cover"
          data-position="top"
        />
>>>>
```

#### File: `components/Hero.css` (lines 24–34)
```css
<<<< BEFORE:
.hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 15%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.4) 50%, #000 100%);
  z-index: 6;
  pointer-events: none;
}
==== AFTER:
.hero::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 9%;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.5) 60%, #000 100%);
  z-index: 6;
  pointer-events: none;
}
>>>>
```

---

### 4.2 Proposed Modifications for Requirement R2 (Vortex 4K Text Clarity)

#### File: `components/ui/GooeyTextReveal.tsx` (lines 240–247)
Update GSAP `onComplete` to strip the lingering SVG blur filter:
```tsx
<<<< BEFORE:
        const animation: gsap.TweenVars = {
          filter: "blur(0em)",
          duration,
          ease,
          stagger,
          onComplete,
        };
==== AFTER:
        const animation: gsap.TweenVars = {
          filter: "blur(0em)",
          duration,
          ease,
          stagger,
          onComplete: () => {
            layers.forEach((l) => {
              const el = l as HTMLElement;
              el.style.filter = "none";
              if (el.parentElement) el.parentElement.style.filter = "none";
            });
            if (onComplete) onComplete();
          },
        };
>>>>
```

#### File: `components/VortexAbout.css` (lines 76–173)
```css
<<<< BEFORE:
.sj-text-flow {
  position: relative;
  width: 100%;
  pointer-events: auto;
  will-change: transform, opacity;
  display: flex;
  flex-direction: column;
  gap: 0.65rem;
}

.sj-tag-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.64rem;
  font-weight: 700;
  letter-spacing: 0.2em;
  color: #94a3b8;
  text-transform: uppercase;
}

.sj-heading {
  font-size: clamp(1.8rem, 3.2vw, 2.75rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 20px rgba(0, 0, 0, 0.9);
}

.sj-subheading {
  font-family: var(--font-mono, monospace);
  font-size: 0.78rem;
  font-weight: 600;
  letter-spacing: 0.04em;
  line-height: 1.4;
}

.sj-paragraph {
  font-size: clamp(0.78rem, 1.1vw, 0.88rem);
  line-height: 1.65;
  color: rgba(226, 232, 240, 0.88);
  font-weight: 400;
}

.sj-tech-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  margin-top: 0.4rem;
}

.sj-tech-pill {
  font-family: var(--font-mono, monospace);
  font-size: 0.58rem;
  font-weight: 600;
  padding: 3px 8px;
  border-radius: 9999px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  color: #e2e8f0;
  letter-spacing: 0.03em;
  backdrop-filter: blur(8px);
}

.sj-metrics-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.4rem;
}

.sj-metric-tag {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  background: rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  color: #cbd5e1;
}
==== AFTER:
.sj-text-flow {
  position: relative;
  width: 100%;
  pointer-events: auto;
  will-change: transform, opacity;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.75rem 2rem;
  border-radius: 1.25rem;
  background: radial-gradient(ellipse at 50% 40%, rgba(10, 15, 28, 0.72) 0%, rgba(3, 7, 18, 0.6) 80%, rgba(0, 0, 0, 0.35) 100%);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
}

.sj-tag-label {
  font-family: var(--font-mono, monospace);
  font-size: 0.68rem;
  font-weight: 700;
  letter-spacing: 0.22em;
  color: #cbd5e1;
  text-transform: uppercase;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.95);
  -webkit-font-smoothing: antialiased;
}

.sj-heading {
  font-size: clamp(1.8rem, 3.2vw, 2.75rem);
  font-weight: 900;
  line-height: 1.08;
  letter-spacing: -0.025em;
  color: #ffffff;
  margin: 0;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.95), 0 0 24px rgba(0, 0, 0, 0.85), 0 0 40px rgba(0, 0, 0, 0.6);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.sj-subheading {
  font-family: var(--font-mono, monospace);
  font-size: 0.82rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  line-height: 1.45;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.95), 0 0 16px rgba(0, 0, 0, 0.9);
  -webkit-font-smoothing: antialiased;
}

.sj-paragraph {
  font-size: clamp(0.82rem, 1.15vw, 0.92rem);
  line-height: 1.7;
  color: #f8fafc;
  font-weight: 450;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.95), 0 2px 8px rgba(0, 0, 0, 0.9), 0 0 16px rgba(0, 0, 0, 0.75);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
}

.sj-tech-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  margin-top: 0.45rem;
}

.sj-tech-pill {
  font-family: var(--font-mono, monospace);
  font-size: 0.62rem;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 9999px;
  background: rgba(15, 23, 42, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.16);
  color: #f1f5f9;
  letter-spacing: 0.04em;
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  -webkit-font-smoothing: antialiased;
}

.sj-metrics-row {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.45rem;
}

.sj-metric-tag {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 5px 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.75);
  border: 1px solid rgba(255, 255, 255, 0.14);
  font-family: var(--font-mono, monospace);
  font-size: 0.66rem;
  font-weight: 600;
  color: #e2e8f0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.9);
  -webkit-font-smoothing: antialiased;
}

@media (max-width: 960px) {
  .sj-text-flow {
    padding: 1.25rem 1.25rem;
  }
}
>>>>
```

---

## 5. Verification Method

1. **Static Analysis & Test Runner**:
   - Run `node tests/challenger-hero-stress.js` to verify zero regression against AST and lifecycle checks:
     ```powershell
     node tests/challenger-hero-stress.js
     ```
     Expected result: 18/18 tests pass with exit code 0.
   - Run `node tests/e2e-verify.js` to ensure feature suite integration:
     ```powershell
     node tests/e2e-verify.js
     ```
   - Run TypeScript typecheck:
     ```powershell
     npm run lint
     ```
     Expected result: 0 TypeScript errors.

2. **Hero Image Geometry & Edge Gap Verification**:
   - Verify rendered image coverage mathematically across standard and wide viewports:
     ```powershell
     python -c "
     for vw, vh in [(1920, 1080), (1920, 920), (2560, 1440), (2560, 1080), (390, 844)]:
         w_render = max(vw, vh * (2848/1600))
         h_render = max(vh, vw / (2848/1600))
         side_gap = max(0, vw - w_render)
         print(f'{vw}x{vh} => render: {w_render:.0f}x{h_render:.0f}, side_gap: {side_gap}px')
     "
     ```
     Expected output: `side_gap: 0px` across all viewports.

3. **Vortex Text Clarity Verification**:
   - Inspect that `GooeyTextReveal.tsx` removes `lineElement.style.filter` upon tween completion.
   - Inspect `.sj-text-flow` in devtools to verify `backdrop-filter: blur(16px)` and multi-layer text shadows render crisp glyph boundaries over particle trails.
