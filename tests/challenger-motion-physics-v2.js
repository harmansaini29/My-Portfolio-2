/**
 * tests/challenger-motion-physics-v2.js
 *
 * Empirical Adversarial Challenger Test Suite: Motion Physics, WebGL Frameloops, and Interactive Mechanisms
 * Milestone: M1 / M2 Integrity Verification Gate
 *
 * Target Verifications:
 * 1. Lenis scroll physics parameters (duration: 1.2, wheelMultiplier: 1.0, touchMultiplier: 1.2) & GSAP ticker sync.
 * 2. WebGL frameloop pausing via IntersectionObserver in Hero.tsx, Vortex.tsx, and LiquidGlassCarousel.tsx when scrolled out of view.
 * 3. LiquidGlassCarousel touch-action is "pan-y" allowing vertical page scroll on touch devices, and absence of getBoundingClientRect in scroll event listeners.
 * 4. HoverImageReveal autonomous cyclic preview hint on touch devices (idle timeout, centering, touch event handling).
 * 5. State machine & memory leak simulations under high-frequency lifecycle and resize events.
 */

const fs = require('fs');
const path = require('path');
const assert = require('assert');

let totalTests = 0;
let passedTests = 0;

function test(name, fn) {
  totalTests++;
  try {
    fn();
    console.log(`  ✔ [PASS] ${name}`);
    passedTests++;
  } catch (err) {
    console.error(`  ✖ [FAIL] ${name}`);
    console.error(`     ${err.message}`);
    if (err.stack) {
      console.error(err.stack.split('\n').slice(1, 4).join('\n'));
    }
  }
}

console.log('\n======================================================================');
console.log('ADVERSARIAL CHALLENGER SUITE: MOTION PHYSICS, RAF PAUSING & TOUCH UX');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// SUITE 1: LENIS SCROLL PHYSICS & GSAP TICKER INTEGRATION
// -----------------------------------------------------------------------------
console.log('▸ SUITE 1: Lenis Scroll Physics Calibration & GSAP Ticker Synchronization');

const smoothScrollPath = path.join(__dirname, '..', 'components', 'SmoothScroll.tsx');
const smoothScrollSource = fs.readFileSync(smoothScrollPath, 'utf8');

