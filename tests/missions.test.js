/**
 * tests/missions.test.js
 * Unit tests for Tab 2: Mission Time
 */

const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const Missions = require('../js/missions.js');

console.log('Running Missions tests...');

// 1. Verify computed answers for M1 to M8 against verified expectations
const expectedAnswers = {
  1: 24, // M1 Perimeter
  2: 26, // M2 Perimeter
  3: 36, // M3 Area
  4: 36, // M4 Perimeter
  5: 30, // M5 Perimeter
  6: 68, // M6 Area
  7: 22, // M7 Perimeter
  8: 30  // M8 Area
};

for (let id = 1; id <= 8; id++) {
  const m = Missions.getMission(id);
  assert.ok(m, `Mission ${id} should exist`);
  assert.strictEqual(
    m.computedAnswer,
    expectedAnswers[id],
    `Mission ${id} computed answer should equal ${expectedAnswers[id]}, got ${m.computedAnswer}`
  );
  console.log(`Mission ${id} verified answer: ${m.computedAnswer}`);
}

// 2. Test checkMissionAnswer logic for M1
const m1 = Missions.getMission(1);
const shapes = m1.createShapes();
const placedShapesList = [{ shape: shapes.s1 }, { shape: shapes.s2 }];

// Test accepts valid inputs ("24 cm", "24cm", 24, " 24 ")
assert.strictEqual(Missions.checkMissionAnswer(1, placedShapesList, '24 cm').success, true, 'Accepts "24 cm"');
assert.strictEqual(Missions.checkMissionAnswer(1, placedShapesList, '24cm').success, true, 'Accepts "24cm"');
assert.strictEqual(Missions.checkMissionAnswer(1, placedShapesList, 24).success, true, 'Accepts 24');

// Test rejects wrong answers (32)
const wrongRes = Missions.checkMissionAnswer(1, placedShapesList, 32);
assert.strictEqual(wrongRes.success, false, 'Rejects 32');
assert.ok(wrongRes.message.includes('shared side'), 'Mistake note mentions shared side');

// Test rejects if shapes are not placed/joined
const emptyRes = Missions.checkMissionAnswer(1, [], '24 cm');
assert.strictEqual(emptyRes.success, false);
assert.strictEqual(emptyRes.builtError, true);
assert.strictEqual(emptyRes.message, 'Build the shape first! Join the two shapes.');

console.log('ALL MISSIONS TESTS PASSED SUCCESSFULLY!');
