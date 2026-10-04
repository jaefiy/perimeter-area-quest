const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const QuizQuestions = require('../js/questions.js');

console.log('Running Questions verification tests...');

const questions = QuizQuestions.questions;
assert.strictEqual(questions.length, 10, 'Must have exactly 10 questions');

const expectedAnswers = [24, 26, 36, 30, 30, 22, 30, 23, 55, 30];

questions.forEach((q, idx) => {
  assert.strictEqual(q.answer, expectedAnswers[idx], `Question ${q.id} answer should match expected answer ${expectedAnswers[idx]}`);

  // Compute answer with mathcore or formulas from shape data
  if (q.id === 1) {
    // Two squares side 4 cm
    const p1 = MathCore.createSquare(4).perimeter;
    const p2 = MathCore.createSquare(4).perimeter;
    const computed = p1 + p2 - 2 * 4;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 2) {
    // Rectangle 7x3 + Square 3
    const p1 = MathCore.createRectangle(7, 3).perimeter;
    const p2 = MathCore.createSquare(3).perimeter;
    const computed = p1 + p2 - 2 * 3;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 3) {
    // Regular pentagon 4cm + regular hexagon 4cm
    const p1 = MathCore.regularPolygon(5, 4).perimeter;
    const p2 = MathCore.regularPolygon(6, 4).perimeter;
    const computed = p1 + p2 - 2 * 4;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 4) {
    // Square 6cm + Equilateral triangle 6cm
    const p1 = MathCore.createSquare(6).perimeter;
    const p2 = MathCore.regularPolygon(3, 6).perimeter;
    const computed = p1 + p2 - 2 * 6;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 5) {
    // Regular octagon 3cm + square 3cm
    const p1 = MathCore.regularPolygon(8, 3).perimeter;
    const p2 = MathCore.createSquare(3).perimeter;
    const computed = p1 + p2 - 2 * 3;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 6) {
    // Rectangle 6x3 + Isosceles triangle (base 6, equal sides 5)
    const p1 = MathCore.createRectangle(6, 3).perimeter;
    const p2 = MathCore.createIsoscelesTriangle(6, 4).perimeter;
    const computed = p1 + p2 - 2 * 6;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 7) {
    // Area: Rectangle 6x3 + Isosceles triangle (base 6, height 4)
    const a1 = MathCore.createRectangle(6, 3).area;
    const a2 = MathCore.createIsoscelesTriangle(6, 4).area;
    const computed = a1 + a2;
    assert.strictEqual(computed, q.answer);
  } else if (q.id === 8) {
    // Area: Square 4 + Equilateral triangle (base 4, height 3.5)
    const a1 = MathCore.createSquare(4).area;
    const a2 = 0.5 * 4 * 3.5;
    assert.strictEqual(a1 + a2, q.answer);
  } else if (q.id === 9) {
    // Area: Rectangle 8x5 + Right triangle (base 6, height 5)
    const a1 = MathCore.createRectangle(8, 5).area;
    const a2 = MathCore.createRightTriangle(6, 5).area;
    assert.strictEqual(a1 + a2, q.answer);
  } else if (q.id === 10) {
    // Two squares 5cm
    const p1 = MathCore.createSquare(5).perimeter;
    const p2 = MathCore.createSquare(5).perimeter;
    const computed = p1 + p2 - 2 * 5;
    assert.strictEqual(computed, q.answer);
  }

  // Verify MCQ rules: exactly one correct option, no duplicate values, correct option equals stored answer
  if (q.type === 'mcq') {
    assert.strictEqual(q.options.length, 4, `Question ${q.id} must have 4 options`);
    const values = q.options.map(o => o.value);
    const uniqueValues = new Set(values);
    assert.strictEqual(uniqueValues.size, 4, `Question ${q.id} options must be unique values`);

    const correctOpts = q.options.filter(o => o.value === q.answer);
    assert.strictEqual(correctOpts.length, 1, `Question ${q.id} must have exactly 1 correct option`);
    assert.strictEqual(correctOpts[0].value, q.answer);
    assert.strictEqual(correctOpts[0].mistake, null, `Correct option in Q${q.id} should have null mistake note`);
  }
});

console.log('ALL QUESTIONS TESTS PASSED SUCCESSFULLY!');
