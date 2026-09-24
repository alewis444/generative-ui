/* ---------- Stage switcher ---------- */
const stage1Btn = document.getElementById('tabStage1');
const stage2Btn = document.getElementById('tabStage2');
const stage3Btn = document.getElementById('tabStage3');
const stage4Btn = document.getElementById('tabStage4');
const stage5Btn = document.getElementById('tabStage5');
const stage6Btn = document.getElementById('tabStage6');
const stage1View = document.getElementById('stage1View');
const stage2View = document.getElementById('stage2View');
const stage3View = document.getElementById('stage3View');
const stage4View = document.getElementById('stage4View');
const stage5View = document.getElementById('stage5View');
const stage6View = document.getElementById('stage6View');

function showStage(n) {
  stage1View.style.display = n === 1 ? 'block' : 'none';
  stage2View.style.display = n === 2 ? 'block' : 'none';
  stage3View.style.display = n === 3 ? 'block' : 'none';
  stage4View.style.display = n === 4 ? 'block' : 'none';
  stage5View.style.display = n === 5 ? 'block' : 'none';
  stage6View.style.display = n === 6 ? 'block' : 'none';
  stage1Btn.classList.toggle('active', n === 1);
  stage2Btn.classList.toggle('active', n === 2);
  stage3Btn.classList.toggle('active', n === 3);
  stage4Btn.classList.toggle('active', n === 4);
  stage5Btn.classList.toggle('active', n === 5);
  stage6Btn.classList.toggle('active', n === 6);
}
stage1Btn.addEventListener('click', () => showStage(1));
stage2Btn.addEventListener('click', () => showStage(2));
stage3Btn.addEventListener('click', () => showStage(3));
stage4Btn.addEventListener('click', () => showStage(4));
stage5Btn.addEventListener('click', () => showStage(5));
stage6Btn.addEventListener('click', () => showStage(6));
showStage(1);

