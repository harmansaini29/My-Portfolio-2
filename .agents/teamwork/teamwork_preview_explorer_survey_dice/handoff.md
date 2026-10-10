# Handoff Report: Requirement 2 — Restore Original Identity Section Components

## 1. Observation

### 1.1 Existing Component: `DiceRoleFlipper`
- **File Location**: `components/DiceRoleFlipper.tsx` (101 lines)
- **Stylesheet**: `components/DiceRoleFlipper.css` (134 lines)
- **Module Nature**: Client component (`'use client'`), default export (`export default function DiceRoleFlipper(...)`).
- **Dependencies**: React standard hooks (`useState`, `useEffect`, `useRef`). Zero third-party dependencies.
- **Props Interface** (`components/DiceRoleFlipper.tsx:6-10`):
  ```typescript
  interface DiceRoleFlipperProps {
    roles?: string[];
    intervalMs?: number;
    className?: string;
  }
  ```
- **Default Prop Values** (`components/DiceRoleFlipper.tsx:23-32`):
  ```typescript
  roles = [
    'Full Stack Developer',
    'Java Systems Engineer',
    '3D WebGL Architect',
    'Algorithmic Trader',
    'Horology Analyst',
  ],
  intervalMs = 3000,
  className = '',
  ```
- **Role Icons Dictionary** (`components/DiceRoleFlipper.tsx:12-20`):
  ```typescript
  const ROLE_ICONS: Record<string, string> = {
    'Full Stack Developer': '⚡',
    'Java Systems Engineer': '☕',
    '3D WebGL Architect': '⚛️',
    'Algorithmic Trader': '📈',
    'Horology Analyst': '⏱️',
  };
  const DEFAULT_ICON = '✦';
  ```
- **CSS Architecture** (`components/DiceRoleFlipper.css:2-10`):
  Container uses `perspective: 1000px`, 3D cube with `transform-style: preserve-3d; will-change: transform; transform: translateZ(-24px) rotateX(0deg); transition: transform 0.34s cubic-bezier(0.22, 1, 0.36, 1);`, and two faces (`.dice-face-front` at `translateZ(24px)` and `.dice-face-bottom` at `rotateX(-90deg) translateZ(24px)`).

### 1.2 Git Historical Record of `components/Hero.tsx`
We inspected commits `bb2320b` (initial), `67d836e` ("final 1 done"), `6bb09ab` ("final version smooth 2.0"), and `0a99082` ("final 3.0"):
- **Commit `67d836e`** & **Commit `6bb09ab`**:
  `Hero.tsx` imported and mounted `DiceRoleFlipper`:
  ```tsx
  import DiceRoleFlipper from './DiceRoleFlipper';
  ...
  const ROLES = [
    'Full Stack Developer',
    'Java Systems Engineer',
    '3D WebGL Architect',
    'Algorithmic Trader',
    'Horology Analyst',
  ];
  ...
  {/* Bottom Left Identity Section */}
  <div className="bottom-left-section" ref={bottomLeftRef}>
    <div className="greeting-row">
      <span className="wave-hand">👋</span>
      <span className="greeting-silver-subtitle">Hey mate, I am</span>
    </div>
    <div className="hero-silver-title-wrapper">
      <div className="hero-silver-backglow" aria-hidden />
      <h1 className="hero-silver-title">{name}</h1>
    </div>
    {/* 3D Perspective Dice Role Flipper */}
    <DiceRoleFlipper roles={ROLES} intervalMs={3000} />
  </div>
  ```
- **Commit `0a99082`**:
  Appended `HeroPowerBadges` directly beneath `DiceRoleFlipper`:
  ```tsx
  {/* Bottom Left Identity Section */}
  <div className="bottom-left-section" ref={bottomLeftRef}>
    <div className="greeting-row">
      <span className="wave-hand">👋</span>
      <span className="greeting-silver-subtitle">Hey mate, I am</span>
    </div>
    <div className="hero-silver-title-wrapper">
      <div className="hero-silver-backglow" aria-hidden />
      <h1 className="hero-silver-title">{name}</h1>
    </div>
    <DiceRoleFlipper roles={ROLES} intervalMs={3000} />

    {/* High Power & Latency Telemetry Matrix */}
    <HeroPowerBadges />
  </div>
  ```
