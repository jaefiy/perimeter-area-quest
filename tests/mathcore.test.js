const assert = require('assert');
const MathCore = require('../js/mathcore.js');

console.log('Running MathCore tests...');

// --- OLD / EXISTING TEST CASES ---

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

// --- NEW VERIFIED TEST CASES (1 TO 14) ---

// 1. Pentagon (side 4) + hexagon (side 4): shared 4, perimeter 36, area null.
{
  const pentagon = MathCore.regularPolygon(5, 4, 0, 0, { startAngle: 0 });
  const hexagon = MathCore.regularPolygon(6, 4, 4, 0, { startAngle: -Math.PI });
  assert.strictEqual(MathCore.sharedLength(pentagon, hexagon), 4);
  assert.strictEqual(MathCore.compositePerimeter(pentagon, hexagon), 36);
  assert.strictEqual(MathCore.compositeArea(pentagon, hexagon), null);
  assert.strictEqual(MathCore.shapesOverlap(pentagon, hexagon), false);
  console.log('New Case 1 passed: Pentagon (side 4) + hexagon (side 4)');
}

// 2. Square (side 6) + equilateral triangle (side 6): perimeter 30.
{
  const square = MathCore.regularPolygon(4, 6, 0, 0, { startAngle: 0 });
  const tri = MathCore.regularPolygon(3, 6, 0, 6, { startAngle: 0 });
  assert.strictEqual(MathCore.sharedLength(square, tri), 6);
  assert.strictEqual(MathCore.compositePerimeter(square, tri), 30);
  assert.strictEqual(MathCore.shapesOverlap(square, tri), false);
  console.log('New Case 2 passed: Square (side 6) + equilateral triangle (side 6)');
}

// 3. Hexagon (side 5) + equilateral triangle (side 5): perimeter 35.
{
  const hexagon = MathCore.regularPolygon(6, 5, 0, 0, { startAngle: 0 });
  const tri = MathCore.regularPolygon(3, 5, 5, 0, { startAngle: -Math.PI });
  assert.strictEqual(MathCore.sharedLength(hexagon, tri), 5);
  assert.strictEqual(MathCore.compositePerimeter(hexagon, tri), 35);
  assert.strictEqual(MathCore.shapesOverlap(hexagon, tri), false);
  console.log('New Case 3 passed: Hexagon (side 5) + equilateral triangle (side 5)');
}

// 4. Octagon (side 4) + square (side 4): perimeter 40.
{
  const octagon = MathCore.regularPolygon(8, 4, 0, 0, { startAngle: 0 });
  const square = MathCore.regularPolygon(4, 4, 4, 0, { startAngle: -Math.PI });
  assert.strictEqual(MathCore.sharedLength(octagon, square), 4);
  assert.strictEqual(MathCore.compositePerimeter(octagon, square), 40);
  assert.strictEqual(MathCore.shapesOverlap(octagon, square), false);
  console.log('New Case 4 passed: Octagon (side 4) + square (side 4)');
}

// 5. Heptagon (side 2) + hexagon (side 2): perimeter 22.
{
  const heptagon = MathCore.regularPolygon(7, 2, 0, 0, { startAngle: 0 });
  const hexagon = MathCore.regularPolygon(6, 2, 2, 0, { startAngle: -Math.PI });
  assert.strictEqual(MathCore.sharedLength(heptagon, hexagon), 2);
  assert.strictEqual(MathCore.compositePerimeter(heptagon, hexagon), 22);
  assert.strictEqual(MathCore.shapesOverlap(heptagon, hexagon), false);
  console.log('New Case 5 passed: Heptagon (side 2) + hexagon (side 2)');
}

