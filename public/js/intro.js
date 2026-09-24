/* ================= INTRO SPLASH (simulated demo) ================= */
(function () {
  const introScreen = document.getElementById('introScreen');
  const introTyped = document.getElementById('introTyped');
  const introInputEl = document.getElementById('introInput');
  const introThinking = document.getElementById('introThinking');
  const introTagline = document.getElementById('introTagline');
  const introSkipBtn = document.getElementById('introSkip');
  const introNextBtn = document.getElementById('introNext');
  const introSlideTrack = document.getElementById('introSlideTrack');
  const introSlideBudget = document.getElementById('introSlideBudget');
  const introSlideChecklist = document.getElementById('introSlideChecklist');
  const introResultEl = document.getElementById('introResult');
  const introBgReveal = document.getElementById('introBgReveal');
  if (!introScreen) return;

  const DEMO_TEXT = "Plan a 34th birthday party, cactus themed, happening in 10 days, budget $2000.";
  const BUDGET_TARGET = 2000;
  const CHECKLIST_ITEMS = [
    { text: 'Lock the venue', done: false },
    { text: 'Order the cake', done: false }
  ];

  let timers = [];
  let introActive = true;
  function after(ms, fn) { timers.push(setTimeout(fn, ms)); }
  function clearAllTimers() { timers.forEach(clearTimeout); timers = []; }

  function finishIntro() {
    introActive = false;
    clearAllTimers();
    introScreen.style.display = 'none';
    if (introSkipBtn) introSkipBtn.style.display = 'none';
  }
  if (introSkipBtn) introSkipBtn.addEventListener('click', finishIntro);
  if (introNextBtn) introNextBtn.addEventListener('click', finishIntro);

  const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (reduceMotion) { finishIntro(); return; }

  let i = 0;
  function typeStep() {
    if (i <= DEMO_TEXT.length) {
      introTyped.textContent = DEMO_TEXT.slice(0, i);
      i++;
      timers.push(setTimeout(typeStep, 22 + Math.random() * 20));
    } else {
      introInputEl.classList.add('done');
      after(250, showThinking);
    }
  }
  after(300, typeStep);

  function showThinking() {
    introThinking.classList.add('show');
    after(750, () => {
      introThinking.classList.remove('show');
      showBudgetCard();
    });
  }

  function showBudgetCard() {
    introSlideBudget.innerHTML = `<div class="atom-wrap">${renderAtom('budget', { label: 'Party Budget', spent: 0, limit: BUDGET_TARGET })}</div>`;
    requestAnimationFrame(() => introSlideBudget.classList.add('reveal'));
    after(350, () => animateBudgetCount(1100, () => {
      after(500, slideToChecklist);
    }));
  }

  function animateBudgetCount(duration, onDone) {
    const start = performance.now();
    function tick(now) {
      if (!introActive) return;
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const current = Math.round(BUDGET_TARGET * eased);
      introSlideBudget.innerHTML = `<div class="atom-wrap">${renderAtom('budget', { label: 'Party Budget', spent: current, limit: BUDGET_TARGET })}</div>`;
      if (t < 1) {
        requestAnimationFrame(tick);
      } else if (onDone) {
        onDone();
      }
    }
    requestAnimationFrame(tick);
  }

  function slideToChecklist() {
    introSlideChecklist.innerHTML = `<div class="atom-wrap">${renderAtom('checklist', { title: 'Open Action Items', items: CHECKLIST_ITEMS })}</div>`;
    requestAnimationFrame(() => introSlideChecklist.classList.add('reveal'));
    introSlideTrack.classList.add('slide-2');
    after(650, checkItemsOneAtATime);
  }

  function checkItemsOneAtATime() {
    let idx = 0;
    function checkNext() {
      if (idx >= CHECKLIST_ITEMS.length) {
        after(500, wrapUp);
        return;
      }
      CHECKLIST_ITEMS[idx].done = true;
      introSlideChecklist.innerHTML = `<div class="atom-wrap">${renderAtom('checklist', { title: 'Open Action Items', items: CHECKLIST_ITEMS })}</div>`;
      if (CHECKLIST_ITEMS[idx].text === 'Order the cake' && introBgReveal) {
        introBgReveal.classList.add('show');
      }
      idx++;
      after(600, checkNext);
    }
    checkNext();
  }

  function wrapUp() {
    introResultEl.classList.add('slide-off');
    after(450, () => {
      introTagline.classList.add('reveal');
      if (introNextBtn) introNextBtn.classList.add('show');
    });
  }
})();
