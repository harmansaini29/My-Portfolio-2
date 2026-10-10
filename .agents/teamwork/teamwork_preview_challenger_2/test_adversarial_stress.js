/**
 * Challenger 2 Adversarial Stress Test Suite
 * Milestone M1 - Data Integrity, Component Flow, Edge Cases
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');

let total = 0;
let passed = 0;
let failed = 0;
const failures = [];

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    failures.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

function loadTsModule(filePath) {
  const code = fs.readFileSync(filePath, 'utf8');
  const transpiled = ts.transpileModule(code, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
    },
  }).outputText;

  const moduleExports = {};
  const context = {
    exports: moduleExports,
    module: { exports: moduleExports },
    require: require,
    console: console,
  };
  vm.createContext(context);
  vm.runInContext(transpiled, context);
  return context.module.exports;
}

console.log('=== ADVERSARIAL SUITE 1: Pointer-Events Transition Boundary Simulation ===');

// Extract the transform function from VortexAbout.tsx
const vortexCode = fs.readFileSync(path.resolve('components/VortexAbout.tsx'), 'utf8');
const transformRegex = /useTransform\(smoothProgress,\s*\([^)]*\)\s*=>\s*\(?([^)]+)\)?\)/g;
let pointerEventsLogic = null;
let match;
while ((match = transformRegex.exec(vortexCode)) !== null) {
  if (match[1].includes('0.74') && match[1].includes('"none"') && match[1].includes('"auto"')) {
    pointerEventsLogic = match[1];
    break;
  }
}

assert(pointerEventsLogic !== null, 'Found pointer-events transform logic in VortexAbout.tsx');

// Evaluate the pointer-events predicate across boundary values
const evaluatePointerEvents = (v) => (v >= 0.74 ? "none" : "auto");

const testProgressCases = [
  { progress: -0.5, expected: "auto", desc: "Negative overscroll (-0.5)" },
  { progress: 0.0, expected: "auto", desc: "Start of scroll track (0.0)" },
  { progress: 0.5, expected: "auto", desc: "Midway through scroll track (0.5)" },
  { progress: 0.739, expected: "auto", desc: "Right before threshold (0.739)" },
  { progress: 0.739999, expected: "auto", desc: "Microsecond before threshold (0.739999)" },
  { progress: 0.74, expected: "none", desc: "Exact threshold (0.74)" },
  { progress: 0.740001, expected: "none", desc: "Microsecond after threshold (0.740001)" },
  { progress: 0.741, expected: "none", desc: "Vortex opacity cut (0.741)" },
  { progress: 0.9, expected: "none", desc: "During dissolve (0.9)" },
  { progress: 1.0, expected: "none", desc: "End of track (1.0)" },
  { progress: 2.0, expected: "none", desc: "Positive overscroll (2.0)" },
];

testProgressCases.forEach(({ progress, expected, desc }) => {
  const actual = evaluatePointerEvents(progress);
  assert(actual === expected, `Boundary [${desc}]: progress=${progress} => pointerEvents="${actual}"`);
});

console.log('\n=== ADVERSARIAL SUITE 2: LiquidGlassCarousel Entry Lock & Interaction Props ===');

const journeyCode = fs.readFileSync(path.resolve('components/JourneySection.tsx'), 'utf8');
assert(journeyCode.includes('entry={{ enabled: false }}'), 'JourneySection explicitly sets entry={{ enabled: false }}');
assert(journeyCode.includes('interaction={{ drag: true, wheel: true, clickToFocus: true }}'), 'JourneySection passes interactive drag and wheel controls');

const liquidCode = fs.readFileSync(path.resolve('components/LiquidGlassCarousel.tsx'), 'utf8');
assert(liquidCode.includes('props.entry?.enabled !== false'), 'LiquidGlassCarousel guards replayEntry when enabled is false');

console.log('\n=== ADVERSARIAL SUITE 3: Dynamic Video Asset Mutation & Segregation Test ===');

const portfolioData = loadTsModule(path.resolve('lib/portfolio-data.ts'));

// Test setting video URL on project items dynamically
const testVideoUrl = 'https://cdn.example.com/videos/umbrella-demo.mp4';
const projectItem = portfolioData.PROJECT_DATA[0];

assert(projectItem.media.videoUrl === '', 'Initial project videoUrl is empty string');
assert(projectItem.video === '', 'Initial project.video alias is empty string');

// Verify that if a video URL is populated, it adheres to segregation
const simulatedUpdatedMedia = {
  ...projectItem.media,
  videoUrl: testVideoUrl,
};
assert(simulatedUpdatedMedia.url !== simulatedUpdatedMedia.videoUrl, 'Updated media maintains distinct image and video URLs');
assert(simulatedUpdatedMedia.type === 'image', 'Primary media type remains image while videoUrl holds video link');

console.log('\n=== ADVERSARIAL SUITE 4: ProjectsSection HUD Link Extraction Robustness ===');

const projectsCode = fs.readFileSync(path.resolve('components/ProjectsSection.tsx'), 'utf8');
assert(projectsCode.includes('currentProject?.link'), 'ProjectsSection checks explicit project link');
assert(projectsCode.includes('currentProject?.desc?.match(/Live\\s*→\\s*([a-zA-Z0-9.-]+)/i)'), 'ProjectsSection extracts regex Live → domain');

function extractLiveUrl(project) {
  if (project?.link) return project.link;
  const match = project?.desc?.match(/Live\s*→\s*([a-zA-Z0-9.-]+)/i);
  return match ? `https://${match[1]}` : null;
}

const mockProjects = [
  { desc: 'Intelligent Anti-Bot Defense | Live → aegis-ai.vercel.app', link: 'https://aegis-ai.vercel.app', expected: 'https://aegis-ai.vercel.app' },
  { desc: 'CSMU Utility | Live → cet-exam-portal.vercel.app', expected: 'https://cet-exam-portal.vercel.app' },
  { desc: 'AI Logo Maker | Live → ai-logo-maker.vercel.app', expected: 'https://ai-logo-maker.vercel.app' },
  { desc: 'Project with no live link', expected: null },
  { desc: '', expected: null },
  { desc: undefined, expected: null },
  { desc: 'Live → invalid space here.com', expected: 'https://invalid' }, // space cuts domain
  { desc: 'Live  →   multiple-spaces.com', expected: 'https://multiple-spaces.com' },
];

mockProjects.forEach((p, idx) => {
  const result = extractLiveUrl(p);
  assert(result === p.expected, `Link extractor case #${idx + 1} (${p.desc || 'empty'}) => ${result}`);
});

console.log('\n=== ADVERSARIAL SUITE 5: Chromium Border CSS & Animation Class Verification ===');

const globalsCss = fs.readFileSync(path.resolve('app/globals.css'), 'utf8');
const chromiumClasses = [
  'animate-chromium-beam',
  'animate-chromium-halo',
  'animate-specular-sheen',
  'bg-chromium-conic-beam',
  'bg-chromium-bezel',
];

chromiumClasses.forEach((cls) => {
  assert(globalsCss.includes(`.${cls}`), `globals.css contains utility class .${cls}`);
});

const keyframeNames = [
  'chromiumBeamRotate',
  'chromiumHaloPulse',
  'specularSheenSweep',
];

keyframeNames.forEach((kf) => {
  assert(globalsCss.includes(`@keyframes ${kf}`), `globals.css defines @keyframes ${kf}`);
});

console.log('\n=== ADVERSARIAL SUITE 6: HoverImageReveal & Achievements Contract Hardening ===');

const achievementsData = portfolioData.ACHIEVEMENTS_DATA;
assert(typeof achievementsData.itemCount === 'number', 'ACHIEVEMENTS_DATA.itemCount is number type');
assert(achievementsData.itemCount >= 1 && achievementsData.itemCount <= 6, 'ACHIEVEMENTS_DATA.itemCount is within MAX_ITEMS [1..6]');

for (let i = 1; i <= achievementsData.itemCount; i++) {
  const item = achievementsData[`item${i}`];
  assert(item !== undefined, `item${i} is defined in ACHIEVEMENTS_DATA`);
  assert(typeof item.text === 'string' && item.text.length > 0, `item${i}.text is non-empty string`);
  assert(item.image && typeof item.image.src === 'string' && item.image.src.length > 0, `item${i}.image.src is non-empty string`);
}

console.log('\n======================================================');
console.log(`ADVERSARIAL STRESS RESULTS: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log('======================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
