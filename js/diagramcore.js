/**
 * js/diagramcore.js
 * Pure logic for layout and rendering data for World 2 Quiz Diagrams.
 * KSSR Mathematics Year 5 (Space 6.3.1 and 6.3.2)
 *
 * UMD wrapper supports Node.js (testing) and browser usage.
 * Depends on MathCore for formulas and geometry.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore.js');
    module.exports = factory(MathCore);
  } else {
    root.DiagramCore = factory(root.MathCore);
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

      edges.push({
        p1: { x: p1.x, y: p1.y },
        p2: { x: p2.x, y: p2.y },
        length: Math.round(length * 10000) / 10000
      });
    }
    return edges;
  }

  function getCentroid(vertices) {
    let sumX = 0, sumY = 0;
    vertices.forEach(v => { sumX += v.x; sumY += v.y; });
    return { x: sumX / vertices.length, y: sumY / vertices.length };
  }

  /**
   * Pure function to layout composite shapes for Quiz diagrams.
   * @param {Object} rawA - Shape A definition or instance
   * @param {Object} rawB - Shape B definition or instance
   * @param {Object} [options] - Layout options (edgeAIndex, edgeBIndex, givenHeight, noHypotenuse, etc.)
   * @returns {Object} { shapeA, shapeB, sharedSegment, sideLabels, heightLabel, rightAngleMarkers, bounds, viewBox }
   */
  function layoutComposite(rawA, rawB, options) {
    options = options || {};

    let vertsA = rawA.vertices.map(v => ({ x: v.x, y: v.y }));
    let vertsB = rawB.vertices.map(v => ({ x: v.x, y: v.y }));

    // Handle special geometry for equilateral triangle with given height (e.g. Q8: side 4, height 3.5)
    if (options.customHeightB && rawB.n === 3) {
      // equilateral triangle with custom height
      const side = rawB.side || 4;
      const h = options.customHeightB; // e.g. 3.5
      // Base along x axis [0, side], apex at [side/2, h]
      vertsB = [
        { x: 0, y: 0 },
        { x: side, y: 0 },
        { x: side / 2, y: h }
      ];
    } else if (options.customHeightA && rawA.n === 3) {
      const side = rawA.side || 4;
      const h = options.customHeightA;
      vertsA = [
        { x: 0, y: 0 },
        { x: side, y: 0 },
        { x: side / 2, y: h }
      ];
    }

    const edgesA = buildEdges(vertsA);
    const edgesB = buildEdges(vertsB);

    const edgeAIdx = options.edgeAIndex !== undefined ? options.edgeAIndex : 0;
    const edgeBIdx = options.edgeBIndex !== undefined ? options.edgeBIndex : 0;

    const eA = edgesA[edgeAIdx % edgesA.length];
    const eB = edgesB[edgeBIdx % edgesB.length];

    // Align eB to eA: translate and rotate B so eB lies on eA
    // eA goes from p1 to p2. eB should go from eA.p2 to eA.p1 (opposite direction) so B sits outside A.
    const angleA = Math.atan2(eA.p2.y - eA.p1.y, eA.p2.x - eA.p1.x);
    const angleB = Math.atan2(eB.p2.y - eB.p1.y, eB.p2.x - eB.p1.x);

    // Target angle for eB is angleA + PI (anti-parallel to eA)
    let rotAngle = (angleA + Math.PI) - angleB;

    let rotatedVertsB = vertsB.map(v => {
      const dx = v.x - eB.p1.x;
      const dy = v.y - eB.p1.y;
      return {
        x: eB.p1.x + dx * Math.cos(rotAngle) - dy * Math.sin(rotAngle),
        y: eB.p1.y + dx * Math.sin(rotAngle) + dy * Math.cos(rotAngle)
      };
    });

    // Translate so eB.p1 coincides with eA.p2
    const targetP1 = eA.p2;
    const currentP1 = rotatedVertsB[edgeBIdx % rotatedVertsB.length];
    const transX = targetP1.x - currentP1.x;
    const transY = targetP1.y - currentP1.y;

    let finalVertsB = rotatedVertsB.map(v => ({
      x: Math.round((v.x + transX) * 10000) / 10000,
      y: Math.round((v.y + transY) * 10000) / 10000
    }));

    // Verify centroid B is on opposite side of eA from centroid A
    const centA = getCentroid(vertsA);
    let centB = getCentroid(finalVertsB);

    // eA line equation: (y2-y1)*x - (x2-x1)*y + x2*y1 - y2*x1 = 0
    const lineVal = (p) => (eA.p2.y - eA.p1.y) * p.x - (eA.p2.x - eA.p1.x) * p.y + eA.p2.x * eA.p1.y - eA.p2.y * eA.p1.x;
    const sideCentA = lineVal(centA);
    const sideCentB = lineVal(centB);

    if (sideCentA * sideCentB > 1e-5) {
      // B's centroid is on the SAME side as A's centroid! Reflect B across eA.
      // Reflect line eA
      const ux = (eA.p2.x - eA.p1.x) / eA.length;
      const uy = (eA.p2.y - eA.p1.y) / eA.length;
      const nx = -uy;
      const ny = ux;

      finalVertsB = finalVertsB.map(v => {
        const dx = v.x - eA.p1.x;
        const dy = v.y - eA.p1.y;
        const dist = dx * nx + dy * ny;
        return {
          x: Math.round((v.x - 2 * dist * nx) * 10000) / 10000,
          y: Math.round((v.y - 2 * dist * ny) * 10000) / 10000
        };
      });
    }

    const shapeA = Object.assign({}, rawA, {
      vertices: vertsA.map(v => ({ x: Math.round(v.x * 10000) / 10000, y: Math.round(v.y * 10000) / 10000 })),
      edges: buildEdges(vertsA)
    });

    const shapeB = Object.assign({}, rawB, {
      vertices: finalVertsB.map(v => ({ x: Math.round(v.x * 10000) / 10000, y: Math.round(v.y * 10000) / 10000 })),
      edges: buildEdges(finalVertsB)
    });

    // Shared segment
    const sharedLen = Math.round(eA.length * 100) / 100;
    const sharedSegment = {
      p1: { x: Math.round(eA.p1.x * 10000) / 10000, y: Math.round(eA.p1.y * 10000) / 10000 },
      p2: { x: Math.round(eA.p2.x * 10000) / 10000, y: Math.round(eA.p2.y * 10000) / 10000 },
      length: sharedLen,
      label: `joined (${sharedLen} cm)`
    };

    // Side labels
    const sideLabels = [];
    const centShapeA = getCentroid(shapeA.vertices);
    const centShapeB = getCentroid(shapeB.vertices);

    const processShapeLabels = (shape, centroid, isShapeB) => {
      shape.edges.forEach((edge, idx) => {
        const midX = (edge.p1.x + edge.p2.x) / 2;
        const midY = (edge.p1.y + edge.p2.y) / 2;

        // Check if edge is the shared edge
        const distToShared = Math.hypot(midX - (sharedSegment.p1.x + sharedSegment.p2.x) / 2, midY - (sharedSegment.p1.y + sharedSegment.p2.y) / 2);
        if (distToShared < 0.1) {
          return; // Skip shared edge label (handled separately by sharedSegment label)
        }

        // Check noHypotenuse rule (Q9 right triangle hypotenuse)
        if (options.noHypotenuse && isShapeB && (edge.isSloped || idx === 1)) {
          return; // Skip sloped hypotenuse label
        }

        // Calculate outward normal (14px offset)
        const dx = edge.p2.x - edge.p1.x;
        const dy = edge.p2.y - edge.p1.y;
        const len = Math.hypot(dx, dy);
        if (len < 1e-6) return;

        let nx = -dy / len;
        let ny = dx / len;

        // Ensure normal points AWAY from shape centroid
        const vX = midX - centroid.x;
        const vY = midY - centroid.y;
        if (nx * vX + ny * vY < 0) {
          nx = -nx;
          ny = -ny;
        }

        const formattedLen = MathCore.formatNumber(edge.length);
        sideLabels.push({
          x: midX,
          y: midY,
          nx: nx,
          ny: ny,
          text: `${formattedLen} cm`,
          shapeType: shape.type
        });
      });
    };

    processShapeLabels(shapeA, centShapeA, false);
    processShapeLabels(shapeB, centShapeB, true);

    // Height label & dashed line (Q7, Q8)
    let heightInfo = null;
    if (options.heightText) {
      // Find triangle shape
      const triShape = (shapeB.vertices.length === 3) ? shapeB : (shapeA.vertices.length === 3 ? shapeA : null);
      if (triShape) {
        const triCent = getCentroid(triShape.vertices);
        let baseP1 = triShape.edges[0].p1;
        let baseP2 = triShape.edges[0].p2;
        let apex = triShape.vertices[2];

        // For isosceles/equilateral, find base edge and apex
        if (options.heightBaseIdx !== undefined) {
          const bEdge = triShape.edges[options.heightBaseIdx];
          baseP1 = bEdge.p1;
          baseP2 = bEdge.p2;
          apex = triShape.vertices[(options.heightBaseIdx + 2) % 3];
        }

        const midBase = { x: (baseP1.x + baseP2.x) / 2, y: (baseP1.y + baseP2.y) / 2 };

        heightInfo = {
          line: { p1: midBase, p2: apex },
          foot: midBase,
          labelPos: { x: (midBase.x + apex.x) / 2, y: (midBase.y + apex.y) / 2 },
          text: options.heightText
        };
      }
    }

    // Right-angle markers
    const rightAngleMarkers = [];
    if (options.showRightAngleB && shapeB.vertices.length === 3) {
      // Right triangle Q9
      const v = shapeB.vertices;
      // Vertices of Q9 triangle: find the vertex with 90° interior angle
      for (let i = 0; i < 3; i++) {
        const prev = v[(i + 2) % 3];
        const curr = v[i];
        const next = v[(i + 1) % 3];

        const v1 = { x: prev.x - curr.x, y: prev.y - curr.y };
        const v2 = { x: next.x - curr.x, y: next.y - curr.y };
        const dot = v1.x * v2.x + v1.y * v2.y;
        const mag1 = Math.hypot(v1.x, v1.y);
        const mag2 = Math.hypot(v2.x, v2.y);

        if (Math.abs(dot / (mag1 * mag2)) < 1e-3) { // 90 degrees
          rightAngleMarkers.push({
            vertex: curr,
            v1: { x: v1.x / mag1, y: v1.y / mag1 },
            v2: { x: v2.x / mag2, y: v2.y / mag2 }
          });
          break;
        }
      }
    }

    // Compute bounding box
    const allVerts = [...shapeA.vertices, ...shapeB.vertices];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    allVerts.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });

    return {
      shapeA: shapeA,
      shapeB: shapeB,
      sharedSegment: sharedSegment,
      sideLabels: sideLabels,
      heightInfo: heightInfo,
      rightAngleMarkers: rightAngleMarkers,
      bounds: { minX, maxX, minY, maxY, width: maxX - minX, height: maxY - minY }
    };
  }

  return {
    layoutComposite: layoutComposite
  };
}));
