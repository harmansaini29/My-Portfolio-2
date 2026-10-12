# Handoff Report: Survey Investigation for Requirements R3 & R4

## 1. Observation

### R3: Direct Vortex Dissolve Unification & Info Border Removal
- **File**: `components/VortexAbout.tsx`
  - **Lines 17–152**: Standalone GLSL shaders `coverVertexShader` and `coverFragmentShader` define a Sobel filter (`mat3 sobelX`, `mat3 sobelY`), 5-octave FBM noise, block pixelation, sparkle, and edge glow.
  - **Lines 157–208**: Helper function `createProceduralVortexTexture()` dynamically allocates an offscreen 1024x1024 2D `<canvas>` element and simulates a procedural 2D vortex fallback with 120 spiral strands (`ctx.stroke()`).
  - **Lines 214–293**: `DissolveScene` is a secondary Three.js scene mounted inside an R3F `<Canvas>` (Lines 599–617). Inside `useFrame`, lines 251–259 attempt to sample the primary live vortex canvas via DOM lookup:
    ```typescript
    const vCanvas = document.querySelector(".vortex-webgl-canvas") as HTMLCanvasElement;
    if (vCanvas && vCanvas.width > 0) {
      const tex = new THREE.CanvasTexture(vCanvas);
      liveTexRef.current = tex;
    }
    ```
    On line 262, `liveTexRef.current.needsUpdate = true` forces a CPU-to-GPU texture upload of the entire canvas on every frame. If `liveTexRef.current` is not yet available, line 267 falls back to `update(time)` rendering the procedural 2D canvas texture.
  - **Lines 353–357**: The live `<Vortex>` layer's opacity is hard-clipped to zero at progress 0.741:
    ```typescript
    const vortexOpacity = useTransform(
      smoothProgress,
      [0.0, 0.15, 0.74, 0.741],
      [0.6, 1.0, 1.0, 0.0]
    );
    ```
  - **Lines 394–395**: The dissolve overlay's opacity abruptly switches to 1 at progress 0.741:
    ```typescript
    const dissolveLayerOpacity = useTransform(smoothProgress, [0.74, 0.741, 0.99, 1.0], [0, 1, 1, 0]);
    ```
  - **Lines 599–617**: Layer 4 mounts a completely independent WebGL context `<Canvas dpr={1} frameloop={isDissolving ? "always" : "never"} ...>` over Layer 1 `<Vortex>`.
- **File**: `components/VortexAbout.css`
  - **Lines 76–92**: `.sj-text-flow` has explicit card borders, dark gradient card backgrounds, and inset rim highlights:
    ```css
    .sj-text-flow {
      ...
      padding: 1.75rem 2rem;
      border-radius: 1.25rem;
      background: radial-gradient(ellipse at 50% 40%, rgba(10, 15, 28, 0.72) 0%, rgba(3, 7, 18, 0.6) 80%, rgba(0, 0, 0, 0.35) 100%);
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 16px 40px rgba(0, 0, 0, 0.7), inset 0 1px 0 rgba(255, 255, 255, 0.12);
      backdrop-filter: blur(16px);
      -webkit-backdrop-filter: blur(16px);
    }
    ```
  - **Lines 158–174**: `.sj-tech-pill` has `border: 1px solid rgba(255, 255, 255, 0.16);` and `background: rgba(15, 23, 42, 0.75);`.
  - **Lines 181–198**: `.sj-metric-tag` has `border: 1px solid rgba(255, 255, 255, 0.14);` and `background: rgba(0, 0, 0, 0.75);`.

---