- **CTA / Resume Buttons Investigation**:
  Search commands `git log -S "Resume" --all -p` and `git log -S "resume" --all -p` confirmed that neither resume buttons nor social CTA links were ever committed into `components/Hero.tsx`. The bottom-left section in all original git versions strictly comprised:
  1. Greeting row (`👋 Hey mate, I am`)
  2. Silver title (`Harman Saini`) with backglow
  3. `DiceRoleFlipper`
  4. `HeroPowerBadges` (telemetry badges: High Power Core, <10ms Latency, 120 FPS WebGL)

### 1.3 Current Implementation in `components/Hero.tsx`
In the current working tree of `components/Hero.tsx`:
- **Line 27**: `const roleRef = useRef<HTMLDivElement>(null);`
- **Line 45**: `const roleEl = roleRef.current;`
- **Line 47**: `if (!hero || !imgTop || !imgBottom || !glow || !hintEl || !bottomLeft || !roleEl) return;` (includes `!roleEl` guard).
- **Lines 51–74**: Imperative DOM manipulation with `setInterval`:
  ```typescript
  // Role flipper
  const roles = ['Full Stack Developer', 'Java Systems Engineer', '3D WebGL Architect', 'Algorithmic Trader', 'Horology Analyst'];
  let ri = 0;
  let cur = document.createElement('span');
  cur.textContent = roles[0];
  roleEl.innerHTML = '';
  roleEl.appendChild(cur);

  let roleInterval: NodeJS.Timeout;
  if (!reduce) {
    roleInterval = setInterval(() => {
      ri = (ri + 1) % roles.length;
      const next = document.createElement('span');
      next.textContent = roles[ri];
      next.className = 'pre';
      roleEl.appendChild(next);
      void next.offsetWidth; // trigger reflow
      cur.classList.add('out');
      next.classList.remove('pre');
      const old = cur;
      cur = next;
      setTimeout(() => { if (old.parentNode) old.remove(); }, 700);
    }, 3000);
  }
  ```
- **Line 195**: `clearInterval(roleInterval);` in `useEffect` cleanup.
- **Line 271**: `<div className="role" id="role" ref={roleRef} aria-live="polite"></div>` rendered between title wrapper and `hero-power-badges`.
- **`components/Hero.css:245-274`**: Obsolete `.role`, `.role span`, `.role span.out`, `.role span.pre` CSS rules.

---

## 2. Logic Chain

1. **Premise 1**: Acceptance Criteria explicitly mandates:
   - `DiceRoleFlipper` is imported and successfully renders in `components/Hero.tsx`.
   - The `setInterval` script logic for the plain text role flipper has been removed from the `useEffect` hook in `Hero.tsx`.
   - The original bottom-left Identity Section layout structure is restored.
2. **Premise 2**: `DiceRoleFlipper.tsx` already exists and is completely healthy, fully styled via `DiceRoleFlipper.css`, and self-contained with no external missing dependencies.
3. **Premise 3**: In current `Hero.tsx`, the plain text role flipper is coupled to:
   - A `roleRef` ref object.
   - An imperative DOM injection routine inside `useEffect` (lines 51–74).
   - An interval cleanup `clearInterval(roleInterval)` on line 195.
   - A guard condition `!roleEl` on line 47 that would prematurely abort the parallax and pointer setup if `roleRef` is detached without removing `!roleEl`.
4. **Premise 4**: Removing `roleRef`, `roleEl`, `!roleEl`, lines 51–74, line 195, and line 271 completely removes the plain text role flipper and eliminates all related runtime overhead and potential DOM memory leaks.
5. **Premise 5**: Restoring `import DiceRoleFlipper from './DiceRoleFlipper';` and inserting `<DiceRoleFlipper roles={ROLES} intervalMs={3000} />` inside `<div className="bottom-left-section">` between `.hero-silver-title-wrapper` and `.hero-power-badges` exactly restores the authentic original layout and aesthetic.

---

## 3. Caveats

