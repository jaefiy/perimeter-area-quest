/**
 * js/lab.js
 * User interface, drawing, drag and drop for World 1: Shape Lab.
 */

// Global State
let placedShapes = []; // Array of { id, type, name, params, color, shapeObj, lastValidShapeObj }
let nextShapeId = 1;
let showSharedSide = false;
let showOuterSides = false;

// Dragging State
let activeDrag = null; // { shapeId, pointerId, startX, startY, origShapeObj }

// Tray Shapes Catalog
const TRAY_SHAPES = [
  { id: 'sq2', type: 'square', name: 'Square 2×2', params: [2], color: '#e91e63' },
  { id: 'sq3', type: 'square', name: 'Square 3×3', params: [3], color: '#9c27b0' },
  { id: 'sq4', type: 'square', name: 'Square 4×4', params: [4], color: '#3f51b5' },
  { id: 'sq5', type: 'square', name: 'Square 5×5', params: [5], color: '#0288d1' },

  { id: 'rect4x2', type: 'rectangle', name: 'Rectangle 4×2', params: [4, 2], color: '#009688' },
  { id: 'rect5x3', type: 'rectangle', name: 'Rectangle 5×3', params: [5, 3], color: '#4caf50' },
  { id: 'rect6x3', type: 'rectangle', name: 'Rectangle 6×3', params: [6, 3], color: '#8bc34a' },
  { id: 'rect6x4', type: 'rectangle', name: 'Rectangle 6×4', params: [6, 4], color: '#ff9800' },
  { id: 'rect8x3', type: 'rectangle', name: 'Rectangle 8×3', params: [8, 3], color: '#ff5722' },

  { id: 'tri3x4', type: 'right-triangle', name: 'Right Triangle 3×4', params: [3, 4], color: '#e040fb' },
  { id: 'tri6x8', type: 'right-triangle', name: 'Right Triangle 6×8', params: [6, 8], color: '#7c4dff' },
  { id: 'iso6x4', type: 'iso-triangle', name: 'Isosceles Triangle 6×4', params: [6, 4], color: '#00b0ff' }
];

// Initialize Page
document.addEventListener('DOMContentLoaded', () => {
  renderTrayItems();
  setupEventListeners();
  updateInfoPanel();
});

// Tab Switcher
function switchTab(tabNum) {
  document.querySelectorAll('.tab-btn').forEach((btn, index) => {
    btn.classList.toggle('active', index + 1 === tabNum);
  });
  document.querySelectorAll('.tab-content').forEach((content, index) => {
    content.classList.toggle('active', index + 1 === tabNum);
  });
}

// Render Shape Tray Items
function renderTrayItems() {
  const trayContainer = document.getElementById('shape-tray');
  if (!trayContainer) return;

  trayContainer.innerHTML = '';

  TRAY_SHAPES.forEach(item => {
    const div = document.createElement('div');
    div.className = 'tray-item';
    div.setAttribute('role', 'button');
    div.setAttribute('tabindex', '0');
    div.setAttribute('aria-label', `Add ${item.name}`);

    // Generate mini SVG preview
    let previewSVG = '';
    if (item.type === 'square') {
      const s = item.params[0];
      previewSVG = `<svg viewBox="-0.5 -0.5 ${s + 1} ${s + 1}"><rect x="0" y="0" width="${s}" height="${s}" fill="${item.color}" stroke="#333" stroke-width="0.3" rx="0.3"/></svg>`;
    } else if (item.type === 'rectangle') {
      const w = item.params[0], h = item.params[1];
      previewSVG = `<svg viewBox="-0.5 -0.5 ${w + 1} ${h + 1}"><rect x="0" y="0" width="${w}" height="${h}" fill="${item.color}" stroke="#333" stroke-width="0.3" rx="0.3"/></svg>`;
    } else if (item.type === 'right-triangle') {
      const a = item.params[0], b = item.params[1];
      previewSVG = `<svg viewBox="-0.5 -0.5 ${a + 1} ${b + 1}"><polygon points="0,0 ${a},0 0,${b}" fill="${item.color}" stroke="#333" stroke-width="0.3"/></svg>`;
    } else if (item.type === 'iso-triangle') {
      const base = item.params[0], h = item.params[1];
      previewSVG = `<svg viewBox="-0.5 -0.5 ${base + 1} ${h + 1}"><polygon points="0,${h} ${base},${h} ${base / 2},0" fill="${item.color}" stroke="#333" stroke-width="0.3"/></svg>`;
    }

    div.innerHTML = `${previewSVG}<span class="tray-item-label">${item.name}</span>`;

    div.addEventListener('click', () => addShapeToPlayArea(item));
    div.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        addShapeToPlayArea(item);
      }
    });

    trayContainer.appendChild(div);
  });
}

