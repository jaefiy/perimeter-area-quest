/**
 * js/missions.js
 * Mission data and verification logic for Tab 2: Mission Time.
 * KSSR Mathematics Year 5 (Space 6.3.1 and 6.3.2)
 *
 * UMD wrapper supports Node.js (testing) and browser usage.
 * Depends on MathCore for computing target answers.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore.js');
    module.exports = factory(MathCore);
  } else {
    root.Missions = factory(root.MathCore);
  }
}(typeof self !== 'undefined' ? self : this, function (MathCore) {
  'use strict';

  // Mission definitions
  const missionsList = [
    {
      id: 1,
      type: 'perimeter',
      unit: 'cm',
      title: 'Mission 1: Two Squares',
      prompt: 'Join two squares of side 4 cm side by side. What is the perimeter?',
      hint: 'Perimeter counts only the outer sides. Do not count the inside shared line!',
      createShapes: function () {
        const s1 = MathCore.createSquare(4, 0, 0);
        const s2 = MathCore.createSquare(4, 4, 0);
        return { s1, s2 };
      },
      mistakes: {
        32: 'You counted the shared side! It is inside the shape.',
        28: 'You subtracted the shared side once, but remember it was in BOTH shapes!'
      }
    },
    {
      id: 2,
      type: 'perimeter',
      unit: 'cm',
      title: 'Mission 2: Rectangle & Square',
      prompt: 'Join a rectangle 7 cm x 3 cm and a square of side 3 cm along a 3 cm side. What is the perimeter?',
      hint: 'Find the perimeter of both shapes, then subtract 2 × 3 cm for the shared side.',
      createShapes: function () {
        const s1 = MathCore.createRectangle(7, 3, 0, 0);
        const s2 = MathCore.createSquare(3, 7, 0);
        return { s1, s2 };
      },
      mistakes: {
        32: 'You counted the shared side! It is inside the shape.',
        29: 'You only subtracted 3 cm once. Subtract 2 × 3 cm!'
      }
    },
    {
      id: 3,
      type: 'area',
      unit: 'cm²',
      title: 'Mission 3: L-shape Area',
      prompt: 'Join a rectangle 8 cm x 3 cm and a rectangle 3 cm x 4 cm to make an L-shape (the small one on top at the left end). What is the area?',
      hint: 'Area = Area of Rectangle 1 + Area of Rectangle 2.',
      createShapes: function () {
        const s1 = MathCore.createRectangle(8, 3, 0, 0);
        const s2 = MathCore.createRectangle(3, 4, 0, 3);
        return { s1, s2 };
      },
      mistakes: {
        22: 'Check your rectangle areas: (8×3) + (3×4).'
      }
    },
    {
      id: 4,
      type: 'perimeter',
      unit: 'cm',
      title: 'Mission 4: Pentagon & Hexagon',
      prompt: 'Join a regular pentagon and a regular hexagon, both with side 4 cm. What is the perimeter?',
      hint: 'Pentagon has 5 sides of 4 cm, Hexagon has 6 sides of 4 cm. Remove 2 shared sides!',
      createShapes: function () {
        const s1 = MathCore.regularPolygon(5, 4, 0, 0);
        const s2 = MathCore.regularPolygon(6, 4, 4, 0, { startAngle: Math.PI });
        return { s1, s2 };
      },
      mistakes: {
        44: 'You counted the shared side twice!',
        40: 'You counted one shared side. Subtract both inside sides!'
      }
    },
    {
      id: 5,
      type: 'perimeter',
      unit: 'cm',
      title: 'Mission 5: House Shape',
      prompt: 'Join a square of side 6 cm and an equilateral triangle of side 6 cm to make a house. What is the perimeter?',
      hint: 'The house has 3 sides from the square and 2 sides from the triangle.',
      createShapes: function () {
        const s1 = MathCore.createSquare(6, 0, 0);
        const s2 = MathCore.regularPolygon(3, 6, 0, 0);
        return { s1, s2 };
      },
      mistakes: {
        42: 'You counted the roof line inside the house!',
        36: 'Remember to subtract 2 × 6 cm for the shared line!'
      }
    },
    {
      id: 6,
      type: 'area',
      unit: 'cm²',
      title: 'Mission 6: Rectangle & Triangle Area',
      prompt: 'Join a rectangle 8 cm x 5 cm and an equilateral triangle of side 8 cm (height 7 cm). What is the area?',
      hint: 'Area = (8 × 5) + (1/2 × 8 × 7).',
      createShapes: function () {
        const s1 = MathCore.createRectangle(8, 5, 0, 0);
        const s2 = MathCore.regularPolygon(3, 8, 0, 5);
        return { s1, s2 };
      },
      mistakes: {
        96: 'Triangle area is 1/2 × base × height, not base × height!'
      }
    },
    {
      id: 7,
      type: 'perimeter',
      unit: 'cm',
      title: 'Mission 7: Isosceles House',
      prompt: 'Join a rectangle 6 cm x 3 cm and an isosceles triangle (base 6 cm, equal sides 5 cm) on the 6 cm side. What is the perimeter?',
      hint: 'Outer sides: 3 + 6 + 3 + 5 + 5 = 22 cm.',
      createShapes: function () {
        const s1 = MathCore.createRectangle(6, 3, 0, 0);
        const s2 = MathCore.createIsoscelesTriangle(6, 4, 0, 3);
        return { s1, s2 };
      },
      mistakes: {
        34: 'Do not count the 6 cm line inside between rectangle and triangle!',
        28: 'Subtract 2 × 6 cm from the total perimeter of both shapes.'
      }
    },
    {
      id: 8,
      type: 'area',
      unit: 'cm²',
      title: 'Mission 8: Rectangle & Right Triangle',
      prompt: 'Join a rectangle 6 cm x 4 cm and a right-angled triangle (3 cm, 4 cm, 5 cm) on the 4 cm side. What is the area?',
      hint: 'Area = (6 × 4) + (1/2 × 3 × 4).',
      createShapes: function () {
        const s1 = MathCore.createRectangle(6, 4, 0, 0);
        const s2 = MathCore.createRightTriangle(3, 4, 6, 0);
        return { s1, s2 };
      },
      mistakes: {
        36: 'Right triangle area is 1/2 × 3 × 4 = 6 cm².'
      }
    }
  ];

  function getMission(id) {
    const m = missionsList.find(item => item.id === id);
    if (!m) return null;

    const shapes = m.createShapes();
    const computedAnswer = m.type === 'perimeter'
      ? MathCore.compositePerimeter(shapes.s1, shapes.s2)
      : MathCore.compositeArea(shapes.s1, shapes.s2);

    return Object.assign({}, m, {
      computedAnswer: computedAnswer
    });
  }

  function parseInputNumber(inputStr) {
    if (!inputStr) return NaN;
    // Strip spaces, cm, cm², cm2, m, m², m2
    const cleaned = inputStr.toString().trim()
      .replace(/cm²?|cm2|m²?|m2|\s+/gi, '');
    return parseFloat(cleaned);
  }

  /**
   * Check user answer for mission.
   * @param {number} missionId
   * @param {Array} placedShapes - shapes from play area
   * @param {string|number} userInput
   */
  function checkMissionAnswer(missionId, placedShapes, userInput) {
    const mission = getMission(missionId);
    if (!mission) {
      return { success: false, message: 'Invalid mission ID.' };
    }

    // Step 1: Verify student built two shapes and they share an edge
    if (!placedShapes || placedShapes.length < 2) {
      return { success: false, builtError: true, message: 'Build the shape first! Join the two shapes.' };
    }

    const sA = placedShapes[0].shape || placedShapes[0];
    const sB = placedShapes[1].shape || placedShapes[1];
    const shared = MathCore.sharedLength(sA, sB);

    if (shared <= 0) {
      return { success: false, builtError: true, message: 'Build the shape first! Join the two shapes.' };
    }

    // Step 2: Compare typed number with computed answer from MathCore
    const userNum = parseInputNumber(userInput);
    if (isNaN(userNum)) {
      return { success: false, message: 'Please enter a valid number!' };
    }

    const expected = mission.computedAnswer;

    if (Math.abs(userNum - expected) < 1e-4) {
      return { success: true, message: 'Awesome job! That is correct!' };
    }

    // Step 3: Specific wrong-answer feedback / mistake note
    if (mission.mistakes && mission.mistakes[userNum]) {
      return { success: false, message: mission.mistakes[userNum] };
    }

    return { success: false, message: 'Not quite right. Try again or check your working!' };
  }

  function checkAnswer(mission, typedText) {
    if (typedText === null || typedText === undefined || typedText.toString().trim() === '') {
      return { status: 'empty', message: 'Type a number first.' };
    }

    const num = parseInputNumber(typedText);
    if (isNaN(num)) {
      return { status: 'invalid', message: 'Type a number first.' };
    }

    const expected = mission.computedAnswer !== undefined ? mission.computedAnswer : (
      mission.type === 'perimeter'
        ? MathCore.compositePerimeter(mission.createShapes().s1, mission.createShapes().s2)
        : MathCore.compositeArea(mission.createShapes().s1, mission.createShapes().s2)
    );

    if (Math.abs(num - expected) < 1e-4) {
      return { status: 'correct', message: 'Correct!' };
    }

    const mistake = mission.mistakes && mission.mistakes[num];
    if (mistake) {
      return { status: 'wrong', message: mistake, note: mistake };
    }

    return { status: 'wrong', message: 'Not quite! Try again.' };
  }

  return {
    missionsList: missionsList,
    getMission: getMission,
    parseInputNumber: parseInputNumber,
    checkMissionAnswer: checkMissionAnswer,
    checkAnswer: checkAnswer
  };
}));
