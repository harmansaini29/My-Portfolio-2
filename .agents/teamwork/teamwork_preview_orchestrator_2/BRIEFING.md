# BRIEFING — 2026-10-10T12:26:00Z

## Mission
Fix the Hero section image cropping issue and restore the original DiceRoleFlipper and CTA elements in My-Portfolio 2 with complete build and test verification.

## 🔒 My Identity
- Archetype: teamwork_preview_orchestrator_2
- Roles: orchestrator, user_liaison, human_reporter, successor
- Working directory: e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_orchestrator_2
- Original parent: parent
- Original parent conversation ID: eeeb22fb-9848-45c4-9a4f-9b59cde52d99

## 🔒 My Workflow
- **Pattern**: Project
- **Scope document**: e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_orchestrator_2\SCOPE.md
1. **Decompose**: Survey and assess Hero cropping fix and DiceRoleFlipper/CTA restoration.
2. **Dispatch & Execute**: Direct iteration loop (Explorer -> Worker -> Reviewer -> Challenger -> Auditor) with rigorous gating.
3. **On failure**: Retry -> Replace -> Skip -> Redistribute -> Redesign -> Escalate
4. **Succession**: At 16 spawns, write handoff.md, spawn successor
- **Work items**:
  1. Survey & Technical Investigation [done]
  2. Implementation: Hero Cropping Fix & DiceRoleFlipper/CTA Restoration [in-progress]
  3. Quality Gates: Review, Challenge, Audit & Build/Test Verification [pending]
- **Current phase**: 2
- **Current focus**: Implementation: Hero Cropping Fix & DiceRoleFlipper/CTA Restoration

## 🔒 Key Constraints
- NEVER write, modify, or create source code files directly.
- NEVER run build/test commands yourself — require workers to do so.
- NEVER investigate or explore the problem at the code level — dispatch Explorers for technical investigation.
- File-editing tools ONLY for metadata/state files (.md) in .agents/teamwork/ folder.
- Auditor INTEGRITY VIOLATION is a BINARY VETO — fails unconditionally.
- Never reuse a subagent after it has delivered its handoff — always spawn fresh.
- Always include ORIGINAL_REQUEST.md path in subagent dispatches.

## Current Parent
- Conversation ID: eeeb22fb-9848-45c4-9a4f-9b59cde52d99
- Updated: 2026-10-10T12:25:19Z

## Key Decisions Made
- Survey completed by 3 parallel Explorers.
- Root cause of cropping: object-position: center; in Hero.css. Fix: object-position: center top; transform-origin: center top; plus data-fit="cover" data-position="top" in Hero.tsx and transformOrigin: "50% 0%" for portrait.
- DiceRoleFlipper restoration: import DiceRoleFlipper, render with ROLES and intervalMs=3000, remove roleRef, roleEl, setInterval, clearInterval, and dead .role classes.
- Test coverage: Add Feature 6 tests in tests/tier1-features.test.js.
- Dispatch Worker to implement all changes in Hero.css, Hero.tsx, and tests/tier1-features.test.js.

## Team Roster
| Agent | Type | Work Item | Status | Conv ID |
|-------|------|-----------|--------|---------|
| explorer_survey_hero | teamwork_preview_explorer | Survey Hero CSS & cropping | completed | 3e1f9e25-38bb-43c5-916f-2dd1d8d9a78b |
| explorer_survey_dice | teamwork_preview_explorer | Survey DiceRoleFlipper & CTA | completed | a04944fb-d876-47c8-ad26-37c23ea946b8 |
| explorer_survey_build | teamwork_preview_explorer | Survey Build & Test Infra | completed | 495bb530-c017-4ae1-8dd9-54191a27b3e5 |
| worker_1 | teamwork_preview_worker | Implement Hero fix & restoration | completed | b32bbb3f-2057-4cc2-9321-463299ef5c81 |
| reviewer_1 | teamwork_preview_reviewer | Review Hero CSS & Component | in-progress | 8db45ee8-e5f2-485b-aaa5-0db60b3f8387 |
| reviewer_2 | teamwork_preview_reviewer | Adversarial Review & Geometry | in-progress | 5ea629ff-02aa-4d0b-9c70-1fd4ab918a61 |
| challenger_1 | teamwork_preview_challenger | Empirical Viewport Geometry Test | in-progress | c37dde5e-2f9f-4764-a51b-bc89397d74f0 |
| challenger_2 | teamwork_preview_challenger | Empirical 3D Cube & Mask Stress | in-progress | f9a48360-e066-45bc-a2ab-8f36dfcc1d64 |
| auditor_1 | teamwork_preview_auditor | Forensic Integrity Audit | in-progress | e55a111c-5d7a-4912-8df6-56669c7e0650 |

## Succession Status
- Succession required: no
- Spawn count: 9 / 16
- Pending subagents: 8db45ee8-e5f2-485b-aaa5-0db60b3f8387, 5ea629ff-02aa-4d0b-9c70-1fd4ab918a61, c37dde5e-2f9f-4764-a51b-bc89397d74f0, f9a48360-e066-45bc-a2ab-8f36dfcc1d64, e55a111c-5d7a-4912-8df6-56669c7e0650
- Predecessor: none
- Successor: not yet spawned

## Active Timers
- Heartbeat cron: c18d2927-a54c-48ec-881a-e5e9dda382a4/task-18
- Safety timer: none

## Artifact Index
- e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\ORIGINAL_REQUEST.md — Authoritative User Request
- e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_orchestrator_2\DISPATCH.md — Incoming Dispatch
- e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_orchestrator_2\plan.md — Orchestrator Plan
- e:\Cloned Github Repo\My-Portfolio 2\.agents\teamwork\teamwork_preview_orchestrator_2\progress.md — Progress & Liveness
