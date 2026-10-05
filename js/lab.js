/**
 * js/lab.js
 * Interactive UI, SVG rendering, pointer events, and live updates for World 1: Shape Lab.
 * Supports Tab 1 (Build and Discover), Tab 2 (Mission Time), and Tab 3 (Split It!).
 */

(function () {
  'use strict';

  // SVG grid scale constant: 20 pixels = 1 cm
  const SCALE = 20;

  // --- TAB 1 STATE ---
  let placedShapes = []; // Array of { id, shape, label }
  let activeShapeId = null;
  let dragOffset = { x: 0, y: 0 };
  let isDragging = false;
  let lastTapTime = 0;
  let nextShapeId = 1;
  let showSharedSide = false;
  let showOuterSides = false;

  // --- TAB 2 (MISSION TIME) STATE ---
  let currentMissionIndex = 0; // 0 to 7
  let missionPlacedShapes = [];
  let mActiveShapeId = null;
  let mDragOffset = { x: 0, y: 0 };
  let mIsDragging = false;
  let mNextShapeId = 1;

  let mAttemptCount = 0;
  let mUsedHint = false;
  let mMissionStars = [3, 3, 3, 3, 3, 3, 3, 3]; // stars achieved per mission
  let mCurrentStars = 3;

  // --- TAB 3 (SPLIT IT!) STATE ---
  let currentSplitIndex = 0; // 0 to 5
  let splitPoints = 0;
  let splitCardMatched = false;
  let selectedSplitCardTitle = null;

  // DOM Elements - Tab Common / Navigation
  const tabBtns = document.querySelectorAll('.tab-btn');
  const tabContents = document.querySelectorAll('.tab-content');
  const ziggyTipEl = document.getElementById('ziggy-tip');

  // DOM Elements - Tab 1
  const sideLengthSelect = document.getElementById('side-length-select');
  const regularShapesGrid = document.getElementById('regular-shapes-grid');
  const rectanglesGrid = document.getElementById('rectangles-grid');
  const trianglesGrid = document.getElementById('triangles-grid');
  const svgPlayArea = document.getElementById('play-area-svg');
  const svgOverlayLayer = document.getElementById('overlay-layer') || document.getElementById('svg-overlay-layer');
  const svgShapesLayer = document.getElementById('svg-shapes-layer');
  const svgControlsLayer = document.getElementById('svg-controls-layer');
  const sharedPillBanner = document.getElementById('shared-pill-banner');
  const sharedPillText = document.getElementById('shared-pill-text');
  const infoContent = document.getElementById('info-content');
  const btnShowShared = document.getElementById('btn-show-shared');
  const btnShowOuter = document.getElementById('btn-show-outer');
  const btnReset = document.getElementById('btn-reset');
  const toastEl = document.getElementById('lab-toast');
  const sparkleContainer = document.getElementById('sparkle-container');

  // DOM Elements - Tab 2
  const mToastEl = document.getElementById('m-toast');
  const mActiveContainer = document.getElementById('m-active-container');
  const mFinalScreen = document.getElementById('m-final-screen');
  const mFinalBadge = document.getElementById('m-final-badge');
  const mFinalStarsText = document.getElementById('m-final-stars-text');
  const mBtnRestart = document.getElementById('m-btn-restart');

  const mProgressLabel = document.getElementById('m-progress-label');
  const mProgressBarFill = document.getElementById('m-progress-bar-fill');
  const mTotalStarsVal = document.getElementById('m-total-stars-val');

  const mTitle = document.getElementById('m-title');
  const mStarsCurrent = document.getElementById('m-stars-current');
  const mPrompt = document.getElementById('m-prompt');
  const mAnswerInput = document.getElementById('m-answer-input');
  const mUnitLabel = document.getElementById('m-unit-label');
  const mBtnCheck = document.getElementById('m-btn-check');
  const mBtnHint = document.getElementById('m-btn-hint');
  const mHintBox = document.getElementById('m-hint-box');
  const mFeedbackBox = document.getElementById('m-feedback-box');

  const mSideSelect = document.getElementById('m-side-select');
  const mRegularGrid = document.getElementById('m-regular-grid');
  const mRectanglesGrid = document.getElementById('m-rectangles-grid');
  const mTrianglesGrid = document.getElementById('m-triangles-grid');

  const mSvgPlayArea = document.getElementById('m-play-area-svg');
  const mSvgOverlayLayer = document.getElementById('m-svg-overlay-layer');
  const mSvgShapesLayer = document.getElementById('m-svg-shapes-layer');
  const mSvgControlsLayer = document.getElementById('m-svg-controls-layer');
  const mBtnReset = document.getElementById('m-btn-reset');

  // DOM Elements - Tab 3
  const sToastEl = document.getElementById('s-toast');
  const sActiveContainer = document.getElementById('s-active-container');
  const sFinalScreen = document.getElementById('s-final-screen');
  const sFinalBadge = document.getElementById('s-final-badge');
  const sFinalScoreText = document.getElementById('s-final-score-text');
  const sBtnRestart = document.getElementById('s-btn-restart');

  const sProgressLabel = document.getElementById('s-progress-label');
  const sScoreVal = document.getElementById('s-score-val');
  const sShapeTitle = document.getElementById('s-shape-title');

  const sTargetDropzone = document.getElementById('s-target-dropzone');
  const sSvgCompositeLayer = document.getElementById('s-svg-composite-layer');
  const sSvgLabelsLayer = document.getElementById('s-svg-labels-layer');
  const sCardsList = document.getElementById('s-cards-list');

  const sAreaMcqBox = document.getElementById('s-area-mcq-box');
  const sMcqOptions = document.getElementById('s-mcq-options');
  const sFeedbackMsg = document.getElementById('s-feedback-msg');

  // --- Initialisation ---
  function init() {
    setupTabs();

    // Tab 1 setup
    renderTray();
    setupPlayAreaPointerEvents();
    setupButtons();
    if (sideLengthSelect) {
      sideLengthSelect.addEventListener('change', renderRegularTray);
    }

    // Tab 2 setup
    setupMissionPointerEvents();
    setupMissionControls();
    if (mSideSelect) {
      mSideSelect.addEventListener('change', renderMissionRegularTray);
    }

    // Tab 3 setup
    setupSplitControls();
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

        if (targetTab === 'tab-1') {
          if (ziggyTipEl) ziggyTipEl.textContent = '🌟 Ziggy says: "Try a pentagon and a hexagon with the same side!"';
        } else if (targetTab === 'tab-2') {
          if (ziggyTipEl) ziggyTipEl.textContent = '🌟 Ziggy says: "Build the shape and calculate perimeter or area!"';
          loadMission(currentMissionIndex);
        } else if (targetTab === 'tab-3') {
          if (ziggyTipEl) ziggyTipEl.textContent = '🌟 Ziggy says: "Split the composite shape into two basic shapes!"';
          loadSplitComposite(currentSplitIndex);
        }
      });
    });
  }

  // --- Toast Notification ---
  function showToast(msg, targetToast = toastEl) {
    if (!targetToast) return;
    targetToast.textContent = msg;
    targetToast.classList.remove('hidden');
    setTimeout(() => {
      targetToast.classList.add('hidden');
    }, 3000);
  }

  // Confetti generator
  function triggerConfetti() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
    for (let i = 0; i < 40; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti-piece';
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.animationDuration = (1.8 + Math.random() * 1.5) + 's';
      document.body.appendChild(conf);
      setTimeout(() => conf.remove(), 3000);
    }
  }

  // ==========================================================================
  // TAB 1: BUILD AND DISCOVER LOGIC
  // ==========================================================================

  function renderTray() {
    renderRegularTray();
    renderRectanglesTray();
    renderTrianglesTray();
  }

  function createTrayItemSVG(shape, labelText, heightText, onClickHandler) {
    const item = document.createElement('div');
    item.className = 'tray-item';
    item.setAttribute('tabindex', '0');
    item.setAttribute('role', 'button');
    item.setAttribute('aria-label', `Add ${labelText}`);

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

    item.addEventListener('click', () => onClickHandler(shape, labelText));
    item.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClickHandler(shape, labelText);
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
      const item = createTrayItemSVG(shape, `${shape.name} (${side}cm)`, hText, addShapeToPlayArea);
      regularShapesGrid.appendChild(item);
    }
  }

  function renderRectanglesTray() {
    if (!rectanglesGrid) return;
    rectanglesGrid.innerHTML = '';
    const dims = [[4, 2], [5, 3], [6, 3], [6, 4], [8, 3], [8, 5]];

    dims.forEach(([w, h]) => {
      const shape = MathCore.createRectangle(w, h, 0, 0);
      const item = createTrayItemSVG(shape, `rect ${w}x${h} cm`, null, addShapeToPlayArea);
      rectanglesGrid.appendChild(item);
    });
  }

  function renderTrianglesTray() {
    if (!trianglesGrid) return;
    trianglesGrid.innerHTML = '';

    const tri1 = MathCore.createRightTriangle(4, 3, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri1, 'right 3-4-5 cm', null, addShapeToPlayArea));

    const tri2 = MathCore.createRightTriangle(8, 6, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri2, 'right 6-8-10 cm', null, addShapeToPlayArea));

    const tri3 = MathCore.createRightTriangle(12, 5, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri3, 'right 5-12-13 cm', null, addShapeToPlayArea));

    const tri4 = MathCore.createIsoscelesTriangle(6, 4, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri4, 'isosceles 6x5x5 cm', 'h = 4 cm', addShapeToPlayArea));

    const tri5 = MathCore.createIsoscelesTriangle(8, 3, 0, 0);
    trianglesGrid.appendChild(createTrayItemSVG(tri5, 'isosceles 8x5x5 cm', 'h = 3 cm', addShapeToPlayArea));
  }

  function addShapeToPlayArea(rawShape, label) {
    const res = LabCore.addShapeToPlay(placedShapes, rawShape, { width: 30, height: 25 }, label);
    if (res && res.error === 'max-two') {
      showToast('Only two shapes at a time! Remove one first.');
      return;
    }
    if (res && res.error === 'no-space') {
      showToast('No space available in play area!');
      return;
    }

    placedShapes = res;
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

  function triggerSparkle(targetContainer = sparkleContainer) {
    if (!targetContainer) return;
    targetContainer.innerHTML = '';
    for (let i = 0; i < 6; i++) {
      const spark = document.createElement('div');
      spark.className = 'sparkle-pop';
      spark.style.left = `${30 + Math.random() * 40}%`;
      spark.style.top = `${30 + Math.random() * 40}%`;
      targetContainer.appendChild(spark);
    }
    setTimeout(() => {
      targetContainer.innerHTML = '';
    }, 700);
  }

  let prevJoinedState = false;

  function renderPlayArea() {
    svgOverlayLayer.innerHTML = '';
    svgShapesLayer.innerHTML = '';
    svgControlsLayer.innerHTML = '';

    const isJoined = placedShapes.length === 2 && MathCore.sharedLength(placedShapes[0].shape, placedShapes[1].shape) > 0;

    // Automatically show shared side as soon as 2 shapes are joined (default ON)
    if (isJoined && !prevJoinedState) {
      showSharedSide = true;
    } else if (!isJoined) {
      showSharedSide = false;
    }
    prevJoinedState = isJoined;

    // Update button text and state
    if (btnShowShared) {
      btnShowShared.disabled = !isJoined;
      btnShowShared.textContent = showSharedSide ? '🔴 Hide shared side' : '🔴 Show shared side';
      btnShowShared.classList.toggle('btn-primary', showSharedSide);
    }

    const sharedSegs = isJoined ? LabCore.getSharedSegments(placedShapes[0].shape, placedShapes[1].shape) : [];

    // Show or hide top HTML pill banner
    if (isJoined && showSharedSide && sharedSegs.length > 0) {
      const totalShared = sharedSegs.reduce((sum, s) => sum + s.length, 0);
      if (sharedPillText) {
        sharedPillText.textContent = `Shared side (${MathCore.formatNumber(totalShared)} cm): NOT counted in perimeter`;
      }
      if (sharedPillBanner) sharedPillBanner.classList.remove('hidden');
    } else {
      if (sharedPillBanner) sharedPillBanner.classList.add('hidden');
    }

    placedShapes.forEach(item => {
      const shape = item.shape;
      const pointsStr = shape.vertices.map(v => `${v.x * SCALE},${v.y * SCALE}`).join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', pointsStr);
      polygon.setAttribute('class', `shape-polygon ${isJoined ? 'joined' : ''}`);
      polygon.setAttribute('data-shape-id', item.id);
      svgShapesLayer.appendChild(polygon);

      const centroid = getCentroid(shape.vertices);

      shape.edges.forEach(edge => {
        // Check if edge is part of shared side
        const midX = (edge.p1.x + edge.p2.x) / 2;
        const midY = (edge.p1.y + edge.p2.y) / 2;

        let isSharedEdge = false;
        if (isJoined) {
          for (const seg of sharedSegs) {
            // Check if midpoint of edge lies on segment seg
            const dist = pointToSegmentDistance({ x: midX, y: midY }, { x: seg.x1, y: seg.y1 }, { x: seg.x2, y: seg.y2 });
            if (dist < 0.05) {
              isSharedEdge = true;
              break;
            }
          }
        }

        // Do not draw label on shared edge (the "shared" label covers it)
        if (!isSharedEdge) {
          // Offset 14px along outward normal
          const dx = edge.p2.x - edge.p1.x;
          const dy = edge.p2.y - edge.p1.y;
          const len = Math.hypot(dx, dy);

          if (len > 1e-6) {
            // Candidate normal vectors (unit length)
            let nx = -dy / len;
            let ny = dx / len;

            // Check direction relative to vector from centroid to midpoint
            const vX = midX - centroid.x;
            const vY = midY - centroid.y;
            if (nx * vX + ny * vY < 0) {
              nx = -nx;
              ny = -ny;
            }

            const labelX = midX * SCALE + nx * 14;
            const labelY = midY * SCALE + ny * 14;

            const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            text.setAttribute('x', labelX);
            text.setAttribute('y', labelY);
            text.setAttribute('class', 'side-label-text');
            text.textContent = `${MathCore.formatNumber(edge.length)} cm`;
            svgShapesLayer.appendChild(text);
          }
        }
      });

      if (shape.type === 'equilateral triangle' && (shape.side === 4 || shape.side === 8)) {
        const hVal = shape.side === 4 ? 3.5 : 7;
        const hText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hText.setAttribute('x', centroid.x * SCALE);
        hText.setAttribute('y', centroid.y * SCALE);
        hText.setAttribute('class', 'height-label-text');
        hText.textContent = `h = ${hVal} cm`;
        svgShapesLayer.appendChild(hText);
      } else if (shape.type === 'isosceles triangle') {
        const hVal = shape.side === 6 ? 4 : 3;
        const hText = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        hText.setAttribute('x', centroid.x * SCALE);
        hText.setAttribute('y', centroid.y * SCALE);
        hText.setAttribute('class', 'height-label-text');
        hText.textContent = `h = ${hVal} cm`;
        svgShapesLayer.appendChild(hText);
      }

      renderShapeControls(item, placedShapes);
    });

    if (isJoined) {
      const sA = placedShapes[0].shape;
      const sB = placedShapes[1].shape;

      if (showSharedSide) {
        renderSharedSideOverlay(sA, sB, svgOverlayLayer);
      }

      if (showOuterSides) {
        renderOuterSidesOverlay(sA, sB, svgOverlayLayer);
      }
    }
  }

  function pointToSegmentDistance(p, a, b) {
    const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
    if (l2 === 0) return Math.hypot(p.x - a.x, p.y - a.y);
    let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(p.x - (a.x + t * (b.x - a.x)), p.y - (a.y + t * (b.y - a.y)));
  }

  function getCentroid(vertices) {
    let sumX = 0, sumY = 0;
    vertices.forEach(v => { sumX += v.x; sumY += v.y; });
    return { x: sumX / vertices.length, y: sumY / vertices.length };
  }

  function renderShapeControls(item, allPlaced) {
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    item.shape.vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.x > maxX) maxX = v.x;
      if (v.y > maxY) maxY = v.y;
    });

    const otherItem = allPlaced ? allPlaced.find(s => s.id !== item.id) : null;
    const sharedSegs = otherItem ? LabCore.getSharedSegments(item.shape, otherItem.shape) : [];

    // Candidate corner positions in SVG px coordinates: [cx, cy]
    const candidates = [
      { x: (maxX + 0.5) * SCALE, y: (minY - 0.5) * SCALE }, // Top-Right
      { x: (minX - 2.5) * SCALE, y: (minY - 0.5) * SCALE }, // Top-Left
      { x: (maxX + 0.5) * SCALE, y: (maxY + 0.5) * SCALE }, // Bottom-Right
      { x: (minX - 2.5) * SCALE, y: (maxY + 0.5) * SCALE }  // Bottom-Left
    ];

    let chosenPos = candidates[0];

    if (otherItem) {
      for (const pos of candidates) {
        // Check distance to other shape centroid and shared segments
        const posCm = { x: pos.x / SCALE, y: pos.y / SCALE };
        let conflict = false;

        for (const seg of sharedSegs) {
          if (pointToSegmentDistance(posCm, { x: seg.x1, y: seg.y1 }, { x: seg.x2, y: seg.y2 }) < 1.0) {
            conflict = true;
            break;
          }
        }

        if (!conflict) {
          // Check if posCm is inside or very close to other shape
          const otherCentroid = getCentroid(otherItem.shape.vertices);
          if (Math.hypot(posCm.x - otherCentroid.x, posCm.y - otherCentroid.y) < 1.5) {
            conflict = true;
          }
        }

        if (!conflict) {
          chosenPos = pos;
          break;
        }
      }
    }

    const cx = chosenPos.x;
    const cy = chosenPos.y;

    const group = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    group.setAttribute('transform', `translate(${cx}, ${cy})`);

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

  function renderSharedSideOverlay(A, B, targetLayer) {
    const segments = LabCore.getSharedSegments(A, B);
    segments.forEach(seg => {
      // 1. White underlay line (stroke white, width 12)
      const underlay = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      underlay.setAttribute('x1', seg.x1 * SCALE);
      underlay.setAttribute('y1', seg.y1 * SCALE);
      underlay.setAttribute('x2', seg.x2 * SCALE);
      underlay.setAttribute('y2', seg.y2 * SCALE);
      underlay.setAttribute('stroke', '#ffffff');
      underlay.setAttribute('stroke-width', '12');
      underlay.setAttribute('stroke-linecap', 'round');
      targetLayer.appendChild(underlay);

      // 2. Red dashed line on top (stroke #d32f2f, width 7, dash 10 6, round caps, pulse animation)
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', seg.x1 * SCALE);
      line.setAttribute('y1', seg.y1 * SCALE);
      line.setAttribute('x2', seg.x2 * SCALE);
      line.setAttribute('y2', seg.y2 * SCALE);
      line.setAttribute('class', 'shared-edge-line shared-pulse');
      targetLayer.appendChild(line);

      // 3. Small label "shared" with white rounded background rectangle centred on segment
      const midX = ((seg.x1 + seg.x2) / 2) * SCALE;
      const midY = ((seg.y1 + seg.y2) / 2) * SCALE;

      const gLabel = document.createElementNS('http://www.w3.org/2000/svg', 'g');

      const bgRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      bgRect.setAttribute('x', midX - 30);
      bgRect.setAttribute('y', midY - 11);
      bgRect.setAttribute('width', '60');
      bgRect.setAttribute('height', '22');
      bgRect.setAttribute('rx', '5');
      bgRect.setAttribute('fill', '#ffffff');
      bgRect.setAttribute('stroke', '#d32f2f');
      bgRect.setAttribute('stroke-width', '1.5');
      gLabel.appendChild(bgRect);

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY);
      text.setAttribute('fill', '#d32f2f');
      text.setAttribute('font-size', '13');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.textContent = 'shared';
      gLabel.appendChild(text);

      targetLayer.appendChild(gLabel);
    });
  }

  function renderOuterSidesOverlay(A, B, targetLayer) {
    const outerSegments = getOuterEdgeSegments(A, B);
    outerSegments.forEach(seg => {
      const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
      line.setAttribute('x1', seg.p1.x * SCALE);
      line.setAttribute('y1', seg.p1.y * SCALE);
      line.setAttribute('x2', seg.p2.x * SCALE);
      line.setAttribute('y2', seg.p2.y * SCALE);
      line.setAttribute('class', 'outer-edge-line');
      targetLayer.appendChild(line);
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

        if (overlaps.length === 0) {
          outerSegments.push({ p1: edge.p1, p2: edge.p2, length: lenA });
        } else {
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

  function setupPlayAreaPointerEvents() {
    if (!svgPlayArea) return;
    svgPlayArea.addEventListener('pointerdown', handlePointerDown);
    svgPlayArea.addEventListener('pointermove', handlePointerMove);
    svgPlayArea.addEventListener('pointerup', handlePointerUp);
    svgPlayArea.addEventListener('pointercancel', handlePointerUp);
  }

  function getSVGPoint(e, targetSvg = svgPlayArea) {
    const rect = targetSvg.getBoundingClientRect();
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
      if (MathCore.shapesOverlap(item.shape, other.shape)) {
        showToast('Shapes cannot overlap!');
        flashShapeError(item.id);
      } else {
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

    const outerSegs = getOuterEdgeSegments(sA, sB);
    const outerSumStr = outerSegs.map(s => MathCore.formatNumber(s.length)).join(' + ') + ` = ${totalP} cm`;

    let pCardHtml = `
      <div class="info-card info-card-blue">
        <div class="info-card-title">📏 Perimeter</div>
        <div class="info-card-working">Formula: P1 + P2 - (2 × shared side)</div>
        <div class="info-card-working">${MathCore.formatNumber(p1)} + ${MathCore.formatNumber(p2)} - (2 × ${MathCore.formatNumber(shared)}) = ${totalP} cm</div>
        <div class="info-card-result">Composite Perimeter = ${totalP} cm</div>
        <div class="info-card-explain">Count only the OUTER sides: ${outerSumStr}</div>
      </div>
    `;

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

  // ==========================================================================
  // TAB 2: MISSION TIME LOGIC
  // ==========================================================================

  function renderMissionTray() {
    renderMissionRegularTray();
    renderMissionRectanglesTray();
    renderMissionTrianglesTray();
  }

  function renderMissionRegularTray() {
    if (!mRegularGrid) return;
    mRegularGrid.innerHTML = '';
    const side = parseFloat(mSideSelect ? mSideSelect.value : 4);

    for (let n = 3; n <= 8; n++) {
      const shape = MathCore.regularPolygon(n, side, 0, 0);
      let hText = null;
      if (n === 3) {
        if (side === 4) hText = 'h = 3.5 cm';
        if (side === 8) hText = 'h = 7 cm';
      }
      const item = createTrayItemSVG(shape, `${shape.name} (${side}cm)`, hText, addShapeToMissionPlayArea);
      mRegularGrid.appendChild(item);
    }
  }

  function renderMissionRectanglesTray() {
    if (!mRectanglesGrid) return;
    mRectanglesGrid.innerHTML = '';
    const dims = [[4, 2], [5, 3], [6, 3], [6, 4], [7, 3], [8, 3], [8, 5]];

    dims.forEach(([w, h]) => {
      const shape = MathCore.createRectangle(w, h, 0, 0);
      const item = createTrayItemSVG(shape, `rect ${w}x${h} cm`, null, addShapeToMissionPlayArea);
      mRectanglesGrid.appendChild(item);
    });
  }

  function renderMissionTrianglesTray() {
    if (!mTrianglesGrid) return;
    mTrianglesGrid.innerHTML = '';

    const tri1 = MathCore.createRightTriangle(3, 4, 0, 0);
    mTrianglesGrid.appendChild(createTrayItemSVG(tri1, 'right 3-4-5 cm', null, addShapeToMissionPlayArea));

    const tri2 = MathCore.createIsoscelesTriangle(6, 4, 0, 0);
    mTrianglesGrid.appendChild(createTrayItemSVG(tri2, 'isosceles 6x5x5 cm', 'h = 4 cm', addShapeToMissionPlayArea));
  }

  function handleCheckClick() {
    checkCurrentMission();
  }

  function handleInputKeydown(e) {
    if (e.key === 'Enter') {
      e.preventDefault();
      checkCurrentMission();
    }
  }

  function loadMission(index) {
    if (!window.Missions) return;

    if (index >= Missions.missionsList.length) {
      showMissionFinalScreen();
      return;
    }

    if (mActiveContainer) mActiveContainer.classList.remove('hidden');
    if (mFinalScreen) mFinalScreen.classList.add('hidden');

    currentMissionIndex = index;
    mAttemptCount = 0;
    mUsedHint = false;
    mCurrentStars = 3;
    missionPlacedShapes = [];

    const mission = Missions.getMission(Missions.missionsList[index].id);

    if (mProgressLabel) mProgressLabel.textContent = `Mission ${index + 1} of ${Missions.missionsList.length}`;
    if (mProgressBarFill) mProgressBarFill.style.width = `${((index + 1) / Missions.missionsList.length) * 100}%`;

    updateTotalStarsDisplay();

    if (mTitle) mTitle.textContent = mission.title;
    if (mPrompt) mPrompt.textContent = mission.prompt;
    if (mUnitLabel) mUnitLabel.textContent = mission.unit;
    if (mAnswerInput) {
      mAnswerInput.value = '';
      mAnswerInput.disabled = false;
      mAnswerInput.removeEventListener('keydown', handleInputKeydown);
      mAnswerInput.addEventListener('keydown', handleInputKeydown);
    }

    if (mBtnCheck) {
      mBtnCheck.removeEventListener('click', handleCheckClick);
      mBtnCheck.addEventListener('click', handleCheckClick);
    }

    if (mHintBox) {
      mHintBox.textContent = '';
      mHintBox.classList.add('hidden');
    }
    if (mFeedbackBox) {
      mFeedbackBox.textContent = '';
      mFeedbackBox.classList.add('hidden');
      mFeedbackBox.className = 'm-feedback-box hidden';
    }

    updateCurrentMissionStarsDisplay();
    renderMissionTray();
    renderMissionPlayArea();
  }

  function updateCurrentMissionStarsDisplay() {
    if (!mStarsCurrent) return;
    let starsStr = '';
    for (let i = 0; i < mCurrentStars; i++) starsStr += '⭐ ';
    for (let i = mCurrentStars; i < 3; i++) starsStr += '☆ ';
    mStarsCurrent.textContent = starsStr.trim();
  }

  function updateTotalStarsDisplay() {
    if (!mTotalStarsVal) return;
    const total = mMissionStars.reduce((a, b) => a + b, 0);
    mTotalStarsVal.textContent = `⭐ ${total}/24`;
  }

  function addShapeToMissionPlayArea(rawShape, label) {
    const res = LabCore.addShapeToPlay(missionPlacedShapes, rawShape, { width: 30, height: 25 }, label);
    if (res && res.error === 'max-two') {
      showToast('Only two shapes at a time! Remove one first.', mToastEl);
      return;
    }
    if (res && res.error === 'no-space') {
      showToast('No space available in play area!', mToastEl);
      return;
    }

    missionPlacedShapes = res;
    renderMissionPlayArea();
  }

  function removeMissionShape(id) {
    missionPlacedShapes = missionPlacedShapes.filter(s => s.id !== id);
    renderMissionPlayArea();
  }

  function rotateMissionShape90(id) {
    const item = missionPlacedShapes.find(s => s.id === id);
    if (!item) return;

    const rotated = LabCore.rotateShape90(item.shape);
    const other = missionPlacedShapes.find(s => s.id !== id);

    if (other && MathCore.shapesOverlap(rotated, other.shape)) {
      showToast('Shapes cannot overlap!', mToastEl);
      return;
    }

    item.shape = rotated;

    if (other) {
      const snapped = LabCore.findEdgeSnap(item.shape, other.shape, 2.0);
      if (snapped) {
        item.shape = snapped;
        triggerSparkle(mSparkleContainer);
      }
    }

    renderMissionPlayArea();
  }

  function flipMissionShape(id) {
    const item = missionPlacedShapes.find(s => s.id === id);
    if (!item) return;

    const flipped = LabCore.flipShape(item.shape);
    const other = missionPlacedShapes.find(s => s.id !== id);

    if (other && MathCore.shapesOverlap(flipped, other.shape)) {
      showToast('Shapes cannot overlap!', mToastEl);
      return;
    }

    item.shape = flipped;

    if (other) {
      const snapped = LabCore.findEdgeSnap(item.shape, other.shape, 2.0);
      if (snapped) {
        item.shape = snapped;
        triggerSparkle(mSparkleContainer);
      }
    }

    renderMissionPlayArea();
  }

  function renderMissionPlayArea() {
    mSvgOverlayLayer.innerHTML = '';
    mSvgShapesLayer.innerHTML = '';
    mSvgControlsLayer.innerHTML = '';

    const isJoined = missionPlacedShapes.length === 2 && MathCore.sharedLength(missionPlacedShapes[0].shape, missionPlacedShapes[1].shape) > 0;

    missionPlacedShapes.forEach(item => {
      const shape = item.shape;
      const pointsStr = shape.vertices.map(v => `${v.x * SCALE},${v.y * SCALE}`).join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', pointsStr);
      polygon.setAttribute('class', `shape-polygon ${isJoined ? 'joined' : ''}`);
      polygon.setAttribute('data-shape-id', item.id);
      mSvgShapesLayer.appendChild(polygon);

      shape.edges.forEach(edge => {
        const midX = (edge.p1.x + edge.p2.x) / 2;
        const midY = (edge.p1.y + edge.p2.y) / 2;

        const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        text.setAttribute('x', midX * SCALE);
        text.setAttribute('y', midY * SCALE);
        text.setAttribute('class', 'side-label-text');
        text.textContent = `${MathCore.formatNumber(edge.length)} cm`;
        mSvgShapesLayer.appendChild(text);
      });

      renderMissionShapeControls(item);
    });
  }

  function renderMissionShapeControls(item) {
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

    const btnRemove = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    btnRemove.setAttribute('class', 'shape-control-btn');
    btnRemove.innerHTML = `
      <circle cx="0" cy="0" r="12" fill="#d32f2f" />
      <text x="0" y="4" fill="#fff" font-size="14" font-weight="bold" text-anchor="middle">×</text>
    `;
    btnRemove.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      removeMissionShape(item.id);
    });

    const btnRot = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    btnRot.setAttribute('class', 'shape-control-btn');
    btnRot.setAttribute('transform', 'translate(28, 0)');
    btnRot.innerHTML = `
      <circle cx="0" cy="0" r="12" fill="#1565c0" />
      <text x="0" y="4" fill="#fff" font-size="12" font-weight="bold" text-anchor="middle">↻</text>
    `;
    btnRot.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      rotateMissionShape90(item.id);
    });

    const btnFlip = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    btnFlip.setAttribute('class', 'shape-control-btn');
    btnFlip.setAttribute('transform', 'translate(56, 0)');
    btnFlip.innerHTML = `
      <circle cx="0" cy="0" r="12" fill="#6a1b9a" />
      <text x="0" y="4" fill="#fff" font-size="11" font-weight="bold" text-anchor="middle">⇄</text>
    `;
    btnFlip.addEventListener('pointerdown', (e) => {
      e.stopPropagation();
      flipMissionShape(item.id);
    });

    group.appendChild(btnRemove);
    group.appendChild(btnRot);
    group.appendChild(btnFlip);

    mSvgControlsLayer.appendChild(group);
  }

  function setupMissionPointerEvents() {
    if (!mSvgPlayArea) return;
    mSvgPlayArea.addEventListener('pointerdown', handleMissionPointerDown);
    mSvgPlayArea.addEventListener('pointermove', handleMissionPointerMove);
    mSvgPlayArea.addEventListener('pointerup', handleMissionPointerUp);
    mSvgPlayArea.addEventListener('pointercancel', handleMissionPointerUp);
  }

  function handleMissionPointerDown(e) {
    const target = e.target.closest('[data-shape-id]');
    if (!target) return;

    const id = parseInt(target.getAttribute('data-shape-id'), 10);
    const item = missionPlacedShapes.find(s => s.id === id);
    if (!item) return;

    mActiveShapeId = id;
    mIsDragging = true;
    mSvgPlayArea.setPointerCapture(e.pointerId);

    const pt = getSVGPoint(e, mSvgPlayArea);
    mDragOffset = {
      x: pt.x - item.shape.vertices[0].x,
      y: pt.y - item.shape.vertices[0].y
    };
  }

  function handleMissionPointerMove(e) {
    if (!mIsDragging || !mActiveShapeId) return;

    const item = missionPlacedShapes.find(s => s.id === mActiveShapeId);
    if (!item) return;

    const pt = getSVGPoint(e, mSvgPlayArea);
    let newX1 = pt.x - mDragOffset.x;
    let newY1 = pt.y - mDragOffset.y;

    newX1 = LabCore.snapToGrid(newX1, 0.5);
    newY1 = LabCore.snapToGrid(newY1, 0.5);

    const dx = newX1 - item.shape.vertices[0].x;
    const dy = newY1 - item.shape.vertices[0].y;

    if (Math.abs(dx) < 1e-6 && Math.abs(dy) < 1e-6) return;

    item.shape = LabCore.translateShape(item.shape, dx, dy);
    renderMissionPlayArea();
  }

  function handleMissionPointerUp(e) {
    if (!mIsDragging || !mActiveShapeId) return;
    mIsDragging = false;

    const item = missionPlacedShapes.find(s => s.id === mActiveShapeId);
    const other = missionPlacedShapes.find(s => s.id !== mActiveShapeId);

    if (item && other) {
      if (MathCore.shapesOverlap(item.shape, other.shape)) {
        showToast('Shapes cannot overlap!', mToastEl);
      } else {
        const snapped = LabCore.findEdgeSnap(item.shape, other.shape, 1.5);
        if (snapped) {
          item.shape = snapped;
          triggerSparkle(mSparkleContainer);
        }
      }
    }

    mActiveShapeId = null;
    renderMissionPlayArea();
  }

  function setupMissionControls() {
    if (mBtnReset) {
      mBtnReset.addEventListener('click', () => {
        missionPlacedShapes = [];
        renderMissionPlayArea();
      });
    }

    if (mBtnHint) {
      mBtnHint.addEventListener('click', () => {
        if (!window.Missions) return;
        const mission = Missions.getMission(Missions.missionsList[currentMissionIndex].id);
        if (mHintBox) {
          mHintBox.textContent = `💡 Hint: ${mission.hint}`;
          mHintBox.classList.remove('hidden');
        }
        if (!mUsedHint) {
          mUsedHint = true;
          if (mCurrentStars > 2) {
            mCurrentStars = 2;
            updateCurrentMissionStarsDisplay();
          }
        }
      });
    }

    if (mBtnCheck) {
      mBtnCheck.addEventListener('click', checkCurrentMission);
    }

    if (mBtnRestart) {
      mBtnRestart.addEventListener('click', () => {
        currentMissionIndex = 0;
        mMissionStars = [0, 0, 0, 0, 0, 0, 0, 0];
        if (mFinalScreen) mFinalScreen.classList.add('hidden');
        if (mActiveContainer) mActiveContainer.classList.remove('hidden');
        loadMission(0);
      });
    }
  }

  function checkCurrentMission() {
    if (!window.Missions) return;

    const mission = Missions.getMission(Missions.missionsList[currentMissionIndex].id);
    const userInput = mAnswerInput ? mAnswerInput.value : '';

    // 1. Check if typed answer is empty or invalid
    const answerCheck = Missions.checkAnswer(mission, userInput);
    if (answerCheck.status === 'empty' || answerCheck.status === 'invalid') {
      if (mFeedbackBox) {
        mFeedbackBox.textContent = `⚠️ Type a number first.`;
        mFeedbackBox.className = 'm-feedback-box incorrect';
        mFeedbackBox.classList.remove('hidden');
        mFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 2. Check if two required shapes are built and joined
    if (!missionPlacedShapes || missionPlacedShapes.length < 2) {
      if (mFeedbackBox) {
        mFeedbackBox.textContent = `⚠️ Build the shape first! Join the two shapes.`;
        mFeedbackBox.className = 'm-feedback-box incorrect';
        mFeedbackBox.classList.remove('hidden');
        mFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    const sA = missionPlacedShapes[0].shape || missionPlacedShapes[0];
    const sB = missionPlacedShapes[1].shape || missionPlacedShapes[1];
    const shared = MathCore.sharedLength(sA, sB);

    if (shared <= 0) {
      if (mFeedbackBox) {
        mFeedbackBox.textContent = `⚠️ Build the shape first! Join the two shapes.`;
        mFeedbackBox.className = 'm-feedback-box incorrect';
        mFeedbackBox.classList.remove('hidden');
        mFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
      return;
    }

    // 3. Process answer result
    mAttemptCount++;

    if (answerCheck.status === 'correct') {
      let stars = 3;
      if (mUsedHint || mAttemptCount === 2) {
        stars = 2;
      } else if (mAttemptCount >= 3) {
        stars = 1;
      }

      mMissionStars[currentMissionIndex] = stars;
      updateTotalStarsDisplay();

      triggerConfetti();

      if (mFeedbackBox) {
        mFeedbackBox.innerHTML = '';
        const msgSpan = document.createElement('span');
        msgSpan.textContent = `🎉 Correct! Awesome job! `;
        mFeedbackBox.appendChild(msgSpan);

        const nextBtn = document.createElement('button');
        nextBtn.className = 'btn btn-primary btn-sm';
        nextBtn.style.marginLeft = '10px';
        nextBtn.textContent = currentMissionIndex + 1 < Missions.missionsList.length ? 'Next Mission ➡️' : 'See Results 🏆';
        nextBtn.addEventListener('click', () => {
          if (currentMissionIndex + 1 < Missions.missionsList.length) {
            loadMission(currentMissionIndex + 1);
          } else {
            showMissionFinalScreen();
          }
        });
        mFeedbackBox.appendChild(nextBtn);

        mFeedbackBox.className = 'm-feedback-box correct';
        mFeedbackBox.classList.remove('hidden');
        mFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }

      if (mAnswerInput) mAnswerInput.disabled = true;

    } else {
      // Wrong answer
      if (mAttemptCount === 1) {
        mCurrentStars = 2;
      } else if (mAttemptCount >= 2) {
        mCurrentStars = 1;
      }
      updateCurrentMissionStarsDisplay();

      if (mFeedbackBox) {
        const mistakeMsg = answerCheck.note ? `Not quite. ${answerCheck.note}` : `Not quite. Try again!`;
        mFeedbackBox.textContent = `❌ ${mistakeMsg}`;
        mFeedbackBox.className = 'm-feedback-box incorrect';
        mFeedbackBox.classList.remove('hidden');
        mFeedbackBox.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
      }
    }
  }

  function showMissionFinalScreen() {
    if (mActiveContainer) mActiveContainer.classList.add('hidden');
    if (mFinalScreen) mFinalScreen.classList.remove('hidden');

    const totalStars = mMissionStars.reduce((a, b) => a + b, 0);

    let badge = '🥉 Bronze Badge';
    let starsToSave = 1;

    if (totalStars >= 20) {
      badge = '🥇 Gold Badge';
      starsToSave = 3;
    } else if (totalStars >= 12) {
      badge = '🥈 Silver Badge';
      starsToSave = 2;
    }

    if (mFinalBadge) mFinalBadge.textContent = badge;
    if (mFinalStarsText) mFinalStarsText.textContent = `You earned ${totalStars} out of 24 stars!`;

    try {
      localStorage.setItem('paq_lab_stars', starsToSave.toString());
    } catch (e) {
      // Storage unavailable
    }

    triggerConfetti();
  }

  // ==========================================================================
  // TAB 3: SPLIT IT! LOGIC
  // ==========================================================================

  function loadSplitComposite(index) {
    if (!window.SplitCore) return;

    if (index >= SplitCore.composites.length) {
      showSplitFinalScreen();
      return;
    }

    if (sActiveContainer) sActiveContainer.classList.remove('hidden');
    if (sFinalScreen) sFinalScreen.classList.add('hidden');

    currentSplitIndex = index;
    splitCardMatched = false;
    selectedSplitCardTitle = null;

    const comp = SplitCore.getComposite(SplitCore.composites[index].id);

    if (sProgressLabel) sProgressLabel.textContent = `Shape ${index + 1} of ${SplitCore.composites.length}`;
    if (sScoreVal) sScoreVal.textContent = `${splitPoints} pts`;
    if (sShapeTitle) sShapeTitle.textContent = comp.title;

    if (sAreaMcqBox) sAreaMcqBox.classList.add('hidden');
    if (sFeedbackMsg) {
      sFeedbackMsg.textContent = '';
      sFeedbackMsg.classList.add('hidden');
      sFeedbackMsg.className = 's-feedback-box hidden';
    }

    renderCompositeTargetSVG(comp);
    renderSplitCardsDeck(comp);
  }

  function renderCompositeTargetSVG(comp) {
    sSvgCompositeLayer.innerHTML = '';
    sSvgLabelsLayer.innerHTML = '';

    const shapes = comp.shapes;
    const allVertices = [...shapes.s1.vertices, ...shapes.s2.vertices];

    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    allVertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });

    const shapeW = maxX - minX;
    const shapeH = maxY - minY;

    // Viewbox 400x300, scale and center shape
    const scaleFactor = Math.min(220 / (shapeW || 1), 180 / (shapeH || 1));
    const offsetX = (400 - shapeW * scaleFactor) / 2 - minX * scaleFactor;
    const offsetY = (300 - shapeH * scaleFactor) / 2 - minY * scaleFactor;

    [shapes.s1, shapes.s2].forEach(s => {
      const pts = s.vertices.map(v => `${v.x * scaleFactor + offsetX},${v.y * scaleFactor + offsetY}`).join(' ');
      const poly = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      poly.setAttribute('points', pts);
      poly.setAttribute('fill', '#ffe0b2');
      poly.setAttribute('stroke', '#e65100');
      poly.setAttribute('stroke-width', '3');
      sSvgCompositeLayer.appendChild(poly);
    });

    // Render labels
    if (comp.labels) {
      comp.labels.forEach(lbl => {
        const lx = lbl.x * scaleFactor + offsetX;
        const ly = lbl.y * scaleFactor + offsetY;

        const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
        txt.setAttribute('x', lx);
        txt.setAttribute('y', ly);
        txt.setAttribute('fill', '#bf360c');
        txt.setAttribute('font-size', '14');
        txt.setAttribute('font-weight', 'bold');
        txt.setAttribute('text-anchor', 'middle');
        txt.textContent = lbl.text;
        sSvgLabelsLayer.appendChild(txt);
      });
    }
  }

  function renderSplitCardsDeck(comp) {
    if (!sCardsList) return;
    sCardsList.innerHTML = '';

    const cardOptions = [comp.cardTitle, comp.distractorCard];
    // Shuffle deterministic or simple swap
    if (currentSplitIndex % 2 === 1) {
      cardOptions.reverse();
    }

    cardOptions.forEach(title => {
      const cardEl = document.createElement('div');
      cardEl.className = 'split-card-item';
      cardEl.setAttribute('draggable', 'true');
      cardEl.setAttribute('tabindex', '0');
      cardEl.setAttribute('role', 'button');
      cardEl.textContent = title;

      // HTML5 drag and drop support
      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', title);
      });

      // Tap / Click fallback support for touch or click
      cardEl.addEventListener('click', () => handleCardTapSelection(title, cardEl));
      cardEl.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          handleCardTapSelection(title, cardEl);
        }
      });

      sCardsList.appendChild(cardEl);
    });
  }

  function setupSplitControls() {
    if (!sTargetDropzone) return;

    // Dragover & Drop handlers for HTML5 DND
    sTargetDropzone.addEventListener('dragover', (e) => {
      e.preventDefault();
      sTargetDropzone.classList.add('drag-over');
    });

    sTargetDropzone.addEventListener('dragleave', () => {
      sTargetDropzone.classList.remove('drag-over');
    });

    sTargetDropzone.addEventListener('drop', (e) => {
      e.preventDefault();
      sTargetDropzone.classList.remove('drag-over');
      const title = e.dataTransfer.getData('text/plain');
      if (title) {
        verifySplitCardMatch(title);
      }
    });

    // Tap on dropzone target after selecting a card
    sTargetDropzone.addEventListener('click', () => {
      if (selectedSplitCardTitle && !splitCardMatched) {
        verifySplitCardMatch(selectedSplitCardTitle);
      }
    });

    if (sBtnRestart) {
      sBtnRestart.addEventListener('click', () => {
        currentSplitIndex = 0;
        splitPoints = 0;
        if (sFinalScreen) sFinalScreen.classList.add('hidden');
        if (sActiveContainer) sActiveContainer.classList.remove('hidden');
        loadSplitComposite(0);
      });
    }
  }

  function handleCardTapSelection(title, cardEl) {
    if (splitCardMatched) return;

    document.querySelectorAll('.split-card-item').forEach(el => el.classList.remove('selected-tap'));
    cardEl.classList.add('selected-tap');
    selectedSplitCardTitle = title;

    showToast('Card selected! Now tap the composite shape box to drop it.', sToastEl);
  }

  function verifySplitCardMatch(cardTitle) {
    if (!window.SplitCore || splitCardMatched) return;

    const currentComp = SplitCore.composites[currentSplitIndex];
    const isMatch = SplitCore.checkCardMatch(currentComp.id, cardTitle);

    if (isMatch) {
      splitCardMatched = true;
      splitPoints += 10;
      if (sScoreVal) sScoreVal.textContent = `${splitPoints} pts`;

      triggerSparkle();

      if (sFeedbackMsg) {
        sFeedbackMsg.textContent = '✨ Correct Split! Now calculate the total area.';
        sFeedbackMsg.className = 's-feedback-box correct';
        sFeedbackMsg.classList.remove('hidden');
      }

      // Display MCQ Area Options
      displayAreaMCQ(currentComp.id);

    } else {
      // Shake animation and gentle feedback
      if (sTargetDropzone) {
        sTargetDropzone.style.animation = 'shake 0.4s ease';
        setTimeout(() => sTargetDropzone.style.animation = '', 450);
      }

      if (sFeedbackMsg) {
        sFeedbackMsg.textContent = '❌ Oops! Look closely at the two basic shapes.';
        sFeedbackMsg.className = 's-feedback-box incorrect';
        sFeedbackMsg.classList.remove('hidden');
      }
    }
  }

  function displayAreaMCQ(compositeId) {
    if (!sAreaMcqBox || !sMcqOptions) return;

    sMcqOptions.innerHTML = '';
    const options = SplitCore.getAreaOptions(compositeId);

    // Shuffle options
    const shuffled = [...options].sort(() => Math.random() - 0.5);

    shuffled.forEach(opt => {
      const btn = document.createElement('button');
      btn.className = 's-mcq-btn';
      btn.textContent = `${opt} cm²`;
      btn.addEventListener('click', () => checkAreaMCQAnswer(compositeId, opt, btn));
      sMcqOptions.appendChild(btn);
    });

    sAreaMcqBox.classList.remove('hidden');
  }

  function checkAreaMCQAnswer(compositeId, chosenVal, btnEl) {
    const comp = SplitCore.getComposite(compositeId);
    const correctVal = comp.computedArea;

    if (chosenVal === correctVal) {
      splitPoints += 10;
      if (sScoreVal) sScoreVal.textContent = `${splitPoints} pts`;

      triggerConfetti();

      if (sFeedbackMsg) {
        sFeedbackMsg.textContent = `🎉 Spot on! Area = ${correctVal} cm² (+10 pts)!`;
        sFeedbackMsg.className = 's-feedback-box correct';
      }

      // Disable MCQ buttons
      document.querySelectorAll('.s-mcq-btn').forEach(b => b.disabled = true);

      setTimeout(() => {
        if (currentSplitIndex + 1 < SplitCore.composites.length) {
          loadSplitComposite(currentSplitIndex + 1);
        } else {
          showSplitFinalScreen();
        }
      }, 1800);

    } else {
      if (btnEl) btnEl.style.opacity = '0.5';
      if (sFeedbackMsg) {
        sFeedbackMsg.textContent = '❌ Not quite. Remember: Area = Area 1 + Area 2!';
        sFeedbackMsg.className = 's-feedback-box incorrect';
      }
    }
  }

  function showSplitFinalScreen() {
    if (sActiveContainer) sActiveContainer.classList.add('hidden');
    if (sFinalScreen) sFinalScreen.classList.remove('hidden');

    let badge = '🥉 Splitter Bronze';
    if (splitPoints >= 100) {
      badge = '🥇 Master Splitter Gold';
    } else if (splitPoints >= 70) {
      badge = '🥈 Master Splitter Silver';
    }

    if (sFinalBadge) sFinalBadge.textContent = badge;
    if (sFinalScoreText) sFinalScoreText.textContent = `Your final score: ${splitPoints} points!`;

    try {
      localStorage.setItem('paq_lab_split', splitPoints.toString());
    } catch (e) {
      // Storage unavailable
    }

    triggerConfetti();
  }

  // Start application on DOM ready
  document.addEventListener('DOMContentLoaded', init);
})();