### R4: Rectangular Projects Container & Curvy Monoline Running Light Border
- **File**: `components/ChromiumBorderContainer.tsx`
  - **Line 20**: The outer container restricts layout to a square with hard limits:
    ```typescript
    className={`relative w-[94vw] max-w-6xl aspect-square max-h-[min(70vh,640px)] max-w-[min(94vw,70vh,640px)] mx-auto rounded-3xl p-2 sm:p-3 transition-all duration-500 border-2 border-amber-100/40 bg-black/50 shadow-[0_0_30px_rgba(253,230,138,0.15)] ${className}`}
    ```
  - **Lines 28–35**: Layer 2 creates a border gutter with rotating conic beam `animate-chromium-beam` within the outer padding `p-2 sm:p-3`.
  - **Line 38**: Layer 3 (Inner Obsidian Chamber) defines a second border `border-2 border-amber-100/40`, generating an obvious double-line border effect alongside the outer shell border:
    ```typescript
    <div className="relative w-full h-full rounded-[calc(1.5rem-8px)] sm:rounded-[calc(1.5rem-12px)] bg-black/90 backdrop-blur-2xl overflow-hidden z-10 border-2 border-amber-100/40 shadow-[inset_0_1.5px_1px_rgba(255,255,255,0.45),inset_0_-1.5px_1px_rgba(0,0,0,0.9),inset_0_0_35px_rgba(0,0,0,0.85)]">
    ```
  - **Lines 48–52**: Precision machined mechanical corner brackets are drawn with 4 absolute corner divs (`border-t-2 border-l-2`, `border-t-2 border-r-2`, `border-b-2 border-l-2`, `border-b-2 border-r-2`).
- **File**: `components/ProjectsSection.tsx`
  - **Line 19**: `<section className="relative w-full h-full max-h-screen bg-transparent py-3 sm:py-5 flex flex-col justify-center items-center overflow-hidden">`
  - **Lines 53–89**: The project info overlay (`bg-black/75 backdrop-blur-xl border border-white/10`) sits at `bottom-0 left-0 right-0`. In the 640px square container, this overlay covers the bottom tiles of the 8x8 `MosaicFlip` grid, compressing descriptions and tags.
  - **Lines 91–138**: GitHub and Live Link buttons sit on the right side (`absolute right-2 sm:right-4 top-1/2 -translate-y-1/2`), conflicting with the compact square bounds.
- **File**: `components/StickySection.tsx`
  - Lines 36–42 provide a sticky container with `top: 0, height: '100vh', overflow: 'hidden'`.

---

## 2. Logic Chain

### R3 Logic Chain:
1. **Root Cause of Vortex Dissolve Flicker**:
   - The current setup runs two concurrent WebGL contexts (`WebGLRenderer` in `Vortex.tsx` and R3F `Canvas` in `VortexAbout.tsx`).
   - At scroll progress 0.74, `vortexOpacity` drops to 0 while `dissolveLayerOpacity` jumps to 1.
   - The secondary canvas tries to upload `.vortex-webgl-canvas` via `THREE.CanvasTexture.needsUpdate = true`. Because DOM canvas texture upload is asynchronous and GPU-CPU bound, it either stutters or falls back to `createProceduralVortexTexture()` (a 2D canvas of 120 spiral strands that looks completely different from the live 3D vortex).
   - This causes an unmistakable jump/flicker at the threshold.
2. **Unified Direct Dissolve Solution**:
   - Move the GLSL Sobel/FBM noise dissolve shader directly into the primary live `Vortex.tsx` rendering loop using an offscreen `THREE.WebGLRenderTarget`.
   - When `dissolveProgress <= 0.001`, `renderer.render(scene, camera)` executes directly with zero overhead.
   - When `dissolveProgress > 0`, `renderer.setRenderTarget(renderTarget)` renders the live 3D scene into the GPU target texture, and then renders a full-screen orthographic quad with the Sobel/FBM shader directly to the primary canvas.
   - The GPU target texture stays entirely in VRAM (zero CPU-GPU upload latency). The live vortex particles, strands, and comets dissolve continuously on the live canvas without any secondary canvas or procedural fallback.
   - In `VortexAbout.tsx`, delete the secondary R3F `<Canvas>`, delete `createProceduralVortexTexture`, and pass `dissolveProgress` directly to `<Vortex>`. Keep `vortexOpacity` at 1.0 throughout the dissolve (only fading after completion at 0.98–1.0).
3. **Info Border Removal Solution**:
   - In `components/VortexAbout.css`, remove `border: 1px solid rgba(255, 255, 255, 0.1);` and `inset 0 1px 0 rgba(255, 255, 255, 0.12)` from `.sj-text-flow`.
   - Replace the dark opaque gradient with `background: transparent;` or an atmospheric radial scrim (`background: radial-gradient(ellipse at center, rgba(3, 7, 18, 0.4) 0%, rgba(0, 0, 0, 0) 80%);`).
   - Soften `.sj-tech-pill` and `.sj-metric-tag` borders into subtle translucent capsules so text floats cleanly in space without visible box outlines.