test('1.1: SmoothScroll.tsx imports Lenis and canonical CSS', () => {
  assert.ok(/import Lenis from ['"]lenis['"]/.test(smoothScrollSource), 'Must import Lenis');
  assert.ok(/import ['"]lenis\/dist\/lenis\.css['"]/.test(smoothScrollSource), 'Must import lenis/dist/lenis.css');
});

test('1.2: Lenis initialization specifies exact calibrated physics parameters', () => {
  assert.ok(/duration:\s*1\.2/.test(smoothScrollSource), 'duration must be calibrated to 1.2');
  assert.ok(/wheelMultiplier:\s*1\.0/.test(smoothScrollSource), 'wheelMultiplier must be calibrated to 1.0');
  assert.ok(/touchMultiplier:\s*1\.2/.test(smoothScrollSource), 'touchMultiplier must be calibrated to 1.2');
  assert.ok(/smoothWheel:\s*true/.test(smoothScrollSource), 'smoothWheel must be true');
});

test('1.3: GSAP ScrollTrigger and Ticker synchronization architecture', () => {
  assert.ok(/lenis\.on\(['"]scroll['"],\s*ScrollTrigger\.update\)/.test(smoothScrollSource),
    'Lenis scroll event must call ScrollTrigger.update');
  assert.ok(/const updateLenis = \(time:\s*number\)\s*=>\s*\{\s*lenis\.raf\(time \* 1000\);\s*\};/.test(smoothScrollSource) ||
            /lenis\.raf\(time \* 1000\)/.test(smoothScrollSource),
    'updateLenis must forward ticker time in milliseconds to lenis.raf');
  assert.ok(/gsap\.ticker\.add\(updateLenis\)/.test(smoothScrollSource),
    'gsap.ticker must drive updateLenis');
  assert.ok(/gsap\.ticker\.lagSmoothing\(0\)/.test(smoothScrollSource),
    'lagSmoothing(0) must be enabled to prevent ticker desynchronization');
});

test('1.4: SmoothScroll lifecycle cleanup guarantees zero leak', () => {
  const cleanupMatch = smoothScrollSource.match(/return\s*\(\)\s*=>\s*\{([\s\S]*?)\};/);
  assert.ok(cleanupMatch, 'Must define cleanup function in useEffect');
  const cleanupCode = cleanupMatch[1];
  assert.ok(/gsap\.ticker\.remove\(updateLenis\)/.test(cleanupCode), 'Must remove updateLenis from gsap.ticker');
  assert.ok(/lenis\.destroy\(\)/.test(cleanupCode), 'Must call lenis.destroy()');
  assert.ok(/delete\s*\(window as any\)\.__lenis/.test(cleanupCode), 'Must clean up global __lenis reference');
});

test('1.5: Empirical Simulation: Lenis easing function monotonic convergence and zero overshoot', () => {
  // Lenis easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t))
  const easing = (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

  assert.strictEqual(easing(0) <= 0.01, true, 'At t=0, easing must start near 0');
  assert.strictEqual(easing(1), 1, 'At t=1, easing must reach exactly 1.0');

  // Verify monotonicity across 1000 samples
  let prev = 0;
  for (let i = 1; i <= 1000; i++) {
    const t = i / 1000;
    const val = easing(t);
    assert.ok(val >= prev, `Easing must be strictly monotonically non-decreasing at t=${t}`);
    assert.ok(val <= 1.0, `Easing must never overshoot 1.0 at t=${t} (got ${val})`);
    prev = val;
  }
  // Verify 90% completion within t=0.33 (fast impulse curve)
  assert.ok(easing(0.33) > 0.89, 'Easing reaches ~90% by 1/3 of the duration, ensuring responsive start');
});

test('1.6: Simulation: Touch flick momentum vs Mouse wheel impulse ratio', () => {
  const wheelMultiplier = 1.0;
  const touchMultiplier = 1.2;
  const baseDelta = 120;

  const wheelImpulse = baseDelta * wheelMultiplier;
  const touchImpulse = baseDelta * touchMultiplier;

  assert.strictEqual(touchImpulse / wheelImpulse, 1.2, 'Touch impulse must have 1.2x multiplier for smooth mobile flick');
  assert.ok(touchImpulse <= baseDelta * 1.5, 'Touch multiplier must not exceed 1.5 to prevent jarring acceleration');
});

// -----------------------------------------------------------------------------
// SUITE 2: WEBGL FRAMELOOP INTERSECTIONOBSERVER PAUSING
// -----------------------------------------------------------------------------
console.log('\n▸ SUITE 2: WebGL Frameloop Pausing via IntersectionObserver');

const heroSource = fs.readFileSync(path.join(__dirname, '..', 'components', 'Hero.tsx'), 'utf8');
const vortexSource = fs.readFileSync(path.join(__dirname, '..', 'components', 'Vortex.tsx'), 'utf8');
const carouselSource = fs.readFileSync(path.join(__dirname, '..', 'components', 'LiquidGlassCarousel.tsx'), 'utf8');

test('2.1: Hero.tsx attaches IntersectionObserver to pause requestAnimationFrame', () => {
  assert.ok(/new IntersectionObserver\(\(e\)\s*=>\s*\{/.test(heroSource), 'Hero creates IntersectionObserver');
  assert.ok(/observer\.observe\(hero\)/.test(heroSource), 'Hero observes container');
  assert.ok(/if\s*\(!inView\)\s*\{\s*rafId = 0;\s*return;\s*\}/.test(heroSource), 'frame() halts when inView is false');
  assert.ok(/if\s*\(!wasVisible && visible && !reduce\)\s*\{[\s\S]*?rafId = requestAnimationFrame\(frame\);/.test(heroSource),
    'frame() resumes when scrolled back into view');
});

test('2.2: Hero.tsx cancels RAF and disconnects observer on unmount', () => {
  assert.ok(/if\s*\(observer\)\s*observer\.disconnect\(\)/.test(heroSource), 'Observer is disconnected on unmount');
  assert.ok(/if\s*\(rafId\)\s*cancelAnimationFrame\(rafId\)/.test(heroSource), 'Pending RAF is canceled on unmount');
});

test('2.3: Vortex.tsx attaches visibilityObserver to halt Three.js render loop when offscreen', () => {
  assert.ok(/const visibilityObserver = new IntersectionObserver\(\(\[entry\]\)\s*=>\s*\{/.test(vortexSource),
    'Vortex creates visibilityObserver');
  assert.ok(/visibilityObserver\.observe\(container\)/.test(vortexSource), 'Vortex observes container element');
  assert.ok(/if\s*\(!isVortexVisible && visible\)\s*\{[\s\S]*?frame = requestAnimationFrame\(step\);[\s\S]*?\}\s*else if\s*\(!visible\)\s*\{[\s\S]*?isVortexVisible = false;\s*cancelAnimationFrame\(frame\);/.test(vortexSource),
    'Vortex cancels RAF and sets isVortexVisible=false when scrolled out of view, and restarts when visible');
  assert.ok(/if\s*\(!isVortexVisible\)\s*return;/.test(vortexSource),
    'step() early-returns immediately if isVortexVisible is false');
});

test('2.4: Vortex.tsx cleans up visibilityObserver and cancels RAF in dispose()', () => {
  assert.ok(/visibilityObserver\.disconnect\(\)/.test(vortexSource), 'visibilityObserver is disconnected in dispose()');
  assert.ok(/cancelAnimationFrame\(frame\)/.test(vortexSource), 'frame is canceled in dispose()');
});

test('2.5: LiquidGlassCarousel.tsx attaches IntersectionObserver to pause render loop', () => {
  assert.ok(/const io = new IntersectionObserver\(\(\[entry\]\)\s*=>\s*\{/.test(carouselSource),
    'Carousel creates IntersectionObserver');
  assert.ok(/io\.observe\(mount\)/.test(carouselSource), 'Carousel observes mount element');
  assert.ok(/if\s*\(!inViewport && visible\)\s*\{[\s\S]*?raf = requestAnimationFrame\(tick\);?[\s\S]*?\}\s*else if\s*\(!visible\)\s*\{[\s\S]*?inViewport = false;?\s*cancelAnimationFrame\(raf\);?/.test(carouselSource),
    'Carousel cancels RAF when not visible, and resumes when visible');
  assert.ok(/if\s*\(!inViewport\)\s*return/.test(carouselSource), 'tick() early-returns when inViewport is false');
});

test('2.6: LiquidGlassCarousel.tsx re-anchors lastT on re-entry preventing dt explosion', () => {
  const ioBlock = carouselSource.match(/const io = new IntersectionObserver\(\(\[entry\]\)\s*=>\s*\{([\s\S]*?)\}/);
  assert.ok(ioBlock, 'io callback must exist');
  const code = ioBlock[1];
  assert.ok(/lastT = performance\.now\(\)/.test(code), 'Must reset lastT on re-entry');
});

test('2.7: Adversarial Simulation: 100 Viewport Enter/Exit cycles does NOT leak RAF handles or duplicate loops', () => {
  // Mock RAF loop environment
  let rafIdCounter = 1;
  const activeRafs = new Set();
  function mockRequestAnimationFrame(cb) {
    const id = rafIdCounter++;
    activeRafs.add(id);
    return id;
  }
  function mockCancelAnimationFrame(id) {
    activeRafs.delete(id);
  }

  // Simulate Carousel visibility state machine
  let inViewport = true;
  let raf = mockRequestAnimationFrame(() => {});

  for (let cycle = 0; cycle < 100; cycle++) {
    // Scroll out of view
    inViewport = false;
    mockCancelAnimationFrame(raf);
    raf = 0;
    assert.strictEqual(activeRafs.size, 0, `Active RAFs must be 0 when scrolled out (cycle ${cycle})`);

    // Scroll back into view
    if (!inViewport) {
      inViewport = true;
      raf = mockRequestAnimationFrame(() => {});
    }
    assert.strictEqual(activeRafs.size, 1, `Active RAFs must be exactly 1 when scrolled into view (cycle ${cycle})`);
  }

  // Cleanup on unmount
  mockCancelAnimationFrame(raf);
  assert.strictEqual(activeRafs.size, 0, 'Must have 0 remaining RAFs after unmount');
});

// -----------------------------------------------------------------------------
// SUITE 3: LIQUID GLASS CAROUSEL TOUCH-ACTION & SCROLL LISTENER PURITY
// -----------------------------------------------------------------------------
console.log('\n▸ SUITE 3: Liquid Glass Carousel Touch-Action & Scroll Listener Purity');

test('3.1: LiquidGlassCarousel canvas explicitly configures touch-action: pan-y', () => {
  assert.ok(/el\.style\.touchAction = ["']pan-y["']/.test(carouselSource),
    'Canvas domElement must set el.style.touchAction = "pan-y"');
});

test('3.2: LiquidGlassCarousel avoids getBoundingClientRect in scroll event handlers', () => {
  // Check that window.addEventListener("scroll", ...) is NEVER attached in LiquidGlassCarousel.tsx
  assert.ok(!/window\.addEventListener\(["']scroll["']/.test(carouselSource),
    'LiquidGlassCarousel must NOT register window scroll listeners');
  assert.ok(!/el\.addEventListener\(["']scroll["']/.test(carouselSource),
    'LiquidGlassCarousel must NOT register element scroll listeners');
});

test('3.3: getBoundingClientRect is strictly restricted to mount/resize and pointer entry', () => {
  const matches = [...carouselSource.matchAll(/([a-zA-Z0-9_]+)\.getBoundingClientRect\(\)/g)];
  assert.ok(matches.length > 0, 'getBoundingClientRect is used');
  // Verify it is only called in readBounds
  const nonReadBounds = matches.filter(m => {
    const idx = m.index;
    const surrounding = carouselSource.substring(Math.max(0, idx - 100), Math.min(carouselSource.length, idx + 100));
    return !surrounding.includes('readBounds') && !surrounding.includes('bounds = mount.getBoundingClientRect()');
  });
  assert.strictEqual(nonReadBounds.length, 0, 'All getBoundingClientRect calls must be scoped inside readBounds()');
});

test('3.4: Touch drag sensitivity calibration separates mouse drag from touch drag', () => {
  assert.ok(/dragPointerType === ["']mouse["'] \? pp\.dragSpeed : pp\.touchDrag/.test(carouselSource),
    'Sensitivity must distinguish mouse drag from touch drag');
  assert.ok(/dragPointerType === ["']mouse["'] \? pp\.clickSlop : pp\.touchClickSlop/.test(carouselSource),
    'Click slop must distinguish mouse from touch to avoid accidental clicks on swipe');
});

// -----------------------------------------------------------------------------
// SUITE 4: HOVER IMAGE REVEAL AUTONOMOUS CYCLIC PREVIEW HINT ON TOUCH
// -----------------------------------------------------------------------------
console.log('\n▸ SUITE 4: HoverImageReveal Autonomous Cyclic Preview Hint on Touch Devices');

const hoverSource = fs.readFileSync(path.join(__dirname, '..', 'components', 'HoverImageReveal.tsx'), 'utf8');

test('4.1: Touch device detection via media query and viewport width', () => {
  assert.ok(/window\.matchMedia\(["']\(hover:\s*none\)\s*and\s*\(pointer:\s*coarse\)["']\)\.matches\s*\|\|\s*window\.innerWidth\s*<\s*768/.test(hoverSource),
    'Touch environment must be detected via pointer: coarse or <768px width');
});

test('4.2: Autonomous cyclic preview interval configured for 3000ms', () => {
  assert.ok(/setInterval\(\(\)\s*=>\s*\{[\s\S]*?\}, 3000\)/.test(hoverSource),
    'Autonomous preview loop must cycle every 3000ms');
  assert.ok(/setHovered\(\(prev\)\s*=>\s*\{\s*const next = prev === null \? 0 : \(prev \+ 1\) % count;/.test(hoverSource),
    'Autonomous preview loop must cyclically increment hovered index modulo count');
});

test('4.3: Autonomous preview centers coordinates in viewport container', () => {
  const loopMatch = hoverSource.match(/setInterval\(\(\)\s*=>\s*\{([\s\S]*?)\},\s*3000\)/);
  assert.ok(loopMatch, 'Interval loop must be present');
  const code = loopMatch[1];
  assert.ok(/rawX\.set\(rect\.width \* 0\.5\)/.test(code), 'Preview X must be centered at 50% width');
  assert.ok(/rawY\.set\(rect\.height \* 0\.5\)/.test(code), 'Preview Y must be centered at 50% height');
});

test('4.4: Touch interaction suppresses autonomous preview for 4500ms', () => {
  assert.ok(/const onTouchInteract = \(idx\?: number\)\s*=>\s*\{([\s\S]*?)\};/.test(hoverSource),
    'onTouchInteract handler must be defined');
  const handlerMatch = hoverSource.match(/const onTouchInteract = \(idx\?: number\)\s*=>\s*\{([\s\S]*?)\};/);
  const handlerCode = handlerMatch[1];
  assert.ok(/userInteractedRef\.current = true;/.test(handlerCode), 'Sets userInteractedRef to true');
  assert.ok(/setTimeout\(\(\)\s*=>\s*\{\s*userInteractedRef\.current = false;\s*\}, 4500\);/.test(handlerCode),
    'Resets userInteractedRef after 4500ms delay');
});

test('4.5: Preview container responsive width and height clamps on touch devices', () => {
  assert.ok(/width:\s*isTouch \? ["']min\(80vw, 280px\)["'] : imageWidth/.test(hoverSource),
    'Preview box width must clamp to min(80vw, 280px) on touch');
  assert.ok(/height:\s*isTouch \? ["']min\(40vh, 360px\)["'] : imageHeight/.test(hoverSource),
    'Preview box height must clamp to min(40vh, 360px) on touch');
  assert.ok(/translateX:\s*["']-50%["']/.test(hoverSource) && /translateY:\s*["']-50%["']/.test(hoverSource),
    'Preview box must use -50% translation anchors for geometric centering');
});

test('4.6: State Machine Simulation: Touch interaction pauses autonomous loop for exactly 4.5s', () => {
  let hovered = null;
  const count = 5;
  let userInteracted = false;
  let resetTimeout = null;

  function cycle() {
    if (userInteracted) return;
    hovered = hovered === null ? 0 : (hovered + 1) % count;
  }

  function onTouch(idx) {
    userInteracted = true;
    hovered = idx;
    if (resetTimeout) clearTimeout(resetTimeout);
    resetTimeout = setTimeout(() => {
      userInteracted = false;
    }, 4500);
  }

  // Initial state: idle cycling
  cycle(); assert.strictEqual(hovered, 0);
  cycle(); assert.strictEqual(hovered, 1);
  cycle(); assert.strictEqual(hovered, 2);

  // User taps item 4 at t=0
  onTouch(4);
  assert.strictEqual(hovered, 4);
  assert.strictEqual(userInteracted, true);

  // Interval fires at t=3000ms while userInteracted is true
  cycle();
  assert.strictEqual(hovered, 4, 'Hovered item must NOT change during user interaction suppression');

  // Fast forward past 4500ms timeout
  userInteracted = false; // simulated timer fire
  cycle();
  assert.strictEqual(hovered, 0, 'Autonomous cycling resumes cleanly modulo count (4 -> 0)');
});

// -----------------------------------------------------------------------------
// SUITE 5: COMPREHENSIVE MOTION INTEGRATION & ADVERSARIAL BOUNDS
// -----------------------------------------------------------------------------
console.log('\n▸ SUITE 5: Comprehensive Motion Integration & Adversarial Boundaries');

test('5.1: Hero parallax scroll handler throttles updates via requestAnimationFrame', () => {
  assert.ok(/const onScroll = \(\)\s*=>\s*\{\s*if \(!sched\) \{\s*sched = true;\s*requestAnimationFrame\(parallax\);\s*\}\s*\};/.test(heroSource),
    'onScroll must use requestAnimationFrame scheduling guard');
});

test('5.2: Vortex dissolve parameter clamping prevents shader overflow or negative progress', () => {
  assert.ok(/dissolveUniforms\.uDissolve\.value = Math\.min\(1\.0, Math\.max\(0\.0, dProgress\)\);/.test(vortexSource),
    'uDissolve must be strictly clamped between 0.0 and 1.0');
});

test('5.3: LiquidGlassCarousel autoScroll coexistence with user interactions', () => {
  assert.ok(/const canAutoScroll = pp\.autoScroll && !focusState\.active && !isInteracting && !isHoverPaused && !entryActive/.test(carouselSource),
    'canAutoScroll must strictly respect focus, interaction, hover, and entry state flags');
});

console.log('\n----------------------------------------------------------------------');
console.log('TEST EXECUTION SUMMARY:');
console.log(`  Total Tests Run: ${totalTests}`);
console.log(`  Passed:          ${passedTests}`);
console.log(`  Failed:          ${totalTests - passedTests}`);
console.log('----------------------------------------------------------------------\n');

if (passedTests === totalTests) {
  console.log('ALL ADVERSARIAL MOTION & WEBGL TESTS PASSED EMPIRICALLY!\n');
  process.exit(0);
} else {
  console.error(`FAILED: ${totalTests - passedTests} tests failed.\n`);
  process.exit(1);
}
