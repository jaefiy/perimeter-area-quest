const assert = require('assert');
const MathCore = require('../js/mathcore.js');

console.log('Running MathCore tests...');

// 1. Two squares side 4 joined side by side: perimeter 24, area 32.
{
  const sq1 = MathCore.createSquare(4, 0, 0);
  const sq2 = MathCore.createSquare(4, 4, 0);
  assert.strictEqual(MathCore.sharedLength(sq1, sq2), 4);
  assert.strictEqual(MathCore.compositePerimeter(sq1, sq2), 24);
  assert.strictEqual(MathCore.compositeArea(sq1, sq2), 32);
  assert.strictEqual(MathCore.shapesOverlap(sq1, sq2), false);
  console.log('Test 1 passed: Two squares side 4 joined side by side');
}

// 2. Rectangle 7x3 joined to square 3 along a 3 cm side: perimeter 26, area 30.
{
  const rect = MathCore.createRectangle(7, 3, 0, 0);
  const sq = MathCore.createSquare(3, 7, 0); // joined along x=7 vertical side of length 3
  assert.strictEqual(MathCore.sharedLength(rect, sq), 3);
  assert.strictEqual(MathCore.compositePerimeter(rect, sq), 26);
  assert.strictEqual(MathCore.compositeArea(rect, sq), 30);
  assert.strictEqual(MathCore.shapesOverlap(rect, sq), false);
  console.log('Test 2 passed: Rectangle 7x3 joined to square 3');
}

// 3. Rectangle 8x3 with rectangle 3x4 placed on top at the left end (shared length 3): perimeter 30, area 36.
{
  const rect1 = MathCore.createRectangle(8, 3, 0, 0);
  const rect2 = MathCore.createRectangle(3, 4, 0, 3); // on top (y=3), width 3, height 4
  assert.strictEqual(MathCore.sharedLength(rect1, rect2), 3);
  assert.strictEqual(MathCore.compositePerimeter(rect1, rect2), 30);
  assert.strictEqual(MathCore.compositeArea(rect1, rect2), 36);
  assert.strictEqual(MathCore.shapesOverlap(rect1, rect2), false);
  console.log('Test 3 passed: Rectangle 8x3 with rectangle 3x4 placed on top');
}

// 4. Rectangle 10x5 with right-angled triangle 5-12-13 (legs 5 and 12) joined along the 5 cm side: perimeter 50, area 80.
{
  const rect = MathCore.createRectangle(10, 5, 0, 0);
  // Triangle with legA = 12 (along x), legB = 5 (along vertical y at x=10).
  // x=10, y=0. Vertices: (10,0), (10+12,0), (10,5).
  const tri = MathCore.createRightTriangle(12, 5, 10, 0);
  assert.strictEqual(MathCore.sharedLength(rect, tri), 5);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 50);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 80);
  assert.strictEqual(MathCore.shapesOverlap(rect, tri), false);
  console.log('Test 4 passed: Rectangle 10x5 with right-angled triangle 5-12-13');
}

// 5. Rectangle 6x3 with isosceles triangle (base 6, equal sides 5, height 4) on the 6 cm side: perimeter 22, area 30.
{
  const rect = MathCore.createRectangle(6, 3, 0, 0);
  // Isosceles triangle base 6 on top (y=3)
  const tri = MathCore.createIsoscelesTriangle(6, 4, 0, 3);
  assert.strictEqual(MathCore.sharedLength(rect, tri), 6);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 22);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 30);
  assert.strictEqual(MathCore.shapesOverlap(rect, tri), false);
  console.log('Test 5 passed: Rectangle 6x3 with isosceles triangle base 6');
}

// 6. Rectangle 8x5 with rectangle 4x3 on top at the left end (shared length 4): perimeter 32, area 52.
{
  const rect1 = MathCore.createRectangle(8, 5, 0, 0);
  const rect2 = MathCore.createRectangle(4, 3, 0, 5); // on top at y=5, width 4
  assert.strictEqual(MathCore.sharedLength(rect1, rect2), 4);
  assert.strictEqual(MathCore.compositePerimeter(rect1, rect2), 32);
  assert.strictEqual(MathCore.compositeArea(rect1, rect2), 52);
  assert.strictEqual(MathCore.shapesOverlap(rect1, rect2), false);
  console.log('Test 6 passed: Rectangle 8x5 with rectangle 4x3 on top');
}

// 7. Rectangle 8x5 with right-angled triangle legs 5 and 6 joined along the 5 cm side: area 55.
{
  const rect = MathCore.createRectangle(8, 5, 0, 0);
  const tri = MathCore.createRightTriangle(6, 5, 8, 0); // legB = 5 along vertical x=8
  assert.strictEqual(MathCore.sharedLength(rect, tri), 5);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 55);
  assert.strictEqual(MathCore.shapesOverlap(rect, tri), false);
  console.log('Test 7 passed: Rectangle 8x5 with right-angled triangle legs 5 and 6');
}

// 8. Two shapes touching only at a corner: shared length 0, perimeter equals the sum of both perimeters.
{
  const sq1 = MathCore.createSquare(4, 0, 0);
  const sq2 = MathCore.createSquare(4, 4, 4); // touches sq1 only at corner (4,4)
  assert.strictEqual(MathCore.sharedLength(sq1, sq2), 0);
  assert.strictEqual(MathCore.compositePerimeter(sq1, sq2), sq1.perimeter + sq2.perimeter);
  assert.strictEqual(MathCore.shapesOverlap(sq1, sq2), false);
  console.log('Test 8 passed: Two shapes touching only at a corner');
}

// 9. Overlapping shapes: shapesOverlap returns true.
{
  const rect1 = MathCore.createRectangle(6, 4, 0, 0);
  const rect2 = MathCore.createRectangle(6, 4, 2, 2); // overlapping interior
  assert.strictEqual(MathCore.shapesOverlap(rect1, rect2), true);
  console.log('Test 9 passed: Overlapping shapes return true');
}

console.log('ALL MATHCORE TESTS PASSED SUCCESSFULLY!');
