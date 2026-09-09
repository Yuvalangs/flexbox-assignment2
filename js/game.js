/* ==========================================================================
   Flex Burger Kitchen — game engine
   The prep board holds two identical flex containers stacked on top of each
   other: the target layer (plates laid out with the solution) and the player
   layer (ingredients laid out with whatever the player picks).
   ========================================================================== */

(function () {
  'use strict';

  // ---- DOM ---------------------------------------------------------------
  const $ = (id) => document.getElementById(id);

  const boardWrap    = $('board-wrap');
  const board        = $('board');
  const targetLayer  = $('target-layer');
  const playerLayer  = $('player-layer');
  const stageEl      = $('stage-indicator');
  const ticketNo     = $('ticket-no');
  const ticketMeta   = $('ticket-meta');
  const ticketTitle  = $('ticket-title');
  const ticketText   = $('ticket-text');
  const ticketHint   = $('ticket-hint');

  const selects = {};
  FLEX_PROPS.forEach((prop) => { selects[prop] = $(prop); });

  // ---- State -------------------------------------------------------------
  const state = {
    index: 0
  };

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

  function loadLevel(index) {
    state.index = index;
    const level = currentLevel();
    const target = { ...level.initial, ...level.solution };

    // Ticket
    ticketNo.textContent = `ORDER #${level.id}`;
    ticketMeta.textContent = level.meta || '';
    ticketTitle.textContent = level.title;
    ticketText.textContent = level.order;
    ticketHint.innerHTML = level.hint;
    ticketHint.parentElement.open = false;

    stageEl.textContent = `Order ${level.id} of ${LEVELS.length}`;
    document.title = `Order ${level.id}: ${level.title} — Flex Burger Kitchen`;

    // Board
    board.classList.toggle('lg', level.size === 'lg');

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
    selects[prop].addEventListener('change', syncPlayerLayer);
  });

  window.addEventListener('resize', fitBoard);

  // ---- Boot --------------------------------------------------------------
  loadLevel(0);
  fitBoard();
})();
