/**
 * js/labcore.js
 * Pure logic and calculations for World 1: Shape Lab.
 * KSSR Mathematics Year 5 (Space 6.3.1 and 6.3.2)
 *
 * UMD wrapper supports Node.js (testing) and browser usage.
 * Depends on MathCore for base formulas and overlap/perimeter/area calculations.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore.js');
    module.exports = factory(MathCore);
  } else {
    root.LabCore = factory(root.MathCore);
  }
}(typeof self !== 'undefined' ? self : this, function (MathCore) {
  'use strict';

  function buildEdges(vertices) {
    const edges = [];
    const count = vertices.length;
    for (let i = 0; i < count; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % count];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.hypot(dx, dy);
      const isHorizontal = Math.abs(dy) < 1e-6;
      const isVertical = Math.abs(dx) < 1e-6;
      const isSloped = !isHorizontal && !isVertical;

      edges.push({
        p1: { x: p1.x, y: p1.y },
        p2: { x: p2.x, y: p2.y },
        length: Math.round(length * 10000) / 10000,
        isHorizontal,
        isVertical,
        isSloped
      });
    }
    return edges;
  }

  function rebuildShape(shape, newVertices) {
    const roundedVertices = newVertices.map(v => ({
      x: Math.abs(v.x) < 1e-6 ? 0 : Math.round(v.x * 1e6) / 1e6,
      y: Math.abs(v.y) < 1e-6 ? 0 : Math.round(v.y * 1e6) / 1e6
    }));
    return Object.assign({}, shape, {
      vertices: roundedVertices,
      edges: buildEdges(roundedVertices)
    });
  }

  function snapToGrid(val, step) {
    if (step === undefined || step === null) step = 0.5;
    const snapped = Math.round(val / step) * step;
    return Math.round(snapped * 10000) / 10000;
  }

  function translateShape(shape, dx, dy) {
    const newVertices = shape.vertices.map(v => ({
      x: v.x + dx,
      y: v.y + dy
    }));
    return rebuildShape(shape, newVertices);
  }

  function getCentroid(vertices) {
    let sumX = 0, sumY = 0;
    const n = vertices.length;
    for (let i = 0; i < n; i++) {
      sumX += vertices[i].x;
      sumY += vertices[i].y;
    }
    return { x: sumX / n, y: sumY / n };
  }

  function rotateShape(shape, angleRad, origin) {
    if (!origin) {
      origin = getCentroid(shape.vertices);
    }
    const cos = Math.cos(angleRad);
    const sin = Math.sin(angleRad);

    const newVertices = shape.vertices.map(v => {
      const dx = v.x - origin.x;
      const dy = v.y - origin.y;
      return {
        x: origin.x + dx * cos - dy * sin,
        y: origin.y + dx * sin + dy * cos
      };
    });

    return rebuildShape(shape, newVertices);
  }

  function rotateShape90(shape) {
    const origin = getCentroid(shape.vertices);
    const newVertices = shape.vertices.map(v => {
      const dx = v.x - origin.x;
      const dy = v.y - origin.y;
      return {
        x: origin.x - dy,
        y: origin.y + dx
      };
    });

    return rebuildShape(shape, newVertices);
  }

  function flipShape(shape) {
    const origin = getCentroid(shape.vertices);
    const newVertices = shape.vertices.map(v => ({
      x: 2 * origin.x - v.x,
      y: v.y
    }));

    return rebuildShape(shape, newVertices);
  }

  function findEdgeSnap(moving, fixed, threshold) {
    if (threshold === undefined || threshold === null) threshold = 1.5;

    let bestCandidate = null;
    let minDistance = Infinity;

    for (const eM of moving.edges) {
      for (const eF of fixed.edges) {
        // Ignore edges of different lengths (tolerance 0.01)
        if (Math.abs(eM.length - eF.length) > 0.01) {
          continue;
        }

        const midM = { x: (eM.p1.x + eM.p2.x) / 2, y: (eM.p1.y + eM.p2.y) / 2 };
        const midF = { x: (eF.p1.x + eF.p2.x) / 2, y: (eF.p1.y + eF.p2.y) / 2 };
        const dist = Math.hypot(midM.x - midF.x, midM.y - midF.y);

        if (dist > threshold) {
          continue;
        }

        // Try both orientations to map eM onto eF
        const orientations = [
          { t1: eF.p2, t2: eF.p1 }, // Opposite direction (standard edge join)
          { t1: eF.p1, t2: eF.p2 }  // Same direction
        ];

        for (const orient of orientations) {
          const angleM = Math.atan2(eM.p2.y - eM.p1.y, eM.p2.x - eM.p1.x);
          const angleT = Math.atan2(orient.t2.y - orient.t1.y, orient.t2.x - orient.t1.x);
          const rotAngle = angleT - angleM;

          const rotated = rotateShape(moving, rotAngle, eM.p1);
          const dx = orient.t1.x - eM.p1.x;
          const dy = orient.t1.y - eM.p1.y;
          const candidate = translateShape(rotated, dx, dy);

          // Check non-overlap and that edges actually share a length > 0
          if (!MathCore.shapesOverlap(candidate, fixed)) {
            const shared = MathCore.sharedLength(candidate, fixed);
            if (shared > 0.01) {
              if (dist < minDistance) {
                minDistance = dist;
                bestCandidate = candidate;
              }
            }
          }
        }
      }
    }

    return bestCandidate;
  }

  return {
    snapToGrid: snapToGrid,
    translateShape: translateShape,
    rotateShape: rotateShape,
    rotateShape90: rotateShape90,
    flipShape: flipShape,
    findEdgeSnap: findEdgeSnap
  };
}));
