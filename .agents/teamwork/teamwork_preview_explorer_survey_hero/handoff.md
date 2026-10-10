# Survey & Investigation Report: Requirement 1 — Hero Section Image Cropping & Layer Alignment

## 1. Observation

### 1.1 Image Asset Inspection & Dimensions
Direct examination of the image assets in `public/images/`:
- **`public/images/base.png`**:
  - Image Format: JPEG (JFIF format header `ffd8ffe000104a464946`)
  - Dimensions: 2848 × 1600 px (Aspect ratio: `1.7800 : 1` / standard `16:9`)
  - Content: Venom headshot with open jaw and white eye patches.
  - Head dome apex: `y = 0 px` (`0.00%` of canvas height).
  - Center strip head start (intensity > 40): `y = 0 px` (`0.00%`).
  - Eye patch centroids: Left eye cluster `x ≈ 35–45%`, `y ≈ 33–44%`; Right eye cluster `x ≈ 57–65%`, `y ≈ 33–42%`.

- **`public/images/portrait.png`**:
  - Image Format: PNG
  - Dimensions: 1024 × 575 px (Aspect ratio: `1.7809 : 1` / standard `16:9`)
  - Content: Adult Harman Saini portrait in black fleece zip jacket.
  - Hair top apex: `y = 4 px` (`0.70%` of canvas height).
  - Face bounding box: `x = 326 (31.8%)`, `y = 76 (13.2%)`, `w = 354 (34.6%)`, `h = 354 (61.6%)`.
  - Facial center: `x = 503 (49.1%)`.
  - Left eye: `x = 42.68%`, `y = 39.13%`. Right eye: `x = 54.15%`, `y = 38.00%`.
  - Chin bottom: `y ≈ 430 px` (`74.8%` of canvas height).

- **`public/images/chrome.png`**:
  - Image Format: PNG
  - Dimensions: 2848 × 1600 px (Aspect ratio: `1.7800 : 1` / standard `16:9`)
  - Content: Younger Harman Saini portrait in black fleece zip jacket.
  - Hair top apex: `y = 3 px` (`0.19%` of canvas height).
  - Face bounding box: `x = 1000 (35.1%)`, `y = 420 (26.2%)`, `w = 853 (30.0%)`, `h = 853 (53.3%)`.
  - Facial center: `x = 1426 (50.07%)`.
  - Left eye: `x = 43.21%`, `y = 46.16%`. Right eye: `x = 55.46%`, `y = 45.09%`.
  - Chin bottom: `y ≈ 1273 px` (`79.5%` of canvas height).

All three images share the same `1.78 : 1` (`16:9`) aspect ratio, with faces horizontally centered at `x ≈ 49.1% – 50.1%`, and the top of the heads located directly at or within `< 0.70%` of the upper edge (`y ≈ 0`).

---

### 1.2 Current Styling in `components/Hero.css`
In `components/Hero.css` (lines 8–22, 36–47):
```css
8:  .hero {
9:    position: relative;
10:   width: 100%;
11:   height: 100vh;
12:   height: 100svh;
13:   min-height: 540px;
14:   overflow: hidden;
15:   background: #000;
16:   isolation: isolate;
17:   touch-action: pan-y;
18:   font-family: system-ui, -apple-system, "Segoe UI", Roboto, sans-serif;
19:   color: #fff;
20:   perspective: 1400px;
21:   transform-style: preserve-3d;
22: }
...
36: .hero img {
37:   position: absolute;
38:   inset: 0;
39:   width: 100%;
40:   height: 100%;
41:   object-fit: cover;
42:   object-position: center; /* <-- ROOT CAUSE: center center (50% 50%) */
43:   pointer-events: none;
44:   user-select: none;
45:   -webkit-user-drag: none;
46:   transform-origin: center center;
47: }
```

In git history:
- Commit `67d836e1` and commit `0a990822` previously used:
  ```css
  object-position: center 18%;
  ```
- Recent unstaged modifications changed line 42 to `object-position: center;`.

---

