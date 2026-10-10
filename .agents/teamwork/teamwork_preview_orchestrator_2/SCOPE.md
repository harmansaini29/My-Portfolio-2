# Scope: Hero Section Image Framing Fix & DiceRoleFlipper/CTA Restoration

## Architecture
- **Framework**: Next.js 16.3.6 (Turbopack, App Router) with React 19.
- **Hero Module**: `components/Hero.tsx` + `components/Hero.css`.
- **Identity Components**: `components/DiceRoleFlipper.tsx` + `components/DiceRoleFlipper.css`, `HeroPowerBadges`.
- **Layer & Mask Architecture**:
  - `#imgBottom` (`layerChrome`): Venom baseline portrait (`base.png`).
  - `#imgTop` (`layerBase`): Active user portraits (`portrait.png` / adult, `chrome.png` / young) with dynamic cursor-following radial-gradient liquid mask.
  - Image scaling: `object-fit: cover` with `object-position: center top` to prevent top skull/forehead cropping across wide and ultrawide viewports while preserving dual-layer coordinate alignment.

## Feature Inventory
| # | Feature | Description | Milestone | Source |
|---|---------|-------------|-----------|--------|
| 1 | Hero Image Cropping Prevention | Adjust `components/Hero.css` (`object-position: center top`, `transform-origin: center top`) and `components/Hero.tsx` (`data-fit="cover" data-position="top"`, `transformOrigin: "50% 0%"`) to eliminate head cropping across all viewports. | M1 | Survey E1 / R1 |
| 2 | DiceRoleFlipper Re-Integration | Import `DiceRoleFlipper` in `Hero.tsx` and render `<DiceRoleFlipper roles={ROLES} intervalMs={3000} />` inside `.bottom-left-section`. | M1 | Survey E2 / R2 |
| 3 | Remove Imperative Text Role Flipper | Purge `roleRef`, `roleEl`, `!roleEl` guard, imperative `setInterval` in `useEffect`, `clearInterval`, and `<div className="role" id="role">` from `Hero.tsx`, plus dead `.role` CSS from `Hero.css`. | M1 | Survey E2 / R2 |
| 4 | Automated Test Coverage | Add Tier 1 Feature 6 tests in `tests/tier1-features.test.js` validating CSS top alignment, DiceRoleFlipper rendering, and setInterval removal. | M1 | Survey E3 / R3 |
| 5 | Build & Verification Gate | Verify `tsc --noEmit` exits 0, `node tests/e2e-verify.js` passes Tier 1 Feature 6, and `npm run build` succeeds cleanly with Turbopack. | M1 | Survey E3 / R3 |

## Milestones
| # | Name | Scope | Dependencies | Status |
|---|------|-------|-------------|--------|
| M1 | Hero Section Fix & Restoration | Implement CSS image framing, restore DiceRoleFlipper, purge plain setInterval logic, add automated tests, and compile build. | Survey | IN_PROGRESS |

## Write Boundaries
- **Worker 1**:
  - `components/Hero.css`
  - `components/Hero.tsx`
  - `tests/tier1-features.test.js`
