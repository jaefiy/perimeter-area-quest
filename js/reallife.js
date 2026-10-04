/**
 * js/reallife.js
 * DOM Controller for World 3: Real-Life Builder.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // --- Core References ---
  const Core = window.RealLifeCore;
  const MathCore = window.MathCore;

  // --- DOM Elements ---
  const scenarioSelectView = document.getElementById('scenario-select-view');
  const scenarioWorkspaceView = document.getElementById('scenario-workspace-view');
  const backToScenariosBtn = document.getElementById('back-to-scenarios-btn');
  const workspaceTitle = document.getElementById('workspace-title');
  const clientNameTag = document.getElementById('client-name-tag');
  const clientPromptText = document.getElementById('client-prompt-text');
  const progressDotsContainer = document.getElementById('progress-dots-container');

  const diagramSvgWrapper = document.getElementById('diagram-svg-wrapper');
  const scenario1Controls = document.getElementById('scenario-1-controls');
  const scenarioStepsControls = document.getElementById('scenario-steps-controls');

  // Garden Controls
  const shape1TileGrid = document.getElementById('shape1-tile-grid');
  const shape2TileGrid = document.getElementById('shape2-tile-grid');
  const selectSide1 = document.getElementById('select-side1');
  const selectSide2 = document.getElementById('select-side2');
  const selectAlignment = document.getElementById('select-alignment');
  const submitGardenBtn = document.getElementById('submit-garden-btn');
  const showExampleBtn = document.getElementById('show-example-btn');
  const gardenFeedbackBox = document.getElementById('garden-feedback-box');

  // Step Controls
  const stepNumberTag = document.getElementById('step-number-tag');
  const stepQuestionTitle = document.getElementById('step-question-title');
  const typedInputForm = document.getElementById('typed-input-form');
  const stepTypedInput = document.getElementById('step-typed-input');
  const submitTypedBtn = document.getElementById('submit-typed-btn');
  const mcqInputForm = document.getElementById('mcq-input-form');
  const stepHintBtn = document.getElementById('step-hint-btn');
  const stepFeedbackBox = document.getElementById('step-feedback-box');

  // Calculator Elements
  const calcPerimeterWorking = document.getElementById('calc-perimeter-working');
  const calcAreaWorking = document.getElementById('calc-area-working');
  const costTableBody = document.getElementById('cost-table-body');
  const budgetStatusText = document.getElementById('budget-status-text');
  const budgetLeftText = document.getElementById('budget-left-text');
  const budgetProgressFill = document.getElementById('budget-progress-fill');

  // Modal Elements
  const completionModal = document.getElementById('completion-modal');
  const completionStarsContainer = document.getElementById('completion-stars-container');
  const completionSummaryText = document.getElementById('completion-summary-text');
  const modalReplayBtn = document.getElementById('modal-replay-btn');
  const modalNextBtn = document.getElementById('modal-next-btn');

  const howToPlayModal = document.getElementById('how-to-play-modal');
  const openHowToPlayBtn = document.getElementById('open-how-to-play');
  const closeModalBtn = document.getElementById('close-modal-btn');
  const modalGotItBtn = document.getElementById('modal-got-it-btn');
  const confettiCanvas = document.getElementById('confetti-canvas');

  // --- State Variables ---
  let starsState = Core.loadStars();
  let currentScenarioId = null;

  // Scenario 1 State
  let s1Shape1Spec = Core.SCENARIO_DATA[1].tiles[4]; // Rectangle 8x5
  let s1Shape2Spec = Core.SCENARIO_DATA[1].tiles[1]; // Square 5
  let s1FailedSubmissions = 0;

  // Scenario 2 & 3 State
  let currentStepIndex = 1;
  let totalWrongAttempts = 0;
  let completedSteps = {}; // stepIndex -> bool

  // --- Star Ratings Renderer ---
  function renderStarsContainer(container, starCount) {
    if (!container) return;
    container.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const isFilled = i <= starCount;
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('viewBox', '0 0 24 24');
      svg.setAttribute('width', '28');
      svg.setAttribute('height', '28');
      if (!isFilled) {
        svg.setAttribute('class', 'empty');
        svg.style.opacity = '0.3';
      }

      const path = document.createElementNS(svgNS, 'path');
      path.setAttribute('d', 'M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z');
      path.setAttribute('fill', isFilled ? '#fbc02d' : '#9e9e9e');
      svg.appendChild(path);

      container.appendChild(svg);
    }
  }

  function updateHomeStarDisplays() {
    starsState = Core.loadStars();
    renderStarsContainer(document.getElementById('stars-scenario-1'), starsState[1] || 0);
    renderStarsContainer(document.getElementById('stars-scenario-2'), starsState[2] || 0);
    renderStarsContainer(document.getElementById('stars-scenario-3'), starsState[3] || 0);
  }

  // --- View Switcher ---
  function showHomeView() {
    scenarioSelectView.classList.remove('hidden');
    scenarioSelectView.removeAttribute('hidden');
    scenarioWorkspaceView.classList.add('hidden');
    scenarioWorkspaceView.setAttribute('hidden', 'true');
    hideCompletionModal();
    updateHomeStarDisplays();
    currentScenarioId = null;
  }

  function startScenario(scenarioId) {
    currentScenarioId = scenarioId;
    const data = Core.SCENARIO_DATA[scenarioId];

    scenarioSelectView.classList.add('hidden');
    scenarioSelectView.setAttribute('hidden', 'true');
    scenarioWorkspaceView.classList.remove('hidden');
    scenarioWorkspaceView.removeAttribute('hidden');

    workspaceTitle.textContent = data.title;
    clientNameTag.textContent = data.client;
    clientPromptText.textContent = data.prompt;

    hideCompletionModal();

    if (scenarioId === 1) {
      progressDotsContainer.classList.add('hidden');
      progressDotsContainer.setAttribute('hidden', 'true');
      scenario1Controls.classList.remove('hidden');
      scenario1Controls.removeAttribute('hidden');
      scenarioStepsControls.classList.add('hidden');
      scenarioStepsControls.setAttribute('hidden', 'true');

      s1FailedSubmissions = 0;
      showExampleBtn.classList.add('hidden');
      showExampleBtn.setAttribute('hidden', 'true');
      hideFeedback(gardenFeedbackBox);

      renderGardenTilePickers();
      updateGardenWorkspace();

    } else {
      progressDotsContainer.classList.remove('hidden');
      progressDotsContainer.removeAttribute('hidden');
      scenario1Controls.classList.add('hidden');
      scenario1Controls.setAttribute('hidden', 'true');
      scenarioStepsControls.classList.remove('hidden');
      scenarioStepsControls.removeAttribute('hidden');

      currentStepIndex = 1;
      totalWrongAttempts = 0;
      completedSteps = {};

      renderProgressDots(data.steps.length);
      updateStepWorkspace();
    }
  }

  // --- Scenario 1: Garden Builder Logic ---
  function renderGardenTilePickers() {
    const tiles = Core.SCENARIO_DATA[1].tiles;

    function buildGrid(container, selectedTile, onSelect) {
      container.innerHTML = '';
      tiles.forEach(tile => {
        const btn = document.createElement('button');
        btn.className = 'tile-btn' + (tile.id === selectedTile.id ? ' selected' : '');
        btn.innerHTML = `<span>${tile.name}</span><span style="font-size:0.85rem; opacity:0.8;">${tile.width}×${tile.height} m</span>`;
        btn.addEventListener('click', () => {
          onSelect(tile);
          buildGrid(shape1TileGrid, s1Shape1Spec, t => { s1Shape1Spec = t; updateGardenWorkspace(); });
          buildGrid(shape2TileGrid, s1Shape2Spec, t => { s1Shape2Spec = t; updateGardenWorkspace(); });
        });
        container.appendChild(btn);
      });
    }

    buildGrid(shape1TileGrid, s1Shape1Spec, t => { s1Shape1Spec = t; updateGardenWorkspace(); });
    buildGrid(shape2TileGrid, s1Shape2Spec, t => { s1Shape2Spec = t; updateGardenWorkspace(); });
  }

  function updateGardenWorkspace() {
    const side1 = selectSide1.value;
    const side2 = selectSide2.value;
    const alignment = selectAlignment.value;

    const joinRes = Core.validateAndJoinGardenShapes(s1Shape1Spec, s1Shape2Spec, side1, side2, alignment);

    renderGardenSVG(joinRes);
    renderGardenCalculator(joinRes);
  }

  function renderGardenSVG(joinRes) {
    const scale = 20; // 1 metre = 20px
    const padding = 30;

    let w1 = s1Shape1Spec.width || s1Shape1Spec.side;
    let h1 = s1Shape1Spec.height || s1Shape1Spec.side;
    let w2 = s1Shape2Spec.width || s1Shape2Spec.side;
    let h2 = s1Shape2Spec.height || s1Shape2Spec.side;

    let x1 = 0, y1 = 0;
    let x2 = joinRes.validJoin ? joinRes.x2 : w1 + 2;
    let y2 = joinRes.validJoin ? joinRes.y2 : 0;

    // Calculate bounding box
    let minX = Math.min(x1, x2);
    let maxX = Math.max(x1 + w1, x2 + w2);
    let minY = Math.min(y1, y2);
    let maxY = Math.max(y1 + h1, y2 + h2);

    let bboxW = (maxX - minX) * scale + padding * 2;
    let bboxH = (maxY - minY) * scale + padding * 2;

    let svgX1 = (x1 - minX) * scale + padding;
    let svgY1 = (y1 - minY) * scale + padding;
    let svgX2 = (x2 - minX) * scale + padding;
    let svgY2 = (y2 - minY) * scale + padding;

    let cx1 = svgX1 + (w1 * scale) / 2;
    let cy1 = svgY1 + (h1 * scale) / 2 - 8;
    let cx2 = svgX2 + (w2 * scale) / 2;
    let cy2 = svgY2 + (h2 * scale) / 2 - 8;

    let svgContent = `<svg viewBox="0 0 ${bboxW} ${bboxH}" width="100%" height="${Math.min(280, bboxH)}">
      <!-- Shape 1 -->
      <rect x="${svgX1}" y="${svgY1}" width="${w1 * scale}" height="${h1 * scale}" fill="#e3f2fd" stroke="#1565c0" stroke-width="3" rx="4" />
      <text x="${cx1}" y="${cy1}" text-anchor="middle" font-weight="bold" fill="#0d47a1" font-size="15">
        <tspan x="${cx1}" dy="0">Shape 1</tspan>
        <tspan x="${cx1}" dy="1.2em">(${w1}×${h1} m)</tspan>
      </text>

      <!-- Shape 2 -->
      <rect x="${svgX2}" y="${svgY2}" width="${w2 * scale}" height="${h2 * scale}" fill="#e8f5e9" stroke="#2e7d32" stroke-width="3" rx="4" />
      <text x="${cx2}" y="${cy2}" text-anchor="middle" font-weight="bold" fill="#1b5e20" font-size="15">
        <tspan x="${cx2}" dy="0">Shape 2</tspan>
        <tspan x="${cx2}" dy="1.2em">(${w2}×${h2} m)</tspan>
      </text>
    `;

    if (!joinRes.validJoin) {
      svgContent += `<text x="${bboxW / 2}" y="${bboxH - 10}" text-anchor="middle" font-weight="bold" fill="#c62828" font-size="14">⚠️ ${joinRes.reason}</text>`;
    } else {
      svgContent += `<text x="${bboxW / 2}" y="${bboxH - 10}" text-anchor="middle" font-weight="bold" fill="#2e7d32" font-size="14">Shared edge: ${joinRes.sharedLength} m</text>`;
    }

    svgContent += `</svg>`;
    diagramSvgWrapper.innerHTML = svgContent;
  }

  function renderGardenCalculator(joinRes) {
    if (!joinRes.validJoin) {
      calcPerimeterWorking.textContent = 'P = Invalid join (' + joinRes.reason + ')';
      calcAreaWorking.textContent = 'A = Invalid join';
      costTableBody.innerHTML = `<tr><td colspan="4" style="text-align:center; color:#c62828;">Adjust sides/alignment to form a valid join.</td></tr>`;
      budgetStatusText.textContent = 'Invalid Join';
      budgetLeftText.textContent = 'RM --';
      budgetProgressFill.style.width = '0%';
      budgetProgressFill.className = 'budget-progress-fill red';
      return;
    }

    calcPerimeterWorking.textContent = `P = ${joinRes.shape1.perimeter} m + ${joinRes.shape2.perimeter} m - 2 × ${joinRes.sharedLength} m = ${joinRes.perimeter} m`;
    calcAreaWorking.textContent = `A = ${joinRes.shape1.area} m² + ${joinRes.shape2.area} m² = ${joinRes.area} m²`;

    costTableBody.innerHTML = `
      <tr><td>Fence</td><td>${joinRes.perimeter} m</td><td>RM 10/m</td><td>RM ${joinRes.fenceCost}</td></tr>
      <tr><td>Grass</td><td>${joinRes.area} m²</td><td>RM 5/m²</td><td>RM ${joinRes.grassCost}</td></tr>
      <tr class="total-row"><td colspan="3">TOTAL</td><td>RM ${joinRes.totalCost}</td></tr>
    `;

    const budget = 700;
    const over = joinRes.totalCost > budget;
    const pct = Math.min(100, Math.round((joinRes.totalCost / budget) * 100));

    budgetStatusText.textContent = over ? 'Over Budget!' : 'Within Budget';
    budgetLeftText.textContent = over ? `Over by RM ${joinRes.totalCost - budget}` : `RM ${budget - joinRes.totalCost} left`;
    budgetProgressFill.style.width = pct + '%';
    budgetProgressFill.className = 'budget-progress-fill ' + (over ? 'red' : 'green');
  }

  // Submit Garden
  submitGardenBtn.addEventListener('click', function () {
    const side1 = selectSide1.value;
    const side2 = selectSide2.value;
    const alignment = selectAlignment.value;

    const joinRes = Core.validateAndJoinGardenShapes(s1Shape1Spec, s1Shape2Spec, side1, side2, alignment);

    if (!joinRes.validJoin) {
      showFeedback(gardenFeedbackBox, 'wrong', 'Cannot submit: ' + joinRes.reason);
      return;
    }

    const checkRes = Core.checkGardenDesign(joinRes.area, joinRes.totalCost);

    if (checkRes.isValid) {
      s1FailedSubmissions++;
      const isEx = Core.isExampleDesign(s1Shape1Spec, s1Shape2Spec, joinRes);
      const starsEarned = Core.calculateStars(1, { isValid: true, attemptCount: s1FailedSubmissions, isExample: isEx });

      starsState[1] = Math.max(starsState[1] || 0, starsEarned);
      Core.saveStars(starsState);

      showCompletionModal(1, starsEarned, checkRes.message);
    } else {
      s1FailedSubmissions++;
      showFeedback(gardenFeedbackBox, 'wrong', checkRes.message);

      if (s1FailedSubmissions >= 2) {
        showExampleBtn.classList.remove('hidden');
        showExampleBtn.removeAttribute('hidden');
      }
    }
  });

  showExampleBtn.addEventListener('click', function () {
    // Verified example: Rectangle 8x5 + Square 5x5 joined on 5m side
    s1Shape1Spec = Core.SCENARIO_DATA[1].tiles[4]; // Rectangle 8x5
    s1Shape2Spec = Core.SCENARIO_DATA[1].tiles[1]; // Square 5
    selectSide1.value = 'right';
    selectSide2.value = 'left';
    selectAlignment.value = 'start';

    renderGardenTilePickers();
    updateGardenWorkspace();
    showFeedback(gardenFeedbackBox, 'info', 'Example loaded: Rectangle 8×5 + Square 5×5 (Area: 65 m², Cost: RM 685).');
  });

  // --- Scenario 2 & 3 Step Controller ---
  function renderProgressDots(count) {
    progressDotsContainer.innerHTML = '';
    for (let i = 1; i <= count; i++) {
      const dot = document.createElement('div');
      dot.className = 'progress-dot' + (i === currentStepIndex ? ' active' : '') + (completedSteps[i] ? ' completed' : '');
      progressDotsContainer.appendChild(dot);
    }
  }

  function updateStepWorkspace() {
    const scen = Core.SCENARIO_DATA[currentScenarioId];
    const step = scen.steps.find(s => s.index === currentStepIndex);

    renderProgressDots(scen.steps.length);
    renderStepDiagramSVG(currentScenarioId, currentStepIndex);

    stepNumberTag.textContent = `Step ${currentStepIndex} of ${scen.steps.length}`;
    stepQuestionTitle.textContent = step.question;
    stepTypedInput.value = '';
    hideFeedback(stepFeedbackBox);

    if (step.type === 'mcq') {
      typedInputForm.classList.add('hidden');
      typedInputForm.setAttribute('hidden', 'true');
      mcqInputForm.classList.remove('hidden');
      mcqInputForm.removeAttribute('hidden');

      mcqInputForm.innerHTML = '';
      step.options.forEach((opt, idx) => {
        const btn = document.createElement('button');
        btn.className = 'mcq-btn';
        btn.textContent = opt.text;
        btn.addEventListener('click', () => handleStepSubmit(opt.text));
        mcqInputForm.appendChild(btn);
      });
    } else {
      typedInputForm.classList.remove('hidden');
      typedInputForm.removeAttribute('hidden');
      mcqInputForm.classList.add('hidden');
      mcqInputForm.setAttribute('hidden', 'true');
      stepTypedInput.focus();
    }

    renderStepCalculator();
  }

  function renderStepDiagramSVG(scenId, stepIdx) {
    if (scenId === 2) {
      // Classroom Floor SVG L-shape: Rect A 8x6 + Rect B 4x3 on top at left end
      diagramSvgWrapper.innerHTML = `
        <svg viewBox="0 0 320 220" width="100%" height="220">
          <!-- Rect A (8x6) -->
          <rect x="60" y="90" width="160" height="120" fill="#e3f2fd" stroke="#1565c0" stroke-width="3" />
          <text x="140" y="145" text-anchor="middle" font-weight="bold" fill="#0d47a1" font-size="15">
            <tspan x="140" dy="0">Rectangle A</tspan>
            <tspan x="140" dy="1.2em">(8 m × 6 m)</tspan>
          </text>

          <!-- Rect B (4x3) -->
          <rect x="60" y="30" width="80" height="60" fill="#e8f5e9" stroke="#2e7d32" stroke-width="3" />
          <text x="100" y="55" text-anchor="middle" font-weight="bold" fill="#1b5e20" font-size="13">
            <tspan x="100" dy="0">Rectangle B</tspan>
            <tspan x="100" dy="1.2em">(4 m × 3 m)</tspan>
          </text>

          <!-- Shared Side Dashed Line -->
          <line x1="60" y1="90" x2="140" y2="90" stroke="#d32f2f" stroke-width="4" stroke-dasharray="6,4" />

          <!-- Labels -->
          <text x="140" y="220" text-anchor="middle" font-weight="bold" fill="#1565c0" font-size="13">8 m</text>
          <text x="235" y="155" font-weight="bold" fill="#1565c0" font-size="13">6 m</text>
          <text x="100" y="22" text-anchor="middle" font-weight="bold" fill="#2e7d32" font-size="13">4 m</text>
          <text x="35" y="65" font-weight="bold" fill="#2e7d32" font-size="13">3 m</text>
        </svg>
      `;
    } else if (scenId === 3) {
      // Playground Mat SVG: Rectangle 10x6 + Right Triangle (6, 8, 10)
      diagramSvgWrapper.innerHTML = `
        <svg viewBox="0 0 340 200" width="100%" height="200">
          <!-- Rectangle 10x6 -->
          <rect x="40" y="40" width="160" height="120" fill="#e3f2fd" stroke="#1565c0" stroke-width="3" />
          <text x="120" y="95" text-anchor="middle" font-weight="bold" fill="#0d47a1" font-size="15">
            <tspan x="120" dy="0">Rectangle</tspan>
            <tspan x="120" dy="1.2em">(10 m × 6 m)</tspan>
          </text>

          <!-- Triangle legs 6, 8, hypotenuse 10 -->
          <polygon points="200,40 200,160 280,160" fill="#e8f5e9" stroke="#2e7d32" stroke-width="3" />
          <text x="225" y="115" text-anchor="middle" font-weight="bold" fill="#1b5e20" font-size="13">
            <tspan x="225" dy="0">Triangle</tspan>
            <tspan x="225" dy="1.2em">(½ × 8 × 6)</tspan>
          </text>

          <!-- Shared side -->
          <line x1="200" y1="40" x2="200" y2="160" stroke="#d32f2f" stroke-width="4" stroke-dasharray="6,4" />

          <!-- Labels -->
          <text x="120" y="30" text-anchor="middle" font-weight="bold" fill="#1565c0" font-size="13">10 m</text>
          <text x="120" y="180" text-anchor="middle" font-weight="bold" fill="#1565c0" font-size="13">10 m</text>
          <text x="240" y="180" text-anchor="middle" font-weight="bold" fill="#2e7d32" font-size="13">8 m</text>
          <text x="250" y="95" font-weight="bold" fill="#2e7d32" font-size="13">10 m</text>
        </svg>
      `;
    }
  }

  function renderStepCalculator() {
    const scen = Core.SCENARIO_DATA[currentScenarioId];

    // Compute working based on progress
    let perimStr = 'P = --';
    let areaStr = 'A = --';

    if (currentScenarioId === 2) {
      if (completedSteps[1]) areaStr = 'A1 = 48 m²';
      if (completedSteps[2]) areaStr += ', A2 = 12 m²';
      if (completedSteps[3]) areaStr = 'Total Area = 60 m²';
      if (completedSteps[4]) perimStr = 'Outer Perimeter = 34 m';

      costTableBody.innerHTML = `
        <tr><td>Tiles</td><td>${completedSteps[3] ? '60 m²' : '--'}</td><td>RM 12/m²</td><td>${completedSteps[5] ? 'RM 720' : '--'}</td></tr>
        <tr><td>Skirting</td><td>${completedSteps[4] ? '34 m' : '--'}</td><td>RM 4/m</td><td>${completedSteps[6] ? 'RM 136' : '--'}</td></tr>
        <tr class="total-row"><td colspan="3">TOTAL</td><td>${completedSteps[7] ? 'RM 856' : '--'}</td></tr>
      `;

      if (completedSteps[8] || completedSteps[7]) {
        budgetStatusText.textContent = 'Within Budget';
        budgetLeftText.textContent = 'RM 44 left';
        budgetProgressFill.style.width = '95%';
        budgetProgressFill.className = 'budget-progress-fill green';
      } else {
        budgetStatusText.textContent = 'Budget: RM 900';
        budgetLeftText.textContent = 'RM 900 max';
        budgetProgressFill.style.width = '0%';
      }

    } else if (currentScenarioId === 3) {
      if (completedSteps[1]) areaStr = 'A1 = 60 m²';
      if (completedSteps[2]) areaStr += ', A2 = 24 m²';
      if (completedSteps[3]) areaStr = 'Total Area = 84 m²';
      if (completedSteps[4]) perimStr = 'Outer Perimeter = 44 m';

      costTableBody.innerHTML = `
        <tr><td>Rubber Mat</td><td>${completedSteps[3] ? '84 m²' : '--'}</td><td>RM 20/m²</td><td>${completedSteps[5] ? 'RM 1680' : '--'}</td></tr>
        <tr><td>Rope Fence</td><td>${completedSteps[4] ? '44 m' : '--'}</td><td>RM 5/m</td><td>${completedSteps[6] ? 'RM 220' : '--'}</td></tr>
        <tr class="total-row"><td colspan="3">TOTAL</td><td>${completedSteps[7] ? 'RM 1900' : '--'}</td></tr>
      `;

      if (completedSteps[8] || completedSteps[7]) {
        budgetStatusText.textContent = 'Within Budget';
        budgetLeftText.textContent = 'RM 100 left';
        budgetProgressFill.style.width = '95%';
        budgetProgressFill.className = 'budget-progress-fill green';
      } else {
        budgetStatusText.textContent = 'Budget: RM 2000';
        budgetLeftText.textContent = 'RM 2000 max';
        budgetProgressFill.style.width = '0%';
      }
    }

    calcPerimeterWorking.textContent = perimStr;
    calcAreaWorking.textContent = areaStr;
  }

  function handleStepSubmit(inputValue) {
    const rawVal = (inputValue !== undefined) ? inputValue : stepTypedInput.value;
    const res = Core.checkStepAnswer(currentScenarioId, currentStepIndex, rawVal);

    if (res.status === 'empty') {
      showFeedback(stepFeedbackBox, 'info', res.message);
      return;
    }

    if (res.status === 'correct') {
      completedSteps[currentStepIndex] = true;
      showFeedback(stepFeedbackBox, 'correct', '🎉 Correct!');

      setTimeout(() => {
        if (currentStepIndex < 8) {
          currentStepIndex++;
          updateStepWorkspace();
        } else {
          // Completed scenario
          const starsEarned = Core.calculateStars(currentScenarioId, { wrongAttempts: totalWrongAttempts });
          starsState[currentScenarioId] = Math.max(starsState[currentScenarioId] || 0, starsEarned);
          Core.saveStars(starsState);

          showCompletionModal(currentScenarioId, starsEarned, 'All steps correctly solved!');
        }
      }, 1000);

    } else {
      if (res.isWrongAttempt) {
        totalWrongAttempts++;
      }
      showFeedback(stepFeedbackBox, 'wrong', res.message);
    }
  }

  submitTypedBtn.addEventListener('click', () => handleStepSubmit());
  stepTypedInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') handleStepSubmit();
  });

  stepHintBtn.addEventListener('click', function () {
    const scen = Core.SCENARIO_DATA[currentScenarioId];
    const step = scen.steps.find(s => s.index === currentStepIndex);
    if (step && step.working) {
      showFeedback(stepFeedbackBox, 'info', '💡 Working: ' + step.working);
    }
  });

  // --- Feedback Helpers ---
  function showFeedback(box, type, text) {
    box.className = 'feedback-box ' + type;
    box.textContent = text;
    box.classList.remove('hidden');
    box.removeAttribute('hidden');
  }

  function hideFeedback(box) {
    box.classList.add('hidden');
    box.setAttribute('hidden', 'true');
  }

  // --- Modal & Confetti Logic ---
  function showCompletionModal(scenarioId, starsEarned, summaryMsg) {
    renderStarsContainer(completionStarsContainer, starsEarned);
    completionSummaryText.textContent = summaryMsg;

    completionModal.classList.add('active');
    completionModal.classList.remove('hidden');
    completionModal.removeAttribute('hidden');

    triggerConfetti();
  }

  function hideCompletionModal() {
    completionModal.classList.remove('active');
    completionModal.classList.add('hidden');
    completionModal.setAttribute('hidden', 'true');
  }

  function triggerConfetti() {
    confettiCanvas.classList.remove('hidden');
    confettiCanvas.removeAttribute('hidden');
    const ctx = confettiCanvas.getContext('2d');
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#2196f3', '#4caf50', '#ffeb3b', '#e91e63', '#ff9800'];

    for (let i = 0; i < 60; i++) {
      particles.push({
        x: Math.random() * confettiCanvas.width,
        y: Math.random() * confettiCanvas.height - confettiCanvas.height,
        color: colors[Math.floor(Math.random() * colors.length)],
        size: Math.random() * 8 + 4,
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1
      });
    }

    let frame = 0;
    function animate() {
      ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
      particles.forEach(p => {
        p.y += p.speedY;
        p.x += p.speedX;
        ctx.fillStyle = p.color;
        ctx.fillRect(p.x, p.y, p.size, p.size);
      });

      frame++;
      if (frame < 120) {
        requestAnimationFrame(animate);
      } else {
        ctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
        confettiCanvas.classList.add('hidden');
        confettiCanvas.setAttribute('hidden', 'true');
      }
    }
    animate();
  }

  // Modal event listeners
  modalReplayBtn.addEventListener('click', () => {
    hideCompletionModal();
    if (currentScenarioId) startScenario(currentScenarioId);
  });

  modalNextBtn.addEventListener('click', () => {
    hideCompletionModal();
    if (currentScenarioId && currentScenarioId < 3) {
      startScenario(currentScenarioId + 1);
    } else {
      showHomeView();
    }
  });

  // How to play modal
  function openHowToPlay() {
    howToPlayModal.classList.add('active');
    howToPlayModal.classList.remove('hidden');
    howToPlayModal.removeAttribute('hidden');
  }

  function closeHowToPlay() {
    howToPlayModal.classList.remove('active');
    howToPlayModal.classList.add('hidden');
    howToPlayModal.setAttribute('hidden', 'true');
  }

  if (openHowToPlayBtn) openHowToPlayBtn.addEventListener('click', openHowToPlay);
  if (closeModalBtn) closeModalBtn.addEventListener('click', closeHowToPlay);
  if (modalGotItBtn) modalGotItBtn.addEventListener('click', closeHowToPlay);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      closeHowToPlay();
      hideCompletionModal();
    }
  });

  // --- Attach Scenario Card & Nav Buttons ---
  document.querySelectorAll('.start-scenario-btn').forEach(btn => {
    btn.addEventListener('click', function () {
      const scenId = parseInt(btn.getAttribute('data-scenario'), 10);
      startScenario(scenId);
    });
  });

  backToScenariosBtn.addEventListener('click', showHomeView);

  // Garden select controls change
  selectSide1.addEventListener('change', updateGardenWorkspace);
  selectSide2.addEventListener('change', updateGardenWorkspace);
  selectAlignment.addEventListener('change', updateGardenWorkspace);

  // Initial Load
  updateHomeStarDisplays();
});
