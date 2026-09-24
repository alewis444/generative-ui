/* ---------- Scale: optimistic paint -> diff -> sync -> HMR pipeline demo ---------- */
(function () {
  const runBtn = document.getElementById('scaleRunBtn');
  const badge = document.getElementById('scaleBadge');
  const fill = document.getElementById('scaleFill');
  const diff = document.getElementById('scaleDiff');
  const steps = Array.from(document.querySelectorAll('#scalePipeline .scale-step'));
  if (!runBtn) return;

  let isAccent = false; // toggles each run so there's always a visible before/after

  function resetPipeline() {
    steps.forEach(s => s.classList.remove('active', 'done'));
    diff.classList.remove('show');
    badge.className = 'scale-badge';
    badge.textContent = 'idle';
  }

  function setStep(i, state) {
    steps[i].classList.remove('active', 'done');
    steps[i].classList.add(state);
  }

  runBtn.addEventListener('click', () => {
    runBtn.disabled = true;
    resetPipeline();

    const goingToAccent = !isAccent;
    diff.textContent = goingToAccent
      ? 'fill.background: var(--stage1) → var(--accent)'
      : 'fill.background: var(--accent) → var(--stage1)';
    runBtn.textContent = `Run the edit: budget bar → ${goingToAccent ? 'accent' : 'original'} color`;

    // Step 1: optimistic paint — the preview updates immediately, before anything is confirmed
    setStep(0, 'active');
    fill.classList.toggle('accent', goingToAccent);
    badge.className = 'scale-badge optimistic';
    badge.textContent = 'optimistic';

    setTimeout(() => {
      setStep(0, 'done');
      setStep(1, 'active');
      diff.classList.add('show');
    }, 500);

    setTimeout(() => {
      setStep(1, 'done');
      setStep(2, 'active');
    }, 1000);

    setTimeout(() => {
      setStep(2, 'done');
      setStep(3, 'active');
    }, 1500);

    setTimeout(() => {
      setStep(3, 'done');
      badge.className = 'scale-badge confirmed';
      badge.textContent = 'confirmed';
      isAccent = goingToAccent;
      runBtn.disabled = false;
      runBtn.textContent = `Run the edit: budget bar → ${isAccent ? 'original' : 'accent'} color`;
    }, 2000);
  });
})();

