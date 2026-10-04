/**
 * js/reallifecore.js
 * Pure logic module for World 3: Real-Life Builder.
 * Aligned with KSSR Year 5 Mathematics.
 * UMD wrapper supports Node.js testing and browser usage.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore');
    module.exports = factory(MathCore);
  } else {
    root.RealLifeCore = factory(root.MathCore);
  }
}(typeof self !== 'undefined' ? self : this, function (MathCore) {
  'use strict';

  /**
   * Parses typed answer from student.
   * Removes 'RM', 'm2', 'm²', 'm', spaces, and commas.
   * Returns numeric value or null if non-numeric/empty.
   */
  function parseInput(rawInput) {
    if (rawInput === null || rawInput === undefined) return null;
    let str = String(rawInput).trim();
    if (str === '') return null;

    // Strip "RM", "m2", "m²", "m", commas, spaces (case-insensitive)
    str = str.replace(/RM|rm|m2|m²|m/gi, '').replace(/[\s,]+/g, '');
    if (str === '') return null;

    const num = Number(str);
    return isNaN(num) ? null : num;
  }

  // --- Scenario Definitions ---

  const SCENARIO_DATA = {
    1: {
      id: 1,
      title: 'Design a School Garden',
      client: 'Cikgu Aina',
      prompt: 'Cikgu Aina wants a garden. Fence (RM 10 per metre) and grass (RM 5 per square metre). Budget: RM 700. The garden must be at least 60 m2.',
      budget: 700,
      minArea: 60,
      fenceRate: 10,
      grassRate: 5,
      tiles: [
        { id: 'sq4', name: 'Square 4 m', type: 'square', side: 4, width: 4, height: 4 },
        { id: 'sq5', name: 'Square 5 m', type: 'square', side: 5, width: 5, height: 5 },
        { id: 'sq6', name: 'Square 6 m', type: 'square', side: 6, width: 6, height: 6 },
        { id: 'rect6x4', name: 'Rectangle 6×4 m', type: 'rectangle', width: 6, height: 4 },
        { id: 'rect8x5', name: 'Rectangle 8×5 m', type: 'rectangle', width: 8, height: 5 },
        { id: 'rect10x5', name: 'Rectangle 10×5 m', type: 'rectangle', width: 10, height: 5 },
        { id: 'rect5x3', name: 'Rectangle 5×3 m', type: 'rectangle', width: 5, height: 3 }
      ]
    },
    2: {
      id: 2,
      title: 'Classroom Floor',
      client: 'Cikgu Lee',
      prompt: 'Tile the floor (RM 12 per m2) and add skirting along the walls (RM 4 per metre). Budget: RM 900.',
      budget: 900,
      tileRate: 12,
      skirtingRate: 4,
      steps: [
        {
          index: 1,
          question: 'Find the area of Rectangle A (8 m × 6 m).',
          expected: 48,
          unit: 'm²',
          working: 'Area A = 8 m × 6 m = 48 m²'
        },
        {
          index: 2,
          question: 'Find the area of Rectangle B (4 m × 3 m).',
          expected: 12,
          unit: 'm²',
          working: 'Area B = 4 m × 3 m = 12 m²'
        },
        {
          index: 3,
          question: 'Find the total area of the classroom floor.',
          expected: 60,
          unit: 'm²',
          working: 'Total Area = 48 m² + 12 m² = 60 m²'
        },
        {
          index: 4,
          question: 'Find the perimeter of the outer walls.',
          expected: 34,
          unit: 'm',
          working: 'Perimeter = 8 + 9 + 8 + 9 = 34 m (or 28 + 14 - 2 × 4 = 34 m)',
          mistakes: {
            42: 'You counted the shared 4 m side twice!',
            60: 'That is the area. Perimeter is the distance around the outside.'
          }
        },
        {
          index: 5,
          question: 'Calculate the tile cost (RM 12 per m²).',
          expected: 720,
          unit: 'RM',
          working: 'Tile cost = 60 m² × RM 12 = RM 720'
        },
        {
          index: 6,
          question: 'Calculate the skirting cost (RM 4 per metre).',
          expected: 136,
          unit: 'RM',
          working: 'Skirting cost = 34 m × RM 4 = RM 136'
        },
        {
          index: 7,
          question: 'Calculate the total cost.',
          expected: 856,
          unit: 'RM',
          working: 'Total cost = RM 720 + RM 136 = RM 856'
        },
        {
          index: 8,
          type: 'mcq',
          question: 'Is this within budget (RM 900)?',
          expected: 'Yes, RM 44 left',
          options: [
            { text: 'Yes, RM 44 left', isCorrect: true },
            { text: 'Yes, RM 56 left', isCorrect: false },
            { text: 'No, over by RM 44', isCorrect: false },
            { text: 'No, over by RM 56', isCorrect: false }
          ]
        }
      ]
    },
    3: {
      id: 3,
      title: 'Playground Mat',
      client: 'Encik Rahman',
      prompt: 'Cover the playground with a rubber mat (RM 20 per m2) and put a rope fence around it (RM 5 per metre). Budget: RM 2000.',
      budget: 2000,
      matRate: 20,
      fenceRate: 5,
      steps: [
        {
          index: 1,
          question: 'Find the area of the rectangle (10 m × 6 m).',
          expected: 60,
          unit: 'm²',
          working: 'Area Rectangle = 10 m × 6 m = 60 m²'
        },
        {
          index: 2,
          question: 'Find the area of the triangle (½ × 8 m × 6 m).',
          expected: 24,
          unit: 'm²',
          working: 'Area Triangle = ½ × 8 m × 6 m = 24 m²',
          mistakes: {
            48: "Don't forget to multiply by 1/2 for triangle area!"
          }
        },
        {
          index: 3,
          question: 'Find the total area of the playground.',
          expected: 84,
          unit: 'm²',
          working: 'Total Area = 60 m² + 24 m² = 84 m²'
        },
        {
          index: 4,
          question: 'Find the outer perimeter.',
          expected: 44,
          unit: 'm',
          working: 'Perimeter = 10 + 6 + 10 + 8 + 10 = 44 m',
          mistakes: {
            60: 'That is the area of the rectangle. Perimeter is the distance around the outside.',
            50: 'You counted the 6 m shared side. It is inside the shape!'
          }
        },
        {
          index: 5,
          question: 'Calculate the mat cost (RM 20 per m²).',
          expected: 1680,
          unit: 'RM',
          working: 'Mat cost = 84 m² × RM 20 = RM 1680'
        },
        {
          index: 6,
          question: 'Calculate the fence cost (RM 5 per metre).',
          expected: 220,
          unit: 'RM',
          working: 'Fence cost = 44 m × RM 5 = RM 220'
        },
        {
          index: 7,
          question: 'Calculate the total cost.',
          expected: 1900,
          unit: 'RM',
          working: 'Total cost = RM 1680 + RM 220 = RM 1900'
        },
        {
          index: 8,
          type: 'mcq',
          question: 'Is this within budget (RM 2000)?',
          expected: 'Yes, RM 100 left',
          options: [
            { text: 'Yes, RM 100 left', isCorrect: true },
            { text: 'Yes, RM 200 left', isCorrect: false },
            { text: 'No, over by RM 100', isCorrect: false },
            { text: 'No, over by RM 200', isCorrect: false }
          ]
        }
      ]
    }
  };

  /**
   * Helper to construct a MathCore shape object from a shape specification.
   */
  function createGardenShape(shapeSpec, x = 0, y = 0) {
    const w = shapeSpec.width || shapeSpec.side;
    const h = shapeSpec.height || shapeSpec.side;
    if (shapeSpec.type === 'square') {
      return MathCore.createSquare(w, x, y);
    }
    return MathCore.createRectangle(w, h, x, y);
  }

  /**
   * Helper to get edge side length for rectangle/square:
   * top/bottom length = width; left/right length = height.
   */
  function getSideLength(shapeSpec, sideName) {
    const w = shapeSpec.width || shapeSpec.side;
    const h = shapeSpec.height || shapeSpec.side;
    if (sideName === 'top' || sideName === 'bottom') return w;
    if (sideName === 'left' || sideName === 'right') return h;
    return w;
  }

  /**
   * Calculates placement of Shape 2 relative to Shape 1 and validates join.
   */
  function validateAndJoinGardenShapes(shape1Spec, shape2Spec, side1, side2, alignment) {
    if (!shape1Spec || !shape2Spec) {
      return { validJoin: false, reason: 'Select two shapes first.' };
    }

    const w1 = shape1Spec.width || shape1Spec.side;
    const h1 = shape1Spec.height || shape1Spec.side;
    const w2 = shape2Spec.width || shape2Spec.side;
    const h2 = shape2Spec.height || shape2Spec.side;

    const s1Length = getSideLength(shape1Spec, side1);
    const s2Length = getSideLength(shape2Spec, side2);

    let x2 = 0, y2 = 0;

    // Position Shape 2 based on chosen attachment sides
    if (side1 === 'right' && side2 === 'left') {
      x2 = w1;
      y2 = alignment === 'end' ? (h1 - h2) : 0;
    } else if (side1 === 'left' && side2 === 'right') {
      x2 = -w2;
      y2 = alignment === 'end' ? (h1 - h2) : 0;
    } else if (side1 === 'top' && side2 === 'bottom') {
      y2 = h1;
      x2 = alignment === 'end' ? (w1 - w2) : 0;
    } else if (side1 === 'bottom' && side2 === 'top') {
      y2 = -h2;
      x2 = alignment === 'end' ? (w1 - w2) : 0;
    } else {
      return { validJoin: false, reason: 'Selected sides must face each other (e.g., Right & Left, or Top & Bottom).' };
    }

    const shape1 = createGardenShape(shape1Spec, 0, 0);
    const shape2 = createGardenShape(shape2Spec, x2, y2);

    const overlap = MathCore.shapesOverlap(shape1, shape2);
    if (overlap) {
      return { validJoin: false, reason: 'Shapes overlap!' };
    }

    const sLen = MathCore.sharedLength(shape1, shape2);
    if (sLen <= 1e-4) {
      return { validJoin: false, reason: 'Shapes do not touch along a side.' };
    }

    const minSide = Math.min(s1Length, s2Length);
    if (Math.abs(sLen - minSide) > 1e-3) {
      return { validJoin: false, reason: 'Join must align a full side flush at one end.' };
    }

    const perimeter = MathCore.compositePerimeter(shape1, shape2);
    const area = MathCore.compositeArea(shape1, shape2);
    const fenceCost = perimeter * 10;
    const grassCost = area * 5;
    const totalCost = fenceCost + grassCost;
    const budgetLeft = 700 - totalCost;

    return {
      validJoin: true,
      shape1,
      shape2,
      shape1Spec,
      shape2Spec,
      x2,
      y2,
      sharedLength: sLen,
      perimeter,
      area,
      fenceCost,
      grassCost,
      totalCost,
      budgetLeft
    };
  }

  /**
   * Checks if a garden design meets requirements: area >= 60 m2 AND total cost <= 700.
   */
  function checkGardenDesign(area, totalCost) {
    const tooSmall = area < 60;
    const overBudget = totalCost > 700;

    if (tooSmall && overBudget) {
      const overBy = totalCost - 700;
      return {
        isValid: false,
        message: 'Too small: ' + area + ' m2, need at least 60 m2. Over budget by RM ' + overBy + '.'
      };
    }
    if (tooSmall) {
      return {
        isValid: false,
        message: 'Too small: ' + area + ' m2, need at least 60 m2.'
      };
    }
    if (overBudget) {
      const overBy = totalCost - 700;
      return {
        isValid: false,
        message: 'Over budget by RM ' + overBy + '.'
      };
    }

    return {
      isValid: true,
      message: 'Awesome design! Within budget with RM ' + (700 - totalCost) + ' left.'
    };
  }

  /**
   * Checks if chosen design matches the verified example:
   * Rectangle 8×5 + Square 5×5 (or side 5) joined along 5 m side.
   */
  function isExampleDesign(shape1Spec, shape2Spec, joinResult) {
    if (!shape1Spec || !shape2Spec || !joinResult || !joinResult.validJoin) return false;

    const ids = [shape1Spec.id, shape2Spec.id].sort();
    const isExactExampleIds = (ids[0] === 'rect8x5' && ids[1] === 'sq5');

    // Also verify by perimeter and area (36 m, 65 m2)
    const matchesMetrics = (joinResult.perimeter === 36 && joinResult.area === 65);

    return isExactExampleIds || matchesMetrics;
  }

  /**
   * Checks a step answer for Scenario 2 or Scenario 3.
   */
  function checkStepAnswer(scenarioId, stepIndex, rawInput) {
    const scen = SCENARIO_DATA[scenarioId];
    if (!scen) return { status: 'empty', message: 'Invalid scenario.', isWrongAttempt: false };

    const step = scen.steps.find(s => s.index === stepIndex);
    if (!step) return { status: 'empty', message: 'Invalid step.', isWrongAttempt: false };

    if (step.type === 'mcq') {
      if (rawInput === null || rawInput === undefined || String(rawInput).trim() === '') {
        return { status: 'empty', message: 'Select an option first.', isWrongAttempt: false };
      }

      const inputStr = String(rawInput).trim();
      const isCorrect = (inputStr === step.expected || inputStr === '0' || inputStr === step.options[0].text);

      if (isCorrect) {
        return { status: 'correct', message: 'Correct!', isWrongAttempt: false };
      } else {
        return { status: 'wrong', message: 'Not quite! Check the calculation again.', isWrongAttempt: true };
      }
    } else {
      const num = parseInput(rawInput);
      if (num === null) {
        return { status: 'empty', message: 'Type a number first.', isWrongAttempt: false };
      }

      if (Math.abs(num - step.expected) < 1e-4) {
        return { status: 'correct', message: 'Correct!', isWrongAttempt: false };
      }

      const note = step.mistakes ? step.mistakes[num] : null;
      return {
        status: 'wrong',
        message: note || 'Not quite! Try again.',
        note: note || null,
        isWrongAttempt: true
      };
    }
  }

  /**
   * Star rating calculation.
   */
  function calculateStars(scenarioId, data) {
    if (scenarioId === 1) {
      if (!data || !data.isValid) return 0;
      if (data.attemptCount === 1) {
        return data.isExample ? 2 : 3;
      }
      return 1;
    } else {
      const wrong = (data && typeof data.wrongAttempts === 'number') ? data.wrongAttempts : 0;
      if (wrong <= 2) return 3;
      if (wrong <= 5) return 2;
      return 1;
    }
  }

  /**
   * Reads stars from localStorage safely.
   */
  function loadStars() {
    try {
      const val = localStorage.getItem('paq_reallife_stars');
      if (!val) return { 1: 0, 2: 0, 3: 0 };

      if (val.trim().startsWith('{') || val.trim().startsWith('[')) {
        const parsed = JSON.parse(val);
        return {
          1: Math.max(0, Math.min(3, parseInt(parsed[1] || parsed['1'] || 0, 10))),
          2: Math.max(0, Math.min(3, parseInt(parsed[2] || parsed['2'] || 0, 10))),
          3: Math.max(0, Math.min(3, parseInt(parsed[3] || parsed['3'] || 0, 10)))
        };
      }

      const num = parseInt(val, 10);
      const starVal = isNaN(num) ? 0 : Math.max(0, Math.min(3, num));
      return { 1: starVal, 2: starVal, 3: starVal };
    } catch (e) {
      console.warn('loadStars failed:', e);
      return { 1: 0, 2: 0, 3: 0 };
    }
  }

  /**
   * Saves stars to localStorage safely.
   */
  function saveStars(starsObj) {
    try {
      const data = {
        1: starsObj[1] || 0,
        2: starsObj[2] || 0,
        3: starsObj[3] || 0
      };
      localStorage.setItem('paq_reallife_stars', JSON.stringify(data));
      return true;
    } catch (e) {
      console.warn('saveStars failed:', e);
      return false;
    }
  }

  return {
    parseInput,
    SCENARIO_DATA,
    createGardenShape,
    validateAndJoinGardenShapes,
    checkGardenDesign,
    isExampleDesign,
    checkStepAnswer,
    calculateStars,
    loadStars,
    saveStars
  };
}));
