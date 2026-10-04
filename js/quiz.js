/**
 * js/quiz.js
 * Interactive UI and game controller for World 2: Mission Quiz.
 * KSSR Mathematics Year 5 (Space 6.3.1 and 6.3.2)
 */

(function () {
  'use strict';

  // --- GAME STATE ---
  let currentQIndex = 0; // 0 to 9
  let lives = 3;
  let score = 0;
  let streak = 0;
  let usedHint = false;
  let correctCount = 0;
  let isAnswered = false;

  // DOM Elements
  const quizActiveArea = document.getElementById('quiz-active-area');
  const quizFailedCard = document.getElementById('quiz-failed-card');
  const quizResultsCard = document.getElementById('quiz-results-card');

  const quizProgressText = document.getElementById('quiz-progress-text');
  const rocketProgressFill = document.getElementById('rocket-progress-fill');
  const rocketIcon = document.getElementById('rocket-icon');

  const quizLivesVal = document.getElementById('quiz-lives-val');
  const quizScoreVal = document.getElementById('quiz-score-val');

  const qSkillBadge = document.getElementById('q-skill-badge');
  const qText = document.getElementById('q-text');
  const qHintBox = document.getElementById('q-hint-box');
  const btnQuizHint = document.getElementById('btn-quiz-hint');

  const svgShapesLayer = document.getElementById('svg-shapes-layer');
  const svgLabelsLayer = document.getElementById('svg-labels-layer');
  const qAnswersContainer = document.getElementById('q-answers-container');

  const qFeedbackBox = document.getElementById('q-feedback-box');
  const qFeedbackTitle = document.getElementById('q-feedback-title');
  const qFeedbackNote = document.getElementById('q-feedback-note');
  const qFeedbackExplanation = document.getElementById('q-feedback-explanation');
  const btnQuizNext = document.getElementById('btn-quiz-next');

  const btnQuizRetry = document.getElementById('btn-quiz-retry');
  const btnQuizPlayAgain = document.getElementById('btn-quiz-play-again');
  const quizFinalStars = document.getElementById('quiz-final-stars');
  const quizFinalBadge = document.getElementById('quiz-final-badge');
  const quizFinalScoreText = document.getElementById('quiz-final-score-text');

  // --- Initialisation ---
  function init() {
    if (!window.QuizQuestions || !window.QuizCore) return;

    if (btnQuizRetry) btnQuizRetry.addEventListener('click', restartQuiz);
    if (btnQuizPlayAgain) btnQuizPlayAgain.addEventListener('click', restartQuiz);
    if (btnQuizHint) btnQuizHint.addEventListener('click', handleHintClick);
    if (btnQuizNext) btnQuizNext.addEventListener('click', handleNextClick);

    restartQuiz();
  }

  function restartQuiz() {
    currentQIndex = 0;
    lives = 3;
    score = 0;
    streak = 0;
    correctCount = 0;

    if (quizFailedCard) quizFailedCard.classList.add('hidden');
    if (quizResultsCard) quizResultsCard.classList.add('hidden');
    if (quizActiveArea) quizActiveArea.classList.remove('hidden');

    loadQuestion(currentQIndex);
  }

  function loadQuestion(index) {
    const qList = QuizQuestions.questions;
    if (index < 0 || index >= qList.length) {
      showResultsScreen();
      return;
    }

    currentQIndex = index;
    usedHint = false;
    isAnswered = false;

    const q = qList[index];

    // Update Progress and Stats
    if (quizProgressText) quizProgressText.textContent = `Question ${index + 1} of 10`;

    const fillPct = ((index + 1) / 10) * 100;
    if (rocketProgressFill) rocketProgressFill.style.width = `${fillPct}%`;
    if (rocketIcon) rocketIcon.style.left = `${Math.min(fillPct, 95)}%`;

    updateStatsDisplay();

    // Skill & Question Text
    if (qSkillBadge) {
      qSkillBadge.textContent = q.skill === 'perimeter' ? '📏 Perimeter' : '🟩 Area';
      qSkillBadge.style.background = q.skill === 'perimeter' ? '#e3f2fd' : '#e8f5e9';
      qSkillBadge.style.color = q.skill === 'perimeter' ? '#1565c0' : '#2e7d32';
    }

    if (qText) qText.textContent = q.text;

    // Hint Reset
    if (btnQuizHint) {
      btnQuizHint.disabled = false;
      btnQuizHint.classList.remove('btn-primary');
      btnQuizHint.classList.add('btn-secondary');
    }
    if (qHintBox) {
      qHintBox.textContent = '';
      qHintBox.classList.add('hidden');
    }

    // Feedback Reset
    if (qFeedbackBox) qFeedbackBox.classList.add('hidden');

    // Render Diagram & Options
    renderDiagram(q);
    renderAnswers(q);
  }

  function updateStatsDisplay() {
    if (quizLivesVal) {
      let heartsStr = '';
      for (let i = 0; i < lives; i++) heartsStr += '❤️ ';
      quizLivesVal.textContent = heartsStr.trim() || '💀 0';
    }
    if (quizScoreVal) {
      quizScoreVal.textContent = `${score} pts`;
    }
  }

  function handleHintClick() {
    if (usedHint || isAnswered) return;
    usedHint = true;

    const q = QuizQuestions.getQuestion(currentQIndex + 1);
    if (!q) return;

    if (qHintBox) {
      qHintBox.textContent = `💡 Hint: ${q.hint}`;
      qHintBox.classList.remove('hidden');
    }

    if (btnQuizHint) {
      btnQuizHint.disabled = true;
    }
  }

  // --- SVG Diagram Renderer ---
  function renderDiagram(q) {
    svgShapesLayer.innerHTML = '';
    svgLabelsLayer.innerHTML = '';

    const data = q.shapeData;
    if (!data) return;

    let s1 = data.s1;
    let s2 = data.s2;

    if (!s1 || !s2) return;

    const allVertices = [...s1.vertices, ...s2.vertices];
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

    allVertices.forEach(v => {
      if (v.x < minX) minX = v.x;
      if (v.x > maxX) maxX = v.x;
      if (v.y < minY) minY = v.y;
      if (v.y > maxY) maxY = v.y;
    });

    const shapeW = maxX - minX || 1;
    const shapeH = maxY - minY || 1;

    // SVG ViewBox is 400x250. Fit shape with padding
    const scaleFactor = Math.min(260 / shapeW, 170 / shapeH);
    const offsetX = (400 - shapeW * scaleFactor) / 2 - minX * scaleFactor;
    const offsetY = (250 - shapeH * scaleFactor) / 2 - minY * scaleFactor;

    // Draw Shape Polygons
    [s1, s2].forEach(shape => {
      const pointsStr = shape.vertices
        .map(v => `${v.x * scaleFactor + offsetX},${v.y * scaleFactor + offsetY}`)
        .join(' ');

      const polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
      polygon.setAttribute('points', pointsStr);
      polygon.setAttribute('class', 'diagram-polygon');
      svgShapesLayer.appendChild(polygon);
    });

    // Draw Shared Edge (dashed line)
    renderSharedDashedLine(s1, s2, scaleFactor, offsetX, offsetY);

    // Draw Labels based on question type
    renderQuestionLabels(q, scaleFactor, offsetX, offsetY);
  }

  function renderSharedDashedLine(s1, s2, scaleFactor, offsetX, offsetY) {
    const EPS = 1e-4;
    for (const e1 of s1.edges) {
      for (const e2 of s2.edges) {
        if (Math.abs(e1.length - e2.length) < 0.1) {
          const mid1 = { x: (e1.p1.x + e1.p2.x) / 2, y: (e1.p1.y + e1.p2.y) / 2 };
          const mid2 = { x: (e2.p1.x + e2.p2.x) / 2, y: (e2.p1.y + e2.p2.y) / 2 };
          const dist = Math.hypot(mid1.x - mid2.x, mid1.y - mid2.y);

          if (dist < 0.2) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', e1.p1.x * scaleFactor + offsetX);
            line.setAttribute('y1', e1.p1.y * scaleFactor + offsetY);
            line.setAttribute('x2', e1.p2.x * scaleFactor + offsetX);
            line.setAttribute('y2', e1.p2.y * scaleFactor + offsetY);
            line.setAttribute('class', 'diagram-shared-line');
            svgOverlayLayerOrShapes(line);

            const midX = (mid1.x + mid2.x) / 2 * scaleFactor + offsetX;
            const midY = (mid1.y + mid2.y) / 2 * scaleFactor + offsetY;

            const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
            txt.setAttribute('x', midX);
            txt.setAttribute('y', midY);
            txt.setAttribute('class', 'diagram-joined-text');
            txt.textContent = 'joined';
            svgLabelsLayer.appendChild(txt);
            return;
          }
        }
      }
    }
  }

  function svgOverlayLayerOrShapes(el) {
    if (svgShapesLayer) svgShapesLayer.appendChild(el);
  }

  function renderQuestionLabels(q, scaleFactor, offsetX, offsetY) {
    const data = q.shapeData;
    const s1 = data.s1;
    const s2 = data.s2;

    const addText = (x, y, text, cssClass = 'diagram-side-text') => {
      const txt = document.createElementNS('http://www.w3.org/2000/svg', 'text');
      txt.setAttribute('x', x * scaleFactor + offsetX);
      txt.setAttribute('y', y * scaleFactor + offsetY);
      txt.setAttribute('class', cssClass);
      txt.textContent = text;
      svgLabelsLayer.appendChild(txt);
    };

    if (q.id === 1) {
      addText(2, -0.4, '4 cm');
      addText(6, -0.4, '4 cm');
      addText(-0.5, 2, '4 cm');
      addText(8.5, 2, '4 cm');
    } else if (q.id === 2) {
      addText(3.5, -0.4, '7 cm');
      addText(-0.5, 1.5, '3 cm');
      addText(7 + 1.5, -0.4, '3 cm');
      addText(10.5, 1.5, '3 cm');
    } else if (q.id === 3) {
      addText(2, -0.4, '4 cm');
      addText(-0.8, 2, '4 cm');
      addText(8.8, 2, '4 cm');
    } else if (q.id === 4) {
      addText(3, 6.4, '6 cm');
      addText(-0.5, 3, '6 cm');
      addText(6.5, 3, '6 cm');
      addText(1.2, -1.8, '6 cm');
      addText(4.8, -1.8, '6 cm');
    } else if (q.id === 5) {
      addText(1.5, 3.4, '3 cm');
      addText(-0.8, 1.5, '3 cm');
      addText(6.5, 1.5, '3 cm');
    } else if (q.id === 6 || q.id === 7) {
      addText(3, 3.4, '6 cm');
      addText(-0.5, 1.5, '3 cm');
      addText(6.5, 1.5, '3 cm');
      addText(1.2, -0.8, '5 cm');
      addText(4.8, -0.8, '5 cm');

      if (q.id === 7) {
        addText(3, 1.2, 'h = 4 cm', 'diagram-height-text');
      }
    } else if (q.id === 8) {
      addText(2, 4.4, '4 cm');
      addText(-0.5, 2, '4 cm');
      addText(4.5, 2, '4 cm');
      addText(2, 1.8, 'h = 3.5 cm', 'diagram-height-text');
    } else if (q.id === 9) {
      addText(4, 5.4, '8 cm');
      addText(-0.5, 2.5, '5 cm');
      addText(8 + 3, 5.4, '6 cm');
      addText(8 - 0.5, 2.5, '5 cm');

      // Right angle marker for right triangle
      const ra = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      const rx = 8 * scaleFactor + offsetX;
      const ry = 5 * scaleFactor + offsetY;
      ra.setAttribute('d', `M ${rx + 12} ${ry} L ${rx + 12} ${ry - 12} L ${rx} ${ry - 12}`);
      ra.setAttribute('class', 'diagram-right-angle');
      svgLabelsLayer.appendChild(ra);
    } else if (q.id === 10) {
      addText(2.5, -0.4, '5 cm');
      addText(7.5, -0.4, '5 cm');
      addText(-0.5, 2.5, '5 cm');
      addText(10.5, 2.5, '5 cm');
    }
  }

  // --- Answers Renderer ---
  function renderAnswers(q) {
    qAnswersContainer.innerHTML = '';

    if (q.type === 'mcq') {
      const grid = document.createElement('div');
      grid.className = 'mcq-grid';

      // Shuffle options copy
      const shuffledOpts = [...q.options].sort(() => Math.random() - 0.5);

      shuffledOpts.forEach(opt => {
        const btn = document.createElement('button');
        btn.className = 'mcq-opt-btn';
        btn.textContent = `${opt.value} ${q.unit}`;
        btn.addEventListener('click', () => processAnswerSubmission(q, opt.value, btn));
        grid.appendChild(btn);
      });

      qAnswersContainer.appendChild(grid);

    } else if (q.type === 'typed') {
      const row = document.createElement('div');
      row.className = 'typed-input-row';

      row.innerHTML = `
        <label for="typed-answer-input" class="typed-label">Your Answer:</label>
        <input type="text" id="typed-answer-input" class="typed-input" placeholder="0" autocomplete="off" />
        <span class="typed-unit">${q.unit}</span>
        <button id="btn-submit-typed" class="btn btn-primary btn-submit-typed">Submit Answer</button>
      `;

      qAnswersContainer.appendChild(row);

      const input = document.getElementById('typed-answer-input');
      const submitBtn = document.getElementById('btn-submit-typed');

      const submitHandler = () => {
        processAnswerSubmission(q, input ? input.value : '', submitBtn);
      };

      submitBtn.addEventListener('click', submitHandler);
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          submitHandler();
        }
      });
    }
  }

  // --- Process Answer Submission ---
  function processAnswerSubmission(q, userInput, triggerEl) {
    if (isAnswered) return;

    const res = QuizCore.checkAnswer(q, userInput);

    // If empty or non-numeric input
    if (res.status === 'empty') {
      showTypedEmptyWarning();
      return;
    }

    isAnswered = true;

    // Lock options / input
    if (q.type === 'mcq') {
      document.querySelectorAll('.mcq-opt-btn').forEach(b => b.disabled = true);
    } else if (q.type === 'typed') {
      const input = document.getElementById('typed-answer-input');
      const btn = document.getElementById('btn-submit-typed');
      if (input) input.disabled = true;
      if (btn) btn.disabled = true;
    }

    const isCorrect = (res.status === 'correct');

    // Update Score & Streak
    const scoreUpdate = QuizCore.calculateScore(score, isCorrect, streak, usedHint);
    score = scoreUpdate.score;
    streak = scoreUpdate.streak;

    if (isCorrect) {
      correctCount++;
      if (triggerEl && q.type === 'mcq') triggerEl.classList.add('correct-selected');
      triggerConfetti();
      showFeedbackUI(true, '🎉 Correct!', null, q.explanation);
    } else {
      lives--;
      if (triggerEl && q.type === 'mcq') triggerEl.classList.add('wrong-selected');
      triggerShake();
      showFeedbackUI(false, '❌ Not quite', res.note, q.explanation);
    }

    updateStatsDisplay();

    // Check if mission failed (0 lives)
    if (lives <= 0) {
      setTimeout(() => {
        showFailedScreen();
      }, 1500);
    }
  }

  function showTypedEmptyWarning() {
    if (!qFeedbackBox) return;
    if (qFeedbackTitle) qFeedbackTitle.textContent = '⚠️ Type a number first.';
    if (qFeedbackNote) qFeedbackNote.textContent = '';
    if (qFeedbackExplanation) qFeedbackExplanation.textContent = '';

    qFeedbackBox.className = 'quiz-feedback-box incorrect';
    qFeedbackBox.classList.remove('hidden');
    if (btnQuizNext) btnQuizNext.classList.add('hidden');
  }

  function showFeedbackUI(isCorrect, titleText, noteText, explanationText) {
    if (!qFeedbackBox) return;

    if (qFeedbackTitle) qFeedbackTitle.textContent = titleText;

    if (qFeedbackNote) {
      if (noteText) {
        qFeedbackNote.textContent = `Common mistake: ${noteText}`;
        qFeedbackNote.classList.remove('hidden');
      } else {
        qFeedbackNote.textContent = '';
        qFeedbackNote.classList.add('hidden');
      }
    }

    if (qFeedbackExplanation) {
      qFeedbackExplanation.textContent = `Explanation: ${explanationText}`;
    }

    qFeedbackBox.className = `quiz-feedback-box ${isCorrect ? 'correct' : 'incorrect'}`;
    qFeedbackBox.classList.remove('hidden');

    if (btnQuizNext) {
      btnQuizNext.classList.remove('hidden');
      btnQuizNext.textContent = currentQIndex === 9 ? 'See Results 🏆' : 'Next Question ➡️';
    }
  }

  function handleNextClick() {
    if (lives <= 0) {
      showFailedScreen();
      return;
    }

    if (currentQIndex + 1 < 10) {
      loadQuestion(currentQIndex + 1);
    } else {
      showResultsScreen();
    }
  }

  function showFailedScreen() {
    if (quizActiveArea) quizActiveArea.classList.add('hidden');
    if (quizFailedCard) quizFailedCard.classList.remove('hidden');
  }

  function showResultsScreen() {
    if (quizActiveArea) quizActiveArea.classList.add('hidden');
    if (quizResultsCard) quizResultsCard.classList.remove('hidden');

    const rating = QuizCore.getStarRating(correctCount);

    let starsStr = '';
    for (let i = 0; i < rating.stars; i++) starsStr += '⭐ ';
    if (rating.stars === 0) starsStr = '☆ ☆ ☆';

    if (quizFinalStars) quizFinalStars.textContent = starsStr.trim();
    if (quizFinalBadge) quizFinalBadge.textContent = rating.title;
    if (quizFinalScoreText) quizFinalScoreText.textContent = `Final Score: ${score} points (${correctCount}/10 correct)`;

    try {
      localStorage.setItem('paq_quiz_stars', rating.stars.toString());
    } catch (e) {
      // Storage unavailable
    }

    if (rating.stars > 0) {
      triggerConfetti();
    }
  }

  function triggerConfetti() {
    const colors = ['#f44336', '#e91e63', '#9c27b0', '#3f51b5', '#2196f3', '#4caf50', '#ffeb3b', '#ff9800'];
    for (let i = 0; i < 35; i++) {
      const conf = document.createElement('div');
      conf.className = 'confetti-piece';
      conf.style.left = Math.random() * 100 + 'vw';
      conf.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      conf.style.animationDuration = (1.5 + Math.random() * 1.5) + 's';
      document.body.appendChild(conf);
      setTimeout(() => conf.remove(), 2800);
    }
  }

  function triggerShake() {
    const mainCard = document.querySelector('.main-question-card');
    if (mainCard) {
      mainCard.style.animation = 'shake 0.4s ease';
      setTimeout(() => mainCard.style.animation = '', 450);
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
