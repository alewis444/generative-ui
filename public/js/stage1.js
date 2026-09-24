/* ================= STAGE 1 ================= */
const S1_MODES = {
  list:      { label: 'The List-Maker', blurb: 'a straightforward checklist' },
  board:     { label: 'The Planner Board', blurb: 'a kanban board of categories and cards' },
  visual:    { label: 'The Visualizer', blurb: 'a mood concept and color palette' },
  concierge: { label: 'The Concierge', blurb: 'a set of curated options to choose from' },
  story:     { label: 'The Storyteller', blurb: 'a short narrative scene, tasks woven in' }
};
const s1State = { brief: '', recommended: null, cache: {} };

const S1_RECOMMEND_PROMPT = `You are deciding which of five pre-built screen shapes best fits a task, based on specific details given.
Shapes: list (${S1_MODES.list.blurb}), board (${S1_MODES.board.blurb}), visual (${S1_MODES.visual.blurb}), concierge (${S1_MODES.concierge.blurb}), story (${S1_MODES.story.blurb}).
Pick exactly one. Reasoning must cite a specific detail from the task, not a generic justification.
Respond ONLY with JSON: {"reasoning": "1-2 sentences", "recommended_mode": "list"|"board"|"visual"|"concierge"|"story"}`;

function s1ModePrompt(mode) {
  const schemas = {
    list: `{"title": string, "items": [{"text": string}]} (4-7 items)`,
    board: `{"columns": [{"name": string, "cards": [{"title": string, "note": string}]}]} (3 columns, 2-4 cards each)`,
    visual: `{"concept": string, "palette": [hex color string, ...4 colors], "mood_words": [string, ...4-6 words]}`,
    concierge: `{"options": [{"name": string, "blurb": string, "price_range": string}]} (3 options)`,
    story: `{"narrative": string (3-5 sentences), "tasks": [string, ...3-5 tasks pulled from the narrative]}`
  };
  return `You are filling in the fixed "${S1_MODES[mode].label}" screen template — ${S1_MODES[mode].blurb} — with content for the given task. The screen's shape is fixed; you only supply the content.
Respond ONLY with JSON matching exactly this schema: ${schemas[mode]}`;
}

const KID_PALETTE = [
  { color: '#C9A227', name: 'Ochre Fox', emoji: '🦊' },
  { color: '#A85A3F', name: 'Clay Bear', emoji: '🐻' },
  { color: '#5B6B4B', name: 'Moss Hare', emoji: '🐰' },
  { color: '#2B2E35', name: 'Ink Owl', emoji: '🦉' }
];

const VISUALIZER_PALETTE = [
  { hex: '#C9A227', name: 'Ochre Fox' },
  { hex: '#A85A3F', name: 'Clay Bear' },
  { hex: '#5B6B4B', name: 'Moss Hare' },
  { hex: '#2B2E35', name: 'Ink Owl' }
];
function kidLegend() {
  return `<div class="kid-legend">${KID_PALETTE.map(k =>
    `<span class="kid-chip"><span class="dot" style="background:${k.color}"></span>${k.emoji} ${esc(k.name)}</span>`
  ).join('')}</div>`;
}

function renderS1Mode(mode, data) {
  switch (mode) {
    case 'list':
      return `<div class="panel s1-list kid-theme"><h2 style="font-size:1.05rem">${esc(data.title)}</h2>
        ${kidLegend()}
        <ul>${(data.items || []).map((i, idx) => {
          const k = KID_PALETTE[idx % 4];
          return `<li><span class="kid-dot" style="background:${k.color}"></span><span>${k.emoji} ${esc(i.text)}</span></li>`;
        }).join('')}</ul></div>`;
    case 'board':
      return `<div class="panel"><h2 style="font-size:1.05rem">Planner Board</h2>
        ${kidLegend()}
        <div class="s1-board kid-theme">${(data.columns || []).map((col, idx) => {
          const k = KID_PALETTE[idx % 4];
          return `<div class="col" style="--kid-c:${k.color}"><div class="col-title">${k.emoji} ${esc(col.name)}</div>
            ${(col.cards || []).map(c => `<div class="card" style="--kid-c:${k.color}"><div>${esc(c.title)}</div><div class="note">${esc(c.note || '')}</div></div>`).join('')}
          </div>`;
        }).join('')}</div></div>`;
    case 'visual':
      return `<div class="panel s1-visual"><h2 style="font-size:1.05rem">${esc(data.concept)}</h2>
        <div class="palette">${VISUALIZER_PALETTE.map(p => `
          <div class="swatch-block">
            <div class="swatch viz-swatch" style="background:${p.hex}"></div>
            <div class="swatch-name">${esc(p.name)}</div>
          </div>`).join('')}</div>
        <div class="words">${(data.mood_words || []).map(w => `<span class="word">${esc(w)}</span>`).join('')}</div></div>`;
    case 'concierge':
      return `<div class="panel"><h2 style="font-size:1.05rem">Options</h2>
        ${kidLegend()}
        <div class="s1-concierge kid-theme">${(data.options || []).map((o, idx) => {
          const k = KID_PALETTE[idx % 4];
          return `<div class="opt" style="--kid-c:${k.color}"><div class="name">${k.emoji} ${esc(o.name)}</div><div class="blurb">${esc(o.blurb)}</div><span class="price">${esc(o.price_range)}</span><button class="ghost s1-book-btn" type="button">Book now</button></div>`;
        }).join('')}</div></div>`;
    case 'story':
      return `<div class="panel s1-story kid-theme" style="--kid-c:${KID_PALETTE[0].color}"><h2 style="font-size:1.05rem">The scene</h2>
        ${kidLegend()}
        <div class="narrative">${esc(data.narrative)}</div>
        <ul>${(data.tasks || []).map((t, idx) => {
          const k = KID_PALETTE[idx % 4];
          return `<li><span class="kid-dot" style="background:${k.color}"></span><span>${k.emoji} ${esc(t)}</span></li>`;
        }).join('')}</ul></div>`;
    default:
      return `<div class="panel">Unknown mode</div>`;
  }
}

