const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const LabCore = require('../js/labcore.js');

console.log('Running Placement tests for addShapeToPlay...');

const area = { width: 30, height: 25 };

// (a) Adding a square 4 twice gives 2 shapes with different ids and no overlap
let state1 = [];
const sq4 = MathCore.createSquare(4, 0, 0);

state1 = LabCore.addShapeToPlay(state1, sq4, area, 'square 4cm');
assert.strictEqual(Array.isArray(state1), true, 'First add should return an array');
assert.strictEqual(state1.length, 1);
assert.strictEqual(state1[0].id, 1);

const state2 = LabCore.addShapeToPlay(state1, sq4, area, 'square 4cm');
assert.strictEqual(Array.isArray(state2), true, 'Second add should return an array');
assert.strictEqual(state2.length, 2);
assert.notStrictEqual(state2[0].id, state2[1].id, 'Two placed shapes must have different ids');
assert.strictEqual(MathCore.shapesOverlap(state2[0].shape, state2[1].shape), false, 'Two placed squares must not overlap');

// (b) Same for rectangle 6x4 twice, and for equilateral triangle 4 twice
let rectState = [];
const rect6x4 = MathCore.createRectangle(6, 4, 0, 0);
rectState = LabCore.addShapeToPlay(rectState, rect6x4, area, 'rect 6x4');
rectState = LabCore.addShapeToPlay(rectState, rect6x4, area, 'rect 6x4');
assert.strictEqual(rectState.length, 2);
assert.notStrictEqual(rectState[0].id, rectState[1].id, 'Two rectangles must have different ids');
assert.strictEqual(MathCore.shapesOverlap(rectState[0].shape, rectState[1].shape), false, 'Two placed rectangles must not overlap');

let triState = [];
const tri4 = MathCore.regularPolygon(3, 4, 0, 0);
triState = LabCore.addShapeToPlay(triState, tri4, area, 'triangle 4cm');
triState = LabCore.addShapeToPlay(triState, tri4, area, 'triangle 4cm');
assert.strictEqual(triState.length, 2);
assert.notStrictEqual(triState[0].id, triState[1].id, 'Two triangles must have different ids');
assert.strictEqual(MathCore.shapesOverlap(triState[0].shape, triState[1].shape), false, 'Two placed triangles must not overlap');

// (c) A third shape returns "max-two" and does not change the state
const res3 = LabCore.addShapeToPlay(state2, sq4, area, 'square 4cm');
assert.strictEqual(res3.error, 'max-two', 'Adding a 3rd shape returns error max-two');
assert.strictEqual(res3.state, state2, 'State should remain unchanged');
assert.strictEqual(state2.length, 2);

// (d) After moving the second square so it touches the first along a side (distance 0, same y),
// sharedLength is 4, compositePerimeter is 24 and compositeArea is 32
const firstShape = state2[0].shape;
// Move second square so it touches the first along the right side (x: 4 to 8, y: 0 to 4)
const secondShapeTouched = MathCore.createSquare(4, 4, 0);

assert.strictEqual(MathCore.shapesOverlap(firstShape, secondShapeTouched), false, 'Touching shapes do not overlap');
const shared = MathCore.sharedLength(firstShape, secondShapeTouched);
const compP = MathCore.compositePerimeter(firstShape, secondShapeTouched);
const compA = MathCore.compositeArea(firstShape, secondShapeTouched);

assert.strictEqual(shared, 4, 'sharedLength should be 4');
assert.strictEqual(compP, 24, 'compositePerimeter should be 24');
assert.strictEqual(compA, 32, 'compositeArea should be 32');

console.log('ALL PLACEMENT TESTS PASSED SUCCESSFULLY!');
