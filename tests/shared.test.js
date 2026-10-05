const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const LabCore = require('../js/labcore.js');

console.log('Running getSharedSegments tests...');

// 1. Square 4 + Square 4 side by side
const sq1 = MathCore.createSquare(4, 0, 0);
const sq2 = MathCore.createSquare(4, 4, 0);
const segs1 = LabCore.getSharedSegments(sq1, sq2);
const totalLen1 = segs1.reduce((sum, s) => sum + s.length, 0);
assert.strictEqual(Math.round(totalLen1), 4, 'Square 4 + Square 4 total shared segment length should be 4');

// 2. Hexagon 4 + Square 4 joined
const hex4 = MathCore.regularPolygon(6, 4, 0, 0);
const sq4 = MathCore.regularPolygon(4, 4, 4, 0, { startAngle: Math.PI });
const segs2 = LabCore.getSharedSegments(hex4, sq4);
const totalLen2 = segs2.reduce((sum, s) => sum + s.length, 0);
assert.strictEqual(Math.round(totalLen2), 4, 'Hexagon 4 + Square 4 total shared segment length should be 4');

// 3. Hexagon 5 + right-angled triangle 3-4-5 on hypotenuse
const hex5 = MathCore.regularPolygon(6, 5, 0, 0);
const triRight = MathCore.createRightTriangle(3, 4, 0, 0);
// Snap triangle onto edge of hexagon using findEdgeSnap with sufficient threshold
const snappedTri = LabCore.findEdgeSnap(triRight, hex5, 10.0);
assert.notStrictEqual(snappedTri, null, 'Triangle should snap to hexagon edge');
const segs3 = LabCore.getSharedSegments(hex5, snappedTri);
const totalLen3 = segs3.reduce((sum, s) => sum + s.length, 0);
assert.strictEqual(Math.round(totalLen3), 5, 'Hexagon 5 + right triangle on hypotenuse shared segment length should be 5');

// 4. Rectangle 8x3 + rectangle 3x4 L-shape
const rectA = MathCore.createRectangle(8, 3, 0, 0);
const rectB = MathCore.createRectangle(3, 4, 0, 3); // placed on top of rectA sharing 3 cm vertical edge
const segs4 = LabCore.getSharedSegments(rectA, rectB);
const totalLen4 = segs4.reduce((sum, s) => sum + s.length, 0);
assert.strictEqual(Math.round(totalLen4), 3, 'Rectangle 8x3 + Rectangle 3x4 L-shape shared segment length should be 3');

// 5. Two shapes touching at one corner
const sqA = MathCore.createSquare(4, 0, 0);
const sqB = MathCore.createSquare(4, 4, 4); // touches only at (4,4)
const segs5 = LabCore.getSharedSegments(sqA, sqB);
assert.strictEqual(segs5.length, 0, 'Touching at corner should give an empty list');

console.log('ALL SHARED SEGMENTS TESTS PASSED SUCCESSFULLY!');