### R4 Logic Chain:
1. **Aspect Ratio & Layout Transition**:
   - In `ChromiumBorderContainer.tsx`, remove `aspect-square`, `max-w-[min(94vw,70vh,640px)]`, and `max-h-[min(70vh,640px)]`.
   - Replace with a responsive rectangular layout: `w-[94vw] max-w-5xl h-[65vh] md:h-[72vh] min-h-[480px] max-h-[700px] aspect-[16/10]`.
   - Inside `100vh` sticky container (`StickySection`), the header (~70px) + rectangular container (~500–650px) + margins fit naturally with zero clipping.
   - In `MosaicFlip.tsx`, tile dimensions are computed via `Math.min(width / columns, height / rows)`. In a rectangular container (width > height), the 8x8 grid centers gracefully, while the wider width provides ample space for the right-side GitHub/Live buttons and bottom project card overlay (`mr-16` prevent any button overlap).
2. **Curvy Monoline Running Light Border**:
   - Remove the double border: drop the outer `border-2 border-amber-100/40`, drop the padding gap `p-2 sm:p-3`, and drop the inner `border-2 border-amber-100/40`.
   - Remove the 4 mechanical corner bracket divs.
   - Implement a curvy single-line border using either:
     - **Option A (Recommended SVG Monoline Beam)**: An SVG `<rect>` with `rx="24"`, subtle baseline stroke `rgba(255,255,255,0.12)`, and an orbiting photonic beam `<rect>` with `pathLength="100"`, `strokeDasharray="20 80"`, a cyan-to-amber gradient, and continuous `stroke-dashoffset` keyframe animation.
     - **Option B (CSS Monoline Conic Beam)**: A single `1.5px` border layer (`rounded-3xl p-[1.5px] overflow-hidden`) with a rotating conic gradient beam (`cyan` -> `white` -> `amber`) and the inner chamber fitted directly with `rounded-[calc(1.5rem-1.5px)] bg-black/90`.
   - Both options deliver a single continuous curvy border with zero mechanical clutter and a continuous cyan/amber beam orbiting smoothly along the perimeter.

---

## 3. Caveats
1. **WebGLRenderTarget Cleanup**: In `Vortex.tsx`, when resizing or disposing of the vortex instance, the `WebGLRenderTarget` and post-processing materials must be properly disposed of to prevent WebGL memory leaks.
2. **MotionValue Binding**: In `VortexAbout.tsx`, passing Framer Motion's `dissolveNormalized` MotionValue to `Vortex` should be handled without triggering React re-renders on every scroll pixel (read via `get()` in `useFrame`/`requestAnimationFrame` or via `on("change", ...)` listener).
3. **Mobile Height Safeguards**: On small mobile devices (screen height < 700px), `h-[65vh]` ensures the rectangular container leaves sufficient room for the header and does not push content off-screen.

---

## 4. Conclusion & Concrete Code Proposals for Worker

### Proposal 1: Unified Direct Dissolve in `components/Vortex.tsx`

