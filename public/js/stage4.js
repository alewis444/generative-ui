/* ================= STAGE 4 ================= */
/* One always-open prototype window with three internal tabs; Dashboard is the default landing view. */
const S4_TAB_PANELS = { dashboard: 's4TabDashboard', precision: 's4TabPrecision', curate: 's4TabCurate' };
document.getElementById('s4ModeTabs').querySelectorAll('.mode-tab').forEach(btn => {
  btn.addEventListener('click', () => s4ShowTab(btn.dataset.tab));
});
function s4ShowTab(tab) {
  document.getElementById('s4ModeTabs').querySelectorAll('.mode-tab').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
  Object.entries(S4_TAB_PANELS).forEach(([key, id]) => {
    document.getElementById(id).style.display = key === tab ? 'block' : 'none';
  });
}

const S4_EXPLORE_DEFAULT_TOPIC = 'Something to help me pull off a surprise 30th birthday party without losing my mind.';

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

/* -- Dashboard starters: pre-built, no API call -- */
const S4_DASHBOARD_STARTERS = [
  {
    id: 'guest-logistics',
    title: 'Guest logistics and confirmations',
    blurb: "Focuses on tracking who's coming and their status, so you know headcount and can follow up on maybes.",
    composition: [
      { type: 'stat_bar', props: { label: 'RSVP Status', entries: [
        { name: 'Confirmed', value: 12 }, { name: 'Maybe', value: 3 }, { name: 'No response', value: 3 }
      ] } },
      { type: 'checklist', props: { title: 'Follow-up Actions', items: [
        { text: "Remind the 3 guests who haven't responded", done: false },
        { text: 'Confirm dietary restrictions with confirmed guests', done: false },
        { text: 'Finalize headcount with caterer', done: false }
      ] } },
      { type: 'card', props: { title: 'Follow-up needed', subtitle: "3 of 18 guests haven't responded", status: 'at-risk', tag: 'RSVP' } }
    ]
  },
  {
    id: 'budget-vendor',
    title: 'Budget and vendor spending',
    blurb: "Tracks party expenses across categories so you stay within total budget and see where money's going.",
    composition: [
      { type: 'budget', props: { label: 'Total Party Budget', spent: 320, limit: 600 } },
      { type: 'stat_bar', props: { label: 'Spend by Category', entries: [
        { name: 'Venue', value: 150 }, { name: 'Cake', value: 80 }, { name: 'Decorations', value: 60 }, { name: 'Favors', value: 30 }
      ] } },
      { type: 'card', props: { title: 'Vendor Payments', subtitle: '2 of 4 vendors paid in full', status: 'pending', tag: 'Budget' } }
    ]
  }
];
let s4SelectedDashboard = null;

function s4RenderDashboardPicker() {
  const picker = document.getElementById('s4DashboardPicker');
  picker.innerHTML = S4_DASHBOARD_STARTERS.map(starter => `
    <button class="entry-card dashboard" data-id="${starter.id}">
      <h3>${esc(starter.title)}</h3>
      <p>${esc(starter.blurb)}</p>
    </button>`).join('');
  picker.querySelectorAll('.entry-card[data-id]').forEach(btn => {
    btn.addEventListener('click', () => s4SelectDashboard(btn.dataset.id));
  });
}
s4RenderDashboardPicker();

function s4SelectDashboard(id) {
  const renderArea = document.getElementById('s4DashboardRenderArea');
  const picker = document.getElementById('s4DashboardPicker');

  if (s4SelectedDashboard && s4SelectedDashboard.id === id) {
    s4SelectedDashboard = null;
    renderArea.style.display = 'none';
    picker.querySelectorAll('.entry-card[data-id]').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('s4CustomizePanel').style.display = 'none';
    return;
  }

  const starter = S4_DASHBOARD_STARTERS.find(s => s.id === id);
  if (!starter) return;
  s4SelectedDashboard = starter;
  document.getElementById('s4DashboardAtoms').innerHTML =
    starter.composition.map(c => `<div class="atom-wrap">${renderAtom(c.type, c.props)}</div>`).join('');
  document.getElementById('s4DashboardKeptNote').style.display = 'none';
  document.getElementById('s4CustomizePanel').style.display = 'none';
  renderArea.style.display = 'block';
  picker.querySelectorAll('.entry-card[data-id]').forEach(btn => {
    btn.classList.toggle('selected', btn.dataset.id === id);
  });
}

