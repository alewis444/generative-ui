/* ================= STAGE 4 ================= */
const s4EntryScreen = document.getElementById('s4EntryScreen');
const s4DirectFlow = document.getElementById('s4DirectFlow');
const s4ExploreFlow = document.getElementById('s4ExploreFlow');

const S4_EXPLORE_DEFAULT_TOPIC = 'Something to help me pull off a surprise 30th birthday party without losing my mind.';
function s4ResetExplore() {
  s4State.topic = '';
  s4State.answers = {};
  s4State.constraints = [];
  s4State.seeds = [];
  const topicEl = document.getElementById('s4ExploreTopic');
  if (topicEl) topicEl.value = S4_EXPLORE_DEFAULT_TOPIC;
  document.getElementById('s4ElicitBlock').querySelectorAll('.elicit-choice').forEach(b => b.classList.remove('selected'));
  document.getElementById('s4SeedsArea').innerHTML = '';
  document.getElementById('s4ConstraintArea').style.display = 'none';
  document.getElementById('s4ConstraintChips').innerHTML = '';
  document.getElementById('s4ConstraintInputRow').style.display = 'none';
  document.getElementById('s4ConstraintInput').value = '';
}
function s4ShowEntry() {
  s4EntryScreen.style.display = 'block';
  s4DirectFlow.style.display = 'none';
  s4ExploreFlow.style.display = 'none';
  s4ResetExplore();
}
document.getElementById('s4PickDirect').addEventListener('click', () => {
  s4EntryScreen.style.display = 'none';
  s4DirectFlow.style.display = 'block';
});
document.getElementById('s4PickExplore').addEventListener('click', () => {
  s4EntryScreen.style.display = 'none';
  s4ExploreFlow.style.display = 'block';
});
document.getElementById('s4DirectBack').addEventListener('click', s4ShowEntry);
document.getElementById('s4ExploreBack').addEventListener('click', s4ShowEntry);

/* -- Direct path: literally Stage 2's mechanic, reused -- */
document.getElementById('s4DirectComposeBtn').addEventListener('click', async () => {
  const brief = document.getElementById('s4DirectBrief').value.trim();
  if (!brief) return;
  const planArea = document.getElementById('s4DirectPlanArea');
  const renderArea = document.getElementById('s4DirectRenderArea');
  renderArea.innerHTML = '';
  planArea.innerHTML = `<div class="panel"><div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span> composing the one precise answer</div></div>`;
  const result = await callClaude(COMPONENT_SPEC, `The task: ${brief}`);
  if (!result || !Array.isArray(result.composition) || result.composition.length === 0) {
    planArea.innerHTML = `<div class="panel"><div class="error-box">Couldn't get a valid composition back.</div><button class="ghost" id="s4DirectRetryBtn" style="margin-top:12px">Try again</button></div>`;
    document.getElementById('s4DirectRetryBtn').addEventListener('click', () => document.getElementById('s4DirectComposeBtn').click());
    return;
  }
  planArea.innerHTML = `<div class="panel"><h2 style="font-size:1.05rem">Result</h2><div class="plan-rationale">${esc(result.rationale)}</div></div>`;
  renderArea.innerHTML = `<div class="panel"><div class="render-grid">${result.composition.map(c => `<div class="atom-wrap">${renderAtom(c.type, c.props)}</div>`).join('')}</div></div>`;
});

/* -- Explore path -- */
const S4_ELICIT_QUESTIONS = [
  { key: 'range', text: 'How much room do you want to explore?', options: ['Just a nudge', 'A real spread', 'Show me everything'] },
  { key: 'lean', text: 'Lean more toward...', options: ['Practical & structured', 'Playful & loose', 'No preference'] }
];
const s4State = { topic: '', answers: {}, constraints: [], seeds: [] };

function s4RenderElicitation() {
  const block = document.getElementById('s4ElicitBlock');
  block.innerHTML = S4_ELICIT_QUESTIONS.map(q => `
    <div class="elicit-q" data-key="${q.key}">
      <div class="qtext">${esc(q.text)}</div>
      <div class="elicit-choices">
        ${q.options.map(opt => `<button type="button" class="elicit-choice" data-key="${q.key}" data-val="${esc(opt)}">${esc(opt)}</button>`).join('')}
      </div>
    </div>`).join('');
  block.querySelectorAll('.elicit-choice').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.dataset.key;
      s4State.answers[key] = btn.dataset.val;
      block.querySelectorAll(`.elicit-choice[data-key="${key}"]`).forEach(b => b.classList.toggle('selected', b === btn));
    });
  });
}
s4RenderElicitation();

document.getElementById('s4SkipElicit').addEventListener('click', () => {
  s4State.answers = {};
  document.getElementById('s4ElicitBlock').querySelectorAll('.elicit-choice').forEach(b => b.classList.remove('selected'));
  s4GenerateSeeds();
});
document.getElementById('s4GenSeedsBtn').addEventListener('click', () => s4GenerateSeeds());