function renderS1Tabs() {
  const tabsEl = document.getElementById('s1ModeTabs');
  tabsEl.innerHTML = Object.keys(S1_MODES).map(m => {
    const classes = ['mode-tab'];
    if (m === s1State.recommended) classes.push('picked');
    if (m === s1State.active) classes.push('active');
    return `<button class="${classes.join(' ')}" data-mode="${m}">${S1_MODES[m].label}${m === s1State.recommended ? '<span class=\"badge picked\">picked</span>' : ''}</button>`;
  }).join('');
  tabsEl.querySelectorAll('.mode-tab').forEach(btn => {
    btn.addEventListener('click', () => s1LoadMode(btn.dataset.mode));
  });
}

async function s1LoadMode(mode) {
  s1State.active = mode;
  renderS1Tabs();
  const contentEl = document.getElementById('s1Content');
  if (s1State.cache[mode]) {
    contentEl.innerHTML = renderS1Mode(mode, s1State.cache[mode]);
    return;
  }
  contentEl.innerHTML = `<div class="panel"><div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span> filling in ${esc(S1_MODES[mode].label)}</div></div>`;
  const result = await callClaude(s1ModePrompt(mode), `The task: ${s1State.brief}`);
  if (!result) {
    contentEl.innerHTML = `<div class="panel"><div class="error-box">Couldn't generate this screen's content (timeout or API error).</div><button class="ghost" id="s1RetryBtn" style="margin-top:12px">Try again</button></div>`;
    document.getElementById('s1RetryBtn').addEventListener('click', () => s1LoadMode(mode));
    return;
  }
  s1State.cache[mode] = result;
  if (s1State.active === mode) contentEl.innerHTML = renderS1Mode(mode, result);
}

document.getElementById('s1ComposeBtn').addEventListener('click', async () => {
  const brief = document.getElementById('s1Brief').value.trim();
  if (!brief) return;
  s1State.brief = brief;
  s1State.cache = {};
  s1State.recommended = null;
  s1State.active = null;
  document.getElementById('s1ModeTabs').innerHTML = '';
  document.getElementById('s1Content').innerHTML = '';
  const planEl = document.getElementById('s1PlanArea');
  planEl.innerHTML = `<div class="panel"><div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span> weighing which shape fits this</div></div>`;

  const result = await callClaude(S1_RECOMMEND_PROMPT, `The task: ${brief}`);
  if (!result || !S1_MODES[result.recommended_mode]) {
    planEl.innerHTML = `<div class="panel"><div class="error-box">Couldn't get a recommendation back (timeout or API error).</div><button class="ghost" id="s1RetryRecBtn" style="margin-top:12px">Try again</button></div>`;
    document.getElementById('s1RetryRecBtn').addEventListener('click', () => document.getElementById('s1ComposeBtn').click());
    return;
  }
  s1State.recommended = result.recommended_mode;
  planEl.innerHTML = `<div class="panel s1-plan-panel">
    <button class="s1-plan-close" id="s1PlanCloseBtn" aria-label="Dismiss recommendation">&times;</button>
    <h2 style="font-size:1.05rem">I'd open this as ${S1_MODES[result.recommended_mode].label}</h2>
    <div class="plan-rationale">${esc(result.reasoning)}</div>
  </div>`;
  document.getElementById('s1PlanCloseBtn').addEventListener('click', () => {
    planEl.innerHTML = '';
  });
  s1LoadMode(result.recommended_mode);
});

