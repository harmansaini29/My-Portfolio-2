#!/usr/bin/env node

/**
 * Master E2E Test Suite Runner
 * Project: Portfolio Refactor & Modernization
 * Usage: node tests/e2e-verify.js [--tier=1|2|3|4] [--bail]
 */

const { colors, testState } = require('./helpers');
const { runTier1Tests } = require('./tier1-features.test');
const { runTier2Tests } = require('./tier2-boundary.test');
const { runTier3Tests } = require('./tier3-combinations.test');
const { runTier4Tests } = require('./tier4-scenarios.test');

// Parse CLI flags
const args = process.argv.slice(2);
let targetTier = null;
let bail = false;

args.forEach((arg) => {
  if (arg.startsWith('--tier=')) {
    targetTier = parseInt(arg.split('=')[1], 10);
  }
  if (arg === '--bail') {
    bail = true;
  }
});

console.log(`${colors.cyan}${colors.bold}======================================================================${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}   PORTFOLIO REFACTOR & MODERNIZATION - E2E TEST VERIFICATION SUITE   ${colors.reset}`);
console.log(`${colors.cyan}${colors.bold}======================================================================${colors.reset}`);
console.log(`${colors.dim}Runtime: Node ${process.version} | Platform: ${process.platform}${colors.reset}\n`);

// Register suites based on filter
if (!targetTier || targetTier === 1) {
  runTier1Tests();
}
if (!targetTier || targetTier === 2) {
  runTier2Tests();
}
if (!targetTier || targetTier === 3) {
  runTier3Tests();
}
if (!targetTier || targetTier === 4) {
  runTier4Tests();
}

// Execute Registered Tests
testState.startTime = Date.now();

for (const suite of testState.suites) {
  console.log(`\n${colors.bold}${colors.blue}▸ ${suite.name}${colors.reset}`);
  
  for (const t of suite.tests) {
    const tStart = Date.now();
    try {
      t.fn();
      const elapsed = Date.now() - tStart;
      testState.passed++;
      console.log(`  ${colors.green}✔${colors.reset} ${t.name} ${colors.dim}(${elapsed}ms)${colors.reset}`);
    } catch (err) {
      const elapsed = Date.now() - tStart;
      testState.failed++;
      testState.failures.push({
        suite: suite.name,
        name: t.name,
        error: err.message || String(err),
        stack: err.stack,
      });
      console.log(`  ${colors.red}✖${colors.reset} ${colors.bold}${t.name}${colors.reset} ${colors.dim}(${elapsed}ms)${colors.reset}`);
      console.log(`    ${colors.red}${err.message.split('\n')[0]}${colors.reset}`);
      
      if (bail) {
        console.log(`\n${colors.yellow}Bailing out after first failure due to --bail flag.${colors.reset}`);
        break;
      }
    }
  }

  if (bail && testState.failed > 0) {
    break;
  }
}

const totalDuration = ((Date.now() - testState.startTime) / 1000).toFixed(2);

console.log(`\n${colors.cyan}----------------------------------------------------------------------${colors.reset}`);
console.log(`${colors.bold}TEST EXECUTION SUMMARY:${colors.reset}`);
console.log(`  Total Tests Run: ${colors.bold}${testState.totalTests}${colors.reset}`);
console.log(`  Passed:          ${colors.green}${colors.bold}${testState.passed}${colors.reset}`);
console.log(`  Failed:          ${testState.failed > 0 ? colors.red : colors.green}${colors.bold}${testState.failed}${colors.reset}`);
console.log(`  Duration:        ${totalDuration}s`);
console.log(`${colors.cyan}----------------------------------------------------------------------${colors.reset}`);

if (testState.failures.length > 0) {
  console.log(`\n${colors.red}${colors.bold}DETAILED FAILURE DIAGNOSTICS (${testState.failures.length}):${colors.reset}\n`);
  testState.failures.forEach((f, idx) => {
    console.log(`${colors.bold}${idx + 1}) [${f.suite}] ${f.name}${colors.reset}`);
    console.log(`${colors.red}${f.error}${colors.reset}\n`);
  });
  console.log(`${colors.yellow}Note: If failures are pending implementation changes by Worker M1, they will resolve once M1 files are committed.${colors.reset}\n`);
  process.exit(1);
} else {
  console.log(`\n${colors.green}${colors.bold}ALL ${testState.passed} E2E TESTS PASSED SUCCESSFULLY!${colors.reset}\n`);
  process.exit(0);
}
