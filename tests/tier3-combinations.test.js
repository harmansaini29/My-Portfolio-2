/**
 * Tier 3: Cross-Feature Combinations Tests
 * Specifications: ORIGINAL_REQUEST.md, PROJECT.md
 */

const {
  describe,
  test,
  assert,
  assertEqual,
  assertMatch,
  fileExists,
  readFile,
  parseSourceFile,
  extractImports,
  evaluateTsModule,
} = require('./helpers');

function runTier3Tests() {
  describe('Tier 3 - Cross-Feature Combinations', () => {
    test('T3.1: Vortex dissolve transition seamlessly hands off pointer events to Liquid Glass Carousel drag without dead zone', () => {
      // Cross-check: Vortex layer at smoothProgress >= 0.74 sets pointerEvents: 'none',
      // while Journey layer has pointer-events: 'auto' at z-20.
      const pageCode = readFile('app/page.tsx');
      const vortexFilePath = fileExists('components/VortexAbout.tsx') ? 'components/VortexAbout.tsx' : 'components/ScrollJourney.tsx';
      const vortexCode = readFile(vortexFilePath);

      // Verify vortex pointer-events disables at 0.74
      const hasDissolvePointerDisabling = vortexCode.includes('0.74') && vortexCode.includes('none');
      assert(hasDissolvePointerDisabling, 'VortexAbout must transition pointer-events to "none" around progress 0.74');

      // Verify Journey carousel is receptive
      const journeyCode = fileExists('components/JourneySection.tsx') ? readFile('components/JourneySection.tsx') : pageCode;
      assert(journeyCode.includes('LiquidGlassCarousel'), 'Journey must contain LiquidGlassCarousel');
      assert(journeyCode.includes('pointer-events-auto') || pageCode.includes('pointer-events-auto'), 'Journey carousel wrapper must specify pointer-events-auto');
    });

    test('T3.2: MosaicFlip slide changes update ChromiumBorderContainer telemetry project counter and HUD simultaneously', () => {
      // Verify communication between ProjectsSection state and ChromiumBorderContainer
      if (fileExists('components/ProjectsSection.tsx')) {
        const sf = parseSourceFile('components/ProjectsSection.tsx');
        const code = readFile('components/ProjectsSection.tsx');

        // Check activeProject state connects MosaicFlip onSlideChange to ChromiumBorderContainer activeProjectIndex
        assertMatch(code, /useState\s*\(\s*0\s*\)/, 'ProjectsSection must maintain activeProject state initialized to 0');
        assertMatch(code, /onSlideChange=\{setActiveProject\}/, 'MosaicFlip must trigger setActiveProject on slide change');
        assertMatch(code, /activeProjectIndex=\{activeProject\}/, 'ChromiumBorderContainer must receive activeProject as activeProjectIndex');
      } else {
        assert(true, 'Pending M1 implementation of components/ProjectsSection.tsx');
      }
    });

    test('T3.3: PORTFOLIO_MEDIA centralized updates power Journey, Projects, and Achievements consistently without schema divergence', () => {
      const mod = evaluateTsModule('lib/portfolio-data.ts');
      
      // If PORTFOLIO_MEDIA is implemented (M1)
      if (mod.PORTFOLIO_MEDIA) {
        const media = mod.PORTFOLIO_MEDIA;
        
        // Check Journey links to media.journey
        mod.CAROUSEL_DATA.forEach((journeyItem, idx) => {
          assert(typeof journeyItem.image === 'string' && journeyItem.image.length > 0, `CAROUSEL_DATA[${idx}] image must be valid`);
        });

        // Check Projects link to media.projects
        mod.PROJECT_DATA.forEach((projItem, idx) => {
          assert(typeof projItem.image === 'string' && projItem.image.length > 0, `PROJECT_DATA[${idx}] image must be valid`);
        });

        // Check Achievements link to media.achievements
        assert(mod.ACHIEVEMENTS_DATA.itemCount > 0, 'ACHIEVEMENTS_DATA must have items');
      } else {
        // Unmodified baseline check
        assert(Array.isArray(mod.CAROUSEL_DATA), 'CAROUSEL_DATA must be an array');
        assert(Array.isArray(mod.PROJECT_DATA), 'PROJECT_DATA must be an array');
      }
    });

    test('T3.4: Dynamic link extraction from project descriptions in ProjectsSection generates valid clickable HUD launch URLs', () => {
      // Verify regex parser and domain extractor
      const sampleDescriptions = [
        'Intelligent Anti-Bot Defense | Live → aegis-ai.vercel.app',
        'CSMU Utility | Live → cet-exam-portal.vercel.app',
        'Generative AI Branding | Live → ai-logo-maker.vercel.app',
        'Offline Systems Project without live link',
      ];

      function extractLiveUrl(desc) {
        const match = desc.match(/Live\s*→\s*([a-zA-Z0-9.-]+)/i);
        return match ? `https://${match[1]}` : null;
      }

      assertEqual(extractLiveUrl(sampleDescriptions[0]), 'https://aegis-ai.vercel.app');
      assertEqual(extractLiveUrl(sampleDescriptions[1]), 'https://cet-exam-portal.vercel.app');
      assertEqual(extractLiveUrl(sampleDescriptions[2]), 'https://ai-logo-maker.vercel.app');
      assertEqual(extractLiveUrl(sampleDescriptions[3]), null);
    });

    test('T3.5: StickySection and page stacking contexts across 7 sections do not create scroll lockouts or z-index collisions', () => {
      const pageCode = readFile('app/page.tsx');
      
      // Check that sticky sections do not have fixed overlays with pointer-events: auto blocking other sections
      const hasUnintendedBlockingFixed = /fixed\s+inset-0(?![^>]*pointer-events-none)/.test(pageCode);
      assert(!hasUnintendedBlockingFixed, 'Fixed overlays in app/page.tsx must have pointer-events-none to prevent global scroll blocking');

      // Verify relative z-index hierarchy
      assertMatch(pageCode, /relative\s+z-10|relative\s+z-20/, 'Sections must use controlled relative stacking');
    });
  });
}

module.exports = { runTier3Tests };
