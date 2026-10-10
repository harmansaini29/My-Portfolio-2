/**
 * E2E Test Suite Helpers & Verification Engine
 * Author: E2E Test Writer
 * Authoritative Sources: ORIGINAL_REQUEST.md, PROJECT.md
 */

const fs = require('fs');
const path = require('path');
const ts = require('typescript');

const PROJECT_ROOT = path.resolve(__dirname, '..');

// ANSI Color Helpers
const colors = {
  reset: '\x1b[0m',
  bold: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
};

// Global Test Registry
const testState = {
  suites: [],
  currentSuite: null,
  totalTests: 0,
  passed: 0,
  failed: 0,
  skipped: 0,
  failures: [],
  startTime: 0,
};

function describe(suiteName, fn) {
  const suite = {
    name: suiteName,
    tests: [],
  };
  testState.suites.push(suite);
  const prevSuite = testState.currentSuite;
  testState.currentSuite = suite;
  try {
    fn();
  } finally {
    testState.currentSuite = prevSuite;
  }
}

function test(testName, fn) {
  const currentSuite = testState.currentSuite;
  if (!currentSuite) {
    throw new Error(`Test "${testName}" must be defined inside a describe() block`);
  }
  currentSuite.tests.push({
    name: testName,
    fn,
  });
  testState.totalTests++;
}

// Assertions
function assert(condition, message) {
  if (!condition) {
    throw new Error(message || 'Assertion failed');
  }
}

const assertTrue = assert;

function assertFalse(condition, message) {
  if (condition) {
    throw new Error(message || 'Expected false condition, got truthy');
  }
}

function assertEqual(actual, expected, message) {
  if (actual !== expected) {
    const detail = `Expected: ${JSON.stringify(expected)}\nReceived: ${JSON.stringify(actual)}`;
    throw new Error(message ? `${message}\n${detail}` : detail);
  }
}

function assertDeepEqual(actual, expected, message) {
  const actualStr = JSON.stringify(actual);
  const expectedStr = JSON.stringify(expected);
  if (actualStr !== expectedStr) {
    const detail = `Expected deep equality:\nExpected: ${expectedStr}\nReceived: ${actualStr}`;
    throw new Error(message ? `${message}\n${detail}` : detail);
  }
}

function assertMatch(str, regex, message) {
  if (!regex.test(str)) {
    throw new Error(message || `String did not match pattern ${regex}: "${str}"`);
  }
}

function assertNotMatch(str, regex, message) {
  if (regex.test(str)) {
    throw new Error(message || `String unexpectedly matched pattern ${regex}: "${str}"`);
  }
}

function assertThrows(fn, message) {
  let threw = false;
  try {
    fn();
  } catch {
    threw = true;
  }
  if (!threw) {
    throw new Error(message || 'Expected function to throw, but it succeeded');
  }
}

// AST & File Helpers
function getAbsolutePath(relPath) {
  return path.resolve(PROJECT_ROOT, relPath);
}

function fileExists(relPath) {
  return fs.existsSync(getAbsolutePath(relPath));
}

function readFile(relPath) {
  const fullPath = getAbsolutePath(relPath);
  if (!fs.existsSync(fullPath)) {
    throw new Error(`File does not exist: ${relPath}`);
  }
  return fs.readFileSync(fullPath, 'utf8');
}

function parseSourceFile(relPath) {
  const content = readFile(relPath);
  const isTsx = relPath.endsWith('.tsx') || relPath.endsWith('.jsx');
  return ts.createSourceFile(
    relPath,
    content,
    ts.ScriptTarget.Latest,
    true,
    isTsx ? ts.ScriptKind.TSX : ts.ScriptKind.TS
  );
}

function extractImports(sourceFile) {
  const imports = [];
  ts.forEachChild(sourceFile, (node) => {
    if (ts.isImportDeclaration(node)) {
      const moduleSpecifier = node.moduleSpecifier.text;
      const namedBindings = [];
      let defaultImport = null;

      if (node.importClause) {
        if (node.importClause.name) {
          defaultImport = node.importClause.name.text;
        }
        if (node.importClause.namedBindings) {
          if (ts.isNamedImports(node.importClause.namedBindings)) {
            node.importClause.namedBindings.elements.forEach((elem) => {
              namedBindings.push(elem.name.text);
            });
          }
        }
      }
      imports.push({
        module: moduleSpecifier,
        defaultImport,
        namedBindings,
      });
    }
  });
  return imports;
}

function extractJsxElements(sourceFile) {
  const elements = [];
  function visit(node) {
    if (ts.isJsxOpeningElement(node) || ts.isJsxSelfClosingElement(node)) {
      const tagName = node.tagName.getText(sourceFile);
      const props = {};
      node.attributes.properties.forEach((prop) => {
        if (ts.isJsxAttribute(prop)) {
          const propName = prop.name.getText(sourceFile);
          const propValue = prop.initializer ? prop.initializer.getText(sourceFile) : true;
          props[propName] = propValue;
        }
      });
      elements.push({ tagName, props });
    }
    ts.forEachChild(node, visit);
  }
  visit(sourceFile);
  return elements;
}

/**
 * Safely transpile and evaluate a TypeScript module in memory
 */
function evaluateTsModule(relPath) {
  const content = readFile(relPath);
  const transpiled = ts.transpileModule(content, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX,
    },
  });

  const m = { exports: {} };
  const customRequire = (id) => {
    if (id.startsWith('./') || id.startsWith('../')) {
      const dir = path.dirname(getAbsolutePath(relPath));
      const targetPath = path.resolve(dir, id);
      const possibleExtensions = ['.ts', '.tsx', '.js', '.jsx', '.json'];
      for (const ext of possibleExtensions) {
        if (fs.existsSync(targetPath + ext)) {
          return evaluateTsModule(path.relative(PROJECT_ROOT, targetPath + ext));
        }
      }
      if (fs.existsSync(targetPath) && fs.statSync(targetPath).isDirectory()) {
        for (const ext of possibleExtensions) {
          const indexFile = path.join(targetPath, 'index' + ext);
          if (fs.existsSync(indexFile)) {
            return evaluateTsModule(path.relative(PROJECT_ROOT, indexFile));
          }
        }
      }
    }
    // Fall back to native require
    try {
      return require(id);
    } catch {
      return {};
    }
  };

  const fn = new Function('require', 'exports', 'module', transpiled.outputText);
  fn(customRequire, m.exports, m);
  return m.exports;
}

module.exports = {
  PROJECT_ROOT,
  colors,
  testState,
  describe,
  test,
  assert,
  assertTrue,
  assertFalse,
  assertEqual,
  assertDeepEqual,
  assertMatch,
  assertNotMatch,
  assertThrows,
  getAbsolutePath,
  fileExists,
  readFile,
  parseSourceFile,
  extractImports,
  extractJsxElements,
  evaluateTsModule,
};
