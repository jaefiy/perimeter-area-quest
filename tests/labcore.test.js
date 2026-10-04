const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const LabCore = require('../js/labcore.js');

console.log('Running LabCore tests...');

// 1. Two squares of side 4 placed side by side: sharedLength 4, perimeter 24, area 32.
{
  const sq1 = MathCore.createSquare(4, 0, 0);
  const sq2 = MathCore.createSquare(4, 4, 0);
  assert.strictEqual(MathCore.sharedLength(sq1, sq2), 4);
  assert.strictEqual(MathCore.compositePerimeter(sq1, sq2), 24);
  assert.strictEqual(MathCore.compositeArea(sq1, sq2), 32);
  console.log('Test 1 passed: Two squares of side 4 placed side by side');
}

// 2. Rectangle 7x3 and square 3 joined along a 3 cm side: perimeter 26, area 30.
{
  const rect = MathCore.createRectangle(7, 3, 0, 0);
  const sq = MathCore.createSquare(3, 7, 0);
  assert.strictEqual(MathCore.sharedLength(rect, sq), 3);
  assert.strictEqual(MathCore.compositePerimeter(rect, sq), 26);
  assert.strictEqual(MathCore.compositeArea(rect, sq), 30);
  console.log('Test 2 passed: Rectangle 7x3 and square 3 joined along a 3 cm side');
}

// 3. Rectangle 8x3 with rectangle 3x4 on top at the left end: perimeter 30, area 36.
{
  const rect1 = MathCore.createRectangle(8, 3, 0, 0);
  const rect2 = MathCore.createRectangle(3, 4, 0, 3);
  assert.strictEqual(MathCore.sharedLength(rect1, rect2), 3);
  assert.strictEqual(MathCore.compositePerimeter(rect1, rect2), 30);
  assert.strictEqual(MathCore.compositeArea(rect1, rect2), 36);
  console.log('Test 3 passed: Rectangle 8x3 with rectangle 3x4 on top at left end');
}

// 4. Rectangle 6x4 and right-angled triangle (legs 3 and 4) joined on the 4 cm side: perimeter 24, area 30.
{
  const rect = MathCore.createRectangle(6, 4, 0, 0);
  // Right triangle legs 3 and 4 (hypotenuse 5). legB=4 along x=6.
  const tri = MathCore.createRightTriangle(3, 4, 6, 0);
  assert.strictEqual(MathCore.sharedLength(rect, tri), 4);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 24);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 30);
  console.log('Test 4 passed: Rectangle 6x4 and right-angled triangle (legs 3, 4) joined on 4 cm side');
}

// 5. Rectangle 6x3 and isosceles triangle (base 6, height 4) on the 6 cm side: perimeter 22, area 30.
{
  const rect = MathCore.createRectangle(6, 3, 0, 0);
  const tri = MathCore.createIsoscelesTriangle(6, 4, 0, 3);
  assert.strictEqual(MathCore.sharedLength(rect, tri), 6);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 22);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 30);
  console.log('Test 5 passed: Rectangle 6x3 and isosceles triangle (base 6, height 4) on 6 cm side');
}

// 6. Square 5 and rectangle 5x3 joined along a 5 cm side: perimeter 26, area 40.
{
  const sq = MathCore.createSquare(5, 0, 0);
  const rect = MathCore.createRectangle(3, 5, 5, 0); // vertical 5 cm side at x=5
  assert.strictEqual(MathCore.sharedLength(sq, rect), 5);
  assert.strictEqual(MathCore.compositePerimeter(sq, rect), 26);
  assert.strictEqual(MathCore.compositeArea(sq, rect), 40);
  console.log('Test 6 passed: Square 5 and rectangle 5x3 joined along a 5 cm side');
}

// 7. Rotating a shape 4 times by 90 degrees returns the original vertices.
{
  const rect = MathCore.createRectangle(5, 3, 2, 4);
  let r = rect;
  for (let i = 0; i < 4; i++) {
    r = LabCore.rotateShape90(r);
  }
  assert.deepStrictEqual(r.vertices, rect.vertices);
  console.log('Test 7 passed: Rotating a shape 4 times by 90 degrees returns original vertices');
}

// 8. A shape dragged to overlap another is detected as overlapping.
{
  const rect1 = MathCore.createRectangle(6, 4, 0, 0);
  const rect2 = MathCore.createRectangle(6, 4, 2, 2);
  assert.strictEqual(MathCore.shapesOverlap(rect1, rect2), true);
  console.log('Test 8 passed: Overlapping shapes detected correctly');
}

// 9. findSnapOffset moves a shape that is 0.4 cm away from an edge so it touches flush.
{
  const sq1 = MathCore.createSquare(4, 0, 0);
  // sq2 is at x=4.4, y=0 (0.4 cm away from right edge of sq1 at x=4)
  const sq2 = MathCore.createSquare(4, 4.4, 0);
  const offset = LabCore.findSnapOffset(sq2, sq1, 0.5);
  assert.strictEqual(offset.dx, -0.4);
  assert.strictEqual(offset.dy, 0);

  const snappedSq2 = LabCore.translateShape(sq2, offset.dx, offset.dy);
  assert.strictEqual(MathCore.sharedLength(sq1, snappedSq2), 4);
  assert.strictEqual(MathCore.shapesOverlap(sq1, snappedSq2), false);
  console.log('Test 9 passed: findSnapOffset moves shape 0.4 cm away so it touches flush');
}

console.log('ALL LABCORE TESTS PASSED SUCCESSFULLY!');
