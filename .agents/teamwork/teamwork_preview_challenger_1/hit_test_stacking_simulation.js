/**
 * EMPIRICAL HIT-TESTING & STACKING CONTEXT SIMULATION
 * Testing the interaction transition between VortexAbout and JourneySection
 */

const assert = require('assert');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '../../..');

console.log('======================================================================');
console.log('   EMPIRICAL HIT-TEST & STACKING CONTEXT COLLISION VERIFICATION       ');
console.log('======================================================================\n');

// 1. Parse app/page.tsx and JourneySection.tsx and VortexAbout.tsx
const pageSrc = fs.readFileSync(path.join(REPO_ROOT, 'app/page.tsx'), 'utf-8');
const journeySrc = fs.readFileSync(path.join(REPO_ROOT, 'components/JourneySection.tsx'), 'utf-8');
const vortexSrc = fs.readFileSync(path.join(REPO_ROOT, 'components/VortexAbout.tsx'), 'utf-8');

// 2. Define DOM element layers in the grid overlap
// Grid container: <div className="grid grid-cols-1 grid-rows-1 w-full">
// Layer A: <div className="col-start-1 row-start-1 w-full relative z-10"><VortexAbout /></div>
// Layer B: <div className="col-start-1 row-start-1 w-full relative z-20 pointer-events-none"><div className="pointer-events-auto"><JourneySection /></div></div>

function evaluateHitTarget(scrollProgress, screenX, screenY, viewportWidth = 1920, viewportHeight = 1080) {
  // Stacking elements sorted by z-index descending:
  // Layer B (z-20): JourneySection
  // Layer A (z-10): VortexAbout

  // In JourneySection:
  // Opacity: [0, 0.65, 0.74, 1] -> [0, 0, 1, 1]
  // Pointer-events:
  // app/page.tsx line 38 has pointer-events-none, line 39 has pointer-events-auto.
  // JourneySection line 26 has pointer-events-auto.
  // JourneySection line 34 has w-full h-[70vh] relative z-20 pointer-events-auto.
  // Canvas is width: 100%, height: 70vh centered vertically.
  const journeyCanvasTop = viewportHeight * 0.15;
  const journeyCanvasBottom = viewportHeight * 0.85;
  const isInsideJourneyCanvas = screenY >= journeyCanvasTop && screenY <= journeyCanvasBottom;

  // In VortexAbout:
  // pointerEvents: smoothProgress >= 0.74 ? "none" : "auto"
  const vortexPointerEvents = scrollProgress >= 0.74 ? 'none' : 'auto';

  // Check if JourneySection disables pointer-events when opacity=0:
  // Currently in JourneySection: NO dynamic pointer-events! Hardcoded pointer-events-auto.
  const journeyPointerEvents = 'auto'; // from line 39 <div className="pointer-events-auto"> and line 34 pointer-events-auto

  const stack = [
    {
      name: 'LiquidGlassCarousel (JourneySection)',
      zIndex: 20,
      pointerEvents: journeyPointerEvents,
      opacity: scrollProgress < 0.65 ? 0 : scrollProgress >= 0.74 ? 1 : (scrollProgress - 0.65) / 0.09,
      bounds: { top: journeyCanvasTop, bottom: journeyCanvasBottom, left: 0, right: viewportWidth },
      consumesWheel: true // onWheel calls e.preventDefault()
    },
    {
      name: 'VortexAbout (Interactive / Text Content)',
      zIndex: 10,
      pointerEvents: vortexPointerEvents,
      opacity: scrollProgress < 0.15 ? 0.6 + (scrollProgress / 0.15) * 0.4 : scrollProgress <= 0.74 ? 1.0 : 0.0,
      bounds: { top: 0, bottom: viewportHeight, left: 0, right: viewportWidth },
      consumesWheel: false // relies on page scroll / Lenis
    }
  ];

  // CSS Hit-Testing: check from highest z-index down
  for (const layer of stack) {
    const inBounds = screenX >= layer.bounds.left && screenX <= layer.bounds.right &&
                     screenY >= layer.bounds.top && screenY <= layer.bounds.bottom;
    if (inBounds && layer.pointerEvents !== 'none') {
      return layer;
    }
  }

  return { name: 'Root Page', zIndex: 0, pointerEvents: 'auto', consumesWheel: false };
}

// Test hit-testing at center of screen (960, 540) across scroll progress spectrum
const testPoints = [0.0, 0.20, 0.40, 0.60, 0.739, 0.74, 0.75, 0.90, 1.0];
console.log('Scroll Progress | Hit Target Layer                    | Target Opacity | Consumes Wheel');
console.log('---------------------------------------------------------------------------------------');

let collisionFound = false;
for (const p of testPoints) {
  const hit = evaluateHitTarget(p, 960, 540);
  const opacityStr = hit.opacity !== undefined ? hit.opacity.toFixed(2) : '1.00';
  console.log(`${p.toFixed(3).padEnd(15)} | ${hit.name.padEnd(35)} | ${opacityStr.padEnd(14)} | ${hit.consumesWheel ? 'YES (e.preventDefault)' : 'NO'}`);
  
  if (p < 0.74 && hit.name.includes('JourneySection') && hit.opacity === 0) {
    collisionFound = true;
  }
}

console.log('---------------------------------------------------------------------------------------\n');
if (collisionFound) {
  console.log('[ADVERSARIAL VULNERABILITY DETECTED]:');
  console.log('  When scrollProgress < 0.74, LiquidGlassCarousel is at opacity 0 (invisible),');
  console.log('  yet because JourneySection sits at z-20 with pointer-events: auto,');
  console.log('  it captures pointer events and consumes mouse wheel (e.preventDefault) directly over VortexAbout at z-10!');
  console.log('  This causes pointer interception over the central 70vh of the screen during VortexAbout.');
} else {
  console.log('[CLEAN]: No stacking context collision detected.');
}
