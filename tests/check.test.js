const assert = require('assert');
const MathCore = require('../js/mathcore.js');
const Missions = require('../js/missions.js');

console.log('Running Check Answer tests...');

const m1 = Missions.getMission(1);

// Test 1: "" returns "empty"
const resEmpty = Missions.checkAnswer(m1, '');
assert.strictEqual(resEmpty.status, 'empty');
assert.strictEqual(resEmpty.message, 'Type a number first.');

// Test 2: "abc" returns "invalid"
const resInvalid = Missions.checkAnswer(m1, 'abc');
assert.strictEqual(resInvalid.status, 'invalid');
assert.strictEqual(resInvalid.message, 'Type a number first.');

// Test 3: "24" returns "correct"
const res24 = Missions.checkAnswer(m1, '24');
assert.strictEqual(res24.status, 'correct');

// Test 4: "24 cm" returns "correct"
const res24cm = Missions.checkAnswer(m1, '24 cm');
assert.strictEqual(res24cm.status, 'correct');

// Test 5: "32" returns "wrong" with mistake note
const res32 = Missions.checkAnswer(m1, '32');
assert.strictEqual(res32.status, 'wrong');
assert.strictEqual(typeof res32.message, 'string');
assert.ok(res32.message.includes('counted the shared side'), 'Should contain mistake note about shared side');

console.log('ALL CHECK ANSWER TESTS PASSED SUCCESSFULLY!');
