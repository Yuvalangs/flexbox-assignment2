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
  const checkBtn = document.getElementById('checkBtn');
  const nextBtn = document.getElementById('nextBtn');
  const feedback = document.getElementById('feedback');
  const levelPicker = document.getElementById('levelPicker');
  const scoreIndicator = document.getElementById('scoreIndicator');
  const attemptsIndicator = document.getElementById('attemptsIndicator');

  const STORAGE_KEY = 'flex-space-progress';

  let currentIndex = 0;
  let styles = {};
  let attempts = 0;
  let progress = { completed: [], score: 0, lastLevel: 0 };

  /* טעינת ההתקדמות השמורה מהדפדפן */
  function loadProgress() {
    try {
      const saved = JSON.parse(window.localStorage.getItem(STORAGE_KEY));
      if (saved && Array.isArray(saved.completed)) {
        progress = {
          completed: saved.completed.filter(function (i) { return i < LEVELS.length; }),
          score: saved.score || 0,
          lastLevel: saved.lastLevel || 0
        };
      }
    } catch (err) {
      progress = { completed: [], score: 0, lastLevel: 0 };
    }
  }

  function saveProgress() {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    } catch (err) {
      /* אם אחסון מקומי חסום, המשחק ימשיך לעבוד ללא שמירה */
    }
  }

  function isCompleted(index) {
    return progress.completed.indexOf(index) !== -1;
  }

  /* השלב הגבוה ביותר שנפתח לשחקן */
  function highestUnlocked() {
    let unlocked = 0;
    while (unlocked < LEVELS.length - 1 && isCompleted(unlocked)) {
      unlocked++;
    }
    return unlocked;
  }

  function updateStats() {
    scoreIndicator.textContent = 'ניקוד: ' + progress.score;
    attemptsIndicator.textContent = 'ניסיונות בשלב: ' + attempts;
  }

  /* כפתורי מעבר בין שלבים שכבר נפתחו */
  function renderPicker() {
    levelPicker.innerHTML = '';
    const unlocked = highestUnlocked();
    LEVELS.forEach(function (level, index) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'level-dot';
      dot.textContent = index + 1;
      dot.title = level.title;
      if (isCompleted(index)) { dot.classList.add('done'); }
      if (index === currentIndex) { dot.classList.add('current'); }
      dot.disabled = index > unlocked && !isCompleted(index);
      dot.addEventListener('click', function () { loadLevel(index); });
      levelPicker.appendChild(dot);
    });
  }

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
    attempts = 0;
    missionText.textContent = level.mission;
    levelIndicator.textContent = 'שלב ' + (index + 1) + ' מתוך ' + LEVELS.length;
    hintBox.textContent = level.hint;
    hintBox.hidden = true;

    board.classList.remove('solved', 'wrong');
    showMessage('', '');
    checkBtn.disabled = false;
    nextBtn.hidden = true;

    renderShips(level);
    renderControls(level);
    renderPicker();
    updateStats();
    applyStyles();
  }

  /* בדיקה האם הערכים שנבחרו תואמים לפתרון של השלב */
  function isSolved(level) {
    return Object.keys(level.solution).every(function (prop) {
      return level.solution[prop].indexOf(styles[prop]) !== -1;
    });
  }

  function showMessage(text, type) {
    feedback.textContent = text;
    feedback.className = 'feedback ' + type;
  }

  /* בדיקת הפתרון של המשתמש */
  function checkSolution() {
    const level = LEVELS[currentIndex];

    attempts++;
    updateStats();

    if (isSolved(level)) {
      if (!isCompleted(currentIndex)) {
        progress.completed.push(currentIndex);
        progress.score += Math.max(20, 100 - (attempts - 1) * 20);
      }
      progress.lastLevel = Math.min(currentIndex + 1, LEVELS.length - 1);
      saveProgress();
      updateStats();
      renderPicker();

      board.classList.add('solved');
      showMessage('כל הכבוד! הסידור נכון.', 'ok');
      checkBtn.disabled = true;
      nextBtn.hidden = currentIndex === LEVELS.length - 1;
      if (currentIndex === LEVELS.length - 1) {
        showMessage('סיימתם את כל השלבים! כל הכבוד.', 'ok');
      }
    } else {
      board.classList.remove('solved');
      board.classList.add('wrong');
      window.setTimeout(function () { board.classList.remove('wrong'); }, 450);
      showMessage('עדיין לא. בדקו את הסידור המבוקש ונסו שוב.', 'bad');
    }
  }

  /* מעבר לשלב הבא, ללא טעינה מחדש של העמוד */
  function nextLevel() {
    if (currentIndex < LEVELS.length - 1) {
      loadLevel(currentIndex + 1);
    }
  }

  /* איפוס השלב הנוכחי לערכי ברירת המחדל */
  function resetLevel() {
    styles = startStyles(LEVELS[currentIndex]);
    board.classList.remove('solved', 'wrong');
    showMessage('השלב אופס לערכי ברירת המחדל.', '');
    checkBtn.disabled = false;
    nextBtn.hidden = true;
    renderControls(LEVELS[currentIndex]);
    applyStyles();
  }

  hintBtn.addEventListener('click', function () {
    hintBox.hidden = !hintBox.hidden;
    hintBtn.textContent = hintBox.hidden ? 'הצגת רמז' : 'הסתרת רמז';
  });

  resetBtn.addEventListener('click', resetLevel);
  checkBtn.addEventListener('click', checkSolution);
  nextBtn.addEventListener('click', nextLevel);

  loadProgress();
  loadLevel(Math.min(progress.lastLevel, LEVELS.length - 1));
})();
