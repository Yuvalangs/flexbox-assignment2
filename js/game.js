(function () {
  'use strict';

  const board = document.getElementById('board');
  const controlsBox = document.getElementById('controls');
  const codePreview = document.getElementById('codePreview');
  const missionText = document.getElementById('missionText');
  const hintBox = document.getElementById('hintBox');
  const hintBtn = document.getElementById('hintBtn');
  const levelIndicator = document.getElementById('levelIndicator');
  const resetBtn = document.getElementById('resetBtn');

  let currentIndex = 0;
  let styles = {};

  /* ערכי הפתיחה של שלב מסוים */
  function startStyles(level) {
    return Object.assign({}, DEFAULT_STYLES, level.start || {});
  }

  /* ציור החלליות בתוך הלוח */
  function renderShips(level) {
    board.innerHTML = '';
    for (let i = 1; i <= level.ships; i++) {
      const ship = document.createElement('div');
      ship.className = 'ship';
      ship.innerHTML = '<span aria-hidden="true">' + level.icon + '</span><span class="num">' + i + '</span>';
      ship.setAttribute('aria-label', 'חללית מספר ' + i);
      board.appendChild(ship);
    }
  }

  /* החלת הערכים הנוכחיים על הלוח */
  function applyStyles() {
    Object.keys(DEFAULT_STYLES).forEach(function (prop) {
      board.style.setProperty(prop, styles[prop]);
    });
    renderCode();
  }

  /* תצוגת הקוד שנוצר מהבחירות של המשתמש */
  function renderCode() {
    const level = LEVELS[currentIndex];
    const shown = ['display'].concat(level.controls.filter(function (p) { return p !== 'display'; }));
    const lines = shown.map(function (prop) {
      return '  ' + prop + ': ' + styles[prop] + ';';
    });
    codePreview.textContent = '.board {\n' + lines.join('\n') + '\n}';
  }

  /* בניית תפריטי הבחירה של השלב */
  function renderControls(level) {
    controlsBox.innerHTML = '';
    level.controls.forEach(function (prop) {
      const wrap = document.createElement('div');
      wrap.className = 'control';

      const label = document.createElement('label');
      label.textContent = prop;
      label.setAttribute('for', 'ctrl-' + prop);

      const select = document.createElement('select');
      select.id = 'ctrl-' + prop;
      PROPERTY_OPTIONS[prop].forEach(function (value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        select.appendChild(option);
      });
      select.value = styles[prop];
      select.addEventListener('change', function () {
        styles[prop] = select.value;
        applyStyles();
      });

      wrap.appendChild(label);
      wrap.appendChild(select);
      controlsBox.appendChild(wrap);
    });
  }

  /* טעינת שלב */
  function loadLevel(index) {
    currentIndex = index;
    const level = LEVELS[index];

    styles = startStyles(level);
    missionText.textContent = level.mission;
    levelIndicator.textContent = 'שלב ' + (index + 1) + ' מתוך ' + LEVELS.length;
    hintBox.textContent = level.hint;
    hintBox.hidden = true;

    renderShips(level);
    renderControls(level);
    applyStyles();
  }

  /* איפוס השלב הנוכחי לערכי ברירת המחדל */
  function resetLevel() {
    styles = startStyles(LEVELS[currentIndex]);
    renderControls(LEVELS[currentIndex]);
    applyStyles();
  }

  hintBtn.addEventListener('click', function () {
    hintBox.hidden = !hintBox.hidden;
    hintBtn.textContent = hintBox.hidden ? 'הצגת רמז' : 'הסתרת רמז';
  });

  resetBtn.addEventListener('click', resetLevel);

  loadLevel(0);
})();
