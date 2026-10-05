/**
 * js/questions.js
 * Question bank for World 2: Mission Quiz (Year 5 KSSR 6.3.1 and 6.3.2).
 * UMD wrapper supports Node.js (testing) and browser usage.
 * Depends on MathCore for shape calculations where needed.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore.js');
    module.exports = factory(MathCore);
  } else {
    root.QuizQuestions = factory(root.MathCore);
  }
}(typeof self !== 'undefined' ? self : this, function (MathCore) {
  'use strict';

  /**
   * Question definitions (Q1 to Q10)
   * Each question contains:
   * - id, type ("mcq" | "typed"), skill ("perimeter" | "area")
   * - text, unit, hint, explanation
   * - shapeData (used by SVG diagram renderer)
   * - options (for MCQ) or typedMistakes (for typed)
   * - answer
   */
  const questions = [
    // Q1 (mcq, perimeter)
    {
      id: 1,
      type: 'mcq',
      skill: 'perimeter',
      unit: 'cm',
      text: 'Two squares, each with sides of 4 cm, are joined side by side. What is the perimeter?',
      hint: 'Count only the outer sides. Do not count the inside line!',
      explanation: 'Outer sides: 4 + 4 + 4 + 4 + 4 + 4 = 24 cm. Or 16 + 16 - 2 x 4 = 24 cm.',
      answer: 24,
      shapeData: {
        type: 'two_squares',
        s1: MathCore.createSquare(4, 0, 0),
        s2: MathCore.createSquare(4, 4, 0),
        labels: [{ text: '4 cm', side: 'top1' }, { text: '4 cm', side: 'top2' }, { text: '4 cm', side: 'side' }]
      },
      options: [
        { value: 32, mistake: 'You added the perimeter of both squares. The shared sides are inside!' },
        { value: 24, mistake: null },
        { value: 16, mistake: 'That is one square only.' },
        { value: 28, mistake: 'You subtracted 4 cm once. Subtract 2 x 4 cm!' }
      ]
    },

    // Q2 (mcq, perimeter)
    {
      id: 2,
      type: 'mcq',
      skill: 'perimeter',
      unit: 'cm',
      text: 'A rectangle 7 cm x 3 cm is joined to a square of side 3 cm along a 3 cm side. What is the perimeter?',
      hint: 'Perimeter = Perimeter 1 + Perimeter 2 - (2 x shared side).',
      explanation: '20 + 12 - 2 x 3 = 26 cm.',
      answer: 26,
      shapeData: {
        type: 'rect_square',
        s1: MathCore.createRectangle(7, 3, 0, 0),
        s2: MathCore.createSquare(3, 0, 0),
        layoutOpts: { edgeAIndex: 1, edgeBIndex: 0 },
        labels: [{ text: '7 cm', side: 'top' }, { text: '3 cm', side: 'right' }, { text: '3 cm', side: 'sq' }]
      },
      options: [
        { value: 32, mistake: 'You added both perimeters: 20 + 12.' },
        { value: 26, mistake: null },
        { value: 30, mistake: '30 is the area, not the perimeter!' },
        { value: 23, mistake: 'Subtract 2 x 3 cm for the shared side.' }
      ]
    },

    // Q3 (typed, perimeter)
    {
      id: 3,
      type: 'typed',
      skill: 'perimeter',
      unit: 'cm',
      text: 'A regular pentagon and a regular hexagon, both with sides of 4 cm, are joined along one side. What is the perimeter in cm?',
      hint: 'Count the outer sides: the pentagon has 5 sides and the hexagon has 6. Two sides are joined.',
      explanation: 'Outer sides = 5 + 6 - 2 = 9 sides. 9 x 4 = 36 cm.',
      answer: 36,
      shapeData: {
        type: 'pentagon_hexagon',
        s1: MathCore.regularPolygon(5, 4, 0, 0),
        s2: MathCore.regularPolygon(6, 4, 4, 0, { startAngle: Math.PI })
      },
      typedMistakes: {
        44: 'You counted the joined side twice! Do not count it.'
      }
    },

    // Q4 (mcq, perimeter)
    {
      id: 4,
      type: 'mcq',
      skill: 'perimeter',
      unit: 'cm',
      text: 'A house shape is a square of side 6 cm with an equilateral triangle of side 6 cm on top. What is the perimeter?',
      hint: 'The house has 3 outer sides from the square and 2 outer sides from the triangle.',
      explanation: 'Outer sides: 6 + 6 + 6 + 6 + 6 = 30 cm (3 sides of the square and 2 sides of the triangle).',
      answer: 30,
      shapeData: {
        type: 'square_triangle',
        s1: MathCore.createSquare(6, 0, 0),
        s2: MathCore.regularPolygon(3, 6, 0, 0),
        layoutOpts: { edgeAIndex: 0, edgeBIndex: 0 }
      },
      options: [
        { value: 42, mistake: 'You counted every side of both shapes.' },
        { value: 36, mistake: 'You counted the joined side.' },
        { value: 30, mistake: null },
        { value: 24, mistake: 'You forgot the triangle.' }
      ]
    },

    // Q5 (mcq, perimeter)
    {
      id: 5,
      type: 'mcq',
      skill: 'perimeter',
      unit: 'cm',
      text: 'A regular octagon and a square both have sides of 3 cm. They are joined along one side. What is the perimeter?',
      hint: 'Octagon has 8 sides, square has 4 sides. 2 sides are joined inside.',
      explanation: 'Outer sides = 8 + 4 - 2 = 10 sides. 10 x 3 = 30 cm.',
      answer: 30,
      shapeData: {
        type: 'octagon_square',
        s1: MathCore.regularPolygon(8, 3, 0, 0),
        s2: MathCore.createSquare(3, 0, 0),
        layoutOpts: { edgeAIndex: 1, edgeBIndex: 3 }
      },
      options: [
        { value: 36, mistake: 'You added both perimeters.' },
        { value: 33, mistake: 'Take away the joined side from BOTH shapes, not just one.' },
        { value: 30, mistake: null },
        { value: 24, mistake: 'You forgot the square.' }
      ]
    },

    // Q6 (typed, perimeter)
    {
      id: 6,
      type: 'typed',
      skill: 'perimeter',
      unit: 'cm',
      text: 'A rectangle 6 cm x 3 cm has an isosceles triangle on its 6 cm side. The triangle has equal sides of 5 cm. What is the perimeter in cm?',
      hint: 'Do not count the 6 cm side where the shapes join.',
      explanation: 'Outer sides: 6 + 3 + 3 + 5 + 5 = 22 cm.',
      answer: 22,
      shapeData: {
        type: 'rect_isosceles_perim',
        s1: MathCore.createRectangle(6, 3, 0, 0),
        s2: MathCore.createIsoscelesTriangle(6, 4, 0, 0),
        layoutOpts: { edgeAIndex: 0, edgeBIndex: 0 }
      },
      typedMistakes: {
        28: 'You counted the joined 6 cm side.'
      }
    },

    // Q7 (typed, area)
    {
      id: 7,
      type: 'typed',
      skill: 'area',
      unit: 'cm²',
      text: 'Use the same shape as Question 6. The triangle has a base of 6 cm and a height of 4 cm. What is the area in cm2?',
      hint: 'Area of a triangle = 1/2 x base x height.',
      explanation: 'Rectangle: 6 x 3 = 18 cm2. Triangle: 1/2 x 6 x 4 = 12 cm2. Total = 30 cm2.',
      answer: 30,
      shapeData: {
        type: 'rect_isosceles_area',
        s1: MathCore.createRectangle(6, 3, 0, 0),
        s2: MathCore.createIsoscelesTriangle(6, 4, 0, 0),
        layoutOpts: { edgeAIndex: 0, edgeBIndex: 0, heightText: 'h = 4 cm', heightBaseIdx: 0 }
      },
      typedMistakes: {
        36: 'You forgot the 1/2 for the triangle.'
      }
    },

    // Q8 (mcq, area)
    {
      id: 8,
      type: 'mcq',
      skill: 'area',
      unit: 'cm²',
      text: 'A square of side 4 cm is joined to an equilateral triangle of side 4 cm. The height of the triangle is 3.5 cm. What is the total area?',
      hint: 'Area = Area of Square + Area of Triangle.',
      explanation: 'Square: 4 x 4 = 16 cm2. Triangle: 1/2 x 4 x 3.5 = 7 cm2. Total = 23 cm2.',
      answer: 23,
      shapeData: {
        type: 'square_eq_triangle_area',
        s1: MathCore.createSquare(4, 0, 0),
        s2: MathCore.regularPolygon(3, 4, 0, 0),
        layoutOpts: { edgeAIndex: 0, edgeBIndex: 0, customHeightB: 3.5, heightText: 'h = 3.5 cm', heightBaseIdx: 0 }
      },
      options: [
        { value: 23, mistake: null },
        { value: 16, mistake: 'You forgot the triangle.' },
        { value: 30, mistake: 'You forgot the 1/2 for the triangle.' },
        { value: 7, mistake: 'That is the triangle only.' }
      ]
    },

    // Q9 (mcq, area)
    {
      id: 9,
      type: 'mcq',
      skill: 'area',
      unit: 'cm²',
      text: 'A rectangle 8 cm x 5 cm is joined to a right-angled triangle along a 5 cm side. The triangle has a base of 6 cm and a height of 5 cm. What is the total area?',
      hint: 'Rectangle area = 8 x 5 = 40. Triangle area = 1/2 x 6 x 5 = 15.',
      explanation: 'Rectangle: 8 x 5 = 40 cm2. Triangle: 1/2 x 6 x 5 = 15 cm2. Total = 55 cm2.',
      answer: 55,
      shapeData: {
        type: 'rect_right_triangle_area',
        s1: MathCore.createRectangle(8, 5, 0, 0),
        s2: MathCore.createRightTriangle(6, 5, 0, 0),
        layoutOpts: { edgeAIndex: 1, edgeBIndex: 1, showRightAngleB: true, noHypotenuse: true }
      },
      options: [
        { value: 70, mistake: 'You forgot the 1/2 for the triangle.' },
        { value: 55, mistake: null },
        { value: 45, mistake: 'Check the triangle area again.' },
        { value: 40, mistake: 'That is the rectangle only.' }
      ]
    },

    // Q10 (mcq, perimeter)
    {
      id: 10,
      type: 'mcq',
      skill: 'perimeter',
      unit: 'cm',
      text: 'Aina joins two squares with sides of 5 cm. She says the perimeter is 40 cm. What is the real perimeter?',
      hint: 'Two 5 cm squares joined side by side make a rectangle 10 cm x 5 cm.',
      explanation: 'The new shape is a rectangle 10 cm x 5 cm. Perimeter: 10 + 5 + 10 + 5 = 30 cm.',
      answer: 30,
      shapeData: {
        type: 'two_squares_5',
        s1: MathCore.createSquare(5, 0, 0),
        s2: MathCore.createSquare(5, 5, 0)
      },
      options: [
        { value: 40, mistake: 'Aina counted the shared sides. They are inside!' },
        { value: 30, mistake: null },
        { value: 20, mistake: 'That is one square only.' },
        { value: 50, mistake: 'Check the rectangle sides again.' }
      ]
    }
  ];

  return {
    questions: questions,
    getQuestion: function (id) {
      return questions.find(q => q.id === id) || null;
    }
  };
}));
