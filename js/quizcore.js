/**
 * js/quizcore.js
 * Pure logic module for World 2: Mission Quiz.
 * UMD wrapper for Node.js testing and browser execution.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.QuizCore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Parses user input string into a number.
   * Strips units (cm, cm2, cm², m, m2, m²), spaces, etc.
   */
  function parseTypedAnswer(inputStr) {
    if (inputStr === null || inputStr === undefined) return NaN;
    const str = inputStr.toString().trim();
    if (str === '') return NaN;

    const cleaned = str.replace(/cm2|cm²|cm|m2|m²|m|\s+/gi, '');
    if (cleaned === '') return NaN;

    const num = Number(cleaned);
    return isNaN(num) ? NaN : num;
  }

  /**
   * Checks user answer for a question.
   * @param {Object} question - question object from questions.js
   * @param {string|number} userInput - answer given by student
   */
  function checkAnswer(question, userInput) {
    if (userInput === null || userInput === undefined || userInput.toString().trim() === '') {
      return { status: 'empty', message: 'Type a number first.' };
    }

    if (question.type === 'typed') {
      const num = parseTypedAnswer(userInput);
      if (isNaN(num)) {
        return { status: 'empty', message: 'Type a number first.' };
      }

      if (Math.abs(num - question.answer) < 1e-4) {
        return { status: 'correct', message: 'Correct!' };
      }

      const note = question.typedMistakes ? question.typedMistakes[num] : null;
      return {
        status: 'incorrect',
        message: 'Not quite',
        note: note || null
      };

    } else if (question.type === 'mcq') {
      const num = parseTypedAnswer(userInput);
      if (isNaN(num)) {
        return { status: 'empty', message: 'Type a number first.' };
      }

      const selectedOpt = question.options.find(opt => Math.abs(opt.value - num) < 1e-4);

      if (Math.abs(num - question.answer) < 1e-4) {
        return { status: 'correct', message: 'Correct!' };
      }

      return {
        status: 'incorrect',
        message: 'Not quite',
        note: selectedOpt ? selectedOpt.mistake || null : null
      };
    }

    return { status: 'empty', message: 'Type a number first.' };
  }

  /**
   * Calculates score and updated streak after answering a question.
   * - Base points: 10 per correct answer (5 if hint was used).
   * - Streak bonus: +5 from the 3rd consecutive correct answer onwards (3rd, 4th, 5th, etc.).
   * @param {number} currentScore
   * @param {boolean} isCorrect
   * @param {number} currentStreak
   * @param {boolean} usedHint
   */
  function calculateScore(currentScore, isCorrect, currentStreak, usedHint) {
    if (!isCorrect) {
      return {
        score: currentScore,
        streak: 0,
        pointsEarned: 0
      };
    }

    const newStreak = currentStreak + 1;
    let basePoints = usedHint ? 5 : 10;
    let bonus = newStreak >= 3 ? 5 : 0;
    let earned = basePoints + bonus;

    return {
      score: currentScore + earned,
      streak: newStreak,
      pointsEarned: earned
    };
  }

  /**
   * Computes star rating and badge for total correct answers out of 10.
   * 9 or more = 3 stars (Gold Commander)
   * 6 to 8 = 2 stars (Silver Navigator)
   * 3 to 5 = 1 star (Bronze Explorer)
   * below 3 = 0 stars ("Keep practising")
   */
  function getStarRating(correctCount) {
    if (correctCount >= 9) {
      return {
        stars: 3,
        badge: 'Gold Commander',
        title: '🥇 Gold Commander'
      };
    } else if (correctCount >= 6) {
      return {
        stars: 2,
        badge: 'Silver Navigator',
        title: '🥈 Silver Navigator'
      };
    } else if (correctCount >= 3) {
      return {
        stars: 1,
        badge: 'Bronze Explorer',
        title: '🥉 Bronze Explorer'
      };
    } else {
      return {
        stars: 0,
        badge: 'Keep practising',
        title: 'Keep practising'
      };
    }
  }

  return {
    parseTypedAnswer: parseTypedAnswer,
    checkAnswer: checkAnswer,
    calculateScore: calculateScore,
    getStarRating: getStarRating
  };
}));
