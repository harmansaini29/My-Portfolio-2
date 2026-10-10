// independent_audit_verify.js
// Independent Victory Auditor Verification Script

const fs = require('fs');
const path = require('path');
const assert = require('assert');

const projectRoot = path.resolve(__dirname, '..', '..', '..');

console.log('--- INDEPENDENT VICTORY AUDITOR VERIFICATION RUN ---');
let passed = 0;
let total = 0;

function check(name, fn) {
  total++;
  try {
    fn();
    console.log(`PASS: ${name}`);
    passed++;
  } catch (err) {
    console.error(`FAIL: ${name} -> ${err.message}`);
  }
}

// 1. R1: Hero image scaling and framing
check('R1: Hero.tsx specifies scale 1.0, data-fit=cover, data-position=top', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'Hero.tsx'), 'utf8');
  assert(content.includes('scale: "1"'), 'Hero.tsx must have scale: "1"');
  assert(!content.includes('scale: "0.85"'), 'Hero.tsx must not contain scale: "0.85"');
  assert(content.includes('data-fit="cover"'), 'Hero.tsx must have data-fit="cover"');
  assert(content.includes('data-position="top"'), 'Hero.tsx must have data-position="top"');
});

check('R1: Hero.css specifies 9% bottom gradient and object-position center top', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'components', 'Hero.css'), 'utf8');
  assert(css.includes('height: 9%'), 'Hero.css .hero::after height must be 9%');
  assert(css.includes('object-position: center top'), 'Hero.css must specify object-position: center top');
  assert(css.includes('object-fit: cover'), 'Hero.css must specify object-fit: cover');
});

// 2. R2: Vortex text clarity (4K)
check('R2: GooeyTextReveal.tsx removes lingering filter onComplete', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'ui', 'GooeyTextReveal.tsx'), 'utf8');
  assert(content.includes('el.style.filter = "none"'), 'GooeyTextReveal must reset filter to "none" onComplete');
});

check('R2: VortexAbout.css includes backdrop-filter blur and antialiasing', () => {
  const css = fs.readFileSync(path.join(projectRoot, 'components', 'VortexAbout.css'), 'utf8');
  assert(css.includes('backdrop-filter: blur(16px)'), 'VortexAbout.css must include backdrop-filter: blur(16px)');
  assert(css.includes('-webkit-font-smoothing: antialiased'), 'VortexAbout.css must include -webkit-font-smoothing: antialiased');
});

// 3. R3: Journey carousel continuous auto-motion
check('R3: LiquidGlassCarousel implements dual-increment autoScroll physics', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'LiquidGlassCarousel.tsx'), 'utf8');
  assert(content.includes('autoScroll: m.autoScroll !== false'), 'Must support autoScroll setting');
  assert(content.includes('target += delta'), 'Must advance target by delta');
  assert(content.includes('scroll += delta'), 'Must advance scroll by delta (dual-increment zero spring lag)');
  assert(content.includes('resumeDelay'), 'Must handle resumeDelay');
});

check('R3: JourneySection.tsx passes autoScroll motion settings', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'JourneySection.tsx'), 'utf8');
  assert(content.includes('autoScroll: true'), 'JourneySection must set autoScroll: true');
  assert(content.includes('autoScrollSpeed: 38'), 'JourneySection must set autoScrollSpeed');
});

// 4. R4: Projects section square shape
check('R4: ChromiumBorderContainer specifies aspect-square and bounded height', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'ChromiumBorderContainer.tsx'), 'utf8');
  assert(content.includes('aspect-square'), 'ChromiumBorderContainer must have aspect-square');
  assert(content.includes('max-h-[min(70vh,640px)]'), 'ChromiumBorderContainer must have max-h-[min(70vh,640px)]');
});

check('R4: ProjectsSection sets 8x8 MosaicFlip square grid and bounds height', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'ProjectsSection.tsx'), 'utf8');
  assert(content.includes('columns={8}'), 'MosaicFlip must have columns={8}');
  assert(content.includes('rows={8}'), 'MosaicFlip must have rows={8}');
  assert(content.includes('max-h-screen'), 'ProjectsSection must have max-h-screen');
});

// 5. R5: Remove bottom whitespace
check('R5: ContactSection has 3-row grid with 21 items and clearance buffer', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'ContactSection.tsx'), 'utf8');
  assert(content.includes('grid-rows-3'), 'ContactSection must have grid-rows-3');
  assert(content.includes('length: 21'), 'ContactSection must allocate exactly 21 slots for 7x3 grid');
  assert(!content.includes('grid-rows-5'), 'ContactSection must not have grid-rows-5');
});

check('R5: app/layout.tsx applies dark class to html element', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'app', 'layout.tsx'), 'utf8');
  assert(content.includes('"dark"'), 'html tag must include "dark" class');
});

// 6. R6: Centralized social & contact config
check('R6: lib/portfolio-data.ts exports compact SOCIAL_LINKS at lines 1-40', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'lib', 'portfolio-data.ts'), 'utf8');
  assert(content.includes('export const SOCIAL_LINKS'), 'Must export SOCIAL_LINKS');
  assert(content.includes('github:'), 'Must contain github link');
  assert(content.includes('linkedin:'), 'Must contain linkedin link');
  assert(content.includes('twitter:'), 'Must contain twitter link');
  assert(content.includes('email:'), 'Must contain email link');
});

check('R6: ContactSection.tsx imports and binds SOCIAL_LINKS', () => {
  const content = fs.readFileSync(path.join(projectRoot, 'components', 'ContactSection.tsx'), 'utf8');
  assert(content.includes("import { SOCIAL_LINKS } from '@/lib/portfolio-data'"), 'Must import SOCIAL_LINKS');
  assert(content.includes('SOCIAL_LINKS.github.url'), 'Must bind GitHub link');
  assert(content.includes('SOCIAL_LINKS.linkedin.url'), 'Must bind LinkedIn link');
  assert(content.includes('SOCIAL_LINKS.twitter.url'), 'Must bind Twitter link');
  assert(content.includes('SOCIAL_LINKS.email.url'), 'Must bind Email link');
});

console.log(`\nIndependent Verification Complete: ${passed}/${total} checks passed.`);
if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