Add `dissolveProgress?: number | any` to `VortexProps` and `VortexConfig`.
In `createVortex` in `components/Vortex.tsx`:
```typescript
// Shader definition inside Vortex.tsx (or imported)
const coverVertexShader = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;

const coverFragmentShader = /* glsl */ `
  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform float uDissolve;
  uniform vec2 uCenter;
  uniform float uTime;
  uniform float uGrayscale;
  uniform float uEdgeIntensity;
  uniform float uEdgeBrightness;
  varying vec2 vUv;

  mat3 sobelX = mat3(-1.0, 0.0, 1.0, -2.0, 0.0, 2.0, -1.0, 0.0, 1.0);
  mat3 sobelY = mat3(-1.0, -2.0, -1.0, 0.0, 0.0, 0.0, 1.0, 2.0, 1.0);

  float getLuminance(vec3 color) {
    return dot(color, vec3(0.299, 0.587, 0.114));
  }

  float sobel(sampler2D tex, vec2 uv, vec2 texelSize) {
    float gx = 0.0;
    float gy = 0.0;
    for (int i = -1; i <= 1; i++) {
      for (int j = -1; j <= 1; j++) {
        vec2 offset = vec2(float(i), float(j)) * texelSize;
        float lum = getLuminance(texture2D(tex, uv + offset).rgb);
        gx += lum * sobelX[i + 1][j + 1];
        gy += lum * sobelY[i + 1][j + 1];
      }
    }
    return sqrt(gx * gx + gy * gy);
  }

  float hash(vec2 p) {
    return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    f = f * f * (3.0 - 2.0 * f);
    float a = hash(i);
    float b = hash(i + vec2(1.0, 0.0));
    float c = hash(i + vec2(0.0, 1.0));
    float d = hash(i + vec2(1.0, 1.0));
    return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
  }

  float fbm(vec2 p) {
    float value = 0.0;
    float amplitude = 0.5;
    float frequency = 1.0;
    for (int i = 0; i < 5; i++) {
      value += amplitude * noise(p * frequency);
      amplitude *= 0.5;
      frequency *= 2.0;
    }
    return value;
  }

  void main() {
    vec2 uv = vUv;
    vec4 texColor = texture2D(uTexture, uv);
    float gray = getLuminance(texColor.rgb);
    texColor.rgb = mix(texColor.rgb, vec3(gray), uGrayscale);

    vec2 centeredUv = vUv - uCenter;
    float aspect = uResolution.x / max(uResolution.y, 1.0);
    centeredUv.x *= aspect;
    float dist = length(centeredUv);
    float angle = atan(centeredUv.y, centeredUv.x);

    float noiseScale = 6.0;
    vec2 pixelatedUv = floor(vUv * uResolution / noiseScale) * noiseScale / uResolution;
    float blockNoise = fbm(pixelatedUv * 100.0) * 0.15;
    float angularNoise = fbm(vec2(angle * 5.0, 0.0)) * 0.15;
    float totalNoise = blockNoise + angularNoise;
    float noisyDist = dist + totalNoise;

    float maxDist = length(vec2(aspect * 0.5, 0.5));
    float normalizedDist = noisyDist / maxDist;
    float dissolveThreshold = uDissolve * 1.5;

    vec2 texelSize = 1.0 / uResolution;
    float edge = clamp(pow(sobel(uTexture, uv, texelSize), 0.7) * 2.0, 0.0, 1.0);
    float dissolveMask = smoothstep(dissolveThreshold - 0.03, dissolveThreshold, normalizedDist);

    vec3 edgeColor = vec3(1.0, 1.0, 1.0);
    vec3 baseColor = mix(texColor.rgb, vec3(0.0), uGrayscale);
    vec3 finalColor = baseColor;

    float edgeGlow = edge * (uEdgeIntensity * 2.0) * (1.0 + uGrayscale * 3.0);
    finalColor += edgeColor * edgeGlow * uEdgeBrightness;

    float edgeZoneWidth = 0.15 * (1.0 - uDissolve) + 0.02;
    float edgeZone = smoothstep(dissolveThreshold - edgeZoneWidth, dissolveThreshold - edgeZoneWidth + 0.04, normalizedDist) *
                     smoothstep(dissolveThreshold + 0.02, dissolveThreshold - 0.02, normalizedDist);
    float sparkle = hash(floor(vUv * uResolution / 4.0)) * edgeZone;
    finalColor += vec3(sparkle * 3.0 * (1.0 - uDissolve) * uEdgeBrightness * (1.0 + uGrayscale * 2.0));

    gl_FragColor = vec4(finalColor, dissolveMask * texColor.a);
  }
`;
```

In `createVortex` initialization:
```typescript
let renderTarget: THREE.WebGLRenderTarget | null = null;
const postScene = new THREE.Scene();
const postCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

const dissolveUniforms = {
  uTexture: { value: null as THREE.Texture | null },
  uResolution: { value: new THREE.Vector2(1, 1) },
  uDissolve: { value: 0 },
  uCenter: { value: new THREE.Vector2(0.5, 0.5) },
  uTime: { value: 0 },
  uGrayscale: { value: 0 },
  uEdgeIntensity: { value: 0 },
  uEdgeBrightness: { value: 1.0 },
};

const postMat = track(new THREE.ShaderMaterial({
  vertexShader: coverVertexShader,
  fragmentShader: coverFragmentShader,
  uniforms: dissolveUniforms,
  transparent: true,
}));

const postQuad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), postMat);
postScene.add(postQuad);
```