// Helper to create MathCore shape instance
function createShapeInstance(item, x, y) {
  if (item.type === 'square') {
    return MathCore.createSquare(item.params[0], x, y);
  } else if (item.type === 'rectangle') {
    return MathCore.createRectangle(item.params[0], item.params[1], x, y);
  } else if (item.type === 'right-triangle') {
    return MathCore.createRightTriangle(item.params[0], item.params[1], x, y);
  } else if (item.type === 'iso-triangle') {
    return MathCore.createIsoscelesTriangle(item.params[0], item.params[1], x, y);
  }
}

// Add Shape to Play Area
function addShapeToPlayArea(item) {
  if (placedShapes.length >= 2) {
    showToast('Only two shapes at a time! Remove one first.');
    return;
  }

  // Determine initial coordinates on grid
  let posX = 2;
  let posY = 2;

  if (placedShapes.length === 1) {
    const s1 = placedShapes[0].shapeObj;
    let maxX = 0;
    s1.vertices.forEach(v => { if (v.x > maxX) maxX = v.x; });
    posX = Math.min(12, Math.round(maxX + 1));
    posY = Math.round(s1.vertices[0].y);
  }

  const shapeObj = createShapeInstance(item, posX, posY);

  // Check if position overlaps with existing shape
  if (placedShapes.length === 1 && MathCore.shapesOverlap(shapeObj, placedShapes[0].shapeObj)) {
    // Try shifting position down
    const altObj = LabCore.translateShape(shapeObj, 0, 5);
    if (!MathCore.shapesOverlap(altObj, placedShapes[0].shapeObj)) {
      posX = altObj.vertices[0].x;
      posY = altObj.vertices[0].y;
    }
  }

  const newShapeObj = createShapeInstance(item, posX, posY);

  const placedItem = {
    id: nextShapeId++,
    type: item.type,
    name: item.name,
    params: item.params,
    color: item.color,
    shapeObj: newShapeObj,
    lastValidShapeObj: newShapeObj
  };

  placedShapes.push(placedItem);
  renderPlayArea();
  updateInfoPanel();
}

// Setup Event Listeners for UI Controls
function setupEventListeners() {
  const toggleSharedBtn = document.getElementById('toggle-shared-btn');
  const toggleOuterBtn = document.getElementById('toggle-outer-btn');
  const resetBtn = document.getElementById('reset-btn');

  if (toggleSharedBtn) {
    toggleSharedBtn.addEventListener('click', () => {
      showSharedSide = !showSharedSide;
      toggleSharedBtn.classList.toggle('active', showSharedSide);
      renderPlayArea();
    });
  }

  if (toggleOuterBtn) {
    toggleOuterBtn.addEventListener('click', () => {
      showOuterSides = !showOuterSides;
      toggleOuterBtn.classList.toggle('active', showOuterSides);
      renderPlayArea();
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      placedShapes = [];
      renderPlayArea();
      updateInfoPanel();
      showToast('Play area reset!');
    });
  }

  const svg = document.getElementById('play-area-svg');
  if (svg) {
    svg.addEventListener('pointermove', handlePointerMove);
    svg.addEventListener('pointerup', handlePointerUp);
    svg.addEventListener('pointercancel', handlePointerUp);
  }
}