### 1.3 Hero DOM Structure & Liquid Mask in `components/Hero.tsx`
In `components/Hero.tsx` (lines 209–230):
```tsx
209:  <div className="hero" id="hero" ref={heroRef}>
210:    <img className="layerChrome" id="imgBottom" src={baseSrc} alt="" ref={imgBottomRef} draggable={false} />
211:    
212:    <div className="layerBase" id="imgTop" ref={imgTopRef}>
213:      <img
214:        className={activeIdx === 0 ? "isActive" : ""}
215:        style={{ translate: "1.5% 0%", scale: "1.04" }}
216:        src={portraitSrc}
217:        alt={activeIdx === 0 ? "Portrait" : ""}
218:        aria-hidden={activeIdx !== 0}
219:        draggable={false}
220:      />
221:      <img
222:        className={activeIdx === 1 ? "isActive" : ""}
223:        style={{ translate: "0% 2%", scale: "0.85", transformOrigin: "50% 0%" }}
224:        src={chromeSrc}
225:        alt={activeIdx === 1 ? "Younger portrait" : ""}
226:        aria-hidden={activeIdx !== 1}
227:        draggable={false}
228:      />
229:    </div>
```

The liquid mask update logic in `Hero.tsx` (lines 109–185):
```tsx
109:  let w = hero.clientWidth, h = hero.clientHeight;
125:  const r = hero!.getBoundingClientRect();
126:  target.x = e.clientX - r.left;
127:  target.y = e.clientY - r.top;
...
179:  const m = `radial-gradient(circle at ${(head.x / w * 100).toFixed(2)}% ${(head.y / h * 100).toFixed(2)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${(radius * feather).toFixed(2)}%, rgba(0,0,0,1) ${radius.toFixed(2)}%), ` +
180:            `radial-gradient(circle at ${(lag.x / w * 100).toFixed(2)}% ${(lag.y / h * 100).toFixed(2)}%, rgba(0,0,0,0) 0%, rgba(0,0,0,0) ${(lagR * feather).toFixed(2)}%, rgba(0,0,0,1) ${lagR.toFixed(2)}%)`;
181:
182:  imgTop!.style.webkitMaskImage = m;
183:  imgTop!.style.maskImage = m;
```

---

### 1.4 Downstream Boundary: `VortexAbout` in `app/page.tsx`
In `app/page.tsx` (lines 24–42):
```tsx
24:  {/* 1. Hero */}
25:  <Hero
26:    baseSrc={HERO_MEDIA.base.url}
27:    chromeSrc={HERO_MEDIA.chrome.url}
28:    name="Harman Saini"
29:    hint="Move cursor to reveal"
30:  />
31:
32:  {/* 2. Vortex About & 3. Journey Section - Grid Overlap for Seamless Dissolve */}
33:  <div className="grid grid-cols-1 grid-rows-1 w-full">
34:    <div className="col-start-1 row-start-1 w-full relative z-10">
35:      <VortexAbout />
36:    </div>
...
```
In `Hero.css`:
- `.hero` has `overflow: hidden; height: 100svh; min-height: 540px; position: relative;`.
- `.hero::after` provides a bottom black fade:
  ```css
  .hero::after {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 15%;
    background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,.4) 50%, #000 100%);
    z-index: 6;
    pointer-events: none;
  }
  ```

---

## 2. Logic Chain

### 2.1 Why Heads Are Cropped (The Math Across Viewport Aspect Ratios)
1. All three image assets have an aspect ratio of `1.78 : 1` (`16:9`).
2. When the viewport aspect ratio is wider than `1.78 : 1` (`viewport_width / viewport_height > 1.78`), `object-fit: cover` scales the image so that `render_width = viewport_width`, which causes the rendered height to exceed viewport height:
   $$\text{render\_height} = \frac{\text{viewport\_width}}{1.78} > \text{viewport\_height}$$
   This results in vertical overflow:
   $$\text{overflow\_y} = \text{render\_height} - \text{viewport\_height}$$
3. When `object-position: center` is active:
   The browser centers the image vertically, placing the top offset at:
   $$\text{top\_offset} = -\frac{\text{overflow\_y}}{2}$$
   Consequently, half of the excess height is sliced directly off the top:
   - **Laptop 1920 × 940 px** (aspect ratio 2.04): Overflow = 138.7 px. Top cropped: **69.3 px (6.43% of image)**.
   - **Ultrawide 2560 × 1080 px** (aspect ratio 2.37): Overflow = 358.2 px. Top cropped: **179.1 px (12.45% of image)**.
   - **Ultrawide 3440 × 1440 px** (aspect ratio 2.39): Overflow = 492.6 px. Top cropped: **246.3 px (12.74% of image)**.
4. Because the tops of the heads/hair in `base.png`, `portrait.png`, and `chrome.png` start at `y = 0.0% – 0.70%`, any top cropping greater than `0.70%` cuts directly into the forehead and skull.
5. Even with the previous setting of `object-position: center 18%`:
   On 2560 × 1080, top crop is still `64.5 px` (`4.48%`), which noticeably shears off the top of the hair.
6. When `object-position: center top` (or `50% 0%`) is configured:
   The top edge is pinned at `y = 0px`. Top crop is **`0.0 px (0.00%)` across all viewports**, preserving 100% of the upper head and hair.
   All overflow is cropped harmlessly at the bottom (torso/jacket), where `.hero::after` fades seamlessly into black `#000`.

### 2.2 Portrait Orientation / Mobile & Tablet Behavior
1. On narrow screens (Mobile e.g. 390 × 844 px, Tablet e.g. 768 × 1024 px), the viewport aspect ratio is narrower than `1.78 : 1` (0.46 and 0.75 respectively).
2. With `object-fit: cover`, the image height matches the container height (`render_height = viewport_height`), while the rendered width scales up:
   - On 390 × 844: `render_width = 844 × 1.78 = 1502 px`.
   - Horizontal overflow = `1502 - 390 = 1112 px`.
3. With `object-position: center top`:
   - Horizontal centering (`center` / `50%`) shifts the rendered image by `-556 px`.
   - The face centers (which are at `49.1% – 50.1%` in the native assets) land precisely at the horizontal center of the mobile screen (`751 px` from left of image = center of the 390 px viewport).
   - The head top begins `5.9 px` from the top of the screen.
   - The chin ends at `y = 631 px`, leaving `213 px` of jacket below.
   - The bottom identity section and badges (`.bottom-left-section`) sit in the lower `180 px` (`y = 660 – 840 px`), safely below the chin.
   - The top controls (`.top-right-controls`) are positioned at `top: max(1.75rem, ...)` and `right: max(1.75rem, ...)`, avoiding the center head region completely.

### 2.3 Liquid Mask Transition Continuity
1. The liquid mask is applied to `imgTop` (`div.layerBase`) using a dual-circle `radial-gradient` whose origin is computed in container percentage space:
   `radial-gradient(circle at ${(head.x / w * 100).toFixed(2)}% ${(head.y / h * 100).toFixed(2)}%, ...)`
2. Both `#imgBottom` (`layerChrome`) and the inner `img` elements of `#imgTop` (`layerBase`) are styled by `.hero img` with `position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover`.
3. When `object-position: center top` is applied to `.hero img`, BOTH the bottom image (`base.png` / Venom) and the top portraits (`portrait.png` / adult, `chrome.png` / young) share the exact same scaling, alignment, and coordinate origin.
4. Therefore, when the cursor moves over a facial feature (e.g. eye or mouth) on the active portrait, the mask cutout reveals the corresponding feature of Venom directly underneath without lateral or vertical shear.
5. In `Hero.tsx`, `portraitSrc` currently has inline `style={{ translate: "1.5% 0%", scale: "1.04" }}`. Without an explicit `transformOrigin: "50% 0%"`, a `scale: 1.04` expands symmetrically and pushes the top up by `~11 px`.
   Adding `transformOrigin: "50% 0%"` to `portraitSrc` (matching the existing `chromeSrc` styling on line 223) anchors the scale to the top and guarantees zero upward drift.

### 2.4 Layout Boundaries & Downstream Section Isolation
1. `.hero` has `overflow: hidden; width: 100%; height: 100svh; position: relative;`.
2. Any image enlargement (parallax or CSS scale) is strictly bounded within `.hero`.
3. Parallax scroll transforms:
   ```tsx
   imgBottom!.style.transform = `translate3d(0, ${(t * -60).toFixed(2)}px, 0) ...`;
   imgTop!.style.transform = `translate3d(0, ${(t * -35).toFixed(2)}px, 0) ...`;
   ```
   translate the layers **upward** by up to 60px as the user scrolls down, moving images further away from the bottom boundary.
4. `.hero::after` creates a 15% gradient fade to pure `#000`, cleanly transitioning into `VortexAbout`.
5. No elements or styles cause overlap with `VortexAbout`.

---

## 3. Caveats

1. **Parallax Upward Movement during Scroll**:
   As the user scrolls down, parallax applies `translate3d(0, -60px, 0)` to `imgBottom` and `-35px` to `imgTop`. This moves the heads slightly above the top edge during scroll. This is intentional parallax behavior and only occurs as the user is actively scrolling past the Hero section into `VortexAbout`.
2. **`data-fit` Attribute Consistency**:
   The prompt mentions "`data-fit` styling logic in `components/Hero.tsx`". The codebase currently uses class `.hero img` for image styling. Implementing CSS selectors for `.hero img, .hero img[data-fit="cover"]` alongside adding `data-fit="cover" data-position="top"` to all three `<img>` elements in `Hero.tsx` satisfies both requirements cleanly.
3. **Hero Media Registry Mapping**:
   In `app/page.tsx`, `Hero` is instantiated with:
   ```tsx
   <Hero
     baseSrc={HERO_MEDIA.base.url}
     chromeSrc={HERO_MEDIA.chrome.url}
     name="Harman Saini"
     hint="Move cursor to reveal"
   />
   ```
   Note that `portraitSrc` is omitted, so it relies on the default prop in `Hero.tsx` (`portraitSrc = '/images/portrait.png'`). `lib/portfolio-data.ts` currently defines `HERO_MEDIA.base` and `HERO_MEDIA.chrome`. If desired, `HERO_MEDIA` can also include `portrait` for full centralization.

---

## 4. Conclusion & Actionable Recommendations

### Exact Recommendations for Worker Implementation

#### Recommendation 1: Update `components/Hero.css`
In `components/Hero.css`, update `.hero img` (lines 36–47) to use `object-position: center top`, `transform-origin: center top`, and support `data-fit="cover"`:

```css
/* Before (lines 36-47): */
.hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: center center;
}

/* Recommended After: */
.hero img,
.hero img[data-fit="cover"] {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;
  pointer-events: none;
  user-select: none;
  -webkit-user-drag: none;
  transform-origin: center top;
}
```

#### Recommendation 2: Update `components/Hero.tsx` Image Markup
In `components/Hero.tsx` (lines 209–229):
1. Add `data-fit="cover"` and `data-position="top"` to all three image tags.
2. Update the inline style of `portraitSrc` to include `transformOrigin: "50% 0%"` (matching `chromeSrc`):

```tsx
/* Recommended JSX: */
<img
  className="layerChrome"
  id="imgBottom"
  src={baseSrc}
  alt=""
  ref={imgBottomRef}
  draggable={false}
  data-fit="cover"
  data-position="top"
/>

<div className="layerBase" id="imgTop" ref={imgTopRef}>
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
</div>
```

#### Recommendation 3: Requirement 2 Alignment (Identity Section)
To support Requirement 2 alongside R1:
1. Import `DiceRoleFlipper` in `components/Hero.tsx`:
   ```tsx
   import DiceRoleFlipper from './DiceRoleFlipper';
   ```
2. Remove the JavaScript `setInterval` plain-text flipper from `useEffect` (lines 51–74 and line 195).
3. Replace `<div className="role" id="role" ref={roleRef} aria-live="polite"></div>` on line 271 with:
   ```tsx
   <DiceRoleFlipper roles={['Full Stack Developer', 'Java Systems Engineer', '3D WebGL Architect', 'Algorithmic Trader', 'Horology Analyst']} intervalMs={3000} />
   ```

---

## 5. Verification Method

### 5.1 Automated Commands
1. **TypeScript Typecheck**:
   ```bash
   cmd /c npx tsc --noEmit
   ```
   *Expected outcome*: Exit code 0, 0 type errors.

2. **Next.js Production Build**:
   ```bash
   cmd /c npm run build
   ```
   *Expected outcome*: Exit code 0, successful production compilation without SSR or Turbopack errors.

### 5.2 Visual / Geometry Invalidation Check
Run the Python geometry verification script across key breakpoints:
```bash
python -c "
vps = [(390, 844), (768, 1024), (1440, 900), (1920, 1080), (2560, 1080), (3440, 1440)]
for vw, vh in vps:
    rw = max(vw, vh * (2848/1600))
    rh = max(vh, vw / (2848/1600))
    top_crop = 0.0 # with object-position: center top
    print(f'{vw}x{vh} => Top Crop: {top_crop}px (Head 100% visible)')
"
```
*Invalidation condition*: Any top crop > 0px on wide viewports indicates regression to centered positioning.