In `step(now)` rendering call:
```typescript
const dProgress = typeof cfg.dissolveProgress === "object" && cfg.dissolveProgress?.get
  ? cfg.dissolveProgress.get()
  : Number(cfg.dissolveProgress || 0);

if (dProgress <= 0.001) {
  renderer.setRenderTarget(null);
  renderer.render(scene, camera);
} else {
  const w = container.clientWidth || 1;
  const h = container.clientHeight || 1;
  const dpr = renderer.getPixelRatio();
  const tw = Math.floor(w * dpr);
  const th = Math.floor(h * dpr);

  if (!renderTarget || renderTarget.width !== tw || renderTarget.height !== th) {
    renderTarget?.dispose();
    renderTarget = new THREE.WebGLRenderTarget(tw, th, {
      minFilter: THREE.LinearFilter,
      magFilter: THREE.LinearFilter,
      format: THREE.RGBAFormat,
    });
  }

  renderer.setRenderTarget(renderTarget);
  renderer.clear();
  renderer.render(scene, camera);

  renderer.setRenderTarget(null);
  dissolveUniforms.uTexture.value = renderTarget.texture;
  dissolveUniforms.uResolution.value.set(tw, th);
  dissolveUniforms.uDissolve.value = Math.min(1.0, Math.max(0.0, dProgress));
  dissolveUniforms.uTime.value = t;
  dissolveUniforms.uGrayscale.value = Math.min(1.0, dProgress / 0.45);
  dissolveUniforms.uEdgeIntensity.value = dProgress * 0.8;
  dissolveUniforms.uEdgeBrightness.value = 1.0 - dProgress * 0.4;

  renderer.render(postScene, postCamera);
}
```

---

### Proposal 2: Refactor `components/VortexAbout.tsx` & `VortexAbout.css`
1. In `VortexAbout.tsx`:
   - Delete imports: `@react-three/fiber` (`Canvas`, `useFrame`, `useThree`) and `@react-three/drei` (`OrthographicCamera`).
   - Remove `createProceduralVortexTexture`, `coverVertexShader`, `coverFragmentShader`, `DissolveScene`.
   - Remove `<motion.div className="sj-dissolve-layer">` and its nested `<Canvas>`.
   - Pass `dissolveProgress={dissolveNormalized}` directly into `<Vortex ... />`.
   - Update `vortexOpacity` so it does not drop at 0.74:
     ```typescript
     const vortexOpacity = useTransform(
       smoothProgress,
       [0.0, 0.15, 0.98, 1.0],
       [0.6, 1.0, 1.0, 0.0]
     );
     ```
2. In `components/VortexAbout.css`:
   - Remove harsh borders and dark box background from `.sj-text-flow`:
     ```css
     .sj-text-flow {
       position: relative;
       width: 100%;
       pointer-events: auto;
       will-change: transform, opacity;
       display: flex;
       flex-direction: column;
       gap: 0.75rem;
       padding: 1.25rem 1.5rem;
       border-radius: 1.25rem;
       background: radial-gradient(ellipse at center, rgba(3, 7, 18, 0.4) 0%, rgba(0, 0, 0, 0) 80%);
       border: none;
       box-shadow: none;
       backdrop-filter: blur(8px);
       -webkit-backdrop-filter: blur(8px);
     }

     .sj-tech-pill {
       ...
       background: rgba(255, 255, 255, 0.05);
       border: 1px solid rgba(255, 255, 255, 0.08);
       ...
     }

     .sj-metric-tag {
       ...
       background: rgba(255, 255, 255, 0.04);
       border: 1px solid rgba(255, 255, 255, 0.08);
       ...
     }
     ```

---

### Proposal 3: Refactor `components/ChromiumBorderContainer.tsx`
Replace double borders, mechanical corner brackets, and rigid square styling with a rectangular container and curvy monoline running light border:

