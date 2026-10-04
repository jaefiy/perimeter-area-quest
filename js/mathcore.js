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
    if (n === null || n === undefined) return '';
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

  // --- Shape Factory Functions ---

  /**
   * Factory for Regular Polygons (n = 3 to 8).
   * Generates vertices using trigonometry.
   */
  function regularPolygon(n, side, x = 0, y = 0, options = {}) {
    if (n < 3 || n > 8) {
      throw new Error('regularPolygon only supports n between 3 and 8');
    }

    const names = {
      3: 'equilateral triangle',
      4: 'square',
      5: 'pentagon',
      6: 'hexagon',
      7: 'heptagon',
      8: 'octagon'
    };

    const name = names[n];
    const startAngle = options.startAngle || 0;
    const exteriorAngle = (2 * Math.PI) / n;

    const vertices = [];
    let currX = x;
    let currY = y;
    vertices.push({ x: Math.round(currX * 1e6) / 1e6, y: Math.round(currY * 1e6) / 1e6 });

    for (let i = 0; i < n - 1; i++) {
      const angle = startAngle + i * exteriorAngle;
      currX += side * Math.cos(angle);
      currY += side * Math.sin(angle);
      vertices.push({ x: Math.round(currX * 1e6) / 1e6, y: Math.round(currY * 1e6) / 1e6 });
    }

    const perimeter = n * side;

    let area = null;
    let areaAllowed = false;

    if (n === 4) {
      area = squareArea(side);
      areaAllowed = true;
    } else if (n === 3) {
      const heightLookup = { 4: 3.5, 8: 7 };
      const givenHeight = heightLookup[side] !== undefined ? heightLookup[side] : null;
      if (givenHeight !== null) {
        area = triangleArea(side, givenHeight);
        areaAllowed = true;
      } else {
        area = null;
        areaAllowed = false;
      }
    } else {
      area = null;
      areaAllowed = false;
    }

    return {
      type: name,
      name: name,
      n: n,
      side: side,
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: Math.round(perimeter * 100) / 100,
      area: area !== null ? Math.round(area * 100) / 100 : null,
      areaAllowed: areaAllowed
    };
  }

  function createSquare(side, x = 0, y = 0) {
    const vertices = [
      { x: x, y: y },
      { x: x + side, y: y },
      { x: x + side, y: y + side },
      { x: x, y: y + side }
    ];
    return {
      type: 'square',
      name: 'square',
      n: 4,
      side: side,
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: squarePerimeter(side),
      area: squareArea(side),
      areaAllowed: true
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
      name: 'rectangle',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: rectPerimeter(width, height),
      area: rectArea(width, height),
      areaAllowed: true
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
      vertices = [
        { x: x, y: y },
        { x: x + legA, y: y },
        { x: x, y: y + legB }
      ];
    } else if (flipH && !flipV) {
      vertices = [
        { x: x, y: y },
        { x: x + legA, y: y },
        { x: x + legA, y: y + legB }
      ];
    } else if (!flipH && flipV) {
      vertices = [
        { x: x, y: y + legB },
        { x: x + legA, y: y + legB },
        { x: x, y: y }
      ];
    } else {
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
      name: 'right-angled triangle',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: Math.round(perimeter * 10000) / 10000,
      area: area,
      areaAllowed: true
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
      name: 'isosceles triangle',
      vertices: vertices,
      edges: buildEdges(vertices),
      perimeter: Math.round(perimeter * 10000) / 10000,
      area: area,
      areaAllowed: true
    };
  }

  // --- Shared Edge & Composition Functions ---

  /**
   * Calculate total length of edges of A and B that lie on the same line and overlap.
   * Works for edges in ANY direction, including sloped edges.
   */
  function sharedLength(A, B) {
    let totalShared = 0;
    const EPS = 1e-6;

    for (const eA of A.edges) {
      const ax = eA.p2.x - eA.p1.x;
      const ay = eA.p2.y - eA.p1.y;
      const lenA = Math.hypot(ax, ay);
      if (lenA < EPS) continue;
      const ux = ax / lenA;
      const uy = ay / lenA;
      const nx = -uy;
      const ny = ux;

      for (const eB of B.edges) {
        const bx = eB.p2.x - eB.p1.x;
        const by = eB.p2.y - eB.p1.y;
        const lenB = Math.hypot(bx, by);
        if (lenB < EPS) continue;

        // Check if edges are parallel or anti-parallel (cross product near 0)
        const cross = Math.abs(ux * by - uy * bx);
        if (cross > EPS) continue;

        // Check if eB lies on the same infinite line as eA (perpendicular distance < EPS)
        const dist1 = Math.abs((eB.p1.x - eA.p1.x) * nx + (eB.p1.y - eA.p1.y) * ny);
        const dist2 = Math.abs((eB.p2.x - eA.p1.x) * nx + (eB.p2.y - eA.p1.y) * ny);
        if (dist1 > EPS || dist2 > EPS) continue;

        // Project eB onto eA's line axis u
        const t1 = (eB.p1.x - eA.p1.x) * ux + (eB.p1.y - eA.p1.y) * uy;
        const t2 = (eB.p2.x - eA.p1.x) * ux + (eB.p2.y - eA.p1.y) * uy;

        const minB = Math.min(t1, t2);
        const maxB = Math.max(t1, t2);

        // eA spans [0, lenA]
        const overlapStart = Math.max(0, minB);
        const overlapEnd = Math.min(lenA, maxB);

        const overlap = overlapEnd - overlapStart;
        if (overlap > EPS) {
          totalShared += overlap;
        }
      }
    }

    return Math.round(totalShared * 10000) / 10000;
  }

  /**
   * Check if interiors of shape A and shape B overlap.
   * Touching along an edge or at a corner is allowed (returns false).
   * Uses Separating Axis Theorem (SAT) for convex polygons.
   */
  function shapesOverlap(A, B) {
    const EPS = 1e-6;
    const polygons = [A.vertices, B.vertices];

    for (let p = 0; p < 2; p++) {
      const polygon = polygons[p];
      const count = polygon.length;

      for (let i = 0; i < count; i++) {
        const p1 = polygon[i];
        const p2 = polygon[(i + 1) % count];

        const dx = p2.x - p1.x;
        const dy = p2.y - p1.y;

        const len = Math.hypot(dx, dy);
        if (len < EPS) continue;
        const nx = -dy / len;
        const ny = dx / len;

        let minA = Infinity, maxA = -Infinity;
        for (const v of A.vertices) {
          const proj = v.x * nx + v.y * ny;
          if (proj < minA) minA = proj;
          if (proj > maxA) maxA = proj;
        }

        let minB = Infinity, maxB = -Infinity;
        for (const v of B.vertices) {
          const proj = v.x * nx + v.y * ny;
          if (proj < minB) minB = proj;
          if (proj > maxB) maxB = proj;
        }

        if (maxA <= minB + EPS || maxB <= minA + EPS) {
          return false;
        }
      }
    }

    return true;
  }

  function compositePerimeter(A, B) {
    const p = A.perimeter + B.perimeter - 2 * sharedLength(A, B);
    return Math.round(p * 100) / 100;
  }

  function compositeArea(A, B) {
    if (A.areaAllowed && B.areaAllowed && A.area !== null && B.area !== null) {
      const area = A.area + B.area;
      return Math.round(area * 100) / 100;
    }
    return null;
  }

  return {
    rectArea,
    rectPerimeter,
    squareArea,
    squarePerimeter,
    triangleArea,
    formatNumber,
    regularPolygon,
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
