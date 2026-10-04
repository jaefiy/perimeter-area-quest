/**
 * js/splitcore.js
 * Pure logic and definitions for Tab 3: Split It! (Matching and sorting game).
 * KSSR Mathematics Year 5 (Space 6.3.1 and 6.3.2)
 *
 * UMD wrapper supports Node.js (testing) and browser usage.
 * Depends on MathCore for area calculation.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore.js');
    module.exports = factory(MathCore);
  } else {
    root.SplitCore = factory(root.MathCore);
  }
}(typeof self !== 'undefined' ? self : this, function (MathCore) {
  'use strict';

  // Composite shape definitions S1 through S6
  const composites = [
    {
      id: 'S1',
      title: 'Composite Shape S1',
      cardTitle: 'Rectangle + Square',
      distractorCard: 'Rectangle + Rectangle',
      createShapes: function () {
        const s1 = MathCore.createRectangle(7, 3, 0, 0);
        const s2 = MathCore.createSquare(3, 7, 0);
        return { s1, s2 };
      },
      labels: [
        { text: '7 cm', x: 3.5, y: -0.5 },
        { text: '3 cm', x: -0.8, y: 1.5 },
        { text: '3 cm', x: 8.5, y: 1.5 },
        { text: '3 cm', x: 10.8, y: 1.5 }
      ],
      areaOptions: [30, 27, 33]
    },
    {
      id: 'S2',
      title: 'Composite Shape S2',
      cardTitle: 'Rectangle + Rectangle (L-shape)',
      distractorCard: 'Rectangle + Square',
      createShapes: function () {
        const s1 = MathCore.createRectangle(8, 3, 0, 0);
        const s2 = MathCore.createRectangle(3, 4, 0, 3);
        return { s1, s2 };
      },
      labels: [
        { text: '8 cm', x: 4, y: -0.5 },
        { text: '3 cm', x: 8.8, y: 1.5 },
        { text: '3 cm', x: 1.5, y: 7.5 },
        { text: '4 cm', x: -0.8, y: 5 }
      ],
      areaOptions: [36, 24, 48]
    },
    {
      id: 'S3',
      title: 'Composite Shape S3',
      cardTitle: 'Rectangle + Isosceles triangle',
      distractorCard: 'Rectangle + Right-angled triangle',
      createShapes: function () {
        const s1 = MathCore.createRectangle(6, 3, 0, 0);
        const s2 = MathCore.createIsoscelesTriangle(6, 4, 0, 3);
        return { s1, s2 };
      },
      labels: [
        { text: '6 cm', x: 3, y: -0.5 },
        { text: '3 cm', x: -0.8, y: 1.5 },
        { text: 'h = 4 cm', x: 3, y: 5 }
      ],
      areaOptions: [30, 42, 18]
    },
    {
      id: 'S4',
      title: 'Composite Shape S4',
      cardTitle: 'Rectangle + Right-angled triangle',
      distractorCard: 'Rectangle + Isosceles triangle',
      createShapes: function () {
        const s1 = MathCore.createRectangle(6, 4, 0, 0);
        const s2 = MathCore.createRightTriangle(3, 4, 6, 0);
        return { s1, s2 };
      },
      labels: [
        { text: '6 cm', x: 3, y: -0.5 },
        { text: '4 cm', x: -0.8, y: 2 },
        { text: '3 cm', x: 7.5, y: -0.5 },
        { text: '5 cm', x: 7.8, y: 2.2 }
      ],
      areaOptions: [30, 36, 24]
    },
    {
      id: 'S5',
      title: 'Composite Shape S5',
      cardTitle: 'Square + Equilateral triangle',
      distractorCard: 'Rectangle + Equilateral triangle',
      createShapes: function () {
        const s1 = MathCore.createSquare(4, 0, 0);
        const s2 = MathCore.regularPolygon(3, 4, 0, 4);
        return { s1, s2 };
      },
      labels: [
        { text: '4 cm', x: 2, y: -0.5 },
        { text: '4 cm', x: -0.8, y: 2 },
        { text: 'h = 3.5 cm', x: 2, y: 5.2 }
      ],
      areaOptions: [23, 30, 16]
    },
    {
      id: 'S6',
      title: 'Composite Shape S6',
      cardTitle: 'Rectangle + Equilateral triangle',
      distractorCard: 'Square + Equilateral triangle',
      createShapes: function () {
        const s1 = MathCore.createRectangle(8, 5, 0, 0);
        const s2 = MathCore.regularPolygon(3, 8, 0, 5);
        return { s1, s2 };
      },
      labels: [
        { text: '8 cm', x: 4, y: -0.5 },
        { text: '5 cm', x: -0.8, y: 2.5 },
        { text: 'h = 7 cm', x: 4, y: 7.5 }
      ],
      areaOptions: [68, 96, 40]
    }
  ];

  function getComposite(id) {
    const comp = composites.find(c => c.id === id);
    if (!comp) return null;

    const shapes = comp.createShapes();
    const computedArea = MathCore.compositeArea(shapes.s1, shapes.s2);

    return Object.assign({}, comp, {
      shapes: shapes,
      computedArea: computedArea
    });
  }

  function checkCardMatch(compositeId, cardTitle) {
    const comp = getComposite(compositeId);
    if (!comp) return false;
    return comp.cardTitle === cardTitle;
  }

  function getAreaOptions(compositeId) {
    const comp = getComposite(compositeId);
    if (!comp) return [];

    const correct = comp.computedArea;
    const options = [correct];

    comp.areaOptions.forEach(opt => {
      if (opt !== correct && !options.includes(opt)) {
        options.push(opt);
      }
    });

    // Ensure options array has exactly 3 unique options
    while (options.length < 3) {
      const dummy = correct + (options.length * 5);
      if (!options.includes(dummy)) options.push(dummy);
    }

    return options.slice(0, 3);
  }

  return {
    composites: composites,
    getComposite: getComposite,
    checkCardMatch: checkCardMatch,
    getAreaOptions: getAreaOptions
  };
}));
