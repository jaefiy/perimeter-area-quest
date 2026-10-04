/**
 * tests/splitcore.test.js
 * Unit tests for Tab 3: Split It!
 */

const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const SplitCore = require('../js/splitcore.js');

console.log('Running SplitCore tests...');

// 1. Verify correct areas for S1 to S6
const expectedAreas = {
  S1: 30,
  S2: 36,
  S3: 30,
  S4: 30,
  S5: 23,
  S6: 68
};

SplitCore.composites.forEach(comp => {
  const c = SplitCore.getComposite(comp.id);
  assert.ok(c, `Composite ${comp.id} should exist`);
  assert.strictEqual(
    c.computedArea,
    expectedAreas[comp.id],
    `Composite ${comp.id} area should equal ${expectedAreas[comp.id]}, got ${c.computedArea}`
  );
  console.log(`Composite ${comp.id} area verified: ${c.computedArea} cm²`);
});

// 2. Verify card matching logic
SplitCore.composites.forEach(comp => {
  // Correct card matches
  assert.strictEqual(
    SplitCore.checkCardMatch(comp.id, comp.cardTitle),
    true,
    `Card "${comp.cardTitle}" should match ${comp.id}`
  );

  // Distractor card does NOT match
  assert.strictEqual(
    SplitCore.checkCardMatch(comp.id, comp.distractorCard),
    false,
    `Distractor "${comp.distractorCard}" should NOT match ${comp.id}`
  );
});

// 3. Verify MCQ area options
SplitCore.composites.forEach(comp => {
  const options = SplitCore.getAreaOptions(comp.id);
  assert.strictEqual(options.length, 3, `${comp.id} options should contain exactly 3 choices`);

  // Ensure correct answer is contained exactly once
  const correctMatches = options.filter(opt => opt === expectedAreas[comp.id]);
  assert.strictEqual(
    correctMatches.length,
    1,
    `${comp.id} options should contain the correct answer exactly once`
  );

  // Ensure all 3 options are unique
  const uniqueSet = new Set(options);
  assert.strictEqual(uniqueSet.size, 3, `${comp.id} options should be unique`);
});

console.log('ALL SPLITCORE TESTS PASSED SUCCESSFULLY!');
