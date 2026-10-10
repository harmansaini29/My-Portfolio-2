/**
 * Prerendered HTML & Section Verification Suite
 * Challenger 2 - Milestone M1
 */

const fs = require('fs');
const path = require('path');

let total = 0;
let passed = 0;
let failed = 0;

function assert(condition, message) {
  total++;
  if (condition) {
    passed++;
    console.log(`  PASS: ${message}`);
  } else {
    failed++;
    console.error(`  FAIL: ${message}`);
  }
}

console.log('=== TEST SUITE: Prerendered HTML Section Verification ===');

const htmlPath = path.resolve('.next/server/app/index.html');
assert(fs.existsSync(htmlPath), 'Prerendered .next/server/app/index.html exists');

const html = fs.readFileSync(htmlPath, 'utf8');
assert(html.length > 50000, `HTML payload is substantial (${html.length} bytes)`);

// Check presence of Section 1: Hero
assert(html.includes('Harman Saini') || html.includes('Move cursor to reveal'), 'Section 1 (Hero) content present in HTML');

// Check presence of Section 2: Vortex About
assert(html.includes('SYSTEMS ARCHITECT') || html.includes('DISCIPLINE &amp; CAPABILITIES') || html.includes('DISCIPLINE &amp;amp; CAPABILITIES') || html.includes('Full-Stack Systems Architect'), 'Section 2 (Vortex About) content present in HTML');

// Check presence of Section 3: Journey
assert(html.includes('My Journey'), 'Section 3 (Journey) header present in HTML');

// Check presence of Section 4: Tech Stack (dynamic with ssr: false)
assert(
  html.includes('TechStackSection') || html.includes('TechStackDualCarousel') || /<section[^>]*min-h-screen[^>]*bg-transparent[^>]*><\/section>/.test(html) || html.includes('min-h-screen bg-transparent'),
  'Section 4 (Tech Stack) container wrapper present in HTML (rendered via ssr: false)'
);

// Check presence of Section 5: Projects
assert(html.includes('My Projects'), 'Section 5 (Projects) header present in HTML');
assert(html.includes('CHROMIUM PROFILE') || html.includes('SYS.ID') || html.includes('Mosaic Showcase') || html.includes('UMBRELLA'), 'Section 5 (Projects / Chromium) content present in HTML');

// Check presence of Section 6: Achievements
assert(html.includes('Achievements'), 'Section 6 (Achievements) header present in HTML');
assert(html.includes('2× HACKATHON WINNER') || html.includes('2&times; HACKATHON WINNER') || html.includes('HACKATHON WINNER'), 'Section 6 (Achievements) items present in HTML');

// Check presence of Section 7: Contact Us
assert(html.includes('Contact') || html.includes('Get in Touch') || html.includes('harmansaini') || html.includes('harman'), 'Section 7 (Contact) content present in HTML');

// Verify ordering of sections in HTML
const sectionMarkers = [
  { name: 'Hero', marker: 'Move cursor to reveal' },
  { name: 'VortexAbout', marker: 'SYSTEMS ARCHITECT' },
  { name: 'Journey', marker: 'My Journey' },
  { name: 'Projects', marker: 'My Projects' },
  { name: 'Achievements', marker: 'Achievements' },
];

let lastPos = -1;
sectionMarkers.forEach(({ name, marker }) => {
  const pos = html.indexOf(marker);
  assert(pos !== -1, `Marker for ${name} found in HTML at index ${pos}`);
  assert(pos > lastPos, `${name} occurs after previous section in HTML stream (${pos} > ${lastPos})`);
  lastPos = pos;
});

console.log('\n======================================================');
console.log(`PRERENDERED HTML RESULTS: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log('======================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
