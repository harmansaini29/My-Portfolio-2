/**
 * Master Verification Test Runner for Challenger 2
 * Milestone M1 - Portfolio Refactor & Modernization
 */

const { execSync } = require('child_process');
const path = require('path');

console.log('======================================================================');
console.log('       CHALLENGER 2 EMPIRICAL VERIFICATION HARNESS (MILESTONE M1)     ');
console.log('======================================================================\n');

const scripts = [
  { name: 'Data Integrity & Segregation', file: 'test_data_integrity.js' },
  { name: 'Cleanup & Build Bundle Analysis', file: 'test_cleanup_and_bundle.js' },
  { name: 'Prerendered HTML & Section Sequence', file: 'test_html_prerender.js' },
  { name: 'Adversarial Stress & Boundary Testing', file: 'test_adversarial_stress.js' },
];

let totalPassedSuites = 0;

scripts.forEach(({ name, file }, idx) => {
  console.log(`\n[SUITE ${idx + 1}/4] Running ${name} (${file})...`);
  const fullPath = path.resolve(__dirname, file);
  try {
    const output = execSync(`node "${fullPath}"`, { encoding: 'utf8' });
    console.log(output);
    totalPassedSuites++;
  } catch (err) {
    console.error(`FAILED SUITE ${name}:`);
    console.error(err.stdout || err.message);
    process.exit(1);
  }
});

console.log('======================================================================');
console.log(`SUMMARY: All ${totalPassedSuites}/${scripts.length} Challenger Verification Suites PASSED 100%`);
console.log('======================================================================');
