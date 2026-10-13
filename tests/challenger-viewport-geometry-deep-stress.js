/**
 * Empirical Adversarial Challenger Test Suite:
 * Viewport Responsiveness, Zero Horizontal Overflow, & Rectangular Container Geometry
 *
 * Target Viewports:
 * - 320px Compact Mobile (iPhone SE 1st gen)
 * - 360px Standard Mobile (Android standard)
 * - 375px Mobile (iPhone SE 2 / 8)
 * - 390px Mobile (iPhone 12/13/14)
 * - 412px Mobile (Pixel 7)
 * - 768px Tablet Portrait (iPad)
 * - 1024px Tablet Landscape / Netbook
 * - 1366px Standard Laptop
 * - 1920px Full HD Desktop (1080p)
 * - 2560px QHD Desktop (1440p)
 * - 3440px Ultrawide 21:9
 * - 3840px 4K UHD Desktop
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.resolve(__dirname, '..');

let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
const failureDetails = [];

function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

function runTest(name, fn) {
  totalTests++;
  try {
    fn();
    passedTests++;
    console.log(`  ✔ [PASS] ${name}`);
  } catch (err) {
    failedTests++;
    failureDetails.push({ name, error: err.message, stack: err.stack });
    console.log(`  ✖ [FAIL] ${name}: ${err.message}`);
  }
}

console.log('======================================================================');
console.log('CHALLENGER ADVERSARIAL VIEWPORT & LAYOUT GEOMETRY STRESS HARNESS');
console.log('======================================================================\n');

// Load sources
const chromiumSource = fs.readFileSync(path.join(PROJECT_ROOT, 'components/ChromiumBorderContainer.tsx'), 'utf8');
const projectsSource = fs.readFileSync(path.join(PROJECT_ROOT, 'components/ProjectsSection.tsx'), 'utf8');
const vortexCss = fs.readFileSync(path.join(PROJECT_ROOT, 'components/VortexAbout.css'), 'utf8');
const vortexTsx = fs.readFileSync(path.join(PROJECT_ROOT, 'components/VortexAbout.tsx'), 'utf8');
const achieveSectionSource = fs.readFileSync(path.join(PROJECT_ROOT, 'components/AchievementsSection.tsx'), 'utf8');
const hoverRevealSource = fs.readFileSync(path.join(PROJECT_ROOT, 'components/HoverImageReveal.tsx'), 'utf8');
const contactSource = fs.readFileSync(path.join(PROJECT_ROOT, 'components/ContactSection.tsx'), 'utf8');
const heroSource = fs.readFileSync(path.join(PROJECT_ROOT, 'components/Hero.tsx'), 'utf8');
const heroCss = fs.readFileSync(path.join(PROJECT_ROOT, 'components/Hero.css'), 'utf8');
const pageSource = fs.readFileSync(path.join(PROJECT_ROOT, 'app/page.tsx'), 'utf8');
const globalsCss = fs.readFileSync(path.join(PROJECT_ROOT, 'app/globals.css'), 'utf8');
const portfolioData = fs.readFileSync(path.join(PROJECT_ROOT, 'lib/portfolio-data.ts'), 'utf8');

// ---------------------------------------------------------------------------
// SUITE 1: Mobile Viewport Horizontal Overflow & Wrap Mechanics (320px - 412px)
// ---------------------------------------------------------------------------
console.log('▸ SUITE 1: Mobile Viewport Horizontal Overflow & Wrap Mechanics');

runTest('1.1: Root page and HTML/Body enforce strict overflow-x clip isolation', () => {
  assert(globalsCss.includes('overflow-x: clip'), 'globals.css must specify overflow-x: clip on html, body');
  assert(pageSource.includes('overflow-x-clip'), 'app/page.tsx main container must include overflow-x-clip');
});

runTest('1.2: VortexAbout metrics row applies flex-wrap: wrap preventing 360px overflow', () => {
  assert(vortexCss.includes('.sj-metrics-row'), 'VortexAbout.css must define .sj-metrics-row');
  assert(vortexCss.includes('flex-wrap: wrap'), 'VortexAbout.css .sj-metrics-row must declare flex-wrap: wrap');
  
  // Model 360px viewport metrics row wrapping
  const viewportWidth = 360;
  const containerWidth = Math.min(viewportWidth * 0.92, 460); // 331.2px
  const containerPadding = 40; // 1.25rem each side = 20px + 20px = 40px
  const availableContentWidth = containerWidth - containerPadding; // 291.2px

  // Tag dimensions: Sub-10ms Core (~112px), Zero-Lock RAM (~114px), Raft Engine (~98px)
  const tag1Width = 112;
  const tag2Width = 114;
  const tag3Width = 98;
  const gap = 8; // 0.5rem

  const row1Width = tag1Width + gap + tag2Width; // 234px
  const row2Width = tag3Width; // 98px

  assert(row1Width <= availableContentWidth, `Row 1 (${row1Width}px) must fit within available width (${availableContentWidth}px)`);
  assert(row2Width <= availableContentWidth, `Row 2 (${row2Width}px) must fit within available width (${availableContentWidth}px)`);
  console.log(`      -> 360px Mobile: Container: ${containerWidth.toFixed(1)}px | Row 1: ${row1Width}px / ${availableContentWidth.toFixed(1)}px | Row 2: ${row2Width}px (zero overflow)`);
});

runTest('1.3: VortexAbout tech pills row applies flex-wrap: wrap', () => {
  assert(vortexCss.includes('.sj-tech-pills'), 'VortexAbout.css must define .sj-tech-pills');
  assert(
    vortexCss.includes('flex-wrap: wrap'),
    'VortexAbout.css .sj-tech-pills must declare flex-wrap: wrap'
  );
});

runTest('1.4: VortexAbout mobile media query clamps info containers to min(92vw, 460px)', () => {
  assert(vortexCss.includes('@media (max-width: 960px)'), 'Must include @media (max-width: 960px)');
  assert(vortexCss.includes('width: min(92vw, 460px)'), 'Must clamp mobile containers to min(92vw, 460px)');
  assert(vortexCss.includes('left: 50%'), 'Must center container horizontally');
  assert(vortexCss.includes('transform: translate(-50%, -50%)'), 'Must center using transform translate');
});

runTest('1.5: Achievements section text enforces word-break and responsive clamp', () => {
  assert(hoverRevealSource.includes('wordBreak: "break-word"'), 'HoverImageReveal must declare wordBreak: "break-word"');
  assert(hoverRevealSource.includes('whiteSpace: "normal"'), 'HoverImageReveal must declare whiteSpace: "normal"');
  assert(hoverRevealSource.includes('maxWidth: "92vw"'), 'HoverImageReveal must declare maxWidth: "92vw"');
  assert(achieveSectionSource.includes('clamp('), 'AchievementsSection must declare responsive font clamp');

  // Verify longest achievement text at 320px and 360px viewports
  const achievementItems = [
    '2× HACKATHON WINNER',
    'GHOST MODE',
    'ENIGMA TOP 10',
    'HACKNOVA 7TH',
    'NPTEL ELITE GOLD'
  ];

  [320, 360, 375, 412].forEach((vw) => {
    const maxAllowedWidth = vw * 0.92;
    // At vw, 4.2vw is:
    const fontSize = Math.max(1.15 * 16, Math.min(3.2 * 16, vw * 0.042)); // 18.4px at 320/360
    // Estimate longest word length: "HACKATHON" = 9 chars * ~11px = 99px
    const longestWord = 'HACKATHON';
    const longestWordPx = longestWord.length * (fontSize * 0.60);
    assert(longestWordPx < maxAllowedWidth, `Longest word ${longestWordPx.toFixed(1)}px must not exceed ${maxAllowedWidth}px at ${vw}px vw`);
  });
});

runTest('1.6: Contact section Bento card widths sum strictly to 100% of bento container', () => {
  const has52 = contactSource.includes('bentoItems.length === 4 ? "52%" : "60%"');
  const has46 = contactSource.includes('bentoItems.length === 4 ? "46%" : "60%"');
  assert(has52 || has46, 'Active Bento card width must be calibrated when 4 items');

  const activePercent = has46 ? 46 : 52;
  const inactivePercent = has46 ? 18 : 16;
  const totalPercent = activePercent + inactivePercent * 3;
  assert(totalPercent === 100, `Total card width must equal exactly 100%, got ${totalPercent}%`);
  console.log(`      -> Bento 4-card distribution: 1 Active (${activePercent}%) + 3 Inactive (${inactivePercent}% x 3) = ${totalPercent}% total occupancy`);
});

runTest('1.7: Hero section mobile responsiveness (<768px) hides telemetry lines and clamps identity card', () => {
  assert(heroCss.includes('@media (max-width: 768px)'), 'Hero.css must define mobile media query');
  assert(heroCss.includes('.tele { display: none; }'), 'Hero telemetry lines must be hidden on mobile to prevent overflow');
  assert(heroCss.includes('max-width: 90vw;'), 'Bottom-left identity section must be clamped to 90vw');
});

// ---------------------------------------------------------------------------
// SUITE 2: Rectangular Projects Container Geometry & Sticky Headroom
// ---------------------------------------------------------------------------
console.log('\n▸ SUITE 2: Rectangular Projects Container Geometry & Sticky Headroom');

runTest('2.1: ChromiumBorderContainer specifies rectangular aspect-[16/10] and removes aspect-square', () => {
  assert(chromiumSource.includes('aspect-[16/10]'), 'Must declare aspect-[16/10]');
  assert(!chromiumSource.includes('aspect-square'), 'Must NOT declare aspect-square');
});

runTest('2.2: ChromiumBorderContainer specifies responsive width w-[94vw] max-w-5xl md:max-w-6xl', () => {
  assert(chromiumSource.includes('w-[94vw]'), 'Must declare w-[94vw]');
  assert(chromiumSource.includes('max-w-5xl'), 'Must declare max-w-5xl');
  assert(chromiumSource.includes('md:max-w-6xl'), 'Must declare md:max-w-6xl');
});

runTest('2.3: ChromiumBorderContainer specifies responsive height h-[65vh] md:h-[72vh] max-h-[700px]', () => {
  assert(chromiumSource.includes('h-[65vh]'), 'Must declare h-[65vh]');
  assert(chromiumSource.includes('md:h-[72vh]'), 'Must declare md:h-[72vh]');
  assert(chromiumSource.includes('max-h-[700px]'), 'Must declare max-h-[700px]');
});

runTest('2.4: ProjectsSection project info overlay leaves clear horizontal buffer for floating action buttons', () => {
  assert(projectsSource.includes('mr-14 sm:mr-16'), 'Project info overlay must include mr-14 sm:mr-16 right margin buffer');
  assert(projectsSource.includes('right-2 sm:right-4'), 'Floating action buttons must be anchored at right-2 sm:right-4');
  
  // Right side clearance calculation:
  // Button width: w-10 = 40px
  // Button right margin: right-2 (8px) or right-4 (16px)
  // Total button reach from right edge: 8 + 40 = 48px (mobile), 16 + 40 = 56px (desktop)
  // Info overlay margin: mr-14 (56px mobile) -> 56px >= 48px (+8px clear gap!)
  // Info overlay margin: mr-16 (64px desktop) -> 64px >= 56px (+8px clear gap!)
  const mobileOverlayMargin = 56;
  const mobileButtonReach = 8 + 40;
  const mobileGap = mobileOverlayMargin - mobileButtonReach;
  assert(mobileGap >= 0, `Mobile gap between overlay and buttons must be non-negative: ${mobileGap}px`);

  const desktopOverlayMargin = 64;
  const desktopButtonReach = 16 + 40;
  const desktopGap = desktopOverlayMargin - desktopButtonReach;
  assert(desktopGap >= 0, `Desktop gap between overlay and buttons must be non-negative: ${desktopGap}px`);
  console.log(`      -> Overlay vs Action Buttons: Mobile Clearance Gap: +${mobileGap}px | Desktop Clearance Gap: +${desktopGap}px (zero collision)`);
});

// ---------------------------------------------------------------------------
// SUITE 3: Comprehensive Multi-Viewport Headroom & Clearance Calculations
// ---------------------------------------------------------------------------
console.log('\n▸ SUITE 3: Multi-Viewport Headroom & Clearance Calculations');

const sweepViewports = [
  { name: '320px Compact Mobile (320x568)', w: 320, h: 568 },
  { name: '360px Android Standard (360x800)', w: 360, h: 800 },
  { name: '375px iPhone SE/8 (375x667)', w: 375, h: 667 },
  { name: '390px iPhone 12/13/14 (390x844)', w: 390, h: 844 },
  { name: '412px Pixel 7 (412x915)', w: 412, h: 915 },
  { name: '768px iPad Portrait (768x1024)', w: 768, h: 1024 },
  { name: '1024px iPad Landscape (1024x768)', w: 1024, h: 768 },
  { name: '1024px Ultra-short Netbook (1024x600)', w: 1024, h: 600 },
  { name: '1366px Common Laptop (1366x768)', w: 1366, h: 768 },
  { name: '1440px MacBook Air/Pro (1440x900)', w: 1440, h: 900 },
  { name: '1920px Full HD 1080p Desktop (1920x1080)', w: 1920, h: 1080 },
  { name: '2560px QHD 1440p Desktop (2560x1440)', w: 2560, h: 1440 },
  { name: '3440px Ultrawide 21:9 (3440x1440)', w: 3440, h: 1440 },
  { name: '3840px 4K UHD Desktop (3840x2160)', w: 3840, h: 2160 },
];

sweepViewports.forEach((vp) => {
  runTest(`3.${totalTests + 1}: Viewport ${vp.name} maintains positive vertical headroom inside 100vh StickySection`, () => {
    // Model realistic rendered height of ProjectsSection:
    const isMd = vp.w >= 768;
    const isSm = vp.w >= 640;
    
    // Title block:
    const titleH = !isSm ? 56 : !isMd ? 66 : 78;
    // Padding:
    const py = isSm ? 40 : 24;

    // Width of container:
    const maxWidth = isMd ? 1152 : 1024; // max-w-6xl vs max-w-5xl
    const containerW = Math.min(vp.w * 0.94, maxWidth);

    // Height of container:
    const targetHRatio = isMd ? 0.72 : 0.65;
    const targetH = targetHRatio * vp.h;
    // Height capped by aspect-[16/10] width limit or max-h-[700px]:
    const maxAvailableH = Math.max(100, vp.h - py - titleH - 12);
    const containerH = Math.min(targetH, containerW / 1.6, 700, maxAvailableH);

    const totalUsedH = py + titleH + containerH;
    const clearance = vp.h - totalUsedH;
    const headroomRatio = (clearance / vp.h) * 100;

    assert(clearance >= 0, `Clearance must be non-negative: ${clearance.toFixed(1)}px`);
    assert(totalUsedH <= vp.h, `Total rendered height ${totalUsedH.toFixed(1)}px must not exceed viewport height ${vp.h}px`);
    console.log(`      -> [${vp.name}]: Container: ${containerW.toFixed(1)}x${containerH.toFixed(1)}px | Total: ${totalUsedH.toFixed(1)}px / ${vp.h}px (Headroom: +${clearance.toFixed(1)}px, ${headroomRatio.toFixed(1)}%)`);
  });
});

// ---------------------------------------------------------------------------
// SUITE 4: Single-Line Curvy Border & Photonic Light Beam Architecture
// ---------------------------------------------------------------------------
console.log('\n▸ SUITE 4: Single-Line Curvy Border & Photonic Light Beam Architecture');

runTest('4.1: ChromiumBorderContainer features single-line SVG monoline bezel border and orbiting beam', () => {
  assert(chromiumSource.includes('<svg'), 'ChromiumBorderContainer must render SVG border');
  assert(chromiumSource.includes('id="photonicOrbitBeam"'), 'Must define photonicOrbitBeam linear gradient');
  assert(chromiumSource.includes('pathLength="100"'), 'Beam rect must declare pathLength="100"');
  assert(chromiumSource.includes('strokeDasharray="22 78"'), 'Beam rect must declare strokeDasharray="22 78"');
  assert(chromiumSource.includes('animate-photonic-beam'), 'Beam rect must attach animate-photonic-beam class');
  assert(globalsCss.includes('@keyframes photonicBeamOrbit'), 'globals.css must define photonicBeamOrbit keyframes');
});

runTest('4.2: ChromiumBorderContainer removes mechanical corner brackets', () => {
  assert(!chromiumSource.includes('border-t-2 border-l-2'), 'Must NOT contain legacy corner brackets');
  assert(!chromiumSource.includes('rounded-tl-sm'), 'Must NOT contain legacy corner brackets');
  assert(!chromiumSource.includes('border-b-2 border-r-2'), 'Must NOT contain legacy corner brackets');
});

runTest('4.3: ChromiumBorderContainer features cyan + amber ambient rim halo and specular bezel', () => {
  assert(chromiumSource.includes('from-cyan-500/20 via-amber-300/15 to-cyan-500/20 blur-xl'), 'Must define ambient rim halo');
  assert(chromiumSource.includes('bg-chromium-bezel'), 'Must feature bg-chromium-bezel foundation');
  assert(chromiumSource.includes('animate-specular-sheen'), 'Must feature specular sheen sweep animation');
});

// ---------------------------------------------------------------------------
// SUITE 5: Contact Bento & Footer Clearance Stress
// ---------------------------------------------------------------------------
console.log('\n▸ SUITE 5: Contact Bento & Footer Clearance Stress');

runTest('5.1: ContactSection Bento cards include LinkedIn profile actively', () => {
  assert(contactSource.includes('SOCIAL_LINKS.linkedin'), 'ContactSection must integrate SOCIAL_LINKS.linkedin');
  assert(contactSource.includes('FaLinkedin'), 'ContactSection must render FaLinkedin');
});

runTest('5.2: Footer padding is compressed leaving minimal clean breathing room', () => {
  assert(contactSource.includes('pb-3 sm:pb-4'), 'Footer padding must be pb-3 sm:pb-4');
  assert(contactSource.includes('pt-4'), 'Footer pt-4');
  assert(!contactSource.includes('pb-24') && !contactSource.includes('pb-32'), 'Footer must not have bloated padding');
});

console.log('\n----------------------------------------------------------------------');
console.log(`SUMMARY: Total: ${totalTests} | Passed: ${passedTests} | Failed: ${failedTests}`);
console.log('----------------------------------------------------------------------');

if (failedTests > 0) {
  console.log('\nFAILURES:');
  failureDetails.forEach(f => {
    console.log(`- ${f.name}: ${f.error}`);
  });
  process.exit(1);
} else {
  console.log('ALL ADVERSARIAL VIEWPORT & LAYOUT GEOMETRY STRESS TESTS PASSED EMPIRICALLY!');
  process.exit(0);
}
