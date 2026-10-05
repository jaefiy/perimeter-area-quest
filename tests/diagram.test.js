const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const QuizQuestions = require('../js/questions.js');
const DiagramCore = require('../js/diagramcore.js');

console.log('Running DiagramCore tests for all 10 quiz questions...');

const expectedShared = { 1: 4, 2: 3, 3: 4, 4: 6, 5: 3, 6: 6, 7: 6, 8: 4, 9: 5, 10: 5 };

QuizQuestions.questions.forEach(q => {
  console.log(`Testing Question Q${q.id}...`);
  const data = q.shapeData;
  assert.ok(data && data.s1 && data.s2, `Q${q.id} must have shapeData with s1 and s2`);

  const layout = DiagramCore.layoutComposite(data.s1, data.s2, data.layoutOpts || {});
  const sA = layout.shapeA;
  const sB = layout.shapeB;

  // (a) shapesOverlap is false for A and B
  const overlaps = MathCore.shapesOverlap(sA, sB);
  assert.strictEqual(overlaps, false, `Q${q.id} shapes must NOT overlap`);

  // (b) the shared length from layout equals expected value
  const expShared = expectedShared[q.id];
  assert.strictEqual(layout.sharedSegment.length, expShared, `Q${q.id} shared length should be ${expShared}`);

  // (c) for perimeter questions compositePerimeter equals stored answer
  if (q.skill === 'perimeter') {
    const calcP = MathCore.compositePerimeter(sA, sB);
    assert.strictEqual(calcP, q.answer, `Q${q.id} calculated perimeter ${calcP} should equal stored answer ${q.answer}`);
  }

  // (d) for area questions compositeArea equals stored answer
  if (q.skill === 'area') {
    const calcA = MathCore.compositeArea(sA, sB);
    assert.strictEqual(calcA, q.answer, `Q${q.id} calculated area ${calcA} should equal stored answer ${q.answer}`);
  }

  // (e) in Q4 and Q8 apex of equilateral triangle is on opposite side of shared edge from square's centre
  if (q.id === 4 || q.id === 8) {
    const centSquare = (sA.vertices.length === 4) ? MathCore.sharedLength : getCentroid(sA.vertices);
    const centB = getCentroid(sB.vertices);
    const seg = layout.sharedSegment;

    // Line eq of shared segment
    const lineVal = (p) => (seg.p2.y - seg.p1.y) * p.x - (seg.p2.x - seg.p1.x) * p.y + seg.p2.x * seg.p1.y - seg.p2.y * seg.p1.x;
    const valA = lineVal(getCentroid(sA.vertices));
    const valB = lineVal(centB);
    assert.ok(valA * valB < 0, `Q${q.id} triangle apex/centroid must be on opposite side of shared edge from square center`);
  }

  // (f) in Q9 the right-angle marker vertex has an interior angle of 90 degrees
  if (q.id === 9) {
    assert.strictEqual(layout.rightAngleMarkers.length, 1, 'Q9 should have 1 right-angle marker');
    const m = layout.rightAngleMarkers[0];
    const dot = m.v1.x * m.v2.x + m.v1.y * m.v2.y;
    assert.ok(Math.abs(dot) < 1e-3, 'Q9 right-angle marker vertex interior angle must be 90 degrees');
  }

  // (g) no two side labels overlap each other and no side label lies inside either polygon, except "h"
  const scale = 30; // arbitrary scale for px bounding box check
  const labelBoxes = layout.sideLabels.map(lbl => {
    const px = (lbl.x + lbl.nx * (14 / scale)) * scale;
    const py = (lbl.y + lbl.ny * (14 / scale)) * scale;
    const textLen = lbl.text.length;
    const w = textLen * 8;
    const h = 16;
    return { minX: px - w / 2, maxX: px + w / 2, minY: py - h / 2, maxY: py + h / 2, text: lbl.text, cx: lbl.x, cy: lbl.y };
  });

  // Check label overlaps
  for (let i = 0; i < labelBoxes.length; i++) {
    for (let j = i + 1; j < labelBoxes.length; j++) {
      const b1 = labelBoxes[i];
      const b2 = labelBoxes[j];
      const overlapX = b1.minX < b2.maxX && b1.maxX > b2.minX;
      const overlapY = b1.minY < b2.maxY && b1.maxY > b2.minY;
      assert.ok(!(overlapX && overlapY), `Q${q.id} side labels "${b1.text}" and "${b2.text}" should not overlap`);
    }
  }

  // Check no side label lies inside polygons
  layout.sideLabels.forEach(lbl => {
    const pt = { x: lbl.x + lbl.nx * 0.4, y: lbl.y + lbl.ny * 0.4 }; // point slightly offset outside
    assert.strictEqual(pointInPolygon(pt, sA.vertices), false, `Q${q.id} side label "${lbl.text}" should not lie inside Shape A`);
    assert.strictEqual(pointInPolygon(pt, sB.vertices), false, `Q${q.id} side label "${lbl.text}" should not lie inside Shape B`);
  });

  // Verify height label lies inside triangle for Q7 and Q8
  if (q.id === 7 || q.id === 8) {
    assert.ok(layout.heightInfo, `Q${q.id} should have heightInfo`);
    const hPos = layout.heightInfo.labelPos;
    const triVerts = (sB.vertices.length === 3) ? sB.vertices : sA.vertices;
    assert.strictEqual(pointInPolygon(hPos, triVerts), true, `Q${q.id} height label "h" must lie inside the triangle`);
  }
});

function getCentroid(vertices) {
  let sumX = 0, sumY = 0;
  vertices.forEach(v => { sumX += v.x; sumY += v.y; });
  return { x: sumX / vertices.length, y: sumY / vertices.length };
}

function pointInPolygon(point, vs) {
  let x = point.x, y = point.y;
  let inside = false;
  for (let i = 0, j = vs.length - 1; i < vs.length; j = i++) {
    let xi = vs[i].x, yi = vs[i].y;
    let xj = vs[j].x, yj = vs[j].y;
    let intersect = ((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    if (intersect) inside = !inside;
  }
  return inside;
}

console.log('ALL DIAGRAMCORE TESTS PASSED SUCCESSFULLY!');
