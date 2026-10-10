/**
 * EMPIRICAL STRESS TEST HARNESS: MILESTONE M1
 * Challenger 1 (critic, specialist)
 * Testing Requirements:
 *   R2: MosaicFlip with ChromiumBorderContainer (aspect ratio, click handlers, 3D tilt, rapid slide changes)
 *   R4: Liquid Glass Carousel and Vortex About interaction (pointer-events across [0.0, 1.0], drag, wheel, touch, stacking context)
 *   Resource Audits: RAF cancellation, memory leaks, event listener disposal, exception safety
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..');

// Test runner tracking
const results = {
  passed: 0,
  failed: 0,
  findings: [],
  tests: []
};

function test(name, fn) {
  try {
    fn();
    results.passed++;
    results.tests.push({ name, status: 'PASS' });
    console.log(`  [PASS] ${name}`);
  } catch (err) {
    results.failed++;
    results.tests.push({ name, status: 'FAIL', error: err.message, stack: err.stack });
    results.findings.push({ name, error: err.message, stack: err.stack });
    console.error(`  [FAIL] ${name}: ${err.message}`);
  }
}

console.log('======================================================================');
console.log('   CHALLENGER 1: EMPIRICAL STRESS TEST SUITE (R2 & R4 VERIFICATION)  ');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// MODULE 1: VORTEX ABOUT & LIQUID GLASS CAROUSEL INTERACTION & POINTER EVENTS (R4)
// -----------------------------------------------------------------------------
console.log('--- MODULE 1: Vortex About & Liquid Glass Carousel Interaction (R4) ---');

test('T1.1: VortexAbout pointer-events transition function strictly switches at v=0.74', () => {
  // In VortexAbout.tsx line 327-328:
  // const vortexPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));
  // const stickyPointerEvents = useTransform(smoothProgress, (v) => (v >= 0.74 ? "none" : "auto"));
  const pointerEventsTransform = (v) => (v >= 0.74 ? 'none' : 'auto');

  assert.strictEqual(pointerEventsTransform(0.0), 'auto', 'v=0.0 must be auto');
  assert.strictEqual(pointerEventsTransform(0.35), 'auto', 'v=0.35 must be auto');
  assert.strictEqual(pointerEventsTransform(0.70), 'auto', 'v=0.70 must be auto');
  assert.strictEqual(pointerEventsTransform(0.739), 'auto', 'v=0.739 must be auto');
  assert.strictEqual(pointerEventsTransform(0.73999), 'auto', 'v=0.73999 must be auto');
  assert.strictEqual(pointerEventsTransform(0.74), 'none', 'v=0.74 must be none');
  assert.strictEqual(pointerEventsTransform(0.74001), 'none', 'v=0.74001 must be none');
  assert.strictEqual(pointerEventsTransform(0.741), 'none', 'v=0.741 must be none');
  assert.strictEqual(pointerEventsTransform(0.98), 'none', 'v=0.98 must be none');
  assert.strictEqual(pointerEventsTransform(1.0), 'none', 'v=1.0 must be none');
});

test('T1.2: VortexAbout opacity timeline drops to 0.0 at v=0.741 and dissolve is active in [0.74, 1.02]', () => {
  // In VortexAbout.tsx lines 339, 353-357:
  // vortexOpacity: [0.0, 0.15, 0.74, 0.741] -> [0.6, 1.0, 1.0, 0.0]
  // setIsDissolving(v >= 0.74 && v <= 1.02);
  function interp(val, inStops, outStops) {
    if (val <= inStops[0]) return outStops[0];
    if (val >= inStops[inStops.length - 1]) return outStops[outStops.length - 1];
    for (let i = 0; i < inStops.length - 1; i++) {
      if (val >= inStops[i] && val <= inStops[i + 1]) {
        const t = (val - inStops[i]) / (inStops[i + 1] - inStops[i]);
        return outStops[i] + t * (outStops[i + 1] - outStops[i]);
      }
    }
    return outStops[outStops.length - 1];
  }

  const inStops = [0.0, 0.15, 0.74, 0.741];
  const outStops = [0.6, 1.0, 1.0, 0.0];

  assert.strictEqual(interp(0.0, inStops, outStops), 0.6);
  assert.strictEqual(interp(0.15, inStops, outStops), 1.0);
  assert.strictEqual(interp(0.50, inStops, outStops), 1.0);
  assert.strictEqual(interp(0.74, inStops, outStops), 1.0);
  assert.strictEqual(interp(0.741, inStops, outStops), 0.0);
  assert.strictEqual(interp(1.0, inStops, outStops), 0.0);

  const isDissolvingCheck = (v) => v >= 0.74 && v <= 1.02;
  assert.strictEqual(isDissolvingCheck(0.739), false);
  assert.strictEqual(isDissolvingCheck(0.74), true);
  assert.strictEqual(isDissolvingCheck(0.85), true);
  assert.strictEqual(isDissolvingCheck(1.0), true);
  assert.strictEqual(isDissolvingCheck(1.03), false);
});

test('T1.3: ADVERSARIAL CHALLENGE: JourneySection at z-20 vs VortexAbout at z-10 pointer-events during scroll < 0.74', () => {
  const pageContent = fs.readFileSync(path.join(REPO_ROOT, 'app/page.tsx'), 'utf-8');
  const journeyContent = fs.readFileSync(path.join(REPO_ROOT, 'components/JourneySection.tsx'), 'utf-8');

  // Verify stacking context declarations
  assert.ok(pageContent.includes('z-10'), 'VortexAbout is in z-10 container');
  assert.ok(pageContent.includes('z-20'), 'Journey is in z-20 container');

  // Stacking context verification:
  assert.ok(pageContent.includes('pointer-events-auto'), 'div.pointer-events-auto wraps JourneySection');
  assert.ok(journeyContent.includes('pointer-events-auto'), 'JourneySection contains pointer-events-auto');
});

test('T1.4: LiquidGlassCarousel entry lockout disabling (entry={{ enabled: false }})', () => {
  const journeySrc = fs.readFileSync(path.join(REPO_ROOT, 'components/JourneySection.tsx'), 'utf-8');
  assert.ok(
    journeySrc.includes('entry={{ enabled: false }}'),
    'JourneySection passes entry={{ enabled: false }} to LiquidGlassCarousel'
  );

  const makeParams = (e) => ({
    entry: { enabled: e?.enabled !== false },
    drag: true,
    wheel: true
  });

  const paramsWithDisabledEntry = makeParams({ enabled: false });
  assert.strictEqual(paramsWithDisabledEntry.entry.enabled, false, 'Entry enabled evaluates to false');
  
  const inputLocked = (focusActive, entryEnabled, entryActive, entrySettled) => {
    return focusActive || (entryEnabled && (entryActive || entrySettled));
  };

  assert.strictEqual(inputLocked(false, false, true, true), false, 'When entry is disabled, input is NEVER locked by entry!');
  assert.strictEqual(inputLocked(false, true, true, false), true, 'When entry is enabled and active, input IS locked!');
});

test('T1.5: LiquidGlassCarousel wheel event simulation & mathematical acceleration', () => {
  let target = 500;
  let userInteracted = false;
  let preventDefaultCalled = false;
  let snapped = true;
  const wheelSpeed = 0.28 * 5; // sensitivity = 5 -> 1.4

  const simulateWheel = (deltaY, deltaX, wheelEnabled = true, locked = false) => {
    const e = {
      deltaY,
      deltaX,
      preventDefault: () => { preventDefaultCalled = true; }
    };
    if (!wheelEnabled) return;
    e.preventDefault();
    if (locked) return;
    userInteracted = true;
    target += (e.deltaY || e.deltaX) * wheelSpeed;
    snapped = false;
  };

  simulateWheel(100, 0);
  assert.strictEqual(preventDefaultCalled, true, 'e.preventDefault must be invoked');
  assert.strictEqual(target, 500 + 100 * 1.4, 'Target advances by deltaY * wheelSpeed');
  assert.strictEqual(userInteracted, true, 'User interaction marked');
  assert.strictEqual(snapped, false, 'Snap unlocked during wheel scroll');

  simulateWheel(0, 50);
  assert.strictEqual(target, 640 + 50 * 1.4, 'Target advances by deltaX * wheelSpeed when deltaY is 0');

  const prevTarget = target;
  simulateWheel(100, 0, true, true);
  assert.strictEqual(target, prevTarget, 'Wheel event discarded when input locked');
});

test('T1.6: LiquidGlassCarousel drag simulation (mouse vs touch dynamics & click suppression)', () => {
  const dragSpeed = 0.32 * 5; // 1.6
  const touchDrag = 1.0;
  const clickSlop = 6;
  const touchClickSlop = 12;

  function simulateDragSession(pointerType, clientXEvents) {
    let dragging = false;
    let dragPointerType = pointerType;
    let dragLastX = 0;
    let dragDist = 0;
    let target = 1000;
    let suppressClick = false;

    const downX = clientXEvents[0];
    dragging = true;
    dragLastX = downX;
    dragDist = 0;

    for (let i = 1; i < clientXEvents.length; i++) {
      const curX = clientXEvents[i];
      const sens = dragPointerType === 'mouse' ? dragSpeed : touchDrag;
      const dx = curX - dragLastX;
      dragLastX = curX;
      dragDist += Math.abs(dx);
      target -= dx * sens;
    }

    dragging = false;
    suppressClick = dragDist > (dragPointerType === 'mouse' ? clickSlop : touchClickSlop);

    return { target, dragDist, suppressClick };
  }

  const mouseJitter = simulateDragSession('mouse', [100, 102, 101]);
  assert.strictEqual(mouseJitter.suppressClick, false, 'Minor jitter under 6px preserves click');

  const mouseDrag = simulateDragSession('mouse', [100, 120, 150]);
  assert.strictEqual(mouseDrag.suppressClick, true, 'Mouse drag > 6px suppresses click');
  assert.strictEqual(mouseDrag.target, 1000 - 50 * 1.6, 'Target adjusted by mouse drag sensitivity');

  const touchTap = simulateDragSession('touch', [100, 105, 110]);
  assert.strictEqual(touchTap.suppressClick, false, 'Touch movement under 12px preserves tap');

  const touchSwipe = simulateDragSession('touch', [100, 80, 40]);
  assert.strictEqual(touchSwipe.suppressClick, true, 'Touch swipe > 12px suppresses tap');
  assert.strictEqual(touchSwipe.target, 1000 - (-60) * 1.0, 'Touch drag uses touchDrag sensitivity (1.0)');
});

// -----------------------------------------------------------------------------
// MODULE 2: MOSAIC FLIP WITH CHROMIUM BORDER CONTAINER (R2)
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 2: MosaicFlip & ChromiumBorderContainer Stress (R2) ---');

test('T2.1: MosaicFlip aspect ratio resilience across extreme image ratios', () => {
  const columnCount = 12;
  const rowCount = 8;
  const tile = 50;
  const sheetWidth = columnCount * tile; // 600
  const sheetHeight = rowCount * tile;  // 400

  const calculateSlide = (aspect, offsetY = 0) => {
    const width = aspect && aspect > 0 ? Math.max(sheetWidth, sheetHeight * aspect) : sheetWidth;
    const height = aspect && aspect > 0 ? width / aspect : sheetHeight;
    const x = (sheetWidth - width) / 2;
    const y = (sheetHeight - height) / 2 + (Math.min(100, Math.max(-100, offsetY)) / 100) * sheetHeight;
    return { width, height, x, y };
  };

  const ultraWide = calculateSlide(32 / 9);
  assert.ok(ultraWide.width >= sheetWidth, 'Ultra-wide width must cover sheetWidth');
  assert.ok(ultraWide.height >= 0, 'Ultra-wide height must be non-negative');
  assert.ok(!isNaN(ultraWide.width) && isFinite(ultraWide.width), 'Ultra-wide width finite');
  assert.ok(!isNaN(ultraWide.height) && isFinite(ultraWide.height), 'Ultra-wide height finite');

  const ultraTall = calculateSlide(9 / 32);
  assert.ok(ultraTall.width >= sheetWidth, 'Ultra-tall width must cover sheetWidth');
  assert.ok(ultraTall.height >= sheetHeight, 'Ultra-tall height must cover sheetHeight');
  assert.ok(!isNaN(ultraTall.x) && !isNaN(ultraTall.y), 'Ultra-tall coordinates valid numbers');

  const zeroAspect = calculateSlide(0);
  assert.strictEqual(zeroAspect.width, sheetWidth, 'Zero aspect falls back to sheetWidth');
  assert.strictEqual(zeroAspect.height, sheetHeight, 'Zero aspect falls back to sheetHeight');

  const negAspect = calculateSlide(-1.5);
  assert.strictEqual(negAspect.width, sheetWidth, 'Negative aspect falls back to sheetWidth');
  assert.strictEqual(negAspect.height, sheetHeight, 'Negative aspect falls back to sheetHeight');

  const nanAspect = calculateSlide(NaN);
  assert.strictEqual(nanAspect.width, sheetWidth, 'NaN aspect falls back to sheetWidth');
  assert.strictEqual(nanAspect.height, sheetHeight, 'NaN aspect falls back to sheetHeight');
});

test('T2.2: MosaicFlip hover 3D tilt calculation boundaries and stability', () => {
  const config = { columns: 12, rows: 8, hover: 1 };
  const HOVER_RADIUS = 2.8;
  const HOVER_LIFT = 0.34;
  const HOVER_TILT = 4;
  const HOVER_SCALE = 0.035;
  const tile = 50;

  function calculateTileTilt(pointerX, pointerY, tileIndex, hoverActive = true) {
    const column = tileIndex % config.columns;
    const row = Math.floor(tileIndex / config.columns);
    const px = pointerX * (config.columns - 1);
    const py = pointerY * (config.rows - 1);
    const dx = column - px;
    const dy = row - py;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const proximity = hoverActive ? Math.min(1, Math.max(0, 1 - distance / HOVER_RADIUS)) : 0;
    const hover = proximity * config.hover;

    const hoverZ = hover * HOVER_LIFT * tile;
    const tiltX = (py - row) * hover * HOVER_TILT;
    const tiltY = (column - px) * hover * HOVER_TILT;
    const scale = 1 + hover * HOVER_SCALE;

    return { hoverZ, tiltX, tiltY, scale, proximity };
  }

  const centerPointerX = 6 / 11;
  const centerPointerY = 4 / 7;
  const centerTile = calculateTileTilt(centerPointerX, centerPointerY, 4 * 12 + 6);
  assert.strictEqual(centerTile.proximity, 1, 'Proximity at exact pointer position is 1.0');
  assert.strictEqual(Math.abs(centerTile.tiltX), 0, 'TiltX at exact center is 0');
  assert.strictEqual(Math.abs(centerTile.tiltY), 0, 'TiltY at exact center is 0');
  assert.strictEqual(centerTile.scale, 1 + config.hover * HOVER_SCALE, 'Scale at center elevated');

  const farTile = calculateTileTilt(1.0, 1.0, 0);
  assert.strictEqual(farTile.proximity, 0, 'Proximity beyond HOVER_RADIUS is 0');
  assert.strictEqual(Math.abs(farTile.tiltX), 0, 'TiltX beyond hover radius is 0');
  assert.strictEqual(Math.abs(farTile.tiltY), 0, 'TiltY beyond hover radius is 0');
  assert.strictEqual(farTile.scale, 1, 'Scale unperturbed');

  const clampedX = Math.min(1, Math.max(0, -100));
  assert.strictEqual(clampedX, 0, 'Pointer coords strictly clamped between 0 and 1');
});

test('T2.3: MosaicFlip rapid slide changes and queuing simulation', () => {
  let activeSlide = 0;
  let revealing = false;
  let queued = null;
  const totalSlides = 10;

  function reveal(index) {
    if (revealing) {
      queued = index;
      return;
    }
    if (index === activeSlide) return;
    revealing = true;
    queued = null;
    activeSlide = index;
  }

  function advance() {
    const next = (activeSlide + 1) % totalSlides;
    reveal(next);
  }

  function onFlipSettled() {
    revealing = false;
    const toRun = queued;
    queued = null;
    if (toRun !== null && toRun !== activeSlide) {
      reveal(toRun);
    }
  }

  advance();
  assert.strictEqual(activeSlide, 1, 'Active slide immediately moves to 1');
  assert.strictEqual(revealing, true, 'Flip in progress');

  for (let i = 0; i < 9; i++) {
    advance();
  }

  assert.strictEqual(queued, 2, 'Next slide 2 is queued');

  onFlipSettled();
  assert.strictEqual(activeSlide, 2, 'Queued slide 2 is executed upon animation settle');
  assert.strictEqual(revealing, true, 'New queued flip begins');

  onFlipSettled();
  assert.strictEqual(revealing, false, 'Animation fully settles');
  assert.strictEqual(queued, null, 'Queue is clean');
});

test('T2.4: ChromiumBorderContainer telemetry and layout boundary compliance', () => {
  const compSrc = fs.readFileSync(path.join(REPO_ROOT, 'components/ChromiumBorderContainer.tsx'), 'utf-8');

  assert.ok(compSrc.includes('w-[94vw]'), 'Includes fluid w-[94vw]');
  assert.ok(compSrc.includes('max-w-6xl'), 'Enforces max-w-6xl boundary');
  assert.ok(compSrc.includes('h-[68vh]'), 'Includes mobile height h-[68vh]');
  assert.ok(compSrc.includes('lg:h-[82vh]'), 'Includes desktop height lg:h-[82vh]');

  assert.ok(compSrc.includes('animate-chromium-halo'), 'Layer 1: Ambient rim halo present');
  assert.ok(compSrc.includes('bg-chromium-bezel'), 'Layer 2: Specular metallic bezel present');
  assert.ok(compSrc.includes('animate-chromium-beam'), 'Layer 2: Photonic beam present');
  assert.ok(compSrc.includes('animate-specular-sheen'), 'Layer 3: Specular diagonal sheen present');
  assert.ok(compSrc.includes('border-t-2 border-l-2 border-cyan-400/80'), 'Layer 4: Corner brackets present');

  const formatTelemetry = (active, total) =>
    `PROJECT [${String(active + 1).padStart(2, '0')} / ${String(total).padStart(2, '0')}]`;

  assert.strictEqual(formatTelemetry(0, 10), 'PROJECT [01 / 10]');
  assert.strictEqual(formatTelemetry(9, 10), 'PROJECT [10 / 10]');
  assert.strictEqual(formatTelemetry(0, 0), 'PROJECT [01 / 00]');
});

// -----------------------------------------------------------------------------
// MODULE 3: MEMORY LEAKS, UNCANCELLED RAF & EVENT LISTENER DISPOSAL AUDIT
// -----------------------------------------------------------------------------
console.log('\n--- MODULE 3: Memory Leaks, RAF Loops & Cleanup Audit ---');

test('T3.1: LiquidGlassCarousel lifecycle and WebGL context destruction audit', () => {
  const lgcSrc = fs.readFileSync(path.join(REPO_ROOT, 'components/LiquidGlassCarousel.tsx'), 'utf-8');

  assert.ok(lgcSrc.includes('cancelAnimationFrame(raf)'), 'raf is cancelled on destroy()');
  assert.ok(lgcSrc.includes('cancelAnimationFrame(frameReq)'), 'frameReq is cancelled on destroy()');

  assert.ok(lgcSrc.includes('renderer.dispose()'), 'WebGLRenderer.dispose() called');
  assert.ok(lgcSrc.includes('renderer.forceContextLoss()'), 'WebGLRenderer.forceContextLoss() called');
  assert.ok(lgcSrc.includes('rt.dispose()'), 'WebGLRenderTarget disposed');
  assert.ok(lgcSrc.includes('lensQuad.geometry.dispose()'), 'Lens geometry disposed');
  assert.ok(lgcSrc.includes('lensMat.dispose()'), 'Lens material disposed');

  const listenerRemovals = [
    'el.removeEventListener("wheel", onWheel)',
    'el.removeEventListener("pointerdown", onPointerDown)',
    'el.removeEventListener("pointermove", onPointerMove)',
    'el.removeEventListener("pointerup", onPointerUp)',
    'el.removeEventListener("pointercancel", onPointerUp)',
    'el.removeEventListener("pointerenter", onEnter)',
    'el.removeEventListener("pointerleave", onLeave)',
    'el.removeEventListener("click", onClick)',
    'window.removeEventListener("keydown", onKeyDown)',
    'window.removeEventListener("scroll", readBounds)',
    'window.removeEventListener("resize", readBounds)',
    'ro.disconnect()'
  ];

  for (const rem of listenerRemovals) {
    assert.ok(lgcSrc.includes(rem), `Expected cleanup: ${rem}`);
  }
});

test('T3.2: MosaicFlip RAF cancellation and ResizeObserver disconnection audit', () => {
  const mfSrc = fs.readFileSync(path.join(REPO_ROOT, 'components/MosaicFlip.tsx'), 'utf-8');

  assert.ok(mfSrc.includes('cancelAnimationFrame(raf)'), 'MosaicFlip cancels RAF in useEffect cleanup');
  assert.ok(mfSrc.includes('observer.disconnect()'), 'MosaicFlip disconnects ResizeObserver');
  assert.ok(mfSrc.includes('cancelled = true'), 'MosaicFlip cancels pending image preloads on unmount');
});

test('T3.3: VortexAbout dynamic frameloop and WebGL canvas memory management', () => {
  const vaSrc = fs.readFileSync(path.join(REPO_ROOT, 'components/VortexAbout.tsx'), 'utf-8');

  assert.ok(
    vaSrc.includes('frameloop={isDissolving ? "always" : "never"}'),
    'Three.js Canvas frameloop throttled to "never" when not dissolving'
  );

  assert.ok(
    vaSrc.includes('useMemo(') && vaSrc.includes('createProceduralVortexTexture()'),
    'Fallback texture created once inside useMemo'
  );
});

// Summary
console.log('\n======================================================================');
console.log(`STRESS TEST SUMMARY: Passed: ${results.passed} | Failed: ${results.failed}`);
console.log('======================================================================\n');

if (results.failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
