const assert = require('assert');
const QuizCore = require('../js/quizcore.js');

console.log('Running QuizCore tests...');

// 1. parseTypedAnswer
assert.strictEqual(QuizCore.parseTypedAnswer('30'), 30);
assert.strictEqual(QuizCore.parseTypedAnswer(' 30 '), 30);
assert.strictEqual(QuizCore.parseTypedAnswer('30 cm'), 30);
assert.strictEqual(QuizCore.parseTypedAnswer('30cm2'), 30);
assert.strictEqual(QuizCore.parseTypedAnswer('30 cm²'), 30);
assert.strictEqual(QuizCore.parseTypedAnswer('23.5'), 23.5);
assert.ok(isNaN(QuizCore.parseTypedAnswer('31 abc')));
assert.ok(isNaN(QuizCore.parseTypedAnswer('abc')));
assert.ok(isNaN(QuizCore.parseTypedAnswer('')));

// 2. checkAnswer typed empty check
const sampleTypedQ = {
  id: 3,
  type: 'typed',
  answer: 36,
  typedMistakes: { 44: 'You counted the joined side twice!' }
};

assert.strictEqual(QuizCore.checkAnswer(sampleTypedQ, '').status, 'empty');
assert.strictEqual(QuizCore.checkAnswer(sampleTypedQ, '   ').status, 'empty');
assert.strictEqual(QuizCore.checkAnswer(sampleTypedQ, 'abc').status, 'empty');

// checkAnswer correct & incorrect
assert.strictEqual(QuizCore.checkAnswer(sampleTypedQ, '36').status, 'correct');
const wrongRes = QuizCore.checkAnswer(sampleTypedQ, '44');
assert.strictEqual(wrongRes.status, 'incorrect');
assert.strictEqual(wrongRes.note, 'You counted the joined side twice!');

const wrong31Res = QuizCore.checkAnswer(sampleTypedQ, '31');
assert.strictEqual(wrong31Res.status, 'incorrect');
assert.strictEqual(wrong31Res.note, null);

// 3. Streak score calculation
// Answers 1 to 5 all correct give 10+10+15+15+15 = 65 points
let score = 0;
let streak = 0;

let res1 = QuizCore.calculateScore(score, true, streak, false);
score = res1.score; streak = res1.streak;
assert.strictEqual(res1.pointsEarned, 10);
assert.strictEqual(score, 10);

let res2 = QuizCore.calculateScore(score, true, streak, false);
score = res2.score; streak = res2.streak;
assert.strictEqual(res2.pointsEarned, 10);
assert.strictEqual(score, 20);

let res3 = QuizCore.calculateScore(score, true, streak, false);
score = res3.score; streak = res3.streak;
assert.strictEqual(res3.pointsEarned, 15);
assert.strictEqual(score, 35);

let res4 = QuizCore.calculateScore(score, true, streak, false);
score = res4.score; streak = res4.streak;
assert.strictEqual(res4.pointsEarned, 15);
assert.strictEqual(score, 50);

let res5 = QuizCore.calculateScore(score, true, streak, false);
score = res5.score; streak = res5.streak;
assert.strictEqual(res5.pointsEarned, 15);
assert.strictEqual(score, 65);

// Hint reduces correct answer to 5 points
let hintRes = QuizCore.calculateScore(0, true, 0, true);
assert.strictEqual(hintRes.pointsEarned, 5);
assert.strictEqual(hintRes.score, 5);

// 4. Star rating boundaries
assert.strictEqual(QuizCore.getStarRating(10).stars, 3);
assert.strictEqual(QuizCore.getStarRating(9).stars, 3);
assert.strictEqual(QuizCore.getStarRating(8).stars, 2);
assert.strictEqual(QuizCore.getStarRating(6).stars, 2);
assert.strictEqual(QuizCore.getStarRating(5).stars, 1);
assert.strictEqual(QuizCore.getStarRating(3).stars, 1);
assert.strictEqual(QuizCore.getStarRating(2).stars, 0);
assert.strictEqual(QuizCore.getStarRating(0).stars, 0);

console.log('ALL QUIZCORE TESTS PASSED SUCCESSFULLY!');
