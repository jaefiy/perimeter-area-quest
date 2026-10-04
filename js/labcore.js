/**
 * js/labcore.js
 * Pure logic for World 1: Shape Lab.
 * UMD wrapper supports Node.js testing and browser usage.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./mathcore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    const MathCore = require('./mathcore');
    module.exports = factory(MathCore);
  } else {
    root.LabCore = factory(root.MathCore);
  }
}(typeof self !== 'undefined' ? self : this, function (MathCore) {
  'use strict';

  function snapToGrid(value) {
    return Math.round(value);
  }

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

  function translateShape(shape, dx, dy) {
    const newVertices = shape.vertices.map(v => ({
      x: Math.round((v.x + dx) * 10000) / 10000,
      y: Math.round((v.y + dy) * 10000) / 10000
    }));

    return {
      ...shape,
      vertices: newVertices,
      edges: buildEdges(newVertices)
    };
  }

  function rotateShape90(shape) {
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const v of shape.vertices) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    }
    const height = maxY - minY;

    const newVertices = shape.vertices.map(v => {
      const rx = minX + (height - (v.y - minY));
      const ry = minY + (v.x - minX);
      return {
        x: Math.round(rx * 10000) / 10000,
        y: Math.round(ry * 10000) / 10000
      };
    });

    return {
      ...shape,
      vertices: newVertices,
      edges: buildEdges(newVertices)
    };
  }

  function flipShape(shape) {
    let minX = Infinity, maxX = -Infinity;
    for (const v of shape.vertices) {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
    }

    const newVertices = shape.vertices.map(v => ({
      x: Math.round((minX + maxX - v.x) * 10000) / 10000,
      y: v.y
    }));

    return {
      ...shape,
      vertices: newVertices,
      edges: buildEdges(newVertices)
    };
  }

  /**
   * Finds the snap offset (dx, dy) to move movingShape flush against otherShape if within threshold.
   * threshold defaults to 0.5 cm.
   */
  function findSnapOffset(movingShape, otherShape, threshold = 0.5) {
    let bestOffset = { dx: 0, dy: 0 };
    let minDistance = Infinity;

    // Collect candidate dx, dy offsets
    const candidateOffsets = [];

    // 1. Check vertical edge alignments
    for (const eM of movingShape.edges) {
      if (!eM.isVertical) continue;
      const xM = eM.p1.x;
      for (const eO of otherShape.edges) {
        if (!eO.isVertical) continue;
        const xO = eO.p1.x;
        const dx = Math.round((xO - xM) * 10000) / 10000;
        if (Math.abs(dx) <= threshold + 1e-7) {
          candidateOffsets.push({ dx, dy: 0 });
        }
      }
    }

    // 2. Check horizontal edge alignments
    for (const eM of movingShape.edges) {
      if (!eM.isHorizontal) continue;
      const yM = eM.p1.y;
      for (const eO of otherShape.edges) {
        if (!eO.isHorizontal) continue;
        const yO = eO.p1.y;
        const dy = Math.round((yO - yM) * 10000) / 10000;
        if (Math.abs(dy) <= threshold + 1e-7) {
          candidateOffsets.push({ dx: 0, dy });
        }
      }
    }

    // Evaluate each candidate offset
    for (const cand of candidateOffsets) {
      const dist = Math.hypot(cand.dx, cand.dy);
      if (dist > threshold + 1e-7) continue;

      const testShape = translateShape(movingShape, cand.dx, cand.dy);
      if (!MathCore.shapesOverlap(testShape, otherShape)) {
        const sLen = MathCore.sharedLength(testShape, otherShape);
        if (sLen > 0) {
          if (dist < minDistance) {
            minDistance = dist;
            bestOffset = cand;
          }
        }
      }
    }

    return bestOffset;
  }

  /**
   * Analyzes edges of shape A and B to split them into shared segments and outer segments.
   */
  function getSharedAndOuterSegments(A, B) {
    const sharedSegments = [];
    const outerSegments = [];

    function processShape(shape1, shape2, isA) {
      for (const e of shape1.edges) {
        if (e.isSloped) {
          outerSegments.push({
            p1: e.p1,
            p2: e.p2,
            length: e.length
          });
          continue;
        }

        // Collect overlapping intervals along e with horizontal/vertical edges of shape2
        const overlaps = []; // array of [t0, t1] in [0, 1]

        for (const e2 of shape2.edges) {
          if (e2.isSloped) continue;

          if (e.isHorizontal && e2.isHorizontal && Math.abs(e.p1.y - e2.p1.y) < 1e-7) {
            const min1 = Math.min(e.p1.x, e.p2.x);
            const max1 = Math.max(e.p1.x, e.p2.x);
            const min2 = Math.min(e2.p1.x, e2.p2.x);
            const max2 = Math.max(e2.p1.x, e2.p2.x);

            const oMin = Math.max(min1, min2);
            const oMax = Math.min(max1, max2);

            if (oMax - oMin > 1e-7) {
              const totalLen = Math.abs(e.p2.x - e.p1.x);
              const t0 = (oMin - Math.min(e.p1.x, e.p2.x)) / totalLen;
              const t1 = (oMax - Math.min(e.p1.x, e.p2.x)) / totalLen;
              overlaps.push([t0, t1]);
            }
          } else if (e.isVertical && e2.isVertical && Math.abs(e.p1.x - e2.p1.x) < 1e-7) {
            const min1 = Math.min(e.p1.y, e.p2.y);
            const max1 = Math.max(e.p1.y, e.p2.y);
            const min2 = Math.min(e2.p1.y, e2.p2.y);
            const max2 = Math.max(e2.p1.y, e2.p2.y);

            const oMin = Math.max(min1, min2);
            const oMax = Math.min(max1, max2);

            if (oMax - oMin > 1e-7) {
              const totalLen = Math.abs(e.p2.y - e.p1.y);
              const t0 = (oMin - Math.min(e.p1.y, e.p2.y)) / totalLen;
              const t1 = (oMax - Math.min(e.p1.y, e.p2.y)) / totalLen;
              overlaps.push([t0, t1]);
            }
          }
        }

        if (overlaps.length === 0) {
          outerSegments.push({
            p1: e.p1,
            p2: e.p2,
            length: e.length
          });
        } else {
          // Merge overlaps
          overlaps.sort((a, b) => a[0] - b[0]);
          const merged = [];
          for (const interval of overlaps) {
            if (merged.length === 0) {
              merged.push(interval);
            } else {
              const last = merged[merged.length - 1];
              if (interval[0] <= last[1] + 1e-7) {
                last[1] = Math.max(last[1], interval[1]);
              } else {
                merged.push(interval);
              }
            }
          }

          const startX = Math.min(e.p1.x, e.p2.x);
          const startY = Math.min(e.p1.y, e.p2.y);
          const isH = e.isHorizontal;

          let currentCoord = isH ? startX : startY;
          const endCoord = isH ? Math.max(e.p1.x, e.p2.x) : Math.max(e.p1.y, e.p2.y);

          for (const [t0, t1] of merged) {
            const segStartCoord = (isH ? startX : startY) + t0 * (endCoord - (isH ? startX : startY));
            const segEndCoord = (isH ? startX : startY) + t1 * (endCoord - (isH ? startX : startY));

            if (segStartCoord - currentCoord > 1e-7) {
              const p1 = isH ? { x: currentCoord, y: e.p1.y } : { x: e.p1.x, y: currentCoord };
              const p2 = isH ? { x: segStartCoord, y: e.p1.y } : { x: e.p1.x, y: segStartCoord };
              outerSegments.push({ p1, p2, length: Math.round((segStartCoord - currentCoord) * 10000) / 10000 });
            }

            // Push shared segment only for shape A to avoid duplicates
            if (isA) {
              const p1 = isH ? { x: segStartCoord, y: e.p1.y } : { x: e.p1.x, y: segStartCoord };
              const p2 = isH ? { x: segEndCoord, y: e.p1.y } : { x: e.p1.x, y: segEndCoord };
              sharedSegments.push({ p1, p2, length: Math.round((segEndCoord - segStartCoord) * 10000) / 10000 });
            }

            currentCoord = segEndCoord;
          }

          if (endCoord - currentCoord > 1e-7) {
            const p1 = isH ? { x: currentCoord, y: e.p1.y } : { x: e.p1.x, y: currentCoord };
            const p2 = isH ? { x: endCoord, y: e.p1.y } : { x: e.p1.x, y: endCoord };
            outerSegments.push({ p1, p2, length: Math.round((endCoord - currentCoord) * 10000) / 10000 });
          }
        }
      }
    }

    processShape(A, B, true);
    processShape(B, A, false);

    return { sharedSegments, outerSegments };
  }

  return {
    snapToGrid,
    translateShape,
    rotateShape90,
    flipShape,
    findSnapOffset,
    getSharedAndOuterSegments
  };
}));