// Convert screen coordinates to SVG grid coordinates
function getSVGGridPoint(svg, clientX, clientY) {
  const pt = svg.createSVGPoint();
  pt.x = clientX;
  pt.y = clientY;
  const svgP = pt.matrixTransform(svg.getScreenCTM().inverse());
  return { x: svgP.x, y: svgP.y };
}

// Render Placed Shapes and Overlays in SVG Play Area
function renderPlayArea() {
  const group = document.getElementById('placed-shapes-group');
  const overlayGroup = document.getElementById('overlay-highlights-group');
  if (!group || !overlayGroup) return;

  group.innerHTML = '';
  overlayGroup.innerHTML = '';

  const svg = document.getElementById('play-area-svg');

  placedShapes.forEach(item => {
    const shape = item.shapeObj;

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    g.setAttribute('class', 'placed-shape');
    g.setAttribute('data-id', item.id);

    // Polygon
    const pointsStr = shape.vertices.map(v => `${v.x},${v.y}`).join(' ');
    const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    polygon.setAttribute('points', pointsStr);
    polygon.setAttribute('fill', item.color);
    polygon.setAttribute('fill-opacity', '0.8');
    polygon.setAttribute('stroke', '#1a1a1a');
    polygon.setAttribute('stroke-width', '0.15');
    polygon.setAttribute('stroke-linejoin', 'round');
    polygon.style.cursor = 'grab';

    // Pointer Events for dragging
    polygon.addEventListener('pointerdown', (e) => handlePointerDown(e, item.id));

    // Double tap / double click to rotate 90
    let lastTap = 0;
    polygon.addEventListener('click', (e) => {
      const now = Date.now();
      if (now - lastTap < 300) {
        rotateShape(item.id);
      }
      lastTap = now;
    });

    g.appendChild(polygon);

    // Label edges with whole-number side lengths
    shape.edges.forEach(edge => {
      const midX = (edge.p1.x + edge.p2.x) / 2;
      const midY = (edge.p1.y + edge.p2.y) / 2;

      const labelText = MathCore.formatNumber(edge.length) + ' cm';

      const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      text.setAttribute('x', midX);
      text.setAttribute('y', midY);
      text.setAttribute('text-anchor', 'middle');
      text.setAttribute('dominant-baseline', 'central');
      text.setAttribute('fill', '#ffffff');
      text.setAttribute('font-weight', 'bold');
      text.setAttribute('font-size', '0.6');
      text.setAttribute('stroke', '#000000');
      text.setAttribute('stroke-width', '0.08');
      text.setAttribute('paint-order', 'stroke fill');
      text.setAttribute('pointer-events', 'none');
      text.textContent = labelText;

      g.appendChild(text);
    });

    // Control Buttons (Rotate, Flip, Remove)
    // Compute bounding box center/top
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    shape.vertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });

    const ctrlGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    ctrlGroup.setAttribute('class', 'controls-overlay');

    // Remove (x) button top-right
    const removeBtn = createSVGButton('❌', maxX, minY - 0.5, '0.8', () => removeShape(item.id));
    ctrlGroup.appendChild(removeBtn);

    // Rotate 90 button
    const rotateBtn = createSVGButton('↻ 90°', minX, minY - 0.5, '1.2', () => rotateShape(item.id));
    ctrlGroup.appendChild(rotateBtn);

    // Flip button for triangles
    if (item.type.includes('triangle')) {
      const flipBtn = createSVGButton('↔ Flip', (minX + maxX) / 2 - 0.6, minY - 0.5, '1.2', () => flipShape(item.id));
      ctrlGroup.appendChild(flipBtn);
    }

    g.appendChild(ctrlGroup);
    group.appendChild(g);
  });

  // Render Overlays if two shapes are placed
  if (placedShapes.length === 2) {
    const s1 = placedShapes[0].shapeObj;
    const s2 = placedShapes[1].shapeObj;
    const sLen = MathCore.sharedLength(s1, s2);

    if (sLen > 0) {
      const { sharedSegments, outerSegments } = LabCore.getSharedAndOuterSegments(s1, s2);

      // Render Shared Side Overlay
      if (showSharedSide) {
        sharedSegments.forEach(seg => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', seg.p1.x);
          line.setAttribute('y1', seg.p1.y);
          line.setAttribute('x2', seg.p2.x);
          line.setAttribute('y2', seg.p2.y);
          line.setAttribute('stroke', '#d32f2f');
          line.setAttribute('stroke-width', '0.35');
          line.setAttribute('stroke-dasharray', '0.4,0.2');
          line.setAttribute('pointer-events', 'none');
          overlayGroup.appendChild(line);

          // Shared label
          const midX = (seg.p1.x + seg.p2.x) / 2;
          const midY = (seg.p1.y + seg.p2.y) / 2;
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', midX);
          text.setAttribute('y', midY - 0.4);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('fill', '#d32f2f');
          text.setAttribute('font-weight', '900');
          text.setAttribute('font-size', '0.55');
          text.setAttribute('stroke', '#ffffff');
          text.setAttribute('stroke-width', '0.1');
          text.setAttribute('paint-order', 'stroke fill');
          text.setAttribute('pointer-events', 'none');
          text.textContent = 'Shared side: NOT counted in perimeter';
          overlayGroup.appendChild(text);
        });
      }

      // Render Outer Boundary Overlay
      if (showOuterSides) {
        outerSegments.forEach(seg => {
          const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
          line.setAttribute('x1', seg.p1.x);
          line.setAttribute('y1', seg.p1.y);
          line.setAttribute('x2', seg.p2.x);
          line.setAttribute('y2', seg.p2.y);
          line.setAttribute('stroke', '#0d47a1');
          line.setAttribute('stroke-width', '0.35');
          line.setAttribute('pointer-events', 'none');
          overlayGroup.appendChild(line);

          // Outer label
          const midX = (seg.p1.x + seg.p2.x) / 2;
          const midY = (seg.p1.y + seg.p2.y) / 2;
          const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
          text.setAttribute('x', midX);
          text.setAttribute('y', midY);
          text.setAttribute('text-anchor', 'middle');
          text.setAttribute('dominant-baseline', 'central');
          text.setAttribute('fill', '#0d47a1');
          text.setAttribute('font-weight', 'bold');
          text.setAttribute('font-size', '0.55');
          text.setAttribute('stroke', '#ffffff');
          text.setAttribute('stroke-width', '0.1');
          text.setAttribute('paint-order', 'stroke fill');
          text.setAttribute('pointer-events', 'none');
          text.textContent = MathCore.formatNumber(seg.length) + ' cm';
          overlayGroup.appendChild(text);
        });
      }
    }
  }
}

