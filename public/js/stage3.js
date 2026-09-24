/* ================= STAGE 3 ================= */
const s3State = { brief: '', composition: [], log: [] };

const COMPONENT_LIBRARY_TEXT = `- progress: { "label": string, "value": number, "max": number, "unit": string }
- budget: { "label": string, "spent": number, "limit": number }
- card: { "title": string, "subtitle": string, "status": "pending" | "confirmed" | "at-risk", "tag": string }
- checklist: { "title": string, "items": [{ "text": string, "done": boolean }] } (2-5 items)
- stat_bar: { "label": string, "entries": [{ "name": string, "value": number }] } (2-5 entries)
- date_marker: { "label": string, "date": string, "note": string }`;

const S3_INITIAL_PROMPT = `You are an atomic UI composer. You only select from a fixed library, decide how many of each to use, and populate them with data inferred from the task. Never introduce a component type outside this list.

Library:
${COMPONENT_LIBRARY_TEXT}

Use 3 to 6 components total, chosen for what this specific task needs.
Respond ONLY with JSON: { "rationale": "1-2 sentences, citing a specific detail", "composition": [ { "type": "...", "props": { ... } } ] }`;

function s3NegotiatePrompt() {
  return `You are amending an existing UI composition based on a person's request. You are editing, not regenerating — the current composition is state, and your job is a diff, not a fresh draft.

Standing rules, in priority order:
1. The component library is fixed and always wins over the request: ${COMPONENT_LIBRARY_TEXT}
   Never invent a new component type, even if the request implies one would fit better. If the request truly cannot be satisfied within this library, do not force it — set "blocked" to true and explain why in "response", leaving the composition unchanged.
2. Stay within 3 to 6 total components.
3. If the request is a specific, direct instruction (swap X for Y, remove X, add a card for Y), apply it exactly.
4. If the request is ambiguous, make the smallest change that plausibly satisfies it — prefer editing an existing component's props over adding a new one.
5. Anything not mentioned by the request stays exactly as it was — same type, same props, same order — unless satisfying the request requires touching it.

For every component in your returned composition, mark it: "unchanged" (identical to before), "changed" (same slot, different props or type), or "added" (new). If you removed a component, note that in "response" but don't include it in the array.

Respond ONLY with JSON:
{ "blocked": boolean, "response": "1-2 sentences explaining what you did (or why you couldn't)", "composition": [ { "type": "...", "props": { ... }, "diff": "unchanged" | "changed" | "added" } ] }`;
}

function s3RenderComposition() {
  const el = document.getElementById('s3RenderArea');
  el.innerHTML = `<div class="panel"><h2 style="font-size:1.05rem">The current composition</h2>
    <div class="render-grid">${s3State.composition.map(c => {
      const diffClass = c.diff === 'added' ? 'added' : c.diff === 'changed' ? 'changed' : '';
      const tag = c.diff === 'added' ? '<span class="diff-tag">added</span><br>' : c.diff === 'changed' ? '<span class="diff-tag">changed</span><br>' : '';
      return `<div class="atom-wrap ${diffClass}">${tag}${renderAtom(c.type, c.props)}</div>`;
    }).join('')}</div></div>`;
}

function s3RenderLog() {
  const panel = document.getElementById('s3LogPanel');
  const logEl = document.getElementById('s3EditLog');
  if (s3State.log.length === 0) { panel.style.display = 'none'; return; }
  panel.style.display = 'block';
  logEl.innerHTML = s3State.log.map(e => `
    <div class="entry ${e.blocked ? 'blocked' : 'applied'}">
      <div class="req">"${esc(e.request)}"</div>
      <div class="resp">${e.blocked ? '⛔ ' : '✓ '}${esc(e.response)}</div>
    </div>`).join('');
}

document.getElementById('s3ComposeBtn').addEventListener('click', async () => {
  const brief = document.getElementById('s3Brief').value.trim();
  if (!brief) return;
  s3State.brief = brief;
  s3State.log = [];
  document.getElementById('s3NegotiateArea').style.display = 'none';
  document.getElementById('s3RenderArea').innerHTML = '';
  const planEl = document.getElementById('s3PlanArea');
  planEl.innerHTML = `<div class="panel"><div class="thinking"><span class="dot"></span><span class="dot"></span><span class="dot"></span> composing a first draft</div></div>`;

  const result = await callClaude(S3_INITIAL_PROMPT, `The task: ${brief}`);
  if (!result || !Array.isArray(result.composition) || result.composition.length === 0) {
    planEl.innerHTML = `<div class="panel"><div class="error-box">Couldn't get a valid composition back (timeout, API error, or malformed response).</div><button class="ghost" id="s3RetryBtn" style="margin-top:12px">Try again</button></div>`;
    document.getElementById('s3RetryBtn').addEventListener('click', () => document.getElementById('s3ComposeBtn').click());
    return;
  }
  s3State.composition = result.composition.map(c => ({ ...c, diff: 'unchanged' }));
  planEl.innerHTML = `<div class="panel"><h2 style="font-size:1.05rem">First draft</h2><div class="plan-rationale">${esc(result.rationale)}</div></div>`;
  s3RenderComposition();
  document.getElementById('s3NegotiateArea').style.display = 'block';
  s3RenderLog();
});

document.getElementById('s3EditBtn').addEventListener('click', async () => {
  const input = document.getElementById('s3EditInput');
  const request = input.value.trim();
  if (!request || s3State.composition.length === 0) return;

  const editBtn = document.getElementById('s3EditBtn');
  editBtn.disabled = true;
  editBtn.textContent = 'Applying...';

  const currentJson = JSON.stringify(s3State.composition.map(({ diff, ...rest }) => rest));
  const userText = `The original task: ${s3State.brief}\n\nThe current composition: ${currentJson}\n\nThe person's request: "${request}"`;

  const result = await callClaude(s3NegotiatePrompt(), userText);
  editBtn.disabled = false;
  editBtn.textContent = 'Apply';

  if (!result) {
    s3State.log.unshift({ request, response: "Couldn't reach the model in time — nothing was changed.", blocked: true });
    s3RenderLog();
    return;
  }

  if (result.blocked || !Array.isArray(result.composition) || result.composition.length === 0) {
    s3State.log.unshift({ request, response: result.response || 'Blocked — no valid change returned.', blocked: true });
    s3RenderLog();
    return;
  }

  s3State.composition = result.composition;
  s3State.log.unshift({ request, response: result.response || 'Applied.', blocked: false });
  input.value = '';
  s3RenderComposition();
  s3RenderLog();
});

document.getElementById('s3EditInput').addEventListener('keydown', (e) => {
  if (e.key === 'Enter') document.getElementById('s3EditBtn').click();
});

