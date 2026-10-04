/**
 * js/lab.js
 * Interactive UI, SVG rendering, pointer events, and live info updates for World 1: Shape Lab.
 */

(function () {
  'use strict';

  // SVG grid scale constant: 20 pixels = 1 cm
  const SCALE = 20;

  // App state
  let placedShapes = []; // Array of { id, shape, initialX, initialY, label }
  let activeShapeId = null;
  let dragOffset = { x: 0, y: 0 };
  let isDragging = false;
  let lastTapTime = 0;
  let nextShapeId = 1;

  // View toggles
  let showSharedSide = false;
  let showOuterSides = false;

  // DOM Elements
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const sideLengthSelect = document.getElementById('side-length-select');
  const regularShapesGrid = document.getElementById('regular-shapes-grid');
  const rectanglesGrid = document.getElementById('rectangles-grid');
  const trianglesGrid = document.getElementById('triangles-grid');
  const svgPlayArea = document.getElementById('play-area-svg');
  const svgOverlayLayer = document.getElementById('svg-overlay-layer');
  const svgShapesLayer = document.getElementById('svg-shapes-layer');
  const svgControlsLayer = document.getElementById('svg-controls-layer');
  const infoContent = document.getElementById('info-content');
  const btnShowShared = document.getElementById('btn-show-shared');
  const btnShowOuter = document.getElementById('btn-show-outer');
  const btnReset = document.getElementById('btn-reset');
  const toastEl = document.getElementById('lab-toast');
  const sparkleContainer = document.getElementById('sparkle-container');

  // --- Initialisation ---
  function init() {
    setupTabs();
    renderTray();
    setupPlayAreaPointerEvents();
    setupButtons();

    if (sideLengthSelect) {
      sideLengthSelect.addEventListener('change', renderRegularTray);
    }
  }

  // --- Tab Management ---
  function setupTabs() {
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.add('hidden'));

        btn.classList.add('active');
        const targetEl = document.getElementById(targetTab);
        if (targetEl) targetEl.classList.remove('hidden');
      });
    });
  }

  // --- Toast Notification ---
  function showToast(msg) {
    if (!toastEl) return;
    toastEl.textContent = msg;
    toastEl.classList.remove('hidden');
    setTimeout(() => {
      toastEl.classList.add('hidden');
    }, 3000);
  }

  // --- Shape Tray Rendering ---
  function renderTray() {
    renderRegularTray();
    renderRectanglesTray();
    renderTrianglesTray();
  }

  function createTrayItemSVG(shape, labelText, heightText) {
    const item = document.createElement('div');
    item.className = 'tray-item';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Add ${labelText}`);

    // Compute bounding box for centering in preview SVG
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    shape.vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });

    const width = maxX - minX;
    const height = maxY - minY;
    const padding = 1.2;
    const viewBox = `${(minX - padding) * SCALE} ${(minY - padding) * SCALE} ${(width + padding * 2) * SCALE} ${(height + padding * 2) * SCALE}`;

    let pointsStr = shape.vertices.map(v => `${v.x * SCALE},${v.y * SCALE}`).join(' ');

    let hTextHtml = heightText ? `<div class="tray-item-label" style="color:#e65100;">${heightText}</div>` : '';

    item.innerHTML = `
      <svg viewBox="${viewBox}">
        <polygon points="${pointsStr}" fill="#e3f2fd" stroke="#1565c0" stroke-width="2" />
      </svg>
      <div class="tray-item-label">${labelText}</div>
      ${hTextHtml}
    `;

    item.addEventListener('click', () => addShapeToPlayArea(shape, labelText));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        addShapeToPlayArea(shape, labelText);
      }
    });

    return item;
  }

  function renderRegularTray() {
    if (!regularShapesGrid) return;
    regularShapesGrid.innerHTML = '';
    const side = parseFloat(sideLengthSelect ? sideLengthSelect.value : 4);

    for (let n = 3; n <= 8; n++) {
      const shape = MathCore.regularPolygon(n, side, 0, 0);
      let hText = null;
      if (n === 3) {
        if (side === 4) hText = 'h = 3.5 cm';
        if (side === 8) hText = 'h = 7 cm';
      }
      const item = createTrayItemSVG(shape, `${shape.name} (${side}cm)`, hText);
      regularShapesGrid.appendChild(item);
    }
  }

  function renderRectanglesTray() {
    if (!rectanglesGrid) return;
    rectanglesGrid.innerHTML = '';
    const dims = [
      [4, 2], [5, 3], [6, 3],
      [6, 4], [8, 3], [8, 5]
    ];

    dims.forEach(([w, h]) => {
      const shape = MathCore.createRectangle(w, h, 0, 0);
      const item = createTrayItemSVG(shape, `rect ${w}x${h} cm`, null);
      rectanglesGrid.appendChild(item);
    });
  }

  function renderTrianglesTray() {
    if (!trianglesGrid) return;
    trianglesGrid.innerHTML = '';

    // 1. Right-angled 3-4-5
    const tri1 = MathCore.createRightTriangle(4, 3, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri1, 'right 3-4-5 cm', null));

    // 2. Right-angled 6-8-10
    const tri2 = MathCore.createRightTriangle(8, 6, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri2, 'right 6-8-10 cm', null));

    // 3. Right-angled 5-12-13
    const tri3 = MathCore.createRightTriangle(12, 5, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri3, 'right 5-12-13 cm', null));

    // 4. Isosceles base 6, equal 5, height 4
    const tri4 = MathCore.createIsoscelesTriangle(6, 4, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri4, 'isosceles 6x5x5 cm', 'h = 4 cm'));

    // 5. Isosceles base 8, equal 5, height 3
    const tri5 = MathCore.createIsoscelesTriangle(8, 3, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri5, 'isosceles 8x5x5 cm', 'h = 3 cm'));
  }

  // --- Workspace & Shape Placement ---
  function addShapeToPlayArea(rawShape, label) {
    if (placedShapes.length >= 2) {
      showToast('Only two shapes at a time! Remove one first.');
      return;
    }

    // Determine initial placement position in grid cm (centerish)
    const offsetX = placedShapes.length === 0 ? 4 : 14;
    const offsetY = 6;

    const initialShape = LabCore.translateShape(rawShape, offsetX, offsetY);

    // If there is already a shape placed, attempt edge snap on add
    let finalShape = initialShape;
    if (placedShapes.length === 1) {
      const snapped = LabCore.findEdgeSnap(initialShape, placedShapes[0].shape, 8.0);
      if (snapped) {
        finalShape = snapped;
        triggerSparkle();
      }
    }

    const shapeObj = {
      id: nextShapeId++,
      shape: finalShape,
      label: label
    };

    placedShapes.push(shapeObj);
    renderPlayArea();
    updateInfoPanel();
  }

  function removeShape(id) {
    placedShapes = placedShapes.filter(s => s.id !== id);
    renderPlayArea();
    updateInfoPanel();
  }

  function rotateShape90(id) {
    const item = placedShapes.find(s => s.id === id);
    if (!item) return;

    const rotated = LabCore.rotateShape90(item.shape);
    const other = placedShapes.find(s => s.id !== id);

    if (other && MathCore.shapesOverlap(rotated, other.shape)) {
      showToast('Shapes cannot overlap!');
      flashShapeError(id);
      return;
    }

    item.shape = rotated;

    // Check edge snap after rotate
    if (other) {
      const snapped = LabCore.findEdgeSnap(item.shape, other.shape, 2.0);
      if (snapped) {
        item.shape = snapped;
        triggerSparkle();
      }
    }

    renderPlayArea();
    updateInfoPanel();
  }

  function flipShape(id) {
    const item = placedShapes.find(s => s.id === id);
    if (!item) return;

    const flipped = LabCore.flipShape(item.shape);
    const other = placedShapes.find(s => s.id !== id);

    if (other && MathCore.shapesOverlap(flipped, other.shape)) {
      showToast('Shapes cannot overlap!');
      flashShapeError(id);
      return;
    }

    item.shape = flipped;

    if (other) {
      const snapped = LabCore.findEdgeSnap(item.shape, other.shape, 2.0);
      if (snapped) {
        item.shape = snapped;
        triggerSparkle();
      }
    }

    renderPlayArea();
    updateInfoPanel();
  }

  function flashShapeError(id) {
    const el = svgShapesLayer.querySelector(`[data-shape-id="${id}"]`);
    if (el) {
      el.classList.add('overlap-error');
      setTimeout(() => el.classList.remove('overlap-error'), 400);
    }
  }

  function triggerSparkle() {
    if (!sparkleContainer) return;
    sparkleContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'sparkle-pop';
      spark.style.left = `${30 + Math.random() * 40}%`;
      spark.style.top = `${30 + Math.random() * 40}%`;
      sparkleContainer.appendChild(spark);
    }
    setTimeout(() => {
      sparkleContainer.innerHTML = '';
    }, 700);
  }

  // --- SVG Play Area Rendering ---
  function renderPlayArea() {
    svgOverlayLayer.innerHTML = '';
    svgShapesLayer.innerHTML = '';
    svgControlsLayer.innerHTML = '';

    const isJoined = placedShapes.length === 2 && MathCore.sharedLength(placedShapes[0].shape, placedShapes[1].shape) > 0;

    // 1. Draw shapes
    placedShapes.forEach(item => {
      const shape = item.shape;
      const pointsStr = shape.vertices.map(v => `${v.x * SCALE},${v.y * SCALE}`).join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', pointsStr);
      polygon.setAttribute('class', `shape-polygon ${isJoined ? 'joined' : ''}`);
      polygon.setAttribute('data-shape-id', item.id);
      svgShapesLayer.appendChild(polygon);

      // Draw side labels on shape
      shape.edges.forEach(edge => {
        const midX = (edge.p1.x + edge.p2.x) / 2;
        const midY = (edge.p1.y + edge.p2.y) / 2;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX * SCALE);
        text.setAttribute('y', midY * SCALE);
        text.setAttribute('class', 'side-label-text');
        text.textContent = `${MathCore.formatNumber(edge.length)} cm`;
        svgShapesLayer.appendChild(text);
      });

      // Special height labels for equilateral triangles or isosceles triangles if applicable
      if (shape.type === 'equilateral triangle' && (shape.side === 4 || shape.side === 8)) {
        const centroid = getCentroid(shape.vertices);
        const hVal = shape.side === 4 ? 3.5 : 7;
        const hText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hText.setAttribute('x', centroid.x * SCALE);
        hText.setAttribute('y', centroid.y * SCALE);
        hText.setAttribute('class', 'height-label-text');
        hText.textContent = `h = ${hVal} cm`;
        svgShapesLayer.appendChild(hText);
      } else if (shape.type === 'isosceles triangle') {
        const centroid = getCentroid(shape.vertices);
        const hVal = shape.side === 6 ? 4 : 3;
        const hText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hText.setAttribute('x', centroid.x * SCALE);
        hText.setAttribute('y', centroid.y * SCALE);
        hText.setAttribute('class', 'height-label-text');
        hText.textContent = `h = ${hVal} cm`;
        svgShapesLayer.appendChild(hText);
      }

      // Draw action controls (x, rotate, flip) near top-right of shape bounding box
      renderShapeControls(item);
    });

    // 2. Overlay toggles (Shared Side / Outer Boundary)
    if (isJoined) {
      const sA = placedShapes[0].shape;
      const sB = placedShapes[1].shape;

      if (showSharedSide) {
        renderSharedSideOverlay(sA, sB);
      }

      if (showOuterSides) {
        renderOuterSidesOverlay(sA, sB);
      }
    }
  }

  function getCentroid(vertices) {
    let sumX = 0, sumY = 0;
    vertices.forEach(v => { sumX += v.x; sumY += v.y; });
    return { x: sumX / vertices.length, y: sumY / vertices.length };
  }

  function renderShapeControls(item) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity;
    item.shape.vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
    });

    const cx = (maxX + 0.5) * SCALE;
    const cy = (minY - 0.5) * SCALE;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${cx}, ${cy})`);

    // Remove (x)
    const btnRemove = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    btnRemove.setAttribute('class', 'shape-control-btn');
    btnRemove.innerHTML = `
      <circle cx="0" cy="0" r="12" fill="#d32f2f" />
      <text x="0" y="4" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">×</text>
    `;
    btnRemove.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      removeShape(item.id);
    });

    // Rotate 90
    const btnRot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    btnRot.setAttribute('class', 'shape-control-btn');
    btnRot.setAttribute('transform', 'translate(28, 0)');
    btnRot.innerHTML = `
      <circle cx="0" cy="0" r="12" fill="#1565c0" />
      <text x="0" y="4" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">↻</text>
    `;
    btnRot.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      rotateShape90(item.id);
    });

    // Flip
    const btnFlip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    btnFlip.setAttribute('class', 'shape-control-btn');
    btnFlip.setAttribute('transform', 'translate(56, 0)');
    btnFlip.innerHTML = `
      <circle cx="0" cy="0" r="12" fill="#6a1b9a" />
      <text x="0" y="4" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">⇄</text>
    `;
    btnFlip.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      flipShape(item.id);
    });

    group.appendChild(btnRemove);
    group.appendChild(btnRot);
    group.appendChild(btnFlip);

    svgControlsLayer.appendChild(group);
  }

  function renderSharedSideOverlay(A, B) {
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

        const cross = Math.abs(ux * by - uy * bx);
        if (cross > EPS) continue;

        const dist1 = Math.abs((eB.p1.x - eA.p1.x) * nx + (eB.p1.y - eA.p1.y) * ny);
        const dist2 = Math.abs((eB.p2.x - eA.p1.x) * nx + (eB.p2.y - eA.p1.y) * ny);
        if (dist1 > EPS || dist2 > EPS) continue;

        const t1 = (eB.p1.x - eA.p1.x) * ux + (eB.p1.y - eA.p1.y) * uy;
        const t2 = (eB.p2.x - eA.p1.x) * ux + (eB.p2.y - eA.p1.y) * uy;

        const minB = Math.min(t1, t2);
        const maxB = Math.max(t1, t2);

        const overlapStart = Math.max(0, minB);
        const overlapEnd = Math.min(lenA, maxB);

        const overlap = overlapEnd - overlapStart;
        if (overlap > EPS) {
          const sx1 = eA.p1.x + ux * overlapStart;
          const sy1 = eA.p1.y + uy * overlapStart;
          const sx2 = eA.p1.x + ux * overlapEnd;
          const sy2 = eA.p1.y + uy * overlapEnd;

          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', sx1 * SCALE);
          line.setAttribute('y1', sy1 * SCALE);
          line.setAttribute('x2', sx2 * SCALE);
          line.setAttribute('y2', sy2 * SCALE);
          line.setAttribute('class', 'shared-edge-line');
          svgOverlayLayer.appendChild(line);

          // Shared label
          const midX = (sx1 + sx2) / 2;
          const midY = (sy1 + sy2) / 2;
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', midX * SCALE);
          text.setAttribute('y', (midY - 0.4) * SCALE);
          text.setAttribute('fill', '#d32f2f');
          text.setAttribute('font-size', '14');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('text-anchor', 'middle');
          text.textContent = `Shared side (${MathCore.formatNumber(overlap)} cm): NOT counted in perimeter`;
          svgOverlayLayer.appendChild(text);
        }
      }
    }
  }

  function renderOuterSidesOverlay(A, B) {
    // Draw outer boundary in bold blue line
    // Collect outer edge segments
    const outerSegments = getOuterEdgeSegments(A, B);
    outerSegments.forEach(seg => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', seg.p1.x * SCALE);
      line.setAttribute('y1', seg.p1.y * SCALE);
      line.setAttribute('x2', seg.p2.x * SCALE);
      line.setAttribute('y2', seg.p2.y * SCALE);
      line.setAttribute('class', 'outer-edge-line');
      svgOverlayLayer.appendChild(line);
    });
  }

  function getOuterEdgeSegments(A, B) {
    const EPS = 1e-6;
    const outerSegments = [];

    const processEdges = (shape, other) => {
      for (const edge of shape.edges) {
        const ax = edge.p2.x - edge.p1.x;
        const ay = edge.p2.y - edge.p1.y;
        const lenA = Math.hypot(ax, ay);
        if (lenA < EPS) continue;
        const ux = ax / lenA;
        const uy = ay / lenA;
        const nx = -uy;
        const ny = ux;

        // Find overlaps with other's edges
        let overlaps = [];
        for (const eB of other.edges) {
          const bx = eB.p2.x - eB.p1.x;
          const by = eB.p2.y - eB.p1.y;
          const lenB = Math.hypot(bx, by);
          if (lenB < EPS) continue;

          const cross = Math.abs(ux * by - uy * bx);
          if (cross > EPS) continue;

          const dist1 = Math.abs((eB.p1.x - edge.p1.x) * nx + (eB.p1.y - edge.p1.y) * ny);
          const dist2 = Math.abs((eB.p2.x - edge.p1.x) * nx + (eB.p2.y - edge.p1.y) * ny);
          if (dist1 > EPS || dist2 > EPS) continue;

          const t1 = (eB.p1.x - edge.p1.x) * ux + (eB.p1.y - edge.p1.y) * uy;
          const t2 = (eB.p2.x - edge.p1.x) * ux + (eB.p2.y - edge.p1.y) * uy;

          const minB = Math.min(t1, t2);
          const maxB = Math.max(t1, t2);

          const start = Math.max(0, minB);
          const end = Math.min(lenA, maxB);

          if (end - start > EPS) {
            overlaps.push([start, end]);
          }
        }

        // Subtract overlaps from [0, lenA]
        if (overlaps.length === 0) {
          outerSegments.push({ p1: edge.p1, p2: edge.p2, length: lenA });
        } else {
          // Sort overlaps
          overlaps.sort((a, b) => a[0] - b[0]);
          let current = 0;
          for (const [s, e] of overlaps) {
            if (s - current > EPS) {
              outerSegments.push({
                p1: { x: edge.p1.x + ux * current, y: edge.p1.y + uy * current },
                p2: { x: edge.p1.x + ux * s, y: edge.p1.y + uy * s },
                length: s - current
              });
            }
            current = Math.max(current, e);
          }
          if (lenA - current > EPS) {
            outerSegments.push({
              p1: { x: edge.p1.x + ux * current, y: edge.p1.y + uy * current },
              p2: { x: edge.p1.x + ux * lenA, y: edge.p1.y + uy * lenA },
              length: lenA - current
            });
          }
        }
      }
    };

    processEdges(A, B);
    processEdges(B, A);

    return outerSegments;
  }

  // --- Pointer Events for Dragging & Snapping ---
  function setupPlayAreaPointerEvents() {
    if (!svgPlayArea) return;

    svgPlayArea.addEventListener('pointerdown', handlePointerDown);
    svgPlayArea.addEventListener('pointermove', handlePointerMove);
    svgPlayArea.addEventListener('pointerup', handlePointerUp);
    svgPlayArea.addEventListener('pointercancel', handlePointerUp);
  }

  function getSVGPoint(e) {
    const rect = svgPlayArea.getBoundingClientRect();
    const xPx = (e.clientX - rect.left) * (600 / rect.width);
    const yPx = (e.clientY - rect.top) * (500 / rect.height);
    return { x: xPx / SCALE, y: yPx / SCALE };
  }

  function handlePointerDown(e) {
    const target = e.target.closest('[data-shape-id]');
    if (!target) return;

    const id = parseInt(target.getAttribute('data-shape-id'), 10);
    const item = placedShapes.find(s => s.id === id);
    if (!item) return;

    // Double tap detection
    const now = Date.now();
    if (activeShapeId === id && now - lastTapTime < 300) {
      rotateShape90(id);
      lastTapTime = 0;
      return;
    }
    lastTapTime = now;

    activeShapeId = id;
    isDragging = true;
    svgPlayArea.setPointerCapture(e.pointerId);

    const pt = getSVGPoint(e);
    // Calculate dragOffset relative to first vertex of shape
    dragOffset = {
      x: pt.x - item.shape.vertices[0].x,
      y: pt.y - item.shape.vertices[0].y
    };
  }

  function handlePointerMove(e) {
    if (!isDragging || !activeShapeId) return;

    const item = placedShapes.find(s => s.id === activeShapeId);
    if (!item) return;

    const pt = getSVGPoint(e);
    let newX1 = pt.x - dragOffset.x;
    let newY1 = pt.y - dragOffset.y;

    // Apply grid snap to 0.5 cm
    newX1 = LabCore.snapToGrid(newX1, 0.5);
    newY1 = LabCore.snapToGrid(newY1, 0.5);

    const dx = newX1 - item.shape.vertices[0].x;
    const dy = newY1 - item.shape.vertices[0].y;

    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return;

    item.shape = LabCore.translateShape(item.shape, dx, dy);
    renderPlayArea();
  }

  function handlePointerUp(e) {
    if (!isDragging || !activeShapeId) return;

    isDragging = false;

    const item = placedShapes.find(s => s.id === activeShapeId);
    const other = placedShapes.find(s => s.id !== activeShapeId);

    if (item && other) {
      // 1. Check overlap
      if (MathCore.shapesOverlap(item.shape, other.shape)) {
        showToast('Shapes cannot overlap!');
        flashShapeError(item.id);
      } else {
        // 2. Check edge snap
        const snapped = LabCore.findEdgeSnap(item.shape, other.shape, 1.5);
        if (snapped) {
          item.shape = snapped;
          triggerSparkle();
        }
      }
    }

    activeShapeId = null;
    renderPlayArea();
    updateInfoPanel();
  }

  // --- Info Panel Updates ---
  function updateInfoPanel() {
    const isJoined = placedShapes.length === 2 && MathCore.sharedLength(placedShapes[0].shape, placedShapes[1].shape) > 0;

    btnShowShared.disabled = !isJoined;
    btnShowOuter.disabled = !isJoined;

    if (!isJoined) {
      infoContent.innerHTML = `
        <div class="info-empty-card">
          <p>👉 Drag or tap 2 shapes to join them together so they touch along a side.</p>
        </div>
      `;
      return;
    }

    const sA = placedShapes[0].shape;
    const sB = placedShapes[1].shape;

    const shared = MathCore.sharedLength(sA, sB);
    const p1 = sA.perimeter;
    const p2 = sB.perimeter;
    const totalP = MathCore.compositePerimeter(sA, sB);

    // Outer edge terms for formula display
    const outerSegs = getOuterEdgeSegments(sA, sB);
    const outerSumStr = outerSegs.map(s => MathCore.formatNumber(s.length)).join(' + ') + ` = ${totalP} cm`;

    // Perimeter Card (BLUE)
    let pCardHtml = `
      <div class="info-card info-card-blue">
        <div class="info-card-title">📏 Perimeter</div>
        <div class="info-card-working">Formula: P1 + P2 - (2 × shared side)</div>
        <div class="info-card-working">${MathCore.formatNumber(p1)} + ${MathCore.formatNumber(p2)} - (2 × ${MathCore.formatNumber(shared)}) = ${totalP} cm</div>
        <div class="info-card-result">Composite Perimeter = ${totalP} cm</div>
        <div class="info-card-explain">Count only the OUTER sides: ${outerSumStr}</div>
      </div>
    `;

    // Area Card (GREEN or Grey)
    let aCardHtml = '';
    const totalA = MathCore.compositeArea(sA, sB);

    if (totalA !== null) {
      aCardHtml = `
        <div class="info-card info-card-green">
          <div class="info-card-title">🟩 Area</div>
          <div class="info-card-working">Formula: Area 1 + Area 2</div>
          <div class="info-card-working">${MathCore.formatNumber(sA.area)} + ${MathCore.formatNumber(sB.area)} = ${totalA} cm²</div>
          <div class="info-card-result">Total Area = ${totalA} cm²</div>
        </div>
      `;
    } else {
      aCardHtml = `
        <div class="info-card info-card-grey">
          <div class="info-card-title">🟩 Area</div>
          <p class="info-card-explain">Area of this shape is for older students. Try perimeter!</p>
        </div>
      `;
    }

    infoContent.innerHTML = pCardHtml + aCardHtml;
  }

  // --- Controls & Reset ---
  function setupButtons() {
    if (btnReset) {
      btnReset.addEventListener('click', () => {
        placedShapes = [];
        showSharedSide = false;
        showOuterSides = false;
        btnShowShared.classList.remove('btn-primary');
        btnShowOuter.classList.remove('btn-primary');
        renderPlayArea();
        updateInfoPanel();
      });
    }

    if (btnShowShared) {
      btnShowShared.addEventListener('click', () => {
        showSharedSide = !showSharedSide;
        btnShowShared.classList.toggle('btn-primary', showSharedSide);
        renderPlayArea();
      });
    }

    if (btnShowOuter) {
      btnShowOuter.addEventListener('click', () => {
        showOuterSides = !showOuterSides;
        btnShowOuter.classList.toggle('btn-primary', showOuterSides);
        renderPlayArea();
      });
    }
  }

  // Start app
  document.addEventListener('DOMContentLoaded', init);
})();