// Helper to create small interactive SVG control buttons
function createSVGButton(label, x, y, widthStr, onClick) {
  const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
  g.setAttribute('class', 'shape-control-btn');
  g.setAttribute('style', 'cursor: pointer;');

  const w = parseFloat(widthStr);
  const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  rect.setAttribute('x', x);
  rect.setAttribute('y', y);
  rect.setAttribute('width', w);
  rect.setAttribute('height', '0.8');
  rect.setAttribute('rx', '0.2');
  rect.setAttribute('fill', '#ffffff');
  rect.setAttribute('stroke', '#333333');
  rect.setAttribute('stroke-width', '0.08');

  const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
  text.setAttribute('x', x + w / 2);
  text.setAttribute('y', y + 0.4);
  text.setAttribute('text-anchor', 'middle');
  text.setAttribute('dominant-baseline', 'central');
  text.setAttribute('fill', '#1a1a1a');
  text.setAttribute('font-size', '0.45');
  text.setAttribute('font-weight', 'bold');
  text.textContent = label;

  g.appendChild(rect);
  g.appendChild(text);

  g.addEventListener('click', (e) => {
    e.stopPropagation();
    onClick();
  });
  g.addEventListener('pointerdown', (e) => {
    e.stopPropagation();
  });

  return g;
}

