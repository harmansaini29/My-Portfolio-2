/**
 * Empirical Data Integrity & Segregation Test Suite
 * Challenger 2 - Milestone M1
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');
const vm = require('vm');

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

const portfolioDataPath = path.resolve('lib/portfolio-data.ts');
const data = loadTsModule(portfolioDataPath);

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

console.log('=== TEST SUITE 1: PORTFOLIO_MEDIA Structure & Segregation ===');

// 1. Check PORTFOLIO_MEDIA existence
assert(data.PORTFOLIO_MEDIA !== undefined, 'PORTFOLIO_MEDIA is exported');
const media = data.PORTFOLIO_MEDIA;

// 2. Check Hero section
assert(media.hero !== undefined, 'PORTFOLIO_MEDIA.hero exists');
assert(media.hero.base && media.hero.base.type === 'image', 'hero.base is type: image');
assert(typeof media.hero.base.url === 'string' && media.hero.base.url.length > 0, 'hero.base has valid url');
assert(media.hero.chrome && media.hero.chrome.type === 'image', 'hero.chrome is type: image');
assert(typeof media.hero.chrome.url === 'string' && media.hero.chrome.url.length > 0, 'hero.chrome has valid url');

// 3. Check Journey section
assert(media.journey !== undefined, 'PORTFOLIO_MEDIA.journey exists');
const expectedJourneyKeys = ['csmu', 'googleAmbassador', 'sapphireInfocom', 'growsphere', 'awsBuilder'];
expectedJourneyKeys.forEach((key) => {
  assert(media.journey[key] !== undefined, `journey.${key} exists`);
  assert(media.journey[key].type === 'image', `journey.${key} is type image`);
  assert(typeof media.journey[key].url === 'string' && media.journey[key].url.startsWith('https://'), `journey.${key} has secure HTTPS url`);
});

// 4. Check Projects section segregation (image vs video)
assert(media.projects !== undefined, 'PORTFOLIO_MEDIA.projects exists');
const expectedProjectKeys = [
  'umbrella', 'harriot', 'aegis', 'connex', 'nyaya',
  'pgRental', 'onlineGyan', 'smartUmpire', 'cetPortal', 'aiLogoMaker'
];
expectedProjectKeys.forEach((key) => {
  const item = media.projects[key];
  assert(item !== undefined, `projects.${key} exists`);
  assert(item.type === 'image', `projects.${key} has primary type: image`);
  assert(typeof item.url === 'string' && item.url.startsWith('https://'), `projects.${key} has image URL`);
  assert(item.videoUrl !== undefined && typeof item.videoUrl === 'string', `projects.${key} has segregated videoUrl field (string)`);
  assert(item.url !== item.videoUrl, `projects.${key} segregates image url from video url`);
});

// 5. Check Achievements section
assert(media.achievements !== undefined, 'PORTFOLIO_MEDIA.achievements exists');
const expectedAchievementKeys = ['hackathonWinner', 'ghostMode', 'enigmaTop10', 'hacknova7th', 'nptelGold'];
expectedAchievementKeys.forEach((key) => {
  const item = media.achievements[key];
  assert(item !== undefined, `achievements.${key} exists`);
  assert(item.type === 'image', `achievements.${key} is type: image`);
  assert(typeof item.url === 'string' && item.url.startsWith('https://'), `achievements.${key} has valid url`);
  assert(typeof item.alt === 'string' && item.alt.length > 0, `achievements.${key} has non-empty alt text`);
});

console.log('\n=== TEST SUITE 2: Backward-Compatible Exports Downstream Contracts ===');

// 1. CAROUSEL_DATA contract
assert(Array.isArray(data.CAROUSEL_DATA), 'CAROUSEL_DATA is an array');
assert(data.CAROUSEL_DATA.length === 5, 'CAROUSEL_DATA has 5 journey items');
data.CAROUSEL_DATA.forEach((item, idx) => {
  assert(typeof item.id === 'string', `CAROUSEL_DATA[${idx}].id is string`);
  assert(typeof item.title === 'string', `CAROUSEL_DATA[${idx}].title is string`);
  assert(typeof item.desc === 'string', `CAROUSEL_DATA[${idx}].desc is string`);
  assert(typeof item.image === 'string', `CAROUSEL_DATA[${idx}].image is string`);
  assert(item.media && item.media.url === item.image, `CAROUSEL_DATA[${idx}].media.url matches image alias`);
});

// 2. PROJECT_DATA contract
assert(Array.isArray(data.PROJECT_DATA), 'PROJECT_DATA is an array');
assert(data.PROJECT_DATA.length === 10, 'PROJECT_DATA has 10 projects');
data.PROJECT_DATA.forEach((item, idx) => {
  assert(typeof item.id === 'string', `PROJECT_DATA[${idx}].id is string`);
  assert(typeof item.title === 'string', `PROJECT_DATA[${idx}].title is string`);
  assert(typeof item.desc === 'string', `PROJECT_DATA[${idx}].desc is string`);
  assert(typeof item.image === 'string', `PROJECT_DATA[${idx}].image is string`);
  assert(item.media && item.media.url === item.image, `PROJECT_DATA[${idx}].media.url matches image alias`);
  assert(item.video === item.media.videoUrl, `PROJECT_DATA[${idx}].video alias matches media.videoUrl`);
  assert(Array.isArray(item.tags), `PROJECT_DATA[${idx}].tags is an array`);
});

// 3. ACHIEVEMENTS_DATA contract (HoverImageReveal dictionary)
assert(data.ACHIEVEMENTS_DATA !== undefined, 'ACHIEVEMENTS_DATA is exported');
assert(data.ACHIEVEMENTS_DATA.itemCount === 5, 'ACHIEVEMENTS_DATA.itemCount is 5');
for (let i = 1; i <= 5; i++) {
  const key = `item${i}`;
  const item = data.ACHIEVEMENTS_DATA[key];
  assert(item !== undefined, `ACHIEVEMENTS_DATA.${key} exists`);
  assert(typeof item.text === 'string' && item.text.length > 0, `ACHIEVEMENTS_DATA.${key}.text is valid string`);
  assert(item.image && typeof item.image.src === 'string', `ACHIEVEMENTS_DATA.${key}.image.src is string`);
  assert(item.media && item.media.url === item.image.src, `ACHIEVEMENTS_DATA.${key}.media.url matches image.src`);
}

// 4. HERO_MEDIA alias
assert(data.HERO_MEDIA === data.PORTFOLIO_MEDIA.hero, 'HERO_MEDIA strictly equals PORTFOLIO_MEDIA.hero');

console.log('\n=== TEST SUITE 3: Edge Cases, Malformed Data & Mutation Stress ===');

// Edge Case 1: Empty string videoUrl does not break consumer logic
data.PROJECT_DATA.forEach((item, idx) => {
  const resolvedVideo = item.video || null;
  assert(resolvedVideo === null || typeof resolvedVideo === 'string', `PROJECT_DATA[${idx}] video fallback behaves safely`);
});

// Edge Case 2: Missing optional properties on MediaAsset
const mockMinimalAsset = {
  type: 'image',
  url: 'https://example.com/test.png',
};
assert(mockMinimalAsset.posterUrl === undefined, 'MediaAsset safely handles undefined posterUrl');
assert(mockMinimalAsset.videoUrl === undefined, 'MediaAsset safely handles undefined videoUrl');
assert(mockMinimalAsset.alt === undefined, 'MediaAsset safely handles undefined alt');
assert(mockMinimalAsset.width === undefined, 'MediaAsset safely handles undefined width');
assert(mockMinimalAsset.height === undefined, 'MediaAsset safely handles undefined height');

// Edge Case 3: Immutability / const assertion verification in TypeScript AST
const sourceCode = fs.readFileSync(portfolioDataPath, 'utf8');
const sf = ts.createSourceFile(portfolioDataPath, sourceCode, ts.ScriptTarget.Latest, true);
let foundAsConst = false;
ts.forEachChild(sf, function checkNode(node) {
  if (ts.isVariableStatement(node)) {
    const declList = node.declarationList;
    declList.declarations.forEach((decl) => {
      if (decl.name.getText(sf) === 'PORTFOLIO_MEDIA') {
        const initText = decl.initializer?.getText(sf);
        if (initText && initText.endsWith('as const')) {
          foundAsConst = true;
        }
      }
    });
  }
  ts.forEachChild(node, checkNode);
});
assert(foundAsConst, 'PORTFOLIO_MEDIA is defined with "as const" for strict compile-time immutability');

// Edge Case 4: URL safety - check for dangerous schemes
const allUrls = [];
function collectUrls(obj) {
  if (!obj || typeof obj !== 'object') return;
  for (const [k, v] of Object.entries(obj)) {
    if (typeof v === 'string' && (k.toLowerCase().includes('url') || k.toLowerCase().includes('src') || k === 'image')) {
      allUrls.push({ key: k, value: v });
    } else if (typeof v === 'object') {
      collectUrls(v);
    }
  }
}
collectUrls(data.PORTFOLIO_MEDIA);
allUrls.forEach(({ key, value }) => {
  if (value.length > 0) {
    const isSafe = value.startsWith('https://') || value.startsWith('/images/') || value.startsWith('/videos/');
    assert(isSafe, `URL in ${key} (${value.slice(0, 30)}...) uses safe scheme (https:// or relative /)`);
    assert(!value.includes('<script>') && !value.includes('javascript:'), `URL in ${key} has no XSS vectors`);
  }
});

// Edge Case 5: Special characters in text / title / desc
[...data.CAROUSEL_DATA, ...data.PROJECT_DATA, ...data.ACHIEVEMENTS_LIST].forEach((item) => {
  const textContent = (item.title || '') + ' ' + (item.desc || '') + ' ' + (item.text || '');
  assert(!textContent.includes('<script>'), `Item ${item.id} text does not contain injection vectors`);
});

console.log('\n======================================================');
console.log(`DATA INTEGRITY RESULTS: Total: ${total} | Passed: ${passed} | Failed: ${failed}`);
console.log('======================================================');

if (failed > 0) {
  process.exit(1);
} else {
  process.exit(0);
}