// 6. Pentagon (side 5) + isosceles triangle (base 6, equal sides 5) joined along an equal side of 5: perimeter 31.
{
  const pentagon = MathCore.regularPolygon(5, 5, 0, 0, { startAngle: 0 });
  const tri = {
    type: 'isosceles triangle',
    name: 'isosceles triangle',
    vertices: [
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 3.6, y: -4.8 }
    ],
    edges: [
      { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 }, length: 5 },
      { p1: { x: 0, y: 0 }, p2: { x: 3.6, y: -4.8 }, length: 6 },
      { p1: { x: 3.6, y: -4.8 }, p2: { x: 5, y: 0 }, length: 5 }
    ],
    perimeter: 16,
    area: 12,
    areaAllowed: true
  };
  assert.strictEqual(MathCore.sharedLength(pentagon, tri), 5);
  assert.strictEqual(MathCore.compositePerimeter(pentagon, tri), 31);
  assert.strictEqual(MathCore.shapesOverlap(pentagon, tri), false);
  console.log('New Case 6 passed: Pentagon (side 5) + isosceles triangle joined along equal side 5');
}

// 7. Hexagon (side 5) + right-angled triangle 3-4-5 joined along the 5 cm hypotenuse: perimeter 32.
{
  const hexagon = MathCore.regularPolygon(6, 5, 0, 0, { startAngle: 0 });
  const tri = {
    type: 'right-angled triangle',
    name: 'right-angled triangle',
    vertices: [
      { x: 5, y: 0 },
      { x: 0, y: 0 },
      { x: 1.8, y: -2.4 }
    ],
    edges: [
      { p1: { x: 5, y: 0 }, p2: { x: 0, y: 0 }, length: 5 },
      { p1: { x: 0, y: 0 }, p2: { x: 1.8, y: -2.4 }, length: 3 },
      { p1: { x: 1.8, y: -2.4 }, p2: { x: 5, y: 0 }, length: 4 }
    ],
    perimeter: 12,
    area: 6,
    areaAllowed: true
  };
  assert.strictEqual(MathCore.sharedLength(hexagon, tri), 5);
  assert.strictEqual(MathCore.compositePerimeter(hexagon, tri), 32);
  assert.strictEqual(MathCore.shapesOverlap(hexagon, tri), false);
  console.log('New Case 7 passed: Hexagon (side 5) + right-angled triangle 3-4-5 along 5 cm hypotenuse');
}

// 8. Rectangle 8x5 + hexagon (side 5) joined along a 5 cm side: perimeter 46.
{
  const rect = MathCore.createRectangle(8, 5, 0, 0);
  const hexagon = MathCore.regularPolygon(6, 5, 8, 5, { startAngle: -Math.PI / 2 });
  assert.strictEqual(MathCore.sharedLength(rect, hexagon), 5);
  assert.strictEqual(MathCore.compositePerimeter(rect, hexagon), 46);
  assert.strictEqual(MathCore.compositeArea(rect, hexagon), null);
  assert.strictEqual(MathCore.shapesOverlap(rect, hexagon), false);
  console.log('New Case 8 passed: Rectangle 8x5 + hexagon (side 5)');
}

// 9. Square (side 4) + equilateral triangle (side 4, height 3.5): perimeter 20, area 23.
{
  const sq = MathCore.createSquare(4, 0, 0);
  const tri = MathCore.regularPolygon(3, 4, 4, 4, { startAngle: -Math.PI / 2 });
  assert.strictEqual(MathCore.sharedLength(sq, tri), 4);
  assert.strictEqual(MathCore.compositePerimeter(sq, tri), 20);
  assert.strictEqual(MathCore.compositeArea(sq, tri), 23);
  assert.strictEqual(MathCore.shapesOverlap(sq, tri), false);
  console.log('New Case 9 passed: Square (side 4) + equilateral triangle (side 4, height 3.5)');
}

