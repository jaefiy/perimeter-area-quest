/**
 * tests/reallife.test.js
 * Test suite for World 3: Real-Life Builder (reallifecore.js).
 */

const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const RealLifeCore = require('../js/reallifecore.js');

console.log('Running World 3 RealLifeCore tests...');

// === 1. SCENARIO 1: Verified Example ===
const rect8x5 = RealLifeCore.SCENARIO_DATA[1].tiles.find(t => t.id === 'rect8x5');
const sq5 = RealLifeCore.SCENARIO_DATA[1].tiles.find(t => t.id === 'sq5');

const joinEx = RealLifeCore.validateAndJoinGardenShapes(rect8x5, sq5, 'right', 'left', 'start');

assert.strictEqual(joinEx.validJoin, true, 'Example join should be valid');
assert.strictEqual(joinEx.perimeter, 36, 'Example perimeter should be 36 m');
assert.strictEqual(joinEx.area, 65, 'Example area should be 65 m2');
assert.strictEqual(joinEx.fenceCost, 360, 'Example fence cost should be RM 360');
assert.strictEqual(joinEx.grassCost, 325, 'Example grass cost should be RM 325');
assert.strictEqual(joinEx.totalCost, 685, 'Example total cost should be RM 685');
assert.strictEqual(joinEx.budgetLeft, 15, 'Example budget left should be RM 15');

const checkEx = RealLifeCore.checkGardenDesign(joinEx.area, joinEx.totalCost);
assert.strictEqual(checkEx.isValid, true, 'Example design should be accepted');

console.log('✔ Scenario 1 verified example passed');

// === 2. SCENARIO 1: Rejection Cases ===
// Case A: Rectangle 6x4 + Square 4 (Area 40)
const rect6x4 = RealLifeCore.SCENARIO_DATA[1].tiles.find(t => t.id === 'rect6x4');
const sq4 = RealLifeCore.SCENARIO_DATA[1].tiles.find(t => t.id === 'sq4');
const joinSmall = RealLifeCore.validateAndJoinGardenShapes(rect6x4, sq4, 'right', 'left', 'start');
const checkSmall = RealLifeCore.checkGardenDesign(joinSmall.area, joinSmall.totalCost);

assert.strictEqual(checkSmall.isValid, false, 'Design area < 60 should be rejected');
assert.strictEqual(checkSmall.message, 'Too small: 40 m2, need at least 60 m2.', 'Reject message for small area');

// Case B: Rectangle 10x5 + Rectangle 10x5 (Area 100, Perimeter 40, Total Cost 900, Over by 200)
const rect10x5 = RealLifeCore.SCENARIO_DATA[1].tiles.find(t => t.id === 'rect10x5');
const joinOver = RealLifeCore.validateAndJoinGardenShapes(rect10x5, rect10x5, 'top', 'bottom', 'start');
const checkOver = RealLifeCore.checkGardenDesign(joinOver.area, joinOver.totalCost);

assert.strictEqual(checkOver.isValid, false, 'Design over budget should be rejected');
assert.strictEqual(checkOver.message, 'Over budget by RM 200.', 'Reject message for over budget');

console.log('✔ Scenario 1 rejection cases passed');

// === 3. SCENARIO 2: Classroom Floor Answers ===
const s2Step1 = RealLifeCore.checkStepAnswer(2, 1, '48');
assert.strictEqual(s2Step1.status, 'correct');

const s2Step2 = RealLifeCore.checkStepAnswer(2, 2, ' 12 m2 ');
assert.strictEqual(s2Step2.status, 'correct');

const s2Step3 = RealLifeCore.checkStepAnswer(2, 3, '60');
assert.strictEqual(s2Step3.status, 'correct');

const s2Step4 = RealLifeCore.checkStepAnswer(2, 4, '34 m');
assert.strictEqual(s2Step4.status, 'correct');

// Check targeted mistake note for 42 in Step 4
const s2Step4Mistake42 = RealLifeCore.checkStepAnswer(2, 4, '42');
assert.strictEqual(s2Step4Mistake42.status, 'wrong');
assert.strictEqual(s2Step4Mistake42.note, 'You counted the shared 4 m side twice!');

// Check targeted mistake note for 60 in Step 4
const s2Step4Mistake60 = RealLifeCore.checkStepAnswer(2, 4, '60');
assert.strictEqual(s2Step4Mistake60.status, 'wrong');
assert.strictEqual(s2Step4Mistake60.note, 'That is the area. Perimeter is the distance around the outside.');

const s2Step5 = RealLifeCore.checkStepAnswer(2, 5, 'RM 720');
assert.strictEqual(s2Step5.status, 'correct');

const s2Step6 = RealLifeCore.checkStepAnswer(2, 6, 'RM 136');
assert.strictEqual(s2Step6.status, 'correct');

