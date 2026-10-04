/**
 * js/home.js
 * Script for the front page (index.html) of Perimeter and Area Quest.
 */

document.addEventListener('DOMContentLoaded', function () {
  'use strict';

  // --- Star Ratings from localStorage ---
  function getStars(key) {
    try {
      const val = localStorage.getItem(key);
      if (!val) return 0;
      const parsed = parseInt(val, 10);
      return isNaN(parsed) ? 0 : Math.max(0, Math.min(3, parsed));
    } catch (e) {
      console.warn('localStorage read failed for key:', key, e);
      return 0;
    }
  }

  function renderStarsContainer(containerId, starCount) {
    const container = document.getElementById(containerId);
    if (!container) return;

    container.innerHTML = '';
    for (let i = 1; i <= 3; i++) {
      const isFilled = i <= starCount;
      const svgNS = "http://www.w3.org/2000/svg";
      const svg = document.createElementNS(svgNS, "svg");
      svg.setAttribute("viewBox", "0 0 24 24");
      if (!isFilled) {
        svg.setAttribute("class", "empty");
      }

      const path = document.createElementNS(svgNS, "path");
      path.setAttribute("d", "M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z");
      svg.appendChild(path);

      container.appendChild(svg);
    }
  }

  // Load star counts for each world
  renderStarsContainer('stars-lab', getStars('paq_lab_stars'));
  renderStarsContainer('stars-quiz', getStars('paq_quiz_stars'));
  renderStarsContainer('stars-reallife', getStars('paq_reallife_stars'));

  // --- Modal Logic ("How to Play") ---
  const modalOverlay = document.getElementById('how-to-play-modal');
  const openModalBtn = document.getElementById('open-how-to-play');
  const closeModalBtn = document.getElementById('close-modal-btn');

  function openModal() {
    if (modalOverlay) {
      modalOverlay.classList.add('active');
      modalOverlay.setAttribute('aria-hidden', 'false');
      if (closeModalBtn) closeModalBtn.focus();
    }
  }

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('active');
      modalOverlay.setAttribute('aria-hidden', 'true');
      if (openModalBtn) openModalBtn.focus();
    }
  }

  if (openModalBtn) {
    openModalBtn.addEventListener('click', openModal);
  }

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', closeModal);
  }

  if (modalOverlay) {
    modalOverlay.addEventListener('click', function (e) {
      if (e.target === modalOverlay) {
        closeModal();
      }
    });
  }

  // Handle Escape key to close modal
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' || e.key === 'Esc') {
      if (modalOverlay && modalOverlay.classList.contains('active')) {
        closeModal();
      }
    }
  });
});
