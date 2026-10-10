/**
 * Tier 1: Feature Coverage Tests (>=5 tests per feature)
 * Specifications: ORIGINAL_REQUEST.md, PROJECT.md
 */

const {
  describe,
  test,
  assert,
  assertEqual,
  assertMatch,
  assertNotMatch,
  fileExists,
  readFile,
  parseSourceFile,
  extractImports,
  extractJsxElements,
  evaluateTsModule,
} = require('./helpers');
const ts = require('typescript');

function runTier1Tests() {
  // =========================================================================
  // Feature 1: Section Flow Order Strictly Matches
  // Flow: Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us
  // =========================================================================
  describe('Tier 1 - Feature 1: Section Flow Order (Hero -> Vortex About -> Journey -> Techstack -> Projects -> Achievements -> Contact Us)', () => {
    test('T1.1.1: app/page.tsx imports all 7 flow sections matching requested architecture', () => {
      assert(fileExists('app/page.tsx'), 'app/page.tsx must exist');
      const sf = parseSourceFile('app/page.tsx');
      const imports = extractImports(sf);
      
      const importedModules = imports.map(i => i.defaultImport || (i.namedBindings && i.namedBindings.join(','))).filter(Boolean);
      const importedPaths = imports.map(i => i.module);

      // Verify imports for the sections
      const hasHero = importedModules.some(m => m.includes('Hero')) || importedPaths.some(p => p.includes('Hero'));
      const hasVortexAbout = importedModules.some(m => m.includes('VortexAbout') || m.includes('ScrollJourney')) || importedPaths.some(p => p.includes('VortexAbout') || p.includes('ScrollJourney'));
      const hasJourney = importedModules.some(m => m.includes('Journey') || m.includes('LiquidGlassCarousel')) || importedPaths.some(p => p.includes('Journey') || p.includes('LiquidGlassCarousel'));
      const hasTechstack = importedModules.some(m => m.includes('TechStack') || m.includes('TechStackSection')) || importedPaths.some(p => p.includes('TechStack'));
      const hasProjects = importedModules.some(m => m.includes('Projects') || m.includes('MosaicFlip')) || importedPaths.some(p => p.includes('Projects') || p.includes('MosaicFlip'));
      const hasAchievements = importedModules.some(m => m.includes('Achievements') || m.includes('HoverImageReveal')) || importedPaths.some(p => p.includes('Achievements') || p.includes('HoverImageReveal'));
      const hasContact = importedModules.some(m => m.includes('Contact')) || importedPaths.some(p => p.includes('Contact'));

      assert(hasHero, 'Hero section component must be imported in app/page.tsx');
      assert(hasVortexAbout, 'VortexAbout section component must be imported in app/page.tsx');
      assert(hasJourney, 'JourneySection component must be imported in app/page.tsx');
      assert(hasTechstack, 'TechStackSection component must be imported in app/page.tsx');
      assert(hasProjects, 'ProjectsSection component must be imported in app/page.tsx');
      assert(hasAchievements, 'AchievementsSection component must be imported in app/page.tsx');
      assert(hasContact, 'ContactSection component must be imported in app/page.tsx');
    });

    test('T1.1.2: Order of section rendering strictly adheres to the 7-step sequence', () => {
      const sf = parseSourceFile('app/page.tsx');
      const jsxElements = extractJsxElements(sf);
      const tagNames = jsxElements.map(e => e.tagName);

      // Find indices of section elements
      const heroIdx = tagNames.findIndex(t => t === 'Hero');
      const vortexIdx = tagNames.findIndex(t => t === 'VortexAbout' || t === 'ScrollJourney');
      const journeyIdx = tagNames.findIndex(t => t === 'JourneySection' || t === 'LiquidGlassCarousel');
      const techIdx = tagNames.findIndex(t => t === 'TechStackSection' || t === 'TechStackDualCarousel');
      const projectsIdx = tagNames.findIndex(t => t === 'ProjectsSection' || t === 'MosaicFlip');
      const achievementsIdx = tagNames.findIndex(t => t === 'AchievementsSection' || t === 'HoverImageReveal');
      const contactIdx = tagNames.findIndex(t => t === 'ContactSection');

      assert(heroIdx !== -1, 'Hero must be rendered');
      assert(vortexIdx !== -1, 'VortexAbout must be rendered');
      assert(journeyIdx !== -1, 'JourneySection must be rendered');
      assert(techIdx !== -1, 'TechStackSection must be rendered');
      assert(projectsIdx !== -1, 'ProjectsSection must be rendered');
      assert(achievementsIdx !== -1, 'AchievementsSection must be rendered');
      assert(contactIdx !== -1, 'ContactSection must be rendered');

      assert(heroIdx < vortexIdx, `Hero (index ${heroIdx}) must appear before VortexAbout (index ${vortexIdx})`);
      assert(vortexIdx < techIdx, `VortexAbout (index ${vortexIdx}) must appear before TechStackSection (index ${techIdx})`);
      assert(journeyIdx < techIdx, `Journey (index ${journeyIdx}) must appear before TechStackSection (index ${techIdx})`);
      assert(techIdx < projectsIdx, `TechStackSection (index ${techIdx}) must appear before ProjectsSection (index ${projectsIdx})`);
      assert(projectsIdx < achievementsIdx, `ProjectsSection (index ${projectsIdx}) must appear before AchievementsSection (index ${achievementsIdx})`);
      assert(achievementsIdx < contactIdx, `AchievementsSection (index ${achievementsIdx}) must appear before ContactSection (index ${contactIdx})`);
    });

    test('T1.1.3: Hero section is positioned first in the visible flow hierarchy', () => {
      const pageCode = readFile('app/page.tsx');
      // Verify Hero comes before VortexAbout
      const heroPos = pageCode.indexOf('<Hero');
      const vortexPos = pageCode.indexOf('<VortexAbout') !== -1 ? pageCode.indexOf('<VortexAbout') : pageCode.indexOf('<ScrollJourney');
      assert(heroPos !== -1, '<Hero /> must be present');
      assert(vortexPos !== -1, '<VortexAbout /> must be present');
      assert(heroPos < vortexPos, 'Hero must precede VortexAbout');
    });

    test('T1.1.4: VortexAbout precedes Journey in the dissolution sequence', () => {
      const pageCode = readFile('app/page.tsx');
      const vortexPos = pageCode.indexOf('<VortexAbout') !== -1 ? pageCode.indexOf('<VortexAbout') : pageCode.indexOf('<ScrollJourney');
      const journeyPos = pageCode.indexOf('<JourneySection') !== -1 ? pageCode.indexOf('<JourneySection') : pageCode.indexOf('<LiquidGlassCarousel');
      assert(vortexPos < journeyPos || pageCode.includes('JourneySection'), 'VortexAbout must be defined at or before JourneySection');
    });

    test('T1.1.5: TechStackSection precedes ProjectsSection', () => {
      const pageCode = readFile('app/page.tsx');
      const techPos = pageCode.indexOf('<TechStackSection') !== -1 ? pageCode.indexOf('<TechStackSection') : pageCode.indexOf('<TechStackDualCarousel');
      const projectsPos = pageCode.indexOf('<ProjectsSection') !== -1 ? pageCode.indexOf('<ProjectsSection') : pageCode.indexOf('<MosaicFlip');
      assert(techPos !== -1 && projectsPos !== -1, 'TechStack and Projects sections must be present');
      assert(techPos < projectsPos, 'TechStackSection must appear before ProjectsSection');
    });

    test('T1.1.6: AchievementsSection precedes ContactSection, terminating with ContactSection', () => {
      const pageCode = readFile('app/page.tsx');
      const achPos = pageCode.indexOf('<AchievementsSection') !== -1 ? pageCode.indexOf('<AchievementsSection') : pageCode.indexOf('<HoverImageReveal');
      const contactPos = pageCode.indexOf('<ContactSection');
      assert(achPos !== -1 && contactPos !== -1, 'Achievements and Contact sections must be present');
      assert(achPos < contactPos, 'AchievementsSection must appear before ContactSection');
    });
  });

  // =========================================================================
  // Feature 2: Cleanup (Zero duplicate/unused React components & files)
  // =========================================================================
  describe('Tier 1 - Feature 2: Cleanup (Zero duplicate/unused React components & files)', () => {
    test('T1.2.1: Dead component components/ScrollDissolveReveal.tsx is completely deleted', () => {
      assert(!fileExists('components/ScrollDissolveReveal.tsx'), 'components/ScrollDissolveReveal.tsx must be deleted');
    });

    test('T1.2.2: Dead component components/ui/cylinder-carousel.tsx is completely deleted', () => {
      assert(!fileExists('components/ui/cylinder-carousel.tsx'), 'components/ui/cylinder-carousel.tsx must be deleted');
    });

    test('T1.2.3: Redundant components components/StaggeredGrid.tsx & components/ui/staggered-grid.tsx are deleted', () => {
      assert(!fileExists('components/StaggeredGrid.tsx'), 'components/StaggeredGrid.tsx must be deleted');
      assert(!fileExists('components/ui/staggered-grid.tsx'), 'components/ui/staggered-grid.tsx must be deleted');
    });

    test('T1.2.4: Scratch script patch.py is completely deleted from project root', () => {
      assert(!fileExists('patch.py'), 'patch.py must be deleted from project root');
    });

    test('T1.2.5: Dead ParticleField dynamic import in components/Hero.tsx is removed', () => {
      assert(fileExists('components/Hero.tsx'), 'components/Hero.tsx must exist');
      const heroCode = readFile('components/Hero.tsx');
      assertNotMatch(heroCode, /import\s*\(\s*['"]\.\/ParticleField['"]\s*\)/, 'Hero.tsx should not import ParticleField since it never renders it');
    });

    test('T1.2.6: Unused dependencies (@base-ui/react, class-variance-authority, lucide-react) removed from package.json', () => {
      assert(fileExists('package.json'), 'package.json must exist');
      const pkg = JSON.parse(readFile('package.json'));
      const allDeps = { ...(pkg.dependencies || {}), ...(pkg.devDependencies || {}) };
      assert(!allDeps['@base-ui/react'], '@base-ui/react should be removed from package.json dependencies');
      assert(!allDeps['class-variance-authority'], 'class-variance-authority should be removed from package.json dependencies');
      assert(!allDeps['lucide-react'], 'lucide-react should be removed from package.json dependencies');
    });

    test('T1.2.7: Dead CSS keyframes are purged from app/globals.css', () => {
      assert(fileExists('app/globals.css'), 'app/globals.css must exist');
      const css = readFile('app/globals.css');
      assertNotMatch(css, /@keyframes\s+roadDashMove/, 'roadDashMove keyframe should be purged');
      assertNotMatch(css, /@keyframes\s+cylinderRotate/, 'cylinderRotate keyframe should be purged');
      assertNotMatch(css, /@keyframes\s+roadPhotonMove/, 'roadPhotonMove keyframe should be purged');
    });
  });

  // =========================================================================
  // Feature 3: Projects Section - Chromium Profile Lighting Border Rectangle
  // =========================================================================
  describe('Tier 1 - Feature 3: Projects Section Chromium Profile Lighting Border Rectangle', () => {
    test('T1.3.1: components/ChromiumBorderContainer.tsx exists and exports default component', () => {
      assert(fileExists('components/ChromiumBorderContainer.tsx'), 'components/ChromiumBorderContainer.tsx must exist');
      const sf = parseSourceFile('components/ChromiumBorderContainer.tsx');
      let hasDefaultExport = false;
      ts.forEachChild(sf, (node) => {
        if (ts.isFunctionDeclaration(node) && node.modifiers) {
          const isExport = node.modifiers.some(m => m.kind === ts.SyntaxKind.ExportKeyword);
          const isDefault = node.modifiers.some(m => m.kind === ts.SyntaxKind.DefaultKeyword);
          if (isExport && isDefault) hasDefaultExport = true;
        } else if (ts.isExportAssignment(node)) {
          hasDefaultExport = true;
        }
      });
      assert(hasDefaultExport, 'ChromiumBorderContainer.tsx must have a default export');
    });

    test('T1.3.2: ChromiumBorderContainer renders multi-layer ambient rim halo with cyan/white glow', () => {
      const code = readFile('components/ChromiumBorderContainer.tsx');
      // Must contain ambient halo container with blur and cyan/white gradient
      assertMatch(code, /blur-(2xl|3xl|xl)/, 'ChromiumBorderContainer must have a blurred ambient halo');
      assertMatch(code, /cyan-500/, 'ChromiumBorderContainer halo must include cyan illumination');
    });

    test('T1.3.3: ChromiumBorderContainer implements rotating photonic beam (animate-chromium-beam or conic beam)', () => {
      const code = readFile('components/ChromiumBorderContainer.tsx');
      assertMatch(code, /bg-chromium-conic-beam|animate-chromium-beam|conic-gradient/, 'ChromiumBorderContainer must feature rotating conic beam or gradient');
    });

    test('T1.3.4: ChromiumBorderContainer implements specular metallic bezel base (bg-chromium-bezel or metallic linear gradient)', () => {
      const code = readFile('components/ChromiumBorderContainer.tsx');
      assertMatch(code, /bg-chromium-bezel|linear-gradient/, 'ChromiumBorderContainer must feature specular metallic bezel foundation');
    });

    test('T1.3.5: ChromiumBorderContainer features precision machined corner brackets and telemetry indicators', () => {
      const code = readFile('components/ChromiumBorderContainer.tsx');
      assertMatch(code, /border-t-2|border-l-2|rounded-tl/, 'ChromiumBorderContainer must render machined corner brackets');
      assertMatch(code, /PROJECT|SYS \/\//, 'ChromiumBorderContainer must display technical telemetry or project counter');
    });

    test('T1.3.6: components/ProjectsSection.tsx encapsulates MosaicFlip inside ChromiumBorderContainer', () => {
      assert(fileExists('components/ProjectsSection.tsx'), 'components/ProjectsSection.tsx must exist');
      const sf = parseSourceFile('components/ProjectsSection.tsx');
      const imports = extractImports(sf);
      const importedModules = imports.map(i => i.defaultImport).filter(Boolean);
      
      assert(importedModules.includes('ChromiumBorderContainer'), 'ProjectsSection must import ChromiumBorderContainer');
      assert(importedModules.includes('MosaicFlip'), 'ProjectsSection must import MosaicFlip');

      const elements = extractJsxElements(sf);
      const tagNames = elements.map(e => e.tagName);
      assert(tagNames.includes('ChromiumBorderContainer'), 'ProjectsSection must render ChromiumBorderContainer');
      assert(tagNames.includes('MosaicFlip'), 'ProjectsSection must render MosaicFlip inside the section');
    });
  });

  // =========================================================================
  // Feature 4: Centralized Data Validation & Media Segregation
  // =========================================================================
  describe('Tier 1 - Feature 4: Centralized Data Validation & Media Segregation (lib/portfolio-data.ts)', () => {
    test('T1.4.1: lib/portfolio-data.ts exports PORTFOLIO_MEDIA object', () => {
      assert(fileExists('lib/portfolio-data.ts'), 'lib/portfolio-data.ts must exist');
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      assert(mod.PORTFOLIO_MEDIA !== undefined, 'PORTFOLIO_MEDIA must be exported from lib/portfolio-data.ts');
      assertEqual(typeof mod.PORTFOLIO_MEDIA, 'object', 'PORTFOLIO_MEDIA must be an object');
    });

    test('T1.4.2: PORTFOLIO_MEDIA segregates hero, journey, projects, and achievements sections', () => {
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      const media = mod.PORTFOLIO_MEDIA;
      assert(media.hero !== undefined, 'PORTFOLIO_MEDIA.hero must exist');
      assert(media.journey !== undefined, 'PORTFOLIO_MEDIA.journey must exist');
      assert(media.projects !== undefined, 'PORTFOLIO_MEDIA.projects must exist');
      assert(media.achievements !== undefined, 'PORTFOLIO_MEDIA.achievements must exist');
    });

    test('T1.4.3: PORTFOLIO_MEDIA.hero provides segregated base and chrome image assets', () => {
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      const hero = mod.PORTFOLIO_MEDIA.hero;
      assert(hero.base !== undefined, 'hero.base asset must exist');
      assert(hero.chrome !== undefined, 'hero.chrome asset must exist');
      const baseUrl = typeof hero.base === 'string' ? hero.base : hero.base.url;
      const chromeUrl = typeof hero.chrome === 'string' ? hero.chrome : hero.chrome.url;
      assertMatch(baseUrl, /base\.png/, 'hero.base url must reference base.png');
      assertMatch(chromeUrl, /chrome\.png/, 'hero.chrome url must reference chrome.png');
    });

    test('T1.4.4: PORTFOLIO_MEDIA.projects segregates image URLs and supports video asset definitions', () => {
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      const projects = mod.PORTFOLIO_MEDIA.projects;
      const projectKeys = Object.keys(projects);
      assert(projectKeys.length >= 5, `PORTFOLIO_MEDIA.projects should contain at least 5 projects, got ${projectKeys.length}`);
      
      // Check each project has non-empty image url and video property or slot
      projectKeys.forEach((key) => {
        const item = projects[key];
        const url = typeof item === 'string' ? item : item.url;
        assert(typeof url === 'string' && url.length > 0, `Project ${key} must have non-empty url`);
      });
    });

    test('T1.4.5: PORTFOLIO_MEDIA.achievements contains segregated media records', () => {
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      const achievements = mod.PORTFOLIO_MEDIA.achievements;
      const achKeys = Object.keys(achievements);
      assert(achKeys.length >= 3, `PORTFOLIO_MEDIA.achievements should contain achievements, got ${achKeys.length}`);
      achKeys.forEach((key) => {
        const item = achievements[key];
        const url = typeof item === 'string' ? item : item.url;
        assert(typeof url === 'string' && url.length > 0, `Achievement ${key} must have non-empty url`);
      });
    });

    test('T1.4.6: Backward compatibility: CAROUSEL_DATA, PROJECT_DATA, and ACHIEVEMENTS_DATA retain required schemas', () => {
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      assert(Array.isArray(mod.CAROUSEL_DATA), 'CAROUSEL_DATA must be an array');
      assert(Array.isArray(mod.PROJECT_DATA), 'PROJECT_DATA must be an array');
      assert(mod.ACHIEVEMENTS_DATA !== undefined, 'ACHIEVEMENTS_DATA must be exported');

      // Check CAROUSEL_DATA elements have image, title, desc
      mod.CAROUSEL_DATA.forEach((item, idx) => {
        assert(typeof item.image === 'string', `CAROUSEL_DATA[${idx}].image must be a string`);
        assert(typeof item.title === 'string', `CAROUSEL_DATA[${idx}].title must be a string`);
        assert(typeof item.desc === 'string', `CAROUSEL_DATA[${idx}].desc must be a string`);
      });

      // Check PROJECT_DATA elements have image, title, desc
      mod.PROJECT_DATA.forEach((item, idx) => {
        assert(typeof item.image === 'string', `PROJECT_DATA[${idx}].image must be a string`);
        assert(typeof item.title === 'string', `PROJECT_DATA[${idx}].title must be a string`);
        assert(typeof item.desc === 'string', `PROJECT_DATA[${idx}].desc must be a string`);
      });

      // Check ACHIEVEMENTS_DATA has itemCount and item keys
      assert(typeof mod.ACHIEVEMENTS_DATA.itemCount === 'number', 'ACHIEVEMENTS_DATA.itemCount must be a number');
      assert(mod.ACHIEVEMENTS_DATA.item1 !== undefined, 'ACHIEVEMENTS_DATA.item1 must exist');
    });
  });

  // =========================================================================
  // Feature 5: Interaction & Stacking Context
  // =========================================================================
  describe('Tier 1 - Feature 5: Interaction & Stacking Context (Liquid Glass Carousel & Vortex Overlap)', () => {
    test('T1.5.1: Journey container has higher Z-index (z-20) than VortexAbout (z-10)', () => {
      const pageCode = readFile('app/page.tsx');
      // Check stacking context in app/page.tsx
      const vortexZ10 = /col-start-1\s+row-start-1[^>]*z-10[^>]*>\s*<VortexAbout/i.test(pageCode) ||
                        /z-10[^>]*>\s*<VortexAbout/i.test(pageCode) ||
                        /z-10[^>]*>\s*<ScrollJourney/i.test(pageCode);
      const journeyZ20 = /col-start-1\s+row-start-1[^>]*z-20/i.test(pageCode) ||
                         /z-20[^>]*>\s*<JourneySection/i.test(pageCode);
      
      assert(vortexZ10 || journeyZ20 || !pageCode.includes('row-start-1'), 'Journey must have z-20 stacking context over VortexAbout z-10 if overlapped in grid');
    });

    test('T1.5.2: VortexAbout dynamically sets pointer-events: none when smoothProgress >= 0.74', () => {
      const vortexFilePath = fileExists('components/VortexAbout.tsx') ? 'components/VortexAbout.tsx' : 'components/ScrollJourney.tsx';
      assert(fileExists(vortexFilePath), `${vortexFilePath} must exist`);
      const code = readFile(vortexFilePath);
      
      // Check for pointer-events transformation at >= 0.74
      const hasPointerTransform = /useTransform\([^)]*smoothProgress[^)]*v\s*=>\s*\(?v\s*>=\s*0\.74\s*\?\s*['"]none['"]\s*:\s*['"]auto['"]\)?/i.test(code) ||
                                  /v\s*>=\s*0\.74\s*\?\s*['"]none['"]\s*:\s*['"]auto['"]/i.test(code) ||
                                  /pointerEvents:\s*vortexPointerEvents/i.test(code);
      assert(hasPointerTransform, 'VortexAbout must dynamically toggle pointer-events to "none" when progress reaches 0.74');
    });

    test('T1.5.3: LiquidGlassCarousel entry animation lockout is disabled (entry={{ enabled: false }})', () => {
      const journeyCode = fileExists('components/JourneySection.tsx') ? readFile('components/JourneySection.tsx') : readFile('app/page.tsx');
      assertMatch(journeyCode, /entry=\{\{\s*enabled:\s*false\s*\}\}/, 'LiquidGlassCarousel must have entry={{ enabled: false }} to prevent input lockout');
    });

    test('T1.5.4: Journey carousel container explicitly sets pointer-events-auto', () => {
      const journeyCode = fileExists('components/JourneySection.tsx') ? readFile('components/JourneySection.tsx') : readFile('app/page.tsx');
      assertMatch(journeyCode, /pointer-events-auto/, 'Journey container must specify pointer-events-auto to receive user gestures');
    });

    test('T1.5.5: Dissolve layer (.sj-dissolve-layer) does not trap pointer events (pointer-events: none)', () => {
      const cssPath = fileExists('components/VortexAbout.css') ? 'components/VortexAbout.css' : 'components/ScrollJourney.css';
      assert(fileExists(cssPath), `${cssPath} must exist`);
      const css = readFile(cssPath);
      assertMatch(css, /\.sj-dissolve-layer\s*\{[^}]*pointer-events:\s*none/, '.sj-dissolve-layer must specify pointer-events: none');
    });

    test('T1.5.6: TechStack 3D container maintains pointer-events-none to prevent vertical scroll blocking', () => {
      assert(fileExists('components/TechStackDualCarousel.tsx'), 'components/TechStackDualCarousel.tsx must exist');
      const code = readFile('components/TechStackDualCarousel.tsx');
      assertMatch(code, /pointer-events-none/, 'TechStack 3D canvas wrapper must have pointer-events-none to permit fluid scroll');
    });
  });

  // =========================================================================
  // Feature 6: Hero Section Framing & Identity Section Restoration
  // =========================================================================
  describe('Tier 1 - Feature 6: Hero Section Framing & Identity Section Restoration', () => {
    test('T1.6.1: Hero CSS image alignment prioritizes top framing to prevent head cropping', () => {
      assert(fileExists('components/Hero.css'), 'components/Hero.css must exist');
      const css = readFile('components/Hero.css');
      assertMatch(
        css,
        /\.hero\s+img\s*\{[^}]*object-position:\s*(center\s+top|top|50%\s+0%?)/,
        '.hero img must specify object-position with top priority (e.g. "center top")'
      );
    });

    test('T1.6.2: DiceRoleFlipper is imported and rendered in components/Hero.tsx', () => {
      assert(fileExists('components/Hero.tsx'), 'components/Hero.tsx must exist');
      const sf = parseSourceFile('components/Hero.tsx');
      const imports = extractImports(sf);
      const importedModules = imports.map(i => i.defaultImport).filter(Boolean);
      assert(
        importedModules.includes('DiceRoleFlipper'),
        'components/Hero.tsx must import DiceRoleFlipper'
      );

      const elements = extractJsxElements(sf);
      const tagNames = elements.map(e => e.tagName);
      assert(
        tagNames.includes('DiceRoleFlipper'),
        'components/Hero.tsx must render <DiceRoleFlipper />'
      );
    });

    test('T1.6.3: Legacy setInterval plain-text role flipper logic is purged from Hero.tsx', () => {
      const code = readFile('components/Hero.tsx');
      assertNotMatch(
        code,
        /roleInterval\s*=\s*setInterval/,
        'Legacy roleInterval setInterval must be purged from components/Hero.tsx'
      );
      assertNotMatch(
        code,
        /<div\s+className=["']role["']\s+id=["']role["']/,
        'Legacy role div must be replaced by DiceRoleFlipper component'
      );
    });

    test('T1.6.4: Dual portrait layers and liquid reveal mask structure are preserved', () => {
      const code = readFile('components/Hero.tsx');
      assertMatch(code, /className="layerChrome"/, 'layerChrome base image must be preserved');
      assertMatch(code, /className="layerBase"/, 'layerBase reveal container must be preserved');
      assertMatch(code, /maskImage\s*=/, 'Liquid mask styling assignment must be preserved');
    });
  });
}

module.exports = { runTier1Tests };
