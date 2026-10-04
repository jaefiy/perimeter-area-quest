/**
 * js/mathcore.js
 * Core math functions for Perimeter and Area Quest.
 * KSSR Mathematics Year 5 (Space 6.3.1 and 6.3.2)
 *
 * UMD wrapper supports Node.js (testing) and browser usage.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MathCore = factory();
  }
}(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  // --- Basic Formula Functions ---

  function rectArea(l, w) {
    return l * w;
  }

  function rectPerimeter(l, w) {
    return 2 * (l + w);
  }

  function squareArea(s) {
    return s * s;
  }

  function squarePerimeter(s) {
    return 4 * s;
  }

  function triangleArea(base, height) {
    return 0.5 * base * height;
  }

  function formatNumber(n) {
    if (Number.isInteger(n)) {
      return n.toString();
    }
    const rounded = Math.round(n * 10) / 10;
    return Number.isInteger(rounded) ? rounded.toString() : rounded.toFixed(1);
  }

  // Helper to build edge objects with direction and length metadata
  function buildEdges(vertices) {
    const edges = [];
    const count = vertices.length;
    for (let i = 0; i < count; i++) {
      const p1 = vertices[i];
      const p2 = vertices[(i + 1) % count];
      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const length = Math.hypot(dx, dy);
      const isHorizontal = Math.abs(dy) < 1e-9;
      const isVertical = Math.abs(dx) < 1e-9;
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

  // --- Shape Factory Functions ---

  function createSquare(side, x = 0, y = 0) {
    const vertices = [
      { x: x, y: y },
      { x: x + side, y: y },
      { x: x + side, y: y + side },
      { x: x, y: y + side }
    ];
    return {
      type: 'square',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: squarePerimeter(side),
      area: squareArea(side)
    };
  }

  function createRectangle(width, height, x = 0, y = 0) {
    const vertices = [
      { x: x, y: y },
      { x: x + width, y: y },
      { x: x + width, y: y + height },
      { x: x, y: y + height }
    ];
    return {
      type: 'rectangle',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: rectPerimeter(width, height),
      area: rectArea(width, height)
    };
  }

  /**
   * Factory for Right-Angled Triangles.
   * By default, legA is horizontal along the bottom (base), legB is vertical on the left.
   * Options can customize orientation if needed:
   *  - legA: length of leg along base
   *  - legB: length of vertical leg
   *  - flipH: boolean, if true legB is on the right
   *  - flipV: boolean, if true right angle is at top
   */
  function createRightTriangle(legA, legB, x = 0, y = 0, options = {}) {
    const flipH = !!options.flipH;
    const flipV = !!options.flipV;

    let vertices;
    if (!flipH && !flipV) {
      // Right angle at (x, y)
      vertices = [
        { x: x, y: y },
        { x: x + legA, y: y },
        { x: x, y: y + legB }
      ];
    } else if (flipH && !flipV) {
      // Right angle at (x + legA, y)
      vertices = [
        { x: x, y: y },
        { x: x + legA, y: y },
        { x: x + legA, y: y + legB }
      ];
    } else if (!flipH && flipV) {
      // Right angle at (x, y + legB)
      vertices = [
        { x: x, y: y + legB },
        { x: x + legA, y: y + legB },
        { x: x, y: y }
      ];
    } else {
      // flipH && flipV: Right angle at (x + legA, y + legB)
      vertices = [
        { x: x, y: y + legB },
        { x: x + legA, y: y + legB },
        { x: x + legA, y: y }
      ];
    }

    const c = Math.hypot(legA, legB);
    const perimeter = legA + legB + c;
    const area = triangleArea(legA, legB);

    return {
      type: 'right-angled triangle',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: Math.round(perimeter * 10000) / 10000,
      area: area
    };
  }

  /**
   * Factory for Isosceles Triangles.
   * Base is horizontal at y = y by default (pointing upwards if height > 0).
   * If height < 0, points downwards.
   */
  function createIsoscelesTriangle(base, height, x = 0, y = 0, options = {}) {
    const pointDown = !!options.pointDown;
    const h = pointDown ? -Math.abs(height) : Math.abs(height);

    const vertices = [
      { x: x, y: y },
      { x: x + base, y: y },
      { x: x + base / 2, y: y + h }
    ];

    const equalSide = Math.hypot(base / 2, Math.abs(height));
    const perimeter = base + 2 * equalSide;
    const area = triangleArea(base, Math.abs(height));

    return {
      type: 'isosceles triangle',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: Math.round(perimeter * 10000) / 10000,
      area: area
    };
  }

  // --- Shared Edge & Composition Functions ---

  /**
   * Calculate total length of horizontal/vertical edges of A and B that lie on the same line and overlap.
   * Sloped edges never count as shared.
   */
  function sharedLength(A, B) {
    let totalShared = 0;

    for (const eA of A.edges) {
      if (eA.isSloped) continue;

      for (const eB of B.edges) {
        if (eB.isSloped) continue;

        if (eA.isHorizontal && eB.isHorizontal) {
          const yA = eA.p1.y;
          const yB = eB.p1.y;
          if (Math.abs(yA - yB) < 1e-7) {
            const minA = Math.min(eA.p1.x, eA.p2.x);
            const maxA = Math.max(eA.p1.x, eA.p2.x);
            const minB = Math.min(eB.p1.x, eB.p2.x);
            const maxB = Math.max(eB.p1.x, eB.p2.x);

            const overlap = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
            if (overlap > 1e-7) {
              totalShared += overlap;
            }
          }
        } else if (eA.isVertical && eB.isVertical) {
          const xA = eA.p1.x;
          const xB = eB.p1.x;
          if (Math.abs(xA - xB) < 1e-7) {
            const minA = Math.min(eA.p1.y, eA.p2.y);
            const maxA = Math.max(eA.p1.y, eA.p2.y);
            const minB = Math.min(eB.p1.y, eB.p2.y);
            const maxB = Math.max(eB.p1.y, eB.p2.y);

            const overlap = Math.max(0, Math.min(maxA, maxB) - Math.max(minA, minB));
            if (overlap > 1e-7) {
              totalShared += overlap;
            }
          }
        }
      }
    }

    return Math.round(totalShared * 10000) / 10000;
  }

  /**
   * Check if interiors of shape A and shape B overlap.
   * Touching along an edge or corner is allowed (returns false).
   * Uses Separating Axis Theorem (SAT) for convex polygons.
   */
  function shapesOverlap(A, B) {
    const polys = [A.vertices, B.vertices];

    for (let p = 0; p < 2; p++) {
      const polygon = polys[p];
      const count = polygon.length;

      for (let i = 0; i < count; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % count];

        // Edge vector
        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        // Normal vector (perpendicular to edge)
        const nx = -dy;
        const ny = dx;

        // Project A onto normal
        let minA = Infinity, maxA = -Infinity;
        for (const v of A.vertices) {
          const proj = v.x * nx + v.y * ny;
          if (proj < minA) minA = proj;
          if (proj > maxA) maxA = proj;
        }

        // Project B onto normal
        let minB = Infinity, maxB = -Infinity;
        for (const v of B.vertices) {
          const proj = v.x * nx + v.y * ny;
          if (proj < minB) minB = proj;
          if (proj > maxB) maxB = proj;
        }

        // If projections are separated or only touching at boundaries, an axis of separation exists
        const EPS = 1e-7;
        if (maxA <= minB + EPS || maxB <= minA + EPS) {
          return false; // Found separating axis -> interiors do NOT overlap
        }
      }
    }

    return true; // No separating axis found -> interiors overlap
  }

  function compositePerimeter(A, B) {
    return A.perimeter + B.perimeter - 2 * sharedLength(A, B);
  }

  function compositeArea(A, B) {
    return A.area + B.area;
  }

  return {
    rectArea,
    rectPerimeter,
    squareArea,
    squarePerimeter,
    triangleArea,
    formatNumber,
    createSquare,
    createRectangle,
    createRightTriangle,
    createIsoscelesTriangle,
    sharedLength,
    shapesOverlap,
    compositePerimeter,
    compositeArea
  };
}));