document.getElementById('s4DashboardKeepBtn').addEventListener('click', () => {
  const note = document.getElementById('s4DashboardKeptNote');
  note.textContent = 'Nice — this dashboard is ready to use as shown above.';
  note.style.display = 'block';
});

/* -- Customize: negotiate edits inline, without leaving Common Use Case -- */
const s4CustomizeState = { brief: '', composition: [], log: [] };

function s4RenderCustomizeComposition() {
  const el = document.getElementById('s4CustomizeComposition');
  el.innerHTML = s4CustomizeState.composition.map(c => {
    const diffClass = c.diff === 'added' ? 'added' : c.diff === 'changed' ? 'changed' : '';
    const tag = c.diff === 'added' ? '<span class="diff-tag">added</span><br>' : c.diff === 'changed' ? '<span class="diff-tag">changed</span><br>' : '';
    return `<div class="atom-wrap ${diffClass}">${tag}${renderAtom(c.type, c.props)}</div>`;
  }).join('');
}

function s4RenderCustomizeLog() {
  const panel = document.getElementById('s4CustomizeLogPanel');
  const logEl = document.getElementById('s4CustomizeLog');
  if (s4CustomizeState.log.length === 0) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  logEl.innerHTML = s4CustomizeState.log.map(e => `
    <div class="entry ${e.blocked ? 'blocked' : 'applied'}">
      <div class="req">"${esc(e.request)}"</div>
      <div class="resp">${e.blocked ? '⛔ ' : '✓ '}${esc(e.response)}</div>
    </div>`).join('');
}

document.getElementById('s4DashboardCustomizeBtn').addEventListener('click', () => {
  if (!s4SelectedDashboard) return;
  s4CustomizeState.brief = `Dashboard focus: ${s4SelectedDashboard.title} — ${s4SelectedDashboard.blurb}`;
  s4CustomizeState.composition = s4SelectedDashboard.composition.map(c => ({ ...c, diff: 'unchanged' }));
  s4CustomizeState.log = [];
  document.getElementById('s4CustomizeTitle').textContent = s4SelectedDashboard.title;
  document.getElementById('s4CustomizeBlurb').textContent = s4SelectedDashboard.blurb;
  s4RenderCustomizeComposition();
  s4RenderCustomizeLog();
  document.getElementById('s4DashboardBrowse').style.display = 'none';
  document.getElementById('s4DashboardSub').style.display = 'none';
  const panel = document.getElementById('s4CustomizePanel');
  panel.style.display = 'block';
  panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
});

document.getElementById('s4CustomizeBackBtn').addEventListener('click', () => {
  document.getElementById('s4CustomizePanel').style.display = 'none';
  document.getElementById('s4DashboardBrowse').style.display = 'block';
  document.getElementById('s4DashboardSub').style.display = 'block';
});

document.getElementById('s4CustomizeEditBtn').addEventListener('click', async () => {
  const input = document.getElementById('s4CustomizeEditInput');
  const request = input.value.trim();
  if (!request || s4CustomizeState.composition.length === 0) return;

  const editBtn = document.getElementById('s4CustomizeEditBtn');
  editBtn.disabled = true;
  editBtn.textContent = 'Applying...';

  const currentJson = JSON.stringify(s4CustomizeState.composition.map(({ diff, ...rest }) => rest));
  const userText = `The original task: ${s4CustomizeState.brief}\n\nThe current composition: ${currentJson}\n\nThe person's request: "${request}"`;

  const result = await callClaude(s3NegotiatePrompt(), userText);
  editBtn.disabled = false;
  editBtn.textContent = 'Apply';

  if (!result) {
    s4CustomizeState.log.unshift({ request, response: "Couldn't reach the model in time — nothing was changed.", blocked: true });
    s4RenderCustomizeLog();
    return;
  }

  if (result.blocked || !Array.isArray(result.composition) || result.composition.length === 0) {
    s4CustomizeState.log.unshift({ request, response: result.response || 'Blocked — no valid change returned.', blocked: true });
    s4RenderCustomizeLog();
    return;
  }

  s4CustomizeState.composition = result.composition;
  s4CustomizeState.log.unshift({ request, response: result.response || 'Applied.', blocked: false });
  input.value = '';
  s4RenderCustomizeComposition();
  s4RenderCustomizeLog();
});

document.getElementById('s4CustomizeEditInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('s4CustomizeEditBtn').click();
});

