# Plan — Hero Section Fix & Component Restoration

## Objective
Fix the Hero section image cropping issue (preventing heads from being cut off) and restore the original `DiceRoleFlipper` and CTA elements in `My-Portfolio 2` Next.js application, passing all builds and tests.

## Phase 0: Survey & Technical Investigation
Spawn 3 parallel Explorers:
- **Explorer 1** (`teamwork_preview_explorer_hero_css`):
  - Investigate `components/Hero.css`, `components/Hero.tsx`, image assets (`base.png`, `portrait.png`, `chrome.png`).
  - Examine `object-position: center top` vs `data-fit` styling logic.
  - Check liquid mask transition effect interaction and ensure no section overlap.
- **Explorer 2** (`teamwork_preview_explorer_dice_cta`):
  - Investigate `DiceRoleFlipper` component (`components/DiceRoleFlipper.tsx` or similar), its export/props.
  - Inspect git history or git log of `components/Hero.tsx` to find the exact original bottom-left Identity Section and CTA buttons/layout before the liquid-reveal refactor.
  - Identify the plain text Javascript-based role flipper and `setInterval` in `useEffect` in `Hero.tsx` to be removed.
- **Explorer 3** (`teamwork_preview_explorer_build_tests`):
  - Check current project build setup, Next.js configuration, TypeScript setup, and existing test suites (e.g. `tests/e2e-verify.js`).
  - Determine verification commands and criteria.

## Phase 1: Synthesis & Work Decomposition
- Aggregate Explorer reports.
- Formulate concrete file-level modification specification.

## Phase 2: Implementation (Worker)
- Dispatch Worker with strict write boundaries (`components/Hero.css`, `components/Hero.tsx`, and tests if applicable).
- Worker implements CSS adjustments, imports and renders `DiceRoleFlipper`, restores CTA elements, removes `setInterval` plain text flipper.
- Worker runs `npx tsc --noEmit`, test suites, and `npm run build`.

## Phase 3: Adversarial Review, Challenge & Audit
- Dispatch 2 independent Reviewers.
- Dispatch 2 independent Challengers.
- Dispatch 1 Forensic Auditor (`teamwork_preview_auditor`).
- Gate check: all pass, 0 integrity violations.

## Phase 4: Final Victory Report
- Write `handoff.md` and report to Sentinel.
