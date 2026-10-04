const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const LabCore = require('../js/labcore.js');

console.log('Running Placement tests...');

// Case 1: First shape (no other shape)
const sq1 = MathCore.createSquare(4, 0, 0);
const area = { width: 30, height: 25 };
const pos1 = LabCore.findFreePosition(sq1, null, area);
assert.notStrictEqual(pos1, null, 'First position should be found');
assert.strictEqual(pos1.x, 0);
assert.strictEqual(pos1.y, 0);

// Place sq1 at (0, 0)
const placedSq1 = LabCore.translateShape(sq1, pos1.x, pos1.y);

// Case 2: Second shape is also a square of side 4
const sq2 = MathCore.createSquare(4, 0, 0);
const pos2 = LabCore.findFreePosition(sq2, placedSq1, area);
assert.notStrictEqual(pos2, null, 'Second position should be found for duplicate square');

const placedSq2 = LabCore.translateShape(sq2, pos2.x, pos2.y);
assert.strictEqual(MathCore.shapesOverlap(placedSq1, placedSq2), false, 'Two placed shapes must not overlap');

// Case 3: Test when existing shape is placed at (4, 6)
const placedAt4_6 = MathCore.createSquare(4, 4, 6);
const pos3 = LabCore.findFreePosition(sq2, placedAt4_6, area);
assert.notStrictEqual(pos3, null, 'Position should be found when other shape is at (4,6)');
const placedSq3 = LabCore.translateShape(sq2, pos3.x, pos3.y);
assert.strictEqual(MathCore.shapesOverlap(placedAt4_6, placedSq3), false, 'Shapes must not overlap');

console.log('ALL PLACEMENT TESTS PASSED SUCCESSFULLY!');
