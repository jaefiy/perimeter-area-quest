const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const LabCore = require('../js/labcore.js');

console.log('Running LabCore tests...');

// 1. Square 4 + square 4 side by side: perimeter 24, area 32.
{
  const sq1 = MathCore.createSquare(4, 0, 0);
  const sq2 = MathCore.createSquare(4, 4, 0);
  assert.strictEqual(MathCore.compositePerimeter(sq1, sq2), 24);
  assert.strictEqual(MathCore.compositeArea(sq1, sq2), 32);
  console.log('Case 1 passed: Square 4 + square 4 side by side');
}

// 2. Rectangle 7x3 + square 3: perimeter 26, area 30.
{
  const rect = MathCore.createRectangle(7, 3, 0, 0);
  const sq = MathCore.createSquare(3, 7, 0);
  assert.strictEqual(MathCore.compositePerimeter(rect, sq), 26);
  assert.strictEqual(MathCore.compositeArea(rect, sq), 30);
  console.log('Case 2 passed: Rectangle 7x3 + square 3');
}

// 3. Rectangle 8x3 + rectangle 3x4 on top at the left end: perimeter 30, area 36.
{
  const rect1 = MathCore.createRectangle(8, 3, 0, 0);
  const rect2 = MathCore.createRectangle(3, 4, 0, 3);
  assert.strictEqual(MathCore.compositePerimeter(rect1, rect2), 30);
  assert.strictEqual(MathCore.compositeArea(rect1, rect2), 36);
  console.log('Case 3 passed: Rectangle 8x3 + rectangle 3x4 on top at left end');
}

// 4. Rectangle 6x4 + right-angled triangle 3-4-5 on the 4 cm side: perimeter 24, area 30.
{
  const rect = MathCore.createRectangle(6, 4, 0, 0);
  // Triangle legs 3 (along x at x=6, y=0 to 9, y=0) and 4 (along y at x=6, y=0 to 4)
  // Leg 4 matches rect vertical side at x=6, y=0 to 4.
  const tri = MathCore.createRightTriangle(3, 4, 6, 0);
  assert.strictEqual(MathCore.sharedLength(rect, tri), 4);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 24);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 30);
  console.log('Case 4 passed: Rectangle 6x4 + right-angled triangle 3-4-5 on 4 cm side');
}

// 5. Rectangle 6x3 + isosceles triangle (base 6) on the 6 cm side: perimeter 22, area 30.
{
  const rect = MathCore.createRectangle(6, 3, 0, 0);
  const tri = MathCore.createIsoscelesTriangle(6, 4, 0, 3);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 22);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 30);
  console.log('Case 5 passed: Rectangle 6x3 + isosceles triangle (base 6) on 6 cm side');
}

// 6. Square 5 + rectangle 5x3: perimeter 26, area 40.
{
  const sq = MathCore.createSquare(5, 0, 0);
  const rect = MathCore.createRectangle(5, 3, 0, 5);
  assert.strictEqual(MathCore.compositePerimeter(sq, rect), 26);
  assert.strictEqual(MathCore.compositeArea(sq, rect), 40);
  console.log('Case 6 passed: Square 5 + rectangle 5x3');
}

// 7. Pentagon (4) + hexagon (4) joined by findEdgeSnap: shared 4, perimeter 36, area null.
{
  const pentagon = MathCore.regularPolygon(5, 4, 0, 0);
  const hexagon = MathCore.regularPolygon(6, 4, 5, 0);
  const snappedHex = LabCore.findEdgeSnap(hexagon, pentagon, 5.0);
  assert.notStrictEqual(snappedHex, null);
  assert.strictEqual(MathCore.sharedLength(pentagon, snappedHex), 4);
  assert.strictEqual(MathCore.compositePerimeter(pentagon, snappedHex), 36);
  assert.strictEqual(MathCore.compositeArea(pentagon, snappedHex), null);
  console.log('Case 7 passed: Pentagon (4) + hexagon (4) joined by findEdgeSnap');
}

// 8. Hexagon (5) + right-angled triangle 3-4-5 snapped on the hypotenuse: perimeter 32.
{
  const hexagon = MathCore.regularPolygon(6, 5, 0, 0);
  // Right triangle with hypotenuse 5
  const tri = MathCore.createRightTriangle(4, 3, 4, 0);
  const snappedTri = LabCore.findEdgeSnap(tri, hexagon, 5.0);
  assert.notStrictEqual(snappedTri, null);
  assert.strictEqual(MathCore.sharedLength(hexagon, snappedTri), 5);
  assert.strictEqual(MathCore.compositePerimeter(hexagon, snappedTri), 32);
  console.log('Case 8 passed: Hexagon (5) + right-angled triangle 3-4-5 snapped on hypotenuse');
}

// 9. Square (4) + equilateral triangle (4): perimeter 20, area 23.
{
  const sq = MathCore.createSquare(4, 0, 0);
  const tri = MathCore.regularPolygon(3, 4, 0, 4);
  assert.strictEqual(MathCore.compositePerimeter(sq, tri), 20);
  assert.strictEqual(MathCore.compositeArea(sq, tri), 23);
  console.log('Case 9 passed: Square (4) + equilateral triangle (4)');
}

// 10. Rectangle 8x5 + equilateral triangle (8): perimeter 34, area 68.
{
  const rect = MathCore.createRectangle(8, 5, 0, 0);
  const tri = MathCore.regularPolygon(3, 8, 0, 5);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 34);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 68);
  console.log('Case 10 passed: Rectangle 8x5 + equilateral triangle (8)');
}

// 11. Rotating a shape by 90 degrees four times returns the original vertices.
{
  const rect = MathCore.createRectangle(6, 4, 2, 3);
  let rot = rect;
  for (let i = 0; i < 4; i++) {
    rot = LabCore.rotateShape90(rot);
  }
  for (let i = 0; i < rect.vertices.length; i++) {
    assert.strictEqual(Math.abs(rot.vertices[i].x - rect.vertices[i].x) < 1e-4, true);
    assert.strictEqual(Math.abs(rot.vertices[i].y - rect.vertices[i].y) < 1e-4, true);
  }
  console.log('Case 11 passed: Rotating a shape by 90 degrees 4 times returns original vertices');
}

// 12. findEdgeSnap does not return a result that overlaps the other shape.
{
  const sq1 = MathCore.createSquare(4, 0, 0);
  const sq2 = MathCore.createSquare(4, 1, 1); // overlapping position
  const snapped = LabCore.findEdgeSnap(sq2, sq1, 2.0);
  if (snapped !== null) {
    assert.strictEqual(MathCore.shapesOverlap(sq1, snapped), false);
  }
  console.log('Case 12 passed: findEdgeSnap does not return a result that overlaps');
}

// 13. findEdgeSnap ignores edges of different lengths.
{
  const sq3 = MathCore.createSquare(3, 0, 0);
  const sq5 = MathCore.createSquare(5, 3.1, 0);
  const snapped = LabCore.findEdgeSnap(sq5, sq3, 1.0);
  assert.strictEqual(snapped, null);
  console.log('Case 13 passed: findEdgeSnap ignores edges of different lengths');
}

console.log('ALL LABCORE TESTS PASSED SUCCESSFULLY!');
