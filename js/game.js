/* ==========================================================================
   Flex Burger Kitchen — game engine
   The prep board holds two identical flex containers stacked on top of each
   other: the target layer (plates laid out with the solution) and the player
   layer (ingredients laid out with whatever the player picks). An order is
   complete when every ingredient sits exactly on its plate.
   ========================================================================== */

(function () {
  'use strict';

  const STORAGE_KEY = 'flex-burger-kitchen:progress';
  const TOLERANCE = 1; // px — how far an ingredient may sit from its plate

  // ---- DOM ---------------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  const boardWrap    = $('board-wrap');
  const board        = $('board');
  const targetLayer  = $('target-layer');
  const playerLayer  = $('player-layer');
  const badge        = $('badge');
  const progressEl   = $('progress');
  const stageEl      = $('stage-indicator');
  const ticket       = $('ticket');
  const ticketNo     = $('ticket-no');
  const ticketMeta   = $('ticket-meta');
  const ticketTitle  = $('ticket-title');
  const ticketText   = $('ticket-text');
  const ticketHint   = $('ticket-hint');
  const ticketStatus = $('ticket-status');
  const attemptsEl   = $('attempts');
  const prevBtn      = $('prev-btn');
  const nextBtn      = $('next-btn');
  const serveBtn     = $('serve-btn');
  const resetBtn     = $('reset-btn');

  const selects = {};
  FLEX_PROPS.forEach((prop) => { selects[prop] = $(prop); });

  // ---- State -------------------------------------------------------------
  const state = {
    index: 0,
    completed: loadProgress(),
    attempts: {},   // level id -> serve attempts this session
    solved: false   // has the current order been served correctly
  };

  function loadProgress() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return new Set(raw ? JSON.parse(raw) : []);
    } catch (e) {
      return new Set();
    }
  }

  function saveProgress() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...state.completed]));
    } catch (e) { /* storage unavailable — progress just won't persist */ }
  }

  function currentLevel() {
    return LEVELS[state.index];
  }

  // ---- Rendering ---------------------------------------------------------
  function makeItem(type, className) {
    const el = document.createElement('div');
    el.className = `${className} type-${type}`;
    el.title = INGREDIENT_LABELS[type] || type;
    return el;
  }

  function applyFlex(container, values) {
    FLEX_PROPS.forEach((prop) => {
      container.style.setProperty(prop, values[prop]);
    });
  }

  function readControls() {
    const values = {};
    FLEX_PROPS.forEach((prop) => { values[prop] = selects[prop].value; });
    return values;
  }

  function setControls(values) {
    FLEX_PROPS.forEach((prop) => { selects[prop].value = values[prop]; });
  }

  /** Push the current select values onto the player container (live update). */
  function syncPlayerLayer() {
    applyFlex(playerLayer, readControls());
  }

  function renderProgress() {
    progressEl.innerHTML = '';
    LEVELS.forEach((level, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'progress-dot';
      if (state.completed.has(level.id)) dot.classList.add('done');
      if (i === state.index) dot.classList.add('current');
      dot.textContent = state.completed.has(level.id) && i !== state.index ? '✓' : String(level.id);
      dot.title = `Order ${level.id}: ${level.title}`;
      dot.setAttribute('aria-label', dot.title);
      dot.addEventListener('click', () => goTo(i));
      progressEl.appendChild(dot);
    });
  }

  function setStatus(message, kind) {
    ticketStatus.textContent = message || '';
    ticketStatus.className = 'ticket-status' + (kind ? ` ${kind}` : '');
  }

  function loadLevel(index) {
    state.index = index;
    state.solved = false;
    const level = currentLevel();
    const target = { ...level.initial, ...level.solution };

    // Ticket
    ticketNo.textContent = `ORDER #${level.id}`;
    ticketMeta.textContent = level.meta || '';
    ticketTitle.textContent = level.title;
    ticketText.textContent = level.order;
    ticketHint.innerHTML = level.hint;
    ticketHint.parentElement.open = false;
    ticket.classList.toggle('done', state.completed.has(level.id));
    setStatus('');

    stageEl.textContent = `Order ${level.id} of ${LEVELS.length}`;
    document.title = `Order ${level.id}: ${level.title} — Flex Burger Kitchen`;

    // Board
    board.classList.toggle('lg', level.size === 'lg');
    boardWrap.classList.remove('shake');
    hideBadge();

    targetLayer.innerHTML = '';
    playerLayer.innerHTML = '';
    level.ingredients.forEach((type) => {
      targetLayer.appendChild(makeItem(type, 'plate'));
      playerLayer.appendChild(makeItem(type, 'ing'));
    });
    applyFlex(targetLayer, target);

    // Controls: only the properties this order teaches are unlocked
    FLEX_PROPS.forEach((prop) => {
      const unlocked = level.controls.includes(prop);
      selects[prop].disabled = !unlocked;
      selects[prop].parentElement.classList.toggle('locked', !unlocked);
    });
    setControls(level.initial);
    syncPlayerLayer();

    // Attempts + navigation
    attemptsEl.textContent = state.attempts[level.id] || 0;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === LEVELS.length - 1;
    nextBtn.classList.remove('pulse');
    serveBtn.disabled = false;

    renderProgress();
  }

  function goTo(index) {
    if (index < 0 || index >= LEVELS.length) return;
    loadLevel(index);
  }

  // ---- Validation --------------------------------------------------------
  /**
   * Compare the laid-out box of every ingredient with its plate. Using
   * offset* values keeps the check independent of the responsive scale
   * transform applied to the board.
   */
  function checkOrder() {
    const plates = targetLayer.children;
    const ings = playerLayer.children;
    let misplaced = 0;

    [...ings].forEach((el) => el.classList.remove('misplaced'));
    void playerLayer.offsetWidth; // let the flash animation replay on repeat serves

    for (let i = 0; i < ings.length; i++) {
      const a = ings[i];
      const b = plates[i];
      const off =
        Math.abs(a.offsetLeft - b.offsetLeft) > TOLERANCE ||
        Math.abs(a.offsetTop - b.offsetTop) > TOLERANCE ||
        Math.abs(a.offsetWidth - b.offsetWidth) > TOLERANCE ||
        Math.abs(a.offsetHeight - b.offsetHeight) > TOLERANCE;
      a.classList.toggle('misplaced', off);
      if (off) misplaced++;
    }
    return { ok: misplaced === 0, misplaced, total: ings.length };
  }

  function serveOrder() {
    const level = currentLevel();
    state.attempts[level.id] = (state.attempts[level.id] || 0) + 1;
    attemptsEl.textContent = state.attempts[level.id];

    const result = checkOrder();
    if (result.ok) {
      completeOrder();
    } else {
      const noun = result.misplaced === 1 ? 'ingredient is' : 'ingredients are';
      setStatus(`Sent back! ${result.misplaced} of ${result.total} ${noun} off the plate.`, 'error');
      boardWrap.classList.remove('shake');
      void boardWrap.offsetWidth; // restart the animation
      boardWrap.classList.add('shake');
    }
  }

  function completeOrder() {
    const level = currentLevel();
    state.solved = true;
    state.completed.add(level.id);
    saveProgress();

    setStatus('Order complete! Perfectly plated.', 'ok');
    ticket.classList.add('done');
    serveBtn.disabled = true;
    showBadge();
    if (state.index < LEVELS.length - 1) nextBtn.classList.add('pulse');
    renderProgress();
  }

  function resetOrder() {
    const level = currentLevel();
    setControls(level.initial);
    syncPlayerLayer();
    state.solved = false;
    serveBtn.disabled = false;
    hideBadge();
    boardWrap.classList.remove('shake');
    [...playerLayer.children].forEach((el) => el.classList.remove('misplaced'));
    setStatus('Order reset to the starting recipe.');
  }

  // ---- Celebration -------------------------------------------------------
  function showBadge() {
    badge.classList.add('show');
    spawnConfetti();
  }

  function hideBadge() {
    badge.classList.remove('show');
    board.querySelectorAll('.confetti').forEach((c) => c.remove());
  }

  function spawnConfetti() {
    const colors = ['#d62828', '#f4b400', '#6a994e', '#fff8e7', '#f2b866'];
    for (let i = 0; i < 40; i++) {
      const piece = document.createElement('span');
      piece.className = 'confetti';
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = colors[i % colors.length];
      piece.style.animationDelay = `${Math.random() * 0.6}s`;
      piece.style.animationDuration = `${1.6 + Math.random() * 1.2}s`;
      piece.style.transform = `rotate(${Math.random() * 360}deg)`;
      board.appendChild(piece);
    }
  }

  // ---- Responsive board scaling -----------------------------------------
  /** The board is always 600x400; scale it down to fit narrow screens. */
  function fitBoard() {
    const available = boardWrap.parentElement.clientWidth;
    const scale = Math.min(1, available / board.offsetWidth);
    board.style.transform = `scale(${scale})`;
    boardWrap.style.width = `${board.offsetWidth * scale}px`;
    boardWrap.style.height = `${board.offsetHeight * scale}px`;
  }

  // ---- Events ------------------------------------------------------------
  FLEX_PROPS.forEach((prop) => {
    selects[prop].addEventListener('change', () => {
      syncPlayerLayer();
      if (state.solved) return;
      [...playerLayer.children].forEach((el) => el.classList.remove('misplaced'));
      setStatus('');
    });
  });

  serveBtn.addEventListener('click', serveOrder);
  resetBtn.addEventListener('click', resetOrder);
  prevBtn.addEventListener('click', () => goTo(state.index - 1));
  nextBtn.addEventListener('click', () => goTo(state.index + 1));

  document.addEventListener('keydown', (e) => {
    if (e.target.tagName === 'SELECT') return;
    if (e.key === 'ArrowRight') goTo(state.index + 1);
    if (e.key === 'ArrowLeft') goTo(state.index - 1);
    if (e.key === 'Enter') serveOrder();
  });

  window.addEventListener('resize', fitBoard);

  // ---- Boot --------------------------------------------------------------
  loadLevel(0);
  fitBoard();
})();