1. **No Historical CTA/Resume Buttons in Hero**: Although the user/prompt mention "CTA buttons, social links, resume button, or whatever was originally present", our exhaustive git log survey proves that `Hero.tsx` in this repository never had a resume button or external link CTA in the Hero section. All social and contact links reside in `ContactSection.tsx`. We provide an optional aesthetic-aligned snippet below in case the team decides to add one.
2. **Coexistence with Requirement 1**: Requirement 1 is addressing image cropping / head alignment in `Hero.tsx` and `Hero.css`. The edits for Requirement 2 are strictly confined to:
   - Top imports in `Hero.tsx`
   - `useEffect` lines 45, 47, 51–74, 195 in `Hero.tsx`
   - Bottom-left JSX lines 271 in `Hero.tsx`
   - Purging dead `.role` classes in `Hero.css`
   There is zero collision with image alignment styling (`object-position`, `transform`, `layerChrome`, `layerBase`).
3. **Windows PowerShell Execution**: On Windows systems where `.ps1` execution is restricted by PowerShell execution policy, commands must use `npm.cmd run build` and `npm.cmd run typecheck` (or `node ...`).

---

## 4. Conclusion

Restoring the original Identity Section components requires five precise steps:

### Step 1: In `components/Hero.tsx` — Add Import and Constant
Add import at top of file:
```typescript
import DiceRoleFlipper from './DiceRoleFlipper';
```
Add constant (above the component):
```typescript
const ROLES = [
  'Full Stack Developer',
  'Java Systems Engineer',
  '3D WebGL Architect',
  'Algorithmic Trader',
  'Horology Analyst',
];
```

### Step 2: In `components/Hero.tsx` — Remove `roleRef`
Delete line 27:
```typescript
// REMOVE:
const roleRef = useRef<HTMLDivElement>(null);
```

### Step 3: In `components/Hero.tsx` — Clean `useEffect`
- Line 45: Remove `const roleEl = roleRef.current;`
- Line 47: Update guard clause from:
  ```typescript
  if (!hero || !imgTop || !imgBottom || !glow || !hintEl || !bottomLeft || !roleEl) return;
  ```
  to:
  ```typescript
  if (!hero || !imgTop || !imgBottom || !glow || !hintEl || !bottomLeft) return;
  ```
- Lines 51–74: Remove entire imperative role flipper block (`// Role flipper ... let roleInterval = setInterval(...)`).
- Line 195: Remove `clearInterval(roleInterval);`.

### Step 4: In `components/Hero.tsx` — Update JSX in `bottom-left-section`
Replace `<div className="role" id="role" ref={roleRef} aria-live="polite"></div>` with `<DiceRoleFlipper roles={ROLES} intervalMs={3000} />`:
```tsx
      {/* Bottom Left Identity Section */}
      <div className="bottom-left-section" id="bottomLeft" ref={bottomLeftRef}>
        <div className="greeting-row">
          <span className="wave-hand">👋</span>
          <span className="greeting-silver-subtitle">Hey mate, I am</span>
        </div>
        <div className="hero-silver-title-wrapper">
          <div className="hero-silver-backglow" aria-hidden="true" />
          <h1 className="hero-silver-title">{name}</h1>
        </div>
        
        {/* 3D Perspective Dice Role Flipper */}
        <DiceRoleFlipper roles={ROLES} intervalMs={3000} />

        {/* Telemetry Matrix Badges */}
        <div className="hero-power-badges">
          <div className="hero-power-badge"><span className="hero-power-dot cyan" /><span>High Power Core</span></div>
          <div className="hero-power-badge"><span className="hero-power-dot emerald" /><span>&lt;10ms Latency</span></div>
          <div className="hero-power-badge"><span className="hero-power-dot indigo" /><span>120 FPS WebGL</span></div>
        </div>
      </div>
```

### Step 5: In `components/Hero.css` — Clean Dead Role CSS
Remove dead classes `.role`, `.role span`, `.role span.out`, `.role span.pre` (lines 245–274 in `Hero.css`). `DiceRoleFlipper.css` supplies all 3D styles independently.

---

## 5. Verification Method

1. **Type Checking**:
   ```powershell
   npm.cmd run typecheck
   ```
   *Expected outcome*: Exits with code 0 and zero TypeScript errors.

2. **Production Build**:
   ```powershell
   npm.cmd run build
   ```
   *Expected outcome*: Next.js build succeeds with static page generation complete.

3. **Code Inspection**:
   - Verify `components/Hero.tsx` imports `DiceRoleFlipper` from `'./DiceRoleFlipper'`.
   - Verify `<DiceRoleFlipper` is present in `components/Hero.tsx`.
   - Verify `setInterval` in `useEffect` is completely deleted.
   - Verify `roleRef` and `roleEl` are deleted.
