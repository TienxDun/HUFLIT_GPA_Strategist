/**
 * Test Utilities
 * Shared test helpers for all unit tests
 */

export let passCount = 0;
export let failCount = 0;

/**
 * Describe a test suite
 * @param {string} name - Suite name
 * @param {Function} fn - Test functions
 */
export function describe(name, fn) {
  console.log(`\n📦 ${name}`);
  fn();
}

/**
 * Define a test case
 * @param {string} name - Test name
 * @param {Function} fn - Test function
 */
export function it(name, fn) {
  try {
    fn();
    console.log(`  ✅ ${name}`);
    passCount++;
  } catch (error) {
    console.log(`  ❌ ${name}`);
    console.log(`     ${error.message}`);
    failCount++;
  }
}

/**
 * Assertion helper
 * @param {*} actual - Actual value
 * @returns {Object} Assertion methods
 */
export function expect(actual) {
  return {
    toBe(expected) {
      if (actual !== expected) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toEqual(expected) {
      if (JSON.stringify(actual) !== JSON.stringify(expected)) {
        throw new Error(`Expected ${JSON.stringify(expected)} but got ${JSON.stringify(actual)}`);
      }
    },
    toBeCloseTo(expected, precision = 2) {
      const multiplier = Math.pow(10, precision);
      const actualRounded = Math.round(actual * multiplier) / multiplier;
      const expectedRounded = Math.round(expected * multiplier) / multiplier;
      if (actualRounded !== expectedRounded) {
        throw new Error(`Expected ${expected} but got ${actual}`);
      }
    },
    toBeGreaterThan(expected) {
      if (!(actual > expected)) {
        throw new Error(`Expected ${actual} to be greater than ${expected}`);
      }
    },
    toBeGreaterThanOrEqual(expected) {
      if (!(actual >= expected)) {
        throw new Error(`Expected ${actual} to be greater than or equal to ${expected}`);
      }
    },
    toBeLessThan(expected) {
      if (!(actual < expected)) {
        throw new Error(`Expected ${actual} to be less than ${expected}`);
      }
    },
    toBeTruthy() {
      if (!actual) {
        throw new Error(`Expected truthy value but got ${actual}`);
      }
    },
    toBeFalsy() {
      if (actual) {
        throw new Error(`Expected falsy value but got ${actual}`);
      }
    },
    toHaveLength(expected) {
      if (actual.length !== expected) {
        throw new Error(`Expected length ${expected} but got ${actual.length}`);
      }
    }
  };
}

/**
 * Reset test counters
 */
export function resetCounters() {
  passCount = 0;
  failCount = 0;
}

/**
 * Print test summary
 */
export function printSummary() {
  console.log('\n' + '='.repeat(50));
  console.log(`📊 Test Results: ${passCount} passed, ${failCount} failed`);
  console.log('='.repeat(50));
  
  if (failCount > 0 && typeof process !== 'undefined') {
    process.exit(1);
  }
}
