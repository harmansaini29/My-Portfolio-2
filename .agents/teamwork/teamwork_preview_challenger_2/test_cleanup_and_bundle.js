/**
 * Empirical Cleanup and Bundle Verification Suite
 * Challenger 2 - Milestone M1
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

let total = 0;
let passed = 0;
let failed = 0;
const errors = [];

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    errors.push(message);
    console.error(`  FAIL: ${message}`);
  }
}

console.log('=== TEST SUITE 1: Source Code Static Analysis - Dead Imports & References ===');

const DELETED_TARGETS = [
  'ScrollDissolveReveal',
  'cylinder-carousel',
  'StaggeredGrid',
  'staggered-grid',
  'ScrollJourney',
  '@base-ui',
  'class-variance-authority',
  'lucide-react',
  'patch.py',
];

function getAllFiles(dir, extensions = ['.ts', '.tsx', '.js', '.jsx', '.css', '.json']) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  const list = fs.readdirSync(dir);
  list.forEach((file) => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat && stat.isDirectory()) {
      if (file !== 'node_modules' && file !== '.git' && file !== '.next') {
        results = results.concat(getAllFiles(filePath, extensions));
      }
    } else {
      if (extensions.some((ext) => file.endsWith(ext))) {
        results.push(filePath);
      }
    }
  });
  return results;
}

const sourceFiles = [
  ...getAllFiles(path.resolve('app')),
  ...getAllFiles(path.resolve('components')),
  ...getAllFiles(path.resolve('lib')),
];

sourceFiles.forEach((file) => {
  const content = fs.readFileSync(file, 'utf8');
  const relPath = path.relative(process.cwd(), file);

  // Check imports / references
  DELETED_TARGETS.forEach((target) => {
    // Note: ScrollJourney is legitimately renamed to VortexAbout; check if old ScrollJourney is imported
    const hasImport = new RegExp(`from\\s+['"][^'"]*${target}[^'"]*['"]`).test(content) ||
                      new RegExp(`require\\(['"][^'"]*${target}[^'"]*['"]\\)`).test(content);
    assert(!hasImport, `${relPath} does not import deleted target: ${target}`);
  });
});

console.log('\n=== TEST SUITE 2: Production Build Bundle Analysis (.next) ===');

if (fs.existsSync(path.resolve('.next'))) {
  const nextFiles = [
    ...getAllFiles(path.resolve('.next/static'), ['.js', '.css']),
    ...getAllFiles(path.resolve('.next/server'), ['.js']),
  ];

  assert(nextFiles.length > 0, `Found ${nextFiles.length} build bundle files in .next`);

  const bundleDeletedTargets = [
    'ScrollDissolveReveal',
    'cylinder-carousel',
    'StaggeredGrid',
    'staggered-grid',
    '@base-ui',
    'class-variance-authority',
    'lucide-react',
  ];

  bundleDeletedTargets.forEach((target) => {
    let foundInBundle = false;
    let foundFile = '';
    for (const bf of nextFiles) {
      const bContent = fs.readFileSync(bf, 'utf8');
      if (bContent.includes(target)) {
        foundInBundle = true;
        foundFile = path.relative(process.cwd(), bf);
        break;
      }
    }
    assert(!foundInBundle, `Build bundle has zero occurrences of ${target} (checked ${nextFiles.length} chunks)`);
    if (foundInBundle) {
      console.error(`    Found in bundle file: ${foundFile}`);
    }
  });
} else {
  assert(false, '.next directory does not exist! Run npm run build first.');
}

console.log('\n=== TEST SUITE 3: Component Flow & 7-Section Mounting Order ===');

const pagePath = path.resolve('app/page.tsx');
assert(fs.existsSync(pagePath), 'app/page.tsx exists');
const pageCode = fs.readFileSync(pagePath, 'utf8');
const sf = ts.createSourceFile(pagePath, pageCode, ts.ScriptTarget.Latest, true);

// Verify 'use client'
assert(pageCode.startsWith("'use client'") || pageCode.startsWith('"use client"'), "app/page.tsx starts with 'use client'");

// Collect JSX elements in order
const renderedSectionNames = [];
function findJsxElements(node) {
  if (ts.isJsxSelfClosingElement(node)) {
    const tagName = node.tagName.getText(sf);
    renderedSectionNames.push(tagName);
  } else if (ts.isJsxOpeningElement(node)) {
    const tagName = node.tagName.getText(sf);
    renderedSectionNames.push(tagName);
  }
  ts.forEachChild(node, findJsxElements);
}
findJsxElements(sf);

const expectedSectionsInOrder = [
  'Hero',
  'VortexAbout',
  'JourneySection',
  'TechStackSection',
  'ProjectsSection',
  'AchievementsSection',
  'ContactSection',
];

let lastIdx = -1;
expectedSectionsInOrder.forEach((sectionName) => {
  const currentIdx = renderedSectionNames.indexOf(sectionName);
  assert(currentIdx !== -1, `Section <${sectionName} /> is rendered in app/page.tsx`);
  assert(currentIdx > lastIdx, `Section <${sectionName} /> is mounted after previous section in order (index ${currentIdx} > ${lastIdx})`);
  lastIdx = currentIdx;
});

// Verify Z-index stacking hierarchy between VortexAbout and JourneySection in app/page.tsx
const vortexZMatch = pageCode.match(/VortexAbout[\s\S]*?z-(\d+)/) || pageCode.match(/z-(\d+)[\s\S]*?VortexAbout/);
const journeyZMatch = pageCode.match(/JourneySection[\s\S]*?z-(\d+)/) || pageCode.match(/z-(\d+)[\s\S]*?JourneySection/);
assert(pageCode.includes('z-10') && pageCode.includes('z-20'), 'page.tsx implements z-10 and z-20 stacking context');
assert(pageCode.indexOf('VortexAbout') !== -1 && pageCode.indexOf('JourneySection') !== -1, 'Both VortexAbout and JourneySection exist in page DOM');

console.log('\n======================================================');
console.log(`CLEANUP & BUNDLE RESULTS: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log('======================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