// 10. Rectangle 8x5 + equilateral triangle (side 8, height 7): perimeter 34, area 68.
{
  const rect = MathCore.createRectangle(8, 5, 0, 0);
  const tri = MathCore.regularPolygon(3, 8, 8, 0, { startAngle: -Math.PI });
  assert.strictEqual(MathCore.sharedLength(rect, tri), 8);
  assert.strictEqual(MathCore.compositePerimeter(rect, tri), 34);
  assert.strictEqual(MathCore.compositeArea(rect, tri), 68);
  assert.strictEqual(MathCore.shapesOverlap(rect, tri), false);
  console.log('New Case 10 passed: Rectangle 8x5 + equilateral triangle (side 8, height 7)');
}

// 11. Square (side 6) + isosceles triangle (base 6, equal sides 5): perimeter 28.
{
  const sq = MathCore.createSquare(6, 0, 0);
  const tri = MathCore.createIsoscelesTriangle(6, 4, 0, 6);
  assert.strictEqual(MathCore.sharedLength(sq, tri), 6);
  assert.strictEqual(MathCore.compositePerimeter(sq, tri), 28);
  assert.strictEqual(MathCore.shapesOverlap(sq, tri), false);
  console.log('New Case 11 passed: Square (side 6) + isosceles triangle (base 6, equal sides 5)');
}

// 12. A sloped edge that matches another sloped edge of the same length counts as shared (case 7 proves this).
{
  const tri1 = {
    type: 'right-angled triangle',
    name: 'right-angled triangle',
    vertices: [
      { x: 0, y: 0 },
      { x: 4, y: 0 },
      { x: 0, y: 3 }
    ],
    edges: [
      { p1: { x: 0, y: 0 }, p2: { x: 4, y: 0 }, length: 4 },
      { p1: { x: 4, y: 0 }, p2: { x: 0, y: 3 }, length: 5 },
      { p1: { x: 0, y: 3 }, p2: { x: 0, y: 0 }, length: 3 }
    ],
    perimeter: 12,
    area: 6,
    areaAllowed: true
  };
  const tri2 = {
    type: 'right-angled triangle',
    name: 'right-angled triangle',
    vertices: [
      { x: 0, y: 3 },
      { x: 4, y: 0 },
      { x: 4, y: 3 }
    ],
    edges: [
      { p1: { x: 0, y: 3 }, p2: { x: 4, y: 0 }, length: 5 },
      { p1: { x: 4, y: 0 }, p2: { x: 4, y: 3 }, length: 3 },
      { p1: { x: 4, y: 3 }, p2: { x: 0, y: 3 }, length: 4 }
    ],
    perimeter: 12,
    area: 6,
    areaAllowed: true
  };
  assert.strictEqual(MathCore.sharedLength(tri1, tri2), 5);
  assert.strictEqual(MathCore.compositePerimeter(tri1, tri2), 14);
  assert.strictEqual(MathCore.shapesOverlap(tri1, tri2), false);
  console.log('New Case 12 passed: Sloped edge matching');
}

// 13. Overlapping convex polygons: shapesOverlap returns true. Polygons touching only at one corner: false and sharedLength 0.
{
  const pentagon1 = MathCore.regularPolygon(5, 4, 0, 0);
  const pentagon2 = MathCore.regularPolygon(5, 4, 1, 1);
  assert.strictEqual(MathCore.shapesOverlap(pentagon1, pentagon2), true);

  const cornerTouchPentagon = MathCore.regularPolygon(5, 4, 10, 10);
  assert.strictEqual(MathCore.shapesOverlap(pentagon1, cornerTouchPentagon), false);
  assert.strictEqual(MathCore.sharedLength(pentagon1, cornerTouchPentagon), 0);
  console.log('New Case 13 passed: Overlapping convex polygons and corner-only touching');
}

// 14. Pentagon: compositeArea returns null.
{
  const pentagon = MathCore.regularPolygon(5, 4, 0, 0);
  const square = MathCore.createSquare(4, 4, 0);
  assert.strictEqual(MathCore.compositeArea(pentagon, square), null);
  console.log('New Case 14 passed: Pentagon compositeArea returns null');
}

console.log('ALL MATHCORE TESTS PASSED SUCCESSFULLY!');