const s2Step7 = RealLifeCore.checkStepAnswer(2, 7, '856');
assert.strictEqual(s2Step7.status, 'correct');

const s2Step8 = RealLifeCore.checkStepAnswer(2, 8, 'Yes, RM 44 left');
assert.strictEqual(s2Step8.status, 'correct');

console.log('✔ Scenario 2 step answers and mistake notes passed');

// === 4. SCENARIO 3: Playground Mat Answers ===
const s3Step1 = RealLifeCore.checkStepAnswer(3, 1, '60');
assert.strictEqual(s3Step1.status, 'correct');

const s3Step2 = RealLifeCore.checkStepAnswer(3, 2, '24 m2');
assert.strictEqual(s3Step2.status, 'correct');

// Check mistake note for 48 in Step 2
const s3Step2Mistake = RealLifeCore.checkStepAnswer(3, 2, '48');
assert.strictEqual(s3Step2Mistake.status, 'wrong');
assert.strictEqual(s3Step2Mistake.note, "Don't forget to multiply by 1/2 for triangle area!");

const s3Step3 = RealLifeCore.checkStepAnswer(3, 3, '84');
assert.strictEqual(s3Step3.status, 'correct');

const s3Step4 = RealLifeCore.checkStepAnswer(3, 4, '44');
assert.strictEqual(s3Step4.status, 'correct');

// Check mistake notes for 50 in Step 4
const s3Step4Mistake50 = RealLifeCore.checkStepAnswer(3, 4, '50');
assert.strictEqual(s3Step4Mistake50.status, 'wrong');
assert.strictEqual(s3Step4Mistake50.note, 'You counted the 6 m shared side. It is inside the shape!');

const s3Step5 = RealLifeCore.checkStepAnswer(3, 5, '1680');
assert.strictEqual(s3Step5.status, 'correct');

const s3Step6 = RealLifeCore.checkStepAnswer(3, 6, '220');
assert.strictEqual(s3Step6.status, 'correct');

const s3Step7 = RealLifeCore.checkStepAnswer(3, 7, '1900');
assert.strictEqual(s3Step7.status, 'correct');

const s3Step8 = RealLifeCore.checkStepAnswer(3, 8, 'Yes, RM 100 left');
assert.strictEqual(s3Step8.status, 'correct');

console.log('✔ Scenario 3 step answers and mistake notes passed');

// === 5. Input Cleaning & Empty Inputs ===
assert.strictEqual(RealLifeCore.parseInput(' RM  685 m2 '), 685);
assert.strictEqual(RealLifeCore.parseInput('34m'), 34);
assert.strictEqual(RealLifeCore.parseInput(''), null);
assert.strictEqual(RealLifeCore.parseInput('abc'), null);

const emptyCheck = RealLifeCore.checkStepAnswer(2, 1, '');
assert.strictEqual(emptyCheck.status, 'empty');
assert.strictEqual(emptyCheck.isWrongAttempt, false, 'Empty input should not count as wrong attempt');

const nonNumCheck = RealLifeCore.checkStepAnswer(2, 1, 'abc');
assert.strictEqual(nonNumCheck.status, 'empty');
assert.strictEqual(nonNumCheck.isWrongAttempt, false, 'Non-numeric input should not count as wrong attempt');

console.log('✔ Input parsing and empty input checks passed');

// === 6. Star Rating Boundaries ===
// Scenario 1:
assert.strictEqual(RealLifeCore.calculateStars(1, { isValid: true, attemptCount: 1, isExample: false }), 3);
assert.strictEqual(RealLifeCore.calculateStars(1, { isValid: true, attemptCount: 1, isExample: true }), 2);
assert.strictEqual(RealLifeCore.calculateStars(1, { isValid: true, attemptCount: 2, isExample: false }), 1);
assert.strictEqual(RealLifeCore.calculateStars(1, { isValid: false }), 0);

// Scenario 2 & 3:
assert.strictEqual(RealLifeCore.calculateStars(2, { wrongAttempts: 0 }), 3);
assert.strictEqual(RealLifeCore.calculateStars(2, { wrongAttempts: 2 }), 3);
assert.strictEqual(RealLifeCore.calculateStars(2, { wrongAttempts: 3 }), 2);
assert.strictEqual(RealLifeCore.calculateStars(2, { wrongAttempts: 5 }), 2);
assert.strictEqual(RealLifeCore.calculateStars(2, { wrongAttempts: 6 }), 1);
assert.strictEqual(RealLifeCore.calculateStars(2, { wrongAttempts: 10 }), 1);

console.log('✔ Star rating boundary checks passed');

console.log('ALL WORLD 3 REALLIFECORE TESTS PASSED SUCCESSFULLY!');