// Rotate Shape 90 degrees
function rotateShape(id) {
  const item = placedShapes.find(s => s.id === id);
  if (!item) return;

  const rotatedObj = LabCore.rotateShape90(item.shapeObj);

  // Check overlap with other shape
  const otherItem = placedShapes.find(s => s.id !== id);
  if (otherItem && MathCore.shapesOverlap(rotatedObj, otherItem.shapeObj)) {
    triggerRedFlash();
    showToast('Shapes cannot overlap!');
    return;
  }

  item.shapeObj = rotatedObj;
  item.lastValidShapeObj = rotatedObj;

  // Check if snap is needed after rotation
  if (otherItem) {
    const snapOffset = LabCore.findSnapOffset(item.shapeObj, otherItem.shapeObj, 0.5);
    if (snapOffset.dx !== 0 || snapOffset.dy !== 0) {
      item.shapeObj = LabCore.translateShape(item.shapeObj, snapOffset.dx, snapOffset.dy);
      item.lastValidShapeObj = item.shapeObj;
      triggerPopSparkle();
    }
  }

  renderPlayArea();
  updateInfoPanel();
}

// Flip Shape (for Triangles)
function flipShape(id) {
  const item = placedShapes.find(s => s.id === id);
  if (!item) return;

  const flippedObj = LabCore.flipShape(item.shapeObj);

  const otherItem = placedShapes.find(s => s.id !== id);
  if (otherItem && MathCore.shapesOverlap(flippedObj, otherItem.shapeObj)) {
    triggerRedFlash();
    showToast('Shapes cannot overlap!');
    return;
  }

  item.shapeObj = flippedObj;
  item.lastValidShapeObj = flippedObj;

  if (otherItem) {
    const snapOffset = LabCore.findSnapOffset(item.shapeObj, otherItem.shapeObj, 0.5);
    if (snapOffset.dx !== 0 || snapOffset.dy !== 0) {
      item.shapeObj = LabCore.translateShape(item.shapeObj, snapOffset.dx, snapOffset.dy);
      item.lastValidShapeObj = item.shapeObj;
      triggerPopSparkle();
    }
  }

  renderPlayArea();
  updateInfoPanel();
}

// Remove Shape
function removeShape(id) {
  placedShapes = placedShapes.filter(s => s.id !== id);
  renderPlayArea();
  updateInfoPanel();
  showToast('Shape removed');
}

// Drag Handlers
function handlePointerDown(e, shapeId) {
  e.preventDefault();
  const svg = document.getElementById('play-area-svg');
  if (!svg) return;

  const pt = getSVGGridPoint(svg, e.clientX, e.clientY);
  const item = placedShapes.find(s => s.id === shapeId);
  if (!item) return;

  activeDrag = {
    shapeId,
    pointerId: e.pointerId,
    startX: pt.x,
    startY: pt.y,
    origShapeObj: item.shapeObj
  };

  svg.setPointerCapture(e.pointerId);
}

function handlePointerMove(e) {
  if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;

  const svg = document.getElementById('play-area-svg');
  if (!svg) return;

  const pt = getSVGGridPoint(svg, e.clientX, e.clientY);
  const dx = pt.x - activeDrag.startX;
  const dy = pt.y - activeDrag.startY;

  const item = placedShapes.find(s => s.id === activeDrag.shapeId);
  if (!item) return;

  item.shapeObj = LabCore.translateShape(activeDrag.origShapeObj, dx, dy);
  renderPlayArea();
}

