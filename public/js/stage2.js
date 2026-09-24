/* ================= STAGE 2 ================= */
const CATALOG = [
  { type: 'progress', props: { label: 'Days until move-in', value: 8, max: 21, unit: 'days' } },
  { type: 'budget', props: { label: 'Catering budget', spent: 340, limit: 500 } },
  { type: 'card', props: { title: 'IT setup', subtitle: 'Desks wired, VPN tested', status: 'confirmed', tag: 'Vendor' } },
  { type: 'checklist', props: { title: 'Pre-launch tasks', items: [
      { text: 'Confirm signage delivery', done: true },
      { text: 'Walk the new floor plan', done: false },
      { text: 'Send building access badges', done: false }
    ] } },
  { type: 'stat_bar', props: { label: 'RSVP by group', entries: [
      { name: 'Family', value: 8 }, { name: 'Work', value: 5 }, { name: 'College', value: 3 }
    ] } },
  { type: 'date_marker', props: { label: 'Hard deadline', date: 'Oct 3', note: 'Venue deposit due' } }
];

function renderAtom(type, props) {
  switch (type) {
    case 'progress': {
      const pct = Math.max(0, Math.min(100, (props.value / props.max) * 100));
      return `<div class="atom atom-progress"><div class="atom-label">${esc(props.label)}</div>
        <div class="bar-track"><div class="bar-fill" style="width:${pct}%"></div></div>
        <div class="atom-meta">${esc(props.value)} / ${esc(props.max)} ${esc(props.unit || '')}</div></div>`;
    }
    case 'budget': {
      const pct = Math.max(0, Math.min(100, (props.spent / props.limit) * 100));
      const over = props.spent > props.limit;
      return `<div class="atom atom-budget"><div class="atom-label">${esc(props.label)}</div>
        <div class="bar-track"><div class="bar-fill ${over ? 'over' : ''}" style="width:${Math.min(pct,100)}%"></div></div>
        <div class="atom-meta">$${esc(props.spent)} of $${esc(props.limit)}${over ? ' — over' : ''}</div></div>`;
    }
    case 'card': {
      const statusClass = props.status === 'confirmed' ? 'confirmed' : props.status === 'at-risk' ? 'at-risk' : '';
      return `<div class="atom atom-card"><div class="title">${esc(props.title)}</div>
        <div class="subtitle">${esc(props.subtitle || '')}</div>
        <span class="status-pill ${statusClass}"><span class="dot"></span>${esc(props.status || 'pending')}</span>
        ${props.tag ? `<span class="tag-chip">${esc(props.tag)}</span>` : ''}</div>`;
    }
    case 'checklist': {
      const items = (props.items || []).map(it => `<li class="${it.done ? 'done' : ''}"><span class="box"></span><span>${esc(it.text)}</span></li>`).join('');
      return `<div class="atom atom-checklist"><div class="atom-label">${esc(props.title)}</div><ul>${items}</ul></div>`;
    }
    case 'stat_bar': {
      const max = Math.max(1, ...(props.entries || []).map(e => e.value));
      const rows = (props.entries || []).map(e => `<div class="row"><div class="name">${esc(e.name)}</div><div class="track"><div class="fill" style="width:${(e.value/max)*100}%"></div></div><div class="val">${esc(e.value)}</div></div>`).join('');
      return `<div class="atom atom-statbar"><div class="atom-label">${esc(props.label)}</div>${rows}</div>`;
    }
    case 'date_marker':
      return `<div class="atom atom-date"><div class="atom-meta" style="margin-top:0">${esc(props.label)}</div>
        <div class="date-num">${esc(props.date)}</div><div class="note">${esc(props.note || '')}</div></div>`;
    default:
      return `<div class="atom">Unknown component: ${esc(type)}</div>`;
  }
}

document.getElementById('catalog').innerHTML = CATALOG.map(c => `
  <div class="catalog-item"><span class="type-tag">${c.type}</span>${renderAtom(c.type, c.props)}</div>
`).join('');

const COMPONENT_SPEC = `You are an atomic UI composer. You do not design or invent visual components — you only select from a fixed, existing library, decide how many of each to use, and populate them with real data inferred from the task. Never introduce a component type outside this list.

Library (exact prop schemas):
- progress: { "label": string, "value": number, "max": number, "unit": string }
- budget: { "label": string, "spent": number, "limit": number }
- card: { "title": string, "subtitle": string, "status": "pending" | "confirmed" | "at-risk", "tag": string }
- checklist: { "title": string, "items": [{ "text": string, "done": boolean }] } (2-5 items)
- stat_bar: { "label": string, "entries": [{ "name": string, "value": number }] } (2-5 entries)
- date_marker: { "label": string, "date": string, "note": string }

Given a task, decide which components actually serve it — not one of each by default. Use 3 to 6 components total, repeating a type if genuinely useful. Populate every prop with specific data inferred from the task, never placeholders.

Respond ONLY with JSON, no markdown fences:
{ "rationale": "1-2 sentences, citing a specific detail from the task", "composition": [ { "type": "...", "props": { ... } }, ... ] }`;

function renderPlanAndOutput(result) {
  const planArea = document.getElementById('planArea');
  const renderArea = document.getElementById('renderArea');
  planArea.innerHTML = `<div class="panel s1-plan-panel" id="planPanel">
    <button class="s1-plan-close" id="planCloseBtn" aria-label="Dismiss">&times;</button>
    <div id="planContent">
      <h2 style="font-size:1.05rem">What it decided, and why</h2>
      <div class="plan-rationale">${esc(result.rationale)}</div>
    </div></div>`;
  renderArea.innerHTML = `<div class="panel"><h2 style="font-size:1.05rem">The rendered composition</h2>
    <div class="render-grid">${result.composition.map(c => `<div class="atom-wrap">${renderAtom(c.type, c.props)}</div>`).join('')}</div></div>`;
  document.getElementById('planCloseBtn').addEventListener('click', () => {
    planArea.innerHTML = '';
  });
}

document.getElementById('s2ComposeBtn').addEventListener('click', async () => {
  const brief = document.getElementById('s2Brief').value.trim();
  if (!brief) return;
  const planArea = document.getElementById('planArea');
  const renderArea = document.getElementById('renderArea');
  renderArea.innerHTML = '';
  planArea.innerHTML = `<div class="panel"><div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span> deciding which components fit this task</div></div>`;
  const result = await callClaude(COMPONENT_SPEC, `The task: ${brief}`);
  if (!result || !Array.isArray(result.composition) || result.composition.length === 0) {
    planArea.innerHTML = `<div class="panel"><div class="error-box">Couldn't get a valid composition back (timeout, API error, or malformed response).</div><button class="ghost" id="s2RetryBtn" style="margin-top:12px">Try again</button></div>`;
    document.getElementById('s2RetryBtn').addEventListener('click', () => document.getElementById('s2ComposeBtn').click());
    return;
  }
  renderPlanAndOutput(result);
});

