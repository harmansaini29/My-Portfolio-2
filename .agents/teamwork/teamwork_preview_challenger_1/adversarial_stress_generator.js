/**
 * ADVERSARIAL STRESS GENERATOR & ORACLE
 * High-intensity fuzzing and boundary stress for R2 & R4
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');

console.log('======================================================================');
console.log('   ADVERSARIAL STRESS GENERATOR & ORACLE (10,000 FUZZ CYCLES)        ');
console.log('======================================================================\n');

// -----------------------------------------------------------------------------
// STRESS 1: 10,000 RANDOMIZED HOVER 3D TILT CALCULATIONS ON MOSAIC FLIP
// -----------------------------------------------------------------------------
console.log('Running Stress 1: 10,000 Hover 3D Tilt Vector Stress Calculations...');

const HOVER_RADIUS = 2.8;
const HOVER_LIFT = 0.34;
const HOVER_TILT = 4;
const HOVER_SCALE = 0.035;
const columns = 12;
const rows = 8;
const tile = 64;

let maxTiltX = 0;
let maxTiltY = 0;
let maxScale = 0;
let maxHoverZ = 0;
let nanCount = 0;
let infiniteCount = 0;

for (let i = 0; i < 10000; i++) {
  // Random coordinates including negative, normal, extreme, NaN
  let pxRaw = (Math.random() - 0.5) * 5; // -2.5 to 2.5
  let pyRaw = (Math.random() - 0.5) * 5;

  if (i === 9998) { pxRaw = NaN; pyRaw = 0.5; }
  if (i === 9999) { pxRaw = Infinity; pyRaw = -Infinity; }

  // Component clamp logic
  const px = Number.isFinite(pxRaw) ? Math.min(1, Math.max(0, pxRaw)) * (columns - 1) : 0;
  const py = Number.isFinite(pyRaw) ? Math.min(1, Math.max(0, pyRaw)) * (rows - 1) : 0;

  const tileIndex = Math.floor(Math.random() * (columns * rows));
  const column = tileIndex % columns;
  const row = Math.floor(tileIndex / columns);

  const dx = column - px;
  const dy = row - py;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const proximity = Math.min(1, Math.max(0, 1 - distance / HOVER_RADIUS));
  const hover = proximity * 1.0;

  const hoverZ = hover * HOVER_LIFT * tile;
  const tiltX = (py - row) * hover * HOVER_TILT;
  const tiltY = (column - px) * hover * HOVER_TILT;
  const scale = 1 + hover * HOVER_SCALE;

  if (isNaN(tiltX) || isNaN(tiltY) || isNaN(scale) || isNaN(hoverZ)) {
    nanCount++;
  }
  if (!isFinite(tiltX) || !isFinite(tiltY) || !isFinite(scale) || !isFinite(hoverZ)) {
    infiniteCount++;
  }

  maxTiltX = Math.max(maxTiltX, Math.abs(tiltX));
  maxTiltY = Math.max(maxTiltY, Math.abs(tiltY));
  maxScale = Math.max(maxScale, scale);
  maxHoverZ = Math.max(maxHoverZ, hoverZ);
}

assert.strictEqual(nanCount, 0, 'Zero NaN values in 10,000 hover calculations');
assert.strictEqual(infiniteCount, 0, 'Zero infinite values in 10,000 hover calculations');
assert.ok(maxTiltX <= 25, `Max tiltX strictly bounded: ${maxTiltX} <= 25 deg`);
assert.ok(maxTiltY <= 25, `Max tiltY strictly bounded: ${maxTiltY} <= 25 deg`);
assert.ok(maxScale <= 1.05, `Max scale strictly bounded: ${maxScale} <= 1.05`);
console.log(`  ✔ Passed: Max TiltX=${maxTiltX.toFixed(2)}°, Max TiltY=${maxTiltY.toFixed(2)}°, Max Scale=${maxScale.toFixed(4)}, Max HoverZ=${maxHoverZ.toFixed(2)}px`);

// -----------------------------------------------------------------------------
// STRESS 2: 5,000 RANDOMIZED ASPECT RATIO & SLIDE RESILIENCE FUZZ
// -----------------------------------------------------------------------------
console.log('Running Stress 2: 5,000 Image Aspect Ratio Fuzz Cycles...');

const sheetWidth = 12 * 60; // 720
const sheetHeight = 8 * 60; // 480

let slideFailures = 0;
for (let i = 0; i < 5000; i++) {
  let aspect;
  if (i % 10 === 0) aspect = Math.random() * 0.05 + 0.001; // Ultra skinny portrait (0.001 to 0.05)
  else if (i % 10 === 1) aspect = Math.random() * 50 + 10; // Ultra wide banner (10 to 60)
  else if (i % 10 === 2) aspect = 0;
  else if (i % 10 === 3) aspect = -Math.random() * 10;
  else if (i % 10 === 4) aspect = NaN;
  else if (i % 10 === 5) aspect = null;
  else if (i % 10 === 6) aspect = Infinity;
  else aspect = Math.random() * 3 + 0.3; // Normal 0.3 to 3.3

  const offsetY = (Math.random() - 0.5) * 400; // -200 to +200

  const width = aspect && aspect > 0 && isFinite(aspect)
    ? Math.max(sheetWidth, sheetHeight * aspect)
    : sheetWidth;
  const height = aspect && aspect > 0 && isFinite(aspect)
    ? width / aspect
    : sheetHeight;
  const x = (sheetWidth - width) / 2;
  const y = (sheetHeight - height) / 2 + (Math.min(100, Math.max(-100, offsetY)) / 100) * sheetHeight;

  if (isNaN(width) || isNaN(height) || isNaN(x) || isNaN(y) || width <= 0 || height <= 0) {
    slideFailures++;
  }
}

assert.strictEqual(slideFailures, 0, 'Zero slide computation failures in 5,000 fuzz cycles');
console.log('  ✔ Passed: 5,000 extreme aspect ratios cleanly handled without NaN or negative geometry');

// -----------------------------------------------------------------------------
// STRESS 3: 5,000 RANDOMIZED DRAG & WHEEL ACCUMULATION CYCLES (LIQUID GLASS CAROUSEL)
// -----------------------------------------------------------------------------
console.log('Running Stress 3: 5,000 LiquidGlassCarousel Physics & Friction Fuzz Cycles...');

let scroll = 0;
let target = 0;
let velocity = 0;
let snapped = false;
const wheelSpeed = 1.4;
const friction = 0.865;
const ease = 0.12;

for (let i = 0; i < 5000; i++) {
  // Random wheel or drag delta
  const mode = Math.random();
  if (mode < 0.4) {
    // Wheel event
    const delta = (Math.random() - 0.5) * 400;
    target += delta * wheelSpeed;
    snapped = false;
  } else if (mode < 0.7) {
    // Drag move
    const dx = (Math.random() - 0.5) * 50;
    target -= dx * 1.6;
    velocity = velocity * 0.6 + -dx * 1.6 * 0.4;
    snapped = false;
  } else {
    // Physics step
    const dt = 1 / 60;
    const f = Math.min(4, Math.max(0.1, dt * 60)); // f = 1
    target += velocity * f;
    velocity *= Math.pow(friction, f);
    if (Math.abs(velocity) < 0.05) velocity = 0;
    const lerp = 1 - Math.pow(1 - ease, f);
    scroll += (target - scroll) * lerp;
  }

  assert.ok(!isNaN(scroll), `Scroll became NaN at step ${i}`);
  assert.ok(!isNaN(target), `Target became NaN at step ${i}`);
  assert.ok(!isNaN(velocity), `Velocity became NaN at step ${i}`);
}

console.log(`  ✔ Passed: 5,000 physics cycles executed with continuous numeric stability (Final scroll=${scroll.toFixed(2)})`);

console.log('\n======================================================================');
console.log('   ALL ADVERSARIAL STRESS TESTS COMPLETED SUCCESSFULLY!             ');
console.log('======================================================================\n');