function handlePointerUp(e) {
  if (!activeDrag || e.pointerId !== activeDrag.pointerId) return;

  const svg = document.getElementById('play-area-svg');
  if (svg) {
    try {
      svg.releasePointerCapture(e.pointerId);
    } catch (err) {}
  }

  const item = placedShapes.find(s => s.id === activeDrag.shapeId);
  if (item) {
    // 1. Grid snapping
    let v0 = item.shapeObj.vertices[0];
    let snappedX = LabCore.snapToGrid(v0.x);
    let snappedY = LabCore.snapToGrid(v0.y);

    let dxGrid = snappedX - v0.x;
    let dyGrid = snappedY - v0.y;

    item.shapeObj = LabCore.translateShape(item.shapeObj, dxGrid, dyGrid);

    // 2. Flush Snap check if other shape present
    const otherItem = placedShapes.find(s => s.id !== item.id);
    if (otherItem) {
      const snapOffset = LabCore.findSnapOffset(item.shapeObj, otherItem.shapeObj, 0.5);
      if (snapOffset.dx !== 0 || snapOffset.dy !== 0) {
        item.shapeObj = LabCore.translateShape(item.shapeObj, snapOffset.dx, snapOffset.dy);
        triggerPopSparkle();
      }

      // 3. Overlap check
      if (MathCore.shapesOverlap(item.shapeObj, otherItem.shapeObj)) {
        // Overlap rejected: return to last valid position with red flash and toast
        item.shapeObj = item.lastValidShapeObj;
        triggerRedFlash();
        showToast('Shapes cannot overlap!');
      } else {
        item.lastValidShapeObj = item.shapeObj;
      }
    } else {
      item.lastValidShapeObj = item.shapeObj;
    }
  }

  activeDrag = null;
  renderPlayArea();
  updateInfoPanel();
}

// Animations & Visual Feedback
function triggerRedFlash() {
  const svg = document.getElementById('play-area-svg');
  if (!svg) return;
  svg.classList.remove('flash-red');
  void svg.offsetWidth; // trigger reflow
  svg.classList.add('flash-red');
}

function triggerPopSparkle() {
  const svg = document.getElementById('play-area-svg');
  if (!svg) return;
  svg.classList.remove('pop-sparkle-anim');
  void svg.offsetWidth;
  svg.classList.add('pop-sparkle-anim');
}

// Toast Notification
function showToast(msg) {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3000);
}

// Live Info Panel & Ziggy Speech Updates
function updateInfoPanel() {
  const hintCard = document.getElementById('hint-card');
  const perimeterCard = document.getElementById('perimeter-card');
  const areaCard = document.getElementById('area-card');
  const perimeterWorking = document.getElementById('perimeter-working');
  const areaWorking = document.getElementById('area-working');
  const ziggySpeech = document.getElementById('ziggy-speech');

  if (placedShapes.length === 2) {
    const s1 = placedShapes[0].shapeObj;
    const s2 = placedShapes[1].shapeObj;
    const sLen = MathCore.sharedLength(s1, s2);

    if (sLen > 0) {
      if (hintCard) hintCard.style.display = 'none';
      if (perimeterCard) perimeterCard.style.display = 'block';
      if (areaCard) areaCard.style.display = 'block';

      const p1 = MathCore.formatNumber(s1.perimeter);
      const p2 = MathCore.formatNumber(s2.perimeter);
      const sL = MathCore.formatNumber(sLen);
      const totalP = MathCore.formatNumber(MathCore.compositePerimeter(s1, s2));

      const a1 = MathCore.formatNumber(s1.area);
      const a2 = MathCore.formatNumber(s2.area);
      const totalA = MathCore.formatNumber(MathCore.compositeArea(s1, s2));

      if (perimeterWorking) {
        perimeterWorking.textContent = `${p1} + ${p2} - 2 x ${sL} = ${totalP} cm`;
      }
      if (areaWorking) {
        areaWorking.textContent = `${a1} + ${a2} = ${totalA} cm²`;
      }
      if (ziggySpeech) {
        ziggySpeech.textContent = `Great! Perimeter = ${totalP} cm, Area = ${totalA} cm²!`;
      }
      return;
    }
  }

  // Fallback when shapes are not joined or < 2 shapes placed
  if (hintCard) hintCard.style.display = 'block';
  if (perimeterCard) perimeterCard.style.display = 'none';
  if (areaCard) areaCard.style.display = 'none';

  if (ziggySpeech) {
    if (placedShapes.length === 0) {
      ziggySpeech.textContent = 'Try joining two squares!';
    } else if (placedShapes.length === 1) {
      ziggySpeech.textContent = 'Add another shape from the tray!';
    } else {
      ziggySpeech.textContent = 'Drag the shapes together so they touch along a side.';
    }
  }
}