```tsx
'use client';

import React from 'react';

interface ChromiumBorderContainerProps {
  children: React.ReactNode;
  activeProjectIndex?: number;
  totalProjects?: number;
  className?: string;
}

export default function ChromiumBorderContainer({
  children,
  activeProjectIndex = 0,
  totalProjects = 10,
  className = '',
}: ChromiumBorderContainerProps) {
  return (
    <div
      className={`relative w-[94vw] max-w-5xl h-[65vh] md:h-[72vh] min-h-[480px] max-h-[700px] aspect-[16/10] mx-auto rounded-3xl transition-all duration-500 shadow-[0_0_50px_rgba(0,0,0,0.85)] ${className}`}
    >
      {/* 1. Ambient Rim Halo / Backlight Radiance */}
      <div
        className="absolute -inset-1.5 rounded-3xl bg-gradient-to-r from-cyan-500/20 via-amber-300/15 to-cyan-500/20 blur-xl pointer-events-none animate-chromium-halo"
        aria-hidden="true"
      />

      {/* 2. Sleek Single-Line Curvy Border & Photonic Running Light Beam */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible rounded-3xl"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <linearGradient id="photonicOrbitBeam" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0" />
            <stop offset="25%" stopColor="#06b6d4" stopOpacity="0.85" />
            <stop offset="50%" stopColor="#ffffff" stopOpacity="1" />
            <stop offset="75%" stopColor="#fbbf24" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* Base Monoline Bezel Rim */}
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="24"
          ry="24"
          stroke="rgba(255, 255, 255, 0.12)"
          strokeWidth="1.5"
        />

        {/* Orbiting Cyan & Amber Photonic Running Light Beam */}
        <rect
          x="1"
          y="1"
          width="calc(100% - 2px)"
          height="calc(100% - 2px)"
          rx="24"
          ry="24"
          stroke="url(#photonicOrbitBeam)"
          strokeWidth="2"
          strokeLinecap="round"
          pathLength="100"
          strokeDasharray="22 78"
          className="animate-photonic-beam"
        />
      </svg>

      {/* 3. Obsidian Chamber Housing MosaicFlip */}
      <div className="relative w-full h-full rounded-3xl bg-black/90 backdrop-blur-2xl overflow-hidden z-10">
        {children}

        {/* Specular Diagonal Sheen Sweep */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
          <div className="w-1/2 h-full bg-gradient-to-r from-transparent via-cyan-100/10 to-transparent animate-specular-sheen" />
        </div>
      </div>

      {/* 4. Sleek Telemetry HUD Headers */}
      <div className="absolute top-3.5 left-5 pointer-events-none z-30 flex items-center gap-2 font-mono text-[0.62rem] tracking-widest text-cyan-300 uppercase">
        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
        <span className="hidden sm:inline">SYS // PHOTONIC-RESONANCE</span>
        <span className="sm:hidden">SYS // 01</span>
      </div>

      <div className="absolute top-3.5 right-5 pointer-events-none z-30 font-mono text-[0.62rem] tracking-widest text-amber-200/90 uppercase">
        <span>
          PROJECT [{String(activeProjectIndex + 1).padStart(2, '0')}&thinsp;/&thinsp;{String(totalProjects).padStart(2, '0')}]
        </span>
      </div>
    </div>
  );
}
```

In `app/globals.css`:
```css
@keyframes photonicBeamOrbit {
  0% {
    stroke-dashoffset: 100;
  }
  100% {
    stroke-dashoffset: 0;
  }
}

.animate-photonic-beam {
  animation: photonicBeamOrbit 7s linear infinite;
  filter: drop-shadow(0 0 6px rgba(6, 182, 212, 0.8)) drop-shadow(0 0 12px rgba(245, 158, 11, 0.6));
  will-change: stroke-dashoffset;
}
```

---

## 5. Verification Method

1. **Typecheck & Build**:
   ```bash
   cmd /c "npx tsc --noEmit"
   cmd /c "npm run build"
   ```
   Must compile with 0 TypeScript and React errors.
2. **Visual & Interaction Check**:
   - Scroll slowly from Hero into Vortex About.
   - At scroll progress 0.74, verify that the vortex does not jump, blink, or switch to a 2D procedural canvas. The live 3D strands and comets must smoothly dissolve in place on the primary canvas.
   - Inspect `.sj-text-flow` informational text: verify the absence of dark card borders or white outline boxes; text must float cleanly over the 3D WebGL background.
   - Inspect Projects section: verify rectangular aspect ratio (`w-[94vw] max-w-5xl h-[65vh] md:h-[72vh]`). Mosaic tiles and bottom info overlay must never collide or be truncated.
   - Inspect container perimeter: verify the removal of mechanical brackets and double borders; a single curvy rounded line must feature a continuous cyan/amber running light beam orbiting around the perimeter.