function s4RenderConstraints() {
  const chipsEl = document.getElementById('s4ConstraintChips');
  document.getElementById('s4ConstraintArea').style.display = s4State.seeds.length ? 'block' : 'none';
  chipsEl.innerHTML = s4State.constraints.length
    ? s4State.constraints.map((c, i) => `<span class="constraint-chip">${esc(c)}<button data-i="${i}" title="remove">×</button></span>`).join('')
    : `<span class="sub" style="font-size:0.82rem">none yet — add one to narrow the next batch</span>`;
  chipsEl.querySelectorAll('button[data-i]').forEach(btn => {
    btn.addEventListener('click', () => {
      s4State.constraints.splice(Number(btn.dataset.i), 1);
      s4GenerateSeeds();
    });
  });
}
document.getElementById('s4ShowConstraintInput').addEventListener('click', () => {
  document.getElementById('s4ConstraintInputRow').style.display = 'flex';
});
document.getElementById('s4AddConstraintBtn').addEventListener('click', () => {
  const input = document.getElementById('s4ConstraintInput');
  const val = input.value.trim();
  if (!val) return;
  s4State.constraints.push(val);
  input.value = '';
  document.getElementById('s4ConstraintInputRow').style.display = 'none';
  s4GenerateSeeds();
});

function s4SeedPrompt() {
  return `You are proposing several genuinely different starting points for someone who has a loose idea, not a fully-specified request. Each starting point is a small atomic UI composition, using only this fixed library — never invent a component type outside it:

${COMPONENT_LIBRARY_TEXT}

Generate exactly 3 starting points. They must diverge in real angle or approach, not just in wording — if two would satisfy the same follow-up question, they're too similar. Each uses 2-4 components. Honor every constraint listed as a hard requirement on all 3, not just one.

Respond ONLY with JSON:
{ "seeds": [ { "angle": "a short (3-6 word) label for this angle", "note": "1 sentence on what makes this angle distinct", "composition": [ { "type": "...", "props": { ... } } ] } ] }`;
}

async function s4GenerateSeeds() {
  const topic = document.getElementById('s4ExploreTopic').value.trim();
  if (!topic) return;
  s4State.topic = topic;

  const seedsArea = document.getElementById('s4SeedsArea');
  seedsArea.innerHTML = `<div class="panel"><div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span> sketching a few different angles</div></div>`;

  let userText = `Loose topic: ${topic}`;
  if (s4State.answers.range) userText += `\nDesired range of exploration: ${s4State.answers.range}`;
  if (s4State.answers.lean) userText += `\nStylistic lean: ${s4State.answers.lean}`;
  if (s4State.constraints.length) userText += `\nConstraints (all must hold): ${s4State.constraints.join('; ')}`;

  const result = await callClaude(s4SeedPrompt(), userText);
  if (!result || !Array.isArray(result.seeds) || result.seeds.length === 0) {
    seedsArea.innerHTML = `<div class="panel"><div class="error-box">Couldn't generate starting points (timeout or API error).</div><button class="ghost" id="s4SeedRetryBtn" style="margin-top:12px">Try again</button></div>`;
    document.getElementById('s4SeedRetryBtn').addEventListener('click', s4GenerateSeeds);
    return;
  }
  s4State.seeds = result.seeds;
  s4RenderConstraints();
  s4RenderSeeds();
}

function s4RenderSeeds() {
  const seedsArea = document.getElementById('s4SeedsArea');
  seedsArea.innerHTML = `<div class="seed-grid">${s4State.seeds.map((seed, i) => `
    <div class="seed-card">
      <div class="angle">${esc(seed.angle)}</div>
      <div class="angle-note">${esc(seed.note)}</div>
      <div class="mini-atoms">${(seed.composition || []).map(c => `<div class="atom-wrap">${renderAtom(c.type, c.props)}</div>`).join('')}</div>
      <button class="primary s4 pick-btn" data-i="${i}">This one — refine it directly</button>
    </div>`).join('')}</div>`;
  seedsArea.querySelectorAll('.pick-btn').forEach(btn => {
    btn.addEventListener('click', () => s4HandoffToStage3(s4State.seeds[Number(btn.dataset.i)]));
  });
}

function s4HandoffToStage3(seed) {
  s3State.brief = s4State.topic + (s4State.constraints.length ? ` (constraints: ${s4State.constraints.join(', ')})` : '');
  s3State.composition = (seed.composition || []).map(c => ({ ...c, diff: 'unchanged' }));
  s3State.log = [];
  document.getElementById('s3PlanArea').innerHTML = `<div class="panel"><h2 style="font-size:1.05rem">Carried over from exploring: ${esc(seed.angle)}</h2><div class="plan-rationale">${esc(seed.note)}</div></div>`;
  s3RenderComposition();
  document.getElementById('s3NegotiateArea').style.display = 'block';
  s3RenderLog();
  showStage(3);
}

